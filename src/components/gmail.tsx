"use client";

import { useEffect, useState } from "react";
import { Icon } from "./ui";

const MESSAGES: Record<string, { text: string; ok: boolean }> = {
  connected: { text: "Gmail connected. We only read brand, manager and promo emails.", ok: true },
  denied: { text: "Gmail wasn't connected: access was declined.", ok: false },
  failed: { text: "Gmail didn't connect. Try again.", ok: false },
  not_configured: { text: "Gmail sign-in isn't set up on this server yet (Google client ID missing).", ok: false },
};

/** Reads ?gmail=… once after the Google redirect, shows a note, and cleans the URL. */
export function GmailStatusNote() {
  const [status, setStatus] = useState<string | null>(null);
  useEffect(() => {
    const url = new URL(window.location.href);
    const s = url.searchParams.get("gmail");
    if (s) {
      setStatus(s);
      url.searchParams.delete("gmail");
      window.history.replaceState(null, "", url.pathname + url.search);
    }
  }, []);
  const m = status ? MESSAGES[status] : null;
  if (!m) return null;
  return (
    <div className={`flex items-start gap-2.5 rounded-[18px] px-3.5 py-3 text-[13px] leading-[1.45] ${m.ok ? "bg-ok-bg text-ok" : "bg-warn-bg text-warn"}`}>
      {m.ok ? Icon.tick({ size: 16, color: "#136B43" }) : Icon.info({ size: 16, color: "#9A4A00" })}
      <span>{m.text}</span>
    </div>
  );
}

export const connectGmailHref = (returnTo: string) => `/api/gmail/connect?return=${encodeURIComponent(returnTo)}`;
