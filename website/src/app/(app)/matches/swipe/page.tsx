"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { BrandLogo, Icon } from "@/components/ui";
import { MatchLoading, PageHeader, useMatches, ViewToggle, WindowToggle } from "@/components/matches";

const orb = { background: "radial-gradient(circle at 58% 38%, #FFD27A 0%, #FF8A3D 30%, #FF4D6D 55%, rgba(255,120,150,0.35) 68%, rgba(255,255,255,0) 74%)" };

export default function Swipe() {
  const { result, window, saved, toggleSave } = useMatches();
  const [idx, setIdx] = useState(0);
  const [dx, setDx] = useState(0);
  const [drag, setDrag] = useState(false);
  const [history, setHistory] = useState<Array<{ id: string; name: string; dir: 1 | -1 }>>([]);
  const startX = useRef(0);

  const list = result?.brands ?? [];
  const done = !!result && idx >= list.length;
  const b = list[Math.min(idx, list.length - 1)];
  const k = Math.max(-1, Math.min(1, dx / 110));
  const last = history[history.length - 1];

  // Reset the deck when the window changes.
  useEffect(() => {
    setIdx(0);
    setHistory([]);
  }, [window]);

  const decide = useCallback(
    (dir: 1 | -1) => {
      if (!b || idx >= list.length) return;
      setDrag(false);
      setDx(dir * 620);
      setTimeout(() => {
        if (dir > 0 && !saved.includes(b.id)) toggleSave(b.id);
        setHistory((h) => [...h, { id: b.id, name: b.name, dir }]);
        setIdx((i) => i + 1);
        setDx(0);
      }, 230);
    },
    [b, idx, list.length, saved, toggleSave],
  );

  const undo = useCallback(() => {
    if (!last) return;
    if (last.dir > 0 && saved.includes(last.id)) toggleSave(last.id);
    setHistory((h) => h.slice(0, -1));
    setIdx((i) => i - 1);
  }, [last, saved, toggleSave]);

  // Keyboard: ← pass, → save, Z / Backspace undo.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input, textarea, select")) return;
      if (e.key === "ArrowRight") decide(1);
      else if (e.key === "ArrowLeft") decide(-1);
      else if (e.key === "z" || e.key === "Backspace") undo();
    };
    // `window` here is the match window, so use globalThis for the browser object.
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, [decide, undo]);

  const stamp = (color: string, side: "left" | "right", rot: number, op: number): React.CSSProperties => ({
    position: "absolute", top: 70, [side]: 22, fontSize: 24, fontWeight: 700, letterSpacing: "0.08em", color, border: `3px solid ${color}`,
    borderRadius: 10, padding: "4px 12px", background: "rgba(255,255,255,0.85)", transform: `rotate(${rot}deg)`, opacity: op, pointerEvents: "none",
  });

  const savedHistory = history.filter((h) => h.dir > 0);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 lg:px-10">
      <PageHeader
        title="Brand matches"
        mode={result?.mode}
        subtitle={
          <>
            Swipe right to <b className="text-ink">save</b>, left to <b className="text-ink">pass</b>
          </>
        }
      >
        <WindowToggle />
        <ViewToggle view="swipe" />
      </PageHeader>

      {!result && <MatchLoading />}

      {result && (
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_300px]">
          <div className="flex flex-col items-center gap-6">
            <span className="rounded-full bg-chip px-3 py-2 text-[13px] font-medium text-ink-3">
              {done ? `All ${list.length} reviewed · ${window} days` : `${idx + 1} of ${list.length} · last ${window} days`}
            </span>

            {!done && b && (
              <>
                <div className="relative h-[480px] w-full max-w-[420px]">
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
                      if (dx > 110) decide(1);
                      else if (dx < -110) decide(-1);
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
                    style={{ transform: `translateX(${dx}px) rotate(${dx / 22}deg)`, transition: drag ? "none" : "transform 230ms ease", cursor: drag ? "grabbing" : "grab" }}
                  >
                    <div
                      className="relative flex h-[190px] flex-col justify-between p-4"
                      style={{
                        background: `radial-gradient(120% 100% at 100% 0%, rgba(${b.wash},0.34) 0%, rgba(${b.wash},0.12) 42%, rgba(255,255,255,0) 72%), radial-gradient(80% 80% at 0% 100%, rgba(${b.wash},0.14) 0%, rgba(255,255,255,0) 60%), #FFFFFF`,
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <span className="rounded-md bg-white px-1.5 py-[3px] text-[10px] font-semibold tracking-[0.06em] text-ink-4">{b.live ? "HIRING NOW" : "QUIET"}</span>
                        <span className="rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold shadow-[0_1px_3px_rgba(24,24,27,0.10)]">{b.fit}% fit</span>
                      </div>
                      <div className="self-start rounded-[22px] shadow-[0_8px_20px_rgba(24,24,27,0.12)]">
                        <BrandLogo brand={b} size={80} />
                      </div>
                      <span style={stamp("#18794E", "left", -12, Math.max(0, k))}>SAVE</span>
                      <span style={stamp("#B4232A", "right", 12, Math.max(0, -k))}>PASS</span>
                    </div>
                    <div className="flex flex-col gap-3.5 px-5 pb-5 pt-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[24px] font-semibold tracking-[-0.02em]">{b.name}</span>
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

                <div className="flex items-center justify-center gap-5 pt-3">
                  <button type="button" onClick={() => decide(-1)} aria-label="Pass" className="flex size-16 items-center justify-center rounded-full border border-line bg-white shadow-[0_6px_18px_rgba(24,24,27,0.08)] hover:bg-soft">
                    {Icon.x({ size: 24, color: "#B4232A" })}
                  </button>
                  <button type="button" onClick={undo} disabled={!history.length} aria-label="Undo last swipe" className="flex size-12 items-center justify-center rounded-full border border-line bg-white hover:bg-soft disabled:opacity-40">
                    {Icon.undo({ size: 20, color: "#3F3F46" })}
                  </button>
                  <Link href={`/matches/${b.id}`} aria-label="See brand details" className="flex size-12 items-center justify-center rounded-full border border-line bg-white hover:bg-soft">
                    {Icon.info({ size: 20, color: "#3F3F46" })}
                  </Link>
                  <button type="button" onClick={() => decide(1)} aria-label="Save" className="flex size-16 items-center justify-center rounded-full bg-ink shadow-[0_8px_20px_rgba(24,24,27,0.25)] hover:bg-ink-2">
                    {Icon.heart({ size: 24, color: "#fff", width: 2.2 })}
                  </button>
                </div>
                <span className="min-h-4 text-center text-xs text-muted">
                  {last ? (last.dir > 0 ? `Saved ${last.name}.` : `Passed on ${last.name}.`) : "Drag the card, click the buttons, or use ← and → on your keyboard."}
                </span>
              </>
            )}

            {done && (
              <div
                className="flex w-full max-w-[420px] flex-col items-center gap-3 rounded-[28px] border border-[#E4E1F5] px-6 py-9 text-center"
                style={{ background: "radial-gradient(100% 70% at 50% 0%, rgba(124,92,230,0.16) 0%, rgba(255,255,255,0) 70%), #FFFFFF" }}
              >
                <div aria-hidden className="size-[72px] rounded-full" style={orb} />
                <span className="text-[24px] tracking-[-0.02em]">
                  You&apos;re <b>all caught up</b>
                </span>
                <span className="text-sm leading-[1.45] text-muted">
                  {savedHistory.length
                    ? `You saved ${savedHistory.length} of ${list.length} brands from your last ${window} days.`
                    : `You passed on all ${list.length}. New matches arrive as you post.`}
                </span>
                <div className="mt-3 flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIdx(0);
                      setHistory([]);
                    }}
                    className="h-11 rounded-full bg-chip px-5 text-sm font-semibold hover:bg-line-2"
                  >
                    Start over
                  </button>
                  <Link href="/matches" className="flex h-11 items-center rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-ink-2">
                    See as grid
                  </Link>
                </div>
              </div>
            )}
          </div>

          <aside className="flex flex-col gap-4 lg:sticky lg:top-8">
            <div className="flex flex-col rounded-[22px] border border-line bg-white p-2">
              <span className="px-3 pb-1 pt-2.5 text-[15px] font-semibold">Saved this session</span>
              {savedHistory.map((h) => (
                <Link key={h.id} href={`/matches/${h.id}`} className="flex items-center gap-3 rounded-xl p-3 hover:bg-soft">
                  {Icon.heart({ size: 16, color: "#136B43" })}
                  <span className="flex-1 text-sm">{h.name}</span>
                  <span className="text-xs text-muted">Pitch now</span>
                </Link>
              ))}
              {!savedHistory.length && <span className="px-3 pb-3 pt-1 text-sm text-muted">Nothing saved yet</span>}
            </div>
            <div className="flex flex-col gap-2 rounded-[22px] border border-line bg-white p-5 text-[13px] text-ink-3">
              <span className="text-sm font-semibold text-ink">Shortcuts</span>
              {[
                ["→", "Save"],
                ["←", "Pass"],
                ["Z", "Undo"],
              ].map(([key, label]) => (
                <span key={key} className="flex items-center justify-between">
                  {label}
                  <kbd className="rounded-md border border-line-2 bg-soft px-2 py-0.5 font-sans text-xs">{key}</kbd>
                </span>
              ))}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

