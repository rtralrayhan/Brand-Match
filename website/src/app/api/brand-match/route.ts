import { NextResponse } from "next/server";
import { runBrandMatch } from "@/lib/brandMatch";
import { sampleMatch } from "@/lib/fallback";
import { hasKey } from "@/lib/you";
import type { BrandMatchInput } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<BrandMatchInput>;
  const input: BrandMatchInput = {
    links: (body.links ?? []).filter((l) => /^https?:\/\//.test(l)).slice(0, 5),
    niches: body.niches ?? [],
    window: body.window === 7 ? 7 : 30,
    country: body.country,
    followers: body.followers,
  };
  if (!hasKey()) return NextResponse.json(sampleMatch(input.window));
  try {
    return NextResponse.json(await runBrandMatch(input));
  } catch (err) {
    console.error("[brand-match]", err);
    const sample = sampleMatch(input.window);
    sample.notes.push("Live search came back empty, so this is a saved sample run.");
    return NextResponse.json(sample);
  }
}
