"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BAND, Icon, SamplePill, Segmented } from "@/components/ui";
import { useStore } from "@/lib/store";
import type { Band } from "@/lib/types";

export default function InboxLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { emails, trust, checking, checkEmail } = useStore();
  const [filter, setFilter] = useState<"all" | Band>("all");
  const atRoot = path === "/inbox";

  // Check every email in the inbox once, in parallel.
  useEffect(() => {
    emails.forEach((e) => {
      if (!trust[e.id]) checkEmail(e);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emails]);

  const count = (b: Band) => emails.filter((e) => trust[e.id]?.band === b).length;
  const shown = emails.filter((e) => filter === "all" || trust[e.id]?.band === filter);
  const modes = Object.values(trust).map((t) => t.mode);
  const mode = modes.length ? (modes.every((m) => m === "live") ? "live" : "sample") : undefined;

  return (
    <div className="flex min-h-[calc(100dvh-56px)] md:h-dvh">
      {/* Email list: always on desktop, only at /inbox on small screens */}
      <section className={`${atRoot ? "flex" : "hidden"} w-full shrink-0 flex-col border-r border-line bg-white md:flex md:w-[400px]`}>
        <div className="flex flex-col gap-4 border-b border-line p-5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="m-0 text-[26px] font-semibold tracking-[-0.025em]">Trust inbox</h1>
              <span className="text-sm text-muted">{emails.length} brand emails checked this week</span>
            </div>
            {mode && <SamplePill mode={mode} />}
          </div>
          <Segmented
            full
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: `All ${emails.length}` },
              { value: "risky", label: `Risky ${count("risky")}` },
              { value: "check", label: `Check ${count("check")}` },
              { value: "safe", label: `Safe ${count("safe")}` },
            ]}
          />
        </div>

        <div className="scroll-area flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
          {shown.map((e) => {
            const t = trust[e.id];
            const b = t ? BAND[t.band] : null;
            const on = path === `/inbox/${e.id}`;
            const why = t?.checks.filter((c) => c.tone !== "green").sort((x, y) => x.points / x.max - y.points / y.max)[0]?.finding ?? t?.checks[0]?.finding;
            return (
              <Link key={e.id} href={`/inbox/${e.id}`} aria-current={on ? "page" : undefined} className={`flex items-center gap-3 rounded-[16px] p-3 ${on ? "bg-soft ring-1 ring-line-2" : "hover:bg-soft"}`}>
                <div className={`flex size-[46px] shrink-0 items-center justify-center rounded-[14px] ${!t ? "skeleton" : ""}`} style={b ? { background: b.bg, color: b.fg } : undefined}>
                  {t ? <span className="text-[17px] font-bold leading-none">{t.score}</span> : null}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
                  <div className="flex justify-between gap-2">
                    <span className="truncate text-sm font-semibold">{e.fromName}</span>
                    <span className="shrink-0 text-xs text-muted">{e.time ?? "Now"}</span>
                  </div>
                  <span className="truncate text-sm text-ink-2">{e.subject}</span>
                  <span className="line-clamp-1 text-xs font-medium" style={{ color: b?.fg ?? "#6B6B74" }}>
                    {t ? `${b!.label} · ${why}` : checking[e.id] ? "Checking with You.com…" : "Click to check"}
                  </span>
                </div>
              </Link>
            );
          })}
          {!shown.length && <p className="p-4 text-center text-sm text-muted">Nothing in this filter.</p>}
        </div>

        <div className="border-t border-line p-4">
          <Link href="/inbox/check" className={`flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold ${path === "/inbox/check" ? "bg-ink text-white" : "border border-line-2 bg-white hover:bg-soft"}`}>
            {Icon.plus({ size: 16, color: path === "/inbox/check" ? "#fff" : "#18181B" })} Check an email
          </Link>
        </div>
      </section>

      {/* Detail pane */}
      <section className={`${atRoot ? "hidden md:flex" : "flex"} scroll-area min-w-0 flex-1 flex-col overflow-y-auto`}>{children}</section>
    </div>
  );
}
