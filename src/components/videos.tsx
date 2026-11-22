import type { CreatorVideo } from "@/lib/types";
import { PLATFORM_LABEL, videoBackground } from "@/lib/videos";

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
