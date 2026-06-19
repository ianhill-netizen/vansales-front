"use client";

import { useEffect, useRef, useState } from "react";
import type { Listing } from "@/lib/listings/types";

interface DealerCluster {
  dealerName: string;
  lat: number;
  lng: number;
  count: number;
  listings: Listing[];
  dealerSlug?: string;
}

interface Props {
  listings: Listing[];
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function clusterListings(listings: Listing[]): DealerCluster[] {
  const byDealer: Record<string, DealerCluster> = {};
  for (const l of listings) {
    if (!l.location.lat || !l.location.lng) continue;
    const key = l.seller.name;
    if (!byDealer[key]) {
      byDealer[key] = { dealerName: l.seller.name, lat: l.location.lat, lng: l.location.lng, count: 0, listings: [] };
    }
    byDealer[key].count++;
    byDealer[key].listings.push(l);
  }
  return Object.values(byDealer);
}

export function MapView({ listings }: Props) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const [selected, setSelected] = useState<DealerCluster | null>(null);
  const [radiusMiles, setRadiusMiles] = useState<number | null>(null);
  const [postcode, setPostcode] = useState("");
  const [userLatLng, setUserLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [geocodeError, setGeocodeError] = useState("");

  const clusters = clusterListings(listings);
  const filtered = radiusMiles && userLatLng
    ? clusters.filter((c) => haversineKm(userLatLng.lat, userLatLng.lng, c.lat, c.lng) <= radiusMiles * 1.60934)
    : clusters;

  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;

    async function init() {
      const L = (await import("leaflet")).default;
      // Fix Leaflet's default icon paths when bundled
      // @ts-expect-error — leaflet types don't expose _getIconUrl
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapEl.current!, { center: [52.5, -1.5], zoom: 7, zoomControl: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;

      // Add dealer pins
      for (const cluster of filtered) {
        const icon = L.divIcon({
          className: "",
          html: `<div style="background:#0e2a6e;color:#fff;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);cursor:pointer">${cluster.count}</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });
        L.marker([cluster.lat, cluster.lng], { icon })
          .addTo(map)
          .on("click", () => setSelected(cluster));
      }

      // Fit bounds
      if (filtered.length > 0) {
        const latLngs = filtered.map((c) => [c.lat, c.lng] as [number, number]);
        map.fitBounds(latLngs, { padding: [40, 40], maxZoom: 12 });
      }
    }

    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function geocodePostcode() {
    setGeocodeError("");
    const clean = postcode.replace(/\s+/g, "").toUpperCase();
    try {
      const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(clean)}`);
      const data = (await res.json()) as { status: number; result?: { latitude: number; longitude: number } };
      if (data.status !== 200 || !data.result) { setGeocodeError("Postcode not found"); return; }
      setUserLatLng({ lat: data.result.latitude, lng: data.result.longitude });
    } catch {
      setGeocodeError("Geocode failed — check postcode");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Distance filter bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-[var(--radius-lg)] border border-border bg-surface-1 p-3">
        <input
          type="text"
          placeholder="Postcode (e.g. CF35 5LJ)"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && geocodePostcode()}
          className="h-9 rounded-[var(--radius-md)] border border-border bg-white px-3 text-[var(--text-sm)] outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20"
        />
        <button
          type="button"
          onClick={geocodePostcode}
          className="h-9 rounded-[var(--radius-md)] bg-ink-900 px-4 text-[var(--text-sm)] font-semibold text-white hover:bg-ink-700"
        >
          Set location
        </button>
        {geocodeError && <span className="text-[var(--text-xs)] text-sold-600">{geocodeError}</span>}
        {userLatLng && (
          <div className="flex gap-1">
            {[10, 25, 50, 100].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRadiusMiles(radiusMiles === r ? null : r)}
                className={`rounded-[var(--radius-pill)] px-3 py-1 text-[var(--text-xs)] font-semibold transition-colors ${radiusMiles === r ? "bg-brand-500 text-white" : "border border-border bg-white text-ink-600 hover:border-brand-500/50"}`}
              >
                {r}mi
              </button>
            ))}
          </div>
        )}
        <span className="ml-auto text-[var(--text-xs)] text-ink-400">
          {filtered.length} dealer{filtered.length !== 1 ? "s" : ""}
          {radiusMiles && userLatLng ? ` within ${radiusMiles} miles` : " shown"}
        </span>
      </div>

      <div className="relative flex gap-4">
        {/* Map */}
        <div ref={mapEl} className="h-[520px] flex-1 overflow-hidden rounded-[var(--radius-xl)] border border-border" />

        {/* Selected dealer card */}
        {selected && (
          <div className="w-72 shrink-0 overflow-y-auto rounded-[var(--radius-xl)] border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display text-[var(--text-base)] font-bold text-ink-900">{selected.dealerName}</p>
                <p className="text-[var(--text-xs)] text-ink-500">{selected.count} matching vans</p>
              </div>
              <button onClick={() => setSelected(null)} className="shrink-0 rounded p-1 text-ink-400 hover:bg-surface-2 hover:text-ink-700">✕</button>
            </div>
            <ul className="mt-3 space-y-2">
              {selected.listings.slice(0, 5).map((l) => (
                <li key={l.id}>
                  <a href={`/listing/${l.slug}`} className="flex items-center gap-2 rounded-[var(--radius-md)] border border-border p-2 hover:border-brand-500/40 hover:bg-brand-tint">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[var(--text-xs)] font-semibold text-ink-800">{l.make} {l.model}</p>
                      <p className="text-[var(--text-2xs)] text-ink-500">{l.year} · {l.price != null ? `£${l.price.toLocaleString()}` : "POA"}</p>
                    </div>
                  </a>
                </li>
              ))}
              {selected.count > 5 && (
                <li>
                  <a
                    href={`/dealer/${selected.dealerSlug ?? "swiss-vans"}`}
                    className="block rounded-[var(--radius-md)] border border-dashed border-border p-2 text-center text-[var(--text-xs)] font-semibold text-brand-700 hover:bg-brand-tint"
                  >
                    View all {selected.count} vans →
                  </a>
                </li>
              )}
            </ul>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-white text-[var(--text-xs)] font-semibold text-ink-700 hover:border-ink-400"
            >
              Get directions
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
