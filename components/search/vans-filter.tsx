"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useTransition } from "react";
import { POPULAR_MAKES, ALL_MAKES, getMakeBySlug } from "@/lib/taxonomy/van-makes";
import { WHEELBASE_SHORT } from "@/lib/listings/format";
import { slugify } from "@/lib/listings/slug";
import { priceFromMonthly, FINANCE_ASSUMPTIONS } from "@/lib/finance";
import { IconFilter } from "@/components/icons";
import type { ListingFacets } from "@/lib/listings/types";

/* =============================================================================
   VANS FILTER — AutoTrader-style inline pill dropdowns
   Each main filter has its own pill button that opens a small positioned
   dropdown below it. "Filters" on the right is the catch-all for secondary
   filters (fuel, gearbox, colour, sort). All state is URL-driven.
   ============================================================================= */

type OpenPill = "make" | "price" | "payment" | "year" | "mileage" | "wheelbase" | "body" | "filters" | null;

type FilterDraft = {
  make: string;
  model: string;
  bodyStyle: string;
  fuel: string;
  gearbox: string;
  wheelbase: string;
  colour: string;
  minPrice: string;
  maxPrice: string;
  monthlyMax: string;
  deposit: string;
  minYear: string;
  maxYear: string;
  maxMileage: string;
  sort: string;
};

const DEFAULT_DEPOSIT = "3000";

const EMPTY: FilterDraft = {
  make: "", model: "", bodyStyle: "", fuel: "",
  gearbox: "", wheelbase: "", colour: "",
  minPrice: "", maxPrice: "", monthlyMax: "",
  deposit: DEFAULT_DEPOSIT,
  minYear: "", maxYear: "", maxMileage: "",
  sort: "newest",
};

type Search = Record<string, string | string[] | undefined>;

function one(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

function parseSearchParams(sp: Search): FilterDraft {
  const monthlyMax = one(sp.monthlyMax);
  return {
    make:       one(sp.make),
    model:      one(sp.model),
    bodyStyle:  one(sp.bodyStyle),
    fuel:       one(sp.fuel),
    gearbox:    one(sp.gearbox),
    wheelbase:  one(sp.wheelbase),
    colour:     one(sp.colour),
    minPrice:   monthlyMax ? "" : one(sp.minPrice),
    maxPrice:   monthlyMax ? "" : one(sp.maxPrice),
    monthlyMax,
    deposit:    one(sp.deposit) || DEFAULT_DEPOSIT,
    minYear:    one(sp.minYear),
    maxYear:    one(sp.maxYear),
    maxMileage: one(sp.maxMileage),
    sort:       one(sp.sort) || "newest",
  };
}

function draftToUrl(d: FilterDraft): string {
  const p = new URLSearchParams();
  if (d.make)       p.set("make",       d.make);
  if (d.model)      p.set("model",      d.model);
  if (d.bodyStyle)  p.set("bodyStyle",  d.bodyStyle);
  if (d.fuel)       p.set("fuel",       d.fuel);
  if (d.gearbox)    p.set("gearbox",    d.gearbox);
  if (d.wheelbase)  p.set("wheelbase",  d.wheelbase);
  if (d.colour)     p.set("colour",     d.colour);
  if (d.monthlyMax) {
    p.set("monthlyMax", d.monthlyMax);
    const dep = d.deposit || DEFAULT_DEPOSIT;
    if (dep !== DEFAULT_DEPOSIT) p.set("deposit", dep);
  } else {
    if (d.minPrice) p.set("minPrice", d.minPrice);
    if (d.maxPrice) p.set("maxPrice", d.maxPrice);
  }
  if (d.minYear)    p.set("minYear",    d.minYear);
  if (d.maxYear)    p.set("maxYear",    d.maxYear);
  if (d.maxMileage) p.set("maxMileage", d.maxMileage);
  if (d.sort && d.sort !== "newest") p.set("sort", d.sort);
  const qs = p.toString();
  return `/vans${qs ? `?${qs}` : ""}`;
}

/* ── Active chips ─────────────────────────────────────────────────────────── */

type Chip = { key: string; label: string; clear: Partial<FilterDraft> };

const GBP = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });
function fmt(n: number): string { return GBP.format(n); }
function ucFirst(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
function unslug(s: string): string { return s.split("-").map(ucFirst).join(" "); }

function getChips(d: FilterDraft): Chip[] {
  const out: Chip[] = [];

  if (d.make) {
    const md = getMakeBySlug(d.make);
    const makeName = md?.name ?? ucFirst(d.make);
    const modelName = d.model ? md?.models.find((m) => m.slug === d.model)?.name : null;
    out.push({ key: "make", label: modelName ? `${makeName} · ${modelName}` : makeName, clear: { make: "", model: "" } });
  } else if (d.model) {
    out.push({ key: "model", label: ucFirst(d.model), clear: { model: "" } });
  }

  if (d.monthlyMax) {
    out.push({ key: "monthly", label: `≤ ${fmt(Number(d.monthlyMax))}/mo`, clear: { monthlyMax: "", maxPrice: "", deposit: DEFAULT_DEPOSIT } });
  } else if (d.minPrice || d.maxPrice) {
    const lo = d.minPrice ? fmt(Number(d.minPrice)) : null;
    const hi = d.maxPrice ? fmt(Number(d.maxPrice)) : null;
    out.push({ key: "price", label: lo && hi ? `${lo}–${hi}` : lo ? `${lo}+` : `up to ${hi!}`, clear: { minPrice: "", maxPrice: "" } });
  }

  if (d.minYear || d.maxYear) {
    const label = d.minYear && d.maxYear ? `${d.minYear}–${d.maxYear}` : d.minYear ? `${d.minYear}+` : `up to ${d.maxYear}`;
    out.push({ key: "year", label, clear: { minYear: "", maxYear: "" } });
  }

  if (d.maxMileage) out.push({ key: "mileage", label: `< ${Number(d.maxMileage).toLocaleString("en-GB")} mi`, clear: { maxMileage: "" } });
  if (d.wheelbase) {
    const label = WHEELBASE_SHORT[d.wheelbase as keyof typeof WHEELBASE_SHORT] ?? d.wheelbase.toUpperCase();
    out.push({ key: "wheelbase", label, clear: { wheelbase: "" } });
  }
  if (d.bodyStyle) out.push({ key: "bodyStyle", label: unslug(d.bodyStyle), clear: { bodyStyle: "" } });
  if (d.fuel)      out.push({ key: "fuel",      label: ucFirst(d.fuel),      clear: { fuel: "" } });
  if (d.gearbox)   out.push({ key: "gearbox",   label: ucFirst(d.gearbox),   clear: { gearbox: "" } });
  if (d.colour)    out.push({ key: "colour",    label: ucFirst(d.colour),    clear: { colour: "" } });

  if (d.sort && d.sort !== "newest") {
    const SORT_LABELS: Record<string, string> = { price_asc: "Price ↑", price_desc: "Price ↓", mileage_asc: "Mileage ↑" };
    out.push({ key: "sort", label: SORT_LABELS[d.sort] ?? d.sort, clear: { sort: "newest" } });
  }

  return out;
}

/* ── Static data ─────────────────────────────────────────────────────────── */

const YEAR_OPTIONS = Array.from({ length: 2027 - 2010 + 1 }, (_, i) => 2010 + i);

const MILEAGE_OPTIONS = [
  { label: "Any mileage",       value: "" },
  { label: "Up to 10,000 mi",  value: "10000" },
  { label: "Up to 25,000 mi",  value: "25000" },
  { label: "Up to 50,000 mi",  value: "50000" },
  { label: "Up to 75,000 mi",  value: "75000" },
  { label: "Up to 100,000 mi", value: "100000" },
  { label: "Up to 150,000 mi", value: "150000" },
  { label: "200,000+ mi",      value: "200000" },
];

const COLOURS = ["White", "Black", "Silver", "Grey", "Blue", "Red", "Orange", "Green", "Yellow", "Brown"];

const SORT_OPTIONS = [
  { label: "Newest first",        value: "newest" },
  { label: "Price: low → high",   value: "price_asc" },
  { label: "Price: high → low",   value: "price_desc" },
  { label: "Mileage: low → high", value: "mileage_asc" },
];

/* ── Styling helpers ─────────────────────────────────────────────────────── */

const BASE_PILL = "inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border px-3.5 py-2 text-[var(--text-sm)] font-semibold transition-colors whitespace-nowrap shadow-[var(--shadow-xs)] cursor-pointer select-none";

function pillCls(active: boolean, open: boolean): string {
  if (active)      return `${BASE_PILL} border-brand-600 bg-brand-600 text-white`;
  if (open)        return `${BASE_PILL} border-ink-600 bg-white text-ink-900`;
  return `${BASE_PILL} border-border bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700`;
}

function dropCls(align: "left" | "right" = "left"): string {
  return `absolute ${align === "right" ? "right-0" : "left-0"} top-[calc(100%+6px)] z-50 max-h-[70vh] overflow-y-auto rounded-[var(--radius-xl)] border border-border bg-white shadow-[var(--shadow-xl)] p-4`;
}

const CHIP_BASE = "rounded-[var(--radius-pill)] border px-2.5 py-1 text-[var(--text-xs)] font-semibold transition-colors";
function chipCls(active: boolean): string {
  return `${CHIP_BASE} ${active ? "border-brand-500 bg-brand-600 text-white" : "border-border bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700"}`;
}

const inputCls = "h-10 w-full rounded-[var(--radius-md)] border border-border bg-white px-3 text-[var(--text-sm)] font-semibold text-ink-900 placeholder:font-normal placeholder:text-ink-400 focus:border-brand-400 focus:outline-none";

/* =============================================================================
   MAIN COMPONENT
   ============================================================================= */

export function VansFilter({
  facets,
  searchParams,
}: {
  total: number;
  facets: ListingFacets;
  searchParams: Search;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [draft, setDraft] = useState<FilterDraft>(() => parseSearchParams(searchParams));
  const [openPill, setOpenPill] = useState<OpenPill>(null);
  const [showAllMakes, setShowAllMakes] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  function push(d: FilterDraft) {
    startTransition(() => router.push(draftToUrl(d), { scroll: false }));
  }

  function set(updates: Partial<FilterDraft>) {
    setDraft((prev) => ({ ...prev, ...updates }));
  }

  /** For single-select filters: select value, close dropdown, apply URL immediately. */
  function selectAndClose(updates: Partial<FilterDraft>) {
    const next = { ...draftRef.current, ...updates };
    setDraft(next);
    setOpenPill(null);
    push(next);
  }

  /** Close the open pill and apply the current draft to the URL. */
  function applyClose() {
    setOpenPill(null);
    push(draftRef.current);
  }

  /** Toggle a pill open or closed. Switching pills applies the current draft first. */
  function togglePill(id: OpenPill) {
    if (openPill === id) {
      applyClose();
    } else {
      if (openPill !== null) push(draftRef.current);
      setOpenPill(id);
    }
  }

  // Close on outside click
  useEffect(() => {
    if (!openPill) return;
    function handler(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpenPill(null);
        startTransition(() => router.push(draftToUrl(draftRef.current), { scroll: false }));
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openPill, router]);

  // Escape key
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape" && openPill) {
        setOpenPill(null);
        startTransition(() => router.push(draftToUrl(draftRef.current), { scroll: false }));
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [openPill, router]);

  function clearChip(chip: Chip) {
    const next = { ...draft, ...chip.clear };
    setDraft(next);
    push(next);
  }

  function clearAll() {
    setDraft({ ...EMPTY });
    setOpenPill(null);
    startTransition(() => router.push("/vans", { scroll: false }));
  }

  const chips = getChips(draft);
  const selectedMake = draft.make ? getMakeBySlug(draft.make) : null;
  const monthlyNum = Number(draft.monthlyMax) || 0;
  const depositNum = Number(draft.deposit) || Number(DEFAULT_DEPOSIT);
  const impliedPrice = monthlyNum > 0 ? priceFromMonthly(monthlyNum, depositNum) : 0;
  const catchAllCount = [
    draft.fuel, draft.gearbox, draft.colour, draft.sort !== "newest" ? "x" : "",
  ].filter(Boolean).length;

  return (
    <div ref={containerRef} className="mb-6">
      {/* ── Pill row ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2">

        {/* Main filter pills */}
        <div className="flex flex-wrap gap-2">

          {/* Make & model */}
          <div className="relative">
            <button
              type="button"
              className={pillCls(!!draft.make, openPill === "make")}
              onClick={() => togglePill("make")}
            >
              {draft.make ? (selectedMake?.name ?? ucFirst(draft.make)) : "Make & model"}
              {draft.model && selectedMake ? ` · ${selectedMake.models.find(m => m.slug === draft.model)?.name ?? ""}` : ""}
              <Chevron open={openPill === "make"} active={!!draft.make} />
            </button>
            {openPill === "make" && (
              <div className={dropCls("left")} style={{ width: "340px" }}>
                <p className={sectionLabel}>Make</p>
                <div className="flex flex-wrap gap-1.5">
                  {(showAllMakes ? ALL_MAKES : POPULAR_MAKES).map((m) => (
                    <button
                      key={m.slug}
                      type="button"
                      onClick={() => {
                        set(draft.make === m.slug ? { make: "", model: "" } : { make: m.slug, model: "" });
                        setShowAllMakes(false);
                      }}
                      className={chipCls(draft.make === m.slug)}
                    >
                      {m.name}
                    </button>
                  ))}
                  {!showAllMakes && (
                    <button
                      type="button"
                      onClick={() => setShowAllMakes(true)}
                      className={`${CHIP_BASE} border-dashed border-border text-ink-500 hover:border-brand-300 hover:text-brand-600`}
                    >
                      More ↓
                    </button>
                  )}
                </div>

                {selectedMake && selectedMake.models.length > 0 && (
                  <div className="mt-4">
                    <p className={sectionLabel}>{selectedMake.name} models</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMake.models.map((m) => (
                        <button
                          key={m.slug}
                          type="button"
                          onClick={() => set({ model: draft.model === m.slug ? "" : m.slug })}
                          className={chipCls(draft.model === m.slug)}
                        >
                          {m.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <DropFooter onClear={() => set({ make: "", model: "" })} onDone={applyClose} />
              </div>
            )}
          </div>

          {/* Price */}
          <div className="relative">
            <button
              type="button"
              className={pillCls(!!(draft.minPrice || draft.maxPrice) && !draft.monthlyMax, openPill === "price")}
              onClick={() => togglePill("price")}
            >
              {priceLabel(draft)}
              <Chevron open={openPill === "price"} active={!!(draft.minPrice || draft.maxPrice) && !draft.monthlyMax} />
            </button>
            {openPill === "price" && (
              <div className={dropCls("left")} style={{ width: "290px" }}>
                <div className="flex items-center gap-2">
                  <PInput
                    value={draft.minPrice}
                    placeholder="No min"
                    onChange={(v) => set({ minPrice: v, monthlyMax: "" })}
                  />
                  <span className="shrink-0 text-ink-400">–</span>
                  <PInput
                    value={draft.maxPrice}
                    placeholder="No max"
                    onChange={(v) => set({ maxPrice: v, monthlyMax: "" })}
                  />
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {[
                    { l: "< £10k",   min: "",      max: "10000" },
                    { l: "£10–20k",  min: "10000", max: "20000" },
                    { l: "£20–30k",  min: "20000", max: "30000" },
                    { l: "£30k+",    min: "30000", max: "" },
                  ].map((preset) => (
                    <button
                      key={preset.l}
                      type="button"
                      onClick={() => set({ minPrice: preset.min, maxPrice: preset.max, monthlyMax: "" })}
                      className={chipCls(draft.minPrice === preset.min && draft.maxPrice === preset.max && !draft.monthlyMax)}
                    >
                      {preset.l}
                    </button>
                  ))}
                </div>
                <DropFooter onClear={() => set({ minPrice: "", maxPrice: "" })} onDone={applyClose} />
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="relative">
            <button
              type="button"
              className={pillCls(!!draft.monthlyMax, openPill === "payment")}
              onClick={() => togglePill("payment")}
            >
              {draft.monthlyMax ? `≤ ${fmt(monthlyNum)}/mo` : "Payment"}
              <Chevron open={openPill === "payment"} active={!!draft.monthlyMax} />
            </button>
            {openPill === "payment" && (
              <div className={dropCls("left")} style={{ width: "290px" }}>
                <label className="block">
                  <span className={sectionLabel}>Max monthly budget</span>
                  <div className="relative mt-1.5">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">£</span>
                    <input
                      type="number"
                      value={draft.monthlyMax}
                      onChange={(e) => set({ monthlyMax: e.target.value, minPrice: "", maxPrice: "" })}
                      placeholder="e.g. 300"
                      min="0"
                      step="50"
                      className={`${inputCls} pl-7 pr-10`}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-xs)] text-ink-400">/mo</span>
                  </div>
                </label>

                <label className="mt-3 block">
                  <span className={sectionLabel}>Deposit</span>
                  <div className="relative mt-1.5">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">£</span>
                    <input
                      type="number"
                      value={draft.deposit === DEFAULT_DEPOSIT && !draft.monthlyMax ? "" : draft.deposit}
                      onChange={(e) => set({ deposit: e.target.value || DEFAULT_DEPOSIT })}
                      placeholder="3,000"
                      min="0"
                      step="500"
                      className={`${inputCls} pl-7`}
                    />
                  </div>
                </label>

                {impliedPrice > 0 && (
                  <p className="mt-2 text-[var(--text-xs)] text-ink-500">
                    ≈ vans priced up to{" "}
                    <span className="font-semibold text-ink-800">{fmt(impliedPrice)}</span>
                  </p>
                )}

                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {["200", "300", "400", "500"].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => set({ monthlyMax: draft.monthlyMax === v ? "" : v, minPrice: "", maxPrice: "" })}
                      className={chipCls(draft.monthlyMax === v)}
                    >
                      ≤ £{v}/mo
                    </button>
                  ))}
                </div>

                <p className="mt-2 text-[var(--text-2xs)] text-ink-400">
                  HP est. · {FINANCE_ASSUMPTIONS.termMonths} months · {FINANCE_ASSUMPTIONS.apr}% APR. Indicative only.
                </p>

                <DropFooter
                  onClear={() => set({ monthlyMax: "", maxPrice: "", deposit: DEFAULT_DEPOSIT })}
                  onDone={applyClose}
                />
              </div>
            )}
          </div>

          {/* Year */}
          <div className="relative">
            <button
              type="button"
              className={pillCls(!!(draft.minYear || draft.maxYear), openPill === "year")}
              onClick={() => togglePill("year")}
            >
              {yearLabel(draft)}
              <Chevron open={openPill === "year"} active={!!(draft.minYear || draft.maxYear)} />
            </button>
            {openPill === "year" && (
              <div className={dropCls("left")} style={{ width: "250px" }}>
                <div className="flex items-center gap-2">
                  <select
                    value={draft.minYear}
                    onChange={(e) => set({ minYear: e.target.value })}
                    className={inputCls}
                  >
                    <option value="">From</option>
                    {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <span className="shrink-0 text-ink-400">–</span>
                  <select
                    value={draft.maxYear}
                    onChange={(e) => set({ maxYear: e.target.value })}
                    className={inputCls}
                  >
                    <option value="">To</option>
                    {[...YEAR_OPTIONS].reverse().map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <DropFooter onClear={() => set({ minYear: "", maxYear: "" })} onDone={applyClose} />
              </div>
            )}
          </div>

          {/* Mileage */}
          <div className="relative">
            <button
              type="button"
              className={pillCls(!!draft.maxMileage, openPill === "mileage")}
              onClick={() => togglePill("mileage")}
            >
              {draft.maxMileage ? `< ${Number(draft.maxMileage).toLocaleString("en-GB")} mi` : "Mileage"}
              <Chevron open={openPill === "mileage"} active={!!draft.maxMileage} />
            </button>
            {openPill === "mileage" && (
              <div className={dropCls("left")} style={{ width: "210px" }}>
                {MILEAGE_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => selectAndClose({ maxMileage: o.value })}
                    className={`block w-full rounded-[var(--radius-md)] px-3 py-2 text-left text-[var(--text-sm)] font-medium transition-colors ${
                      draft.maxMileage === o.value
                        ? "bg-brand-50 font-semibold text-brand-700"
                        : "text-ink-700 hover:bg-surface-1"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Wheelbase */}
          {facets.wheelbases.length > 0 && (
            <div className="relative">
              <button
                type="button"
                className={pillCls(!!draft.wheelbase, openPill === "wheelbase")}
                onClick={() => togglePill("wheelbase")}
              >
                {draft.wheelbase
                  ? (WHEELBASE_SHORT[draft.wheelbase as keyof typeof WHEELBASE_SHORT] ?? draft.wheelbase.toUpperCase())
                  : "Wheelbase"}
                <Chevron open={openPill === "wheelbase"} active={!!draft.wheelbase} />
              </button>
              {openPill === "wheelbase" && (
                <div className={dropCls("left")} style={{ width: "220px" }}>
                  {(["swb", "mwb", "lwb", "xlwb"] as const).map((wb) => {
                    const facet = facets.wheelbases.find((w) => w.value === wb);
                    if (!facet && draft.wheelbase !== wb) return null;
                    return (
                      <button
                        key={wb}
                        type="button"
                        onClick={() => selectAndClose({ wheelbase: draft.wheelbase === wb ? "" : wb })}
                        className={`flex w-full items-center justify-between rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-sm)] transition-colors ${
                          draft.wheelbase === wb
                            ? "bg-brand-50 font-semibold text-brand-700"
                            : "text-ink-700 hover:bg-surface-1"
                        }`}
                      >
                        <span>{WHEELBASE_SHORT[wb]}</span>
                        {facet && <span className="text-[var(--text-xs)] text-ink-400">({facet.count})</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Body type */}
          {facets.bodyStyles.length > 0 && (
            <div className="relative">
              <button
                type="button"
                className={pillCls(!!draft.bodyStyle, openPill === "body")}
                onClick={() => togglePill("body")}
              >
                {draft.bodyStyle ? unslug(draft.bodyStyle) : "Body type"}
                <Chevron open={openPill === "body"} active={!!draft.bodyStyle} />
              </button>
              {openPill === "body" && (
                <div className={dropCls("left")} style={{ width: "220px" }}>
                  {facets.bodyStyles.map((bs) => {
                    const slug = slugify(bs.value);
                    return (
                      <button
                        key={bs.value}
                        type="button"
                        onClick={() => selectAndClose({ bodyStyle: draft.bodyStyle === slug ? "" : slug })}
                        className={`flex w-full items-center justify-between rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-sm)] transition-colors ${
                          draft.bodyStyle === slug
                            ? "bg-brand-50 font-semibold text-brand-700"
                            : "text-ink-700 hover:bg-surface-1"
                        }`}
                      >
                        <span>{bs.value}</span>
                        <span className="text-[var(--text-xs)] text-ink-400">{bs.count}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Filter & sort (catch-all) ───────────────────────────────────── */}
        <div className="relative shrink-0">
          <button
            type="button"
            className={pillCls(catchAllCount > 0, openPill === "filters")}
            onClick={() => togglePill("filters")}
          >
            <IconFilter width={13} height={13} />
            {catchAllCount > 0 ? `Filters (${catchAllCount})` : "Filters"}
            <Chevron open={openPill === "filters"} active={catchAllCount > 0} />
          </button>
          {openPill === "filters" && (
            <div className={dropCls("right")} style={{ width: "290px" }}>

              {facets.fuels.length > 0 && (
                <div className="mb-4">
                  <p className={sectionLabel}>Fuel type</p>
                  <div className="flex flex-wrap gap-1.5">
                    {facets.fuels.map((f) => {
                      const slug = slugify(f.value);
                      return (
                        <button
                          key={slug}
                          type="button"
                          onClick={() => set({ fuel: draft.fuel === slug ? "" : slug })}
                          className={chipCls(draft.fuel === slug)}
                        >
                          {f.value}
                          <span className={`text-[var(--text-2xs)] ${draft.fuel === slug ? "text-white/70" : "text-ink-400"}`}> ({f.count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <p className={sectionLabel}>Gearbox</p>
                <div className="flex gap-2">
                  {["Manual", "Automatic"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => set({ gearbox: draft.gearbox === g.toLowerCase() ? "" : g.toLowerCase() })}
                      className={`flex-1 rounded-[var(--radius-md)] border py-2 text-[var(--text-sm)] font-semibold transition-colors ${
                        draft.gearbox === g.toLowerCase()
                          ? "border-brand-500 bg-brand-600 text-white"
                          : "border-border bg-white text-ink-700 hover:border-brand-300"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className={sectionLabel}>Colour</p>
                <div className="flex flex-wrap gap-1.5">
                  {COLOURS.map((c) => {
                    const slug = c.toLowerCase();
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => set({ colour: draft.colour === slug ? "" : slug })}
                        className={chipCls(draft.colour === slug)}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className={sectionLabel}>Sort by</p>
                <div className="space-y-0.5">
                  {SORT_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => set({ sort: s.value })}
                      className={`flex w-full items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-left text-[var(--text-sm)] transition-colors ${
                        draft.sort === s.value
                          ? "bg-brand-50 font-semibold text-brand-700"
                          : "text-ink-700 hover:bg-surface-1"
                      }`}
                    >
                      <span className={`w-3 text-brand-600 ${draft.sort === s.value ? "" : "invisible"}`}>✓</span>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <DropFooter
                onClear={() => set({ fuel: "", gearbox: "", colour: "", sort: "newest" })}
                onDone={applyClose}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Active chips ──────────────────────────────────────────────────── */}
      {chips.length > 0 && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => clearChip(chip)}
              className="flex items-center gap-1 rounded-[var(--radius-pill)] border border-brand-200 bg-brand-50 px-2.5 py-1 text-[var(--text-xs)] font-semibold text-brand-700 transition-colors hover:bg-brand-100"
            >
              {chip.label}
              <span className="text-brand-400" aria-hidden>×</span>
            </button>
          ))}
          {chips.length > 1 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-[var(--text-xs)] font-semibold text-ink-400 transition-colors hover:text-brand-600"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Label helpers ────────────────────────────────────────────────────────── */

function priceLabel(d: FilterDraft): string {
  if (!d.minPrice && !d.maxPrice) return "Price";
  const lo = d.minPrice ? fmt(Number(d.minPrice)) : null;
  const hi = d.maxPrice ? fmt(Number(d.maxPrice)) : null;
  return lo && hi ? `${lo}–${hi}` : lo ? `${lo}+` : `up to ${hi!}`;
}

function yearLabel(d: FilterDraft): string {
  if (!d.minYear && !d.maxYear) return "Year";
  if (d.minYear && d.maxYear) return `${d.minYear}–${d.maxYear}`;
  return d.minYear ? `${d.minYear}+` : `up to ${d.maxYear}`;
}

/* ── Sub-components ───────────────────────────────────────────────────────── */

const sectionLabel = "mb-2 block text-[var(--text-2xs)] font-bold uppercase tracking-wider text-ink-400";

function Chevron({ open, active }: { open: boolean; active: boolean }) {
  return (
    <svg
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`ml-0.5 shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""} ${active ? "opacity-60" : "text-ink-400"}`}
      aria-hidden
    >
      <path d="M1 1l4 4 4-4" />
    </svg>
  );
}

function DropFooter({ onClear, onDone }: { onClear: () => void; onDone: () => void }) {
  return (
    <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
      <button
        type="button"
        onClick={onClear}
        className="text-[var(--text-xs)] font-semibold text-ink-500 transition-colors hover:text-brand-600"
      >
        Clear
      </button>
      <button
        type="button"
        onClick={onDone}
        className="rounded-[var(--radius-md)] bg-brand-600 px-4 py-1.5 text-[var(--text-xs)] font-bold text-white transition-colors hover:bg-brand-700"
      >
        Done
      </button>
    </div>
  );
}

function PInput({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative flex-1">
      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-sm)] text-ink-400">£</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min="0"
        step="500"
        className={`${inputCls} pl-6`}
      />
    </div>
  );
}
