"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { BrandLogo, formatDate, hostOf, Icon, SamplePill, SourceList } from "@/components/ui";
import { VideoThumb } from "@/components/videos";
import { brandResearchKey, campaignLabel } from "@/lib/brandResearchState";
import { useStore } from "@/lib/store";
import { creatorVideos, PLATFORM_LABEL } from "@/lib/videos";

const WHY_ICONS = [Icon.play, Icon.people, Icon.calendar];

export default function BrandDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { matches, profile, account, saved, toggleSave, loadBrandResearch, researchingBrands } = useStore();
  const result = [matches[profile.window], ...Object.values(matches)].find((m) => m?.brands.some((b) => b.id === id));
  const brand = result?.brands.find((b) => b.id === id);
  const researching = !!result && !!researchingBrands[brandResearchKey(result, id)];
  const window = result?.window;
  const mode = result?.mode;
  const researchStatus = brand?.researchStatus;
  const [pitch, setPitch] = useState<string | null>(null);
  const [drafting, setDrafting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Pay, campaigns and creator videos are checked when the brand is opened, not for every match.
  useEffect(() => {
    if (window && mode === "live" && researchStatus === "unresearched") {
      void loadBrandResearch(window, id);
    }
  }, [window, mode, researchStatus, id, loadBrandResearch]);

  useEffect(() => {
    if (!pitch) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPitch(null);
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, [pitch]);

  if (!brand || !result) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="text-sm text-muted">This brand isn&apos;t in your current matches.</span>
        <Link href="/matches" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
          Back to matches
        </Link>
      </div>
    );
  }

  const isSaved = saved.includes(brand.id);
  const videos = creatorVideos(brand);
  const firstName = (account?.user?.name || profile.name).split(" ")[0];

  const draft = async () => {
    setDrafting(true);
    try {
      const res = await fetch("/api/pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, profile: result.profile, name: firstName }),
      });
      setPitch(((await res.json()) as { pitch: string }).pitch);
    } finally {
      setDrafting(false);
    }
  };

  const [from, to] = brand.spend?.text.split(" to ") ?? [];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 lg:px-10">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-muted">
        <Link href="/matches" className="hover:text-ink">
          Brand matches
        </Link>
        {Icon.chevron({ size: 12, color: "#A1A1AA" })}
        <span className="font-medium text-ink">{brand.name}</span>
      </nav>

      {/* Hero */}
      <div
        className="flex flex-wrap items-center justify-between gap-5 rounded-[28px] border border-[#F3E2D6] p-6"
        style={{ background: `radial-gradient(80% 120% at 100% 0%, rgba(${brand.wash},0.22) 0%, rgba(${brand.wash},0.10) 38%, rgba(255,255,255,0) 66%), #FFFFFF` }}
      >
        <div className="flex items-center gap-4">
          <BrandLogo brand={brand} size={68} />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="m-0 text-[30px] font-semibold tracking-[-0.025em]">{brand.name}</h1>
              <SamplePill mode={result.mode} short />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-md border border-line bg-white px-1.5 py-[3px] text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-4">{brand.category}</span>
              <span className="rounded-md border border-line bg-white px-1.5 py-[3px] text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-4">{result.profile.niche}</span>
              <span className={`rounded-md px-1.5 py-[3px] text-[10px] font-semibold tracking-[0.06em] ${brand.live ? "bg-ok-bg text-ok-2" : "bg-soft text-muted"}`}>
                {researching ? "CHECKING…" : campaignLabel(brand).toUpperCase()}
              </span>
              {brand.website && (
                <a href={`https://${brand.website.replace(/^https?:\/\//, "")}`} target="_blank" rel="noreferrer" className="rounded-md border border-line bg-white px-1.5 py-[3px] text-[10px] font-semibold tracking-[0.06em] text-violet hover:underline">
                  {brand.website.replace(/^https?:\/\//, "").toUpperCase()}
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2.5">
          <button type="button" onClick={() => toggleSave(brand.id)} className={`flex h-12 items-center gap-2 rounded-full px-5 text-[15px] font-semibold ${isSaved ? "bg-ok-bg text-ok" : "border border-line-2 bg-white hover:bg-soft"}`}>
            {Icon.heart({ size: 16, color: isSaved ? "#136B43" : "#18181B" })}
            {isSaved ? "Saved" : "Save"}
          </button>
          <button type="button" onClick={draft} disabled={drafting} className="flex h-12 items-center gap-2 rounded-full bg-ink px-5 text-[15px] font-semibold text-white hover:bg-ink-2 disabled:opacity-70">
            {Icon.sparkle({ size: 16, color: "#fff" })}
            {drafting ? "Drafting…" : pitch ? "Redraft pitch" : "Draft a pitch"}
          </button>
        </div>
      </div>

      <section aria-labelledby="videos-h" aria-busy={researching} className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between px-1">
          <h2 id="videos-h" className="m-0 text-[17px] font-semibold">
            Videos creators made for them
          </h2>
          {videos.length > 0 && (
            <span className="text-[13px] text-muted">
              {videos.length} video{videos.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
        {videos.length > 0 ? (
          <div className="scroll-area flex gap-3 overflow-x-auto pb-1">
            {videos.map((v, i) => (
              <a
                key={v.url}
                href={v.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Watch ${v.handle ?? v.title ?? "video"} on ${PLATFORM_LABEL[v.platform]}`}
                className="flex w-[150px] shrink-0 flex-col gap-1.5 rounded-2xl transition hover:-translate-y-0.5"
              >
                <VideoThumb video={v} wash={brand.wash} index={i} large />
                <span className="line-clamp-2 text-[13px] font-semibold leading-snug text-ink-2">{v.handle ?? v.title ?? hostOf(v.url)}</span>
                {(v.deal || v.date) && <span className="-mt-1 truncate text-[11px] text-muted">{[v.deal, v.date && formatDate(v.date)].filter(Boolean).join(" · ")}</span>}
              </a>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2.5 rounded-[18px] border border-dashed border-line-2 bg-white px-4 py-3.5 text-[13px] text-muted">
            {Icon.play({ size: 16, color: "#6B6B74" })}
            {researching ? "Looking for creator videos…" : "No public creator videos found for this brand yet."}
          </div>
        )}
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-0.5 rounded-[20px] border border-line bg-white p-4">
              <span className="text-[26px] font-semibold tracking-[-0.02em]">{brand.fit}%</span>
              <span className="text-[13px] text-muted">Content fit</span>
            </div>
            <div className="flex flex-col gap-0.5 rounded-[20px] border border-line bg-white p-4">
              <span className="text-[26px] font-semibold tracking-[-0.02em]">{brand.sources.length}</span>
              <span className="text-[13px] text-muted">Public sources</span>
            </div>
            <div className={`flex flex-col gap-0.5 rounded-[20px] p-4 ${brand.live ? "bg-ok-bg text-ok" : "bg-soft text-ink-3"}`}>
              <span className="text-[20px] font-semibold leading-[1.3] tracking-[-0.02em]">{researching ? "Checking…" : campaignLabel(brand)}</span>
              <span className="text-[13px]">Hiring status</span>
            </div>
          </div>

          <div aria-live="polite" aria-busy={researching} className="flex flex-col gap-1.5 rounded-[22px] border border-line bg-white p-5">
            <span className="text-[13px] text-muted">What they pay creators</span>
            {brand.spend ? (
              <span className="text-[34px] tracking-[-0.025em]">
                <b>{from}</b>
                {to && (
                  <>
                    {" "}to <b>{to}</b>
                  </>
                )}
              </span>
            ) : (
              <span className="text-2xl italic text-muted">
                {researching ? "Checking pay…" : brand.researchStatus === "unresearched" ? "Not checked yet" : brand.researchStatus === "failed" ? "Check unavailable" : "No public data"}
              </span>
            )}
            <span className="text-sm leading-[1.45] text-ink-4">{brand.spendNote}</span>
            {brand.researchStatus === "failed" && (
              <button
                type="button"
                disabled={researching}
                onClick={() => loadBrandResearch(result.window, brand.id)}
                className="mt-2 self-start rounded-full bg-chip px-4 py-2 text-sm font-semibold hover:bg-line-2 disabled:opacity-50"
              >
                {researching ? "Checking…" : "Try again"}
              </button>
            )}
          </div>

          <div className="flex flex-col gap-0.5 rounded-[22px] border border-line bg-white p-2">
            <span className="px-3 pb-1.5 pt-3 text-[15px] font-semibold">Why it fits you</span>
            {brand.why.filter(Boolean).map((w, i) => (
              <div key={i} className={`flex items-start gap-3 rounded-[14px] p-3 ${i === 0 ? "bg-soft" : ""}`}>
                <span className="mt-px">{(WHY_ICONS[i] ?? Icon.check)({ color: "#3F3F46", width: 1.8 })}</span>
                <span className="text-sm leading-[1.5] text-ink-2">{w}</span>
              </div>
            ))}
          </div>
        </div>

        <aside className="flex flex-col gap-2 lg:sticky lg:top-8">
          <div className="flex items-baseline justify-between px-1">
            <span className="text-[15px] font-semibold">Sources</span>
            <span className="text-xs text-muted">You.com · discovery and campaign research</span>
          </div>
          <div className="flex flex-col rounded-[22px] border border-line bg-white p-1.5">
            <SourceList sources={brand.sources} empty="No public sources yet. Treat this match as a lead, not a fact." />
          </div>
          <Link href="/inbox/check" className="mt-2 flex items-center gap-2 rounded-[18px] border border-[#D9EDE2] bg-white px-4 py-3 text-[13px] text-ink-2 hover:bg-soft">
            {Icon.shield({ size: 16, color: "#136B43" })}
            <span className="flex-1">Got an email from {brand.name}? Check it first.</span>
            {Icon.arrow({ size: 14 })}
          </Link>
        </aside>
      </div>

      {pitch !== null && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4" onClick={() => setPitch(null)}>
          <div role="dialog" aria-modal="true" aria-label="Pitch draft" className="flex max-h-[85vh] w-full max-w-xl flex-col gap-4 rounded-[28px] bg-white p-6 shadow-[0_30px_80px_rgba(24,24,27,0.25)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Pitch to {brand.name}</span>
              <button type="button" onClick={() => setPitch(null)} aria-label="Close" className="flex size-9 items-center justify-center rounded-full bg-chip hover:bg-line-2">
                {Icon.x({ size: 16 })}
              </button>
            </div>
            <textarea value={pitch} onChange={(e) => setPitch(e.target.value)} rows={14} className="flex-1 resize-none rounded-2xl border border-line-2 bg-field p-4 text-sm leading-relaxed outline-none focus:border-ink" />
            <div className="flex justify-end gap-2.5">
              <button type="button" onClick={draft} disabled={drafting} className="h-11 rounded-full bg-chip px-5 text-sm font-semibold hover:bg-line-2 disabled:opacity-60">
                {drafting ? "Drafting…" : "Redraft"}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(pitch);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="h-11 rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-ink-2"
              >
                {copied ? "Copied" : "Copy pitch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
