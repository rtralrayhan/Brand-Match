"use client";

import Link from "next/link";
import { BrandLogo, Icon, TabBar } from "@/components/mobile/ui";
import { useStore } from "@/lib/store";
import { MatchesHeader, MatchLoading, Notes, useMatches, WindowToggle } from "@/components/mobile/matches";
import type { Brand } from "@/lib/types";
import { campaignLabel } from "@/lib/brandResearchState";
import { creatorVideos } from "@/lib/videos";
import { VideoStrip } from "@/components/videos";

function payShort(b: Brand) {
  if (b.spend) return b.spend.text;
  if (b.researchStatus === "unresearched") return "Not checked";
  if (b.researchStatus === "failed") return "Check failed";
  return "No data yet";
}

function MatchCard({ b, top }: { b: Brand; top: boolean }) {
  const videos = creatorVideos(b);
  const hasPay = !!b.spend;
  return (
    <Link
      href={`/matches/${b.id}`}
      className={`flex flex-col gap-3.5 rounded-3xl border p-4 ${top ? "border-[#E4E1F5] shadow-[0_1px_2px_rgba(24,24,27,0.04),0_8px_24px_rgba(110,86,207,0.10)]" : "border-line bg-white shadow-[0_1px_2px_rgba(24,24,27,0.04)]"}`}
      style={top ? { background: "radial-gradient(110% 80% at 100% 0%, rgba(124,92,230,0.20) 0%, rgba(110,140,255,0.10) 35%, rgba(255,255,255,0) 65%), #FFFFFF" } : undefined}
    >
      {top && <span className="self-start rounded-md border border-[#E4E1F5] bg-white px-1.5 py-[3px] text-[10px] font-semibold tracking-[0.06em] text-violet">TOP MATCH</span>}

      <div className="flex items-center gap-3">
        <BrandLogo brand={b} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-base font-semibold">{b.name}</span>
          <span className="truncate text-[13px] text-muted">{b.category}</span>
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-ok-bg px-[9px] py-[5px] text-xs font-semibold text-ok">
          {Icon.tick({ size: 13, color: "#136B43", width: 2.4 })}
          {b.fit}% fit
        </span>
      </div>

      {videos.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <VideoStrip videos={videos} wash={b.wash} />
          <span className="text-xs text-muted">
            {videos.length} creator video{videos.length === 1 ? "" : "s"} for them
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-[14px] border border-dashed border-line-2 px-3 py-2.5 text-xs text-muted">
          {Icon.play({ size: 15, color: "#6B6B74" })}
          {b.researchStatus === "unresearched" ? "Open to look for creator videos" : "No public creator videos found yet"}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-0.5 rounded-[14px] bg-soft/80 px-3 py-2.5">
          <span className={`text-[15px] ${hasPay ? "font-semibold" : "font-medium italic text-muted"}`}>{payShort(b)}</span>
          <span className="text-[11px] text-muted">Pay per creator</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-[14px] bg-soft/80 px-3 py-2.5">
          <span className="line-clamp-2 text-[13px] font-semibold leading-snug">{b.hiring}</span>
          <span className="text-[11px] text-muted">Creator hiring</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={`rounded-md px-1.5 py-[3px] text-[10px] font-semibold uppercase tracking-[0.06em] ${b.live ? "bg-ok-bg text-ok-2" : "bg-soft text-ink-4"}`}>{campaignLabel(b)}</span>
        <span className="flex items-center gap-1 text-[13px] font-semibold text-violet">
          View profile {Icon.arrow({ size: 14, color: "#5B47B8" })}
        </span>
      </div>
    </Link>
  );
}

export default function Feed() {
  const { result, matchLoading, matchError, loadMatches, window, flagged } = useMatches();
  const { profile } = useStore();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <main className="scroll-area flex min-h-0 flex-1 flex-col gap-[18px] overflow-y-auto px-[18px] pb-4 pt-[22px]">
        <MatchesHeader mode={result?.mode} subtitle={`Brand activity from the last ${window} days`} />

        <div className="flex">
          <WindowToggle />
        </div>

        {matchLoading && !result && <MatchLoading />}

        {matchError && !result && (
          <div className="flex flex-col items-start gap-3 rounded-[22px] border border-line bg-white p-4">
            <span className="text-sm">We couldn&apos;t load matches: {matchError}</span>
            <button type="button" onClick={() => loadMatches(window, true)} className="h-10 rounded-full bg-ink px-4 text-sm font-semibold text-white">
              Try again
            </button>
          </div>
        )}

        {result && (
          <>
            <Notes notes={result.notes} />
            <div className="flex flex-col gap-2.5">
              <div className="flex items-baseline justify-between">
                <span className="text-base font-semibold">Your content</span>
                <span className="text-[13px] text-muted">
                  {result.profile.postsAnalyzed ? `${result.profile.postsAnalyzed} posts` : result.profile.niche}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.profile.topics.map((t) => (
                  <span key={t} className="rounded-full bg-chip px-3 py-2 text-[13px] text-ink-3">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-baseline justify-between pt-0.5">
              <span className="text-base font-semibold">
                {result.brands.length} brands fit this {window === 7 ? "week" : "month"}
              </span>
              <button type="button" onClick={() => loadMatches(window, true)} disabled={matchLoading} className="flex items-center gap-1 text-[13px] text-muted disabled:opacity-50">
                {Icon.refresh({ size: 14 })} {matchLoading ? "Checking…" : "Checked today"}
              </button>
            </div>

            <p className="m-0 text-[13px] leading-normal text-muted">Open a brand to check pay and current campaigns.</p>

            <div className="flex flex-col gap-3.5">
              {result.brands.map((b, i) => (
                <MatchCard key={b.id} b={b} top={i === 0} />
              ))}
            </div>
          </>
        )}
      </main>
      <div className="px-[18px] pb-[26px] pt-2">
        <TabBar active="matches" badge={flagged} initial={profile.name} />
      </div>
    </div>
  );
}
