"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackButton, PrimaryButton, Screen } from "@/components/ui";
import { useStore } from "@/lib/store";

const field = "h-[46px] rounded-[14px] border border-line-2 bg-field px-3.5 text-[15px] text-ink outline-none focus:border-ink";

function SoonButton({ label, dark }: { label: string; dark?: boolean }) {
  return (
    <button
      type="button"
      disabled
      aria-disabled="true"
      className={`relative flex h-[54px] w-full cursor-not-allowed items-center justify-center rounded-full text-[15px] font-semibold opacity-45 ${
        dark ? "bg-ink text-white" : "border border-line-2 bg-white"
      }`}
    >
      {label}
      <span className="absolute right-3 rounded-full bg-chip px-2 py-0.5 text-[11px] font-medium text-ink-3">Soon</span>
    </button>
  );
}

export default function Signup() {
  const { profile, setProfile, signup } = useStore();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const valid = profile.name.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim());

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    const err = await signup(profile.name.trim(), profile.email.trim());
    setBusy(false);
    if (err) setError(err);
    else router.push("/onboarding/connect");
  };

  return (
    <Screen
      header={
        <div className="flex items-center justify-between px-[18px] pb-2 pt-[18px]">
          <BackButton href="/" />
        </div>
      }
      footer={
        <div className="flex flex-col gap-3">
          <PrimaryButton onClick={submit} disabled={!valid || busy}>
            {busy ? "Creating your account…" : "Continue with email"}
          </PrimaryButton>
          <span className="text-center text-xs leading-normal text-muted">By continuing you agree to the Terms and Privacy Policy.</span>
        </div>
      }
    >
      <div className="flex flex-col gap-2 px-1">
        <h1 className="m-0 text-[30px] font-normal leading-[1.15] tracking-[-0.025em]">
          Create your <b>account</b>
        </h1>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex flex-col gap-3.5 rounded-3xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(24,24,27,0.04),0_10px_30px_rgba(24,24,27,0.06)]"
      >
        <label className="flex flex-col gap-1.5 text-[13px] font-medium text-ink-3">
          Name
          <input
            className={field}
            autoComplete="name"
            placeholder="Your name"
            value={profile.name}
            onChange={(e) => setProfile({ name: e.target.value })}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] font-medium text-ink-3">
          Email
          <input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={field}
            value={profile.email}
            onChange={(e) => setProfile({ email: e.target.value })}
          />
        </label>
        {error && <span className="text-[13px] text-bad">{error}</span>}
        <button type="submit" hidden />
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-line-2" />
        <span className="text-[13px] text-muted">More ways coming soon</span>
        <div className="h-px flex-1 bg-line-2" />
      </div>

      <div className="flex flex-col gap-2.5">
        <SoonButton label="Continue with Apple" dark />
        <SoonButton label="Continue with Google" />
      </div>
    </Screen>
  );
}
