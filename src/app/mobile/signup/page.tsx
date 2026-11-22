"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BackButton, Icon, PrimaryButton, Screen } from "@/components/mobile/ui";
import { useStore } from "@/lib/store";

const field = "h-[46px] rounded-[14px] border border-line-2 bg-field px-3.5 text-[15px] text-ink outline-none focus:border-ink";

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
    <Screen
      header={
        <div className="flex items-center justify-between px-[18px] pb-2 pt-[18px]">
          <BackButton href="/" />
        </div>
      }
      footer={
        <div className="flex flex-col gap-3">
          <PrimaryButton onClick={submit} disabled={!valid || busy}>
            {busy ? (signin ? "Signing you in…" : "Creating your account…") : "Continue with email"}
          </PrimaryButton>
          <span className="text-center text-xs leading-normal text-muted">By continuing you agree to the Terms and Privacy Policy.</span>
        </div>
      }
    >
      <div className="flex flex-col gap-2 px-1">
        <h1 className="m-0 text-[30px] font-normal leading-[1.15] tracking-[-0.025em]">
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
        <p className="m-0 text-sm leading-normal text-muted">
          {signin ? "Sign in with the Google account or email you used before." : "Free for every creator. Takes under a minute."}
        </p>
      </div>

      {account?.user && (
        <button
          type="button"
          onClick={() => router.push("/matches")}
          className="flex items-center gap-3 rounded-[18px] border border-line bg-white p-3 text-left"
        >
          {Icon.tick({ size: 18, color: "#18794E" })}
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-sm font-semibold">Continue as {account.user.name}</span>
            <span className="truncate text-[13px] text-muted">{account.user.email}</span>
          </span>
          {Icon.arrow({ size: 16 })}
        </button>
      )}

      {/* A plain link: the browser must leave the app for Google's sign-in page. */}
      <a
        href={`/api/auth/google?return=${encodeURIComponent(next)}`}
        className="flex h-[54px] w-full items-center justify-center gap-2.5 rounded-full border border-line-2 bg-white text-[15px] font-semibold"
      >
        <GoogleMark />
        Continue with Google
      </a>

      <button
        type="button"
        disabled
        aria-disabled="true"
        className="relative -mt-2 flex h-[54px] w-full cursor-not-allowed items-center justify-center rounded-full bg-ink text-[15px] font-semibold text-white opacity-45"
      >
        Continue with Apple
        <span className="absolute right-3 rounded-full bg-chip px-2 py-0.5 text-[11px] font-medium text-ink-3">Soon</span>
      </button>

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

      <button type="button" onClick={() => setSignin(!signin)} className="h-11 text-sm font-medium text-ink-3">
        {signin ? "New here? Create an account" : "Already have an account? Sign in"}
      </button>
    </Screen>
  );
}
