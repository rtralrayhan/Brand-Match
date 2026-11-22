import { NextResponse } from "next/server";
import { researchBrand } from "@/lib/researchBrand";
import { hasKey } from "@/lib/you";

export const maxDuration = 30;

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (
    !body || typeof body.name !== "string" || !body.name.trim() || body.name.length > 120 ||
    (body.window !== 7 && body.window !== 30) ||
    (body.website !== undefined && (typeof body.website !== "string" || body.website.length > 255))
  ) {
    return NextResponse.json({ error: "Provide a brand name and a 7- or 30-day window" }, { status: 400 });
  }
  if (!hasKey()) return NextResponse.json({ error: "Live brand research is unavailable" }, { status: 503 });
  try {
    return NextResponse.json(await researchBrand({ name: body.name.trim(), website: body.website }, body.window));
  } catch (err) {
    console.error("[brand-research]", err);
    return NextResponse.json({ error: "Couldn't check this brand right now. Try again." }, { status: 502 });
  }
}
