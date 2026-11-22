import { NextResponse } from "next/server";
import { clearAll, getGmail } from "@/lib/session";
import { revoke } from "@/lib/gmail";

export async function POST() {
  const gmail = await getGmail();
  if (gmail) await revoke(gmail);
  await clearAll();
  return NextResponse.json({ ok: true });
}
