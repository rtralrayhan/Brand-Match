import "server-only";
import { answer, chatJson, domainOf, extract, llmAvailable, researchJson, safe, search, type WebResult } from "./you";
import type { Brand, BrandMatchInput, CreatorProfile, MatchResult, Source, Spend } from "./types";

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

/** Pull "$1,500", "$2k", "$2.5K" style amounts out of text. */
function parseSpend(text: string): Spend | null {
  const nums = Array.from(text.matchAll(/\$\s?(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)\s?(k|K|thousand)?/g))
    .map((m) => parseFloat(m[1].replace(/,/g, "")) * (m[2] ? 1000 : 1))
    .filter((n) => n >= 50 && n <= 500000);
  if (!nums.length) return null;
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const fmt = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `$${Math.round(n)}`);
  return { min, max, text: min === max ? fmt(min) : `${fmt(min)} to ${fmt(max)}` };
}

/** Step 1-2: read the creator's posts and summarise niche, topics and audience. */
async function buildProfile(input: BrandMatchInput): Promise<CreatorProfile> {
  const pages = (await Promise.all(input.links.slice(0, 5).map((u) => safe("extract", extract(u))))).filter(
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
  );
  if (!llm?.niche) return fallback;
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

/** Step 3-4 (primary): one Research call finds brands paying creators in the niche, with evidence. */
async function findBrandsWithResearch(profile: CreatorProfile, input: BrandMatchInput): Promise<Candidate[]> {
  const period = input.window === 7 ? "week" : "month";
  const r = await researchJson<{
    brands: Array<{ name: string; category: string; website: string | null; fit: number; reason: string; evidence_urls: string[] }>;
  }>(
    `Find up to 6 real consumer brands (not agencies, platforms, marketplaces or media sites) that sponsored, paid or recruited ${profile.niche} content creators in the last ${period}${
      input.country ? `, prioritising brands active in ${input.country}` : ""
    }. The creator posts about: ${profile.topics.join(", ")}. For each brand give its name, a 2-3 word category, its website domain, a fit score 0-100 for this creator, one sentence on why it fits this creator that cites what the brand did with creators, and evidence URLs.`,
    BRAND_SCHEMA,
    period,
  );
  const titles = new Map(r.sources.map((s) => [s.url, s.title]));
  return (r.data?.brands ?? [])
    .filter((b) => b?.name)
    .sort((a, b) => b.fit - a.fit)
    .slice(0, 6)
    .map((b) => ({
      name: b.name,
      category: b.category,
      website: b.website,
      fit: b.fit,
      reason: b.reason,
      evidence: b.evidence_urls.slice(0, 3).map((url) => ({ url, title: titles.get(url) ?? domainOf(url) })),
    }));
}

/** Step 3-4 (backup): Search this week's/month's web, then let the model pull out brand names. */
async function findBrandsWithSearch(profile: CreatorProfile, input: BrandMatchInput): Promise<Candidate[]> {
  const freshness = input.window === 7 ? "week" : "month";
  const n = profile.niche;
  const queries = [`"${n}" "sponsored by"`, `${n} brand creator program influencer`, `${n} brand ambassador program apply`];
  const batches = await Promise.all(queries.map((q) => safe("search", search(q, { freshness, count: 10, country: input.country }))));
  const seen = new Set<string>();
  const results: WebResult[] = [];
  for (const r of batches.flat()) {
    if (r && !seen.has(r.url)) {
      seen.add(r.url);
      results.push(r);
    }
  }
  if (!results.length) return [];

  const listing = results
    .slice(0, 24)
    .map((r, i) => `[${i}] ${r.title} (${domainOf(r.url)})\n${(r.snippets[0] ?? r.description).slice(0, 300)}`)
    .join("\n");
  const llm = await chatJson<{ brands: Array<Omit<Candidate, "evidence"> & { evidence: number[] }> }>(
    "You find brands that pay content creators. Only list real consumer brands (not agencies, platforms, marketplaces or media sites) that the results show sponsoring or recruiting creators.",
    `Creator niche: ${n}\nTopics: ${profile.topics.join(", ")}\nAudience: ${profile.audience}\n\nWeb results from the last ${input.window} days:\n${listing}\n\nReturn {"brands": [{"name": string, "category": "2-3 words", "website": "domain or null", "fit": 0-100 match to this creator's topics, "reason": "one sentence on why it fits this creator, citing the evidence", "evidence": [result indexes]}]} with up to 6 brands, best fit first.`,
    1400,
  );
  return (llm?.brands ?? [])
    .filter((b) => b?.name)
    .slice(0, 6)
    .map((b) => ({
      ...b,
      evidence: (b.evidence ?? [])
        .map((idx) => results[idx])
        .filter(Boolean)
        .map((r) => ({ title: r.title || domainOf(r.url), url: r.url, date: r.pageAge?.slice(0, 10) })),
    }));
}

async function findBrands(profile: CreatorProfile, input: BrandMatchInput): Promise<Candidate[]> {
  const viaResearch = await safe("research-brands", findBrandsWithResearch(profile, input));
  if (viaResearch?.length) return viaResearch;
  return llmAvailable() ? findBrandsWithSearch(profile, input) : [];
}

/** Step 5: what the brand pays and whether it's hiring now. */
async function spendFor(c: Candidate, window: 7 | 30) {
  const a = await safe(
    "spend",
    answer(
      `Is ${c.name} running influencer or creator campaigns right now, and how much does ${c.name} pay creators per sponsored post or campaign? Give dollar figures if any are public.`,
      { freshness: window === 7 ? "month" : "year" },
    ),
  );
  if (!a) return { spend: null, live: false, hiring: "Couldn't check hiring right now", sources: [] as Source[] };
  const clean = a.answer.replace(/\[\[[\d,\s]+\]\]/g, "");
  const live = /\b(currently|now|ongoing|active|open|accepting|recruiting|launched)\b/i.test(clean) && !/\bno (current|active)\b/i.test(clean);
  const sources: Source[] = a.citations.slice(0, 4).map((cit) => {
    const r = a.results.find((x) => x.url === cit.source);
    return { title: r?.title ?? domainOf(cit.source), url: cit.source, date: r?.page_age?.slice(0, 10) };
  });
  return {
    spend: parseSpend(clean),
    live,
    hiring: live ? "Working with creators now" : "No sign of open campaigns",
    sources,
  };
}

export async function runBrandMatch(input: BrandMatchInput): Promise<MatchResult> {
  const notes: string[] = [];
  const profile = await buildProfile(input);
  if (input.links.length && profile.postsAnalyzed === 0) notes.push("Couldn't read your post links, so we matched on your picked niches.");

  const candidates = await findBrands(profile, input);
  if (!candidates.length) throw new Error("No brands found in this window");

  const spends = await Promise.all(candidates.slice(0, 5).map((c) => spendFor(c, input.window)));

  const brands: Brand[] = candidates.slice(0, 5).map((c, i) => {
    const s = spends[i];
    const [logoBg, logoFg, wash] = PALETTE[hash(c.name) % PALETTE.length];
    const evidence = c.evidence;
    const fit = Math.round(0.7 * Math.max(0, Math.min(100, c.fit || 60)) + 0.2 * (s.live ? 100 : 55) + 0.1 * (s.spend ? 100 : 60));
    return {
      id: slug(c.name),
      name: c.name,
      category: c.category,
      initials: initials(c.name),
      logoBg,
      logoFg,
      wash,
      fit,
      spend: s.spend,
      spendNote: s.spend
        ? `Per post or campaign, from ${s.sources.length} public source${s.sources.length === 1 ? "" : "s"}. Usage rights are usually paid on top.`
        : "No public pay data yet. Ask for their rate card before you quote.",
      hiring: s.hiring,
      live: s.live,
      why: [c.reason, s.live ? "Public posts show them working with creators now." : "They've worked with creators, but nothing open this month."],
      website: c.website ?? undefined,
      sources: [...evidence, ...s.sources].slice(0, 6),
    };
  });
  brands.sort((a, b) => b.fit - a.fit);

  return { mode: "live", window: input.window, profile, brands, notes, generatedAt: new Date().toISOString() };
}
