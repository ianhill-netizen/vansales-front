"use client";

import { EmptyState } from "@/components/empty/empty-state";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Listing } from "@/lib/listings/types";
import type { FinanceTerms, PayMode } from "@/lib/finance";
import { ListingCard } from "./listing-card";
import { vatLabel, formatMileage, titleCase } from "@/lib/listings/format";

/* =============================================================================
   MAP SPLIT — Booking.com-style results: scrollable cards on the left, an
   interactive map with price pins on the right.
   - Pins show the price (or "N vans" where several share a location, e.g. a dealer yard).
   - Click a pin → its van(s) are highlighted and scrolled to in the list.
   - Move / zoom the map → the list narrows to the vans inside the map bounds.
   - Mobile: the map takes the whole screen with a List / Map toggle.
   ============================================================================= */

type Group = { key: string; lat: number; lng: number; items: Listing[] };

const pinLabel = (g: Group) => {
  if (g.items.length > 1) return `${g.items.length} vans`;
  const p = g.items[0].price;
  if (p == null) return "POA";
  return p >= 1000 ? `£${(p / 1000).toFixed(p % 1000 === 0 ? 0 : 1)}k` : `£${p}`;
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** One compact popup card (clicking anywhere on it opens the advert). Styled by .vs-pop in globals.css. */
function popupCard(l: Listing): string {
  const img = l.images[0]?.url?.startsWith("http") ? l.images[0].url : null;
  const sub = [l.year > 0 ? String(l.year) : null, l.mileage != null ? formatMileage(l.mileage) : null, l.fuel && l.fuel !== "—" ? titleCase(l.fuel) : null].filter(Boolean).join(" · ");
  const price = l.price != null ? `£${l.price.toLocaleString("en-GB")}` : "POA";
  const town = l.location.town && l.location.town !== "UK" ? l.location.town : "";
  return `<a class="vs-pop" href="/listing/${encodeURI(l.slug)}">
    <div class="vs-pop-img">${img ? `<img src="${esc(img)}" alt="" loading="lazy">` : ""}</div>
    <div class="vs-pop-body">
      <p class="vs-pop-title">${esc(`${l.make} ${l.model}`)}</p>
      ${sub ? `<p class="vs-pop-sub">${esc(sub)}</p>` : ""}
      <p class="vs-pop-price">${price}${l.price != null ? ` <span>${esc(vatLabel(l.price_type, l.vat_qualifying))}</span>` : ""}</p>
      <p class="vs-pop-meta"><span class="vs-pop-badge${l.seller_type === "private" ? "" : " dealer"}">${l.seller_type === "private" ? "Private seller" : "Dealer"}</span>${town ? `<span>${esc(town)}</span>` : ""}</p>
    </div></a>`;
}

const popupHtml = (g: Group) => `<div class="vs-pop-wrap">${g.items.slice(0, 20).map(popupCard).join("")}${g.items.length > 20 ? `<p class="vs-pop-more">+ ${g.items.length - 20} more in the list</p>` : ""}</div>`;

const pinHtml = (label: string, active: boolean) =>
  `<div style="transform:translate(-50%,-100%);white-space:nowrap;display:inline-block;padding:4px 9px;border-radius:999px;font:700 12px/1.2 var(--font-geist,system-ui);background:${active ? "#f47c1e" : "#0d2d5a"};color:#fff;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35);cursor:pointer">${label}</div>`;

export function MapSplit({
  listings,
  totalMatching,
  closeHref,
  payMode,
  financeTerms,
}: {
  listings: Listing[]; // matches that have coordinates
  totalMatching: number;
  closeHref: string;
  payMode: PayMode;
  financeTerms: FinanceTerms;
}) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<Map<string, import("leaflet").Marker>>(new Map());
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [visibleKeys, setVisibleKeys] = useState<Set<string> | null>(null); // null = map not ready: show all
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [pane, setPane] = useState<"map" | "list">("map"); // mobile only

  const groups = useMemo(() => {
    const m = new Map<string, Group>();
    for (const l of listings) {
      if (l.location.lat == null || l.location.lng == null) continue;
      const key = `${l.location.lat.toFixed(3)},${l.location.lng.toFixed(3)}`;
      const g = m.get(key) ?? { key, lat: l.location.lat, lng: l.location.lng, items: [] };
      g.items.push(l);
      m.set(key, g);
    }
    return [...m.values()];
  }, [listings]);

  const groupOf = useMemo(() => {
    const m = new Map<string, string>();
    for (const g of groups) for (const l of g.items) m.set(l.id, g.key);
    return m;
  }, [groups]);

  const visible = useMemo(
    () => (visibleKeys ? listings.filter((l) => visibleKeys.has(groupOf.get(l.id) ?? "")) : listings),
    [listings, visibleKeys, groupOf],
  );

  // Build the map once.
  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapEl.current) return;
      leafletRef.current = L as unknown as typeof import("leaflet");
      const map = L.map(mapEl.current, { center: [52.5, -1.5], zoom: 6, zoomControl: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);
      mapRef.current = map;

      for (const g of groups) {
        const marker = L.marker([g.lat, g.lng], {
          icon: L.divIcon({ className: "", html: pinHtml(pinLabel(g), false), iconSize: [0, 0] }),
          riseOnHover: true,
        })
          .addTo(map)
          .bindPopup(popupHtml(g), { className: "vs-popup", minWidth: 240, maxWidth: 240, autoPanPadding: [24, 24], offset: [0, -34] })
          .on("click", () => setSelectedKey(g.key))
          .on("popupclose", () => setSelectedKey((k) => (k === g.key ? null : k)));
        markersRef.current.set(g.key, marker);
      }

      const syncVisible = () => {
        const b = map.getBounds();
        setVisibleKeys(new Set(groups.filter((g) => b.contains([g.lat, g.lng])).map((g) => g.key)));
      };
      map.on("moveend", syncVisible);
      if (groups.length > 0) map.fitBounds(groups.map((g) => [g.lat, g.lng] as [number, number]), { padding: [40, 40], maxZoom: 11 });
      syncVisible();
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, [groups]);

  // Highlight the selected pin.
  useEffect(() => {
    const L = leafletRef.current;
    if (!L) return;
    for (const g of groups) {
      markersRef.current.get(g.key)?.setIcon(
        L.divIcon({ className: "", html: pinHtml(pinLabel(g), g.key === selectedKey), iconSize: [0, 0] }),
      );
      markersRef.current.get(g.key)?.setZIndexOffset(g.key === selectedKey ? 1000 : 0);
    }
  }, [selectedKey, groups, visibleKeys]);

  // Selecting a pin scrolls its card into view (and on mobile switches to the list so the highlight is seen).
  useEffect(() => {
    if (!selectedKey || !listRef.current) return;
    const first = groups.find((g) => g.key === selectedKey)?.items[0];
    if (!first) return;
    listRef.current.querySelector(`[data-listing-id="${CSS.escape(first.id)}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedKey, groups]);

  // The map needs a size recalculation when its pane is revealed on mobile.
  useEffect(() => {
    const t = setTimeout(() => mapRef.current?.invalidateSize(), 60);
    return () => clearTimeout(t);
  }, [pane]);

  const withoutLocation = totalMatching - listings.length;

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div className="max-lg:fixed max-lg:inset-0 max-lg:z-40 max-lg:flex max-lg:flex-col max-lg:bg-white lg:block">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between gap-3 border-b border-border bg-white px-4 py-3 lg:hidden">
          <Link href={closeHref} scroll={false} className="text-[length:var(--text-sm)] font-semibold text-brand-600">← Back to grid</Link>
          <p className="text-[length:var(--text-sm)] font-semibold text-ink-700">{visible.length} on map</p>
        </div>

        <p className="mb-3 hidden text-[length:var(--text-sm)] text-ink-500 lg:block">
          <span className="font-semibold text-ink-800">{visible.length}</span> van{visible.length === 1 ? "" : "s"} in this map area
          {withoutLocation > 0 && <span className="text-ink-400"> · {withoutLocation} more without a location are not shown</span>}
          <span className="text-ink-400"> · move or zoom the map to narrow the list</span>
        </p>

        <div className="relative grid min-h-0 flex-1 lg:h-[calc(100dvh-13rem)] lg:min-h-[560px] lg:grid-cols-[minmax(340px,480px)_1fr] lg:gap-4">
          {/* List */}
          <div
            ref={listRef}
            className={`min-h-0 space-y-4 overflow-y-auto bg-surface-1 p-3 lg:rounded-[var(--radius-xl)] lg:border lg:border-border ${pane === "list" ? "max-lg:block" : "max-lg:hidden"}`}
          >
            {visible.length === 0 ? (
              <EmptyState
                illustration="pin"
                title="No vans in this map area"
                body="Zoom out or drag the map to look somewhere else."
                action={{ label: "Back to the grid", href: closeHref }}
                className="border-0 bg-transparent"
              />
            ) : (
              visible.map((l, i) => (
                <div
                  key={l.id}
                  onMouseEnter={() => groupOf.get(l.id) && setSelectedKey(groupOf.get(l.id)!)}
                >
                  <ListingCard
                    listing={l}
                    priority={i < 3}
                    cardIndex={i}
                    payMode={payMode}
                    financeTerms={financeTerms}
                    highlighted={groupOf.get(l.id) === selectedKey}
                  />
                </div>
              ))
            )}
          </div>

          {/* Map */}
          <div className={`relative min-h-0 ${pane === "map" ? "max-lg:block" : "max-lg:hidden"}`}>
            <div ref={mapEl} className="h-full min-h-[320px] w-full overflow-hidden lg:rounded-[var(--radius-xl)] lg:border lg:border-border" />
          </div>

          {/* Mobile: tapped pin → quick card over the map */}
          {pane === "map" && selectedKey && (
            <div className="absolute inset-x-3 bottom-16 z-[1000] space-y-1.5 rounded-[var(--radius-lg)] bg-white p-3 shadow-[var(--shadow-lg)] lg:hidden">
              {(groups.find((g) => g.key === selectedKey)?.items ?? []).slice(0, 3).map((l) => (
                <Link key={l.id} href={`/listing/${l.slug}`} className="flex items-center justify-between gap-3 text-[length:var(--text-sm)]">
                  <span className="truncate font-semibold text-ink-900">{l.make} {l.model}</span>
                  <span className="shrink-0 font-mono font-bold text-ink-900">{l.price != null ? `£${l.price.toLocaleString("en-GB")}` : "POA"}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Mobile pane toggle */}
          <button
            type="button"
            onClick={() => setPane((p) => (p === "map" ? "list" : "map"))}
            className="absolute bottom-5 left-1/2 z-[1000] -translate-x-1/2 rounded-full bg-ink-900 px-5 py-2.5 text-[length:var(--text-sm)] font-bold text-white shadow-[var(--shadow-lg)] lg:hidden"
          >
            {pane === "map" ? `List (${visible.length})` : "Map"}
          </button>
        </div>
      </div>
    </>
  );
}
