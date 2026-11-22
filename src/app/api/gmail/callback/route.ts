import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { exchangeCode, MissingScopeError, originOf } from "@/lib/gmail";
import { getUser, setGmail, setUser } from "@/lib/session";

const STATE_COOKIE = "vetted_oauth_state";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const jar = await cookies();
  const saved = (() => {
    try {
      return JSON.parse(jar.get(STATE_COOKIE)?.value ?? "") as { state: string; returnTo: string };
    } catch {
      return null;
    }
  })();
  jar.delete(STATE_COOKIE);

  const returnTo = saved?.returnTo ?? "/inbox";
  const back = (status: string) => NextResponse.redirect(`${originOf(req)}${returnTo}?gmail=${status}`);

  if (url.searchParams.get("error")) return back("denied");
  const code = url.searchParams.get("code");
  if (!code || !saved || url.searchParams.get("state") !== saved.state) return back("failed");

  try {
    const tokens = await exchangeCode(req, code);
    await setGmail(tokens);
    // Connecting Gmail also signs you in if you skipped sign-up.
    if (!(await getUser()) && tokens.email) await setUser({ name: tokens.email.split("@")[0], email: tokens.email });
    return back("connected");
  } catch (err) {
    if (err instanceof MissingScopeError) return back("missing_scope");
    console.error("[gmail/callback]", err);
    return back("failed");
  }
}
