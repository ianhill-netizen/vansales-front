"use client";

import { useState } from "react";
import { BodyTypeIcon } from "@/components/icons/body-types";
import type { Listing } from "@/lib/listings/types";

type Shot = { url: string; alt: string };

export function Gallery({ listing }: { listing: Listing }) {
  const shots: Shot[] = listing.images
    .filter((i) => i.url.startsWith("http"))
    .map((i) => ({ url: i.url, alt: i.alt }));

  const [active, setActive] = useState(0);

  if (shots.length === 0) {
    return (
      <div className="relative flex aspect-[16/10] flex-col items-center justify-center gap-3 overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface-2">
        <BodyTypeIcon slug={listing.van_spec.body_style} className="h-24 w-36 text-ink-300" />
        <p className="font-mono text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-eyebrow)] text-ink-400">
          Photos coming soon
        </p>
      </div>
    );
  }

  const current = shots[Math.min(active, shots.length - 1)];
  // Only dealski-sourced listings carry image_source (dealski-backend PR
  // #3173); undefined is equivalent to "photo" — no badge for those.
  const isFallbackImage = !!listing.image_source && listing.image_source !== "photo";

  return (
    <div className="flex flex-col gap-3">
      {/* Main viewer */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current.url} alt={current.alt} className="size-full object-cover" />
        {isFallbackImage && (
          <span className="absolute bottom-3 left-3 rounded-[var(--radius-pill)] bg-ink-900/70 px-2.5 py-1 text-[length:var(--text-2xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-white backdrop-blur-sm">
            Stock image
          </span>
        )}
        {shots.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-[var(--radius-pill)] bg-ink-900/80 px-2.5 py-1 font-mono text-[length:var(--text-xs)] text-white">
            {active + 1} / {shots.length}
          </span>
        )}
      </div>

      {/* Thumbnails — only when >1 shot */}
      {shots.length > 1 && (
        <ul
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${Math.min(shots.length, 6)}, minmax(0, 1fr))` }}
          role="tablist"
          aria-label="Vehicle photos"
        >
          {shots.map((shot, i) => {
            const selected = i === active;
            return (
              <li key={i}>
                <button
                  role="tab"
                  aria-selected={selected}
                  aria-label={shot.alt}
                  onClick={() => setActive(i)}
                  className={`relative block aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-md)] border-2 bg-surface-2 transition-colors ${
                    selected ? "border-accent-500" : "border-border hover:border-border-strong"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={shot.url} alt="" className="size-full object-cover" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
