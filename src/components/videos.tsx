import type { CreatorVideo } from "@/lib/types";
import { PLATFORM_LABEL, videoBackground } from "@/lib/videos";

function PlayDot({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="self-center drop-shadow">
      <circle cx="12" cy="12" r="11" fill="rgba(255,255,255,0.88)" />
      <path d="M10 8l6 4-6 4z" fill="#18181B" />
    </svg>
  );
}

/** A 3:4 video thumbnail: platform tag, play button, views (or handle) at the bottom. */
export function VideoThumb({ video, wash, index, large }: { video: CreatorVideo; wash: string; index: number; large?: boolean }) {
  const caption = video.views ? `${video.views}${large ? " views" : ""}` : (video.handle ?? "Watch");
  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden ${large ? "h-[220px] rounded-2xl p-2" : "aspect-[3/4] rounded-xl p-1.5"}`}
      style={{ background: videoBackground(wash, index) }}
    >
      {video.thumb && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={video.thumb} alt="" className="absolute inset-0 size-full object-cover" loading="lazy" />
      )}
      <span className={`relative self-start rounded-[5px] bg-black/55 font-bold uppercase tracking-[0.04em] text-white ${large ? "px-[5px] py-0.5 text-[9px]" : "px-1 py-0.5 text-[8px]"}`}>
        {PLATFORM_LABEL[video.platform]}
      </span>
      <span className="relative self-center">
        <PlayDot size={large ? 34 : 22} />
      </span>
      <span
        hidden={!large && !video.views}
        className={`relative truncate bg-gradient-to-b from-transparent to-black/65 font-semibold text-white ${large ? "-mx-2 -mb-2 px-2 pb-2 pt-4 text-xs" : "-mx-1.5 -mb-1.5 px-1.5 pb-[5px] pt-2.5 text-[10px]"}`}
      >
        {caption}
      </span>
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
