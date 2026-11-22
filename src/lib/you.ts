import "server-only";

/**
 * Thin client for the You.com APIs.
 * Search and Extract live on ydc-index.io; Answer, Research and the
 * Inference Router live on api.you.com. All read YDC_API_KEY.
 */

const KEY = process.env.YDC_API_KEY ?? "";
const LLM_MODEL = process.env.YDC_LLM_MODEL ?? "kimi-k3";

export class YouError extends Error {
  constructor(
    public endpoint: string,
    public status: number,
    message: string,
  ) {
    super(`${endpoint} ${status}: ${message}`);
  }
}

export const hasKey = () => KEY.length > 0;

async function post<T>(
  endpoint: string,
  url: string,
  body: unknown,
  timeoutMs: number,
  bearer = false,
): Promise<T> {
  if (!hasKey()) throw new YouError(endpoint, 0, "YDC_API_KEY is not set");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(bearer ? { Authorization: `Bearer ${KEY}` } : { "X-API-Key": KEY }),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new YouError(endpoint, res.status, text.slice(0, 300));
  }
  return (await res.json()) as T;
}

export type Freshness = "day" | "week" | "month" | "year";

export interface WebResult {
  url: string;
  title: string;
  description: string;
  snippets: string[];
  pageAge?: string;
}

interface SearchResponse {
  results?: {
    web?: Array<{
      url: string;
      title?: string;
      description?: string;
      snippets?: string[];
      page_age?: string;
      contents?: { highlights?: string[] };
    }>;
    news?: Array<{ url: string; title?: string; description?: string; page_age?: string }>;
  };
}

/** Web Search API: POST https://ydc-index.io/v1/search */
export async function search(
  query: string,
  opts: { freshness?: Freshness; count?: number; country?: string; timeoutMs?: number } = {},
): Promise<WebResult[]> {
  const data = await post<SearchResponse>(
    "search",
    "https://ydc-index.io/v1/search",
    {
      query,
      count: opts.count ?? 8,
      ...(opts.freshness ? { freshness: opts.freshness } : {}),
      ...(opts.country ? { country: opts.country } : {}),
      extraction: { extraction_mode: "highlights" },
    },
    opts.timeoutMs ?? 15000,
  );
  const web = data.results?.web ?? [];
  const news = data.results?.news ?? [];
  return [
    ...web.map((r) => ({
      url: r.url,
      title: r.title ?? "",
      description: r.description ?? "",
      snippets: r.contents?.highlights ?? r.snippets ?? [],
      pageAge: r.page_age,
    })),
    ...news.map((r) => ({
      url: r.url,
      title: r.title ?? "",
      description: r.description ?? "",
      snippets: [],
      pageAge: r.page_age,
    })),
  ];
}

/** Extract API: POST https://ydc-index.io/v1/extract */
export async function extract(url: string, timeoutMs = 20000): Promise<{ url: string; title: string; markdown: string }> {
  const data = await post<{
    title?: string;
    contents?: { full_page?: { markdown?: string } };
  }>(
    "extract",
    "https://ydc-index.io/v1/extract",
    { url, full_page: { extraction_formats: ["markdown"] } },
    timeoutMs,
  );
  return { url, title: data.title ?? "", markdown: data.contents?.full_page?.markdown ?? "" };
}

export interface AnswerResult {
  answer: string;
  citations: Array<{ source: string; excerpts: string[] }>;
  results: Array<{ url: string; title: string; page_age?: string }>;
}

/** Answer API: POST https://api.you.com/v1/answer */
export async function answer(
  query: string,
  opts: { freshness?: Freshness; country?: string } = {},
): Promise<AnswerResult> {
  const data = await post<{
    answer?: string;
    citations?: Array<{ source: string; excerpts?: string[] }>;
    results?: { web?: Array<{ url: string; title?: string; page_age?: string }> };
  }>(
    "answer",
    "https://api.you.com/v1/answer",
    {
      query,
      ...(opts.freshness ? { freshness: opts.freshness } : {}),
      ...(opts.country ? { country: opts.country } : {}),
    },
    25000,
  );
  return {
    answer: data.answer ?? "",
    citations: (data.citations ?? []).map((c) => ({ source: c.source, excerpts: c.excerpts ?? [] })),
    results: (data.results?.web ?? []).map((r) => ({ url: r.url, title: r.title ?? r.url, page_age: r.page_age })),
  };
}

/** Research API (lite): POST https://api.you.com/v1/research */
export async function research(input: string): Promise<{ content: string; sources: Array<{ url: string; title: string }> }> {
  const data = await post<{
    output?: { content?: string; sources?: Array<{ url: string; title?: string }> };
  }>("research", "https://api.you.com/v1/research", { input, research_effort: "lite" }, 30000);
  return {
    content: data.output?.content ?? "",
    sources: (data.output?.sources ?? []).map((s) => ({ url: s.url, title: s.title ?? s.url })),
  };
}

/**
 * Research API with structured output (standard effort, 10-30 s).
 * Returns the parsed JSON object plus the sources the agent read.
 */
export async function researchJson<T>(
  input: string,
  schema: Record<string, unknown>,
  freshness?: Freshness,
  timeoutMs = 55000,
): Promise<{ data: T; sources: Array<{ url: string; title: string }> }> {
  const res = await post<{
    output?: { content?: unknown; sources?: Array<{ url: string; title?: string }> };
  }>(
    "research-json",
    "https://api.you.com/v1/research",
    {
      input,
      research_effort: "standard",
      output_schema: schema,
      ...(freshness ? { source_control: { freshness } } : {}),
    },
    timeoutMs,
  );
  const content = res.output?.content;
  const data = (typeof content === "string" ? JSON.parse(content) : content) as T;
  return { data, sources: (res.output?.sources ?? []).map((s) => ({ url: s.url, title: s.title ?? s.url })) };
}

/**
 * The Inference Router needs purchased credits. After the first 402/403 we stop
 * calling it for the life of the server and every caller uses its fallback.
 */
let llmBlocked = false;
export const llmAvailable = () => hasKey() && !llmBlocked;

/** Inference Router (OpenAI-compatible): POST https://api.you.com/v1/chat/completions */
export async function chat(system: string, user: string, maxTokens = 1200, timeoutMs = 40000): Promise<string> {
  if (llmBlocked) throw new YouError("chat", 402, "Inference Router unavailable for this key");
  try {
    const data = await post<{ choices?: Array<{ message?: { content?: string } }> }>(
      "chat",
      "https://api.you.com/v1/chat/completions",
      {
        model: LLM_MODEL,
        max_tokens: maxTokens,
        temperature: 0.2,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      },
      timeoutMs,
      true,
    );
    return data.choices?.[0]?.message?.content ?? "";
  } catch (err) {
    if (err instanceof YouError && (err.status === 402 || err.status === 403)) {
      llmBlocked = true;
      console.warn("[chat] Inference Router unavailable for this key; using fallbacks from now on");
    }
    throw err;
  }
}

/** Ask the router for JSON and parse the first object in the reply. Returns null on any failure. */
export async function chatJson<T>(system: string, user: string, maxTokens = 1200, timeoutMs = 40000): Promise<T | null> {
  if (!llmAvailable()) return null;
  try {
    const text = await chat(`${system}\nReply with one JSON object only. No prose, no code fences.`, user, maxTokens, timeoutMs);
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start < 0 || end <= start) return null;
    return JSON.parse(text.slice(start, end + 1)) as T;
  } catch (err) {
    console.warn("[chatJson]", err instanceof Error ? err.message : err);
    return null;
  }
}

/** Run a promise and return null instead of throwing, logging the reason. */
export async function safe<T>(label: string, p: Promise<T>): Promise<T | null> {
  try {
    return await p;
  } catch (err) {
    console.warn(`[you:${label}]`, err instanceof Error ? err.message : err);
    return null;
  }
}

export function domainOf(url: string): string {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

/** example.co.uk -> example.co.uk, mail.example.com -> example.com */
export function rootDomain(host: string): string {
  const parts = host.toLowerCase().split(".").filter(Boolean);
  if (parts.length <= 2) return parts.join(".");
  const sld = parts[parts.length - 2];
  const twoLevel = ["co", "com", "org", "net", "gov", "ac", "edu"].includes(sld) && parts[parts.length - 1].length === 2;
  return parts.slice(twoLevel ? -3 : -2).join(".");
}
