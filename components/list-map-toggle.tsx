"use client";

import { useState, lazy, Suspense } from "react";
import type { Listing } from "@/lib/listings/types";

const MapView = lazy(() => import("./map-view").then((m) => ({ default: m.MapView })));

interface Props {
  listings: Listing[];
  children: React.ReactNode;
}

export function ListMapToggle({ listings, children }: Props) {
  const [view, setView] = useState<"list" | "map">("list");

  const btn = (active: boolean) =>
    `flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-1.5 text-[var(--text-sm)] font-semibold transition-colors ${
      active ? "bg-ink-900 text-white" : "border border-border bg-white text-ink-600 hover:border-ink-400"
    }`;

  return (
    <>
      <div className="mb-4 flex items-center justify-end gap-2">
        <button type="button" onClick={() => setView("list")} className={btn(view === "list")}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="4" rx="1" />
            <rect x="3" y="10" width="18" height="4" rx="1" />
            <rect x="3" y="16" width="18" height="4" rx="1" />
          </svg>
          List
        </button>
        <button type="button" onClick={() => setView("map")} className={btn(view === "map")}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
            <path d="M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3z" />
            <path d="M9 3v15M15 6v15" />
          </svg>
          Map
        </button>
      </div>

      {view === "list" ? (
        children
      ) : (
        <Suspense
          fallback={
            <div className="flex h-[520px] items-center justify-center rounded-[var(--radius-xl)] border border-border bg-surface-1">
              <p className="text-[var(--text-sm)] text-ink-400">Loading map…</p>
            </div>
          }
        >
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <MapView listings={listings} />
        </Suspense>
      )}
    </>
  );
}
