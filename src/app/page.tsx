"use client";

import Link from "next/link";
import { Icon, PrimaryLink } from "@/components/ui";

export default function Welcome() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between px-[18px] pt-[22px]">
        <div className="flex items-center gap-2">
          <div className="flex size-[30px] items-center justify-center rounded-[9px] bg-ink">{Icon.logo({ size: 16, color: "#fff" })}</div>
          <span className="text-[17px] font-semibold tracking-[-0.01em]">Vetted</span>
        </div>
        <span className="rounded-full border border-line bg-white px-2.5 py-[5px] text-xs font-medium text-ink-4">Powered by You.com</span>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-[26px] px-[22px]">
        <div className="flex flex-col items-center gap-[22px]">
          <div
            aria-hidden
            className="size-[132px] rounded-full blur-[2px]"
            style={{ background: "radial-gradient(circle at 58% 38%, #FFD27A 0%, #FF8A3D 30%, #FF4D6D 55%, rgba(255,120,150,0.35) 68%, rgba(255,255,255,0) 74%)" }}
          />
          <h1 className="m-0 text-center text-[34px] font-normal leading-[1.12] tracking-[-0.03em]">
            Deals that <b>fit</b>.<br />From people you <b>trust</b>.
          </h1>
          <p className="m-0 text-center text-[15px] leading-normal text-muted">The brand deal app for creators, checked against this week&apos;s web.</p>
        </div>

        <div className="flex flex-col gap-0.5 rounded-3xl border border-line bg-white p-2">
          <div className="flex items-center gap-3 rounded-2xl bg-soft p-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-violet-bg">{Icon.star({ color: "#5B47B8" })}</div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">Brand Match</span>
              <span className="text-[13px] text-muted">Brands hiring creators like you, and what they pay</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-ok-bg">{Icon.shield({ color: "#136B43" })}</div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">Trust Score</span>
              <span className="text-[13px] text-muted">Spot fake brands, fake managers and risky offers</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 px-[18px] pb-5 pt-2.5">
        <PrimaryLink href="/signup">Get started</PrimaryLink>
        <Link href="/signup?mode=signin" className="flex h-11 items-center px-3 text-sm font-medium text-ink-3">
          I already have an account
        </Link>
        <div className="flex gap-4 text-xs text-muted">
          <Link href="/privacy" className="text-muted hover:text-ink-3">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-muted hover:text-ink-3">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}
