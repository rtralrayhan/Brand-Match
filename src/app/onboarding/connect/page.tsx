"use client";

import { useState } from "react";
import { Icon, PrimaryLink, Screen, StepHeader } from "@/components/ui";
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
    <Screen
      header={<StepHeader back="/signup" step={1} />}
      footer={<PrimaryLink href="/onboarding/niche">{n ? `Continue with ${n} account${n === 1 ? "" : "s"}` : "Continue"}</PrimaryLink>}
    >
      <div className="flex flex-col gap-2 px-1">
        <h1 className="m-0 text-[28px] font-normal leading-[1.15] tracking-[-0.025em]">
          Connect where you <b>post</b>
        </h1>
        <p className="m-0 text-sm leading-normal text-muted">We read your recent posts to match you with brands. Read-only, and we never post for you.</p>
      </div>

      <div className="flex flex-col gap-0.5 rounded-3xl border border-line bg-white p-1.5">
        {ACCOUNTS.map((a) => {
          const on = profile.accounts[a.id];
          return (
            <div key={a.id} className={`flex items-center gap-3 rounded-[18px] p-3 ${on ? "bg-soft" : ""}`}>
              <div className="flex size-[42px] shrink-0 items-center justify-center rounded-xl border border-line bg-white">{a.icon({ size: 20 })}</div>
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-[15px] font-semibold">{a.name}</span>
                <span className="text-[13px] text-muted">{on ? a.handle : "Not connected"}</span>
              </div>
              <button
                type="button"
                onClick={() => setProfile({ accounts: { ...profile.accounts, [a.id]: !on } })}
                className={`h-9 rounded-full px-3.5 text-[13px] font-semibold ${on ? "bg-ok-bg text-ok" : "bg-ink text-white"}`}
              >
                {on ? "Connected" : "Connect"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2.5">
        <span className="px-1 text-sm font-semibold">Brand activity</span>
        <p className="m-0 px-1 text-[13px] leading-normal text-muted">Start with the last 7 days. You can expand to 30 days from your matches.</p>
      </div>

      <div className="flex flex-col gap-2 rounded-[20px] border border-line bg-white p-3.5">
        <label htmlFor="links" className="text-[13px] font-medium text-ink-3">
          Paste 3 recent post links (YouTube, blog, TikTok). We read them live with You.com.
        </label>
        <textarea
          id="links"
          rows={3}
          value={linksText}
          onChange={(e) => saveLinks(e.target.value)}
          placeholder={"https://youtube.com/watch?v=…\nhttps://…"}
          className="resize-none rounded-[14px] border border-line-2 bg-field px-3.5 py-2.5 text-sm outline-none placeholder:text-[#8A8A93] focus:border-ink"
        />
        {profile.links.length > 0 && <span className="text-xs text-ok-2">{profile.links.length} link{profile.links.length === 1 ? "" : "s"} ready</span>}
      </div>
    </Screen>
  );
}
