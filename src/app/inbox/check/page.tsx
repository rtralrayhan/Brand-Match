"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackButton, PrimaryButton, Screen } from "@/components/ui";
import { useStore } from "@/lib/store";

const field = "rounded-[14px] border border-line-2 bg-field px-3.5 text-[15px] text-ink outline-none focus:border-ink";

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
    <Screen
      header={
        <div className="flex items-center gap-3.5 px-[18px] pb-2 pt-[18px]">
          <BackButton href="/inbox" />
          <span className="text-sm font-medium">Check an email</span>
        </div>
      }
      footer={
        <PrimaryButton onClick={submit} disabled={!valid}>
          Get Trust Score
        </PrimaryButton>
      }
    >
      <div className="flex flex-col gap-2 px-1">
        <h1 className="m-0 text-[28px] font-normal leading-[1.15] tracking-[-0.025em]">
          Paste a <b>brand email</b>
        </h1>
        <p className="m-0 text-sm leading-normal text-muted">We check the sender, scam reports, lawsuits and the manager against this week&apos;s web. Don&apos;t click its links first.</p>
      </div>
      <div className="flex flex-col gap-3.5 rounded-3xl border border-line bg-white p-4">
        <label className="flex flex-col gap-1.5 text-[13px] font-medium text-ink-3">
          Sender name
          <input className={`${field} h-[46px]`} value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="Acme Partnerships" />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] font-medium text-ink-3">
          Sender email
          <input type="email" className={`${field} h-[46px]`} value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} placeholder="partners@acme.com" />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] font-medium text-ink-3">
          Subject
          <input className={`${field} h-[46px]`} value={subject} onChange={(e) => setSubject(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] font-medium text-ink-3">
          Email text
          <textarea rows={8} className={`${field} resize-none py-3 text-sm`} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Paste the whole email, links included" />
        </label>
      </div>
    </Screen>
  );
}
