import "server-only";
import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { EncryptJWT, jwtDecrypt } from "jose";

/**
 * Cookie-based sessions, no database.
 * - vetted_session: the signed-up user (name, email)
 * - vetted_gmail: Gmail OAuth tokens, encrypted
 * Both are encrypted JWTs (A256GCM) keyed by AUTH_SECRET.
 */

const SESSION = "vetted_session";
const GMAIL = "vetted_gmail";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface User {
  name: string;
  email: string;
}

export interface GmailTokens {
  email: string;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number; // epoch ms
}

function key(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) throw new Error("AUTH_SECRET is not set");
  // A fixed 32-byte key derived from the secret.
  return new Uint8Array(createHash("sha256").update(secret).digest());
}

async function seal(payload: Record<string, unknown>) {
  return new EncryptJWT(payload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .encrypt(key());
}

async function open<T>(token: string | undefined): Promise<T | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtDecrypt(token, key());
    return payload as T;
  } catch {
    return null;
  }
}

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
};

export async function getUser(): Promise<User | null> {
  const u = await open<User>((await cookies()).get(SESSION)?.value);
  return u?.email ? { name: u.name, email: u.email } : null;
}

export async function setUser(user: User) {
  (await cookies()).set(SESSION, await seal({ ...user }), cookieOpts);
}

export async function getGmail(): Promise<GmailTokens | null> {
  const g = await open<GmailTokens>((await cookies()).get(GMAIL)?.value);
  return g?.accessToken ? g : null;
}

export async function setGmail(tokens: GmailTokens) {
  (await cookies()).set(GMAIL, await seal({ ...tokens }), cookieOpts);
}

export async function clearGmail() {
  (await cookies()).delete(GMAIL);
}

export async function clearAll() {
  const c = await cookies();
  c.delete(SESSION);
  c.delete(GMAIL);
}
