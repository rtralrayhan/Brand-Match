"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, Logo } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { profile, trust, saved, matches, reset } = useStore();
  const risky = Object.values(trust).filter((t) => t.band === "risky").length;
  const savedBrands = Object.values(matches)
    .flatMap((m) => m?.brands ?? [])
    .filter((b, i, all) => saved.includes(b.id) && all.findIndex((x) => x.id === b.id) === i);

  const nav = [
    { href: "/matches", label: "Brand matches", short: "Matches", icon: Icon.star, on: path.startsWith("/matches") },
    { href: "/inbox", label: "Trust inbox", short: "Inbox", icon: Icon.shield, on: path.startsWith("/inbox"), badge: risky },
  ];

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col gap-6 border-r border-line bg-white p-4 md:flex">
        <div className="px-2 pt-1">
          <Logo href="/matches" />
        </div>
        <nav className="flex flex-col gap-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={n.on ? "page" : undefined}
              className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium ${n.on ? "bg-ink text-white" : "text-ink-3 hover:bg-soft"}`}
            >
              {n.icon({ size: 17 })}
              <span className="flex-1">{n.label}</span>
              {!!n.badge && (
                <span className="flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-alert px-1.5 text-[11px] font-semibold text-white">{n.badge}</span>
              )}
            </Link>
          ))}
          <Link href="/inbox/check" className="mt-2 flex h-11 items-center gap-3 rounded-xl border border-dashed border-line-2 px-3 text-sm font-medium text-ink-3 hover:bg-soft">
            {Icon.plus({ size: 16 })} Check an email
          </Link>
        </nav>

        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <span className="px-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">Saved brands</span>
          <div className="scroll-area flex flex-col gap-0.5 overflow-y-auto">
            {savedBrands.length ? (
              savedBrands.map((b) => (
                <Link key={b.id} href={`/matches/${b.id}`} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-2 hover:bg-soft">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold" style={{ background: b.logoBg, color: b.logoFg }}>
                    {b.initials}
                  </span>
                  <span className="truncate">{b.name}</span>
                </Link>
              ))
            ) : (
              <span className="px-3 text-xs leading-normal text-muted">Save a brand or swipe right to keep it here.</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-line p-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-violet-bg text-sm font-semibold text-violet">
            {profile.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-semibold">{profile.name}</span>
            <span className="truncate text-xs text-muted">{profile.niches.join(", ") || "No niche yet"}</span>
          </span>
          <Link href="/onboarding/connect" aria-label="Edit profile" className="rounded-lg p-1.5 hover:bg-soft">
            {Icon.chevron({ size: 14, color: "#6B6B74" })}
          </Link>
        </div>
        <button type="button" onClick={reset} className="-mt-3 text-left text-xs text-muted hover:text-ink px-3">
          Reset demo
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar on small screens */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-white px-4 md:hidden">
          <Logo href="/matches" />
          <nav className="flex gap-1">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className={`flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium ${n.on ? "bg-ink text-white" : "text-ink-3"}`}>
                {n.icon({ size: 15 })}
                {n.short}
              </Link>
            ))}
          </nav>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
