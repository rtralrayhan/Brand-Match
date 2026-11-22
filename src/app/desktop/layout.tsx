/** The desktop interface: full-width pages (landing page, split sign-up, onboarding, sidebar app shell). */
export default function DesktopLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-dvh bg-page">{children}</div>;
}
