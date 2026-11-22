import "server-only";
import { answer, chatJson, domainOf, rootDomain, safe, search, type WebResult } from "./you";
import { bandFor, type EmailInput, type Source, type Tone, type TrustCheck, type TrustResult } from "./types";

const FREEMAIL = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "proton.me", "protonmail.com", "aol.com"];
const NOT_OFFICIAL = [
  "wikipedia.org", "facebook.com", "instagram.com", "tiktok.com", "youtube.com", "linkedin.com", "x.com", "twitter.com",
  "amazon.com", "reddit.com", "pinterest.com", "crunchbase.com", "bloomberg.com", "glassdoor.com", "yelp.com", "trustpilot.com",
];

interface Parsed {
  brand: string;
  managerName: string | null;
  agency: string | null;
  offer: string | null;
}

const toSource = (r: { url: string; title?: string; pageAge?: string; page_age?: string }): Source => ({
  title: r.title || domainOf(r.url),
  url: r.url,
  date: (r.pageAge ?? r.page_age)?.slice(0, 10),
});

const tone = (points: number, max: number): Tone => (points / max >= 0.75 ? "green" : points / max >= 0.4 ? "amber" : "red");

function linksIn(text: string): string[] {
  return Array.from(new Set(text.match(/https?:\/\/[^\s)>"']+/g) ?? []));
}

/** Pull brand, manager and agency out of the email. LLM first, rules as fallback. */
async function parseEmail(e: EmailInput): Promise<Parsed> {
  const llm = await chatJson<Parsed>(
    "You read brand-deal emails sent to content creators. Identify the brand being offered (the company whose product is promoted), the person who signed the email if they claim to be a manager/agent, their agency, and the offer.",
    `From: ${e.fromName} <${e.fromEmail}>\nSubject: ${e.subject}\n\n${e.body}\n\nReturn {"brand": string, "managerName": string|null, "agency": string|null, "offer": string|null}. managerName and agency are null when the email comes from the brand's own team.`,
    400,
  );
  if (llm?.brand) return llm;

  const brand = e.fromName
    .replace(/\b(partnerships?|creator team|creators|influencer team|marketing|team|collabs?)\b/gi, "")
    .split(/[,|-]/)[0]
    .trim();
  const agencyMatch = e.fromName.match(/,\s*(.+)$/);
  return {
    brand: agencyMatch ? agencyMatch[1].trim() : brand || domainOf(e.fromEmail.split("@")[1] ?? "").split(".")[0],
    managerName: agencyMatch ? e.fromName.split(",")[0].trim() : signerOf(e.body),
    agency: agencyMatch ? agencyMatch[1].trim() : null,
    offer: null,
  };
}

/** The person who signed the email: the first "First Last" line after a sign-off. */
function signerOf(body: string): string | null {
  const lines = body.split("\n").map((l) => l.trim());
  const i = lines.findIndex((l) => /^(best|thanks|thank you|cheers|regards|kind regards|best regards|warmly|talk soon|sincerely)[,!.]?$/i.test(l));
  if (i < 0) return null;
  const next = lines.slice(i + 1).find(Boolean) ?? "";
  return /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(next) ? next : null;
}

/** "Hearth & Pan Co." -> "hearthpan": letters and digits only, without "and", "co", "inc". */
function nameKey(s: string) {
  return s.toLowerCase().replace(/&|\band\b|\b(co|inc|llc|ltd)\b\.?/g, "").replace(/[^a-z0-9]/g, "");
}

/** Check 1, 30 points: does the sender domain and every link match the brand's real site? */
async function identityCheck(e: EmailInput, p: Parsed): Promise<{ check: TrustCheck; realDomain: string | null }> {
  const sender = rootDomain(e.fromEmail.split("@")[1] ?? "");
  const results = (await safe("identity", search(`${p.brand} official website`, { count: 8 }))) ?? [];
  // The official site's domain must carry the whole brand name ("brightline.com" is not "Brightline Talent").
  const key = nameKey(p.brand);
  const candidates = results.filter((r) => {
    const d = rootDomain(domainOf(r.url));
    return d && !NOT_OFFICIAL.some((n) => d.endsWith(n));
  });
  // 1) The sender's own domain ranks near the top for "<brand> official website": it's theirs
  //    (handles names like "Grubhub for Drivers" writing from grubhub.com).
  // 2) Otherwise, a top result whose domain carries the whole brand name.
  const official =
    candidates.slice(0, 3).find((r) => rootDomain(domainOf(r.url)) === sender && key.includes(nameKey(sender.split(".")[0]))) ??
    candidates.find((r) => nameKey(rootDomain(domainOf(r.url)).split(".")[0]).includes(key));
  const realDomain = official ? rootDomain(domainOf(official.url)) : null;
  const linkDomains = linksIn(e.body).map((l) => rootDomain(domainOf(l)));
  const offLinks = realDomain ? linkDomains.filter((d) => d !== realDomain) : [];
  const slug = p.brand.toLowerCase().replace(/[^a-z0-9]/g, "");
  const looksLike = sender.replace(/[^a-z0-9]/g, "").includes(slug.slice(0, Math.max(4, slug.length - 2)));

  let points: number;
  let finding: string;
  if (!realDomain) {
    points = 12;
    finding = `Couldn't find an official site for ${p.brand} to compare against.`;
  } else if (sender === realDomain) {
    points = offLinks.length ? 20 : 30;
    finding = offLinks.length
      ? `Sender matches ${realDomain}, but a link goes to ${offLinks[0]}.`
      : `Sender domain matches the brand's real site, ${realDomain}.`;
  } else if (FREEMAIL.includes(sender)) {
    points = 6;
    finding = `Sent from a free ${sender} address. ${p.brand}'s real site is ${realDomain}.`;
  } else if (looksLike) {
    points = 0;
    finding = `Lookalike domain ${sender}. The real site is ${realDomain}.`;
  } else {
    points = 8;
    finding = `${sender} isn't ${p.brand}'s domain. The real site is ${realDomain}.`;
  }

  return {
    realDomain,
    check: {
      id: "identity",
      name: "Sender identity",
      points,
      max: 30,
      tone: tone(points, 30),
      finding,
      via: "YOU.COM SEARCH",
      sources: official ? [toSource(official)] : results.slice(0, 2).map(toSource),
    },
  };
}

const SCAM_WORDS = /\b(scam|scammer|fraud|phishing|fake|impersonat|stole|hacked)/i;

/** Check 2, 25 points: public scam reports about the domain or the offer. */
async function scamCheck(e: EmailInput, p: Parsed, realDomain: string | null): Promise<TrustCheck> {
  const sender = rootDomain(e.fromEmail.split("@")[1] ?? "");
  const senderIsReal = realDomain !== null && sender === realDomain;
  const [byDomain, byBrand] = await Promise.all([
    senderIsReal ? Promise.resolve([] as WebResult[]) : safe("scam-domain", search(`"${sender}" scam`, { freshness: "year", count: 8 })),
    safe("scam-brand", search(`"${p.brand}" sponsorship email scam creators`, { freshness: "year", count: 8 })),
  ]);
  const text = (r: WebResult) => `${r.title} ${r.description} ${r.snippets.join(" ")}`;
  // A report about this domain names it in its title or address and calls it a scam there,
  // not just a page that mentions the domain somewhere near the word "scam".
  const headline = (r: WebResult) => `${r.title} ${r.url}`.toLowerCase();
  const domainHits = (byDomain ?? []).filter(
    (r) => headline(r).includes(sender.split(".")[0]) && SCAM_WORDS.test(r.title) && !/\blegit\b|\breview/i.test(r.title),
  );
  const brandHits = (byBrand ?? []).filter(
    (r) => nameKey(text(r)).includes(nameKey(p.brand)) && SCAM_WORDS.test(text(r)),
  );

  let points: number;
  let finding: string;
  if (domainHits.length) {
    points = 0;
    finding = `${domainHits.length} public report${domainHits.length > 1 ? "s" : ""} call ${sender} a scam.`;
  } else if (brandHits.length && !senderIsReal) {
    points = 10;
    finding = `Public reports of scammers impersonating ${p.brand} in sponsor emails. Nothing yet about this exact domain.`;
  } else if (brandHits.length) {
    points = 20;
    finding = `Scammers have impersonated ${p.brand}, but this email comes from their real domain.`;
  } else {
    points = 25;
    finding = "No public scam reports found about this sender or offer.";
  }
  if (byDomain === null && byBrand === null) {
    points = 12;
    finding = "Couldn't reach the web for scam reports. Treat with care.";
  }
  return {
    id: "scam",
    name: "Scam reports",
    points,
    max: 25,
    tone: tone(points, 25),
    finding,
    via: "YOU.COM SEARCH · PAST YEAR",
    sources: [...domainHits, ...brandHits].slice(0, 4).map(toSource),
  };
}

/** Check 3, 20 points: lawsuits, court cases, regulator actions, unpaid-creator complaints. */
async function healthCheck(p: Parsed): Promise<TrustCheck> {
  const a = await safe(
    "health",
    answer(
      `Has ${p.brand} faced lawsuits, court cases, regulator actions, or complaints about not paying influencers or creators in the past year? Answer briefly and say clearly if none were found.`,
      { freshness: "year" },
    ),
  );
  if (!a) {
    return {
      id: "health", name: "Lawsuits and court cases", points: 10, max: 20, tone: "amber",
      finding: "Couldn't run this check right now.", via: "YOU.COM ANSWER · PAST YEAR", sources: [],
    };
  }
  const graded = await chatJson<{ points: number; finding: string }>(
    "You grade business-health research for a creator deciding whether to work with a brand. 20 = no lawsuits/complaints found, 12-16 = minor or old issues, 5-10 = active lawsuits or regulator action, 0-4 = fraud or unpaid-creator pattern.",
    `Brand: ${p.brand}\nResearch:\n${a.answer.slice(0, 2500)}\n\nReturn {"points": 0-20, "finding": "one plain sentence under 20 words, say 'no reports found' rather than 'clean'"}`,
    300,
  );
  const lower = a.answer.toLowerCase();
  const noneFound = /\b(no (public )?(record|evidence|reports?|lawsuits?|indication)|not (found|aware)|did not find|none (were )?found)\b/.test(lower);
  const points = Math.max(0, Math.min(20, Math.round(graded?.points ?? (noneFound ? 18 : 10))));
  const finding =
    graded?.finding ??
    (noneFound ? "No lawsuits, court cases or unpaid-creator complaints found." : a.answer.replace(/\[\[[\d,\s]+\]\]/g, "").slice(0, 140));
  return {
    id: "health",
    name: "Lawsuits and court cases",
    points,
    max: 20,
    tone: tone(points, 20),
    finding,
    via: "YOU.COM ANSWER · PAST YEAR",
    // Answer cites nothing when nothing was found, so show the pages it searched instead.
    sources: (a.citations.length
      ? a.citations.map((c) => {
          const r = a.results.find((x) => x.url === c.source);
          return { title: r?.title ?? domainOf(c.source), url: c.source, date: r?.page_age?.slice(0, 10) };
        })
      : a.results.map((r) => ({ title: r.title, url: r.url, date: r.page_age?.slice(0, 10) }))
    ).slice(0, 4),
  };
}

/** Check 4, 15 points: the manager or agency is real and works where they claim. */
async function managerCheck(p: Parsed): Promise<TrustCheck> {
  const base = { id: "manager" as const, name: "Manager check", max: 15, via: "YOU.COM SEARCH" };
  if (!p.managerName && !p.agency) {
    return { ...base, points: 15, tone: "green", finding: "No middleman. The email claims to come from the brand's own team.", sources: [] };
  }
  // Where they claim to work: their agency, or the brand itself when a named person signs for the brand.
  const org = p.agency ?? p.brand;
  const person = p.managerName;
  const results =
    (await safe("manager", search(person ? `"${person}" "${org}"` : `"${org}" talent management agency`, { count: 10 }))) ?? [];
  const text = (r: WebResult) => `${r.title} ${r.description} ${r.snippets.join(" ")}`;
  // A hit needs the full name and the organisation on the same page.
  const hits = person
    ? results.filter((r) => text(r).toLowerCase().includes(person.toLowerCase()) && nameKey(text(r)).includes(nameKey(org)))
    : [];
  const orgPages = results.filter((r) => nameKey(`${r.title} ${domainOf(r.url)}`).includes(nameKey(org)));

  let points: number;
  let finding: string;
  if (person && hits.length) {
    points = 15;
    finding = `${person} shows up publicly with ${org}.`;
  } else if (!person && orgPages.length) {
    points = 10;
    finding = `${org} has a public presence, but no manager is named.`;
  } else if (p.agency && orgPages.length) {
    points = 7;
    finding = `${org} exists, but ${person ?? "the sender"} isn't listed on any public page.`;
  } else if (person && !p.agency) {
    points = 0;
    finding = `“${person}” isn't on ${org}'s pages or any public profile with them.`;
  } else {
    points = 0;
    finding = `“${[person, p.agency].filter(Boolean).join(", ")}” isn't on any public profile or agency page.`;
  }
  return { ...base, points, tone: tone(points, 15), finding, sources: [...hits, ...orgPages].slice(0, 3).map(toSource) };
}

/** Check 5, 10 points: red flags in the email itself. No web. */
function flagsCheck(e: EmailInput, realDomain: string | null): TrustCheck {
  const text = `${e.subject}\n${e.body}`;
  const flags: string[] = [];
  if (/\b(sign[ -]?in|log[ -]?in|verify (your )?account|confirm (your )?(account|identity)|connect your (youtube|instagram|tiktok))\b/i.test(text))
    flags.push("asks you to sign in through a link");
  if (/\b(within 24 hours|today only|immediately|urgent|asap|expires? (today|tonight)|confirm today)\b/i.test(text)) flags.push("pushes you to act fast");
  if (/\b(fee|deposit|pay (us|upfront|first)|processing charge|onboarding cost)\b/i.test(text)) flags.push("asks for money up front");
  if (/\.(zip|rar|exe|scr|dmg|apk)\b|\bdownload (the|our) (brief|contract|file)/i.test(text)) flags.push("asks you to download a file");
  if (/\b(whatsapp|telegram|signal)\b/i.test(text)) flags.push("moves the chat to WhatsApp or Telegram");
  if (/\bgift ?card|crypto|bitcoin|usdt\b/i.test(text)) flags.push("mentions gift cards or crypto");
  const links = linksIn(e.body).map((l) => rootDomain(domainOf(l)));
  const sender = rootDomain(e.fromEmail.split("@")[1] ?? "");
  const thirdParty = links.filter((d) => d !== sender && d !== realDomain && !["docusign.net", "docusign.com", "calendly.com", "dropbox.com", "google.com"].includes(d));
  if (thirdParty.length) flags.push(`links to ${thirdParty[0]}`);

  const points = Math.max(0, 10 - flags.length * 4);
  return {
    id: "flags",
    name: "Red flags in the email",
    points,
    max: 10,
    tone: tone(points, 10),
    finding: flags.length ? `It ${flags.slice(0, 2).join(" and ")}.` : "No sign-in links, fees, downloads or pressure tactics.",
    via: "READ FROM THE EMAIL",
    sources: [],
  };
}

const HEADLINE = {
  risky: "Likely a fake sponsor email. Don't click its links.",
  check: "Some things don't add up. Check before you reply.",
  safe: "Looks like a real offer from a real brand.",
};

export async function runTrustScore(e: EmailInput): Promise<TrustResult> {
  const parsed = await parseEmail(e);
  const flagsPre = flagsCheck(e, null);
  const [identity, health, manager] = await Promise.all([identityCheck(e, parsed), healthCheck(parsed), managerCheck(parsed)]);
  const scam = await scamCheck(e, parsed, identity.realDomain);
  const flags = identity.realDomain ? flagsCheck(e, identity.realDomain) : flagsPre;
  const checks = [identity.check, scam, health, manager, flags];
  const score = checks.reduce((s, c) => s + c.points, 0);
  const band = bandFor(score);
  const sender = rootDomain(e.fromEmail.split("@")[1] ?? "");

  return {
    mode: "live",
    emailId: e.id,
    score,
    band,
    headline: HEADLINE[band],
    brand: parsed.brand,
    realDomain: identity.realDomain,
    note:
      identity.realDomain && sender !== identity.realDomain
        ? `${parsed.brand}'s real team writes from ${identity.realDomain}.`
        : null,
    checks,
    generatedAt: new Date().toISOString(),
  };
}
