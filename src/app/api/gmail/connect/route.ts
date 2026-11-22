import { startOAuth } from "@/lib/oauthStart";

/** Starts Google sign-in for read-only Gmail access. ?return=/path sends the user back there after. */
export function GET(req: Request) {
  return startOAuth(req, "gmail", "/inbox");
}
