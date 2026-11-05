"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BodyTypeIcon } from "@/components/icons/body-types";
import type { Listing } from "@/lib/listings/types";

type Shot = { url: string; alt: string };

const ARROW = "hidden size-10 items-center justify-center rounded-full bg-white/90 text-ink-800 shadow-[var(--shadow-sm)] hover:bg-white md:flex";

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

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface-2">
        <div ref={rail} onScroll={onScroll} className="flex aspect-[16/10] snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" data-testid="gallery-rail" aria-label="Vehicle photos" role="region">
          {shots.map((shot, i) => (
            <button key={i} type="button" onClick={() => setZoom(true)} aria-label={`Open photo ${i + 1} of ${n} full screen`} className="relative block size-full shrink-0 basis-full snap-center cursor-zoom-in">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={shot.url} alt={shot.alt} className="size-full object-cover" loading={i === 0 ? "eager" : "lazy"} draggable={false} />
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
        <ul ref={strip} className="flex snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Photo thumbnails">
          {shots.map((shot, i) => {
            const selected = i === active;
            return (
              <li key={i} className="shrink-0 snap-start">
                <button role="tab" aria-selected={selected} aria-label={`Photo ${i + 1}`} onClick={() => jump(rail.current, i)}
                  className={`block size-14 overflow-hidden rounded-[var(--radius-md)] border-2 bg-surface-2 transition-colors ${selected ? "border-accent-500" : "border-border hover:border-border-strong"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={shot.url} alt="" className="size-full object-cover" loading="lazy" />
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
                {zoom && <img src={shot.url} alt={shot.alt} className="max-h-full max-w-full object-contain" draggable={false} />}
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
