"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Photo } from "@/components/photo";
import { BodyTypeIcon } from "@/components/icons/body-types";
import type { Listing } from "@/lib/listings/types";

type Shot = { url: string; alt: string };

const ARROW = "hidden size-10 items-center justify-center rounded-full bg-white/90 text-ink-800 shadow-[var(--shadow-sm)] hover:bg-white md:flex";

/**
 * DISABLED (2026-11-12, Ian): vehicle photos are never masked, blurred or redacted automatically. This was a fixed-position overlay (no plate detection exists) that landed on the grille/bumper of
 * cropped photos instead of the plate. It is kept here only so the idea can be read later; it renders nothing and nothing may render it. The guard test (lib/gallery-no-blur.test.ts) fails if a
 * <PlateBlur /> element or a backdrop-blur overlay is put back into this file. A real version would need plate detection from the backend and the originals preserved.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function PlateBlur(): null {
  void (`<span aria-hidden className="pointer-events-none absolute bottom-[7%] left-1/2 h-[20%] w-[34%] -translate-x-1/2 rounded-md" />`);
  return null;
}

type Tab = "photos" | "video";

/** Scroll a snap row to slide `i` (smooth). */
function jump(el: HTMLElement | null, i: number) {
  if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
}

/**
 * The listing gallery. The main image is a native horizontal scroll-snap carousel (one slide per photo, touch swipe, no library) with a "1 / 10" counter that follows the swipe; arrow buttons appear on desktop only.
 * Under it a single horizontal row of 56px thumbnails (snap, the active one has an orange border and scrolls into view); tapping one jumps the carousel. Tapping the main image opens a full-screen black
 * lightbox (native <dialog>: pinch to zoom, swipe between photos, X to close, counter, Esc).
 */
export function Gallery({ listing }: { listing: Listing }) {
  const shots: Shot[] = listing.images.filter((i) => i.url.startsWith("http")).map((i) => ({ url: i.url, alt: i.alt }));
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [tab, setTab] = useState<Tab>("photos");
  // The listing's own video (the seller's walk-around, else the generated Showroom Cut) and/or its YouTube video. There is no 360 asset on a listing yet, so no 360° tab.
  const videoSrc = listing.seller_video_url ?? listing.video_url ?? null;
  const youtube = listing.youtube_embed_url ? listing.youtube_embed_url.replace("www.youtube.com", "www.youtube-nocookie.com") : null;
  const hasVideo = !!(videoSrc || youtube);
  const rail = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLUListElement>(null);
  const big = useRef<HTMLDivElement>(null);
  const dlg = useRef<HTMLDialogElement>(null);
  const n = shots.length;

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const i = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
    setActive((cur) => (cur === i ? cur : i));
  }, []);

  // Keep the active thumbnail in view (scrolling the strip itself, never the page).
  useEffect(() => {
    const s = strip.current;
    const t = s?.children[active] as HTMLElement | undefined;
    if (s && t) s.scrollTo({ left: t.offsetLeft - (s.clientWidth - t.clientWidth) / 2, behavior: "smooth" });
  }, [active]);

  // The lightbox: open at the current photo, hand the position back on close.
  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (zoom && !d.open) { d.showModal(); requestAnimationFrame(() => { const b = big.current; if (b) b.scrollLeft = active * b.clientWidth; }); }
    if (!zoom && d.open) d.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);
  const onBigScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const i = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
    setActive((cur) => (cur === i ? cur : i));
  }, []);
  function closeZoom() {
    setZoom(false);
    requestAnimationFrame(() => { const r = rail.current; if (r) r.scrollLeft = active * r.clientWidth; });
  }

  if (n === 0) {
    return (
      <div className="relative flex aspect-[16/10] flex-col items-center justify-center gap-3 overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface-2">
        <BodyTypeIcon slug={listing.van_spec.body_style} className="h-24 w-36 text-ink-300" />
        <p className="font-mono text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-eyebrow)] text-ink-400">Photos coming soon</p>
      </div>
    );
  }
  // Only dealski-sourced listings carry image_source (dealski-backend PR #3173); undefined is "photo": no badge.
  const isFallbackImage = !!listing.image_source && listing.image_source !== "photo";
  const go = (d: number) => jump(rail.current, Math.min(n - 1, Math.max(0, active + d)));

  const tabBtn = (t: Tab, label: string) => (
    <button key={t} role="tab" type="button" aria-selected={tab === t} onClick={() => setTab(t)}
      className={`h-9 rounded-[var(--radius-pill)] px-4 text-[length:var(--text-sm)] font-semibold transition-colors ${tab === t ? "bg-ink-900 text-white" : "border border-border bg-card text-ink-700 hover:border-ink-400"}`}>{label}</button>
  );

  return (
    <div className="flex flex-col gap-3">
      {hasVideo && <div role="tablist" aria-label="Media" className="flex gap-2">{tabBtn("photos", "Photos")}{tabBtn("video", "Video")}</div>}
      {tab === "video" && hasVideo && (
        <div className="space-y-3">
          {videoSrc && <video src={videoSrc} controls playsInline preload="metadata" className="w-full rounded-[var(--radius-xl)] bg-black" />}
          {!listing.seller_video_url && listing.video_vertical_url && videoSrc && (
            <p className="text-[length:var(--text-sm)] text-ink-500"><a href={listing.video_vertical_url} download className="underline hover:text-ink-800">Download the vertical version</a> for stories and reels.</p>
          )}
          {youtube && <iframe src={youtube} title="Video on YouTube" loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="aspect-video w-full rounded-[var(--radius-xl)] bg-black" />}
        </div>
      )}
      <div className={`relative overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface-2 ${tab === "video" && hasVideo ? "hidden" : ""}`}>
        <div ref={rail} onScroll={onScroll} className="flex aspect-[16/10] snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" data-testid="gallery-rail" aria-label="Vehicle photos" role="region">
          {shots.map((shot, i) => (
            <button key={i} type="button" onClick={() => setZoom(true)} aria-label={`Open photo ${i + 1} of ${n} full screen`} className="relative block size-full shrink-0 basis-full snap-center cursor-zoom-in">
              <Photo src={shot.url} alt={shot.alt} sizes="(min-width: 1024px) 62vw, 100vw" first={i === 0} className="object-cover" draggable={false} />
            </button>
          ))}
        </div>
        {isFallbackImage && (
          <span className="pointer-events-none absolute bottom-3 left-3 rounded-[var(--radius-pill)] bg-ink-900/70 px-2.5 py-1 text-[length:var(--text-2xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-white backdrop-blur-sm">Stock image</span>
        )}
        {n > 1 && (
          <span className="pointer-events-none absolute bottom-3 right-3 rounded-[var(--radius-pill)] bg-ink-900/80 px-2.5 py-1 font-mono text-[length:var(--text-xs)] text-white" aria-live="polite" data-testid="gallery-counter">{active + 1} / {n}</span>
        )}
        {n > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} disabled={active === 0} aria-label="Previous photo" className={`${ARROW} absolute left-3 top-1/2 -translate-y-1/2 disabled:opacity-40`}>‹</button>
            <button type="button" onClick={() => go(1)} disabled={active === n - 1} aria-label="Next photo" className={`${ARROW} absolute right-3 top-1/2 -translate-y-1/2 disabled:opacity-40`}>›</button>
          </>
        )}
      </div>

      {n > 1 && (
        <ul ref={strip} className={`hidden snap-x gap-2 ${tab === "video" && hasVideo ? "" : "md:flex"} overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`} role="tablist" aria-label="Photo thumbnails">
          {shots.map((shot, i) => {
            const selected = i === active;
            return (
              <li key={i} className="shrink-0 snap-start">
                <button role="tab" aria-selected={selected} aria-label={`Photo ${i + 1}`} onClick={() => jump(rail.current, i)}
                  className={`relative block size-14 overflow-hidden rounded-[var(--radius-md)] border-2 bg-surface-2 transition-colors ${selected ? "border-accent-500" : "border-border hover:border-border-strong"}`}>
                  <Photo src={shot.url} alt={shot.alt || `Photo ${i + 1}`} sizes="56px" className="object-cover" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Full-screen viewer */}
      <dialog ref={dlg} onClose={() => { if (zoom) closeZoom(); }} aria-label="Photo viewer" className="m-0 size-full max-h-none max-w-none bg-black p-0 text-white backdrop:bg-black">
        <div className="relative flex size-full flex-col">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="font-mono text-sm" data-testid="lightbox-counter">{active + 1} / {n}</span>
            <button type="button" onClick={() => dlg.current?.close()} aria-label="Close" className="grid size-11 place-items-center rounded-full bg-white/10 text-2xl leading-none hover:bg-white/20">×</button>
          </div>
          <div ref={big} onScroll={onBigScroll} className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ touchAction: "pan-x pinch-zoom" }}>
            {shots.map((shot, i) => (
              <div key={i} className="grid size-full shrink-0 basis-full snap-center place-items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {zoom && <span className="relative inline-block max-h-full max-w-full"><img src={shot.url} alt={shot.alt} className="max-h-full max-w-full object-contain" draggable={false} /></span>}
              </div>
            ))}
          </div>
          {n > 1 && (
            <>
              <button type="button" onClick={() => jump(big.current, Math.max(0, active - 1))} disabled={active === 0} aria-label="Previous photo" className="absolute left-3 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-3xl hover:bg-white/20 disabled:opacity-30 md:grid">‹</button>
              <button type="button" onClick={() => jump(big.current, Math.min(n - 1, active + 1))} disabled={active === n - 1} aria-label="Next photo" className="absolute right-3 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-3xl hover:bg-white/20 disabled:opacity-30 md:grid">›</button>
            </>
          )}
        </div>
      </dialog>
    </div>
  );
}
