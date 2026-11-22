"use client";

import Link from "next/link";
import { BAND, Icon } from "@/components/desktop/ui";
import { useStore } from "@/lib/store";
import type { Band } from "@/lib/types";

const CHECKS = [
  { name: "Sender identity", detail: "Do the sender domain and links match the brand's real site?", max: 30 },
  { name: "Scam reports", detail: "Public reports about the domain or offer, past year", max: 25 },
  { name: "Lawsuits and court cases", detail: "Including unpaid-creator complaints", max: 20 },
  { name: "Manager check", detail: "Is the manager or agency real?", max: 15 },
  { name: "Red flags in the email", detail: "Sign-in links, upfront fees, urgency, downloads", max: 10 },
];

export default function InboxHome() {
  const { account, emails, gmailEmails, trust } = useStore();
  const list = account?.gmail.connected ? [...emails.filter((e) => e.id.startsWith("pasted-")), ...(gmailEmails ?? [])] : emails;
  const count = (b: Band) => list.filter((e) => trust[e.id]?.band === b).length;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10 lg:px-10">
      <div className="flex flex-col gap-2">
        <h2 className="m-0 text-[28px] font-normal tracking-[-0.025em]">
          Pick an email to see its <b>Trust Score</b>
        </h2>
        <p className="m-0 text-[15px] text-muted">Each score checks the sender, scam reports, lawsuits and court cases, and the manager, using this week&apos;s web.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {(["risky", "check", "safe"] as Band[]).map((b) => (
          <div key={b} className="flex flex-col gap-0.5 rounded-[20px] border p-4" style={{ background: BAND[b].bg, borderColor: BAND[b].border, color: BAND[b].fg }}>
            <span className="text-[28px] font-semibold tracking-[-0.02em]">{count(b)}</span>
            <span className="text-[13px] font-medium">{BAND[b].label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-0.5 rounded-[22px] border border-line bg-white p-2">
        <span className="px-3 pb-1.5 pt-3 text-[15px] font-semibold">How we score it</span>
        {CHECKS.map((c) => (
          <div key={c.name} className="flex items-center gap-3 rounded-[14px] p-3">
            <span className="flex flex-1 flex-col gap-0.5">
              <span className="text-sm font-semibold">{c.name}</span>
              <span className="text-[13px] text-ink-4">{c.detail}</span>
            </span>
            <span className="text-sm font-semibold text-ink-3">{c.max} pts</span>
          </div>
        ))}
        <span className="px-3 pb-3 pt-1 text-xs text-muted">80 to 100 Looks safe · 50 to 79 Check first · under 50 Risky</span>
      </div>

      <Link href="/inbox/check" className="flex h-12 w-fit items-center gap-2 rounded-full bg-ink px-6 text-[15px] font-semibold text-white hover:bg-ink-2">
        {Icon.plus({ size: 16, color: "#fff" })} Check an email
      </Link>
    </div>
  );
}
