"use client";

import Link from "next/link";
import { useState } from "react";
import { BrowserFrame, Eyebrow, PhoneFrame, SectionHeading } from "@/components/desktop/landing";
import { Icon, Logo, PrimaryLink, ScoreRing, Segmented } from "@/components/desktop/ui";

const orb = { background: "radial-gradient(circle at 58% 38%, #FFD27A 0%, #FF8A3D 30%, #FF4D6D 55%, rgba(255,120,150,0.35) 68%, rgba(255,255,255,0) 74%)" };
const violetWash = { background: "radial-gradient(110% 80% at 100% 0%, rgba(124,92,230,0.16) 0%, rgba(255,255,255,0) 60%), #fff" };
const greenWash = { background: "radial-gradient(110% 80% at 100% 0%, rgba(43,163,106,0.16) 0%, rgba(255,255,255,0) 60%), #fff" };

const NAV = [
  ["How it works", "#how"],
  ["Trust Score", "#trust"],
  ["Who it's for", "#who"],
  ["Benefits", "#benefits"],
  ["Pricing", "#pricing"],
  ["FAQ", "#faq"],
] as const;

const FACTS = [
  { value: "2 tools", label: "Brand Match and Trust Score in one app" },
  { value: "5 checks", label: "Run on every brand or manager email" },
  { value: "7 or 30 days", label: "Matched on your newest posts, not old stats" },
  { value: "Every finding", label: "Links to the public page it came from" },
];

const PAINS = [
  {
    icon: Icon.shield,
    title: "Fake sponsors look real",
    body: "Scam emails copy real brand names, use lookalike domains and push you to “sign in” or pay a fee. One wrong click can cost you your account.",
  },
  {
    icon: Icon.dollar,
    title: "You don't know what to charge",
    body: "Brands rarely publish rates. Without numbers, it's easy to quote too low, or to lose the deal by guessing too high.",
  },
  {
    icon: Icon.calendar,
    title: "Finding brands takes hours",
    body: "Scrolling hashtags and Googling “creator program” every week eats the time you should spend making content.",
  },
];

const STEPS = [
  {
    tag: "Set up",
    title: "Add your recent videos",
    body: "Sign up with Google or email, then paste links to three recent YouTube, TikTok or Instagram videos. Vetted reads them with You.com to learn what you actually make.",
    points: ["No account login needed.", "Choose to match on the last 7 or 30 days."],
    img: "/screenshots/connect.webp",
    alt: "Onboarding step one: three recent video links from YouTube, TikTok and Instagram pasted in",
  },
  {
    tag: "Set up",
    title: "Tell us your niche and city",
    body: "Pick up to three niches and where you're based. Turn on local businesses to include restaurants and shops near you that hire creators.",
    points: ["Your posts refine the niche for you.", "Country helps find brands active where you are."],
    img: "/screenshots/niche.webp",
    alt: "Onboarding step two: pick up to three niches and set your country and city",
  },
  {
    tag: "Brand Match",
    title: "See brands that fit you",
    body: "Your matches show how well each brand fits your content, what it pays creators, whether it's hiring now, and the videos other creators made for it. The best fit is pinned to the top.",
    points: ["Pay ranges come from public sources.", "Switch between this week and this month."],
    img: "/screenshots/matches.webp",
    alt: "Brand matches grid showing four brands with creator videos, pay ranges, hiring status and fit scores",
  },
  {
    tag: "Brand Match",
    title: "Open a brand and draft a pitch",
    body: "See why the brand fits you, what it pays, videos creators made for it and every source behind it. One click drafts a short, specific pitch email in your voice that you can edit and copy.",
    points: ["The pitch asks for their brief and rate card.", "Redraft until it sounds like you."],
    img: "/screenshots/pitch.webp",
    alt: "Brand detail page with a drafted pitch email open in a dialog",
  },
  {
    tag: "Trust Score",
    title: "Check every offer before you reply",
    body: "Your Trust inbox scores each brand email from 0 to 100. Open one to see the five checks behind the score, and the sources behind each check.",
    points: ["Risky emails are flagged in red.", "“See the real brand” takes you to its real site."],
    img: "/screenshots/trust.webp",
    alt: "Trust inbox showing a fake sponsor email scored 30 out of 100, marked Risky",
  },
];

const CHECKS = [
  { name: "Sender identity", detail: "Does the sender domain match the brand's real website? Catches lookalike and free-mail addresses.", pts: 30 },
  { name: "Scam reports", detail: "Public reports from the past year about the domain or the offer.", pts: 25 },
  { name: "Lawsuits and court cases", detail: "Including complaints from creators who weren't paid.", pts: 20 },
  { name: "Manager check", detail: "Is the manager or agency real, and do they really work there?", pts: 15 },
  { name: "Red flags in the email", detail: "Sign-in links, upfront fees, pressure to act today, WhatsApp, downloads.", pts: 10 },
];

const PERSONAS = [
  {
    icon: Icon.sparkle,
    title: "Creators landing their first deals",
    body: "You're starting to get brand emails but can't tell which are real. Vetted checks them for you and shows which brands work with creators your size.",
  },
  {
    icon: Icon.people,
    title: "Growing micro and mid-size creators",
    body: "You have an engaged audience and want steady paid work. Brand Match finds brands hiring in your niche each week and what they pay.",
  },
  {
    icon: Icon.mail,
    title: "Full-time creators with busy inboxes",
    body: "Dozens of offers a week, some from “managers” you've never heard of. Trust Score sorts them into Looks safe, Check first and Risky.",
  },
  {
    icon: Icon.shield,
    title: "Managers and small agencies",
    body: "Vet brands and offers for every creator you represent, with a source behind each finding you can share with your clients.",
  },
];

const BENEFITS = [
  { icon: Icon.calendar, title: "Save hours every week", body: "Brands that fit you, found from this week's web. No more scrolling hashtags to see who's sponsoring." },
  { icon: Icon.dollar, title: "Know your worth before you quote", body: "Public pay ranges per post or campaign, so you can price with confidence and ask for usage rights on top." },
  { icon: Icon.shield, title: "Avoid scams and fake managers", body: "Lookalike domains, fake agencies and fee requests are flagged before you click a single link." },
  { icon: Icon.sparkle, title: "Pitch in minutes, not hours", body: "A short, specific pitch drafted from your real posts and the brand's real campaigns. Edit and copy." },
  { icon: Icon.globe, title: "Every claim has a source", body: "Each match and each check links to the public page it came from, with a date. Nothing is a black box." },
  { icon: Icon.check, title: "Private by design", body: "Read-only access. We never post, send, reply or delete. Disconnect any time." },
];

const BEFORE_AFTER = [
  ["Googling “brand ambassador program” every week", "Fresh matches from your last 7 or 30 days of posts"],
  ["Guessing a rate and hoping it's right", "Public pay ranges for each brand, with sources"],
  ["Clicking a “contract” link to see if it's real", "A 0–100 Trust Score before you open anything"],
  ["Trusting a “manager” you can't find online", "A manager check against public profiles"],
  ["Writing every pitch from scratch", "A drafted pitch you can edit and copy"],
];

/**
 * Pricing. Prices are in USD per month; `yearly` is the per-month price when billed yearly.
 * Edit this list to change the plans: the cards and the table below read from it.
 */
const PLANS = [
  {
    id: "free",
    name: "Free",
    blurb: "Try Vetted and check the odd offer.",
    monthly: 0,
    yearly: 0,
    cta: "Start free",
    href: "/signup",
    features: ["5 Trust Score checks a month", "Brand Match on your last 30 days, top 3 brands", "3 pitch drafts a month", "Paste emails to check them"],
  },
  {
    id: "creator",
    name: "Creator",
    blurb: "For creators who get brand emails every week.",
    monthly: 12,
    yearly: 9,
    cta: "Start 14-day free trial",
    href: "/signup?plan=creator",
    popular: true,
    features: [
      "Unlimited Trust Score checks",
      "Connect Gmail: every brand email scored (Outlook soon)",
      "Full Brand Match, last 7 or 30 days",
      "Pay ranges and hiring status for every brand",
      "Unlimited pitch drafts",
      "Creator videos and saved brands",
    ],
  },
  {
    id: "agency",
    name: "Agency",
    blurb: "For managers vetting deals for several creators.",
    monthly: 39,
    yearly: 29,
    cta: "Start 14-day free trial",
    href: "/signup?plan=agency",
    features: ["Everything in Creator", "Up to 10 creator profiles", "One inbox for all your creators' offers", "Share a Trust Score report with a link", "Export findings and sources as PDF", "Priority support"],
  },
];

const PLAN_TABLE: Array<[string, string, string, string]> = [
  ["Trust Score checks", "5 a month", "Unlimited", "Unlimited"],
  ["Inbox connection", "Paste only", "Gmail (Outlook soon)", "Shared inbox"],
  ["Brand Match window", "30 days", "7 or 30 days", "7 or 30 days"],
  ["Brands per match", "Top 3", "All", "All"],
  ["Pitch drafts", "3 a month", "Unlimited", "Unlimited"],
  ["Creator profiles", "1", "1", "Up to 10"],
  ["Shareable reports", "—", "—", "Yes"],
];

function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  return (
    <section id="pricing" className="scroll-mt-16 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-24">
        <div className="flex flex-col items-center gap-6">
          <SectionHeading
            center
            eyebrow="Pricing"
            title={
              <>
                Start free. Upgrade when the <b>offers</b> pile up.
              </>
            }
            sub="Every plan includes sources on every finding, read-only access and the five Trust Score checks."
          />
          <div className="flex items-center gap-3">
            <Segmented
              value={billing}
              onChange={setBilling}
              options={[
                { value: "monthly", label: "Monthly" },
                { value: "yearly", label: "Yearly" },
              ]}
            />
            <span className="rounded-full bg-ok-bg px-2.5 py-1 text-xs font-semibold text-ok">Save 25% yearly</span>
          </div>
        </div>

        <div className="grid items-stretch gap-5 lg:grid-cols-3">
          {PLANS.map((p) => {
            const price = billing === "yearly" ? p.yearly : p.monthly;
            return (
              <div
                key={p.id}
                className={`relative flex flex-col gap-6 rounded-[28px] border p-7 ${
                  p.popular ? "border-ink bg-ink text-white shadow-[0_30px_70px_rgba(24,24,27,0.25)] lg:-my-3 lg:py-10" : "border-line bg-white"
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-7 rounded-full px-3 py-1 text-xs font-semibold text-ink" style={{ background: "linear-gradient(90deg, #FFD27A, #FF8A3D)" }}>
                    Most popular
                  </span>
                )}
                <div className="flex flex-col gap-1.5">
                  <span className="text-lg font-semibold">{p.name}</span>
                  <span className={`text-sm ${p.popular ? "text-white/70" : "text-muted"}`}>{p.blurb}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="flex items-baseline gap-1.5">
                    <span className="text-[44px] font-semibold leading-none tracking-[-0.03em]">${price}</span>
                    <span className={`text-sm ${p.popular ? "text-white/70" : "text-muted"}`}>{price ? "/ month" : "forever"}</span>
                  </span>
                  <span className={`min-h-4 text-xs ${p.popular ? "text-white/60" : "text-muted"}`}>
                    {price ? (billing === "yearly" ? `Billed $${p.yearly * 12} a year` : "Billed monthly") : "No card needed"}
                  </span>
                </div>
                <Link
                  href={p.href}
                  className={`flex h-12 items-center justify-center gap-2 rounded-full text-[15px] font-semibold ${
                    p.popular ? "bg-white text-ink hover:bg-soft" : "border border-line-2 bg-white hover:bg-soft"
                  }`}
                >
                  {p.cta}
                </Link>
                <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                  {p.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2.5 text-sm ${p.popular ? "text-white/90" : "text-ink-3"}`}>
                      <span className="mt-0.5">{Icon.tick({ size: 15, color: p.popular ? "#7BE0A8" : "#18794E" })}</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Compare plans */}
        <div className="overflow-x-auto rounded-[24px] border border-line bg-white">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <caption className="sr-only">Compare plans</caption>
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="p-4 font-semibold">Compare plans</th>
                {PLANS.map((p) => (
                  <th key={p.id} scope="col" className={`p-4 font-semibold ${p.popular ? "text-violet" : ""}`}>
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PLAN_TABLE.map(([label, ...vals]) => (
                <tr key={label} className="border-b border-line last:border-0">
                  <th scope="row" className="p-4 font-normal text-ink-3">{label}</th>
                  {vals.map((v, i) => (
                    <td key={i} className={`p-4 ${v === "—" ? "text-muted" : "font-medium text-ink-2"} ${i === 1 ? "bg-violet-bg/40" : ""}`}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="m-0 text-center text-[13px] text-muted">Prices in USD. Cancel any time. Paid plans start with a 14-day free trial.</p>
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: "Is Vetted free?",
    a: "Yes, there's a free plan with 5 Trust Score checks a month and your top 3 brand matches, no card needed. Paid plans add unlimited checks, inbox connection and full Brand Match. See Pricing above.",
  },
  {
    q: "Can I cancel or switch plans?",
    a: "Yes. Paid plans start with a 14-day free trial, and you can cancel, upgrade or downgrade any time from Settings. Yearly plans cost 25% less than paying monthly.",
  },
  {
    q: "Where does the data come from?",
    a: "Everything comes from the public web, live, through You.com's Search, Extract, Answer and Research APIs. Each finding links to its source page and date.",
  },
  {
    q: "Will Vetted post or send emails for me?",
    a: "No. Access to your accounts and inbox is read-only. We never post, send, reply or delete anything, and you can disconnect at any time.",
  },
  {
    q: "Is a Trust Score legal advice?",
    a: "No. It's a web check, not a legal one. Findings say “public reports found” or “no reports found”, never “clean”. Use it to decide what to look into before you reply.",
  },
  {
    q: "How is the fit score worked out?",
    a: "From the topics in your recent posts, how closely the brand's creator campaigns match them, whether the brand is hiring now, and whether public pay data exists.",
  },
  {
    q: "What does “Sample data” mean?",
    a: "If a live lookup can't run, the app shows a saved sample run and labels it “Sample data”, so you never mistake it for live results. Live results are marked “Live · You.com”.",
  },
];

function StepNumber({ n }: { n: number }) {
  return <span className="flex size-9 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">{n}</span>;
}

export default function Landing() {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* ---------- Nav ---------- */}
      <header className="sticky top-0 z-30 border-b border-line bg-page/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-ink-3 lg:flex">
            {NAV.map(([label, href]) => (
              <a key={href} href={href} className="hover:text-ink">
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/signup?mode=signin" className="hidden h-10 items-center px-3 text-sm font-medium text-ink-3 hover:text-ink xl:flex">
              Sign in
            </Link>
            <a
              href="/mobile"
              title="Switch to phone view"
              className="flex h-10 min-w-10 items-center justify-center gap-2 rounded-full border border-line-2 bg-white px-3 text-sm font-semibold text-ink hover:bg-soft sm:px-4"
            >
              {Icon.phone({ size: 17 })}
              <span className="sr-only sm:not-sr-only">Phone view</span>
            </a>
            <Link href="/signup" className="flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-white hover:bg-ink-2">
              {Icon.monitor({ size: 17, color: "#fff" })}
              Web app
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ---------- Hero ---------- */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="absolute -right-24 top-24 size-[340px] rounded-full opacity-70 blur-[6px]" style={orb} />
          <div aria-hidden className="absolute -left-32 top-[420px] size-[300px] rounded-full opacity-40 blur-[30px]" style={{ background: "radial-gradient(circle, rgba(124,92,230,0.5), rgba(255,255,255,0) 70%)" }} />
          <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-7 px-6 pb-10 pt-16 text-center md:pt-24">
            <span className="flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink-4">
              <span className="size-1.5 rounded-full bg-[#2BA36A]" /> For creators · Powered by You.com
            </span>
            <h1 className="m-0 max-w-4xl text-[46px] font-normal leading-[1.04] tracking-[-0.04em] md:text-[72px]">
              Deals that <b>fit</b>. From people you <b>trust</b>.
            </h1>
            <p className="m-0 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
              Vetted finds brands hiring creators like you, shows what they pay, and checks every sponsor email for scams before you reply.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <PrimaryLink href="/signup">Get started free</PrimaryLink>
              <a href="#how" className="flex h-12 items-center gap-2 rounded-full border border-line-2 bg-white px-6 text-[15px] font-semibold hover:bg-soft">
                See how it works
              </a>
            </div>
            <span className="text-[13px] text-muted">Free for 5 Trust Score checks a month. No card needed.</span>
          </div>

          <div className="relative mx-auto max-w-6xl px-6 pb-20">
            <BrowserFrame src="/screenshots/matches.webp" alt="Vetted Brand matches screen with four matched brands, creator videos, pay ranges and fit scores" url="vetted.app/matches" priority />
            {/* Floating Trust Score card */}
            <div className="absolute -bottom-2 left-2 hidden w-[340px] items-center gap-3 rounded-[22px] border border-[#F6D9D9] p-4 shadow-[0_20px_50px_rgba(24,24,27,0.18)] md:flex lg:-left-6" style={{ background: "radial-gradient(90% 70% at 30% 0%, rgba(229,72,77,0.12) 0%, rgba(255,255,255,0) 72%), #fff" }}>
              <div className="-mr-5 origin-left scale-[0.7]">
                <ScoreRing score={23} band="risky" />
              </div>
              <div className="flex flex-col gap-1 text-left">
                <span className="w-fit rounded-full bg-bad-bg px-2 py-0.5 text-[11px] font-semibold text-bad">Risky</span>
                <span className="text-sm font-medium leading-snug">Likely a fake sponsor email.</span>
                <span className="truncate text-xs text-muted">partners@lodge-castiron-collab.com</span>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Facts strip ---------- */}
        <section className="border-y border-line bg-white">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
            {FACTS.map((f) => (
              <div key={f.value} className="flex flex-col gap-1">
                <span className="text-2xl font-semibold tracking-[-0.02em]">{f.value}</span>
                <span className="text-sm text-muted">{f.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- Problem ---------- */}
        <section className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-24">
          <SectionHeading
            eyebrow="The problem"
            title={
              <>
                Brand deals shouldn&apos;t feel like a <b>gamble</b>
              </>
            }
            sub="Creators lose time, money and sometimes their accounts to the same three problems."
          />
          <div className="grid gap-5 md:grid-cols-3">
            {PAINS.map((p) => (
              <div key={p.title} className="flex flex-col gap-3 rounded-[24px] border border-line bg-white p-6">
                <span className="flex size-11 items-center justify-center rounded-xl bg-bad-bg">{p.icon({ color: "#B4232A" })}</span>
                <span className="text-lg font-semibold">{p.title}</span>
                <span className="leading-relaxed text-muted">{p.body}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- Two tools ---------- */}
        <section className="mx-auto grid max-w-6xl gap-5 px-6 pb-24 md:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-[28px] border border-[#E4E1F5] p-8" style={violetWash}>
            <span className="flex size-11 items-center justify-center rounded-xl bg-violet-bg">{Icon.star({ color: "#5B47B8" })}</span>
            <h3 className="m-0 text-2xl font-semibold tracking-[-0.02em]">Brand Match</h3>
            <p className="m-0 leading-relaxed text-muted">Brands that fit your last 7 or 30 days of posts, what they pay creators, and whether they&apos;re hiring now.</p>
            <a href="#how" className="text-sm font-semibold text-violet hover:underline">
              See how it works →
            </a>
          </div>
          <div className="flex flex-col gap-4 rounded-[28px] border border-[#D9EDE2] p-8" style={greenWash}>
            <span className="flex size-11 items-center justify-center rounded-xl bg-ok-bg">{Icon.shield({ color: "#136B43" })}</span>
            <h3 className="m-0 text-2xl font-semibold tracking-[-0.02em]">Trust Score</h3>
            <p className="m-0 leading-relaxed text-muted">Rates any brand, manager or promo email from 0 to 100: Looks safe, Check first or Risky. Five checks, each with sources.</p>
            <a href="#trust" className="text-sm font-semibold text-ok hover:underline">
              See the five checks →
            </a>
          </div>
        </section>

        {/* ---------- How to use it ---------- */}
        <section id="how" className="scroll-mt-16 border-t border-line bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-20 px-6 py-24">
            <SectionHeading
              center
              eyebrow="How to use it"
              title={
                <>
                  From sign-up to your first <b>safe deal</b> in five steps
                </>
              }
              sub="Setup takes about two minutes. After that, matches refresh as you post and every brand email gets a score."
            />

            {STEPS.map((s, i) => {
              const flip = i % 2 === 1;
              return (
                <div key={s.title} className={`grid items-center gap-10 lg:gap-14 ${flip ? "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]" : "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"}`}>
                  <div className={`flex flex-col gap-4 ${flip ? "lg:order-2" : ""}`}>
                    <div className="flex items-center gap-3">
                      <StepNumber n={i + 1} />
                      <Eyebrow tone={s.tag === "Trust Score" ? "green" : "violet"}>{s.tag}</Eyebrow>
                    </div>
                    <h3 className="m-0 text-[28px] font-semibold leading-tight tracking-[-0.025em]">{s.title}</h3>
                    <p className="m-0 text-[16px] leading-relaxed text-muted">{s.body}</p>
                    <ul className="m-0 flex list-none flex-col gap-2 p-0">
                      {s.points.map((p) => (
                        <li key={p} className="flex items-start gap-2 text-sm text-ink-3">
                          <span className="mt-0.5">{Icon.tick({ size: 15, color: "#18794E" })}</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={flip ? "lg:order-1" : ""}>
                    <BrowserFrame src={s.img} alt={s.alt} zoom />
                  </div>
                </div>
              );
            })}

            <div className="flex flex-col items-center gap-3 text-center">
              <PrimaryLink href="/signup">Try it now</PrimaryLink>
              <span className="text-[13px] text-muted">No card needed. Works with sample data while you set up.</span>
            </div>
          </div>
        </section>

        {/* ---------- Trust Score deep-dive ---------- */}
        <section id="trust" className="scroll-mt-16 bg-ink text-white">
          <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <div className="flex flex-col gap-8">
              <SectionHeading
                tone="light"
                eyebrow="Trust Score"
                title={
                  <>
                    Paste any email. Get a <b>score</b> in seconds.
                  </>
                }
                sub="Five checks run in parallel against this week's web. Each one shows its points and the pages it found."
              />
              <div className="flex flex-col gap-0.5 rounded-[22px] bg-white/5 p-2 ring-1 ring-white/10">
                {CHECKS.map((c) => (
                  <div key={c.name} className="flex items-start gap-4 rounded-2xl p-3">
                    <span className="mt-0.5 flex h-7 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white/10 px-2.5 text-xs font-semibold">{c.pts} pts</span>
                    <span className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold">{c.name}</span>
                      <span className="text-[13px] leading-snug text-white/60">{c.detail}</span>
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-ok-bg px-3 py-1.5 text-ok">80–100 Looks safe</span>
                <span className="rounded-full bg-warn-bg px-3 py-1.5 text-warn">50–79 Check first</span>
                <span className="rounded-full bg-bad-bg px-3 py-1.5 text-bad">Under 50 Risky</span>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <BrowserFrame src="/screenshots/check.webp" alt="Paste a brand email form filled with a suspicious offer asking for an onboarding fee" url="vetted.app/inbox/check" zoom />
              <p className="m-0 text-center text-[13px] text-white/50">Paste the sender, subject and text. Links are read as text and never opened.</p>
            </div>
          </div>
        </section>

        {/* ---------- Who it's for ---------- */}
        <section id="who" className="mx-auto flex max-w-6xl scroll-mt-16 flex-col gap-12 px-6 py-24">
          <SectionHeading
            eyebrow="Who it's for"
            title={
              <>
                Built for creators who get <b>brand emails</b>
              </>
            }
            sub="On TikTok, Instagram, YouTube or a blog. If brands write to you, or you want them to, Vetted is for you."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            {PERSONAS.map((p, i) => (
              <div key={p.title} className="flex gap-4 rounded-[24px] border border-line bg-white p-6" style={i === 0 ? violetWash : i === 2 ? greenWash : undefined}>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line bg-white">{p.icon({ color: "#18181B" })}</span>
                <span className="flex flex-col gap-1.5">
                  <span className="text-lg font-semibold">{p.title}</span>
                  <span className="leading-relaxed text-muted">{p.body}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-ink-3">
            <span className="font-medium">Popular niches:</span>
            {["Food", "Home and kitchen", "Fitness", "Beauty", "Parenting", "Travel", "Tech", "Fashion", "Finance", "Gaming"].map((n) => (
              <span key={n} className="rounded-full border border-line-2 bg-white px-3 py-1.5">
                {n}
              </span>
            ))}
          </div>
        </section>

        {/* ---------- Benefits ---------- */}
        <section id="benefits" className="scroll-mt-16 border-y border-line bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-24">
            <SectionHeading
              center
              eyebrow="Benefits"
              title={
                <>
                  More good deals. <b>Zero</b> guesswork.
                </>
              }
            />
            <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {BENEFITS.map((b) => (
                <div key={b.title} className="flex flex-col gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-soft">{b.icon({ color: "#18181B" })}</span>
                  <span className="text-lg font-semibold">{b.title}</span>
                  <span className="leading-relaxed text-muted">{b.body}</span>
                </div>
              ))}
            </div>

            {/* Before / after */}
            <div className="grid overflow-hidden rounded-[28px] border border-line md:grid-cols-2">
              <div className="flex flex-col gap-4 bg-soft p-7">
                <span className="text-sm font-semibold uppercase tracking-[0.06em] text-muted">Without Vetted</span>
                {BEFORE_AFTER.map(([before]) => (
                  <span key={before} className="flex items-start gap-3 text-[15px] text-ink-4">
                    <span className="mt-0.5">{Icon.x({ size: 15, color: "#B4232A" })}</span>
                    {before}
                  </span>
                ))}
              </div>
              <div className="flex flex-col gap-4 p-7" style={greenWash}>
                <span className="text-sm font-semibold uppercase tracking-[0.06em] text-ok">With Vetted</span>
                {BEFORE_AFTER.map(([, after]) => (
                  <span key={after} className="flex items-start gap-3 text-[15px] font-medium text-ink-2">
                    <span className="mt-0.5">{Icon.tick({ size: 15, color: "#18794E" })}</span>
                    {after}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---------- On your phone ---------- */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="absolute -left-20 bottom-0 size-[320px] rounded-full opacity-50 blur-[6px]" style={orb} />
          <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 py-24 lg:grid-cols-2">
            <div className="flex flex-col gap-6">
              <SectionHeading
                eyebrow="Anywhere"
                title={
                  <>
                    Check an offer from your <b>phone</b>
                  </>
                }
                sub="Most brand emails arrive on your phone. Vetted works in any mobile browser, so you can check a sponsor before you reply from the couch."
              />
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {["Same matches and scores on every device", "Forward offers to your check address instead of connecting an inbox", "Nothing to install"].map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-[15px] text-ink-3">
                    {Icon.tick({ size: 16, color: "#18794E" })}
                    {t}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href="/mobile"
                  className="flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-[15px] font-semibold text-white hover:bg-ink-2"
                >
                  {Icon.phone({ size: 18, color: "#fff" })}
                  Switch to phone view
                </a>
                <Link href="/signup" className="flex h-12 items-center gap-2 rounded-full border border-line-2 bg-white px-6 text-[15px] font-semibold hover:bg-soft">
                  {Icon.monitor({ size: 18 })}
                  Use it on desktop
                </Link>
              </div>
              <span className="text-[13px] text-muted">On your phone, open vettedapp.nyc and add it to your home screen.</span>
            </div>
            <div className="flex items-end justify-center gap-6">
              <PhoneFrame src="/screenshots/mobile-matches.webp" alt="Brand matches on a phone" className="hidden w-[230px] translate-y-6 sm:block" />
              <PhoneFrame src="/screenshots/mobile-trust.webp" alt="A real brand email scored 91, Looks safe, on a phone" className="w-[250px]" />
            </div>
          </div>
        </section>

        <Pricing />

        {/* ---------- FAQ ---------- */}
        <section id="faq" className="scroll-mt-16 border-t border-line bg-white">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
            <SectionHeading
              eyebrow="FAQ"
              title={
                <>
                  Questions, <b>answered</b>
                </>
              }
              sub="Anything else? Paste an email into Trust Score and see for yourself."
            />
            <div className="flex flex-col divide-y divide-line rounded-[24px] border border-line">
              {FAQS.map((f, i) => (
                <details key={f.q} className="group px-6 py-5" open={i === 0}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-chip transition group-open:rotate-45">{Icon.plus({ size: 14 })}</span>
                  </summary>
                  <p className="m-0 pt-3 leading-relaxed text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Final CTA ---------- */}
        <section className="px-6 py-24">
          <div
            className="mx-auto flex max-w-5xl flex-col items-center gap-6 overflow-hidden rounded-[36px] border border-line px-6 py-16 text-center"
            style={{ background: "radial-gradient(60% 80% at 85% 10%, rgba(255,138,61,0.28) 0%, rgba(255,77,109,0.12) 40%, rgba(255,255,255,0) 70%), radial-gradient(60% 70% at 10% 100%, rgba(124,92,230,0.20) 0%, rgba(255,255,255,0) 60%), #fff" }}
          >
            <h2 className="m-0 max-w-2xl text-[36px] font-normal leading-[1.1] tracking-[-0.03em] md:text-[48px]">
              Stop guessing. Start <b>vetting</b>.
            </h2>
            <p className="m-0 max-w-md text-lg text-muted">Find brands that fit and check every offer before you reply. Setup takes about two minutes.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <PrimaryLink href="/signup">Create your free account</PrimaryLink>
              <Link href="/inbox/check" className="flex h-12 items-center gap-2 rounded-full border border-line-2 bg-white px-6 text-[15px] font-semibold hover:bg-soft">
                {Icon.shield({ size: 16 })} Check an email now
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-line bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
          <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
            <Logo />
            <span className="max-w-xs text-sm leading-relaxed text-muted">Deals that fit. From people you trust. Brand Match and Trust Score for creators, powered by You.com.</span>
          </div>
          {[
            { h: "Product", links: [["Brand Match", "/matches"], ["Trust Score", "/inbox"], ["Check an email", "/inbox/check"], ["Phone view", "/mobile"], ["Web app", "/signup"]] },
            { h: "Learn", links: [["How it works", "#how"], ["Who it's for", "#who"], ["Pricing", "#pricing"], ["FAQ", "#faq"]] },
            { h: "Account", links: [["Sign up", "/signup"], ["Sign in", "/signup?mode=signin"]] },
            { h: "Legal", links: [["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"]] },
          ].map((col) => (
            <div key={col.h} className="flex flex-col gap-2.5 text-sm">
              <span className="font-semibold">{col.h}</span>
              {col.links.map(([label, href]) =>
                href.startsWith("#") || href.startsWith("http") || href === "/mobile" ? (
                  <a key={label} href={href} {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})} className="text-muted hover:text-ink">
                    {label}
                  </a>
                ) : (
                  <Link key={label} href={href} className="text-muted hover:text-ink">
                    {label}
                  </Link>
                ),
              )}
            </div>
          ))}
        </div>
        <div className="border-t border-line">
          <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 px-6 py-5 text-xs text-muted sm:flex-row">
            <span>© {new Date().getFullYear()} Vetted</span>
            <span>A web check, not a legal one. Findings say &ldquo;public reports found&rdquo;, never &ldquo;clean&rdquo;.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
