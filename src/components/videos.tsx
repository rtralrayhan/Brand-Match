"use client";

import { cardVideosKey, useStore } from "@/lib/store";
import type { Brand, CreatorVideo } from "@/lib/types";
import { creatorVideos, PLATFORM_LABEL, videoBackground } from "@/lib/videos";

function PlayDot({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="block drop-shadow">
      <circle cx="12" cy="12" r="11" fill="rgba(255,255,255,0.88)" />
      <path d="M10 8l6 4-6 4z" fill="#18181B" />
    </svg>
  );
}

/** A 3:4 video thumbnail: platform tag, play button, views (or handle) at the bottom.
 * Play button and caption are pinned, so the tile never overflows however small it is. */
export function VideoThumb({ video, wash, index, large }: { video: CreatorVideo; wash: string; index: number; large?: boolean }) {
  const caption = video.views ? `${video.views}${large ? " views" : ""}` : large ? (video.handle ?? "Watch") : null;
  return (
    <div
      className={`relative overflow-hidden ${large ? "h-[220px] rounded-2xl" : "aspect-[3/4] rounded-xl"}`}
      style={{ background: videoBackground(wash, index) }}
    >
      {video.thumb && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={video.thumb} alt="" className="absolute inset-0 size-full object-cover" loading="lazy" />
      )}
      <span
        className={`absolute rounded-[5px] bg-black/55 font-bold uppercase tracking-[0.04em] text-white ${large ? "left-2 top-2 px-[5px] py-0.5 text-[9px]" : "left-1.5 top-1.5 px-1 py-0.5 text-[8px]"}`}
      >
        {PLATFORM_LABEL[video.platform]}
      </span>
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <PlayDot size={large ? 34 : 20} />
      </span>
      {caption && (
        <span
          className={`absolute inset-x-0 bottom-0 truncate bg-gradient-to-b from-transparent to-black/70 font-semibold text-white ${large ? "px-2 pb-2 pt-5 text-xs" : "px-1.5 pb-1 pt-3 text-[10px] leading-tight"}`}
        >
          {caption}
        </span>
      )}
    </div>
  );
}

/** Up to three thumbnails plus a "+N" tile, for a match card (not clickable on its own). */
export function VideoStrip({ videos, wash }: { videos: CreatorVideo[]; wash: string }) {
  const shown = videos.slice(0, 3);
  const extra = videos.length - shown.length;
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {shown.map((v, i) => (
        <VideoThumb key={v.url} video={v} wash={wash} index={i} />
      ))}
      {extra > 0 && (
        <div className="flex aspect-[3/4] flex-col items-center justify-center gap-px rounded-xl border border-line bg-soft">
          <span className="text-[15px] font-semibold">+{extra}</span>
          <span className="text-[10px] text-muted">videos</span>
        </div>
      )}
    </div>
  );
}

/** The videos row on a brand card in the matches feed: found videos, a loading row while we look, or a note when there are none. */
export function CardVideos({ brand, window }: { brand: Brand; window: 7 | 30 }) {
  const { matches, cardVideos, cardVideosLoading } = useStore();
  const result = matches[window];
  const own = creatorVideos(brand);
  const key = result ? cardVideosKey(result, brand.id) : "";
  const videos = own.length ? own : (cardVideos[key] ?? []);

  if (videos.length) {
    return (
      <div className="flex flex-col gap-1.5">
        <VideoStrip videos={videos} wash={brand.wash} />
        <span className="text-xs text-muted">
          {videos.length} creator video{videos.length === 1 ? "" : "s"} for them
        </span>
      </div>
    );
  }
  if (result?.mode === "live" && !(key in cardVideos) && cardVideosLoading) {
    return (
      <div className="flex flex-col gap-1.5" aria-busy="true">
        <div className="grid grid-cols-4 gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton aspect-[3/4] rounded-xl" />
          ))}
        </div>
        <span className="text-xs text-muted">Looking for creator videos…</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-[14px] border border-dashed border-line-2 px-3 py-2.5 text-xs text-muted">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B6B74" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <path d="M10 9l5 3-5 3z" />
      </svg>
      No public creator videos found yet
    </div>
  );
}
