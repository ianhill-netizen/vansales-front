"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useTransition } from "react";
import { POPULAR_MAKES, ALL_MAKES, getMakeBySlug } from "@/lib/taxonomy/van-makes";
import { WHEELBASE_SHORT } from "@/lib/listings/format";
import { slugify } from "@/lib/listings/slug";
import { priceFromMonthly, FINANCE_ASSUMPTIONS } from "@/lib/finance";
import { IconFilter, IconSearch } from "@/components/icons";
import type { ListingFacets } from "@/lib/listings/types";

/* =============================================================================
   VANS FILTER — AutoTrader pattern
   Pill row where each pill is a shortcut that opens the shared "Filter & sort"
   modal and auto-scrolls to that filter's section. One modal, all filters.
   ============================================================================= */

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
  postcode: string;
  radius: string; // miles as string; "" = Nationwide
  sort: string;
};

const DEFAULT_DEPOSIT = "3000";

const EMPTY: FilterDraft = {
  make: "", model: "", bodyStyle: "", fuel: "",
  gearbox: "", wheelbase: "", colour: "",
  minPrice: "", maxPrice: "", monthlyMax: "",
  deposit: DEFAULT_DEPOSIT,
  minYear: "", maxYear: "", maxMileage: "",
  postcode: "", radius: "",
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
    postcode:   one(sp.postcode) || "",
    radius:     one(sp.radius) || "",
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
  const pc = d.postcode.trim().toUpperCase();
  if (pc) {
    p.set("postcode", pc);
    if (d.radius) p.set("radius", d.radius);
  }
  if (d.sort && d.sort !== "newest" && d.sort !== "nearest") p.set("sort", d.sort);
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

  if (d.postcode.trim()) {
    const radLabel = d.radius ? `${d.radius} mi` : "Nationwide";
    out.push({
      key: "distance",
      label: `${radLabel} · ${d.postcode.trim().toUpperCase()}`,
      clear: { postcode: "", radius: "" },
    });
  }

  if (d.sort && d.sort !== "newest" && d.sort !== "nearest") {
    const SORT_LABELS: Record<string, string> = { price_asc: "Price ↑", price_desc: "Price ↓", mileage_asc: "Mileage ↑" };
    out.push({ key: "sort", label: SORT_LABELS[d.sort] ?? d.sort, clear: { sort: "newest" } });
  }

  return out;
}

/* ── Pill label helpers ───────────────────────────────────────────────────── */

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

const RADIUS_OPTIONS = [
  { label: "10 miles",   value: "10" },
  { label: "25 miles",   value: "25" },
  { label: "50 miles",   value: "50" },
  { label: "100 miles",  value: "100" },
  { label: "Nationwide", value: "" },
];

const SORT_OPTIONS = [
  { label: "Newest first",        value: "newest" },
  { label: "Price: low → high",   value: "price_asc" },
  { label: "Price: high → low",   value: "price_desc" },
  { label: "Mileage: low → high", value: "mileage_asc" },
  { label: "Nearest first",       value: "nearest" },
];

const PRICE_PRESETS = [
  { label: "Under £10k", min: "",      max: "10000" },
  { label: "£10k–£20k", min: "10000", max: "20000" },
  { label: "£20k–£30k", min: "20000", max: "30000" },
  { label: "£30k+",     min: "30000", max: "" },
];

/* ── Styling helpers ─────────────────────────────────────────────────────── */

const BASE_PILL = "inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border px-3.5 py-2 text-[var(--text-sm)] font-semibold transition-colors whitespace-nowrap shadow-[var(--shadow-xs)] cursor-pointer select-none";

function pillCls(active: boolean): string {
  return active
    ? `${BASE_PILL} border-brand-600 bg-brand-600 text-white`
    : `${BASE_PILL} border-border bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700`;
}

const CHIP_BASE = "rounded-[var(--radius-pill)] border px-2.5 py-1 text-[var(--text-xs)] font-semibold transition-colors";
function chipCls(active: boolean): string {
  return `${CHIP_BASE} ${active ? "border-brand-500 bg-brand-600 text-white" : "border-border bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700"}`;
}

/* =============================================================================
   MAIN COMPONENT
   ============================================================================= */

export function VansFilter({
  total,
  facets,
  searchParams,
}: {
  total: number;
  facets: ListingFacets;
  searchParams: Search;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState<FilterDraft>(() => parseSearchParams(searchParams));
  const [modalOpen, setModalOpen] = useState(false);
  const [scrollTarget, setScrollTarget] = useState<string | null>(null);
  const [showAllMakes, setShowAllMakes] = useState(false);

  const modalBodyRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const selectedMake = draft.make ? getMakeBySlug(draft.make) : null;
  const chips = getChips(draft);
  const monthlyNum = Number(draft.monthlyMax) || 0;
  const depositNum = Number(draft.deposit) || Number(DEFAULT_DEPOSIT);
  const impliedPrice = monthlyNum > 0 ? priceFromMonthly(monthlyNum, depositNum) : 0;
  const catchAllCount = [
    draft.fuel, draft.gearbox, draft.colour,
    draft.postcode.trim() ? "x" : "",
    draft.sort !== "newest" && draft.sort !== "nearest" ? "x" : "",
  ].filter(Boolean).length;

  function set(updates: Partial<FilterDraft>) {
    setDraft((prev) => ({ ...prev, ...updates }));
  }

  /** Open the modal, optionally scrolling to a named section. */
  function openAt(section: string | null) {
    setModalOpen(true);
    setScrollTarget(section);
  }

  function applyAndClose() {
    startTransition(() => router.push(draftToUrl(draft), { scroll: false }));
    setModalOpen(false);
    setScrollTarget(null);
  }

  function clearAll() {
    setDraft({ ...EMPTY });
    startTransition(() => router.push("/vans", { scroll: false }));
    setModalOpen(false);
  }

  function clearChip(chip: Chip) {
    const next = { ...draft, ...chip.clear };
    setDraft(next);
    startTransition(() => router.push(draftToUrl(next), { scroll: false }));
  }

  // Scroll modal body to the target section after modal mounts
  useEffect(() => {
    if (!modalOpen || !scrollTarget) return;
    const t = setTimeout(() => {
      const section = sectionRefs.current[scrollTarget];
      const body = modalBodyRef.current;
      if (section && body) {
        body.scrollTo({ top: section.offsetTop - 8, behavior: "smooth" });
      }
    }, 60);
    return () => clearTimeout(t);
  }, [modalOpen, scrollTarget]);

  // Body scroll lock while modal is open
  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalOpen]);

  return (
    <>
      {/* ── Pill row ──────────────────────────────────────────────────────── */}
      <div className="mb-5">
        <div className="flex items-center justify-between gap-2">

          {/* Main filter pills */}
          <div className="flex flex-wrap gap-2">

            <button type="button" className={pillCls(!!draft.make)} onClick={() => openAt("make")}>
              {draft.make
                ? (selectedMake
                    ? (draft.model
                        ? `${selectedMake.name} · ${selectedMake.models.find(m => m.slug === draft.model)?.name ?? ""}`
                        : selectedMake.name)
                    : ucFirst(draft.make))
                : "Make & model"}
              <Chevron active={!!draft.make} />
            </button>

            <button type="button" className={pillCls(!!(draft.minPrice || draft.maxPrice) && !draft.monthlyMax)} onClick={() => openAt("price")}>
              {priceLabel(draft)}
              <Chevron active={!!(draft.minPrice || draft.maxPrice) && !draft.monthlyMax} />
            </button>

            <button type="button" className={pillCls(!!draft.monthlyMax)} onClick={() => openAt("payment")}>
              {draft.monthlyMax ? `≤ ${fmt(monthlyNum)}/mo` : "Payment"}
              <Chevron active={!!draft.monthlyMax} />
            </button>

            <button type="button" className={pillCls(!!(draft.minYear || draft.maxYear))} onClick={() => openAt("year")}>
              {yearLabel(draft)}
              <Chevron active={!!(draft.minYear || draft.maxYear)} />
            </button>

            <button type="button" className={pillCls(!!draft.maxMileage)} onClick={() => openAt("mileage")}>
              {draft.maxMileage ? `< ${Number(draft.maxMileage).toLocaleString("en-GB")} mi` : "Mileage"}
              <Chevron active={!!draft.maxMileage} />
            </button>

            <button
              type="button"
              className={pillCls(!!(draft.postcode.trim()))}
              onClick={() => openAt("distance")}
            >
              {draft.postcode.trim()
                ? (draft.radius ? `${draft.radius} mi · ${draft.postcode.trim().toUpperCase()}` : `Nationwide · ${draft.postcode.trim().toUpperCase()}`)
                : "Distance"}
              <Chevron active={!!(draft.postcode.trim())} />
            </button>

            {facets.wheelbases.length > 0 && (
              <button type="button" className={pillCls(!!draft.wheelbase)} onClick={() => openAt("wheelbase")}>
                {draft.wheelbase
                  ? (WHEELBASE_SHORT[draft.wheelbase as keyof typeof WHEELBASE_SHORT] ?? draft.wheelbase.toUpperCase())
                  : "Wheelbase"}
                <Chevron active={!!draft.wheelbase} />
              </button>
            )}

            {facets.bodyStyles.length > 0 && (
              <button type="button" className={pillCls(!!draft.bodyStyle)} onClick={() => openAt("body")}>
                {draft.bodyStyle ? unslug(draft.bodyStyle) : "Body type"}
                <Chevron active={!!draft.bodyStyle} />
              </button>
            )}
          </div>

          {/* Filter & sort button — opens modal at top */}
          <button
            type="button"
            onClick={() => openAt(null)}
            className={`flex items-center gap-2 rounded-[var(--radius-pill)] border px-4 py-2 text-[var(--text-sm)] font-semibold shadow-[var(--shadow-xs)] transition-colors shrink-0 ${
              catchAllCount > 0
                ? "border-brand-300 bg-brand-50 text-brand-700 hover:bg-brand-100"
                : "border-border bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700"
            }`}
          >
            <IconFilter width={14} height={14} />
            Filter &amp; sort
            {catchAllCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
                {catchAllCount}
              </span>
            )}
          </button>
        </div>

        {/* Active chips */}
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

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Filter and sort">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={applyAndClose} aria-hidden />

          {/* Panel — bottom sheet on mobile, centred on desktop */}
          <div className="relative mx-auto mt-auto flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[var(--radius-2xl)] bg-white shadow-[var(--shadow-xl)] md:my-16 md:rounded-[var(--radius-2xl)]">

            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-display text-[var(--text-lg)] font-bold text-ink-900">Filter &amp; sort</h2>
              <button
                type="button"
                onClick={applyAndClose}
                className="flex size-8 items-center justify-center rounded-full text-ink-400 hover:bg-surface-1 hover:text-ink-700"
                aria-label="Close"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M2 2l12 12M14 2L2 14" />
                </svg>
              </button>
            </div>

            {/* Scrollable body */}
            <div ref={modalBodyRef} className="flex-1 overflow-y-auto">

              {/* Make & model */}
              <div ref={(el) => { sectionRefs.current["make"] = el; }}>
                <Section title="Make & model">
                  <div className="flex flex-wrap gap-2">
                    {(showAllMakes ? ALL_MAKES : POPULAR_MAKES).map((m) => (
                      <Chip
                        key={m.slug}
                        active={draft.make === m.slug}
                        onClick={() => {
                          set(draft.make === m.slug ? { make: "", model: "" } : { make: m.slug, model: "" });
                          setShowAllMakes(false);
                        }}
                      >
                        {m.name}
                      </Chip>
                    ))}
                    {!showAllMakes && (
                      <button
                        type="button"
                        onClick={() => setShowAllMakes(true)}
                        className="rounded-[var(--radius-pill)] border border-dashed border-border px-3 py-1.5 text-[var(--text-sm)] font-semibold text-ink-500 transition-colors hover:border-brand-300 hover:text-brand-600"
                      >
                        More makes ↓
                      </button>
                    )}
                  </div>

                  {selectedMake && selectedMake.models.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2.5 text-[var(--text-2xs)] font-bold uppercase tracking-wider text-ink-400">
                        {selectedMake.name} models
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedMake.models.map((m) => (
                          <Chip
                            key={m.slug}
                            active={draft.model === m.slug}
                            onClick={() => set({ model: draft.model === m.slug ? "" : m.slug })}
                          >
                            {m.name}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  )}
                </Section>
              </div>

              <Hr />

              {/* Price */}
              <div ref={(el) => { sectionRefs.current["price"] = el; }}>
                <Section title="Price">
                  <div className="flex items-center gap-3">
                    <PriceInput
                      value={draft.minPrice}
                      placeholder="No min"
                      onChange={(v) => set({ minPrice: v, monthlyMax: "" })}
                    />
                    <span className="shrink-0 text-ink-400">–</span>
                    <PriceInput
                      value={draft.maxPrice}
                      placeholder="No max"
                      onChange={(v) => set({ maxPrice: v, monthlyMax: "" })}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {PRICE_PRESETS.map((p) => (
                      <SmallChip
                        key={p.label}
                        active={draft.minPrice === p.min && draft.maxPrice === p.max && !draft.monthlyMax}
                        onClick={() => set({ minPrice: p.min, maxPrice: p.max, monthlyMax: "" })}
                      >
                        {p.label}
                      </SmallChip>
                    ))}
                  </div>
                </Section>
              </div>

              <Hr />

              {/* Monthly payment */}
              <div ref={(el) => { sectionRefs.current["payment"] = el; }}>
                <Section title="Monthly payment">
                  <div className="flex items-start gap-3">
                    <label className="flex-1">
                      <span className="mb-1.5 block text-[var(--text-2xs)] font-bold uppercase tracking-wider text-ink-400">
                        Max per month
                      </span>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-sm)] text-ink-400">£</span>
                        <input
                          type="number"
                          value={draft.monthlyMax}
                          onChange={(e) => set({ monthlyMax: e.target.value, minPrice: "", maxPrice: "" })}
                          placeholder="Max / month"
                          min="0"
                          step="50"
                          className="w-full rounded-[var(--radius-md)] border border-border py-2.5 pl-7 pr-10 text-[var(--text-sm)] font-semibold text-ink-900 placeholder:font-normal placeholder:text-ink-400 focus:border-brand-400 focus:outline-none"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-xs)] text-ink-400">/mo</span>
                      </div>
                    </label>
                    <label className="w-28 shrink-0">
                      <span className="mb-1.5 block text-[var(--text-2xs)] font-bold uppercase tracking-wider text-ink-400">
                        Deposit
                      </span>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-sm)] text-ink-400">£</span>
                        <input
                          type="number"
                          value={draft.deposit === DEFAULT_DEPOSIT && !draft.monthlyMax ? "" : draft.deposit}
                          onChange={(e) => set({ deposit: e.target.value || DEFAULT_DEPOSIT })}
                          placeholder="3,000"
                          min="0"
                          step="500"
                          className="w-full rounded-[var(--radius-md)] border border-border py-2.5 pl-7 pr-2 text-[var(--text-sm)] font-semibold text-ink-900 placeholder:font-normal placeholder:text-ink-400 focus:border-brand-400 focus:outline-none"
                        />
                      </div>
                    </label>
                  </div>

                  {impliedPrice > 0 && (
                    <p className="mt-2 text-[var(--text-xs)] text-ink-500">
                      ≈ vans priced up to{" "}
                      <span className="font-semibold text-ink-700">{fmt(impliedPrice)}</span>
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    {["200", "300", "400", "500"].map((v) => (
                      <SmallChip
                        key={v}
                        active={draft.monthlyMax === v}
                        onClick={() =>
                          set(
                            draft.monthlyMax === v
                              ? { monthlyMax: "", maxPrice: "" }
                              : { monthlyMax: v, minPrice: "", maxPrice: "" },
                          )
                        }
                      >
                        ≤ £{v}/mo
                      </SmallChip>
                    ))}
                  </div>

                  <p className="mt-3 text-[var(--text-2xs)] text-ink-400">
                    HP estimate · {FINANCE_ASSUMPTIONS.termMonths} months · {FINANCE_ASSUMPTIONS.apr}% APR. Indicative only.
                  </p>
                </Section>
              </div>

              <Hr />

              {/* Year */}
              <div ref={(el) => { sectionRefs.current["year"] = el; }}>
                <Section title="Year">
                  <div className="flex items-center gap-3">
                    <select
                      value={draft.minYear}
                      onChange={(e) => set({ minYear: e.target.value })}
                      className="flex-1 rounded-[var(--radius-md)] border border-border px-3 py-2.5 text-[var(--text-sm)] font-semibold text-ink-900 focus:border-brand-400 focus:outline-none"
                    >
                      <option value="">From year</option>
                      {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <span className="shrink-0 text-ink-400">–</span>
                    <select
                      value={draft.maxYear}
                      onChange={(e) => set({ maxYear: e.target.value })}
                      className="flex-1 rounded-[var(--radius-md)] border border-border px-3 py-2.5 text-[var(--text-sm)] font-semibold text-ink-900 focus:border-brand-400 focus:outline-none"
                    >
                      <option value="">To year</option>
                      {[...YEAR_OPTIONS].reverse().map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </Section>
              </div>

              <Hr />

              {/* Mileage */}
              <div ref={(el) => { sectionRefs.current["mileage"] = el; }}>
                <Section title="Mileage">
                  <select
                    value={draft.maxMileage}
                    onChange={(e) => set({ maxMileage: e.target.value })}
                    className="w-full rounded-[var(--radius-md)] border border-border px-3 py-2.5 text-[var(--text-sm)] font-semibold text-ink-900 focus:border-brand-400 focus:outline-none"
                  >
                    {MILEAGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Section>
              </div>

              <Hr />

              {/* Distance */}
              <div ref={(el) => { sectionRefs.current["distance"] = el; }}>
                <Section title="Distance from you">
                  <label>
                    <span className="mb-1.5 block text-[var(--text-2xs)] font-bold uppercase tracking-wider text-ink-400">
                      Your postcode
                    </span>
                    <input
                      type="text"
                      value={draft.postcode}
                      onChange={(e) => set({ postcode: e.target.value.toUpperCase() })}
                      placeholder="e.g. CF10 1AA"
                      maxLength={8}
                      className="w-full rounded-[var(--radius-md)] border border-border px-3 py-2.5 text-[var(--text-sm)] font-semibold uppercase text-ink-900 placeholder:font-normal placeholder:lowercase placeholder:text-ink-400 focus:border-brand-400 focus:outline-none"
                    />
                  </label>
                  {draft.postcode.trim().length >= 3 && (
                    <div className="mt-3">
                      <p className="mb-2 text-[var(--text-2xs)] font-bold uppercase tracking-wider text-ink-400">
                        Radius
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {RADIUS_OPTIONS.map((r) => (
                          <SmallChip
                            key={r.label}
                            active={draft.radius === r.value}
                            onClick={() => set({ radius: r.value })}
                          >
                            {r.label}
                          </SmallChip>
                        ))}
                      </div>
                    </div>
                  )}
                </Section>
              </div>

              <Hr />

              {/* Body type */}
              {facets.bodyStyles.length > 0 && (
                <>
                  <div ref={(el) => { sectionRefs.current["body"] = el; }}>
                    <Section title="Body type">
                      <div className="grid grid-cols-2 gap-2">
                        {facets.bodyStyles.map((bs) => {
                          const slug = slugify(bs.value);
                          return (
                            <button
                              key={bs.value}
                              type="button"
                              onClick={() => set({ bodyStyle: draft.bodyStyle === slug ? "" : slug })}
                              className={`flex items-center justify-between rounded-[var(--radius-md)] border px-3 py-2 text-[var(--text-sm)] font-semibold transition-colors ${
                                draft.bodyStyle === slug
                                  ? "border-brand-500 bg-brand-600 text-white"
                                  : "border-border bg-white text-ink-700 hover:border-brand-300"
                              }`}
                            >
                              <span>{bs.value}</span>
                              <span className={`text-[var(--text-xs)] font-normal ${draft.bodyStyle === slug ? "text-white/70" : "text-ink-400"}`}>
                                {bs.count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </Section>
                  </div>
                  <Hr />
                </>
              )}

              {/* Fuel */}
              {facets.fuels.length > 0 && (
                <>
                  <Section title="Fuel type">
                    <div className="flex flex-wrap gap-2">
                      {facets.fuels.map((f) => {
                        const slug = slugify(f.value);
                        return (
                          <button
                            key={f.value}
                            type="button"
                            onClick={() => set({ fuel: draft.fuel === slug ? "" : slug })}
                            className={`flex items-center gap-2 rounded-[var(--radius-pill)] border px-3 py-1.5 text-[var(--text-sm)] font-semibold transition-colors ${
                              draft.fuel === slug
                                ? "border-brand-500 bg-brand-600 text-white"
                                : "border-border bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700"
                            }`}
                          >
                            {f.value}
                            <span className={`text-[var(--text-xs)] font-normal ${draft.fuel === slug ? "text-white/70" : "text-ink-400"}`}>
                              {f.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </Section>
                  <Hr />
                </>
              )}

              {/* Wheelbase */}
              {facets.wheelbases.length > 0 && (
                <>
                  <div ref={(el) => { sectionRefs.current["wheelbase"] = el; }}>
                    <Section title="Wheelbase">
                      <div className="flex flex-wrap gap-2">
                        {(["swb", "mwb", "lwb", "xlwb"] as const).map((wb) => {
                          const facet = facets.wheelbases.find((w) => w.value === wb);
                          if (!facet && draft.wheelbase !== wb) return null;
                          return (
                            <button
                              key={wb}
                              type="button"
                              onClick={() => set({ wheelbase: draft.wheelbase === wb ? "" : wb })}
                              className={`flex items-center gap-2 rounded-[var(--radius-pill)] border px-3 py-1.5 text-[var(--text-sm)] font-semibold transition-colors ${
                                draft.wheelbase === wb
                                  ? "border-brand-500 bg-brand-600 text-white"
                                  : "border-border bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700"
                              }`}
                            >
                              {WHEELBASE_SHORT[wb]}
                              {facet && (
                                <span className={`text-[var(--text-xs)] font-normal ${draft.wheelbase === wb ? "text-white/70" : "text-ink-400"}`}>
                                  {facet.count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </Section>
                  </div>
                  <Hr />
                </>
              )}

              {/* Gearbox */}
              <Section title="Gearbox">
                <div className="flex gap-3">
                  {["Manual", "Automatic"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => set({ gearbox: draft.gearbox === g.toLowerCase() ? "" : g.toLowerCase() })}
                      className={`flex-1 rounded-[var(--radius-md)] border py-2.5 text-[var(--text-sm)] font-semibold transition-colors ${
                        draft.gearbox === g.toLowerCase()
                          ? "border-brand-500 bg-brand-600 text-white"
                          : "border-border bg-white text-ink-700 hover:border-brand-300"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </Section>

              <Hr />

              {/* Colour */}
              <Section title="Colour">
                <div className="flex flex-wrap gap-2">
                  {COLOURS.map((c) => {
                    const slug = c.toLowerCase();
                    return (
                      <Chip
                        key={c}
                        active={draft.colour === slug}
                        onClick={() => set({ colour: draft.colour === slug ? "" : slug })}
                      >
                        {c}
                      </Chip>
                    );
                  })}
                </div>
              </Section>

              <Hr />

              {/* Sort */}
              <Section title="Sort by">
                <div className="grid grid-cols-2 gap-2">
                  {SORT_OPTIONS
                    .filter((s) => s.value !== "nearest" || draft.postcode.trim().length >= 3)
                    .map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => set({ sort: s.value })}
                        className={`rounded-[var(--radius-md)] border px-3 py-2.5 text-[var(--text-sm)] font-semibold transition-colors ${
                          draft.sort === s.value
                            ? "border-brand-500 bg-brand-600 text-white"
                            : "border-border bg-white text-ink-700 hover:border-brand-300"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                </div>
              </Section>

              <div className="h-4" />
            </div>

            {/* Sticky footer */}
            <div className="flex shrink-0 items-center gap-4 border-t border-border bg-white px-5 py-4">
              <button
                type="button"
                onClick={clearAll}
                className="text-[var(--text-sm)] font-semibold text-ink-500 transition-colors hover:text-brand-600"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={applyAndClose}
                disabled={isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-lg)] py-3.5 text-[var(--text-base)] font-bold text-white shadow-[var(--shadow-md)] transition-all active:scale-[0.98] disabled:opacity-70"
                style={{ background: "linear-gradient(135deg, #1b5aa8 0%, #0d2d5a 100%)" }}
              >
                <IconSearch width={16} height={16} />
                {isPending ? "Updating…" : `Search ${total.toLocaleString()} vans`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Sub-components ───────────────────────────────────────────────────────── */

function Chevron({ active }: { active: boolean }) {
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
      className={`ml-0.5 shrink-0 ${active ? "opacity-60" : "text-ink-400"}`}
      aria-hidden
    >
      <path d="M1 1l4 4 4-4" />
    </svg>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-5 py-5">
      <h3 className="mb-4 font-display text-[var(--text-base)] font-bold text-ink-900">{title}</h3>
      {children}
    </div>
  );
}

function Hr() {
  return <div className="mx-5 h-px bg-border" />;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[var(--radius-pill)] border px-3 py-1.5 text-[var(--text-sm)] font-semibold transition-colors ${
        active
          ? "border-brand-500 bg-brand-600 text-white"
          : "border-border bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700"
      }`}
    >
      {children}
    </button>
  );
}

function SmallChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[var(--radius-pill)] border px-3 py-1 text-[var(--text-xs)] font-semibold transition-colors ${
        active
          ? "border-brand-500 bg-brand-600 text-white"
          : "border-border bg-surface-1 text-ink-600 hover:border-brand-300 hover:text-brand-700"
      }`}
    >
      {children}
    </button>
  );
}

function PriceInput({
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
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-sm)] text-ink-400">£</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min="0"
        step="500"
        className="w-full rounded-[var(--radius-md)] border border-border py-2.5 pl-7 pr-3 text-[var(--text-sm)] font-semibold text-ink-900 placeholder:font-normal placeholder:text-ink-400 focus:border-brand-400 focus:outline-none"
      />
    </div>
  );
}
