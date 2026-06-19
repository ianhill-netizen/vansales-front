"use client";

import { useState } from "react";
import type { Listing } from "@/lib/listings/types";
import { VanPhoto } from "./van-photo";

type Shot =
  | { kind: "real"; url: string; alt: string }
  | { kind: "svg"; idx: number; alt: string };

/* Gallery priority: real per-vehicle photos (from a live feed that supplies them)
   → 3 SVG detail shots (exterior, load bay, cab). Harvested model images are
   never used here. */
export function Gallery({ listing }: { listing: Listing }) {
  const real = listing.images.filter((i) => i.url.startsWith("http"));
  const label = `${listing.make} ${listing.model}`;

  const shots: Shot[] = real.length
    ? real.map((i) => ({ kind: "real", url: i.url, alt: i.alt }))
    : [
        { kind: "svg", idx: 0, alt: label },
        { kind: "svg", idx: 2, alt: `${label} — load bay` },
        { kind: "svg", idx: 3, alt: `${label} — cab` },
      ];

  const [active, setActive] = useState(0);
  const current = shots[Math.min(active, shots.length - 1)];

  return (
    <div className="flex flex-col gap-3">
      {/* Main viewer */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface-2">
        {current.kind === "real" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.url} alt={current.alt} className="size-full object-cover" />
        ) : (
          <VanPhoto
            listing={listing}
            index={current.idx}
            bodyStyle={listing.van_spec.body_style}
            className="size-full"
            priority
          />
        )}

        <span className="absolute bottom-3 right-3 rounded-[var(--radius-pill)] bg-ink-900/80 px-2.5 py-1 font-mono text-[var(--text-xs)] text-white">
          {active + 1} / {shots.length}
        </span>
      </div>

      {/* Thumbnails */}
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
                  className={`relative block aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-md)] border-2 transition-colors ${
                    selected ? "border-accent-500" : "border-border hover:border-border-strong"
                  }`}
                >
                  {shot.kind === "real" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={shot.url} alt="" className="size-full object-cover" />
                  ) : (
                    <VanPhoto
                      listing={listing}
                      index={shot.idx}
                      bodyStyle={listing.van_spec.body_style}
                      className="size-full"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
