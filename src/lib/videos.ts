import type { Brand, CreatorVideo, Source, VideoPlatform } from "./types";

const PLATFORMS: Array<[RegExp, VideoPlatform]> = [
  [/(^|\.)tiktok\.com$/, "tiktok"],
  [/(^|\.)instagram\.com$/, "instagram"],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "youtube"],
];

export const PLATFORM_LABEL: Record<VideoPlatform, string> = { tiktok: "TikTok", instagram: "IG", youtube: "YT" };

function youtubeId(url: URL): string | null {
  if (url.hostname.endsWith("youtu.be")) return url.pathname.slice(1) || null;
  const short = url.pathname.match(/^\/(?:shorts|embed)\/([\w-]{6,})/);
  return short?.[1] ?? url.searchParams.get("v");
}

/** Reads a source as a creator video when it links to a TikTok, Reel or YouTube video page. */
export function videoFromSource(s: Source): CreatorVideo | null {
  let url: URL;
  try {
    url = new URL(s.url);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\.|^m\./, "");
  const platform = PLATFORMS.find(([re]) => re.test(host))?.[1];
  if (!platform) return null;
  const path = url.pathname;
  const isVideo =
    platform === "tiktok" ? /\/video\//.test(path) :
    platform === "instagram" ? /^\/(reel|reels|p|tv)\//.test(path) :
    !!youtubeId(url);
  if (!isVideo) return null;
  const handle = platform === "tiktok" ? path.match(/^\/(@[\w.]+)/)?.[1] : undefined;
  const id = platform === "youtube" ? youtubeId(url) : null;
  return {
    platform,
    url: s.url,
    handle,
    title: s.title && s.title !== host ? s.title : undefined,
    date: s.date,
    thumb: id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : undefined,
  };
}

/** Videos creators made for this brand: sample data first, else whatever the research sources link to. */
export function creatorVideos(brand: Pick<Brand, "videos" | "sources">): CreatorVideo[] {
  if (brand.videos?.length) return brand.videos;
  const seen = new Set<string>();
  return brand.sources.flatMap((s) => {
    const v = videoFromSource(s);
    if (!v || seen.has(v.url)) return [];
    seen.add(v.url);
    return [v];
  });
}

/** Placeholder thumbnail tinted with the brand's colour, darker for each next tile. */
export function videoBackground(wash: string, i: number) {
  const alpha = [0.75, 0.55, 0.9, 0.65][i % 4];
  const angle = [160, 200, 140, 180][i % 4];
  return `linear-gradient(${angle}deg, rgba(${wash},${alpha}) 0%, #1F140D 100%)`;
}
