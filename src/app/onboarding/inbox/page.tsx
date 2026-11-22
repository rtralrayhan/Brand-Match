"use client";

import Link from "next/link";
import { Icon, PrimaryLink, Screen, StepHeader } from "@/components/ui";
import { useStore, type Profile } from "@/lib/store";

const OPTIONS: Array<{ id: NonNullable<Profile["inbox"]>; name: string; detail: string }> = [
  { id: "gmail", name: "Gmail", detail: "maya@sample.example" },
  { id: "outlook", name: "Outlook", detail: "Work or personal" },
  { id: "forward", name: "Forward emails instead", detail: "Send offers to check@vetted.example" },
];

export default function InboxSetup() {
  const { profile, setProfile } = useStore();
  return (
    <Screen
      header={<StepHeader back="/onboarding/niche" step={3} />}
      footer={
        <div className="flex flex-col items-center gap-1.5">
          <PrimaryLink href="/matches">See my brand matches</PrimaryLink>
          <Link href="/matches" className="flex h-11 items-center px-3 text-sm font-medium text-ink-3">
            Skip for now
          </Link>
        </div>
      }
    >
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
        {OPTIONS.map((o) => {
          const on = profile.inbox === o.id;
          return (
            <div key={o.id} className={`flex items-center gap-3 rounded-[18px] p-3 ${on ? "bg-soft" : ""}`}>
              {Icon.mail({ size: 20, color: "#3F3F46" })}
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-[15px] font-semibold">{o.name}</span>
                <span className="text-[13px] text-muted">{on && o.id !== "forward" ? `${o.detail} · connected` : o.detail}</span>
              </div>
              <button
                type="button"
                onClick={() => setProfile({ inbox: on ? null : o.id })}
                className={`h-9 shrink-0 rounded-full px-3.5 text-[13px] font-semibold ${on ? "bg-ok-bg text-ok" : "border border-line-2 bg-white"}`}
              >
                {on ? (o.id === "forward" ? "Chosen" : "Connected") : o.id === "forward" ? "Use" : "Connect"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2.5 px-1">
        {["Read-only. We never send, delete or reply.", "Only brand, manager and promo emails are checked.", "Disconnect any time in Settings."].map((t) => (
          <span key={t} className="flex items-center gap-2.5 text-[13px] text-ink-3">
            {Icon.tick({ size: 16, color: "#18794E" })}
            {t}
          </span>
        ))}
      </div>
    </Screen>
  );
}
