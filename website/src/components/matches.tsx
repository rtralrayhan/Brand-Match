"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon, SamplePill, Segmented, Skeleton } from "./ui";
import { useStore } from "@/lib/store";
import type { MatchResult } from "@/lib/types";

/** Loads matches for the chosen window and returns them plus loading state. */
export function useMatches() {
  const store = useStore();
  const w = store.profile.window;
  useEffect(() => {
    store.loadMatches(w);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w]);
  return { ...store, window: w, result: store.matches[w] as MatchResult | undefined };
}

export function PageHeader({ title, subtitle, mode, children }: { title: string; subtitle: React.ReactNode; mode?: MatchResult["mode"]; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="m-0 text-[30px] font-semibold tracking-[-0.025em]">{title}</h1>
          {mode && <SamplePill mode={mode} />}
        </div>
        <span className="text-[15px] text-muted">{subtitle}</span>
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}

export function ViewToggle({ view }: { view: "grid" | "swipe" }) {
  const cell = (on: boolean) => `flex h-9 items-center gap-1.5 rounded-[10px] px-3 text-[13px] font-medium ${on ? "bg-white text-ink shadow-[0_1px_3px_rgba(24,24,27,0.10)]" : "text-muted"}`;
  return (
    <div role="group" aria-label="View" className="flex gap-1 rounded-[14px] bg-chip p-1">
      <Link href="/matches" aria-current={view === "grid" ? "page" : undefined} className={cell(view === "grid")}>
        {Icon.list({ size: 15 })} Grid
      </Link>
      <Link href="/matches/swipe" aria-current={view === "swipe" ? "page" : undefined} className={cell(view === "swipe")}>
        {Icon.cards({ size: 15 })} Swipe
      </Link>
    </div>
  );
}

export function WindowToggle() {
  const { profile, setProfile } = useStore();
  return (
    <Segmented
      value={profile.window}
      onChange={(w) => setProfile({ window: w })}
      options={[
        { value: 7, label: "7 days" },
        { value: 30, label: "30 days" },
      ]}
    />
  );
}

const STEPS = ["Reading your posts with Extract", "Searching this month's web for brands", "Checking what each brand pays", "Scoring fit"];

export function MatchLoading() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => Math.min(x + 1, STEPS.length - 1)), 3500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_300px]" aria-live="polite">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <div key={k} className="flex flex-col gap-3 rounded-[22px] border border-line bg-white p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="size-11" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-3.5 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
      <div className="flex h-fit flex-col gap-2.5 rounded-[22px] border border-[#E4E1F5] bg-white p-5">
        <span className="text-sm font-semibold">Finding your matches</span>
        {STEPS.map((s, n) => (
          <span key={s} className={`flex items-center gap-2.5 text-[13px] ${n <= i ? "text-ink-2" : "text-[#A1A1AA]"}`}>
            {n < i ? Icon.tick({ size: 15, color: "#18794E" }) : n === i ? <span className="size-[15px] animate-spin rounded-full border-2 border-violet border-t-transparent" /> : <span className="size-[15px]" />}
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Notes({ notes }: { notes: string[] }) {
  if (!notes.length) return null;
  return (
    <div className="flex items-start gap-2.5 rounded-[18px] bg-warn-bg px-4 py-3 text-[13px] leading-[1.45] text-warn">
      {Icon.info({ size: 16, color: "#9A4A00" })}
      <span>{notes.join(" ")}</span>
    </div>
  );
}
