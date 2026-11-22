import { NextResponse } from "next/server";
import { getGmail, getUser } from "@/lib/session";
import { gmailConfigured } from "@/lib/gmail";

export const dynamic = "force-dynamic";

export async function GET() {
  const [user, gmail] = await Promise.all([getUser(), getGmail()]);
  return NextResponse.json({
    user,
    gmail: { configured: gmailConfigured(), connected: !!gmail, email: gmail?.email ?? null },
  });
}
