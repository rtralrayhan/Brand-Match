"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { fieldClass, Icon, Logo, PrimaryButton, SamplePill } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function Signup() {
  const { profile, setProfile } = useStore();
  const router = useRouter();
  const next = () => router.push("/onboarding/connect");

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-6 py-6 sm:px-12">
        <div className="flex items-center justify-between">
          <Logo />
          <SamplePill />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 py-10">
          <div className="flex flex-col gap-2">
            <h1 className="m-0 text-[34px] font-normal leading-[1.15] tracking-[-0.025em]">
              Create your <b>account</b>
            </h1>
            <p className="m-0 text-[15px] leading-normal text-muted">Free for 5 Trust Score checks a month. No card needed.</p>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            <button type="button" onClick={next} className="flex h-12 items-center justify-center rounded-full bg-ink text-[15px] font-semibold text-white hover:bg-ink-2">
              Continue with Apple
            </button>
            <button type="button" onClick={next} className="flex h-12 items-center justify-center rounded-full border border-line-2 bg-white text-[15px] font-semibold hover:bg-soft">
              Continue with Google
            </button>
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
            className="flex flex-col gap-4"
          >
            <label className="flex flex-col gap-1.5 text-[13px] font-medium text-ink-3">
              Name
              <input className={fieldClass} value={profile.name} onChange={(e) => setProfile({ name: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1.5 text-[13px] font-medium text-ink-3">
              Email
              <input type="email" className={fieldClass} value={profile.email} onChange={(e) => setProfile({ email: e.target.value })} />
            </label>
            <span className="text-[13px] text-muted">We&apos;ll email you a sign-in code. No password to remember.</span>
            <PrimaryButton type="submit" className="w-full">
              Continue with email
            </PrimaryButton>
            <span className="text-center text-xs text-muted">
              By continuing you agree to the Terms and Privacy Policy. Already have an account?{" "}
              <Link href="/matches" className="font-medium text-ink underline-offset-2 hover:underline">
                Sign in
              </Link>
            </span>
          </form>
        </div>
      </div>

      <aside
        className="hidden flex-col justify-end gap-6 border-l border-line p-12 lg:flex"
        style={{ background: "radial-gradient(80% 60% at 80% 20%, rgba(255,138,61,0.30) 0%, rgba(255,77,109,0.14) 40%, rgba(255,255,255,0) 70%), radial-gradient(70% 60% at 10% 90%, rgba(124,92,230,0.18) 0%, rgba(255,255,255,0) 60%), #fff" }}
      >
        <h2 className="m-0 max-w-md text-[40px] font-normal leading-[1.1] tracking-[-0.03em]">
          Deals that <b>fit</b>.<br />From people you <b>trust</b>.
        </h2>
        <div className="flex max-w-md flex-col gap-3">
          {[
            { icon: Icon.star({ color: "#5B47B8" }), bg: "bg-violet-bg", t: "Brand Match", d: "Brands hiring creators like you, and what they pay" },
            { icon: Icon.shield({ color: "#136B43" }), bg: "bg-ok-bg", t: "Trust Score", d: "Spot fake brands, fake managers and risky offers" },
          ].map((f) => (
            <div key={f.t} className="flex items-center gap-3 rounded-2xl border border-line bg-white/80 p-3.5 backdrop-blur">
              <span className={`flex size-9 shrink-0 items-center justify-center rounded-[10px] ${f.bg}`}>{f.icon}</span>
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">{f.t}</span>
                <span className="text-[13px] text-muted">{f.d}</span>
              </span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
