"use client";

import Link from "next/link";
import { use, useState } from "react";
import { BackButton, BrandLogo, Icon, SamplePill, SourceList } from "@/components/ui";
import { useStore } from "@/lib/store";

const WHY_ICONS = [Icon.play, Icon.people, Icon.calendar];

export default function BrandDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { matches, profile, saved, toggleSave } = useStore();
  const result = matches[profile.window] ?? matches[30] ?? matches[7];
  const brand = result?.brands.find((b) => b.id === id) ?? Object.values(matches).flatMap((m) => m?.brands ?? []).find((b) => b.id === id);
  const [pitch, setPitch] = useState<string | null>(null);
  const [drafting, setDrafting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!brand || !result) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="text-sm text-muted">This brand isn&apos;t in your current matches.</span>
        <Link href="/matches" className="h-11 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
          Back to matches
        </Link>
      </div>
    );
  }

  const isSaved = saved.includes(brand.id);

  const draft = async () => {
    setDrafting(true);
    try {
      const res = await fetch("/api/pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, profile: result.profile, name: profile.name.split(" ")[0] }),
      });
      setPitch(((await res.json()) as { pitch: string }).pitch);
    } finally {
      setDrafting(false);
    }
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-[18px] pb-2 pt-[18px]">
        <BackButton href="/matches" label="Back to matches" />
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[13px] text-muted">
          <span>Matches</span>
          {Icon.chevron({ size: 12, color: "#A1A1AA" })}
          <span className="truncate rounded-lg bg-chip px-2 py-1 font-medium text-ink">{brand.name}</span>
        </nav>
        <SamplePill mode={result.mode} short />
      </div>

      <main className="scroll-area flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-[18px] pb-[18px] pt-2">
        <div
          className="flex flex-col gap-3.5 rounded-3xl border border-[#F3E2D6] p-[18px]"
          style={{ background: `radial-gradient(110% 85% at 100% 0%, rgba(${brand.wash},0.22) 0%, rgba(${brand.wash},0.10) 38%, rgba(255,255,255,0) 66%), #FFFFFF` }}
        >
          <div className="flex items-center gap-3.5">
            <BrandLogo brand={brand} size={56} />
            <div className="flex flex-col gap-[3px]">
              <h1 className="m-0 text-[22px] font-semibold tracking-[-0.02em]">{brand.name}</h1>
              <span className="text-[13px] text-muted">{brand.category}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-md border border-line bg-white px-1.5 py-[3px] text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-4">{brand.category}</span>
            <span className="rounded-md border border-line bg-white px-1.5 py-[3px] text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-4">{result.profile.niche}</span>
            <span className={`rounded-md px-1.5 py-[3px] text-[10px] font-semibold tracking-[0.06em] ${brand.live ? "bg-ok-bg text-ok-2" : "bg-soft text-muted"}`}>
              {brand.live ? "PROGRAM OPEN" : "QUIET"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col gap-0.5 rounded-[18px] border border-line bg-white p-3">
            <span className="text-[22px] font-semibold tracking-[-0.02em]">{brand.fit}%</span>
            <span className="text-xs text-muted">Content fit</span>
          </div>
          <div className="flex flex-col gap-0.5 rounded-[18px] border border-line bg-white p-3">
            <span className="text-[22px] font-semibold tracking-[-0.02em]">{brand.sources.length}</span>
            <span className="text-xs text-muted">Public sources</span>
          </div>
          <div className={`flex flex-col gap-0.5 rounded-[18px] p-3 ${brand.live ? "bg-ok-bg text-ok" : "bg-soft text-ink-3"}`}>
            <span className="text-[22px] font-semibold tracking-[-0.02em]">{brand.live ? "Now" : "Quiet"}</span>
            <span className="text-xs">Hiring status</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 rounded-[22px] border border-line bg-white p-4">
          <span className="text-[13px] text-muted">What they pay creators</span>
          {brand.spend ? (
            <span className="text-[28px] tracking-[-0.025em]">
              <b>{brand.spend.text.split(" to ")[0]}</b>
              {brand.spend.text.includes(" to ") && (
                <>
                  {" "}to <b>{brand.spend.text.split(" to ")[1]}</b>
                </>
              )}
            </span>
          ) : (
            <span className="text-xl italic text-muted">No public data</span>
          )}
          <span className="text-[13px] leading-[1.45] text-ink-4">{brand.spendNote}</span>
        </div>

        <div className="flex flex-col gap-0.5 rounded-[22px] border border-line bg-white p-2">
          <span className="px-2.5 pb-1.5 pt-2.5 text-[15px] font-semibold">Why it fits you</span>
          {brand.why.filter(Boolean).map((w, i) => (
            <div key={i} className={`flex items-start gap-2.5 rounded-[14px] p-2.5 ${i === 0 ? "bg-soft" : ""}`}>
              <span className="mt-px">{(WHY_ICONS[i] ?? Icon.check)({ color: "#3F3F46", width: 1.8 })}</span>
              <span className="text-sm leading-[1.45] text-ink-2">{w}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between px-1">
            <span className="text-[15px] font-semibold">Sources</span>
            <span className="text-xs text-muted">You.com, last {result.window} days</span>
          </div>
          <div className="flex flex-col rounded-[22px] border border-line bg-white p-1.5">
            <SourceList sources={brand.sources} empty="No public sources yet. Treat this match as a lead, not a fact." />
          </div>
        </div>
      </main>

      <div className="grid grid-cols-[1fr_2fr] gap-2.5 px-[18px] pb-7 pt-2.5">
        <button type="button" onClick={() => toggleSave(brand.id)} className={`h-[52px] rounded-full text-[15px] font-semibold ${isSaved ? "bg-ok-bg text-ok" : "bg-chip"}`}>
          {isSaved ? "Saved" : "Save"}
        </button>
        <button type="button" onClick={draft} disabled={drafting} className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-semibold text-white disabled:opacity-70">
          {Icon.sparkle({ size: 16, color: "#fff" })}
          {drafting ? "Drafting…" : pitch ? "Redraft pitch" : "Draft a pitch"}
        </button>
      </div>

      {pitch && (
        <div className="absolute inset-0 z-10 flex flex-col justify-end bg-black/30" onClick={() => setPitch(null)}>
          <div role="dialog" aria-label="Pitch draft" className="flex max-h-[80%] flex-col gap-3 rounded-t-[28px] bg-white p-[18px] pb-7" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto h-1 w-10 rounded-full bg-line-2" />
            <div className="flex items-center justify-between">
              <span className="text-[17px] font-semibold">Pitch to {brand.name}</span>
              <button type="button" onClick={() => setPitch(null)} aria-label="Close" className="flex size-9 items-center justify-center rounded-full bg-chip">
                {Icon.x({ size: 16 })}
              </button>
            </div>
            <textarea value={pitch} onChange={(e) => setPitch(e.target.value)} rows={12} className="scroll-area flex-1 resize-none rounded-2xl border border-line-2 bg-field p-3.5 text-sm leading-relaxed outline-none" />
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(pitch);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="h-[52px] rounded-full bg-ink text-[15px] font-semibold text-white"
            >
              {copied ? "Copied" : "Copy pitch"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
