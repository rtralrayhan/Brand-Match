import { NextResponse, type NextRequest } from "next/server";
import { UI_COOKIE, UIS, type UI } from "@/lib/ui";

/**
 * One app, two interfaces. Screens live in src/app/mobile (the phone app) and src/app/desktop
 * (the website); visitors only ever see clean URLs like /matches or /inbox/123, and this
 * middleware rewrites each request to the interface that fits the device.
 *
 * - The `ui` cookie (mobile | desktop) wins when set. Visiting /mobile/… or /desktop/… sets it
 *   and redirects to the clean URL; the "Switch to phone/desktop view" links use this.
 * - Otherwise Sec-CH-UA-Mobile, then the user agent, decide.
 * - Onboarding and the app need an account. The session cookie is encrypted and checked by the
 *   API routes; here we only need to know whether one exists to send people to sign-up.
 */

const PROTECTED = /^\/(onboarding|matches|inbox|settings)(\/|$)/;
const MOBILE_UA = /Mobi|Android|iPhone|iPod|Opera Mini|IEMobile|BlackBerry/i;

function detect(req: NextRequest): UI {
  const cookie = req.cookies.get(UI_COOKIE)?.value as UI | undefined;
  if (cookie && UIS.includes(cookie)) return cookie;
  const hint = req.headers.get("sec-ch-ua-mobile");
  if (hint === "?1") return "mobile";
  if (hint === "?0") return "desktop";
  return MOBILE_UA.test(req.headers.get("user-agent") ?? "") ? "mobile" : "desktop";
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /mobile/… and /desktop/…: remember the choice, then show the clean URL.
  const forced = UIS.find((ui) => pathname === `/${ui}` || pathname.startsWith(`/${ui}/`));
  if (forced) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(forced.length + 1) || "/";
    const res = NextResponse.redirect(url);
    res.cookies.set(UI_COOKIE, forced, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    return res;
  }

  if (PROTECTED.test(pathname) && !req.cookies.has("vetted_session")) {
    const url = req.nextUrl.clone();
    url.pathname = "/signup";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const url = req.nextUrl.clone();
  url.pathname = `/${detect(req)}${pathname === "/" ? "" : pathname}`;
  const res = NextResponse.rewrite(url);
  res.headers.set("Vary", "Cookie, Sec-CH-UA-Mobile, User-Agent");
  return res;
}

export const config = {
  // Every page; not the API, Next's own files, or anything with a file extension (public/ assets).
  matcher: ["/((?!api/|_next/|_vercel/|.*\\.[\\w]+$).*)"],
};
