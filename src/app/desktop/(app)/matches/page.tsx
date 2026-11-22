"use client";

import Link from "next/link";
import { BrandLogo, Icon } from "@/components/desktop/ui";
import { MatchLoading, Notes, PageHeader, useMatches, WindowToggle } from "@/components/desktop/matches";
import { CardVideos } from "@/components/videos";
import { campaignLabel, payLabel } from "@/lib/brandResearchState";
import type { Brand } from "@/lib/types";

function BrandLines({ b }: { b: Brand }) {
  return (
    <div className="flex flex-col gap-1.5 text-[13px]">
      <span className={`flex items-center gap-2 ${b.spend ? "text-ink-3" : "italic text-muted"}`}>
        {Icon.dollar({ size: 15, color: "#52525B" })}
        {payLabel(b)}
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
  const { result, matchLoading, matchError, loadMatches, window, saved, toggleSave, restartSearch } = useMatches();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 lg:px-10">
      <PageHeader title="Brand matches" subtitle={`Brand activity from the last ${window} days`} mode={result?.mode}>
        <WindowToggle />
        <Link href="/onboarding/connect" onClick={restartSearch} className="flex h-11 items-center gap-1.5 rounded-full border border-line-2 bg-white px-4 text-sm font-medium text-ink-3 hover:bg-soft">
          {Icon.refresh({ size: 14 })} New search
        </Link>
      </PageHeader>

      {matchLoading && !result && <MatchLoading />}

      {matchError && !result && (
        <div className="flex items-center justify-between gap-3 rounded-[22px] border border-line bg-white p-5">
          <span className="text-sm">We couldn&apos;t load matches: {matchError}</span>
          <button type="button" onClick={() => loadMatches(window, true)} className="h-10 rounded-full bg-ink px-4 text-sm font-semibold text-white">
            Try again
          </button>
        </div>
      )}

      {result && (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_300px]">
          <div className="flex flex-col gap-4">
            <Notes notes={result.notes} />
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-semibold">
                {result.brands.length} brands fit this {window === 7 ? "week" : "month"}
              </span>
              <button type="button" onClick={() => loadMatches(window, true)} disabled={matchLoading} className="flex items-center gap-1.5 text-[13px] text-muted hover:text-ink disabled:opacity-50">
                {Icon.refresh({ size: 14 })} {matchLoading ? "Checking…" : "Checked today · refresh"}
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {result.brands.map((b, i) => {
                const top = i === 0;
                const isSaved = saved.includes(b.id);
                return (
                  <div
                    key={b.id}
                    className={`group relative flex flex-col gap-4 rounded-[22px] border p-5 transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(24,24,27,0.08)] ${
                      top ? "border-[#E4E1F5] sm:col-span-2 xl:col-span-1" : "border-line bg-white"
                    }`}
                    style={top ? { background: "radial-gradient(110% 80% at 100% 0%, rgba(124,92,230,0.20) 0%, rgba(110,140,255,0.10) 35%, rgba(255,255,255,0) 65%), #FFFFFF" } : undefined}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`rounded-md px-1.5 py-[3px] text-[10px] font-semibold tracking-[0.06em] ${top ? "border border-line bg-white text-muted" : b.live ? "bg-ok-bg text-ok-2" : "bg-soft text-muted"}`}>
                        {top ? "TOP MATCH" : campaignLabel(b).toUpperCase()}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleSave(b.id)}
                        aria-pressed={isSaved}
                        aria-label={isSaved ? `Unsave ${b.name}` : `Save ${b.name}`}
                        className={`relative z-10 flex size-8 items-center justify-center rounded-full ${isSaved ? "bg-ok-bg" : "bg-white shadow-[0_1px_3px_rgba(24,24,27,0.10)] hover:bg-soft"}`}
                      >
                        {Icon.heart({ size: 15, color: isSaved ? "#136B43" : "#52525B" })}
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <BrandLogo brand={b} />
                      <div className="flex flex-col gap-0.5">
                        <Link href={`/matches/${b.id}`} className="text-base font-semibold after:absolute after:inset-0">
                          {b.name}
                        </Link>
                        <span className="text-[13px] text-muted">{b.category}</span>
                      </div>
                    </div>
                    <CardVideos brand={b} window={window} />
                    <BrandLines b={b} />
                    {b.why[0] && <p className="m-0 line-clamp-2 text-[13px] leading-[1.45] text-ink-4">{b.why[0]}</p>}
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="flex flex-col gap-4 lg:sticky lg:top-8">
            <div className="flex flex-col gap-3 rounded-[22px] border border-line bg-white p-5">
              <div className="flex items-baseline justify-between">
                <span className="text-[15px] font-semibold">Your content</span>
                <span className="text-xs text-muted">{result.profile.postsAnalyzed ? `${result.profile.postsAnalyzed} videos read` : "From your niches"}</span>
              </div>
              <span className="text-sm text-ink-2">{result.profile.niche}</span>
              <div className="flex flex-wrap gap-2">
                {result.profile.topics.map((t) => (
                  <span key={t} className="rounded-full bg-chip px-3 py-1.5 text-[13px] text-ink-3">
                    {t}
                  </span>
                ))}
              </div>
              <span className="text-xs text-muted">Audience: {result.profile.audience}</span>
              <Link href="/onboarding/connect" className="text-[13px] font-medium text-violet hover:underline">
                Add video links to sharpen matches
              </Link>
            </div>
            <div
              className="flex items-start gap-2.5 rounded-[18px] border border-[#D9EDE2] px-4 py-3.5"
              style={{ background: "radial-gradient(120% 120% at 0% 0%, rgba(43,163,106,0.14) 0%, rgba(255,255,255,0) 60%), #FFFFFF" }}
            >
              <span className="mt-px">{Icon.shield({ color: "#136B43" })}</span>
              <span className="flex flex-col gap-1.5 text-[13px] leading-[1.45] text-ink-2">
                Got an offer from one of these brands? Check it before you reply.
                <Link href="/inbox/check" className="font-semibold text-ok hover:underline">
                  Check an email
                </Link>
              </span>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
