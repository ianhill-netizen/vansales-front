"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LocationInput, type LocationInputHandle } from "./location-input";
import { RADII, locationParams, radiusLabel, saveLoc, type Place, type Radius } from "@/lib/location";

/**
 * The top of the results: the active location and radius as a pill, "Change" (opens the same postcode + Near me box right here, not a modal), and radius pills that widen the search without a new search
 * (each is a link with the radius swapped). `hrefs` are built by the page (current filters kept, page reset); `base` is the page's query without the location, used when the location is changed.
 */
export function LocationBar({ postcode, town, radius, lat, lng, hrefs, base }: { postcode: string; town: string; radius: string; lat?: number; lng?: number; hrefs: Record<string, string>; base: Record<string, string> }) {
  const router = useRouter();
  const [open, setOpen] = useState(!postcode);
  const [pc, setPc] = useState(postcode);
  const [place, setPlace] = useState<Place | null>(null);
  const [error, setError] = useState("");
  const loc = useRef<LocationInputHandle>(null);
  const r = (RADII as readonly string[]).includes(radius) ? radius : "25";
  // Whatever location and radius the results are showing is the one remembered for the next visit (so widening here is remembered too)
  useEffect(() => { if (postcode) saveLoc({ postcode, town, lat, lng, radius: r as Radius }); }, [postcode, town, lat, lng, r]);

  async function apply(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    let resolved: Place | null = null;
    try { resolved = await loc.current!.resolve(); } catch (err) { setError((err as Error).message); return; }
    const p = new URLSearchParams(base);
    if (resolved) {
      for (const [k, v] of Object.entries(locationParams(resolved, r as Radius))) p.set(k, v);
      saveLoc({ postcode: resolved.postcode, town: resolved.town, lat: resolved.lat, lng: resolved.lng, radius: r as Radius });
    }
    setOpen(false);
    router.push(`/vans${p.toString() ? `?${p}` : ""}`);
  }

  return (
    <div className="mb-5 rounded-[var(--radius-xl)] border border-border bg-white p-3" data-testid="location-bar">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {postcode ? (
          <span className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-brand-200 bg-brand-50 py-1 pl-3 pr-1.5 text-[length:var(--text-sm)] font-semibold text-brand-700">
            {town ? `${town} · ` : ""}{postcode} · {radiusLabel(r)}
            <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="rounded-full bg-white px-2.5 py-0.5 text-[length:var(--text-xs)] font-semibold text-brand-700 hover:bg-brand-100">{open ? "Close" : "Change"}</button>
          </span>
        ) : (
          <span className="text-[length:var(--text-sm)] text-ink-600">Showing vans everywhere. <button type="button" onClick={() => setOpen(true)} className="font-semibold text-brand-700 underline underline-offset-2">Add your postcode</button> to sort by distance.</span>
        )}
        {postcode && (
          <nav aria-label="Widen the search" className="flex flex-wrap items-center gap-1.5">
            {RADII.map((x) => (
              <Link key={x} href={hrefs[x] ?? "#"} aria-current={x === r ? "true" : undefined} scroll={false}
                className={`inline-flex h-8 items-center rounded-full border px-3 text-[length:var(--text-xs)] font-semibold transition-colors ${x === r ? "border-brand-600 bg-brand-600 text-white" : "border-border bg-surface-1 text-ink-700 hover:border-brand-300 hover:text-brand-700"}`}>
                {x === "national" ? "National" : x}
              </Link>
            ))}
            <span className="text-[length:var(--text-xs)] text-ink-400">miles</span>
          </nav>
        )}
      </div>
      {open && (
        <form onSubmit={apply} className="mt-3 space-y-2">
          <LocationInput ref={loc} postcode={pc} place={place} onChange={(v, p) => { setPc(v); setPlace(p); }} />
          {error && <p role="alert" className="text-[length:var(--text-xs)] text-red-600">{error}</p>}
          <button type="submit" className="h-10 rounded-[var(--radius-pill)] bg-ink-900 px-5 text-[length:var(--text-sm)] font-semibold text-white hover:bg-ink-800">Update results</button>
        </form>
      )}
    </div>
  );
}
