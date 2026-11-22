"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackButton, fieldClass, PrimaryButton } from "@/components/desktop/ui";
import { useStore } from "@/lib/store";

export default function CheckEmail() {
  const { addEmail, checkEmail } = useStore();
  const router = useRouter();
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const valid = /.+@.+\..+/.test(fromEmail) && body.trim().length > 10;

  const submit = () => {
    if (!valid) return;
    const e = {
      id: `pasted-${Date.now().toString(36)}`,
      fromName: fromName || fromEmail.split("@")[0],
      fromEmail: fromEmail.trim(),
      subject: subject || "(no subject)",
      body,
      time: "Now",
    };
    addEmail(e);
    checkEmail(e);
    router.push(`/inbox/${e.id}`);
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8 lg:px-10">
      <div className="md:hidden">
        <BackButton href="/inbox" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="m-0 text-[30px] font-normal leading-[1.15] tracking-[-0.025em]">
          Paste a <b>brand email</b>
        </h1>
        <p className="m-0 text-[15px] leading-normal text-muted">
          We check the sender, scam reports, lawsuits and the manager against this week&apos;s web. Don&apos;t click its links first.
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-[13px] font-medium text-ink-3">
            Sender name
            <input className={fieldClass} value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="Acme Partnerships" />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] font-medium text-ink-3">
            Sender email
            <input type="email" required className={fieldClass} value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} placeholder="partners@acme.com" />
          </label>
        </div>
        <label className="flex flex-col gap-1.5 text-[13px] font-medium text-ink-3">
          Subject
          <input className={fieldClass} value={subject} onChange={(e) => setSubject(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] font-medium text-ink-3">
          Email text
          <textarea
            rows={12}
            className="resize-y rounded-[14px] border border-line-2 bg-field px-3.5 py-3 text-sm text-ink outline-none focus:border-ink"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Paste the whole email, links included"
          />
        </label>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted">Sent to You.com to run the checks. Saved only in this browser tab.</span>
          <PrimaryButton type="submit" disabled={!valid}>
            Get Trust Score
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
