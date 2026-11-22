import { NextResponse } from "next/server";
import { findCreatorVideos } from "@/lib/researchBrand";
import { hasKey } from "@/lib/you";
import type { CreatorVideo } from "@/lib/types";

export const maxDuration = 30;

/** Creator videos for every brand on the matches feed, so the cards can show them before a brand is opened. */
export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const brands: unknown = body?.brands;
  if (
    (body?.window !== 7 && body?.window !== 30) || !Array.isArray(brands) || brands.length > 20 ||
    !brands.every((b) => b && typeof b.id === "string" && b.id.length <= 120 && typeof b.name === "string" && b.name.trim() && b.name.length <= 120)
  ) {
    return NextResponse.json({ error: "Provide a 7- or 30-day window and up to 20 brands" }, { status: 400 });
  }
  if (!hasKey()) return NextResponse.json({ error: "Live video search is unavailable" }, { status: 503 });
  const list = brands as { id: string; name: string }[];
  const found = await Promise.all(list.map((b) => findCreatorVideos(b.name.trim(), body.window)));
  const videos: Record<string, CreatorVideo[]> = Object.fromEntries(list.map((b, i) => [b.id, found[i]]));
  return NextResponse.json({ videos });
}
