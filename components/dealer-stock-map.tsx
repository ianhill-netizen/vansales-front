"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PinMap, priceLabel, type Pin } from "./pin-map";

export type StockPin = { id: string; slug: string; title: string; price: number | null; lat: number; lng: number };

/** Dealer page map: the dealer as an orange pin and every van in stock as a price pin around it. */
export function DealerStockMap({
  name,
  address,
  lat,
  lng,
  stock,
}: {
  name: string;
  address: string;
  lat: number;
  lng: number;
  stock: StockPin[];
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const pins = useMemo<Pin[]>(() => {
    // Vans on the dealer's forecourt share its coordinates; fan them out in rings (a few tens of metres) so every price pin is visible and clickable.
    const out: Pin[] = [{ id: "dealer", lat, lng, label: name, kind: "dealer", labelMarker: true }];
    const same = stock.filter((s) => Math.abs(s.lat - lat) < 0.002 && Math.abs(s.lng - lng) < 0.002);
    const apart = stock.filter((s) => !same.includes(s));
    same.forEach((s, i) => {
      const ring = Math.floor(i / 10) + 1;
      const angle = ((i % 10) / Math.min(10, same.length - Math.floor(i / 10) * 10)) * Math.PI * 2;
      out.push({ id: s.id, lat: lat + Math.sin(angle) * 0.00045 * ring, lng: lng + Math.cos(angle) * 0.0007 * ring, label: priceLabel(s.price), kind: "price" });
    });
    for (const s of apart) out.push({ id: s.id, lat: s.lat, lng: s.lng, label: priceLabel(s.price), kind: "price" });
    return out;
  }, [stock, lat, lng, name]);

  const van = stock.find((s) => s.id === selected);

  return (
    <div className="relative">
      <PinMap
        pins={pins}
        selectedId={selected}
        onSelect={setSelected}
        fallbackCenter={[lat, lng]}
        fallbackZoom={15}
        maxFitZoom={16}
        scrollWheelZoom={false}
        className="h-[380px] w-full"
      />
      {(selected === "dealer" || van) && (
        <div className="absolute inset-x-3 bottom-3 z-[1000] rounded-[var(--radius-lg)] bg-white p-3 text-[length:var(--text-sm)] shadow-[var(--shadow-lg)]">
          {van ? (
            <Link href={`/listing/${van.slug}`} className="flex items-center justify-between gap-3">
              <span className="truncate font-semibold text-ink-900">{van.title}</span>
              <span className="shrink-0 font-bold tabular-nums text-ink-900">{van.price != null ? `£${van.price.toLocaleString("en-GB")}` : "POA"} →</span>
            </Link>
          ) : (
            <p><span className="font-semibold text-ink-900">{name}</span>{address && <span className="text-ink-500"> · {address}</span>}</p>
          )}
        </div>
      )}
    </div>
  );
}
