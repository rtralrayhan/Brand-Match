import { NextResponse } from "next/server";
import { runTrustScore } from "@/lib/trustScore";
import { sampleTrust } from "@/lib/fallback";
import { hasKey } from "@/lib/you";
import type { EmailInput } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  const email = (await req.json()) as EmailInput;
  if (!email?.fromEmail || !email?.body) {
    return NextResponse.json({ error: "fromEmail and body are required" }, { status: 400 });
  }
  if (!hasKey()) return NextResponse.json(sampleTrust(email));
  try {
    return NextResponse.json(await runTrustScore(email));
  } catch (err) {
    console.error("[trust-score]", err);
    return NextResponse.json(sampleTrust(email));
  }
}
