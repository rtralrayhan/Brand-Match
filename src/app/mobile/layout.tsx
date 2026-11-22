import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vetted",
  description: "Deals that fit. From people you trust. Brand Match and Trust Score for creators, powered by You.com.",
};

/** The phone interface: full screen on phones, a 390x844 phone frame on larger screens. */
export default function MobileLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-dvh bg-[#e9e9ec] sm:flex sm:items-center sm:justify-center sm:py-8">
      <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-page sm:h-[844px] sm:w-[390px] sm:rounded-[40px] sm:shadow-[0_30px_80px_rgba(24,24,27,0.18)] sm:ring-1 sm:ring-black/5">
        {children}
      </div>
    </div>
  );
}
