import "server-only";
import { answer, domainOf } from "./you";
import type { Brand, BrandResearch, Source, Spend } from "./types";

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

/** Check one brand only when its detail page is opened. */
export async function researchBrand(brand: Pick<Brand, "name" | "website">, window: 7 | 30): Promise<BrandResearch> {
  const a = await answer(
    `Is ${brand.name}${brand.website ? ` (${brand.website})` : ""} running influencer or creator campaigns right now, and how much does ${brand.name} pay creators per sponsored post or campaign? Give dollar figures if any are public.`,
    { freshness: window === 7 ? "month" : "year" },
  );
  if (!a.answer.trim()) throw new Error("Brand research returned an empty answer");
  const clean = a.answer.replace(/\[\[[\d,\s]+\]\]/g, "");
  const live = /\b(currently|now|ongoing|active|open|accepting|recruiting|launched)\b/i.test(clean) && !/\bno (current|active)\b/i.test(clean);
  const sources: Source[] = a.citations
    .filter((cit) => /^https?:\/\//i.test(cit.source))
    .slice(0, 4)
    .map((cit) => {
      const r = a.results.find((x) => x.url === cit.source);
      return { title: r?.title ?? domainOf(cit.source), url: cit.source, date: r?.page_age?.slice(0, 10) };
    });
  const spend = parseSpend(clean);
  return {
    researchStatus: "complete",
    spend,
    spendNote: spend
      ? `Per post or campaign, from ${sources.length} public source${sources.length === 1 ? "" : "s"}. Usage rights are usually paid on top.`
      : "No public pay data yet. Ask for their rate card before you quote.",
    live,
    hiring: live ? "Working with creators now" : "No sign of open campaigns",
    sources,
  };
}
