"use client";

import { Icon, PrimaryButton, PrimaryLink, Screen, StepHeader } from "@/components/mobile/ui";
import { useStore } from "@/lib/store";

const ALL = ["Food", "Home and kitchen", "Fitness", "Beauty", "Parenting", "Travel", "Tech", "Fashion", "Finance", "Gaming"];
const field = "h-[46px] rounded-[14px] border border-line-2 bg-field px-3 text-[15px] text-ink outline-none focus:border-ink";

export default function Niche() {
  const { profile, setProfile } = useStore();
  const picked = profile.niches;
  const toggle = (n: string) => {
    if (picked.includes(n)) setProfile({ niches: picked.filter((p) => p !== n) });
    else if (picked.length < 3) setProfile({ niches: [...picked, n] });
  };

  return (
    <Screen header={<StepHeader back="/onboarding/connect" step={2} />} footer={picked.length ? <PrimaryLink href="/onboarding/inbox">Continue</PrimaryLink> : <PrimaryButton disabled>Pick at least one</PrimaryButton>}
    >
      <div className="flex flex-col gap-2 px-1">
        <h1 className="m-0 text-[28px] font-normal leading-[1.15] tracking-[-0.025em]">
          What do you <b>make</b>?
        </h1>
        <p className="m-0 text-sm leading-normal text-muted">Pick up to 3. We refine this from your posts.</p>
      </div>

      <div
        className="flex items-start gap-2.5 rounded-[18px] border border-[#E4E1F5] px-3.5 py-3"
        style={{ background: "radial-gradient(120% 120% at 100% 0%, rgba(124,92,230,0.16) 0%, rgba(255,255,255,0) 60%), #FFFFFF" }}
      >
        <span className="mt-px">{Icon.sparkle({ color: "#5B47B8" })}</span>
        <span className="text-[13px] leading-[1.45] text-ink-2">
          {profile.links.length
            ? `We'll read your ${profile.links.length} video${profile.links.length === 1 ? "" : "s"} to find your exact niche.`
            : "Add video links on the last step and we'll find your exact niche from them."}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {ALL.map((n) => {
          const on = picked.includes(n);
          return (
            <button
              key={n}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(n)}
              className={`h-10 rounded-full border px-4 text-sm font-medium ${on ? "border-ink bg-ink text-white" : "border-line-2 bg-white text-ink-3"}`}
            >
              {n}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3.5 rounded-[22px] border border-line bg-white p-4">
        <span className="text-[15px] font-semibold">Where are you based?</span>
        <label className="flex flex-col gap-1.5 text-[13px] font-medium text-ink-3">
          Country
          <select className={field} value={profile.country} onChange={(e) => setProfile({ country: e.target.value })}>
            {["United States", "Canada", "United Kingdom", "India", "Bangladesh"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] font-medium text-ink-3">
          City
          <input className={`${field} px-3.5`} placeholder="e.g. Brooklyn, NY" value={profile.city} onChange={(e) => setProfile({ city: e.target.value })} />
        </label>
        <button type="button" aria-pressed={profile.local} onClick={() => setProfile({ local: !profile.local })} className="flex items-center gap-3 py-1 text-left">
          <span className="flex flex-1 flex-col gap-0.5">
            <span className="text-sm font-medium">Include local businesses</span>
            <span className="text-xs text-muted">Restaurants and shops near you that hire creators</span>
          </span>
          <span className={`flex h-7 w-[46px] shrink-0 rounded-full p-[3px] ${profile.local ? "justify-end bg-ink" : "justify-start bg-[#D4D4D8]"}`}>
            <span className="size-[22px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)]" />
          </span>
        </button>
      </div>
    </Screen>
  );
}
