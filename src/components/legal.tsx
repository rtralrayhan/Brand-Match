import Link from "next/link";

export const CONTACT_EMAIL = "hello@vettedapp.nyc";
export const UPDATED = "November 22, 2026";

/** Shared layout for the Privacy Policy and Terms pages (server-rendered, no app state). */
export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3 px-[18px] pb-2 pt-[18px]">
        <Link href="/" aria-label="Back to Vetted" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line bg-white">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </Link>
        <span className="text-sm font-medium">Vetted</span>
      </div>
      <main className="scroll-area flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-[22px] pb-10 pt-3 text-[14px] leading-relaxed text-ink-2 [&_h2]:mt-3 [&_h2]:text-[16px] [&_h2]:font-semibold [&_h2]:text-ink [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_a]:text-violet [&_a]:underline">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-[28px] font-normal tracking-[-0.025em] text-ink">{title}</h1>
          <span className="text-[13px] text-muted">Last updated {UPDATED}</span>
        </div>
        {children}
        <div className="mt-4 flex gap-4 border-t border-line pt-4 text-[13px]">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
        </div>
      </main>
    </div>
  );
}
