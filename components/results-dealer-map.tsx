"use client";

import { useState, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import type { Listing } from "@/lib/listings/types";
import Link from "next/link";
import { listingPath } from "@/lib/listings/slug";

interface DealerGroup {
  name: string;
  lat: number;
  lng: number;
  listings: Listing[];
}

function groupByDealer(listings: Listing[]): DealerGroup[] {
  const map = new Map<string, DealerGroup>();
  for (const l of listings) {
    if (l.location.lat == null || l.location.lng == null) continue;
    const key = l.seller.name;
    if (!map.has(key)) {
      map.set(key, {
        name: l.seller.name,
        lat: l.location.lat,
        lng: l.location.lng,
        listings: [],
      });
    }
    map.get(key)!.listings.push(l);
  }
  return [...map.values()];
}

function mapCenter(dealers: DealerGroup[]): { lat: number; lng: number } {
  if (dealers.length === 0) return { lat: 52.5, lng: -1.5 };
  const lats = dealers.map((d) => d.lat);
  const lngs = dealers.map((d) => d.lng);
  return {
    lat: (Math.min(...lats) + Math.max(...lats)) / 2,
    lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
  };
}

const GBP = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });

interface ResultsDealerMapProps {
  listings: Listing[];
  apiKey: string;
}

export function ResultsDealerMap({ listings, apiKey }: ResultsDealerMapProps) {
  const [selected, setSelected] = useState<DealerGroup | null>(null);
  const dealers = groupByDealer(listings);
  const center = mapCenter(dealers);

  return (
    <APIProvider apiKey={apiKey}>
      <div className="relative h-full">
        <Map
          defaultCenter={center}
          defaultZoom={dealers.length === 1 ? 13 : 8}
          gestureHandling="cooperative"
          mapId="results-dealer-map"
          style={{ height: "100%", width: "100%" }}
        >
          {dealers.map((dealer) => (
            <AdvancedMarker
              key={dealer.name}
              position={{ lat: dealer.lat, lng: dealer.lng }}
              onClick={() => setSelected(selected?.name === dealer.name ? null : dealer)}
              title={dealer.name}
            >
              <div
                className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-white shadow-lg transition-transform hover:scale-105 ${
                  selected?.name === dealer.name ? "bg-brand-700" : "bg-brand-600"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="14" viewBox="0 0 10 14" fill="white" aria-hidden>
                  <path d="M5 0C2.24 0 0 2.24 0 5c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z" />
                </svg>
                {dealer.listings.length}
              </div>
            </AdvancedMarker>
          ))}
        </Map>

        {/* Dealer info panel */}
        {selected && (
          <div className="absolute bottom-0 left-0 right-0 max-h-[50%] overflow-y-auto rounded-t-[var(--radius-2xl)] bg-white shadow-[var(--shadow-xl)]">
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-white px-5 py-3">
              <div>
                <p className="font-display font-bold text-ink-900">{selected.name}</p>
                <p className="text-[var(--text-xs)] text-ink-400">
                  {selected.listings.length} {selected.listings.length === 1 ? "van" : "vans"} at this location
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex size-8 items-center justify-center rounded-full text-ink-400 hover:bg-surface-1 hover:text-ink-700"
                aria-label="Close"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M2 2l12 12M14 2L2 14" />
                </svg>
              </button>
            </div>
            <div className="divide-y divide-border">
              {selected.listings.map((l) => (
                <Link
                  key={l.id}
                  href={listingPath(l)}
                  className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-surface-1"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[var(--text-sm)] font-semibold text-ink-900">
                      {l.year} {l.make} {l.model}
                    </p>
                    {l.derivative && (
                      <p className="truncate text-[var(--text-xs)] text-ink-400">{l.derivative}</p>
                    )}
                  </div>
                  <p className="shrink-0 font-semibold text-ink-900">
                    {l.price != null ? GBP.format(l.price) : "POA"}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {dealers.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <p className="text-[var(--text-sm)] text-ink-500">No dealer locations for current results</p>
          </div>
        )}
      </div>
    </APIProvider>
  );
}

interface WrapperProps {
  listings: Listing[];
}

export function ResultsDealerMapWrapper({ listings }: WrapperProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/maps-key")
      .then((r) => r.json())
      .then((d: { key?: string }) => {
        if (d.key) setApiKey(d.key);
        else setFailed(true);
      })
      .catch(() => setFailed(true));
  }, []);

  if (failed) {
    return (
      <div className="flex h-full items-center justify-center bg-surface-2 text-[var(--text-sm)] text-ink-500">
        Map unavailable
      </div>
    );
  }

  if (!apiKey) {
    return <div className="h-full w-full animate-pulse bg-surface-2" />;
  }

  return <ResultsDealerMap listings={listings} apiKey={apiKey} />;
}
