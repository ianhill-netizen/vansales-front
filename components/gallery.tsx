"use client";

import { useState } from "react";
import type { Listing } from "@/lib/listings/types";
import { SpecCard } from "./spec-card";

type RealShot = { kind: "real"; url: string; alt: string };

export function Gallery({ listing }: { listing: Listing }) {
  const realShots = listing.images
    .filter((i) => i.url.startsWith("http"))
    .map((i) => ({ kind: "real" as const, url: i.url, alt: i.alt }));

  const [active, setActive] = useState(0);

  /* No real photos — show a single tasteful spec card, no thumbnails */
  if (realShots.length === 0) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-xl)] border border-border">
        <SpecCard listing={listing} className="size-full" />
      </div>
    );
  }

  const current = realShots[Math.min(active, realShots.length - 1)];

  return (
    <div className="flex flex-col gap-3">
      {/* Main viewer */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current.url} alt={current.alt} className="size-full object-cover" />
        <span className="absolute bottom-3 right-3 rounded-[var(--radius-pill)] bg-ink-900/80 px-2.5 py-1 font-mono text-[var(--text-xs)] text-white">
          {active + 1} / {realShots.length}
        </span>
      </div>

      {/* Thumbnails — only when >1 real photo */}
      {realShots.length > 1 && (
        <ul
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${Math.min(realShots.length, 6)}, minmax(0, 1fr))` }}
          role="tablist"
          aria-label="Vehicle photos"
        >
          {realShots.map((shot, i) => {
            const selected = i === active;
            return (
              <li key={i}>
                <button
                  role="tab"
                  aria-selected={selected}
                  aria-label={shot.alt}
                  onClick={() => setActive(i)}
                  className={`relative block aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-md)] border-2 transition-colors ${
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
