import "server-only";
import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { authUrl, gmailConfigured, originOf, type OAuthMode } from "./gmail";

export const STATE_COOKIE = "vetted_oauth_state";

export interface OAuthState {
  state: string;
  returnTo: string;
  mode: OAuthMode;
}

/** Only same-site paths, so the callback can't be used as an open redirect. */
export const safePath = (p: string | null, fallback: string) => (p && p.startsWith("/") && !p.startsWith("//") ? p : fallback);

/** Sends the browser to Google, remembering where to come back to. */
export function startOAuth(req: Request, mode: OAuthMode, fallback: string) {
  const returnTo = safePath(new URL(req.url).searchParams.get("return"), fallback);
  const param = mode === "signin" ? "auth" : "gmail";

  if (!gmailConfigured()) return NextResponse.redirect(`${originOf(req)}${returnTo}?${param}=not_configured`);

  const state = randomBytes(16).toString("hex");
  const res = NextResponse.redirect(authUrl(req, state, mode));
  res.cookies.set(STATE_COOKIE, JSON.stringify({ state, returnTo, mode } satisfies OAuthState), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
