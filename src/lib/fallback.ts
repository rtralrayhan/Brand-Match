import type { Brand, EmailInput, MatchResult, TrustResult } from "./types";

/**
 * Sample runs shown when the You.com API is unavailable or no key is set.
 * Mirrors the design canvas. The UI labels these "Sample data".
 */

const hp: Brand = {
  id: "hearth-and-pan",
  name: "Hearth & Pan",
  category: "Cast-iron cookware",
  initials: "HP",
  logoBg: "#2B1D14",
  logoFg: "#F3C99B",
  wash: "255,140,60",
  fit: 94,
  spend: { min: 1500, max: 4000, text: "$1.5k to $4k" },
  spendNote: "Per campaign. Median $2,400 across 5 public mentions. Usage rights are usually paid on top.",
  hiring: "6 creators hired this month",
  live: true,
  researchStatus: "complete",
  why: [
    "Your cast-iron steak reel (212k views) matches their spring skillet brief.",
    "They hired food creators with 20k to 80k followers, your size.",
    "Their creator program reviews applications every week.",
  ],
  sources: [
    { title: "Creator program page", url: "https://hearthandpan.example", date: "2026-11-18" },
    { title: "Sponsored skillet reel", url: "https://instagram.example", date: "2026-11-12" },
    { title: "Creator rates thread", url: "https://reddit.example", date: "2026-11-04" },
    { title: "Spring brief roundup", url: "https://newsletter.example", date: "2026-10-29" },
  ],
};

const brand = (b: Partial<Brand> & Pick<Brand, "id" | "name" | "category" | "initials" | "logoBg" | "logoFg" | "wash" | "fit">): Brand => ({
  spend: null,
  spendNote: "No public pay data yet. Ask for their rate card before you quote.",
  hiring: "Working with creators now",
  live: true,
  researchStatus: "complete",
  why: [],
  sources: [],
  ...b,
});

export function sampleMatch(window: 7 | 30): MatchResult {
  const month: Brand[] = [
    hp,
    brand({
      id: "greenbasket", name: "Greenbasket", category: "Grocery delivery", initials: "Gb", logoBg: "#E2F2E7", logoFg: "#1F6B3A", wash: "60,180,110",
      fit: 88, spend: { min: 800, max: 2500, text: "$800 to $2.5k" }, spendNote: "Per campaign, from 3 public sources.", hiring: "11 creators hired this month",
      why: ["Your budget meal series fits their “feed four for $20” campaign."],
    }),
    brand({
      id: "saltwell", name: "Saltwell Spice Co.", category: "Spices and blends", initials: "Sw", logoBg: "#FCE9DC", logoFg: "#9A3D12", wash: "235,100,70",
      fit: 81, hiring: "3 creators hired this month", why: ["Your spice-rub shorts get twice your average saves."],
    }),
    brand({
      id: "kitchly", name: "Kitchly", category: "Meal kits", initials: "Ki", logoBg: "#E8EEFD", logoFg: "#2F4EB8", wash: "90,120,255",
      fit: 76, spend: { min: 2000, max: 6000, text: "$2k to $6k" }, hiring: "Last hired creators in October", live: false,
      why: ["Your meal-prep Sundays match their audience, but they aren't hiring right now."],
    }),
  ];
  const week: Brand[] = [
    { ...hp, fit: 96 },
    { ...month[2], fit: 85, hiring: "2 creators hired this week" },
    brand({
      id: "ovenly", name: "Ovenly", category: "Bakeware", initials: "Ov", logoBg: "#F1E8FD", logoFg: "#6A2AAE", wash: "150,90,230",
      fit: 79, spend: { min: 500, max: 1500, text: "$500 to $1.5k" }, hiring: "4 creators hired this week", why: ["Your one-pan bakes fit their holiday push."],
    }),
  ];
  return {
    mode: "sample",
    window,
    profile: {
      niche: "Weeknight cooking",
      topics: window === 7 ? ["One-pan pasta", "Cast-iron care", "Pantry swaps"] : ["Weeknight dinners", "Budget meals", "Cast-iron cooking", "Meal prep"],
      audience: "Home cooks, 25 to 40",
      postsAnalyzed: window === 7 ? 5 : 18,
    },
    brands: window === 7 ? week : month,
    notes: [],
    generatedAt: new Date().toISOString(),
  };
}

export function sampleTrust(email: EmailInput): TrustResult {
  const base = { mode: "sample" as const, emailId: email.id, generatedAt: new Date().toISOString() };
  if (email.id === "misen-real") {
    return {
      ...base, score: 91, band: "safe", headline: "Looks like a real offer from a real brand.", brand: "Misen", realDomain: "misen.com", note: null,
      checks: [
        { id: "identity", name: "Sender identity", points: 30, max: 30, tone: "green", finding: "Sender domain matches the brand's real site, misen.com.", via: "YOU.COM SEARCH", sources: [] },
        { id: "scam", name: "Scam reports", points: 25, max: 25, tone: "green", finding: "No public scam reports found about this sender or offer.", via: "YOU.COM SEARCH · PAST YEAR", sources: [] },
        { id: "health", name: "Lawsuits and court cases", points: 16, max: 20, tone: "green", finding: "No lawsuits or unpaid-creator complaints found.", via: "YOU.COM ANSWER · PAST YEAR", sources: [] },
        { id: "manager", name: "Manager check", points: 15, max: 15, tone: "green", finding: "No middleman. The email claims to come from the brand's own team.", via: "YOU.COM SEARCH", sources: [] },
        { id: "flags", name: "Red flags in the email", points: 5, max: 10, tone: "amber", finding: "No sign-in links or fees; asks for a call.", via: "READ FROM THE EMAIL", sources: [] },
      ],
    };
  }
  if (email.id === "brightline-manager") {
    return {
      ...base, score: 64, band: "check", headline: "Some things don't add up. Check before you reply.", brand: "Brightline Talent", realDomain: null, note: null,
      checks: [
        { id: "identity", name: "Sender identity", points: 12, max: 30, tone: "amber", finding: "Couldn't confirm the agency's official site.", via: "YOU.COM SEARCH", sources: [] },
        { id: "scam", name: "Scam reports", points: 25, max: 25, tone: "green", finding: "No public scam reports found about this sender.", via: "YOU.COM SEARCH · PAST YEAR", sources: [] },
        { id: "health", name: "Lawsuits and court cases", points: 18, max: 20, tone: "green", finding: "No lawsuits or regulator actions found.", via: "YOU.COM ANSWER · PAST YEAR", sources: [] },
        { id: "manager", name: "Manager check", points: 0, max: 15, tone: "red", finding: "“Jordan Lee” isn't on any public agency page.", via: "YOU.COM SEARCH", sources: [] },
        { id: "flags", name: "Red flags in the email", points: 9, max: 10, tone: "green", finding: "Asks for your brand contacts and exclusive representation.", via: "READ FROM THE EMAIL", sources: [] },
      ],
    };
  }
  return {
    ...base, score: 23, band: "risky", headline: "Likely a fake sponsor email. Don't click its links.", brand: "Lodge Cast Iron", realDomain: "lodgecastiron.com",
    note: "Lodge Cast Iron's real team writes from lodgecastiron.com.",
    checks: [
      { id: "identity", name: "Sender identity", points: 0, max: 30, tone: "red", finding: "Lookalike domain lodge-castiron-collab.com. The real site is lodgecastiron.com.", via: "YOU.COM SEARCH", sources: [] },
      { id: "scam", name: "Scam reports", points: 5, max: 25, tone: "red", finding: "Public reports of scammers impersonating cookware brands in sponsor emails.", via: "YOU.COM SEARCH · PAST YEAR", sources: [] },
      { id: "health", name: "Lawsuits and court cases", points: 18, max: 20, tone: "green", finding: "Real brand. No lawsuits or unpaid-creator complaints found.", via: "YOU.COM ANSWER · PAST YEAR", sources: [] },
      { id: "manager", name: "Manager check", points: 0, max: 15, tone: "red", finding: "“Ava Brooks” isn't on the brand's team page or any public profile.", via: "YOU.COM SEARCH", sources: [] },
      { id: "flags", name: "Red flags in the email", points: 0, max: 10, tone: "red", finding: "It asks you to sign in through a link and pushes you to act fast.", via: "READ FROM THE EMAIL", sources: [] },
    ],
  };
}
