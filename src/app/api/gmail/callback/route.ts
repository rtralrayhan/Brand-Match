import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { exchangeCode, exchangeSignin, MissingScopeError, originOf } from "@/lib/gmail";
import { STATE_COOKIE, type OAuthState } from "@/lib/oauthStart";
import { getUser, setGmail, setUser } from "@/lib/session";

/** One redirect URI for both flows: "Continue with Google" (signin) and "Connect Gmail" (gmail). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const jar = await cookies();
  const saved = (() => {
    try {
      return JSON.parse(jar.get(STATE_COOKIE)?.value ?? "") as OAuthState;
    } catch {
      return null;
    }
  })();
  jar.delete(STATE_COOKIE);

  const mode = saved?.mode ?? "gmail";
  const signin = mode === "signin";
  const back = (status: string, path = saved?.returnTo ?? (signin ? "/signup" : "/inbox")) =>
    NextResponse.redirect(`${originOf(req)}${path}${path.includes("?") ? "&" : "?"}${signin ? "auth" : "gmail"}=${status}`);

  if (url.searchParams.get("error")) return back("denied", signin ? "/signup" : undefined);
  const code = url.searchParams.get("code");
  if (!code || !saved || url.searchParams.get("state") !== saved.state) return back("failed", signin ? "/signup" : undefined);

  try {
    if (signin) {
      await setUser(await exchangeSignin(req, code));
      return NextResponse.redirect(`${originOf(req)}${saved.returnTo}`);
    }
    const tokens = await exchangeCode(req, code);
    await setGmail(tokens);
    // Connecting Gmail also signs you in if you skipped sign-up.
    if (!(await getUser()) && tokens.email) await setUser({ name: tokens.email.split("@")[0], email: tokens.email });
    return back("connected");
  } catch (err) {
    if (err instanceof MissingScopeError) return back("missing_scope");
    console.error("[google/callback]", mode, err);
    return back("failed", signin ? "/signup" : undefined);
  }
}
