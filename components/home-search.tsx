"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { stringifyVehicles } from "@/lib/vehicle-chips";
import type { PayMode } from "@/lib/finance";
import type { PickerData } from "@/lib/listings/picker";
import { VehiclePicker, EMPTY_SELECTION, countMatches, type PickerSelection } from "./picker/vehicle-picker";
import { IconSearch } from "./icons";

/* =============================================================================
   HOME SEARCH — the hero. Chip search (make / model), a location (typed town or
   postcode, or "Near me" via the browser's geolocation reverse-geocoded by the free
   postcodes.io API), an adjustable radius, and the Cash / Finance / Both toggle.
   Submitting goes to /vans with everything in the URL.
   ============================================================================= */

type Geo = { lat: number; lng: number; town: string; postcode: string };

const RADII = ["10", "20", "30", "50", "100"];

async function reverseGeocode(lat: number, lng: number): Promise<Geo> {
  const res = await fetch(`https://api.postcodes.io/postcodes?lon=${lng}&lat=${lat}&limit=1`);
  const body = (await res.json()) as { result?: { postcode: string; admin_district?: string | null; parish?: string | null }[] | null };
  const r = body.result?.[0];
  const town = (r?.admin_district || r?.parish || "").replace(/,?\s*City of$/i, "").trim();
  return { lat, lng, town: town || "Near me", postcode: r?.postcode ?? "" };
}

export function HomeSearch({ total, picker }: { total: number; picker: PickerData }) {
  const router = useRouter();
  const [sel, setSel] = useState<PickerSelection>(EMPTY_SELECTION);
  const [where, setWhere] = useState("");
  const [geo, setGeo] = useState<Geo | null>(null);
  const [radius, setRadius] = useState("30");
  const [pay, setPay] = useState<PayMode>("cash");
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");

  function nearMe() {
    setGeoError("");
    if (!navigator.geolocation) { setGeoError("Your browser can't share its location. Type a postcode instead."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          setGeo(await reverseGeocode(pos.coords.latitude, pos.coords.longitude));
        } catch {
          setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude, town: "Near me", postcode: "" });
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        setGeoError(err.code === err.PERMISSION_DENIED ? "Location permission was denied. Type a town or postcode instead." : "Couldn't get your location. Type a town or postcode instead.");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const p = new URLSearchParams();
    if (sel.vehicles.length > 0) p.set("v", stringifyVehicles(sel.vehicles));
    if (sel.body.length > 0) p.set("bodyStyle", sel.body.join(","));
    if (sel.fuel.length > 0) p.set("fuel", sel.fuel.join(","));
    if (pay !== "cash") p.set("pay", pay);
    if (geo) {
      p.set("lat", geo.lat.toFixed(4));
      p.set("lng", geo.lng.toFixed(4));
      p.set("loc", geo.town);
      p.set("radius", radius);
    } else if (where.trim()) {
      p.set("near", where.trim());
      p.set("radius", radius);
    }
    const qs = p.toString();
    router.push(`/vans${qs ? `?${qs}` : ""}`);
  }

  const seg = (active: boolean) =>
    `rounded-[var(--radius-md)] px-3.5 py-1.5 text-[var(--text-sm)] font-semibold transition-colors ${active ? "bg-ink-900 text-white" : "text-ink-600 hover:text-ink-900"}`;

  return (
    <form onSubmit={submit} className="rounded-[var(--radius-2xl)] border border-border bg-white p-3 shadow-[var(--shadow-lg)] sm:p-4">
      <VehiclePicker data={picker} value={sel} onChange={setSel} variant="inline" onSubmit={() => submit()} />

      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        {/* Location */}
        {geo ? (
          <span className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] border border-brand-200 bg-brand-50 py-1 pl-3 pr-1.5 text-[var(--text-sm)] font-semibold text-brand-700">
            {geo.town} ·
            <select value={radius} onChange={(e) => setRadius(e.target.value)} aria-label="Search radius" className="cursor-pointer bg-transparent py-0.5 font-semibold text-brand-700 outline-none">
              {RADII.map((r) => <option key={r} value={r}>{r} mi</option>)}
            </select>
            <button type="button" onClick={() => setGeo(null)} aria-label="Clear location" className="grid size-6 place-items-center rounded-full text-brand-400 hover:bg-brand-100 hover:text-brand-700">×</button>
          </span>
        ) : (
          <>
            <input
              value={where}
              onChange={(e) => setWhere(e.target.value)}
              placeholder="Town or postcode"
              aria-label="Town or postcode"
              className="h-10 w-44 rounded-[var(--radius-pill)] border border-border bg-white px-4 text-[var(--text-sm)] font-medium text-ink-900 outline-none placeholder:font-normal placeholder:text-ink-400 focus:border-brand-400"
            />
            {where.trim() && (
              <select value={radius} onChange={(e) => setRadius(e.target.value)} aria-label="Search radius" className="h-10 rounded-[var(--radius-pill)] border border-border bg-white px-3 text-[var(--text-sm)] font-medium text-ink-800 outline-none">
                {RADII.map((r) => <option key={r} value={r}>{r} mi</option>)}
              </select>
            )}
            <button
              type="button"
              onClick={nearMe}
              disabled={locating}
              className="inline-flex h-10 items-center gap-1.5 rounded-[var(--radius-pill)] border border-border bg-white px-4 text-[var(--text-sm)] font-semibold text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700 disabled:opacity-60"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /><circle cx="12" cy="12" r="8" /></svg>
              {locating ? "Locating…" : "Near me"}
            </button>
          </>
        )}

        {/* Cash / Finance / Both */}
        <div className="inline-flex rounded-[var(--radius-lg)] border border-border bg-surface-1 p-0.5" role="group" aria-label="Show prices as">
          {(["cash", "finance", "both"] as const).map((m) => (
            <button key={m} type="button" aria-pressed={pay === m} onClick={() => setPay(m)} className={seg(pay === m)}>
              {m === "cash" ? "Cash" : m === "finance" ? "Finance" : "Both"}
            </button>
          ))}
        </div>

        <button
          type="submit"
          className="ml-auto inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-xl)] px-7 text-[var(--text-base)] font-bold text-white shadow-[var(--shadow-md)] transition-all active:scale-[0.98] sm:w-auto"
          style={{ background: "linear-gradient(135deg, #f47c1e 0%, #d96410 100%)" }}
        >
          <IconSearch width={17} height={17} />
          {(() => { const n = sel.vehicles.length || sel.body.length || sel.fuel.length ? countMatches(picker, sel) : total; return n > 0 ? `Search ${n.toLocaleString("en-GB")} ${n === 1 ? "van" : "vans"}` : "Search vans"; })()}
        </button>
      </div>
      {geoError && <p role="alert" className="mt-2 text-[var(--text-xs)] text-red-600">{geoError}</p>}
    </form>
  );
}
