"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon, PrimaryLink, Screen, StepHeader } from "@/components/mobile/ui";
import { useStore } from "@/lib/store";

const MAX = 5;
const field =
  "h-[46px] min-w-0 flex-1 rounded-[14px] border bg-field px-3.5 text-[15px] text-ink outline-none placeholder:text-[#8A8A93] focus:border-ink";

const isUrl = (v: string) => {
  try {
    const u = new URL(v.trim());
    return (u.protocol === "https:" || u.protocol === "http:") && u.hostname.includes(".");
  } catch {
    return false;
  }
};

export default function Connect() {
  const { profile, setProfile } = useStore();
  // Keep what's typed (even half-finished) on screen; only valid links go into the profile.
  const [rows, setRows] = useState<string[]>(() => (profile.links.length ? [...profile.links] : ["", "", ""]));

  const update = (next: string[]) => {
    setRows(next);
    setProfile({ links: next.map((v) => v.trim()).filter(isUrl).slice(0, MAX) });
  };

  const ready = profile.links.length;

  return (
    <Screen
      header={<StepHeader back="/signup" step={1} />}
      footer={
        <div className="flex flex-col items-center gap-1.5">
          <PrimaryLink href="/onboarding/niche">{ready ? `Continue with ${ready} video${ready === 1 ? "" : "s"}` : "Continue"}</PrimaryLink>
          {!ready && (
            <Link href="/onboarding/niche" className="flex h-11 items-center px-3 text-sm font-medium text-ink-3">
              Skip for now
            </Link>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-2 px-1">
        <h1 className="m-0 text-[28px] font-normal leading-[1.15] tracking-[-0.025em]">
          Add your recent <b>videos</b>
        </h1>
        <p className="m-0 text-sm leading-normal text-muted">
          Paste links to 3 recent videos from YouTube, TikTok or Instagram. We read them to match you with brands. No account login needed.
        </p>
      </div>

      <div className="flex flex-col gap-2.5 rounded-[22px] border border-line bg-white p-3.5">
        {rows.map((v, i) => {
          const bad = v.trim() !== "" && !isUrl(v);
          return (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  inputMode="url"
                  autoComplete="off"
                  aria-label={`Video link ${i + 1}`}
                  aria-invalid={bad}
                  placeholder={i === 0 ? "https://youtube.com/watch?v=…" : "https://…"}
                  value={v}
                  onChange={(e) => update(rows.map((r, j) => (j === i ? e.target.value : r)))}
                  className={`${field} ${bad ? "border-bad" : "border-line-2"}`}
                />
                {rows.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Remove link ${i + 1}`}
                    onClick={() => update(rows.filter((_, j) => j !== i))}
                    className="flex size-11 shrink-0 items-center justify-center rounded-full text-lg leading-none text-muted hover:bg-soft"
                  >
                    ×
                  </button>
                )}
              </div>
              {bad && <span className="px-1 text-xs text-bad">That doesn&apos;t look like a link. Start with https://</span>}
            </div>
          );
        })}

        {rows.length < MAX && (
          <button type="button" onClick={() => setRows([...rows, ""])} className="flex h-10 items-center gap-1.5 self-start px-1 text-[13px] font-semibold text-ink-3">
            {Icon.plus({ size: 14 })} Add another link
          </button>
        )}

        {ready > 0 && (
          <span className="flex items-center gap-1.5 px-1 text-xs text-ok-2">
            {Icon.tick({ size: 14, color: "#18794E" })}
            {ready} link{ready === 1 ? "" : "s"} ready, read live with You.com
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        <span className="px-1 text-sm font-semibold">Brand activity</span>
        <p className="m-0 px-1 text-[13px] leading-normal text-muted">Start with the last 7 days. You can expand to 30 days from your matches.</p>
      </div>

      <p className="m-0 px-1 text-xs leading-normal text-muted">No videos yet? Skip this and we&apos;ll match you on the niches you pick next.</p>
    </Screen>
  );
}
