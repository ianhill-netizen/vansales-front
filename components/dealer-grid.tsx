"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { DirectoryDealer } from "@/lib/dealers/directory";

const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => (w[0] ?? "").toUpperCase()).join("");

export function DealerGrid({ dealers }: { dealers: DirectoryDealer[] }) {
  const [q, setQ] = useState("");
  const [make, setMake] = useState("");

  const makes = useMemo(() => [...new Set(dealers.flatMap((d) => d.makes))].sort((a, b) => a.localeCompare(b)), [dealers]);
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return dealers.filter(
      (d) =>
        (!make || d.makes.includes(make)) &&
        (!needle || `${d.name} ${d.town} ${d.county}`.toLowerCase().includes(needle)),
    );
  }, [dealers, q, make]);

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-[1fr_16rem]">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by dealer name or location"
          aria-label="Search dealers by name or location"
          className="h-12 rounded-[var(--radius-lg)] border border-border bg-white px-4 text-[var(--text-base)] outline-none focus:border-brand-400 focus:shadow-[var(--shadow-focus)]"
        />
        <select
          value={make}
          onChange={(e) => setMake(e.target.value)}
          aria-label="Filter by make stocked"
          className="h-12 rounded-[var(--radius-lg)] border border-border bg-white px-3 text-[var(--text-base)] outline-none focus:border-brand-400"
        >
          <option value="">Any make</option>
          {makes.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <p className="mt-4 text-[var(--text-sm)] text-ink-500">
        {shown.length} dealer{shown.length === 1 ? "" : "s"}
        {(q || make) && (
          <button type="button" onClick={() => { setQ(""); setMake(""); }} className="ml-3 font-semibold text-brand-600 hover:underline">Clear</button>
        )}
      </p>

      {shown.length === 0 ? (
        <div className="mt-6 rounded-[var(--radius-2xl)] border border-dashed border-border bg-white px-8 py-14 text-center text-ink-500">
          No dealers match that search.
        </div>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((d) => (
            <Link
              key={d.slug}
              href={`/dealer/${d.slug}`}
              className="group flex flex-col rounded-[var(--radius-xl)] border border-border bg-white p-5 shadow-[var(--shadow-sm)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
            >
              <div className="flex items-center gap-3.5">
                <span className="grid size-14 shrink-0 place-items-center rounded-[var(--radius-lg)] bg-brand-600 font-display text-[var(--text-lg)] font-extrabold text-white" aria-hidden>
                  {initials(d.name)}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate font-display text-[var(--text-lg)] font-bold text-ink-900 group-hover:text-brand-700">{d.name}</h2>
                  <p className="truncate text-[var(--text-sm)] text-ink-500">{[d.town, d.county].filter(Boolean).join(", ") || "UK"}</p>
                </div>
              </div>
              <p className="mt-4 text-[var(--text-sm)] text-ink-700">
                <span className="font-mono text-[var(--text-xl)] font-bold text-ink-900">{d.vanCount}</span> van{d.vanCount === 1 ? "" : "s"} in stock
                {d.rating != null && <span className="ml-3 text-ink-500">★ {d.rating.toFixed(1)}</span>}
              </p>
              {d.makes.length > 0 && (
                <p className="mt-2 line-clamp-2 text-[var(--text-xs)] text-ink-500">
                  <span className="font-semibold text-ink-600">Stocks:</span> {d.makes.slice(0, 6).join(", ")}
                  {d.makes.length > 6 ? ` +${d.makes.length - 6} more` : ""}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
