import "server-only";
import { setGmail, type GmailTokens } from "./session";
import type { EmailInput } from "./types";

/**
 * Gmail read-only access through Google OAuth 2.0 (no SDK, plain fetch).
 * Scope: gmail.readonly. We only read messages that look like brand deals.
 */

export const GMAIL_SCOPES = ["openid", "email", "https://www.googleapis.com/auth/gmail.readonly"];

export class MissingScopeError extends Error {
  constructor() {
    super("Gmail read access wasn't granted. Connect again and tick “Read your email messages and settings”.");
  }
}

export const gmailConfigured =() => !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

export function originOf(req: Request) {
  const h = req.headers;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export const redirectUri = (req: Request) => `${originOf(req)}/api/gmail/callback`;

export function authUrl(req: Request, state: string) {
  const p = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri(req),
    response_type: "code",
    scope: GMAIL_SCOPES.join(" "),
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${p}`;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  scope?: string;
  refresh_token?: string;
  id_token?: string;
  error?: string;
  error_description?: string;
}

async function tokenRequest(body: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      ...body,
    }),
    cache: "no-store",
  });
  const data = (await res.json()) as TokenResponse;
  if (!res.ok || data.error) throw new Error(`Google token error: ${data.error_description ?? data.error ?? res.status}`);
  return data;
}

export async function exchangeCode(req: Request, code: string): Promise<GmailTokens> {
  const t = await tokenRequest({ code, grant_type: "authorization_code", redirect_uri: redirectUri(req) });
  // Google lets people untick individual permissions; without this one we can't read mail.
  if (t.scope && !t.scope.split(" ").includes("https://www.googleapis.com/auth/gmail.readonly")) {
    throw new MissingScopeError();
  }
  // The id_token is a JWT straight from Google's token endpoint; read the email claim from it.
  const claims = t.id_token ? JSON.parse(Buffer.from(t.id_token.split(".")[1], "base64url").toString()) : {};
  return {
    email: claims.email ?? "",
    accessToken: t.access_token,
    refreshToken: t.refresh_token ?? null,
    expiresAt: Date.now() + (t.expires_in - 60) * 1000,
  };
}

/** Returns a valid access token, refreshing (and re-saving the cookie) when it has expired. */
async function freshToken(tokens: GmailTokens): Promise<string> {
  if (Date.now() < tokens.expiresAt) return tokens.accessToken;
  if (!tokens.refreshToken) throw new Error("Gmail session expired. Connect again.");
  const t = await tokenRequest({ grant_type: "refresh_token", refresh_token: tokens.refreshToken });
  await setGmail({ ...tokens, accessToken: t.access_token, expiresAt: Date.now() + (t.expires_in - 60) * 1000 });
  return t.access_token;
}

export async function revoke(tokens: GmailTokens) {
  await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(tokens.refreshToken ?? tokens.accessToken)}`, {
    method: "POST",
  }).catch(() => {});
}

/* ---------- Reading messages ---------- */

// Gmail search: brand-deal language in the last 30 days, not sent by you.
// Skips Promotions/Social/Forums tabs and bulk mail (anything with an unsubscribe line):
// real offers are written to you, newsletters aren't.
const DEAL_QUERY =
  'newer_than:30d -from:me -in:chats -category:promotions -category:social -category:forums -unsubscribe {collab collaboration sponsorship sponsored "paid partnership" partnership ambassador "brand deal" influencer "creator program" "media kit" "rate card" UGC "paid collab"}';

interface GmailPart {
  mimeType?: string;
  body?: { data?: string; size?: number };
  parts?: GmailPart[];
  headers?: Array<{ name: string; value: string }>;
}

interface GmailMessage {
  id: string;
  internalDate?: string;
  snippet?: string;
  payload?: GmailPart;
}

const decode = (data?: string) => (data ? Buffer.from(data, "base64url").toString("utf8") : "");

function findPart(part: GmailPart | undefined, mime: string): string {
  if (!part) return "";
  if (part.mimeType === mime && part.body?.data) return decode(part.body.data);
  for (const p of part.parts ?? []) {
    const found = findPart(p, mime);
    if (found) return found;
  }
  return "";
}

function htmlToText(html: string) {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, "$2 ($1)")
    .replace(/<br\s*\/?>|<\/(p|div|tr|li|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseFrom(from: string): { name: string; email: string } {
  const m = from.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  if (m) return { name: m[1].trim() || m[2], email: m[2].trim().toLowerCase() };
  return { name: from.trim(), email: from.trim().toLowerCase() };
}

function timeLabel(ms: number) {
  const d = new Date(ms);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (now.getTime() - ms < 6 * 864e5) return d.toLocaleDateString("en-US", { weekday: "short" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

async function gmailGet<T>(token: string, path: string): Promise<T> {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (res.status === 401) throw new Error("Gmail session expired. Connect again.");
  if (res.status === 403) {
    const body = await res.text();
    if (/insufficient.*scope|ACCESS_TOKEN_SCOPE_INSUFFICIENT/i.test(body)) throw new MissingScopeError();
    throw new Error(`Gmail refused access (403): ${body.match(/"message":\s*"([^"]+)"/)?.[1] ?? "unknown reason"}`);
  }
  if (!res.ok) throw new Error(`Gmail API ${res.status}`);
  return (await res.json()) as T;
}

/** The most recent brand-deal-looking emails, as Trust Score inputs. */
export async function listDealEmails(tokens: GmailTokens, max = 10): Promise<EmailInput[]> {
  const token = await freshToken(tokens);
  const list = await gmailGet<{ messages?: Array<{ id: string }> }>(
    token,
    `messages?maxResults=${max}&q=${encodeURIComponent(DEAL_QUERY)}`,
  );
  const ids = (list.messages ?? []).map((m) => m.id);
  const msgs = await Promise.all(ids.map((id) => gmailGet<GmailMessage>(token, `messages/${id}?format=full`).catch(() => null)));

  return msgs
    .filter((m): m is GmailMessage => !!m?.payload)
    .map((m) => {
      const header = (n: string) => m.payload?.headers?.find((h) => h.name.toLowerCase() === n)?.value ?? "";
      const from = parseFrom(header("from"));
      const text = findPart(m.payload, "text/plain") || htmlToText(findPart(m.payload, "text/html")) || m.snippet || "";
      const ms = Number(m.internalDate ?? Date.now());
      return {
        id: `gmail-${m.id}`,
        fromName: from.name,
        fromEmail: from.email,
        subject: header("subject") || "(no subject)",
        body: text.slice(0, 5000),
        time: timeLabel(ms),
      };
    });
}
