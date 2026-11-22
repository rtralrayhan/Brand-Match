import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { authUrl, gmailConfigured, originOf } from "@/lib/gmail";

const STATE_COOKIE = "vetted_oauth_state";

/** Starts Google sign-in for read-only Gmail access. ?return=/path sends the user back there after. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const back = url.searchParams.get("return");
  const returnTo = back && back.startsWith("/") && !back.startsWith("//") ? back : "/inbox";

  if (!gmailConfigured()) {
    return NextResponse.redirect(`${originOf(req)}${returnTo}?gmail=not_configured`);
  }

  const state = randomBytes(16).toString("hex");
  const res = NextResponse.redirect(authUrl(req, state));
  res.cookies.set(STATE_COOKIE, JSON.stringify({ state, returnTo }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
