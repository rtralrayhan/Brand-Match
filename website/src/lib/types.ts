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

export type VideoPlatform = "tiktok" | "instagram" | "youtube";

/** A video a creator made for a brand (paid, gifted or unknown). */
export interface CreatorVideo {
  platform: VideoPlatform;
  url: string;
  handle?: string;
  title?: string;
  views?: string; // display text, e.g. "184k"
  date?: string;
  deal?: string; // e.g. "Paid partnership"
  thumb?: string; // image URL when we know one
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
  researchStatus: "unresearched" | "complete" | "failed";
  why: string[];
  website?: string;
  sources: Source[];
  /** Known creator videos. When missing, they are read from `sources`. */
  videos?: CreatorVideo[];
}

export type BrandResearch = Pick<Brand, "spend" | "spendNote" | "hiring" | "live" | "researchStatus" | "sources" | "videos">;

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
