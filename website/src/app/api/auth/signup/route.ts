import { NextResponse } from "next/server";
import { setUser } from "@/lib/session";

export async function POST(req: Request) {
  const { name, email } = (await req.json().catch(() => ({}))) as { name?: string; email?: string };
  const cleanEmail = (email ?? "").trim().toLowerCase();
  const cleanName = (name ?? "").trim().slice(0, 80);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!cleanName) return NextResponse.json({ error: "Enter your name." }, { status: 400 });
  await setUser({ name: cleanName, email: cleanEmail });
  return NextResponse.json({ user: { name: cleanName, email: cleanEmail } });
}
