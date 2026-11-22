"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/** A screenshot inside a simple browser window. Screenshots are 1440x900 at 2x, saved 2000x1250. With `zoom`, clicking opens it full size. */
export function BrowserFrame({
  src,
  alt,
  url = "vetted.app",
  priority,
  zoom,
  className = "",
}: {
  src: string;
  alt: string;
  url?: string;
  priority?: boolean;
  zoom?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, [open]);

  const img = <Image src={src} alt={alt} width={2000} height={1250} priority={priority} sizes="(min-width: 1024px) 900px, 100vw" className="block h-auto w-full" />;

  return (
    <>
      <div className={`group relative overflow-hidden rounded-[18px] border border-line bg-white shadow-[0_1px_2px_rgba(24,24,27,0.04),0_24px_60px_rgba(24,24,27,0.12)] ${className}`}>
        <div className="flex h-9 items-center gap-3 border-b border-line bg-soft px-3.5">
          <span className="flex gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-[#FF5F57]" />
            <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="size-2.5 rounded-full bg-[#28C840]" />
          </span>
          <span className="mx-auto hidden w-1/2 max-w-xs truncate rounded-md bg-white px-3 py-0.5 text-center text-[11px] text-muted sm:block">{url}</span>
          <span className="w-[42px]" aria-hidden />
        </div>
        {zoom ? (
          <button type="button" onClick={() => setOpen(true)} aria-label={`Enlarge screenshot: ${alt}`} className="relative block w-full cursor-zoom-in">
            {img}
            <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-ink/80 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
              Click to enlarge
            </span>
          </button>
        ) : (
          img
        )}
      </div>

      {open && (
        <div role="dialog" aria-modal="true" aria-label={alt} onClick={() => setOpen(false)} className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/70 p-4 backdrop-blur-sm md:p-10">
          <Image src={src} alt={alt} width={2000} height={1250} sizes="100vw" className="h-auto max-h-full w-auto max-w-full rounded-xl shadow-2xl" />
          <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-full bg-white text-lg font-semibold">
            ×
          </button>
        </div>
      )}
    </>
  );
}

/** A tall mobile screenshot inside a phone outline. Saved 780x1688. */
export function PhoneFrame({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-[38px] border-[7px] border-ink bg-ink shadow-[0_30px_70px_rgba(24,24,27,0.22)] ${className}`}>
      <Image src={src} alt={alt} width={780} height={1688} sizes="280px" className="block h-auto w-full rounded-[31px]" />
    </div>
  );
}

export function Eyebrow({ children, tone = "violet" }: { children: React.ReactNode; tone?: "violet" | "green" | "light" }) {
  const cls = { violet: "bg-violet-bg text-violet", green: "bg-ok-bg text-ok", light: "bg-white/10 text-white/80" }[tone];
  return <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.06em] ${cls}`}>{children}</span>;
}

export function SectionHeading({
  eyebrow,
  title,
  sub,
  center,
  tone,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub?: string;
  center?: boolean;
  tone?: "violet" | "green" | "light";
}) {
  return (
    <div className={`flex flex-col gap-4 ${center ? "items-center text-center" : ""}`}>
      <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
      <h2 className="m-0 max-w-2xl text-[34px] font-normal leading-[1.1] tracking-[-0.03em] md:text-[44px]">{title}</h2>
      {sub && <p className={`m-0 max-w-xl text-[17px] leading-relaxed ${tone === "light" ? "text-white/70" : "text-muted"}`}>{sub}</p>}
    </div>
  );
}
