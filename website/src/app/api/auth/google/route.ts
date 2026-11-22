import { startOAuth } from "@/lib/oauthStart";

/** "Continue with Google": name and email only. ?return=/path is where to land after. */
export function GET(req: Request) {
  return startOAuth(req, "signin", "/onboarding/connect");
}
