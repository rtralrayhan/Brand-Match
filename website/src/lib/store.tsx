"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { SAMPLE_EMAILS } from "./sampleEmails";
import type { EmailInput, MatchResult, TrustResult } from "./types";

export interface Profile {
  name: string;
  email: string;
  accounts: { tiktok: boolean; insta: boolean; youtube: boolean };
  links: string[];
  niches: string[];
  country: string;
  city: string;
  local: boolean;
  inbox: "gmail" | "outlook" | "forward" | null;
  window: 7 | 30;
}

interface State {
  profile: Profile;
  matches: Partial<Record<7 | 30, MatchResult>>;
  trust: Record<string, TrustResult>;
  emails: EmailInput[];
  saved: string[];
  reported: string[];
}

const initial: State = {
  profile: {
    name: "Maya Ortiz",
    email: "maya@sample.example",
    accounts: { tiktok: false, insta: true, youtube: true },
    links: [],
    niches: ["Food", "Home and kitchen"],
    country: "United States",
    city: "Brooklyn, NY",
    local: true,
    inbox: "gmail",
    window: 30,
  },
  matches: {},
  trust: {},
  emails: SAMPLE_EMAILS,
  saved: [],
  reported: [],
};

const COUNTRY: Record<string, string> = { "United States": "US", Canada: "CA", "United Kingdom": "GB", India: "IN" };

interface Store extends State {
  setProfile: (p: Partial<Profile>) => void;
  loadMatches: (window: 7 | 30, force?: boolean) => Promise<void>;
  matchLoading: boolean;
  matchError: string | null;
  checkEmail: (e: EmailInput, force?: boolean) => Promise<TrustResult | null>;
  checking: Record<string, boolean>;
  addEmail: (e: EmailInput) => void;
  toggleSave: (id: string) => void;
  report: (id: string) => void;
  reset: () => void;
}

const Ctx = createContext<Store | null>(null);
const KEY = "vetted-state-v1";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [hydrated, setHydrated] = useState(false);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [checking, setChecking] = useState<Record<string, boolean>>({});
  const inflight = useRef<Partial<Record<string, Promise<unknown>>>>({});

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) setState({ ...initial, ...JSON.parse(raw) });
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state, hydrated]);

  const setProfile = useCallback((p: Partial<Profile>) => setState((s) => ({ ...s, profile: { ...s.profile, ...p } })), []);

  const loadMatches = useCallback(
    async (window: 7 | 30, force = false) => {
      if (!force && state.matches[window]) return;
      const key = `match-${window}`;
      if (inflight.current[key]) return void (await inflight.current[key]);
      setMatchLoading(true);
      setMatchError(null);
      const p = (async () => {
        try {
          const res = await fetch("/api/brand-match", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              links: state.profile.links,
              niches: state.profile.niches,
              window,
              country: COUNTRY[state.profile.country],
            }),
          });
          if (!res.ok) throw new Error(`Brand Match failed (${res.status})`);
          const data = (await res.json()) as MatchResult;
          setState((s) => ({ ...s, matches: { ...s.matches, [window]: data } }));
        } catch (err) {
          setMatchError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
          setMatchLoading(false);
          delete inflight.current[key];
        }
      })();
      inflight.current[key] = p;
      await p;
    },
    [state.matches, state.profile],
  );

  const checkEmail = useCallback(
    async (e: EmailInput, force = false) => {
      if (!force && state.trust[e.id]) return state.trust[e.id];
      const key = `trust-${e.id}`;
      if (inflight.current[key]) return (await inflight.current[key]) as TrustResult | null;
      setChecking((c) => ({ ...c, [e.id]: true }));
      const p = (async () => {
        try {
          const res = await fetch("/api/trust-score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(e),
          });
          if (!res.ok) throw new Error(String(res.status));
          const data = (await res.json()) as TrustResult;
          setState((s) => ({ ...s, trust: { ...s.trust, [e.id]: data } }));
          return data;
        } catch {
          return null;
        } finally {
          setChecking((c) => ({ ...c, [e.id]: false }));
          delete inflight.current[key];
        }
      })();
      inflight.current[key] = p;
      return p;
    },
    [state.trust],
  );

  const addEmail = useCallback((e: EmailInput) => setState((s) => ({ ...s, emails: [e, ...s.emails.filter((x) => x.id !== e.id)] })), []);
  const toggleSave = useCallback(
    (id: string) => setState((s) => ({ ...s, saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [...s.saved, id] })),
    [],
  );
  const report = useCallback((id: string) => setState((s) => ({ ...s, reported: Array.from(new Set([...s.reported, id])) })), []);
  const reset = useCallback(() => setState(initial), []);

  return (
    <Ctx.Provider
      value={{ ...state, setProfile, loadMatches, matchLoading, matchError, checkEmail, checking, addEmail, toggleSave, report, reset }}
    >
      {hydrated ? children : null}
    </Ctx.Provider>
  );
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}
