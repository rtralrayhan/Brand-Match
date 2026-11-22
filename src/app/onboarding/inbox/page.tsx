"use client";

import Link from "next/link";
import { Icon, PrimaryLink, Screen, StepHeader } from "@/components/ui";
import { connectGmailHref, GmailStatusNote } from "@/components/gmail";
import { useStore } from "@/lib/store";

export default function InboxSetup() {
  const { account, disconnectGmail, restartSearch } = useStore();
  const gmail = account?.gmail;

  return (
    <Screen
      header={<StepHeader back="/onboarding/niche" step={3} />}
      footer={
        <div className="flex flex-col items-center gap-1.5">
          <PrimaryLink href="/matches" onClick={restartSearch}>See my brand matches</PrimaryLink>
          <Link href="/matches" onClick={restartSearch} className="flex h-11 items-center px-3 text-sm font-medium text-ink-3">
            {gmail?.connected ? "Continue" : "Skip for now"}
          </Link>
        </div>
      }
    >
      <GmailStatusNote />

      <div
        className="flex flex-col items-center gap-3.5 rounded-[26px] border border-[#D9EDE2] px-[18px] py-[22px] text-center"
        style={{ background: "radial-gradient(90% 75% at 50% 0%, rgba(43,163,106,0.16) 0%, rgba(255,255,255,0) 70%), #FFFFFF" }}
      >
        <div className="flex size-16 items-center justify-center rounded-[20px] border border-line bg-white shadow-[0_8px_20px_rgba(24,24,27,0.08)]">
          {Icon.shield({ size: 30, color: "#136B43", width: 1.8 })}
        </div>
        <h1 className="m-0 text-[26px] font-normal leading-[1.2] tracking-[-0.025em]">
          Check every <b>brand email</b>
        </h1>
        <p className="m-0 text-sm leading-normal text-muted">Trust Score flags fake senders, fake managers, lawsuits and scam reports before you reply.</p>
      </div>

      <div className="flex flex-col gap-0.5 rounded-3xl border border-line bg-white p-1.5">
        <div className={`flex items-center gap-3 rounded-[18px] p-3 ${gmail?.connected ? "bg-soft" : ""}`}>
          {Icon.mail({ size: 20, color: "#3F3F46" })}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-[15px] font-semibold">Gmail</span>
            <span className="truncate text-[13px] text-muted">
              {gmail?.connected ? `${gmail.email} · connected` : "Read-only. Brand emails only."}
            </span>
          </div>
          {gmail?.connected ? (
            <button type="button" onClick={disconnectGmail} className="h-9 shrink-0 rounded-full bg-ok-bg px-3.5 text-[13px] font-semibold text-ok">
              Connected
            </button>
          ) : (
            // A plain link: the browser must leave the app for Google's sign-in page.
            <a href={connectGmailHref("/onboarding/inbox")} className="flex h-9 shrink-0 items-center rounded-full bg-ink px-3.5 text-[13px] font-semibold text-white">
              Connect
            </a>
          )}
        </div>

        <div className="flex items-center gap-3 rounded-[18px] p-3 opacity-50">
          {Icon.mail({ size: 20, color: "#3F3F46" })}
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="text-[15px] font-semibold">Outlook</span>
            <span className="text-[13px] text-muted">Work or personal</span>
          </div>
          <span className="shrink-0 rounded-full bg-chip px-2.5 py-1 text-[11px] font-medium text-ink-3">Soon</span>
        </div>

        <Link href="/inbox/check" className="flex items-center gap-3 rounded-[18px] p-3">
          {Icon.plus({ size: 20, color: "#3F3F46" })}
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="text-[15px] font-semibold">Paste an email instead</span>
            <span className="text-[13px] text-muted">Check one offer without connecting</span>
          </div>
          {Icon.arrow({ size: 16 })}
        </Link>
      </div>

      <div className="flex flex-col gap-2.5 px-1">
        {["Read-only. We never send, delete or reply.", "Only brand, manager and promo emails are checked.", "Disconnect any time."].map((t) => (
          <span key={t} className="flex items-center gap-2.5 text-[13px] text-ink-3">
            {Icon.tick({ size: 16, color: "#18794E" })}
            {t}
          </span>
        ))}
      </div>
    </Screen>
  );
}
