export type Mode = "live" | "sample";

export interface Source {
  title: string;
  url: string;
  date?: string;
}

export interface Spend {
  min: number;
  max: number;
  text: string;
}

export interface Brand {
  id: string;
  name: string;
  category: string;
  initials: string;
  logoBg: string;
  logoFg: string;
  wash: string; // "r,g,b" used for the card gradient
  fit: number; // 0-100
  spend: Spend | null;
  spendNote: string;
  hiring: string;
  live: boolean;
  why: string[];
  website?: string;
  sources: Source[];
}

export interface CreatorProfile {
  niche: string;
  topics: string[];
  audience: string;
  postsAnalyzed: number;
}

export interface MatchResult {
  mode: Mode;
  window: 7 | 30;
  profile: CreatorProfile;
  brands: Brand[];
  notes: string[];
  generatedAt: string;
}

export interface BrandMatchInput {
  links: string[];
  niches: string[];
  window: 7 | 30;
  country?: string;
  followers?: string;
}

export interface EmailInput {
  id: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  body: string;
  time?: string;
}

export type Band = "safe" | "check" | "risky";
export type Tone = "red" | "amber" | "green";

export interface TrustCheck {
  id: "identity" | "scam" | "health" | "manager" | "flags";
  name: string;
  points: number;
  max: number;
  tone: Tone;
  finding: string;
  via: string;
  sources: Source[];
}

export interface TrustResult {
  mode: Mode;
  emailId: string;
  score: number;
  band: Band;
  headline: string;
  brand: string;
  realDomain: string | null;
  note: string | null;
  checks: TrustCheck[];
  generatedAt: string;
}

export function bandFor(score: number): Band {
  if (score >= 80) return "safe";
  if (score >= 50) return "check";
  return "risky";
}
