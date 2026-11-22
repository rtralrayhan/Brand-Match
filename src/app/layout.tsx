import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Vetted",
  description: "Deals that fit. From people you trust. Brand Match and Trust Score for creators, powered by You.com.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#F7F7F8" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <StoreProvider>
          {/* Full screen on phones; a 390x844 phone frame on larger screens */}
          <div className="min-h-dvh sm:flex sm:items-center sm:justify-center sm:py-8">
            <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-page sm:h-[844px] sm:w-[390px] sm:rounded-[40px] sm:shadow-[0_30px_80px_rgba(24,24,27,0.18)] sm:ring-1 sm:ring-black/5">
              {children}
            </div>
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
