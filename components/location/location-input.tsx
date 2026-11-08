"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { formatPostcode, isUkPostcode, lookupPostcode, reverseLookup, type Place } from "@/lib/location";

export interface LocationInputHandle { /** Resolve what is typed to a place (validating the postcode). Null when empty; throws a message when it is not a postcode we know. */ resolve(): Promise<Place | null> }

/**
 * Row 1 of the search: a UK postcode box and a "Near me" button. Near me asks the browser for its position and turns it into the nearest postcode through our API; if the position is refused or unavailable the postcode
 * box is focused instead. `place` is the resolved location (set by Near me or by resolve()); typing again clears it so a stale position is never used for a different postcode.
 */
export const LocationInput = forwardRef<LocationInputHandle, { postcode: string; place: Place | null; onChange: (postcode: string, place: Place | null) => void; className?: string }>(function LocationInput({ postcode, place, onChange, className }, ref) {
  const box = useRef<HTMLInputElement>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  useImperativeHandle(ref, () => ({
    async resolve() {
      const pc = postcode.trim();
      if (!pc) return null;
      if (!isUkPostcode(pc)) throw new Error("Enter a full UK postcode, like CF31 1DW.");
      if (place && formatPostcode(place.postcode) === formatPostcode(pc)) return place;
      return lookupPostcode(pc);
    },
  }));

  function nearMe() {
    setError("");
    if (!navigator.geolocation) { setError("Your browser can't share its location. Type a postcode instead."); box.current?.focus(); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try { const p = await reverseLookup(pos.coords.latitude, pos.coords.longitude); onChange(p.postcode, p); }
        catch (e) { setError((e as Error).message); box.current?.focus(); }
        finally { setLocating(false); }
      },
      (err) => { setLocating(false); setError(err.code === err.PERMISSION_DENIED ? "Location is switched off for this site. Type your postcode instead." : "We could not get your location. Type your postcode instead."); box.current?.focus(); },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          ref={box} value={postcode} onChange={(e) => { setError(""); onChange(e.target.value.toUpperCase(), null); }}
          placeholder="Your postcode, e.g. CF31 1DW" aria-label="Your postcode" autoComplete="postal-code" inputMode="text" autoCapitalize="characters" maxLength={9}
          className="h-11 min-w-0 flex-1 rounded-[var(--radius-pill)] border border-border bg-white px-4 text-[length:var(--text-base)] font-medium text-ink-900 outline-none placeholder:font-normal placeholder:text-ink-400 focus:border-brand-400"
        />
        <button type="button" onClick={nearMe} disabled={locating}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-[var(--radius-pill)] border border-border bg-white px-5 text-[length:var(--text-sm)] font-semibold text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700 disabled:opacity-60">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /><circle cx="12" cy="12" r="8" /></svg>
          {locating ? "Locating…" : "Near me"}
        </button>
      </div>
      {place && <p className="mt-1.5 text-[length:var(--text-xs)] text-ink-500">{place.town ? `${place.town} · ` : ""}{place.postcode}</p>}
      {error && <p role="alert" className="mt-1.5 text-[length:var(--text-xs)] text-red-600">{error}</p>}
    </div>
  );
});
