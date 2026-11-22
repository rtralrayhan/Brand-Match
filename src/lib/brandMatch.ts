import "server-only";
import { chatJson, domainOf, extract, llmAvailable, researchJson, safe, search, type WebResult } from "./you";
import { UNRESEARCHED } from "./brandResearchState";
import type { Brand, BrandMatchInput, CreatorProfile, MatchResult, Source } from "./types";

const MATCH_LIMIT = 20;

// Keep the combined profile/search/ranking flow inside the route's 60-second limit.
function timeoutUntil(deadline: number, limit: number) {
  return Math.max(1, Math.min(limit, deadline - Date.now()));
}

const PALETTE: Array<[string, string, string]> = [
  ["#2B1D14", "#F3C99B", "255,140,60"],
  ["#E2F2E7", "#1F6B3A", "60,180,110"],
  ["#FCE9DC", "#9A3D12", "235,100,70"],
  ["#E8EEFD", "#2F4EB8", "90,120,255"],
  ["#F1E8FD", "#6A2AAE", "150,90,230"],
  ["#FFF4D6", "#8A5A00", "240,180,40"],
];

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

function initials(name: string) {
  const words = name.replace(/[^A-Za-z0-9 &]/g, "").split(/\s+/).filter((w) => w && w !== "&");
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return (words[0] ?? "?").slice(0, 2).replace(/^./, (c) => c.toUpperCase());
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** Step 1-2: read the creator's posts and summarise niche, topics and audience. */
async function buildProfile(input: BrandMatchInput, deadline: number): Promise<CreatorProfile> {
  const pages = (await Promise.all(input.links.slice(0, 5).map((u) => safe("extract", extract(u, timeoutUntil(deadline, 8000)))))).filter(
    (p): p is NonNullable<typeof p> => !!p && p.markdown.length > 40,
  );
  // Without a model: niche from the picked chips, topics from the post titles Extract read.
  const titleTopics = pages
    .map((p) => p.title.replace(/\s*[|\-–—]\s*(YouTube|TikTok|Instagram|Substack|Medium).*$/i, "").trim())
    .filter((t) => t.length > 3 && t.length < 60);
  const fallback: CreatorProfile = {
    niche: input.niches.join(", ").toLowerCase().replace(/^./, (c) => c.toUpperCase()) || "Lifestyle",
    topics: [...titleTopics, ...input.niches].slice(0, 4).length ? [...titleTopics, ...input.niches].slice(0, 4) : ["Lifestyle"],
    audience: input.followers ?? "Creator audience",
    postsAnalyzed: pages.length,
  };
  if (!pages.length && !input.niches.length) return fallback;

  const text = pages.map((p) => `## ${p.title}\n${p.markdown.slice(0, 1800)}`).join("\n\n");
  const llm = await chatJson<{ niche: string; topics: string[]; audience: string }>(
    "You profile content creators for brand matching. Be concrete: 'cast-iron weeknight cooking' beats 'food'.",
    `Creator-picked niches: ${input.niches.join(", ") || "none"}\nFollowers: ${input.followers ?? "unknown"}\n\nRecent posts:\n${text || "(no posts could be read)"}\n\nReturn {"niche": "2-4 word niche", "topics": ["3-4 short topics from the posts"], "audience": "who watches, under 10 words"}`,
    400,
    timeoutUntil(deadline, 8000),
  );
  if (!llm?.niche || !Array.isArray(llm.topics) || typeof llm.audience !== "string") return fallback;
  return { niche: llm.niche, topics: llm.topics.slice(0, 4), audience: llm.audience, postsAnalyzed: pages.length };
}

interface Candidate {
  name: string;
  category: string;
  website: string | null;
  fit: number;
  reason: string;
  evidence: Source[];
}

const BRAND_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["brands"],
  properties: {
    brands: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "category", "website", "fit", "reason", "evidence_urls"],
        properties: {
          name: { type: "string" },
          category: { type: "string" },
          website: { type: ["string", "null"] },
          fit: { type: "integer" },
          reason: { type: "string" },
          evidence_urls: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
};

/** Alternative for keys without Inference Router access. */
async function findBrandsWithResearch(profile: CreatorProfile, input: BrandMatchInput, deadline: number): Promise<Candidate[]> {
  const period = input.window === 7 ? "week" : "month";
  const r = await researchJson<{
    brands: Array<{ name: string; category: string; website: string | null; fit: number; reason: string; evidence_urls: string[] }>;
  }>(
    `Find up to ${MATCH_LIMIT} distinct real consumer brands (not agencies, platforms, marketplaces or media sites) that sponsored, paid or recruited ${profile.niche} content creators in the last ${period}${
      input.country ? `, prioritising brands active in ${input.country}` : ""
    }. The creator posts about: ${profile.topics.join(", ")}. Cover relevant product categories for variety. Return fewer brands if evidence is insufficient; never invent brands to fill the list. For each brand give its name, a 2-3 word category, its website domain, a fit score 0-100 for this creator, one sentence on why it fits this creator that cites what the brand did with creators, and supporting evidence URLs.`,
    BRAND_SCHEMA,
    period,
    timeoutUntil(deadline, 45000),
  );
  const titles = new Map(r.sources.map((s) => [s.url, s.title]));
  return (Array.isArray(r.data?.brands) ? r.data.brands : [])
    .filter((b) => b?.name)
    .map((b) => ({
      name: b.name,
      category: b.category,
      website: b.website,
      fit: b.fit,
      reason: b.reason,
      evidence: (Array.isArray(b.evidence_urls) ? b.evidence_urls : [])
        .filter((url) => typeof url === "string" && /^https?:\/\//i.test(url))
        .map((url) => ({ url, title: titles.get(url) ?? domainOf(url) })),
    }));
}

/** Three discovery lanes feed one shared extraction and ranking call. */
async function findBrandsWithSearch(profile: CreatorProfile, input: BrandMatchInput, deadline: number): Promise<Candidate[]> {
  const freshness = input.window === 7 ? "week" : "month";
  const n = profile.niche;
  const topics = profile.topics.slice(0, 2).join(" ") || n;
  const queries = [
    `${n} "sponsored by"`,
    `${n} brand creator program apply`,
    `${topics} products brands paid creator partnerships`,
  ];
  const batches = await Promise.all(queries.map((q) => safe("search", search(q, {
    freshness, count: 20, country: input.country, timeoutMs: timeoutUntil(deadline, 10000),
  }))));
  const seen = new Set<string>();
  const results: WebResult[] = [];
  for (const r of batches.flatMap((batch) => batch?.slice(0, 20) ?? [])) {
    if (/^https?:\/\//i.test(r.url) && !seen.has(r.url)) {
      seen.add(r.url);
      results.push(r);
    }
  }
  if (!results.length) return [];

  const listing = results
    .map((r, i) => `[${i}] ${r.title}\n${r.url}\n${(r.snippets[0] ?? r.description).slice(0, 300)}`)
    .join("\n");
  const llm = await chatJson<{ brands: Array<Omit<Candidate, "evidence"> & { evidence: number[] }> }>(
    "You find brands that pay content creators. Only list real consumer brands (not agencies, platforms, marketplaces or media sites) that the results show sponsoring or recruiting creators.",
    `Creator niche: ${n}\nTopics: ${profile.topics.join(", ")}\nAudience: ${profile.audience}\nCountry: ${input.country ?? "unknown"}\n\nCombined web results from the last ${input.window} days:\n${listing}\n\nReturn {"brands": [{"name": string, "category": "2-3 words", "website": "domain or null", "fit": 0-100 content fit scored consistently across all results, "reason": "one sentence on why it fits this creator, citing the evidence", "evidence": [supporting result indexes]}]} with up to ${MATCH_LIMIT} distinct brands, best fit first. Cover relevant product categories for variety. Every brand needs supporting result indexes showing sponsorship or creator recruitment. Return fewer if evidence is insufficient; never invent brands to fill the list.`,
    5000,
    timeoutUntil(deadline, 20000),
  );
  return (Array.isArray(llm?.brands) ? llm.brands : [])
    .filter((b) => b?.name)
    .map((b) => ({
      ...b,
      evidence: (Array.isArray(b.evidence) ? b.evidence : [])
        .filter((idx) => Number.isInteger(idx) && idx >= 0 && idx < results.length)
        .map((idx) => results[idx])
        .filter(Boolean)
        .map((r) => ({ title: r.title || domainOf(r.url), url: r.url, date: r.pageAge?.slice(0, 10) })),
    }));
}

async function findBrands(profile: CreatorProfile, input: BrandMatchInput, deadline: number): Promise<Candidate[]> {
  if (llmAvailable()) {
    const candidates = selectCandidates(await findBrandsWithSearch(profile, input, deadline));
    // A 402/403 can disable the Router during ranking; use Research for that case too.
    if (candidates.length || llmAvailable()) return candidates;
  }
  return selectCandidates((await safe("research-brands", findBrandsWithResearch(profile, input, deadline))) ?? []);
}

/** Deduplicate before applying the cap, retaining evidence from other lanes. */
function selectCandidates(candidates: Candidate[]): Candidate[] {
  const merged: Candidate[] = [];
  const valid = candidates.filter((c) =>
    c && typeof c.name === "string" && slug(c.name) && typeof c.category === "string" &&
    typeof c.reason === "string" && Number.isFinite(c.fit) && Array.isArray(c.evidence),
  ).map((c) => ({
    ...c,
    fit: Math.round(Math.max(0, Math.min(100, c.fit))),
    website: typeof c.website === "string" ? c.website : null,
    evidence: c.evidence.filter((source) => source && typeof source.url === "string" && /^https?:\/\//i.test(source.url)),
  })).filter((c) => c.evidence.length).sort((a, b) => b.fit - a.fit);

  for (const candidate of valid) {
    const domain = candidate.website ? domainOf(candidate.website) : "";
    const duplicate = merged.find((brand) => slug(brand.name) === slug(candidate.name) ||
      (domain && brand.website && domainOf(brand.website) === domain));
    if (duplicate) {
      duplicate.evidence = [...new Map([...duplicate.evidence, ...candidate.evidence].map((source) => [source.url, source])).values()];
    } else {
      merged.push(candidate);
    }
  }
  return merged.slice(0, MATCH_LIMIT);
}

export async function runBrandMatch(input: BrandMatchInput): Promise<MatchResult> {
  const notes: string[] = [];
  const deadline = Date.now() + 50000;
  const profile = await buildProfile(input, deadline);
  if (input.links.length && profile.postsAnalyzed === 0) notes.push("Couldn't read your post links, so we matched on your picked niches.");

  const candidates = await findBrands(profile, input, deadline);
  if (!candidates.length) throw new Error("No brands found in this window");

  const brands: Brand[] = candidates.map((c) => {
    const [logoBg, logoFg, wash] = PALETTE[hash(c.name) % PALETTE.length];
    return {
      ...UNRESEARCHED,
      id: slug(c.name),
      name: c.name,
      category: c.category,
      initials: initials(c.name),
      logoBg,
      logoFg,
      wash,
      fit: c.fit,
      why: [c.reason],
      website: c.website ?? undefined,
      sources: c.evidence.slice(0, 5),
    };
  });

  return { mode: "live", window: input.window, profile, brands, notes, generatedAt: new Date().toISOString() };
}
