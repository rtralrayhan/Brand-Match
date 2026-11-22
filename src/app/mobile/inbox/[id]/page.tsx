"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { BackButton, BAND, Icon, SamplePill, ScoreRing, Skeleton, SourceList, TONE } from "@/components/mobile/ui";
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
    if (email && !t) checkEmail(email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, !!email]);

  useEffect(() => {
    if (t && open === null) setOpen([...t.checks].sort((a, b) => a.points / a.max - b.points / b.max)[0]?.id ?? null);
  }, [t, open]);

  if (!email && id.startsWith("gmail-") && (gmailLoading || account === null)) {
    return <div className="flex flex-1 items-center justify-center text-sm text-muted">Reading Gmail…</div>;
  }

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
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-[18px] pb-2 pt-[18px]">
        <BackButton href="/inbox" label="Back to inbox" />
        <span className="text-sm font-medium">Trust Score</span>
        {t ? <SamplePill mode={t.mode} short /> : <span className="w-[70px]" />}
      </div>

      <main className="scroll-area flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-[18px] pb-[18px] pt-2">
        <div
          className="flex flex-col items-center gap-3 rounded-[26px] border px-[18px] py-5"
          style={{
            borderColor: b?.border ?? "#ECECEE",
            background: b
              ? `radial-gradient(90% 70% at 50% 0%, rgba(${b.wash},0.14) 0%, rgba(${b.wash},0.05) 45%, rgba(255,255,255,0) 72%), #FFFFFF`
              : "#FFFFFF",
          }}
        >
          {t && b ? (
            <>
              <ScoreRing score={t.score} band={t.band} />
              <span className="rounded-full px-3 py-[5px] text-xs font-semibold" style={{ background: b.bg, color: b.fg }}>
                {b.label}
              </span>
              <span className="text-center text-xl leading-[1.3] tracking-[-0.015em]">{t.headline}</span>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 py-2" aria-live="polite">
              <div className="size-[104px] animate-spin rounded-full border-[10px] border-line border-t-violet" />
              <span className="text-sm text-muted">{checking[id] ? "Checking the sender, scam reports, lawsuits and the manager…" : "Starting check…"}</span>
            </div>
          )}
          <div className="flex w-full flex-col gap-0.5 border-t border-line pt-2.5">
            <span className="text-[13px] text-ink-4">
              {email.fromName} · <span style={{ color: t?.band === "risky" ? "#B4232A" : undefined }} className="font-medium">{email.fromEmail}</span>
            </span>
            <span className="text-sm font-medium">{email.subject}</span>
            <button type="button" onClick={() => setShowBody((s) => !s)} className="self-start pt-1 text-xs font-medium text-violet">
              {showBody ? "Hide email" : "Show email"}
            </button>
            {showBody && <pre className="mt-1 whitespace-pre-wrap rounded-xl bg-soft p-3 font-sans text-[13px] leading-relaxed text-ink-2">{email.body}</pre>}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between px-1">
            <span className="text-[15px] font-semibold">How we scored it</span>
            <span className="text-xs text-muted">Tap for sources</span>
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
                  <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? "" : c.id)} className="flex w-full items-center gap-3 p-3 text-left">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ background: TONE[c.tone] }} />
                    <span className="flex flex-1 flex-col gap-0.5">
                      <span className="text-sm font-semibold">{c.name}</span>
                      <span className="text-[13px] leading-[1.4] text-ink-4">{c.finding}</span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-ink-3">
                      {c.points}/{c.max}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="mx-3 mb-3 ml-8 flex flex-col gap-1 rounded-xl border border-line bg-white p-1.5">
                      <span className="px-2.5 pt-1.5 text-[10px] font-semibold tracking-[0.06em] text-muted">{c.via}</span>
                      <SourceList
                        sources={c.sources}
                        empty={c.id === "flags" ? "Read straight from the email text. No web lookup needed." : "No public pages found. That's the finding."}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {t?.note && (
          <div className="flex items-start gap-2.5 rounded-[18px] bg-chip px-3.5 py-3">
            <span className="mt-px">{Icon.info({ color: "#3F3F46" })}</span>
            <span className="text-[13px] leading-[1.45] text-ink-2">{t.note}</span>
          </div>
        )}

        {t && (
          <button type="button" onClick={() => checkEmail(email, true)} disabled={checking[id]} className="flex items-center justify-center gap-1.5 text-[13px] text-muted disabled:opacity-50">
            {Icon.refresh({ size: 14 })} {checking[id] ? "Re-checking…" : "Re-run with today's web"}
          </button>
        )}
      </main>

      <div className="grid grid-cols-2 gap-2.5 px-[18px] pb-7 pt-2.5">
        <button type="button" onClick={() => report(id)} className={`h-[52px] rounded-full text-[15px] font-semibold ${isReported ? "bg-bad-bg text-bad" : "bg-chip"}`}>
          {isReported ? "Marked as scam" : "Mark as scam"}
        </button>
        {t?.realDomain ? (
          <a href={`https://${t.realDomain}`} target="_blank" rel="noreferrer" className="flex h-[52px] items-center justify-center rounded-full bg-ink text-[15px] font-semibold text-white">
            See the real brand
          </a>
        ) : (
          <Link href="/matches" className="flex h-[52px] items-center justify-center rounded-full bg-ink text-[15px] font-semibold text-white">
            Find real brands
          </Link>
        )}
      </div>
    </div>
  );
}
