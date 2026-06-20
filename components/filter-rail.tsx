"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

/* FilterRail — price, year, body style, wheelbase, fuel.
   Writes to the URL query so results stay shareable and SSR-rendered.
   Mobile: collapses into a <details> summary drawer.
   Desktop: sticky aside panel.                                               */

const DEFAULT_BODY_STYLES = ["Panel Van", "Crew Cab", "Luton", "Dropside", "Pickup", "Tipper", "Chassis Cab"];
const WHEELBASES = [
  { v: "swb", label: "SWB" },
  { v: "mwb", label: "MWB" },
  { v: "lwb", label: "LWB" },
];
const DEFAULT_FUELS = ["Diesel", "Petrol", "Electric", "Hybrid"];
const PRICES = [10000, 15000, 20000, 25000, 30000, 40000, 50000];
const YEARS  = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

const LEGEND_CLS =
  "mb-2 block text-[var(--text-2xs)] font-bold uppercase tracking-[var(--tracking-wide)] text-ink-500";

const SELECT_CLS =
  "h-10 w-full appearance-none rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[var(--text-sm)] font-medium text-ink-800 outline-none transition-colors focus-visible:border-brand-500 focus-visible:shadow-[var(--shadow-focus)] cursor-pointer";

export function FilterRail({
  resultCount,
  fuels,
  bodyStyles,
}: {
  resultCount: number;
  fuels?: string[];
  bodyStyles?: string[];
}) {
  const router     = useRouter();
  const pathname   = usePathname();
  const params     = useSearchParams();

  const FUELS       = fuels?.length       ? fuels       : DEFAULT_FUELS;
  const BODY_STYLES = bodyStyles?.length  ? bodyStyles  : DEFAULT_BODY_STYLES;

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value); else next.delete(key);
      next.delete("page");
      const qs = next.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const get = (k: string) => params.get(k) ?? "";
  const activeCount = ["minPrice", "maxPrice", "minYear", "bodyStyle", "wheelbase", "fuel"]
    .filter((k) => params.get(k)).length;

  function pill(label: string, paramKey: string, value: string) {
    const active = get(paramKey) === value;
    return (
      <button
        key={value}
        type="button"
        onClick={() => setParam(paramKey, active ? "" : value)}
        className={`rounded-[var(--radius-pill)] border px-3 py-1.5 text-[var(--text-xs)] font-semibold transition-all duration-[var(--dur-fast)] ${
          active
            ? "border-accent-500 bg-accent-tint text-accent-700"
            : "border-border bg-surface-0 text-ink-600 hover:border-ink-400 hover:text-ink-800"
        }`}
        aria-pressed={active}
      >
        {label}
      </button>
    );
  }

  const content = (
    <div className="flex flex-col gap-5">

      {/* Price range */}
      <fieldset>
        <legend className={LEGEND_CLS}>Price range</legend>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <select
              value={get("minPrice")}
              onChange={(e) => setParam("minPrice", e.target.value)}
              className={SELECT_CLS}
              aria-label="Price from"
            >
              <option value="">No min</option>
              {PRICES.map((p) => (
                <option key={p} value={p}>£{p.toLocaleString()}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 9l6 6 6-6" /></svg>
          </div>
          <div className="relative">
            <select
              value={get("maxPrice")}
              onChange={(e) => setParam("maxPrice", e.target.value)}
              className={SELECT_CLS}
              aria-label="Price to"
            >
              <option value="">No max</option>
              {PRICES.map((p) => (
                <option key={p} value={p}>£{p.toLocaleString()}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 9l6 6 6-6" /></svg>
          </div>
        </div>
      </fieldset>

      {/* Year */}
      <fieldset>
        <legend className={LEGEND_CLS}>Year from</legend>
        <div className="relative">
          <select
            value={get("minYear")}
            onChange={(e) => setParam("minYear", e.target.value)}
            className={SELECT_CLS}
            aria-label="Year from"
          >
            <option value="">Any year</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 9l6 6 6-6" /></svg>
        </div>
      </fieldset>

      {/* Body style */}
      <fieldset>
        <legend className={LEGEND_CLS}>Body style</legend>
        <div className="relative">
          <select
            value={get("bodyStyle")}
            onChange={(e) => setParam("bodyStyle", e.target.value)}
            className={SELECT_CLS}
            aria-label="Body style"
          >
            <option value="">All body styles</option>
            {BODY_STYLES.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 9l6 6 6-6" /></svg>
        </div>
      </fieldset>

      {/* Wheelbase pills */}
      <fieldset>
        <legend className={LEGEND_CLS}>Wheelbase</legend>
        <div className="flex flex-wrap gap-2">
          {WHEELBASES.map((w) => pill(w.label, "wheelbase", w.v))}
        </div>
      </fieldset>

      {/* Fuel pills */}
      <fieldset>
        <legend className={LEGEND_CLS}>Fuel type</legend>
        <div className="flex flex-wrap gap-2">
          {FUELS.map((f) => pill(f, "fuel", f))}
        </div>
      </fieldset>

      {/* Clear filters */}
      {activeCount > 0 && (
        <button
          type="button"
          onClick={() => router.push(pathname, { scroll: false })}
          className="self-start text-[var(--text-sm)] font-semibold text-accent-600 underline-offset-2 hover:underline"
        >
          Clear all {activeCount} filter{activeCount !== 1 ? "s" : ""}
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile: details drawer */}
      <details className="group rounded-[var(--radius-xl)] border border-border bg-white p-4 shadow-[var(--shadow-xs)] lg:hidden">
        <summary className="flex cursor-pointer items-center justify-between font-display text-[var(--text-base)] font-bold text-ink-900 [&::-webkit-details-marker]:hidden">
          <span>
            Filters
            {activeCount > 0 && (
              <span className="ml-2 rounded-[var(--radius-pill)] bg-accent-tint px-2 py-0.5 text-[var(--text-xs)] font-bold text-accent-700">
                {activeCount}
              </span>
            )}
          </span>
          <span className="text-[var(--text-sm)] font-medium text-ink-500 group-open:hidden">
            {resultCount.toLocaleString()} results
          </span>
        </summary>
        <div className="mt-5 border-t border-border pt-5">{content}</div>
      </details>

      {/* Desktop: sticky aside */}
      <aside className="sticky top-[calc(var(--header-h,6.25rem)+1rem)] hidden self-start rounded-[var(--radius-xl)] border border-border bg-white p-5 shadow-[var(--shadow-xs)] lg:block">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-[var(--text-base)] font-bold text-ink-900">Refine results</h2>
          {activeCount > 0 && (
            <span className="rounded-[var(--radius-pill)] bg-accent-tint px-2.5 py-0.5 text-[var(--text-xs)] font-bold text-accent-700">
              {activeCount} active
            </span>
          )}
        </div>
        {content}
      </aside>
    </>
  );
}
