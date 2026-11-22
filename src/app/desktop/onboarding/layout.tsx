"use client";

import { usePathname } from "next/navigation";
import { Icon, Logo } from "@/components/desktop/ui";

const STEPS = [
  { path: "/onboarding/connect", title: "Add your videos", detail: "Links to 3 recent videos" },
  { path: "/onboarding/niche", title: "Niche and location", detail: "What you make and where" },
  { path: "/onboarding/inbox", title: "Connect your inbox", detail: "Check every brand email" },
];

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const current = Math.max(0, STEPS.findIndex((s) => path.startsWith(s.path)));

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-muted">Step {current + 1} of 3</span>
          </div>
        </div>
        <div className="h-1 bg-line">
          <div className="h-1 bg-ink transition-all" style={{ width: `${((current + 1) / 3) * 100}%` }} />
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-10 px-6 py-10 lg:grid-cols-[260px_1fr]">
        <ol className="m-0 hidden list-none flex-col gap-1 p-0 lg:flex" aria-label="Setup steps">
          {STEPS.map((s, i) => {
            const done = i < current;
            const on = i === current;
            return (
              <li key={s.path} aria-current={on ? "step" : undefined} className={`flex items-start gap-3 rounded-2xl p-3 ${on ? "bg-white shadow-[0_1px_3px_rgba(24,24,27,0.08)]" : ""}`}>
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold ${
                    done ? "bg-ok-bg text-ok" : on ? "bg-ink text-white" : "bg-chip text-muted"
                  }`}
                >
                  {done ? Icon.tick({ size: 14, color: "#136B43" }) : i + 1}
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className={`text-sm font-semibold ${on || done ? "text-ink" : "text-muted"}`}>{s.title}</span>
                  <span className="text-xs text-muted">{s.detail}</span>
                </span>
              </li>
            );
          })}
        </ol>
        <div className="w-full max-w-3xl">{children}</div>
      </div>
    </div>
  );
}
