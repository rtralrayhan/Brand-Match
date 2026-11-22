import { NextResponse } from "next/server";
import { runBrandMatch } from "@/lib/brandMatch";
import { sampleMatch } from "@/lib/fallback";
import { hasKey } from "@/lib/you";
import type { BrandMatchInput, MatchResult } from "@/lib/types";

export const maxDuration = 60;

const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, { result: MatchResult; expiresAt: number }>();
const pending = new Map<string, Promise<MatchResult>>();

async function getMatches(input: BrandMatchInput, refresh: boolean) {
  const key = JSON.stringify(input);
  const cached = cache.get(key);
  if (!refresh && cached && cached.expiresAt > Date.now()) return { result: cached.result, cacheStatus: "HIT" };
  const inflight = pending.get(key);
  if (inflight) return { result: await inflight, cacheStatus: "SHARED" };

  const request = runBrandMatch(input);
  pending.set(key, request);
  try {
    const result = await request;
    // Only successful live runs reach this cache; failed/sample runs can be retried.
    cache.delete(key);
    cache.set(key, { result, expiresAt: Date.now() + CACHE_TTL_MS });
    if (cache.size > 50) {
      const oldest = cache.keys().next().value;
      if (oldest !== undefined) cache.delete(oldest);
    }
    return { result, cacheStatus: "MISS" };
  } finally {
    pending.delete(key);
  }
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<BrandMatchInput> & { refresh?: boolean };
  const input: BrandMatchInput = {
    links: (body.links ?? []).filter((l) => /^https?:\/\//.test(l)).slice(0, 5),
    niches: body.niches ?? [],
    window: body.window === 7 ? 7 : 30,
    country: body.country,
    followers: body.followers,
  };
  if (!hasKey()) return NextResponse.json(sampleMatch(input.window));
  try {
    const { result, cacheStatus } = await getMatches(input, body.refresh === true);
    return NextResponse.json(result, { headers: { "X-Brand-Match-Cache": cacheStatus, "Cache-Control": "private, no-store" } });
  } catch (err) {
    console.error("[brand-match]", err);
    const sample = sampleMatch(input.window);
    sample.notes.push("Live search came back empty, so this is a saved sample run.");
    return NextResponse.json(sample);
  }
}
