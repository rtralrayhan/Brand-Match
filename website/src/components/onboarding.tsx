"use client";

import Link from "next/link";
import { Icon } from "./ui";

export function StepTitle({ children, sub }: { children: React.ReactNode; sub: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="m-0 text-[34px] font-normal leading-[1.15] tracking-[-0.025em]">{children}</h1>
      <p className="m-0 text-[15px] leading-normal text-muted">{sub}</p>
    </div>
  );
}

export function StepFooter({ back, next, nextLabel, skip, blocked, onNext }: { back?: string; next: string; nextLabel: string; skip?: string; blocked?: string; onNext?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-line pt-6">
      {back ? (
        <Link href={back} className="flex h-12 items-center gap-2 rounded-full px-4 text-sm font-medium text-ink-3 hover:bg-chip">
          {Icon.back({ size: 16 })} Back
        </Link>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-2">
        {skip && (
          <Link href={skip} onClick={onNext} className="flex h-12 items-center px-4 text-sm font-medium text-ink-3 hover:text-ink">
            Skip for now
          </Link>
        )}
        {blocked ? (
          <span aria-disabled="true" className="flex h-12 cursor-not-allowed items-center gap-2 rounded-full bg-ink px-6 text-[15px] font-semibold text-white opacity-45">
            {blocked}
          </span>
        ) : (
          <Link href={next} onClick={onNext} className="flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-[15px] font-semibold text-white hover:bg-ink-2">
            {nextLabel} {Icon.arrow({ color: "#fff" })}
          </Link>
        )}
      </div>
    </div>
  );
}
