"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { connectGmailHref, GmailStatusNote } from "@/components/gmail";
import { Icon, TabBar } from "@/components/ui";
import { useStore } from "@/lib/store";

const NICHES = ["Food", "Home and kitchen", "Fitness", "Beauty", "Parenting", "Travel", "Tech", "Fashion", "Finance", "Gaming"];
const COUNTRIES = ["United States", "Canada", "United Kingdom", "India", "Bangladesh"];
const field = "h-[46px] rounded-[14px] border border-line-2 bg-field px-3.5 text-[15px] text-ink outline-none focus:border-ink";
const card = "flex flex-col gap-3.5 rounded-[22px] border border-line bg-white p-4";
const label = "flex flex-col gap-1.5 text-[13px] font-medium text-ink-3";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Settings() {
  const { profile, setProfile, account, signup, signOut, restartSearch, disconnectGmail } = useStore();
  const router = useRouter();
  const gmail = account?.gmail;

  const [name, setName] = useState(account?.user?.name ?? profile.name);
  const [email, setEmail] = useState(account?.user?.email ?? profile.email);

  // After a full page load the account arrives a moment later: fill the fields once it does.
  const user = account?.user;
  useEffect(() => {
    if (!user) return;
    setName((n) => n || user.name);
    setEmail((e) => e || user.email);
  }, [user]);
  const [niches, setNiches] = useState(profile.niches);
  const [country, setCountry] = useState(profile.country);
  const [city, setCity] = useState(profile.city);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const savedName = account?.user?.name ?? profile.name;
  const savedEmail = account?.user?.email ?? profile.email;
  const accountChanged = name.trim() !== savedName || email.trim().toLowerCase() !== savedEmail;
  const matchChanged = niches.join("|") !== profile.niches.join("|") || country !== profile.country || city !== profile.city;
  const dirty = accountChanged || matchChanged;
  const valid = name.trim().length > 0 && EMAIL.test(email.trim()) && niches.length > 0;

  const toggle = (n: string) =>
    setNiches((p) => (p.includes(n) ? p.filter((x) => x !== n) : p.length < 3 ? [...p, n] : p));

  const save = async () => {
    if (!dirty || !valid || saving) return;
    setSaving(true);
    setStatus(null);
    if (accountChanged) {
      const err = await signup(name.trim(), email.trim());
      if (err) {
        setSaving(false);
        return setStatus({ ok: false, text: err });
      }
    }
    if (matchChanged) {
      setProfile({ niches, country, city });
      // New niches or location mean new brand matches.
      restartSearch();
    }
    setSaving(false);
    setStatus({ ok: true, text: matchChanged ? "Saved. Your brand matches will refresh." : "Saved." });
  };

  const logOut = async () => {
    setLeaving(true);
    await signOut();
    router.replace("/");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <main className="scroll-area flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-[18px] pb-4 pt-[22px]">
        <div className="flex items-center gap-3.5">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-ink text-[22px] font-semibold text-white">
            {(savedName || "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <h1 className="m-0 truncate text-[24px] font-semibold tracking-[-0.025em]">{savedName || "Your profile"}</h1>
            <span className="truncate text-sm text-muted">{savedEmail}</span>
          </div>
        </div>

        <GmailStatusNote />

        <section className={card} aria-labelledby="account-h">
          <h2 id="account-h" className="m-0 text-[15px] font-semibold">Account</h2>
          <label className={label}>
            Name
            <input className={field} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className={label}>
            Email
            <input type="email" autoComplete="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
        </section>

        <section className={card} aria-labelledby="creator-h">
          <div className="flex items-baseline justify-between">
            <h2 id="creator-h" className="m-0 text-[15px] font-semibold">What you make</h2>
            <span className="text-xs text-muted">Up to 3</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {NICHES.map((n) => {
              const on = niches.includes(n);
              return (
                <button
                  key={n}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(n)}
                  className={`h-9 rounded-full border px-3.5 text-[13px] font-medium ${on ? "border-ink bg-ink text-white" : "border-line-2 bg-white text-ink-3"}`}
                >
                  {n}
                </button>
              );
            })}
          </div>
          {!niches.length && <span className="text-xs text-bad">Pick at least one.</span>}
          <div className="grid grid-cols-2 gap-2.5">
            <label className={label}>
              Country
              <select className={`${field} px-3`} value={country} onChange={(e) => setCountry(e.target.value)}>
                {COUNTRIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className={label}>
              City
              <input className={field} placeholder="e.g. Brooklyn, NY" value={city} onChange={(e) => setCity(e.target.value)} />
            </label>
          </div>
          <Link href="/onboarding/connect" className="flex items-center justify-between rounded-[14px] bg-soft px-3.5 py-3 text-sm">
            <span className="flex flex-col gap-0.5">
              <span className="font-medium">Your videos</span>
              <span className="text-xs text-muted">{profile.links.length ? `${profile.links.length} link${profile.links.length === 1 ? "" : "s"} added` : "None added yet"}</span>
            </span>
            {Icon.chevron({ size: 16 })}
          </Link>
        </section>

        <section className={card} aria-labelledby="gmail-h">
          <h2 id="gmail-h" className="m-0 text-[15px] font-semibold">Connected inbox</h2>
          <div className="flex items-center gap-3">
            {Icon.mail({ size: 20, color: "#3F3F46" })}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-sm font-medium">Gmail</span>
              <span className="truncate text-xs text-muted">{gmail?.connected ? gmail.email : "Not connected"}</span>
            </div>
            {gmail?.connected ? (
              <button type="button" onClick={disconnectGmail} className="h-9 shrink-0 rounded-full border border-line-2 px-3.5 text-[13px] font-semibold text-ink-3">
                Disconnect
              </button>
            ) : (
              // A plain link: the browser must leave the app for Google's sign-in page.
              <a href={connectGmailHref("/settings")} className="flex h-9 shrink-0 items-center rounded-full bg-ink px-3.5 text-[13px] font-semibold text-white">
                Connect
              </a>
            )}
          </div>
        </section>

        {status && (
          <span role="status" className={`px-1 text-[13px] ${status.ok ? "text-ok-2" : "text-bad"}`}>
            {status.text}
          </span>
        )}

        <button
          type="button"
          onClick={save}
          disabled={!dirty || !valid || saving}
          className="flex h-[50px] shrink-0 items-center justify-center rounded-full bg-ink text-[15px] font-semibold text-white disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>

        <button
          type="button"
          onClick={logOut}
          disabled={leaving}
          className="flex h-[50px] shrink-0 items-center justify-center rounded-full border border-line-2 bg-white text-[15px] font-semibold text-bad disabled:opacity-50"
        >
          {leaving ? "Logging out…" : "Log out"}
        </button>

        <div className="flex justify-center gap-4 pb-1 text-xs text-muted">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </main>
      <div className="px-[18px] pb-[26px] pt-2">
        <TabBar active="profile" initial={savedName} />
      </div>
    </div>
  );
}
