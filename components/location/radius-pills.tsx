"use client";

import { RADII } from "@/lib/location";

/** 10 · 25 · 50 · 100 miles · National, as pills (no dropdown). */
export function RadiusPills({ value, onChange }: { value: string; onChange: (r: (typeof RADII)[number]) => void }) {
  return (
    <div role="radiogroup" aria-label="Search radius" className="flex flex-wrap items-center gap-1.5">
      {RADII.map((r) => (
        <button key={r} type="button" role="radio" aria-checked={value === r} onClick={() => onChange(r)}
          className={`h-9 rounded-full border px-3.5 text-[length:var(--text-sm)] font-semibold transition-colors ${value === r ? "border-brand-600 bg-brand-600 text-white" : "border-border bg-surface-1 text-ink-700 hover:border-brand-300 hover:text-brand-700"}`}>
          {r === "national" ? "National" : r === "100" ? "100 miles" : `${r}`}
        </button>
      ))}
    </div>
  );
}
