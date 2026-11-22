import { NextResponse } from "next/server";
import { listDealEmails } from "@/lib/gmail";
import { clearGmail, getGmail } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const tokens = await getGmail();
  if (!tokens) return NextResponse.json({ error: "Gmail is not connected." }, { status: 401 });
  try {
    const emails = await listDealEmails(tokens, 10);
    return NextResponse.json({ email: tokens.email, emails });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Couldn't read Gmail.";
    if (/expired|invalid_grant/i.test(message)) {
      await clearGmail();
      return NextResponse.json({ error: "Gmail access expired. Connect again." }, { status: 401 });
    }
    console.error("[gmail/messages]", err);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
