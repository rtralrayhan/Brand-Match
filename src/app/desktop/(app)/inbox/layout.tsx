"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { connectGmailHref, GmailStatusNote } from "@/components/gmail";
import { BAND, Icon, SamplePill, Segmented, Skeleton } from "@/components/desktop/ui";
import { useStore } from "@/lib/store";
import type { Band, EmailInput } from "@/lib/types";

export default function InboxLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { account, emails, gmailEmails, gmailLoading, gmailError, loadGmail, disconnectGmail, trust, checking, checkEmail } = useStore();
  const [filter, setFilter] = useState<"all" | Band>("all");
  const atRoot = path === "/inbox";
  const gmail = account?.gmail;
  const connected = !!gmail?.connected;

  // Connected: read Gmail once.
  useEffect(() => {
    if (connected && gmailEmails === null && !gmailLoading) loadGmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  // Connected: your pasted emails plus Gmail. Not connected: pasted plus the demo emails.
  const list: EmailInput[] = useMemo(() => {
    const pasted = emails.filter((e) => e.id.startsWith("pasted-"));
    if (connected) return [...pasted, ...(gmailEmails ?? [])];
    return emails;
  }, [connected, emails, gmailEmails]);

  // Score every email in the list once, in parallel.
  useEffect(() => {
    list.forEach((e) => {
      if (!trust[e.id] && !checking[e.id]) checkEmail(e);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

  const count = (b: Band) => list.filter((e) => trust[e.id]?.band === b).length;
  const shown = list.filter((e) => filter === "all" || trust[e.id]?.band === filter);
  const modes = list.map((e) => trust[e.id]?.mode).filter(Boolean);
  const mode = modes.length ? (modes.every((m) => m === "live") ? "live" : "sample") : undefined;

  return (
    <div className="flex min-h-[calc(100dvh-56px)] md:h-dvh">
      {/* Email list: always on desktop, only at /inbox on small screens */}
      <section className={`${atRoot ? "flex" : "hidden"} w-full shrink-0 flex-col border-r border-line bg-white md:flex md:w-[400px]`}>
        <div className="flex flex-col gap-4 border-b border-line p-5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="m-0 text-[26px] font-semibold tracking-[-0.025em]">Trust inbox</h1>
              <span className="truncate text-sm text-muted">{connected ? `${gmail?.email} · last 30 days` : `${list.length} demo emails`}</span>
            </div>
            {mode && <SamplePill mode={mode} />}
          </div>
          <GmailStatusNote />
          {account && !connected && (
            <div
              className="flex flex-col gap-3 rounded-[18px] border border-[#D9EDE2] p-3.5"
              style={{ background: "radial-gradient(90% 90% at 100% 0%, rgba(43,163,106,0.14) 0%, rgba(255,255,255,0) 70%), #FFFFFF" }}
            >
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-line bg-white">{Icon.mail({ size: 18, color: "#136B43" })}</div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold">Check your real inbox</span>
                  <span className="text-[13px] leading-snug text-muted">Connect Gmail, read-only. We score brand, manager and promo emails from the last 30 days.</span>
                </div>
              </div>
              {/* A plain link: the browser must leave the app for Google's sign-in page. */}
              <a href={connectGmailHref("/inbox")} className="flex h-10 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white hover:bg-ink-2">
                Connect Gmail
              </a>
            </div>
          )}
          {connected && (
            <div className="flex items-center justify-between gap-2">
              <button type="button" onClick={() => loadGmail(true)} disabled={gmailLoading} className="flex items-center gap-1.5 text-[13px] text-muted hover:text-ink disabled:opacity-50">
                {Icon.refresh({ size: 14 })} {gmailLoading ? "Reading Gmail…" : "Refresh from Gmail"}
              </button>
              <button type="button" onClick={disconnectGmail} className="text-[13px] font-medium text-ink-3 hover:text-ink">
                Disconnect
              </button>
            </div>
          )}
          <Segmented
            full
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: `All ${list.length}` },
              { value: "risky", label: `Risky ${count("risky")}` },
              { value: "check", label: `Check ${count("check")}` },
              { value: "safe", label: `Safe ${count("safe")}` },
            ]}
          />
        </div>

        <div className="scroll-area flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
          {connected &&
            gmailLoading &&
            gmailEmails === null &&
            [0, 1, 2].map((k) => (
              <div key={k} className="flex items-center gap-3 p-3">
                <Skeleton className="size-[46px] rounded-[14px]" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-3.5 w-1/2" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
            ))}
          {shown.map((e) => {
            const t = trust[e.id];
            const b = t ? BAND[t.band] : null;
            const on = path === `/inbox/${e.id}`;
            const why = t?.checks.filter((c) => c.tone !== "green").sort((x, y) => x.points / x.max - y.points / y.max)[0]?.finding ?? t?.checks[0]?.finding;
            return (
              <Link key={e.id} href={`/inbox/${e.id}`} aria-current={on ? "page" : undefined} className={`flex items-center gap-3 rounded-[16px] p-3 ${on ? "bg-soft ring-1 ring-line-2" : "hover:bg-soft"}`}>
                <div className={`flex size-[46px] shrink-0 items-center justify-center rounded-[14px] ${!t ? "skeleton" : ""}`} style={b ? { background: b.bg, color: b.fg } : undefined}>
                  {t ? <span className="text-[17px] font-bold leading-none">{t.score}</span> : null}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
                  <div className="flex justify-between gap-2">
                    <span className="truncate text-sm font-semibold">{e.fromName}</span>
                    <span className="shrink-0 text-xs text-muted">{e.time ?? "Now"}</span>
                  </div>
                  <span className="truncate text-sm text-ink-2">{e.subject}</span>
                  <span className="line-clamp-1 text-xs font-medium" style={{ color: b?.fg ?? "#6B6B74" }}>
                    {t ? `${b!.label} · ${why}` : checking[e.id] ? "Checking with You.com…" : "Click to check"}
                  </span>
                </div>
              </Link>
            );
          })}
          {connected && gmailEmails !== null && !list.length && (
            <p className="p-4 text-center text-sm leading-relaxed text-muted">No brand-deal emails in the last 30 days. When a sponsor writes, it shows up here.</p>
          )}
          {gmailError && <p className="p-4 text-center text-sm text-bad">{gmailError}</p>}
          {!!list.length && !shown.length && <p className="p-4 text-center text-sm text-muted">Nothing in this filter.</p>}
        </div>

        <div className="border-t border-line p-4">
          <Link href="/inbox/check" className={`flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold ${path === "/inbox/check" ? "bg-ink text-white" : "border border-line-2 bg-white hover:bg-soft"}`}>
            {Icon.plus({ size: 16, color: path === "/inbox/check" ? "#fff" : "#18181B" })} Check an email
          </Link>
        </div>
      </section>

      {/* Detail pane */}
      <section className={`${atRoot ? "hidden md:flex" : "flex"} scroll-area min-w-0 flex-1 flex-col overflow-y-auto`}>{children}</section>
    </div>
  );
}
