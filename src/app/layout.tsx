import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Vetted · Deals that fit. From people you trust.",
  description: "Brand Match and Trust Score for creators, checked against this week's web with You.com.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#F7F7F8" };

/** Shared by both interfaces. src/middleware.ts rewrites each request to src/app/mobile or src/app/desktop. */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-dvh">
        {/* Rendered on the server so crawlers (including Google's OAuth review) always find these links. */}
        <nav aria-label="Legal" className="sr-only">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
        </nav>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
