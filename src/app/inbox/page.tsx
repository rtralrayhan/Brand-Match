"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BAND, Icon, SamplePill, Segmented, TabBar } from "@/components/ui";
import { useStore } from "@/lib/store";
import type { Band } from "@/lib/types";

export default function Inbox() {
  const { emails, trust, checking, checkEmail } = useStore();
  const [filter, setFilter] = useState<"all" | Band>("all");

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
    <div className="flex min-h-0 flex-1 flex-col">
      <main className="scroll-area flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-[18px] pb-4 pt-[22px]">
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

        <div className="flex flex-col gap-0.5 rounded-3xl border border-line bg-white p-1.5 shadow-[0_1px_2px_rgba(24,24,27,0.04),0_8px_24px_rgba(24,24,27,0.04)]">
          {shown.map((e) => {
            const t = trust[e.id];
            const b = t ? BAND[t.band] : null;
            const why = t?.checks.filter((c) => c.tone !== "green").sort((x, y) => x.points / x.max - y.points / y.max)[0]?.finding ?? t?.checks[0]?.finding;
            return (
              <Link key={e.id} href={`/inbox/${e.id}`} className="flex items-center gap-3 rounded-[18px] p-3 hover:bg-soft">
                <div
                  className={`flex size-[46px] shrink-0 items-center justify-center rounded-[14px] ${!t ? "skeleton" : ""}`}
                  style={b ? { background: b.bg, color: b.fg } : undefined}
                >
                  {t ? <span className="text-[17px] font-bold leading-none">{t.score}</span> : null}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
                  <div className="flex justify-between gap-2">
                    <span className="truncate text-sm font-semibold">{e.fromName}</span>
                    <span className="shrink-0 text-xs text-muted">{e.time ?? "Now"}</span>
                  </div>
                  <span className="truncate text-sm text-ink-2">{e.subject}</span>
                  <span className="line-clamp-1 text-xs font-medium" style={{ color: b?.fg ?? "#6B6B74" }}>
                    {t ? `${b!.label} · ${why}` : checking[e.id] ? "Checking with You.com…" : "Tap to check"}
                  </span>
                </div>
                {Icon.arrow({ size: 18 })}
              </Link>
            );
          })}
          {!shown.length && <p className="p-4 text-center text-sm text-muted">Nothing in this filter.</p>}
        </div>

        <Link href="/inbox/check" className="flex h-12 items-center justify-center gap-2 rounded-full border border-line-2 bg-white text-sm font-semibold">
          {Icon.plus({ size: 16 })} Check an email
        </Link>

        <div
          className="flex items-start gap-2.5 rounded-[18px] border border-[#E3E8FB] px-3.5 py-3"
          style={{ background: "radial-gradient(120% 120% at 0% 0%, rgba(110,140,255,0.16) 0%, rgba(255,255,255,0) 60%), #FFFFFF" }}
        >
          <span className="mt-px">{Icon.sparkle({ color: "#2F4EB8" })}</span>
          <span className="text-[13px] leading-[1.45] text-ink-2">
            Each score checks the sender, scam reports, lawsuits and court cases, and the manager, using this week&apos;s web.
          </span>
        </div>
      </main>
      <div className="px-[18px] pb-[26px] pt-2">
        <TabBar active="inbox" />
      </div>
    </div>
  );
}
