"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BackButton, PrimaryButton, SamplePill, Screen } from "@/components/ui";
import { useStore } from "@/lib/store";

const field = "h-[46px] rounded-[14px] border border-line-2 bg-field px-3.5 text-[15px] text-ink outline-none focus:border-ink";

export default function Signup() {
  const { profile, setProfile } = useStore();
  const router = useRouter();
  const next = () => router.push("/onboarding/connect");

  return (
    <Screen
      header={
        <div className="flex items-center justify-between px-[18px] pb-2 pt-[18px]">
          <BackButton href="/" />
          <SamplePill />
        </div>
      }
      footer={
        <div className="flex flex-col gap-3">
          <PrimaryButton onClick={next}>Continue with email</PrimaryButton>
          <span className="text-center text-xs leading-normal text-muted">By continuing you agree to the Terms and Privacy Policy.</span>
        </div>
      }
    >
      <div className="flex flex-col gap-2 px-1">
        <h1 className="m-0 text-[30px] font-normal leading-[1.15] tracking-[-0.025em]">
          Create your <b>account</b>
        </h1>
        <p className="m-0 text-[15px] leading-normal text-muted">Free for 5 Trust Score checks a month. No card needed.</p>
      </div>

      <div className="flex flex-col gap-2.5">
        <Link href="/onboarding/connect" className="flex h-[54px] items-center justify-center rounded-full bg-ink text-[15px] font-semibold text-white">
          Continue with Apple
        </Link>
        <Link href="/onboarding/connect" className="flex h-[54px] items-center justify-center rounded-full border border-line-2 bg-white text-[15px] font-semibold">
          Continue with Google
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-line-2" />
        <span className="text-[13px] text-muted">or with email</span>
        <div className="h-px flex-1 bg-line-2" />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
        className="flex flex-col gap-3.5 rounded-3xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(24,24,27,0.04),0_10px_30px_rgba(24,24,27,0.06)]"
      >
        <label className="flex flex-col gap-1.5 text-[13px] font-medium text-ink-3">
          Name
          <input className={field} value={profile.name} onChange={(e) => setProfile({ name: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] font-medium text-ink-3">
          Email
          <input type="email" className={field} value={profile.email} onChange={(e) => setProfile({ email: e.target.value })} />
        </label>
        <span className="text-[13px] text-muted">We&apos;ll email you a sign-in code. No password to remember.</span>
      </form>
    </Screen>
  );
}
