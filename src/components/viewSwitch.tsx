"use client";

import { usePathname } from "next/navigation";
import { switchViewHref, type UI } from "@/lib/ui";

const LABEL: Record<UI, string> = { mobile: "Switch to phone view", desktop: "Switch to desktop view" };

/** Switches to the other interface on the same screen. A plain <a>: the middleware sets the `ui` cookie on a full page load. */
export function ViewSwitch({ to, className = "", children }: { to: UI; className?: string; children?: React.ReactNode }) {
  const path = usePathname();
  return (
    <a href={switchViewHref(to, path)} className={className}>
      {children ?? LABEL[to]}
    </a>
  );
}
