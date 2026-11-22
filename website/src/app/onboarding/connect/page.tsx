"use client";

import { useState } from "react";
import { StepFooter, StepTitle } from "@/components/onboarding";
import { Icon, Segmented } from "@/components/ui";
import { useStore } from "@/lib/store";

const ACCOUNTS = [
  { id: "tiktok", name: "TikTok", handle: "@maya.cooks · 63k followers", icon: Icon.tiktok },
  { id: "insta", name: "Instagram", handle: "@maya.cooks · 48.2k followers", icon: Icon.insta },
  { id: "youtube", name: "YouTube", handle: "Maya Cooks · 21k subscribers", icon: Icon.youtube },
] as const;

export default function Connect() {
  const { profile, setProfile } = useStore();
  const [linksText, setLinksText] = useState(profile.links.join("\n"));
  const n = Object.values(profile.accounts).filter(Boolean).length;

  const saveLinks = (text: string) => {
    setLinksText(text);
    setProfile({ links: text.split(/[\s,]+/).filter((l) => /^https?:\/\//.test(l)).slice(0, 5) });
  };

  return (
    <div className="flex flex-col gap-7">
      <StepTitle sub="We read your recent posts to match you with brands. Read-only, and we never post for you.">
        Connect where you <b>post</b>
      </StepTitle>

      <div className="grid gap-3 sm:grid-cols-3">
        {ACCOUNTS.map((a) => {
          const on = profile.accounts[a.id];
          return (
            <div key={a.id} className={`flex flex-col gap-4 rounded-[22px] border p-4 ${on ? "border-ink/15 bg-white shadow-[0_1px_3px_rgba(24,24,27,0.08)]" : "border-line bg-white"}`}>
              <div className="flex items-center gap-3">
                <span className="flex size-[42px] shrink-0 items-center justify-center rounded-xl border border-line bg-white">{a.icon({ size: 20 })}</span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-[15px] font-semibold">{a.name}</span>
                  <span className="text-xs text-muted">{on ? a.handle : "Not connected"}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setProfile({ accounts: { ...profile.accounts, [a.id]: !on } })}
                className={`h-9 rounded-full text-[13px] font-semibold ${on ? "bg-ok-bg text-ok" : "bg-ink text-white hover:bg-ink-2"}`}
              >
                {on ? "Connected" : "Connect"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="grid gap-5 md:grid-cols-[1fr_260px]">
        <div className="flex flex-col gap-2 rounded-[22px] border border-line bg-white p-4">
          <label htmlFor="links" className="text-[13px] font-medium text-ink-3">
            Paste 3 recent post links (YouTube, blog, TikTok). We read them live with You.com.
          </label>
          <textarea
            id="links"
            rows={4}
            value={linksText}
            onChange={(e) => saveLinks(e.target.value)}
            placeholder={"https://youtube.com/watch?v=…\nhttps://…"}
            className="resize-none rounded-[14px] border border-line-2 bg-field px-3.5 py-2.5 text-sm outline-none placeholder:text-[#8A8A93] focus:border-ink"
          />
          {profile.links.length > 0 && <span className="text-xs text-ok-2">{profile.links.length} link{profile.links.length === 1 ? "" : "s"} ready</span>}
        </div>
        <div className="flex flex-col gap-2.5 rounded-[22px] border border-line bg-white p-4">
          <span className="text-sm font-semibold">Match me on</span>
          <Segmented
            full
            value={profile.window}
            onChange={(w) => setProfile({ window: w })}
            options={[
              { value: 7, label: "Last 7 days" },
              { value: 30, label: "Last 30 days" },
            ]}
          />
          <span className="text-xs leading-normal text-muted">Shorter windows favour brands hiring right now.</span>
        </div>
      </div>

      <StepFooter back="/signup" next="/onboarding/niche" nextLabel={n ? `Continue with ${n} account${n === 1 ? "" : "s"}` : "Continue"} />
    </div>
  );
}
