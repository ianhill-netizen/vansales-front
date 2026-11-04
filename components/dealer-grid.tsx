"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PinMap, type Pin } from "./pin-map";
import type { DirectoryDealer } from "@/lib/dealers/directory";

const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => (w[0] ?? "").toUpperCase()).join("");

export function DealerGrid({ dealers }: { dealers: DirectoryDealer[] }) {
  const [q, setQ] = useState("");
  const [make, setMake] = useState("");
  const [view, setView] = useState<"list" | "map">("list");
  const [selected, setSelected] = useState<string | null>(null);
  const [inView, setInView] = useState<Set<string> | null>(null);
  const [pane, setPane] = useState<"map" | "list">("map"); // mobile map view only

  const makes = useMemo(() => [...new Set(dealers.flatMap((d) => d.makes))].sort((a, b) => a.localeCompare(b)), [dealers]);
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return dealers.filter(
      (d) =>
        (!make || d.makes.includes(make)) &&
        (!needle || `${d.name} ${d.town} ${d.county}`.toLowerCase().includes(needle)),
    );
  }, [dealers, q, make]);

  const pins = useMemo<Pin[]>(
    () => shown.filter((d) => d.lat != null && d.lng != null).map((d) => ({ id: d.slug, lat: d.lat!, lng: d.lng!, label: d.name, kind: "dealer" as const })),
    [shown],
  );
  const inMapView = view === "map" && inView ? shown.filter((d) => inView.has(d.slug) || d.lat == null) : shown;
  const unlocated = shown.filter((d) => d.lat == null).length;

  const card = (d: DirectoryDealer, highlighted: boolean) => (
    <Link
      key={d.slug}
      href={`/dealer/${d.slug}`}
      data-dealer={d.slug}
      onMouseEnter={() => view === "map" && d.lat != null && setSelected(d.slug)}
      className={`group flex flex-col rounded-[var(--radius-xl)] border bg-white p-5 shadow-[var(--shadow-sm)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)] ${highlighted ? "border-brand-500 ring-2 ring-brand-500/40" : "border-border"}`}
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
  );

  const toggle = (
    <div className="inline-flex rounded-[var(--radius-lg)] border border-border bg-surface-1 p-1" role="group" aria-label="Directory view">
      {(["list", "map"] as const).map((v) => (
        <button
          key={v}
          type="button"
          aria-pressed={view === v}
          onClick={() => { setView(v); setSelected(null); }}
          className={`rounded-[var(--radius-md)] px-3.5 py-1.5 text-[var(--text-sm)] font-semibold transition-colors ${view === v ? "bg-ink-900 text-white" : "text-ink-600 hover:text-ink-900"}`}
        >
          {v === "list" ? "List" : "Map"}
        </button>
      ))}
    </div>
  );

  const selectedDealer = shown.find((d) => d.slug === selected);

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-[1fr_16rem_auto]">
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
        {toggle}
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
      ) : view === "list" ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{shown.map((d) => card(d, false))}</div>
      ) : (
        <div className="mt-4 max-lg:fixed max-lg:inset-0 max-lg:z-40 max-lg:flex max-lg:flex-col max-lg:bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-border bg-white px-4 py-3 lg:hidden">
            <button type="button" onClick={() => setView("list")} className="text-[var(--text-sm)] font-semibold text-brand-600">← Back to list</button>
            <p className="text-[var(--text-sm)] font-semibold text-ink-700">{inMapView.length} dealer{inMapView.length === 1 ? "" : "s"}</p>
          </div>
          <div className="relative grid min-h-0 flex-1 lg:h-[calc(100dvh-16rem)] lg:min-h-[520px] lg:grid-cols-[minmax(320px,440px)_1fr] lg:gap-4">
            <div className={`min-h-0 space-y-4 overflow-y-auto bg-surface-1 p-3 lg:rounded-[var(--radius-xl)] lg:border lg:border-border ${pane === "list" ? "max-lg:block" : "max-lg:hidden"}`}>
              {inMapView.map((d) => card(d, d.slug === selected))}
              {unlocated > 0 && <p className="px-1 text-[var(--text-xs)] text-ink-400">{unlocated} dealer{unlocated === 1 ? "" : "s"} without a map location are listed but not pinned.</p>}
            </div>
            <div className={`relative min-h-0 ${pane === "map" ? "max-lg:block" : "max-lg:hidden"}`}>
              <PinMap
                pins={pins}
                selectedId={selected}
                onSelect={setSelected}
                onBounds={setInView}
                maxFitZoom={11}
                className="h-full min-h-[320px] w-full overflow-hidden lg:rounded-[var(--radius-xl)] lg:border lg:border-border"
              />
              {selectedDealer && (
                <Link
                  href={`/dealer/${selectedDealer.slug}`}
                  className="absolute inset-x-3 bottom-16 z-[1000] rounded-[var(--radius-lg)] bg-white p-4 shadow-[var(--shadow-lg)] lg:bottom-4 lg:left-4 lg:right-auto lg:w-80"
                >
                  <p className="font-display text-[var(--text-base)] font-bold text-ink-900">{selectedDealer.name}</p>
                  <p className="text-[var(--text-sm)] text-ink-500">{[selectedDealer.town, selectedDealer.county].filter(Boolean).join(", ")} · {selectedDealer.vanCount} van{selectedDealer.vanCount === 1 ? "" : "s"}</p>
                  {selectedDealer.makes.length > 0 && <p className="mt-1 text-[var(--text-xs)] text-ink-500">{selectedDealer.makes.slice(0, 5).join(", ")}</p>}
                  <p className="mt-2 text-[var(--text-sm)] font-semibold text-brand-700">View dealer →</p>
                </Link>
              )}
            </div>
            <button
              type="button"
              onClick={() => setPane((p) => (p === "map" ? "list" : "map"))}
              className="absolute bottom-5 left-1/2 z-[1000] -translate-x-1/2 rounded-full bg-ink-900 px-5 py-2.5 text-[var(--text-sm)] font-bold text-white shadow-[var(--shadow-lg)] lg:hidden"
            >
              {pane === "map" ? `List (${inMapView.length})` : "Map"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
