import { NextResponse, type NextRequest } from "next/server";

/**
 * Onboarding and the app need an account. The session cookie is encrypted and checked
 * by the API routes; here we only need to know whether one exists to send people to sign-up.
 */
export function middleware(req: NextRequest) {
  if (req.cookies.has("vetted_session")) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/signup";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/onboarding/:path*", "/matches/:path*", "/inbox/:path*", "/settings"],
};
