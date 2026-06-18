"use client";

import { useState } from "react";
import type { Listing } from "@/lib/listings/types";
import { VanPhoto } from "./van-photo";

/* Image gallery: large active frame + thumbnail rail. Real photos render as
   <img>; synthetic listings render the on-brand <VanPhoto> shot per index. */
export function Gallery({ listing }: { listing: Listing }) {
  const shots = listing.images.length ? listing.images : [{ url: "van://0", alt: listing.make }];
  const [active, setActive] = useState(0);
  const current = shots[active] ?? shots[0];
  const isReal = current.url.startsWith("http");

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface-2">
        {isReal ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.url} alt={current.alt} className="size-full object-cover" />
        ) : (
          <VanPhoto listing={listing} index={active} className="size-full" priority />
        )}
        <span className="absolute bottom-3 right-3 rounded-[var(--radius-pill)] bg-ink-900/80 px-2.5 py-1 font-mono text-[var(--text-xs)] text-white">
          {active + 1} / {shots.length}
        </span>
      </div>

      <ul className="grid grid-cols-4 gap-3" role="tablist" aria-label="Vehicle photos">
        {shots.map((shot, i) => {
          const real = shot.url.startsWith("http");
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
                {real ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={shot.url} alt="" className="size-full object-cover" />
                ) : (
                  <VanPhoto listing={listing} index={i} className="size-full" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
