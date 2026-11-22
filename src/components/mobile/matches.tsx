"use client";

import Link from "next/link";
import { useEffect } from "react";
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
  // Once the feed is in, look up creator videos for the cards.
  const run = store.matches[w];
  useEffect(() => {
    if (run?.mode === "live") store.loadCardVideos(w);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w, run?.generatedAt, run?.mode]);
  const flagged = Object.values(store.trust).filter((t) => t.band === "risky").length;
  return { ...store, window: w, result: store.matches[w] as MatchResult | undefined, flagged: flagged || 1 };
}

export function MatchesHeader({ subtitle, mode }: { subtitle: React.ReactNode; mode?: MatchResult["mode"] }) {
  const { restartSearch } = useStore();

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between gap-3">
        <Link href="/onboarding/connect" onClick={restartSearch} className="flex min-h-11 items-center rounded-full border border-line bg-white px-4 text-sm font-medium text-ink-3">
          Back to search
        </Link>
        {mode && <SamplePill mode={mode} />}
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="m-0 text-[26px] font-semibold tracking-[-0.025em]">Brand matches</h1>
        <span className="text-sm text-muted">{subtitle}</span>
      </div>
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

export function MatchLoading() {
  return (
    <div className="flex flex-col gap-3" aria-live="polite">
      <div className="flex items-center gap-2.5 rounded-[18px] border border-[#E4E1F5] bg-white p-3.5 text-[13px]">
        <span className="size-[15px] shrink-0 animate-spin rounded-full border-2 border-violet border-t-transparent" />
        Reading your content, finding brands, and ranking up to 20 matches…
      </div>
      {[0, 1, 2].map((k) => (
        <div key={k} className="flex flex-col gap-3 rounded-[22px] border border-line bg-white p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-11" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3.5 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function Notes({ notes }: { notes: string[] }) {
  if (!notes.length) return null;
  return (
    <div className="flex items-start gap-2.5 rounded-[18px] bg-warn-bg px-3.5 py-3 text-[13px] leading-[1.45] text-warn">
      {Icon.info({ size: 16, color: "#9A4A00" })}
      <span>{notes.join(" ")}</span>
    </div>
  );
}
