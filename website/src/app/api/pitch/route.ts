import { NextResponse } from "next/server";
import { chat, hasKey } from "@/lib/you";
import type { Brand, CreatorProfile } from "@/lib/types";

export const maxDuration = 60;

function template(brand: Brand, profile: CreatorProfile, name: string) {
  return `Hi ${brand.name} team,

I'm ${name}, a creator making ${profile.niche.toLowerCase()} content for ${profile.audience.toLowerCase()}. My recent posts on ${profile.topics.slice(0, 2).join(" and ").toLowerCase()} line up closely with what you make.

I'd love to create a short series for ${brand.name}: two videos built around real recipes, in my voice, with usage terms we agree up front.

Could you share your creator brief and rate card? Happy to send my media kit.

Thanks,
${name}`;
}

export async function POST(req: Request) {
  const { brand, profile, name = "Maya" } = (await req.json()) as { brand: Brand; profile: CreatorProfile; name?: string };
  if (!hasKey()) return NextResponse.json({ pitch: template(brand, profile, name), mode: "sample" });
  try {
    const pitch = await chat(
      "You write short, warm, specific pitch emails from a content creator to a brand. Under 140 words. No hype, no emoji, no em dashes. Mention one concrete reason the brand fits, and ask for their brief and rate card.",
      `Creator: ${name}. Niche: ${profile.niche}. Topics: ${profile.topics.join(", ")}. Audience: ${profile.audience}.\nBrand: ${brand.name} (${brand.category}). Why it fits: ${brand.why.join(" ")}\nWrite the email body only, starting with "Hi ${brand.name} team,".`,
      500,
    );
    return NextResponse.json({ pitch: pitch.trim() || template(brand, profile, name), mode: "live" });
  } catch (err) {
    console.error("[pitch]", err);
    return NextResponse.json({ pitch: template(brand, profile, name), mode: "sample" });
  }
}
