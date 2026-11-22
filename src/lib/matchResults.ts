import type { Brand, MatchResult } from "./types";

function domain(website?: string): string {
  if (!website) return "";
  try {
    return new URL(website.startsWith("http") ? website : `https://${website}`).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

/** A live weekly result is also eligible for the month, without another weekly request. */
export function mergeCachedMatches(matches: Partial<Record<7 | 30, MatchResult>>) {
  const week = matches[7];
  const month = matches[30];
  if (week?.mode !== "live" || !month) return matches;

  if (month.mode !== "live") {
    return {
      ...matches,
      30: {
        ...week,
        window: 30 as const,
        generatedAt: month.generatedAt,
        notes: [...week.notes, "The 30-day search was unavailable. Showing your cached 7-day matches."],
      },
    };
  }

  const brands: Brand[] = [];
  for (const brand of [...month.brands, ...week.brands].sort((a, b) => b.fit - a.fit)) {
    const website = domain(brand.website);
    const existing = brands.find((b) => b.id === brand.id || (website && domain(b.website) === website));
    if (!existing) {
      brands.push({ ...brand });
      continue;
    }
    existing.website ||= brand.website;
    existing.sources = [...new Map([...existing.sources, ...brand.sources].map((source) => [source.url, source])).values()].slice(0, 7);
    if (existing.researchStatus !== "complete" && brand.researchStatus === "complete") {
      existing.spend = brand.spend;
      existing.spendNote = brand.spendNote;
      existing.hiring = brand.hiring;
      existing.live = brand.live;
      existing.researchStatus = brand.researchStatus;
    }
  }
  return { ...matches, 30: { ...month, brands: brands.slice(0, 20) } };
}
