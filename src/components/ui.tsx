"use client";

import Link from "next/link";
import type { Band, Brand, Mode, Source, Tone } from "@/lib/types";

/* ---------- Icons (stroke icons from the design canvas) ---------- */

type IconProps = { size?: number; color?: string; width?: number; className?: string };
const svg = (paths: React.ReactNode, { size = 18, color = "currentColor", width = 2, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
    {paths}
  </svg>
);

export const Icon = {
  logo: (p: IconProps = {}) => svg(<path d="M4 6l8 13 8-13" />, { width: 2.6, ...p }),
  back: (p: IconProps = {}) => svg(<path d="M15 5l-7 7 7 7" />, { width: 2.2, ...p }),
  arrow: (p: IconProps = {}) => svg(<path d="M5 12h14M13 6l6 6-6 6" />, { width: 2.2, ...p }),
  chevron: (p: IconProps = {}) => svg(<path d="M9 5l7 7-7 7" />, { width: 2.2, ...p }),
  star: (p: IconProps = {}) => svg(<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z" />, p),
  shield: (p: IconProps = {}) => svg(<><path d="M12 3l7 3v5c0 4.6-3 8.4-7 10-4-1.6-7-5.4-7-10V6z" /><path d="M9 12l2 2 4-4" /></>, p),
  sparkle: (p: IconProps = {}) => svg(<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />, p),
  dollar: (p: IconProps = {}) => svg(<path d="M12 3v18M16.5 7.5c0-1.7-2-3-4.5-3s-4.5 1.3-4.5 3.2c0 4.3 9 2.3 9 6.6 0 1.9-2 3.2-4.5 3.2s-4.5-1.3-4.5-3" />, p),
  people: (p: IconProps = {}) => svg(<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.8a3.5 3.5 0 010 6.4M18.5 14.4c1.8.8 3 2.9 3 5.6" /></>, p),
  check: (p: IconProps = {}) => svg(<><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.7 2.7L16 9.8" /></>, p),
  tick: (p: IconProps = {}) => svg(<path d="M5 12.5l4.5 4.5L19 7.5" />, { width: 2.2, ...p }),
  globe: (p: IconProps = {}) => svg(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" /></>, { width: 1.8, ...p }),
  list: (p: IconProps = {}) => svg(<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />, p),
  cards: (p: IconProps = {}) => svg(<><rect x="6.5" y="4" width="11" height="16" rx="2.5" /><path d="M3 7.5v9M21 7.5v9" /></>, p),
  heart: (p: IconProps = {}) => svg(<path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" />, p),
  x: (p: IconProps = {}) => svg(<path d="M6 6l12 12M18 6L6 18" />, { width: 2.4, ...p }),
  info: (p: IconProps = {}) => svg(<><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>, p),
  undo: (p: IconProps = {}) => svg(<><path d="M9 14L4 9l5-5" /><path d="M4 9h10a6 6 0 010 12h-3" /></>, p),
  mail: (p: IconProps = {}) => svg(<><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3.5 7l8.5 6 8.5-6" /></>, { width: 1.8, ...p }),
  play: (p: IconProps = {}) => svg(<><rect x="3" y="3" width="18" height="18" rx="5" /><path d="M10 9l5 3-5 3z" /></>, { width: 1.8, ...p }),
  calendar: (p: IconProps = {}) => svg(<><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M8 3v4M16 3v4M3.5 10h17" /></>, { width: 1.8, ...p }),
  plus: (p: IconProps = {}) => svg(<path d="M12 5v14M5 12h14" />, { width: 2.2, ...p }),
  refresh: (p: IconProps = {}) => svg(<><path d="M20 11a8 8 0 10-2.3 5.7" /><path d="M20 4v7h-7" /></>, p),
  tiktok: (p: IconProps = {}) => svg(<><path d="M14 4v10.5a3.5 3.5 0 11-3.5-3.5" /><path d="M14 4c.4 2.6 2.2 4.4 5 4.6" /></>, { width: 1.9, ...p }),
  insta: (p: IconProps = {}) => svg(<><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></>, { width: 1.9, ...p }),
  youtube: (p: IconProps = {}) => svg(<><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="M10 9.5l5 2.5-5 2.5z" /></>, { width: 1.9, ...p }),
};

/* ---------- Layout ---------- */

export function Screen({ header, children, footer }: { header?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {header}
      <main className="scroll-area flex min-h-0 flex-1 flex-col gap-[18px] overflow-y-auto px-[18px] pb-[18px] pt-[14px]">{children}</main>
      {footer && <div className="px-[18px] pb-7 pt-2.5">{footer}</div>}
    </div>
  );
}

export function SamplePill({ mode = "sample", short }: { mode?: Mode; short?: boolean }) {
  const live = mode === "live";
  return (
    <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-[5px] text-xs font-medium text-ink-4">
      <span className={`size-1.5 rounded-full ${live ? "bg-[#2BA36A]" : "bg-sample"}`} />
      {live ? "Live · You.com" : short ? "Sample" : "Sample data"}
    </span>
  );
}

export function BackButton({ href, label = "Back" }: { href: string; label?: string }) {
  return (
    <Link href={href} aria-label={label} className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line bg-white">
      {Icon.back()}
    </Link>
  );
}

export function StepHeader({ back, step }: { back: string; step: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-3.5 px-[18px] pb-2 pt-[18px]">
      <BackButton href={back} />
      <div className="grid flex-1 grid-cols-3 gap-1.5" aria-label={`Step ${step} of 3`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-[5px] rounded-full ${i <= step ? "bg-ink" : "bg-line-2"}`} />
        ))}
      </div>
      <span className="shrink-0 text-[13px] text-muted">{step} of 3</span>
    </div>
  );
}

const primary = "flex h-[54px] w-full items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-semibold text-white disabled:opacity-50";

export function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={primary}>
      {children}
      {Icon.arrow({ color: "#fff" })}
    </Link>
  );
}

export function PrimaryButton({ children, arrow = true, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { arrow?: boolean }) {
  return (
    <button type="button" className={primary} {...rest}>
      {children}
      {arrow && Icon.arrow({ color: "#fff" })}
    </button>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[22px] border border-line bg-white ${className}`}>{children}</div>;
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  full,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
  full?: boolean;
}) {
  return (
    <div className={`flex gap-1 rounded-[14px] bg-chip p-1 ${full ? "w-full" : ""}`} role="group">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className={`h-9 whitespace-nowrap rounded-[10px] px-4 text-sm font-medium ${full ? "flex-1 px-1.5 text-[13px]" : ""} ${
            o.value === value ? "bg-white text-ink shadow-[0_1px_3px_rgba(24,24,27,0.10)]" : "text-muted"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function TabBar({ active, badge }: { active: "matches" | "inbox"; badge?: number }) {
  const item = (on: boolean) =>
    `flex h-[46px] items-center justify-center gap-2 rounded-full text-sm font-medium ${on ? "bg-ink text-white" : "text-ink-4"}`;
  return (
    <nav className="grid grid-cols-2 gap-1 rounded-full border border-line bg-white p-[5px] shadow-[0_8px_24px_rgba(24,24,27,0.08)]">
      <Link href="/matches" aria-current={active === "matches" ? "page" : undefined} className={item(active === "matches")}>
        {Icon.star()} Matches
      </Link>
      <Link href="/inbox" aria-current={active === "inbox" ? "page" : undefined} className={item(active === "inbox")}>
        {Icon.shield()} Trust inbox
        {!!badge && active !== "inbox" && (
          <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-alert px-1 text-[11px] font-semibold text-white">{badge}</span>
        )}
      </Link>
    </nav>
  );
}

export function BrandLogo({ brand, size = 44 }: { brand: Pick<Brand, "initials" | "logoBg" | "logoFg">; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center font-bold"
      style={{ width: size, height: size, borderRadius: size * 0.28, background: brand.logoBg, color: brand.logoFg, fontSize: size * 0.34 }}
    >
      {brand.initials}
    </div>
  );
}

export const TONE: Record<Tone, string> = { red: "#E5484D", amber: "#F5A524", green: "#2BA36A" };

export const BAND: Record<Band, { bg: string; fg: string; label: string; ring: string; track: string; border: string; wash: string }> = {
  risky: { bg: "#FDECEC", fg: "#B4232A", label: "Risky", ring: "#E5484D", track: "#F8DCDC", border: "#F6D9D9", wash: "229,72,77" },
  check: { bg: "#FFF1DF", fg: "#9A4A00", label: "Check first", ring: "#F5A524", track: "#FCEBD2", border: "#F6E4CC", wash: "245,165,36" },
  safe: { bg: "#E9F6EF", fg: "#136B43", label: "Looks safe", ring: "#2BA36A", track: "#D6EFE1", border: "#D9EDE2", wash: "43,163,106" },
};

export function ScoreRing({ score, band }: { score: number; band: Band }) {
  const c = 2 * Math.PI * 44;
  const b = BAND[band];
  return (
    <div className="relative size-[104px]">
      <svg width="104" height="104" viewBox="0 0 104 104" role="img" aria-label={`Trust Score ${score} out of 100`}>
        <circle cx="52" cy="52" r="44" fill="none" stroke={b.track} strokeWidth="10" />
        <circle
          cx="52" cy="52" r="44" fill="none" stroke={b.ring} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${(score / 100) * c} ${c}`} transform="rotate(-90 52 52)"
          style={{ transition: "stroke-dasharray 600ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[32px] font-bold leading-none tracking-[-0.03em]" style={{ color: b.fg }}>{score}</span>
        <span className="text-[11px] text-muted">of 100</span>
      </div>
    </div>
  );
}

export function SourceList({ sources, empty = "No sources for this one." }: { sources: Source[]; empty?: string }) {
  if (!sources.length) return <p className="px-2.5 py-3 text-[13px] text-muted">{empty}</p>;
  return (
    <>
      {sources.map((s, i) => (
        <a key={`${s.url}-${i}`} href={s.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl p-2.5 hover:bg-soft">
          {Icon.globe({ color: "#52525B" })}
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-sm text-ink-2">{s.title}</span>
            <span className="truncate text-xs text-muted">
              {hostOf(s.url)}
              {s.date ? ` · ${formatDate(s.date)}` : ""}
            </span>
          </span>
          {Icon.arrow({ size: 16 })}
        </a>
      ))}
    </>
  );
}

export function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}
