"use client";

import { useState } from "react";
import Image from "next/image";
import type { Listing } from "@/lib/listings/types";
import type { ModelImage } from "@/lib/media/model-images";
import { SpecCard } from "./spec-card";

type Shot = { kind: "real" | "library"; url: string; alt: string };

export function Gallery({
  listing,
  modelImages = [],
}: {
  listing: Listing;
  modelImages?: ModelImage[];
}) {
  const realShots: Shot[] = listing.images
    .filter((i) => i.url.startsWith("http"))
    .map((i) => ({ kind: "real", url: i.url, alt: i.alt }));

  const libShots: Shot[] = modelImages.map((img) => ({
    kind: "library",
    url: img.path,
    alt: img.alt || `${listing.make} ${listing.model} — library image`,
  }));

  const shots: Shot[] = realShots.length > 0 ? realShots : libShots;

  const [active, setActive] = useState(0);

  /* No photos at all — tasteful spec card */
  if (shots.length === 0) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-xl)] border border-border">
        <SpecCard listing={listing} className="size-full" />
      </div>
    );
  }

  const current = shots[Math.min(active, shots.length - 1)];
  const isLib = shots[0]?.kind === "library";

  return (
    <div className="flex flex-col gap-3">
      {isLib && (
        <p className="text-[var(--text-xs)] text-ink-400">
          Library images shown — actual vehicle may differ.
        </p>
      )}

      {/* Main viewer */}
      <div
        className={`relative aspect-[16/10] overflow-hidden rounded-[var(--radius-xl)] border border-border ${
          isLib ? "bg-[#eff6ff]" : "bg-surface-2"
        }`}
      >
        {current.kind === "real" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.url} alt={current.alt} className="size-full object-cover" />
        ) : (
          <Image
            src={current.url}
            alt={current.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 65vw"
            className="object-contain p-6"
            priority={active === 0}
          />
        )}
        <span className="absolute bottom-3 right-3 rounded-[var(--radius-pill)] bg-ink-900/80 px-2.5 py-1 font-mono text-[var(--text-xs)] text-white">
          {active + 1} / {shots.length}
        </span>
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
                  className={`relative block aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-md)] border-2 transition-colors ${
                    selected ? "border-accent-500" : "border-border hover:border-border-strong"
                  } ${isLib ? "bg-[#eff6ff]" : "bg-surface-2"}`}
                >
                  {shot.kind === "real" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={shot.url} alt="" className="size-full object-cover" />
                  ) : (
                    <Image
                      src={shot.url}
                      alt=""
                      fill
                      sizes="120px"
                      className="object-contain p-2"
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
