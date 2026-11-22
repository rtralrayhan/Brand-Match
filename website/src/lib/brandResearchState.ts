import type { Brand, BrandResearch, MatchResult } from "./types";

export const UNRESEARCHED: BrandResearch = {
  researchStatus: "unresearched",
  spend: null,
  spendNote: "Open this brand to check pay and current campaigns.",
  hiring: "Campaigns not checked yet",
  live: false,
  sources: [],
};

export const RESEARCH_FAILED: BrandResearch = {
  ...UNRESEARCHED,
  researchStatus: "failed",
  spendNote: "Couldn't check pay right now. Try again.",
  hiring: "Couldn't check campaigns right now",
};

/** Details update facts without replacing discovery evidence, fit, or list order. */
export function mergeBrandResearch(brand: Brand, details: BrandResearch): Brand {
  const sources = new Map([...brand.sources, ...details.sources].map((source) => [source.url, source]));
  return { ...brand, ...details, sources: [...sources.values()].slice(0, 7) };
}

export function brandResearchKey(result: Pick<MatchResult, "window" | "generatedAt">, id: string) {
  return `research:${result.window}:${result.generatedAt}:${id}`;
}

export function updateBrandResearch(
  matches: Partial<Record<7 | 30, MatchResult>>,
  result: Pick<MatchResult, "window" | "generatedAt">,
  id: string,
  details: BrandResearch,
) {
  const current = matches[result.window];
  if (!current || current.generatedAt !== result.generatedAt) return matches;
  return {
    ...matches,
    [result.window]: { ...current, brands: current.brands.map((brand) => brand.id === id ? mergeBrandResearch(brand, details) : brand) },
  };
}

export function campaignLabel(brand: Brand): string {
  if (brand.researchStatus === "unresearched") return "Not checked";
  if (brand.researchStatus === "failed") return "Check failed";
  return brand.live ? "Hiring now" : "Quiet";
}

export function payLabel(brand: Brand): string {
  if (brand.researchStatus === "unresearched") return "Open to check pay";
  if (brand.researchStatus === "failed") return "Couldn't check pay";
  return brand.spend ? `${brand.spend.text} per creator` : "No public pay data yet";
}
