"use client";

import { StepFooter, StepTitle } from "@/components/desktop/onboarding";
import { fieldClass, Icon, Toggle } from "@/components/desktop/ui";
import { useStore } from "@/lib/store";

const ALL = ["Food", "Home and kitchen", "Fitness", "Beauty", "Parenting", "Travel", "Tech", "Fashion", "Finance", "Gaming"];

export default function Niche() {
  const { profile, setProfile } = useStore();
  const picked = profile.niches;
  const toggle = (n: string) => {
    if (picked.includes(n)) setProfile({ niches: picked.filter((p) => p !== n) });
    else if (picked.length < 3) setProfile({ niches: [...picked, n] });
  };

  return (
    <div className="flex flex-col gap-7">
      <StepTitle sub="Pick up to 3. We refine this from your posts.">
        What do you <b>make</b>?
      </StepTitle>

      <div
        className="flex items-start gap-2.5 rounded-[18px] border border-[#E4E1F5] px-4 py-3.5"
        style={{ background: "radial-gradient(120% 120% at 100% 0%, rgba(124,92,230,0.16) 0%, rgba(255,255,255,0) 60%), #FFFFFF" }}
      >
        <span className="mt-px">{Icon.sparkle({ color: "#5B47B8" })}</span>
        <span className="text-sm leading-[1.45] text-ink-2">
          {profile.links.length
            ? `We'll read your ${profile.links.length} video${profile.links.length === 1 ? "" : "s"} to find your exact niche.`
            : "Add video links on the first step and we'll find your exact niche from them."}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-sm text-muted">{picked.length} of 3 picked</span>
        <div className="flex flex-wrap gap-2">
          {ALL.map((n) => {
            const on = picked.includes(n);
            const full = !on && picked.length >= 3;
            return (
              <button
                key={n}
                type="button"
                aria-pressed={on}
                disabled={full}
                onClick={() => toggle(n)}
                className={`h-10 rounded-full border px-4 text-sm font-medium transition disabled:opacity-40 ${on ? "border-ink bg-ink text-white" : "border-line-2 bg-white text-ink-3 hover:border-ink-4"}`}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-[22px] border border-line bg-white p-5">
        <span className="text-[15px] font-semibold">Where are you based?</span>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-[13px] font-medium text-ink-3">
            Country
            <select className={fieldClass} value={profile.country} onChange={(e) => setProfile({ country: e.target.value })}>
              {["United States", "Canada", "United Kingdom", "India", "Bangladesh"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] font-medium text-ink-3">
            City
            <input className={fieldClass} placeholder="e.g. Brooklyn, NY" value={profile.city} onChange={(e) => setProfile({ city: e.target.value })} />
          </label>
        </div>
        <Toggle on={profile.local} onClick={() => setProfile({ local: !profile.local })} label="Include local businesses" detail="Restaurants and shops near you that hire creators" />
      </div>

      <StepFooter back="/onboarding/connect" next="/onboarding/inbox" nextLabel="Continue" blocked={picked.length ? undefined : "Pick at least one"} />
    </div>
  );
}
