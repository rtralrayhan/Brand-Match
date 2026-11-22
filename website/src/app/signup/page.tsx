"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fieldClass, Icon, Logo, PrimaryButton } from "@/components/ui";
import { useStore } from "@/lib/store";

const AUTH_NOTES: Record<string, string> = {
  denied: "Google sign-in was cancelled. Try again or use your email.",
  failed: "Google sign-in didn't work. Try again or use your email.",
  not_configured: "Google sign-in isn't set up on this server yet. Use your email for now.",
};

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export default function Signup() {
  const { profile, setProfile, signup, account } = useStore();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [signin, setSignin] = useState(false);
  const valid = profile.name.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim());
  // Returning people go straight to their matches; new accounts start onboarding.
  const next = signin ? "/matches" : "/onboarding/connect";

  useEffect(() => {
    const url = new URL(window.location.href);
    setSignin(url.searchParams.get("mode") === "signin");
    const auth = url.searchParams.get("auth");
    if (auth) {
      setError(AUTH_NOTES[auth] ?? AUTH_NOTES.failed);
      url.searchParams.delete("auth");
      window.history.replaceState(null, "", url.pathname + url.search);
    }
  }, []);

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    const err = await signup(profile.name.trim(), profile.email.trim());
    setBusy(false);
    if (err) setError(err);
    else router.push(next);
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-6 py-6 sm:px-12">
        <div className="flex items-center justify-between">
          <Logo />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 py-10">
          <div className="flex flex-col gap-2">
            <h1 className="m-0 text-[34px] font-normal leading-[1.15] tracking-[-0.025em]">
              {signin ? (
                <>
                  Welcome <b>back</b>
                </>
              ) : (
                <>
                  Create your <b>account</b>
                </>
              )}
            </h1>
            <p className="m-0 text-[15px] leading-normal text-muted">
              {signin ? "Sign in with the Google account or email you used before." : "Free for every creator. Takes under a minute."}
            </p>
          </div>

          {account?.user && (
            <button
              type="button"
              onClick={() => router.push("/matches")}
              className="flex items-center gap-3 rounded-[18px] border border-line bg-white p-3.5 text-left hover:bg-soft"
            >
              {Icon.tick({ size: 18, color: "#18794E" })}
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm font-semibold">Continue as {account.user.name}</span>
                <span className="truncate text-[13px] text-muted">{account.user.email}</span>
              </span>
              {Icon.arrow({ size: 16 })}
            </button>
          )}

          <div className="grid gap-2.5 sm:grid-cols-2">
            {/* A plain link: the browser must leave the app for Google's sign-in page. */}
            <a
              href={`/api/auth/google?return=${encodeURIComponent(next)}`}
              className="flex h-12 items-center justify-center gap-2.5 rounded-full border border-line-2 bg-white text-[15px] font-semibold hover:bg-soft"
            >
              <GoogleMark />
              Continue with Google
            </a>
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="flex h-12 cursor-not-allowed items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-semibold text-white opacity-45"
            >
              Continue with Apple
              <span className="rounded-full bg-chip px-2 py-0.5 text-[11px] font-medium text-ink-3">Soon</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-line-2" />
            <span className="text-[13px] text-muted">or use your email</span>
            <div className="h-px flex-1 bg-line-2" />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="flex flex-col gap-4"
          >
            <label className="flex flex-col gap-1.5 text-[13px] font-medium text-ink-3">
              Name
              <input className={fieldClass} autoComplete="name" placeholder="Your name" value={profile.name} onChange={(e) => setProfile({ name: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1.5 text-[13px] font-medium text-ink-3">
              Email
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={fieldClass}
                value={profile.email}
                onChange={(e) => setProfile({ email: e.target.value })}
              />
            </label>
            {error && (
              <span role="alert" className="text-[13px] text-bad">
                {error}
              </span>
            )}
            <PrimaryButton type="submit" disabled={!valid || busy} className="w-full disabled:cursor-not-allowed disabled:opacity-45">
              {busy ? (signin ? "Signing you in…" : "Creating your account…") : "Continue with email"}
            </PrimaryButton>
            <span className="text-center text-xs text-muted">
              By continuing you agree to the{" "}
              <a href="/terms" className="underline-offset-2 hover:underline">
                Terms
              </a>{" "}
              and{" "}
              <a href="/privacy" className="underline-offset-2 hover:underline">
                Privacy Policy
              </a>
              .
            </span>
          </form>

          <button type="button" onClick={() => setSignin(!signin)} className="h-11 text-sm font-medium text-ink-3 hover:text-ink">
            {signin ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
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
