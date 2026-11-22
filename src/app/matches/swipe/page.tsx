"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { BrandLogo, Icon, TabBar } from "@/components/ui";
import { MatchesHeader, MatchLoading, useMatches, ViewToggle } from "@/components/matches";

export default function Swipe() {
  const { result, window, saved, toggleSave, flagged } = useMatches();
  const [idx, setIdx] = useState(0);
  const [dx, setDx] = useState(0);
  const [drag, setDrag] = useState(false);
  const [history, setHistory] = useState<Array<{ id: string; name: string; dir: 1 | -1 }>>([]);
  const startX = useRef(0);

  const list = result?.brands ?? [];
  const done = result && idx >= list.length;
  const b = list[Math.min(idx, list.length - 1)];
  const k = Math.max(-1, Math.min(1, dx / 110));
  const last = history[history.length - 1];

  const decide = (dir: 1 | -1) => {
    if (!b || idx >= list.length) return;
    setDrag(false);
    setDx(dir * 520);
    setTimeout(() => {
      if (dir > 0 && !saved.includes(b.id)) toggleSave(b.id);
      setHistory((h) => [...h, { id: b.id, name: b.name, dir }]);
      setIdx((i) => i + 1);
      setDx(0);
    }, 230);
  };

  const undo = () => {
    if (!last) return;
    if (last.dir > 0 && saved.includes(last.id)) toggleSave(last.id);
    setHistory((h) => h.slice(0, -1));
    setIdx((i) => i - 1);
  };

  const stamp = (color: string, side: "left" | "right", rot: number, op: number): React.CSSProperties => ({
    position: "absolute", top: 64, [side]: 18, fontSize: 22, fontWeight: 700, letterSpacing: "0.08em", color, border: `3px solid ${color}`,
    borderRadius: 10, padding: "4px 10px", background: "rgba(255,255,255,0.85)", transform: `rotate(${rot}deg)`, opacity: op, pointerEvents: "none",
  });

  const savedNames = history.filter((h) => h.dir > 0).map((h) => h.name);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-3.5 px-[18px] pt-[22px]">
        <MatchesHeader
          view="swipe"
          mode={result?.mode}
          subtitle={
            <>
              Swipe right to <b className="text-ink">save</b>, left to <b className="text-ink">pass</b>
            </>
          }
        />
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-chip px-3 py-2 text-[13px] font-medium text-ink-3">
            {!result ? "Loading…" : done ? `All ${list.length} reviewed · ${window} days` : `${idx + 1} of ${list.length} · last ${window} days`}
          </span>
          <ViewToggle view="swipe" />
        </div>
      </div>

      {!result && (
        <div className="flex-1 overflow-y-auto px-[18px] pt-4">
          <MatchLoading />
        </div>
      )}

      {result && !done && b && (
        <div className="flex min-h-0 flex-1 flex-col px-[18px] pt-[18px]">
          <div className="relative min-h-0 flex-1">
            <div aria-hidden className="absolute inset-x-[22px] -bottom-3.5 top-[22px] rounded-[28px] border border-line bg-white opacity-55" />
            <div aria-hidden className="absolute inset-x-[11px] -bottom-[7px] top-[11px] rounded-[28px] border border-line bg-white opacity-85" />
            <div
              onPointerDown={(e) => {
                startX.current = e.clientX;
                e.currentTarget.setPointerCapture(e.pointerId);
                setDrag(true);
              }}
              onPointerMove={(e) => drag && setDx(e.clientX - startX.current)}
              onPointerUp={() => {
                if (!drag) return;
                if (dx > 100) decide(1);
                else if (dx < -100) decide(-1);
                else {
                  setDrag(false);
                  setDx(0);
                }
              }}
              onPointerCancel={() => {
                setDrag(false);
                setDx(0);
              }}
              className="absolute inset-0 touch-none select-none overflow-hidden rounded-[28px] border border-line bg-white shadow-[0_1px_2px_rgba(24,24,27,0.04),0_14px_36px_rgba(24,24,27,0.10)]"
              style={{ transform: `translateX(${dx}px) rotate(${dx / 20}deg)`, transition: drag ? "none" : "transform 230ms ease", cursor: drag ? "grabbing" : "grab" }}
            >
              <div
                className="relative flex h-[168px] flex-col justify-between p-3.5"
                style={{
                  background: `radial-gradient(120% 100% at 100% 0%, rgba(${b.wash},0.34) 0%, rgba(${b.wash},0.12) 42%, rgba(255,255,255,0) 72%), radial-gradient(80% 80% at 0% 100%, rgba(${b.wash},0.14) 0%, rgba(255,255,255,0) 60%), #FFFFFF`,
                }}
              >
                <div className="flex items-start justify-between">
                  <span className="rounded-md bg-white px-1.5 py-[3px] text-[10px] font-semibold tracking-[0.06em] text-ink-4">{b.live ? "HIRING NOW" : "QUIET"}</span>
                  <span className="rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold shadow-[0_1px_3px_rgba(24,24,27,0.10)]">{b.fit}% fit</span>
                </div>
                <div className="shadow-[0_8px_20px_rgba(24,24,27,0.12)] self-start rounded-[22px]">
                  <BrandLogo brand={b} size={76} />
                </div>
                <span style={stamp("#18794E", "left", -12, Math.max(0, k))}>SAVE</span>
                <span style={stamp("#B4232A", "right", 12, Math.max(0, -k))}>PASS</span>
              </div>
              <div className="flex flex-col gap-3 px-[18px] pb-[18px] pt-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[22px] font-semibold tracking-[-0.02em]">{b.name}</span>
                  <span className="text-sm text-muted">
                    {b.category} · {b.sources.length} sources
                  </span>
                </div>
                <div className="flex flex-col gap-[7px] text-sm">
                  <span className={`flex items-center gap-2 ${b.spend ? "text-ink-3" : "italic text-muted"}`}>
                    {Icon.dollar({ size: 15, color: "#52525B" })}
                    {b.spend ? `${b.spend.text} per creator` : "No public pay data yet"}
                  </span>
                  <span className="flex items-center gap-2 text-ink-3">
                    {Icon.people({ size: 15, color: "#52525B" })}
                    {b.hiring}
                  </span>
                </div>
                <div className="flex items-start gap-2.5 rounded-2xl bg-soft p-3">
                  <span className="mt-0.5">{Icon.check({ size: 16, color: "#18794E" })}</span>
                  <span className="line-clamp-3 text-[13px] leading-[1.45] text-ink-2">{b.why[0]}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-[18px] pb-1.5 pt-[26px]">
            <button type="button" onClick={() => decide(-1)} aria-label="Pass" className="flex size-[62px] items-center justify-center rounded-full border border-line bg-white shadow-[0_6px_18px_rgba(24,24,27,0.08)]">
              {Icon.x({ size: 24, color: "#B4232A" })}
            </button>
            {history.length ? (
              <button type="button" onClick={undo} aria-label="Undo last swipe" className="flex size-12 items-center justify-center rounded-full border border-line bg-white">
                {Icon.undo({ size: 20, color: "#3F3F46" })}
              </button>
            ) : (
              <Link href={`/matches/${b.id}`} aria-label="See brand details" className="flex size-12 items-center justify-center rounded-full border border-line bg-white">
                {Icon.info({ size: 20, color: "#3F3F46" })}
              </Link>
            )}
            <button type="button" onClick={() => decide(1)} aria-label="Save" className="flex size-[62px] items-center justify-center rounded-full bg-ink shadow-[0_8px_20px_rgba(24,24,27,0.25)]">
              {Icon.heart({ size: 24, color: "#fff", width: 2.2 })}
            </button>
          </div>
          <span className="min-h-4 text-center text-xs text-muted">
            {last ? (last.dir > 0 ? `Saved ${last.name}. Pitch it from your saved list.` : `Passed on ${last.name}.`) : "Drag the card, or tap the buttons."}
          </span>
        </div>
      )}

      {done && (
        <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto p-[18px]">
          <div
            className="flex flex-col items-center gap-3 rounded-[28px] border border-[#E4E1F5] px-5 py-7 text-center"
            style={{ background: "radial-gradient(100% 70% at 50% 0%, rgba(124,92,230,0.16) 0%, rgba(255,255,255,0) 70%), #FFFFFF" }}
          >
            <div aria-hidden className="size-[72px] rounded-full" style={{ background: "radial-gradient(circle at 58% 38%, #FFD27A 0%, #FF8A3D 30%, #FF4D6D 55%, rgba(255,120,150,0.35) 68%, rgba(255,255,255,0) 74%)" }} />
            <span className="text-[22px] tracking-[-0.02em]">
              You&apos;re <b>all caught up</b>
            </span>
            <span className="text-sm leading-[1.45] text-muted">
              {savedNames.length ? `You saved ${savedNames.length} of ${list.length} brands from your last ${window} days.` : `You passed on all ${list.length}. New matches arrive as you post.`}
            </span>
          </div>
          <div className="flex flex-col rounded-[22px] border border-line bg-white p-1.5">
            <span className="px-2.5 pb-1 pt-2.5 text-[13px] text-muted">Saved</span>
            {(savedNames.length ? history.filter((h) => h.dir > 0) : []).map((h) => (
              <Link key={h.id} href={`/matches/${h.id}`} className="flex items-center gap-3 p-2.5">
                {Icon.heart({ size: 16 })}
                <span className="flex-1 text-sm">{h.name}</span>
                <span className="text-xs text-muted">Pitch now</span>
              </Link>
            ))}
            {!savedNames.length && <span className="p-2.5 text-sm text-muted">Nothing saved yet</span>}
          </div>
          <div className="mt-auto grid grid-cols-2 gap-2.5">
            <button type="button" onClick={() => { setIdx(0); setHistory([]); }} className="h-[52px] rounded-full bg-chip text-[15px] font-semibold">
              Start over
            </button>
            <Link href="/matches" className="flex h-[52px] items-center justify-center rounded-full bg-ink text-[15px] font-semibold text-white">
              See as list
            </Link>
          </div>
        </div>
      )}

      <div className="px-[18px] pb-[26px] pt-2.5">
        <TabBar active="matches" badge={flagged} />
      </div>
    </div>
  );
}
