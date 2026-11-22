import { NextResponse } from "next/server";
import { revoke } from "@/lib/gmail";
import { clearGmail, getGmail } from "@/lib/session";

export async function POST() {
  const tokens = await getGmail();
  if (tokens) await revoke(tokens);
  await clearGmail();
  return NextResponse.json({ ok: true });
}
