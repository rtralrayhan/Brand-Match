"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { BackButton, BAND, Icon, SamplePill, ScoreRing, Skeleton, SourceList, TONE } from "@/components/desktop/ui";
import { useStore } from "@/lib/store";

export default function EmailScore({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { emails, gmailEmails, gmailLoading, loadGmail, account, trust, checking, checkEmail, reported, report } = useStore();
  const email = [...emails, ...(gmailEmails ?? [])].find((e) => e.id === id);

  // Opened a Gmail email directly (e.g. after a refresh): read Gmail first.
  useEffect(() => {
    if (id.startsWith("gmail-") && gmailEmails === null && account?.gmail.connected && !gmailLoading) loadGmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, account?.gmail.connected]);
  const t = trust[id];
  const [open, setOpen] = useState<string | null>(null);
  const [showBody, setShowBody] = useState(false);

  useEffect(() => {
    setOpen(null);
    setShowBody(false);
  }, [id]);

  useEffect(() => {
    if (email && !t && !checking[email.id]) checkEmail(email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email?.id]);

  useEffect(() => {
    if (t && open === null) setOpen([...t.checks].sort((a, b) => a.points / a.max - b.points / b.max)[0]?.id ?? null);
  }, [t, open]);

  if (!email) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="text-sm text-muted">That email isn&apos;t in your inbox.</span>
        <Link href="/inbox" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
          Back to inbox
        </Link>
      </div>
    );
  }

  const b = t ? BAND[t.band] : null;
  const isReported = reported.includes(id);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-6 py-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="md:hidden">
            <BackButton href="/inbox" label="Back to inbox" />
          </span>
          <span className="hidden text-sm font-medium text-muted sm:inline">Trust Score</span>
          {t && <SamplePill mode={t.mode} short />}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => report(id)}
            className={`h-10 whitespace-nowrap rounded-full px-4 text-sm font-semibold ${isReported ? "bg-bad-bg text-bad" : "border border-line-2 bg-white hover:bg-soft"}`}
          >
            {isReported ? "Marked as scam" : "Mark as scam"}
          </button>
          {t?.realDomain ? (
            <a href={`https://${t.realDomain}`} target="_blank" rel="noreferrer" className="flex h-10 items-center whitespace-nowrap rounded-full bg-ink px-4 text-sm font-semibold text-white hover:bg-ink-2">
              See the real brand
            </a>
          ) : (
            <Link href="/matches" className="flex h-10 items-center whitespace-nowrap rounded-full bg-ink px-4 text-sm font-semibold text-white hover:bg-ink-2">
              Find real brands
            </Link>
          )}
        </div>
      </div>

      {/* Score hero */}
      <div
        className="flex flex-col gap-5 rounded-[28px] border p-6 sm:flex-row sm:items-center"
        style={{
          borderColor: b?.border ?? "#ECECEE",
          background: b ? `radial-gradient(70% 100% at 0% 0%, rgba(${b.wash},0.14) 0%, rgba(${b.wash},0.05) 45%, rgba(255,255,255,0) 72%), #FFFFFF` : "#FFFFFF",
        }}
      >
        {t && b ? (
          <>
            <ScoreRing score={t.score} band={t.band} />
            <div className="flex flex-1 flex-col gap-2">
              <span className="w-fit rounded-full px-3 py-[5px] text-xs font-semibold" style={{ background: b.bg, color: b.fg }}>
                {b.label}
              </span>
              <span className="text-[24px] leading-[1.25] tracking-[-0.015em]">{t.headline}</span>
              {t.note && (
                <span className="flex items-center gap-2 text-[13px] text-ink-3">
                  {Icon.info({ size: 15, color: "#3F3F46" })}
                  {t.note}
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-5" aria-live="polite">
            <div className="size-[104px] shrink-0 animate-spin rounded-full border-[10px] border-line border-t-violet" />
            <span className="text-[15px] text-muted">{checking[id] ? "Checking the sender, scam reports, lawsuits and the manager…" : "Starting check…"}</span>
          </div>
        )}
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_320px]">
        {/* Checks */}
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between px-1">
            <span className="text-[15px] font-semibold">How we scored it</span>
            <span className="text-xs text-muted">Click a check for sources</span>
          </div>
          <div className="flex flex-col gap-0.5 rounded-[22px] border border-line bg-white p-1.5">
            {!t &&
              [0, 1, 2, 3, 4].map((k) => (
                <div key={k} className="flex items-center gap-3 p-3">
                  <Skeleton className="size-2.5 rounded-full" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-3.5 w-1/3" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                </div>
              ))}
            {t?.checks.map((c) => {
              const isOpen = open === c.id;
              return (
                <div key={c.id} className={`rounded-2xl ${isOpen ? "bg-soft" : ""}`}>
                  <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? "" : c.id)} className="flex w-full items-center gap-3 rounded-2xl p-3.5 text-left hover:bg-soft">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ background: TONE[c.tone] }} />
                    <span className="flex flex-1 flex-col gap-0.5">
                      <span className="text-sm font-semibold">{c.name}</span>
                      <span className="text-[13px] leading-[1.4] text-ink-4">{c.finding}</span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-sm font-semibold text-ink-3">
                        {c.points}/{c.max}
                      </span>
                      <span className="h-1 w-14 overflow-hidden rounded-full bg-line">
                        <span className="block h-1 rounded-full" style={{ width: `${(c.points / c.max) * 100}%`, background: TONE[c.tone] }} />
                      </span>
                    </span>
                  </button>
                  {isOpen && (
                    <div className="mx-3 mb-3 ml-9 flex flex-col gap-1 rounded-xl border border-line bg-white p-1.5">
                      <span className="px-2.5 pt-1.5 text-[10px] font-semibold tracking-[0.06em] text-muted">{c.via}</span>
                      <SourceList sources={c.sources} empty={c.id === "flags" ? "Read straight from the email text. No web lookup needed." : "No public pages found. That's the finding."} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {t && (
            <button type="button" onClick={() => checkEmail(email, true)} disabled={checking[id]} className="flex items-center justify-center gap-1.5 py-2 text-[13px] text-muted hover:text-ink disabled:opacity-50">
              {Icon.refresh({ size: 14 })} {checking[id] ? "Re-checking…" : "Re-run with today's web"}
            </button>
          )}
        </div>

        {/* The email */}
        <aside className="flex flex-col gap-3 rounded-[22px] border border-line bg-white p-4 lg:sticky lg:top-8">
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">The email</span>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold">{email.fromName}</span>
            <span className="break-all text-[13px] font-medium" style={{ color: t?.band === "risky" ? "#B4232A" : "#52525B" }}>
              {email.fromEmail}
            </span>
          </div>
          <span className="text-sm font-medium">{email.subject}</span>
          <button type="button" onClick={() => setShowBody((s) => !s)} className="self-start text-xs font-medium text-violet hover:underline">
            {showBody ? "Hide email text" : "Show email text"}
          </button>
          {showBody && <pre className="m-0 whitespace-pre-wrap rounded-xl bg-soft p-3 font-sans text-[13px] leading-relaxed text-ink-2">{email.body}</pre>}
          <span className="flex items-start gap-2 border-t border-line pt-3 text-xs leading-normal text-muted">
            {Icon.info({ size: 14, color: "#6B6B74" })}
            Links in the email are shown as text and never opened. A web check, not a legal one.
          </span>
        </aside>
      </div>
    </div>
  );
}
