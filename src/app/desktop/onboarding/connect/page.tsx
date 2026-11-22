"use client";

import { useState } from "react";
import { StepFooter, StepTitle } from "@/components/desktop/onboarding";
import { Icon, Segmented } from "@/components/desktop/ui";
import { useStore } from "@/lib/store";

const MAX = 5;
const field =
  "h-12 min-w-0 flex-1 rounded-[14px] border bg-field px-3.5 text-[15px] text-ink outline-none placeholder:text-[#8A8A93] focus:border-ink";

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
    <div className="flex flex-col gap-7">
      <StepTitle sub="Paste links to 3 recent videos from YouTube, TikTok or Instagram. We read them to match you with brands. No account login needed.">
        Add your recent <b>videos</b>
      </StepTitle>

      <div className="grid gap-5 md:grid-cols-[1fr_260px]">
        <div className="flex flex-col gap-2.5 rounded-[22px] border border-line bg-white p-4">
          {rows.map((v, i) => {
            const bad = v.trim() !== "" && !isUrl(v);
            return (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 shrink-0 text-center text-xs font-semibold text-muted">{i + 1}</span>
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
                {bad && <span className="pl-7 text-xs text-bad">That doesn&apos;t look like a link. Start with https://</span>}
              </div>
            );
          })}

          <div className="flex flex-wrap items-center justify-between gap-2 pl-7">
            {rows.length < MAX ? (
              <button type="button" onClick={() => setRows([...rows, ""])} className="flex h-10 items-center gap-1.5 text-[13px] font-semibold text-ink-3 hover:text-ink">
                {Icon.plus({ size: 14 })} Add another link
              </button>
            ) : (
              <span />
            )}
            {ready > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-ok-2">
                {Icon.tick({ size: 14, color: "#18794E" })}
                {ready} link{ready === 1 ? "" : "s"} ready, read live with You.com
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2.5 self-start rounded-[22px] border border-line bg-white p-4">
          <span className="text-sm font-semibold">Brand activity from</span>
          <Segmented
            full
            value={profile.window}
            onChange={(w) => setProfile({ window: w })}
            options={[
              { value: 7, label: "Last 7 days" },
              { value: 30, label: "Last 30 days" },
            ]}
          />
          <span className="text-xs leading-normal text-muted">Start with 7 days. You can switch to 30 from your matches.</span>
        </div>
      </div>

      <p className="m-0 text-[13px] leading-normal text-muted">No videos yet? Skip this and we&apos;ll match you on the niches you pick next.</p>

      <StepFooter
        back="/signup"
        next="/onboarding/niche"
        nextLabel={ready ? `Continue with ${ready} video${ready === 1 ? "" : "s"}` : "Continue"}
        skip={ready ? undefined : "/onboarding/niche"}
      />
    </div>
  );
}
