"use client";

import { StepFooter, StepTitle } from "@/components/onboarding";
import { Icon } from "@/components/ui";
import { useStore, type Profile } from "@/lib/store";

const OPTIONS: Array<{ id: NonNullable<Profile["inbox"]>; name: string; detail: string }> = [
  { id: "gmail", name: "Gmail", detail: "maya@sample.example" },
  { id: "outlook", name: "Outlook", detail: "Work or personal" },
  { id: "forward", name: "Forward emails instead", detail: "Send offers to check@vetted.example" },
];

export default function InboxSetup() {
  const { profile, setProfile } = useStore();
  return (
    <div className="flex flex-col gap-7">
      <StepTitle sub="Trust Score flags fake senders, fake managers, lawsuits and scam reports before you reply.">
        Check every <b>brand email</b>
      </StepTitle>

      <div className="grid gap-5 md:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-0.5 rounded-3xl border border-line bg-white p-1.5">
          {OPTIONS.map((o) => {
            const on = profile.inbox === o.id;
            const detail = on && o.id === "gmail" ? profile.email : o.detail;
            return (
              <div key={o.id} className={`flex items-center gap-3 rounded-[18px] p-3.5 ${on ? "bg-soft" : ""}`}>
                {Icon.mail({ size: 20, color: "#3F3F46" })}
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="text-[15px] font-semibold">{o.name}</span>
                  <span className="text-[13px] text-muted">{on && o.id !== "forward" ? `${detail} · connected` : detail}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setProfile({ inbox: on ? null : o.id })}
                  className={`h-9 shrink-0 rounded-full px-4 text-[13px] font-semibold ${on ? "bg-ok-bg text-ok" : "border border-line-2 bg-white hover:bg-soft"}`}
                >
                  {on ? (o.id === "forward" ? "Chosen" : "Connected") : o.id === "forward" ? "Use" : "Connect"}
                </button>
              </div>
            );
          })}
        </div>

        <div
          className="flex flex-col gap-3 rounded-3xl border border-[#D9EDE2] p-5"
          style={{ background: "radial-gradient(90% 75% at 50% 0%, rgba(43,163,106,0.16) 0%, rgba(255,255,255,0) 70%), #FFFFFF" }}
        >
          <span className="flex size-12 items-center justify-center rounded-2xl border border-line bg-white shadow-[0_8px_20px_rgba(24,24,27,0.08)]">
            {Icon.shield({ size: 24, color: "#136B43", width: 1.8 })}
          </span>
          {["Read-only. We never send, delete or reply.", "Only brand, manager and promo emails are checked.", "Disconnect any time in Settings."].map((t) => (
            <span key={t} className="flex items-start gap-2.5 text-[13px] leading-snug text-ink-3">
              <span className="mt-px">{Icon.tick({ size: 15, color: "#18794E" })}</span>
              {t}
            </span>
          ))}
        </div>
      </div>

      <StepFooter back="/onboarding/niche" next="/matches" nextLabel="See my brand matches" skip="/matches" />
    </div>
  );
}
