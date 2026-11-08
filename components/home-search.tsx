"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { stringifyVehicles } from "@/lib/vehicle-chips";
import type { PayMode } from "@/lib/finance";
import type { PickerData } from "@/lib/listings/picker";
import { VehiclePicker, EMPTY_SELECTION, countMatches, type PickerSelection } from "./picker/vehicle-picker";
import { IconSearch } from "./icons";
import { LocationInput, type LocationInputHandle } from "./location/location-input";
import { RadiusPills } from "./location/radius-pills";
import { DEFAULT_RADIUS, locationParams, readLoc, saveLoc, type Place, type Radius } from "@/lib/location";

/* =============================================================================
   HOME SEARCH — the hero. Chip search (make / model), a location (typed town or
   postcode, or "Near me" via the browser's geolocation reverse-geocoded by the free
   postcodes.io API), an adjustable radius, and the Cash / Finance / Both toggle.
   Submitting goes to /vans with everything in the URL.
   ============================================================================= */

export function HomeSearch({ total, picker }: { total: number; picker: PickerData }) {
  const router = useRouter();
  const [sel, setSel] = useState<PickerSelection>(EMPTY_SELECTION);
  const [postcode, setPostcode] = useState("");
  const [place, setPlace] = useState<Place | null>(null);
  const [radius, setRadius] = useState<Radius>(DEFAULT_RADIUS);
  const [pay, setPay] = useState<PayMode>("cash");
  const [under10k, setUnder10k] = useState(false);
  const [ulez, setUlez] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const loc = useRef<LocationInputHandle>(null);

  // The last postcode and radius used are remembered on this device: pre-fill them on return
  useEffect(() => {
    const s = readLoc();
    if (!s) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage, which does not exist on the server
    setPostcode(s.postcode); setRadius(s.radius);
    if (s.lat != null && s.lng != null) setPlace({ postcode: s.postcode, town: s.town ?? "", lat: s.lat, lng: s.lng });
  }, []);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (busy) return;
    setError(""); setBusy(true);
    let resolved: Place | null = null;
    try { resolved = await loc.current!.resolve(); } catch (err) { setError((err as Error).message); setBusy(false); return; }
    const p = new URLSearchParams();
    if (sel.vehicles.length > 0) p.set("v", stringifyVehicles(sel.vehicles));
    if (sel.body.length > 0) p.set("bodyStyle", sel.body.join(","));
    if (sel.fuel.length > 0) p.set("fuel", sel.fuel.join(","));
    if (pay !== "cash") p.set("pay", pay);
    if (under10k) p.set("maxPrice", "10000");
    if (ulez) p.set("ulez", "1");
    if (resolved) {
      for (const [k, v] of Object.entries(locationParams(resolved, radius))) p.set(k, v);
      saveLoc({ postcode: resolved.postcode, town: resolved.town, lat: resolved.lat, lng: resolved.lng, radius });
    }
    const qs = p.toString();
    router.push(`/vans${qs ? `?${qs}` : ""}`);
  }

  const seg = (active: boolean) =>
    `rounded-[var(--radius-md)] px-3.5 py-1.5 text-[length:var(--text-sm)] font-semibold transition-colors ${active ? "bg-ink-900 text-white" : "text-ink-600 hover:text-ink-900"}`;

  return (
    <form onSubmit={submit} className="rounded-[var(--radius-2xl)] border border-border bg-white p-3 shadow-[var(--shadow-lg)] sm:p-4">
      {/* Row 1: where you are */}
      <LocationInput ref={loc} postcode={postcode} place={place} onChange={(pc, pl) => { setPostcode(pc); setPlace(pl); }} />

      {/* Row 2: what you want, and how far you will go */}
      <div className="mt-3">
        <VehiclePicker data={picker} value={sel} onChange={setSel} variant="popover" onSubmit={() => void submit()} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-[length:var(--text-sm)] font-semibold text-ink-600">Within (miles)</span>
        <RadiusPills value={radius} onChange={setRadius} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        {/* Cash / Finance / Both */}
        <div className="inline-flex rounded-[var(--radius-lg)] border border-border bg-surface-1 p-0.5" role="group" aria-label="Show prices as">
          {(["cash", "finance", "both"] as const).map((m) => (
            <button key={m} type="button" aria-pressed={pay === m} onClick={() => setPay(m)} className={seg(pay === m)}>
              {m === "cash" ? "Cash" : m === "finance" ? "Finance" : "Both"}
            </button>
          ))}
        </div>

        {/* Two quick toggles (the body-type pills live in the picker) */}
        {([["Under £10k", under10k, setUnder10k], ["ULEZ", ulez, setUlez]] as const).map(([label, on, set]) => (
          <button
            key={label}
            type="button"
            aria-pressed={on}
            onClick={() => set(!on)}
            className={`inline-flex h-9 items-center rounded-full border px-3.5 text-[length:var(--text-sm)] font-semibold transition-colors ${on ? "border-brand-600 bg-brand-600 text-white" : "border-border bg-surface-1 text-ink-700 hover:border-brand-300 hover:text-brand-700"}`}
          >
            {label}
          </button>
        ))}

        <button
          type="submit" disabled={busy}
          className="ml-auto inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-xl)] px-7 text-[length:var(--text-base)] font-bold text-white shadow-[var(--shadow-md)] transition-all active:scale-[0.98] sm:w-auto"
          style={{ background: "linear-gradient(135deg, #f47c1e 0%, #d96410 100%)" }}
        >
          <IconSearch width={17} height={17} />
          {(() => { const n = sel.vehicles.length || sel.body.length || sel.fuel.length ? countMatches(picker, sel) : total; return n >= 20 ? `Search ${n.toLocaleString("en-GB")} vans` : "Search vans"; })()}
        </button>
      </div>
      {error && <p role="alert" className="mt-2 text-[length:var(--text-xs)] text-red-600">{error}</p>}
    </form>
  );
}
