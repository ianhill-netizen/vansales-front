"use client";

import { useState } from "react";
import Image from "next/image";
import type { Listing } from "@/lib/listings/types";
import { VanPhoto } from "./van-photo";

type Shot =
  | { kind: "real"; url: string; alt: string }
  | { kind: "model"; url: string; alt: string }
  | { kind: "svg"; idx: number; alt: string };

/* Image gallery. Image source priority: real per-vehicle photos → harvested
   model-level image (+ SVG detail shots) → fully synthetic SVG van renderer. */
export function Gallery({ listing, modelImage }: { listing: Listing; modelImage?: string | null }) {
  const real = listing.images.filter((i) => i.url.startsWith("http"));
  let shots: Shot[];
  if (real.length) {
    shots = real.map((i) => ({ kind: "real", url: i.url, alt: i.alt }));
  } else {
    const label = `${listing.make} ${listing.model}`;
    shots = [
      modelImage
        ? { kind: "model", url: modelImage, alt: `${label} (library image)` }
        : { kind: "svg", idx: 0, alt: label },
      { kind: "svg", idx: 2, alt: `${label} — load bay` },
      { kind: "svg", idx: 3, alt: `${label} — cab` },
    ];
  }

  const [active, setActive] = useState(0);
  const current = shots[active] ?? shots[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface-2">
        {current.kind === "real" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.url} alt={current.alt} className="size-full object-cover" />
        ) : current.kind === "model" ? (
          <Image src={current.url} alt={current.alt} fill priority sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" />
        ) : (
          <VanPhoto listing={listing} index={current.idx} className="size-full" priority />
        )}

        {current.kind === "model" && (
          <span className="absolute bottom-3 left-3 rounded-[var(--radius-sm)] bg-ink-900/70 px-2 py-1 text-[var(--text-2xs)] font-medium text-white/90 backdrop-blur">
            Library image — representative of the model
          </span>
        )}

        <span className="absolute bottom-3 right-3 rounded-[var(--radius-pill)] bg-ink-900/80 px-2.5 py-1 font-mono text-[var(--text-xs)] text-white">
          {active + 1} / {shots.length}
        </span>
      </div>

      <ul className="grid grid-cols-4 gap-3" role="tablist" aria-label="Vehicle photos">
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
                ) : shot.kind === "model" ? (
                  <Image src={shot.url} alt="" fill sizes="120px" className="object-cover" />
                ) : (
                  <VanPhoto listing={listing} index={shot.idx} className="size-full" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
