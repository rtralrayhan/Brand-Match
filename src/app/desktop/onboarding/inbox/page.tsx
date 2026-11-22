"use client";

import Link from "next/link";
import { connectGmailHref, GmailStatusNote } from "@/components/gmail";
import { StepFooter, StepTitle } from "@/components/desktop/onboarding";
import { Icon } from "@/components/desktop/ui";
import { useStore } from "@/lib/store";

export default function InboxSetup() {
  const { account, disconnectGmail, restartSearch } = useStore();
  const gmail = account?.gmail;

  return (
    <div className="flex flex-col gap-7">
      <StepTitle sub="Trust Score flags fake senders, fake managers, lawsuits and scam reports before you reply.">
        Check every <b>brand email</b>
      </StepTitle>

      <GmailStatusNote />

      <div className="grid gap-5 md:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-0.5 rounded-3xl border border-line bg-white p-1.5">
          <div className={`flex items-center gap-3 rounded-[18px] p-3.5 ${gmail?.connected ? "bg-soft" : ""}`}>
            {Icon.mail({ size: 20, color: "#3F3F46" })}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-[15px] font-semibold">Gmail</span>
              <span className="truncate text-[13px] text-muted">{gmail?.connected ? `${gmail.email} · connected` : "Read-only. Brand emails only."}</span>
            </div>
            {gmail?.connected ? (
              <button type="button" onClick={disconnectGmail} className="h-9 shrink-0 rounded-full border border-line-2 bg-white px-4 text-[13px] font-semibold text-ink-3 hover:bg-soft">
                Disconnect
              </button>
            ) : (
              // A plain link: the browser must leave the app for Google's sign-in page.
              <a href={connectGmailHref("/onboarding/inbox")} className="flex h-9 shrink-0 items-center rounded-full bg-ink px-4 text-[13px] font-semibold text-white hover:bg-ink-2">
                Connect
              </a>
            )}
          </div>

          <div className="flex items-center gap-3 rounded-[18px] p-3.5 opacity-50">
            {Icon.mail({ size: 20, color: "#3F3F46" })}
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-[15px] font-semibold">Outlook</span>
              <span className="text-[13px] text-muted">Work or personal</span>
            </div>
            <span className="shrink-0 rounded-full bg-chip px-2.5 py-1 text-[11px] font-medium text-ink-3">Soon</span>
          </div>

          <Link href="/inbox/check" className="flex items-center gap-3 rounded-[18px] p-3.5 hover:bg-soft">
            {Icon.plus({ size: 20, color: "#3F3F46" })}
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-[15px] font-semibold">Paste an email instead</span>
              <span className="text-[13px] text-muted">Check one offer without connecting</span>
            </div>
            {Icon.arrow({ size: 16 })}
          </Link>
        </div>

        <div
          className="flex flex-col gap-3 self-start rounded-3xl border border-[#D9EDE2] p-5"
          style={{ background: "radial-gradient(90% 75% at 50% 0%, rgba(43,163,106,0.16) 0%, rgba(255,255,255,0) 70%), #FFFFFF" }}
        >
          <span className="flex size-12 items-center justify-center rounded-2xl border border-line bg-white shadow-[0_8px_20px_rgba(24,24,27,0.08)]">
            {Icon.shield({ size: 24, color: "#136B43", width: 1.8 })}
          </span>
          {["Read-only. We never send, delete or reply.", "Only brand, manager and promo emails are checked.", "Disconnect any time in your profile."].map((t) => (
            <span key={t} className="flex items-start gap-2.5 text-[13px] leading-snug text-ink-3">
              <span className="mt-px">{Icon.tick({ size: 15, color: "#18794E" })}</span>
              {t}
            </span>
          ))}
        </div>
      </div>

      <StepFooter back="/onboarding/niche" next="/matches" nextLabel="See my brand matches" skip={gmail?.connected ? undefined : "/matches"} onNext={restartSearch} />
    </div>
  );
}
