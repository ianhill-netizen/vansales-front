"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker, LayerGroup } from "leaflet";

/* =============================================================================
   PIN MAP — the one Leaflet map used by the dealer page, the /dealers directory
   and (same pin style) the van search map. Price pins are navy pills, a dealer is
   an orange pin; the selected pin turns orange / grows. Controlled: the parent owns
   `selectedId`; `onBounds` reports which pins are inside the current view.
   ============================================================================= */

export type Pin = { id: string; lat: number; lng: number; label: string; kind: "price" | "dealer"; /** Show `label` as a permanent tooltip above the pin (dealer page only; off elsewhere so directory maps stay uncluttered). */ permanentLabel?: boolean };

const priceHtml = (label: string, active: boolean) =>
  `<div style="transform:translate(-50%,-100%);white-space:nowrap;display:inline-block;padding:4px 9px;border-radius:999px;font:700 12px/1.2 var(--font-geist,system-ui);background:${active ? "#f47c1e" : "#0d2d5a"};color:#fff;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35);cursor:pointer">${label}</div>`;

const dealerHtml = (active: boolean) =>
  `<div style="transform:translate(-50%,-100%);cursor:pointer;filter:drop-shadow(0 2px 4px rgba(0,0,0,.35))"><svg xmlns="http://www.w3.org/2000/svg" width="${active ? 36 : 30}" height="${active ? 50 : 42}" viewBox="0 0 28 40" aria-hidden="true"><path d="M14 0C6.268 0 0 6.268 0 14c0 10.73 14 26 14 26S28 24.73 28 14C28 6.268 21.732 0 14 0z" fill="${active ? "#d96410" : "#f47c1e"}"/><circle cx="14" cy="14" r="5.5" fill="white"/></svg></div>`;

export function PinMap({
  pins,
  selectedId = null,
  onSelect,
  onBounds,
  fallbackCenter = [52.5, -1.5],
  fallbackZoom = 6,
  maxFitZoom = 12,
  scrollWheelZoom = true,
  className = "",
}: {
  pins: Pin[];
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  /** Called with the ids of the pins inside the map view (after every move / zoom, and once at the start). */
  onBounds?: (ids: Set<string>) => void;
  fallbackCenter?: [number, number];
  fallbackZoom?: number;
  maxFitZoom?: number;
  scrollWheelZoom?: boolean;
  className?: string;
}) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const markers = useRef<Map<string, Marker>>(new Map());
  const LRef = useRef<typeof import("leaflet") | null>(null);
  const pinsRef = useRef(pins);
  const cb = useRef({ onSelect, onBounds });
  const selRef = useRef(selectedId);

  useEffect(() => { pinsRef.current = pins; cb.current = { onSelect, onBounds }; selRef.current = selectedId; });

  const iconFor = (p: Pin, active: boolean) =>
    LRef.current!.divIcon({ className: "", html: p.kind === "dealer" ? dealerHtml(active) : priceHtml(p.label, active), iconSize: [0, 0] });

  // Create the map once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default as unknown as typeof import("leaflet");
      if (cancelled || !el.current || mapRef.current) return;
      LRef.current = L;
      const map = L.map(el.current, { center: fallbackCenter, zoom: fallbackZoom, scrollWheelZoom });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      map.on("moveend", reportBounds);
      map.on("click", () => cb.current.onSelect?.(null));
      draw(true);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
      markers.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function reportBounds() {
    const map = mapRef.current;
    if (!map || !cb.current.onBounds) return;
    const b = map.getBounds();
    cb.current.onBounds(new Set(pinsRef.current.filter((p) => b.contains([p.lat, p.lng])).map((p) => p.id)));
  }

  function draw(fit: boolean) {
    const map = mapRef.current, layer = layerRef.current, L = LRef.current;
    if (!map || !layer || !L) return;
    layer.clearLayers();
    markers.current.clear();
    for (const p of pinsRef.current) {
      const m = L.marker([p.lat, p.lng], { icon: iconFor(p, p.id === selRef.current), riseOnHover: true, zIndexOffset: p.kind === "dealer" ? 500 : 0 });
      m.on("click", (e) => { L.DomEvent.stopPropagation(e); cb.current.onSelect?.(p.id === selRef.current ? null : p.id); });
      if (p.permanentLabel) {
        // A DOM node, not an HTML string: the label is a dealer-supplied name and must never be parsed as markup.
        const tip = document.createElement("span");
        tip.textContent = p.label;
        tip.style.cssText = "font:700 13px/1.2 var(--font-geist,system-ui);color:#0d2d5a;white-space:nowrap";
        m.bindTooltip(tip, { permanent: true, direction: "top", offset: [0, -50] });
      }
      m.addTo(layer);
      markers.current.set(p.id, m);
    }
    if (fit && pinsRef.current.length > 0) {
      map.fitBounds(pinsRef.current.map((p) => [p.lat, p.lng] as [number, number]), { padding: [48, 48], maxZoom: maxFitZoom });
    }
    reportBounds();
  }

  // Redraw when the set of pins changes (and refit only if the set itself changed, not on every selection).
  const key = pins.map((p) => `${p.id}@${p.lat},${p.lng}:${p.label}`).join("|");
  useEffect(() => { draw(true); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [key]);

  // Selection only restyles.
  useEffect(() => {
    if (!LRef.current) return;
    for (const p of pinsRef.current) {
      const m = markers.current.get(p.id);
      if (!m) continue;
      m.setIcon(iconFor(p, p.id === selectedId));
      m.setZIndexOffset(p.id === selectedId ? 1000 : p.kind === "dealer" ? 500 : 0);
    }
  }, [selectedId]);

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={el} className={className} />
    </>
  );
}

export const priceLabel = (price: number | null) =>
  price == null ? "POA" : price >= 1000 ? `£${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}k` : `£${price}`;
