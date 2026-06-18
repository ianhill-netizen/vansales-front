"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

/* -----------------------------------------------------------------------------
   FilterRail — price, year, body style, wheelbase, fuel. Writes to the URL
   query so results stay shareable and SSR-rendered. Server reads the same
   params. Mobile: collapses into a <details> drawer.
   -------------------------------------------------------------------------- */
const BODY_STYLES = ["Panel Van", "Crew Cab", "Luton", "Dropside", "Pickup", "Kombi"];
const WHEELBASES = [
  { v: "swb", label: "Short (SWB)" },
  { v: "mwb", label: "Medium (MWB)" },
  { v: "lwb", label: "Long (LWB)" },
];
const FUELS = ["Diesel", "Petrol", "Electric", "Hybrid"];
const PRICES = [10000, 15000, 20000, 25000, 30000, 40000, 50000];
const YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

export function FilterRail({ resultCount }: { resultCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  const get = (k: string) => params.get(k) ?? "";
  const activeCount = ["minPrice", "maxPrice", "minYear", "bodyStyle", "wheelbase", "fuel"].filter(
    (k) => params.get(k),
  ).length;

  const selectClass =
    "h-11 w-full appearance-none rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[var(--text-sm)] font-medium text-ink-800 outline-none focus-visible:border-accent-500";
  const legendClass =
    "mb-1.5 block text-[var(--text-2xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-ink-500";

  const body = (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className={legendClass}>Price from</span>
          <select value={get("minPrice")} onChange={(e) => setParam("minPrice", e.target.value)} className={selectClass}>
            <option value="">No min</option>
            {PRICES.map((p) => (
              <option key={p} value={p}>£{p.toLocaleString()}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={legendClass}>Price to</span>
          <select value={get("maxPrice")} onChange={(e) => setParam("maxPrice", e.target.value)} className={selectClass}>
            <option value="">No max</option>
            {PRICES.map((p) => (
              <option key={p} value={p}>£{p.toLocaleString()}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className={legendClass}>Year from</span>
        <select value={get("minYear")} onChange={(e) => setParam("minYear", e.target.value)} className={selectClass}>
          <option value="">Any year</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className={legendClass}>Body style</span>
        <select value={get("bodyStyle")} onChange={(e) => setParam("bodyStyle", e.target.value)} className={selectClass}>
          <option value="">All body styles</option>
          {BODY_STYLES.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </label>

      <fieldset>
        <legend className={legendClass}>Wheelbase</legend>
        <div className="flex flex-wrap gap-2">
          {WHEELBASES.map((w) => {
            const active = get("wheelbase") === w.v;
            return (
              <button
                key={w.v}
                type="button"
                onClick={() => setParam("wheelbase", active ? "" : w.v)}
                className={`rounded-[var(--radius-pill)] border px-3 py-1.5 text-[var(--text-sm)] font-semibold transition-colors ${
                  active
                    ? "border-accent-500 bg-accent-tint text-accent-700"
                    : "border-border bg-surface-0 text-ink-600 hover:border-border-strong"
                }`}
              >
                {w.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className={legendClass}>Fuel</legend>
        <div className="flex flex-wrap gap-2">
          {FUELS.map((f) => {
            const active = get("fuel") === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setParam("fuel", active ? "" : f)}
                className={`rounded-[var(--radius-pill)] border px-3 py-1.5 text-[var(--text-sm)] font-semibold transition-colors ${
                  active
                    ? "border-accent-500 bg-accent-tint text-accent-700"
                    : "border-border bg-surface-0 text-ink-600 hover:border-border-strong"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </fieldset>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={() => router.push(pathname, { scroll: false })}
          className="self-start text-[var(--text-sm)] font-semibold text-accent-600 underline-offset-2 hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile drawer */}
      <details className="group rounded-[var(--radius-lg)] border border-border bg-card p-4 lg:hidden">
        <summary className="flex cursor-pointer items-center justify-between font-display text-[var(--text-base)] font-bold text-ink-900 [&::-webkit-details-marker]:hidden">
          Filters{activeCount > 0 ? ` · ${activeCount}` : ""}
          <span className="text-[var(--text-sm)] font-medium text-ink-500 group-open:hidden">{resultCount} results</span>
        </summary>
        <div className="mt-4">{body}</div>
      </details>

      {/* Desktop rail */}
      <aside className="sticky top-20 hidden rounded-[var(--radius-lg)] border border-border bg-card p-5 lg:block">
        <h2 className="mb-4 font-display text-[var(--text-lg)] font-bold text-ink-900">Refine</h2>
        {body}
      </aside>
    </>
  );
}
