"use client";

import { useState } from "react";
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
        <svg viewBox="0 0 80 40" fill="none" className="h-10 w-20 text-ink-200" aria-hidden>
          <rect x="1" y="13" width="78" height="23" rx="4" stroke="currentColor" strokeWidth="2"/>
          <rect x="9" y="3" width="35" height="17" rx="3" stroke="currentColor" strokeWidth="2"/>
          <circle cx="17" cy="36" r="4" stroke="currentColor" strokeWidth="2"/>
          <circle cx="63" cy="36" r="4" stroke="currentColor" strokeWidth="2"/>
          <line x1="44" y1="13" x2="44" y2="20" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
        <p className="font-mono text-[var(--text-xs)] uppercase tracking-[var(--tracking-eyebrow)] text-ink-300">
          Photo coming soon
        </p>
      </div>
    );
  }

  const current = shots[Math.min(active, shots.length - 1)];

  return (
    <div className="flex flex-col gap-3">
      {/* Main viewer */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current.url} alt={current.alt} className="size-full object-cover" />
        {shots.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-[var(--radius-pill)] bg-ink-900/80 px-2.5 py-1 font-mono text-[var(--text-xs)] text-white">
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
