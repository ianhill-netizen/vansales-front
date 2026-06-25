"use client";

import { useState, lazy, Suspense } from "react";
import type { Listing } from "@/lib/listings/types";

const ResultsDealerMapWrapper = lazy(() =>
  import("./results-dealer-map").then((m) => ({ default: m.ResultsDealerMapWrapper }))
);

export function DealerMapButton({ listings }: { listings: Listing[] }) {
  const [open, setOpen] = useState(false);

  const mappable = listings.filter(
    (l) => l.location.lat != null && l.location.lng != null
  );
  if (mappable.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-[var(--radius-pill)] border border-border bg-white px-4 py-2 text-[var(--text-sm)] font-semibold text-ink-700 shadow-[var(--shadow-xs)] transition-colors hover:border-brand-300 hover:text-brand-700"
        aria-label="View results on map"
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
          <path d="M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3z" />
          <path d="M9 3v15M15 6v15" />
        </svg>
        Map
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white" role="dialog" aria-modal="true" aria-label="Dealer map">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3">
            <div>
              <h2 className="font-display font-bold text-ink-900">Dealer locations</h2>
              <p className="text-[var(--text-xs)] text-ink-400">
                {listings.length} {listings.length === 1 ? "van" : "vans"} across {
                  // count unique dealers with coords
                  new Set(mappable.map((l) => l.seller.name)).size
                } {new Set(mappable.map((l) => l.seller.name)).size === 1 ? "dealer" : "dealers"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex size-9 items-center justify-center rounded-full text-ink-400 hover:bg-surface-1 hover:text-ink-700"
              aria-label="Close map"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M2 2l14 14M16 2L2 16" />
              </svg>
            </button>
          </div>

          {/* Map fills remainder */}
          <div className="flex-1 overflow-hidden">
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center bg-surface-1">
                  <p className="text-[var(--text-sm)] text-ink-400">Loading map…</p>
                </div>
              }
            >
              <ResultsDealerMapWrapper listings={listings} />
            </Suspense>
          </div>
        </div>
      )}
    </>
  );
}
