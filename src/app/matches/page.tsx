"use client";

import Link from "next/link";
import { BrandLogo, Icon, TabBar } from "@/components/ui";
import { MatchesHeader, MatchLoading, Notes, useMatches, WindowToggle } from "@/components/matches";
import type { Brand } from "@/lib/types";

function BrandLines({ b }: { b: Brand }) {
  return (
    <div className="flex flex-col gap-1.5 text-[13px]">
      <span className={`flex items-center gap-2 ${b.spend ? "text-ink-3" : "italic text-muted"}`}>
        {Icon.dollar({ size: 15, color: "#52525B" })}
        {b.spend ? `${b.spend.text} per creator` : "No public pay data yet"}
      </span>
      <span className="flex items-center gap-2 text-ink-3">
        {Icon.people({ size: 15, color: "#52525B" })}
        {b.hiring}
      </span>
      <span className="flex items-center gap-2 font-medium text-ok-2">
        {Icon.check({ size: 15, color: "#18794E" })}
        Matches your content · {b.fit}%
      </span>
    </div>
  );
}

export default function Feed() {
  const { result, matchLoading, matchError, loadMatches, window, flagged } = useMatches();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <main className="scroll-area flex min-h-0 flex-1 flex-col gap-[18px] overflow-y-auto px-[18px] pb-4 pt-[22px]">
        <MatchesHeader mode={result?.mode} subtitle={`From your last ${window} days of posts`} />

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

            <div className="flex flex-col gap-3">
              {result.brands.map((b, i) =>
                i === 0 ? (
                  <Link
                    key={b.id}
                    href={`/matches/${b.id}`}
                    className="flex flex-col gap-3 rounded-[22px] border border-[#E4E1F5] p-4 shadow-[0_1px_2px_rgba(24,24,27,0.04),0_8px_24px_rgba(110,86,207,0.08)]"
                    style={{ background: "radial-gradient(110% 80% at 100% 0%, rgba(124,92,230,0.20) 0%, rgba(110,140,255,0.10) 35%, rgba(255,255,255,0) 65%), #FFFFFF" }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-md border border-line bg-white px-1.5 py-[3px] text-[10px] font-semibold tracking-[0.06em] text-muted">TOP MATCH</span>
                      <span className="rounded-full bg-white px-3 py-1.5 text-[13px] font-medium text-violet shadow-[0_1px_3px_rgba(24,24,27,0.10)]">View</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <BrandLogo brand={b} />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-base font-semibold">{b.name}</span>
                        <span className="text-[13px] text-muted">{b.category}</span>
                      </div>
                    </div>
                    <BrandLines b={b} />
                  </Link>
                ) : (
                  <Link key={b.id} href={`/matches/${b.id}`} className="flex flex-col gap-3 rounded-[22px] border border-line bg-white p-4">
                    <div className="flex items-center gap-3">
                      <BrandLogo brand={b} />
                      <div className="flex flex-1 flex-col gap-0.5">
                        <span className="text-base font-semibold">{b.name}</span>
                        <span className="text-[13px] text-muted">{b.category}</span>
                      </div>
                      <span className="rounded-md bg-soft px-1.5 py-[3px] text-[10px] font-semibold tracking-[0.06em] text-muted">{b.live ? "HIRING" : "QUIET"}</span>
                    </div>
                    <BrandLines b={b} />
                  </Link>
                ),
              )}
            </div>
          </>
        )}
      </main>
      <div className="px-[18px] pb-[26px] pt-2">
        <TabBar active="matches" badge={flagged} />
      </div>
    </div>
  );
}
