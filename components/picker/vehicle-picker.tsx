"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { chipLabel, type VehicleChip } from "@/lib/vehicle-chips";
import type { PickerData, PickerPill } from "@/lib/listings/picker";

/* =============================================================================
   VEHICLE PICKER — the "tap a block" search (TUI pattern), not a type-ahead list.
   A panel of pills: Makes (with stock) → Models of the selected makes (grouped by
   make) → Body type → Fuel. Tapping a pill selects it and it becomes a removable chip
   in the bar; typing in the bar filters the pills; Enter picks the first visible one.
   Desktop: the panel is inline (home) or opens under the bar (results). Mobile: a
   full-screen sheet with a sticky "Show N vans" button.
   ============================================================================= */

export interface PickerSelection {
  vehicles: VehicleChip[];   // {make} = the whole make; {make, model} = one model (a make with model chips is narrowed to them)
  body: string[];
  fuel: string[];
}

export const EMPTY_SELECTION: PickerSelection = { vehicles: [], body: [], fuel: [] };

/** How many vans fit a selection: selected makes/models (any of) AND body types (any of) AND fuels (any of). */
export function countMatches(data: PickerData, sel: PickerSelection): number {
  return data.rows.filter(([mk, md, b, f]) =>
    (sel.vehicles.length === 0 || sel.vehicles.some((v) => v.make === mk && (!v.model || v.model === md))) &&
    (sel.body.length === 0 || sel.body.includes(b)) &&
    (sel.fuel.length === 0 || sel.fuel.includes(f)),
  ).length;
}

const norm = (s: string) => s.normalize("NFD").replace(/\p{Mn}/gu, "").toLowerCase().trim();

function pillCls(on: boolean): string {
  return `inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[var(--text-sm)] font-semibold transition-colors ${
    on ? "border-brand-600 bg-brand-600 text-white" : "border-border bg-surface-1 text-ink-700 hover:border-brand-300 hover:text-brand-700"
  }`;
}

function Pill({ pill, on, onClick }: { pill: PickerPill; on: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className={pillCls(on)}>
      {pill.name}
      <span className={`text-[var(--text-xs)] font-normal ${on ? "text-white/75" : "text-ink-400"}`}>{pill.count}</span>
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4 first:mt-0">
      <h3 className="mb-2 text-[var(--text-2xs)] font-bold uppercase tracking-wider text-ink-400">{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

export function VehiclePicker({
  data,
  value,
  onChange,
  variant,
  onSubmit,
  className = "",
}: {
  data: PickerData;
  value: PickerSelection;
  onChange: (next: PickerSelection) => void;
  /** inline: panel always visible under the bar (md+). popover: opens under the bar on focus (md+). Below md both open the full-screen sheet. */
  variant: "inline" | "popover";
  /** Called by the sheet's "Show N vans" button (the results page just closes the sheet: changes already applied). */
  onSubmit?: () => void;
  className?: string;
}) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);          // popover (md+) or sheet (<md)
  const [isMobile, setIsMobile] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sheetId = useId();

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Close the popover on an outside click / Escape.
  useEffect(() => {
    if (!open || isMobile) return;
    const down = (e: MouseEvent) => { if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, [open, isMobile]);

  // Lock page scroll behind the mobile sheet.
  useEffect(() => {
    if (!(open && isMobile)) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open, isMobile]);

  const makesSelected = useMemo(() => [...new Set(value.vehicles.map((v) => v.make))], [value.vehicles]);
  const isMake = (slug: string) => makesSelected.includes(slug);
  const isModel = (make: string, model: string) => value.vehicles.some((v) => v.make === make && v.model === model);

  function toggleMake(slug: string) {
    onChange({ ...value, vehicles: isMake(slug) ? value.vehicles.filter((v) => v.make !== slug) : [...value.vehicles, { make: slug }] });
  }
  function toggleModel(make: string, model: string) {
    if (isModel(make, model)) {
      let vehicles = value.vehicles.filter((v) => !(v.make === make && v.model === model));
      if (!vehicles.some((v) => v.make === make)) vehicles = [...vehicles, { make }];   // last model gone: the make stays selected as a whole
      onChange({ ...value, vehicles });
    } else {
      // a make with model chips is narrowed to them, so the bare make entry makes way
      onChange({ ...value, vehicles: [...value.vehicles.filter((v) => !(v.make === make && !v.model)), { make, model }] });
    }
  }
  const toggleIn = (list: string[], slug: string) => (list.includes(slug) ? list.filter((x) => x !== slug) : [...list, slug]);
  const toggleBody = (slug: string) => onChange({ ...value, body: toggleIn(value.body, slug) });
  const toggleFuel = (slug: string) => onChange({ ...value, fuel: toggleIn(value.fuel, slug) });
  const clearAll = () => onChange(EMPTY_SELECTION);

  // What the text box filters.
  const q = norm(text);
  const match = (name: string) => !q || norm(name).includes(q);
  // A pill with nothing behind it is never shown (unless it is already selected, so it can still be turned off).
  const shown = (p: PickerPill, on: boolean) => p.count > 0 || on;
  const makePills = data.makes.filter((m) => shown(m, isMake(m.slug)) && match(m.name));
  const modelGroups = makesSelected
    .map((slug) => ({ make: data.makes.find((m) => m.slug === slug) ?? { slug, name: chipLabel({ make: slug }), count: 0 }, models: (data.models[slug] ?? []).filter((m) => shown(m, isModel(slug, m.slug)) && match(m.name)) }))
    .filter((g) => g.models.length > 0);
  const bodyPills = data.bodyTypes.filter((b) => shown(b, value.body.includes(b.slug)) && match(b.name));
  const fuelPills = data.fuels.filter((f) => shown(f, value.fuel.includes(f.slug)) && match(f.name));

  function submitFirstMatch() {
    if (makePills[0]) { if (!isMake(makePills[0].slug)) toggleMake(makePills[0].slug); }
    else if (modelGroups[0]?.models[0]) { const g = modelGroups[0]; if (!isModel(g.make.slug, g.models[0].slug)) toggleModel(g.make.slug, g.models[0].slug); }
    else if (bodyPills[0]) { if (!value.body.includes(bodyPills[0].slug)) toggleBody(bodyPills[0].slug); }
    else if (fuelPills[0]) { if (!value.fuel.includes(fuelPills[0].slug)) toggleFuel(fuelPills[0].slug); }
    else return;
    setText("");
  }

  // Live total for the sheet's button: a van matches when it fits the selected makes/models AND body types AND fuels.
  const liveCount = useMemo(() => countMatches(data, value), [data, value]);

  const anySelected = value.vehicles.length > 0 || value.body.length > 0 || value.fuel.length > 0;

  const panel = (
    <div>
      {makePills.length > 0 && (
        <Section title="Makes">
          {makePills.map((m) => <Pill key={m.slug} pill={m} on={isMake(m.slug)} onClick={() => toggleMake(m.slug)} />)}
        </Section>
      )}
      {modelGroups.length > 0 && (
        <section className="mt-4">
          <h3 className="mb-2 text-[var(--text-2xs)] font-bold uppercase tracking-wider text-ink-400">Models</h3>
          <div className="space-y-3">
            {modelGroups.map((g) => (
              <div key={g.make.slug}>
                {makesSelected.length > 1 && <p className="mb-1.5 text-[var(--text-xs)] font-semibold text-ink-500">{g.make.name}</p>}
                <div className="flex flex-wrap gap-2">
                  {g.models.map((m) => <Pill key={m.slug} pill={m} on={isModel(g.make.slug, m.slug)} onClick={() => toggleModel(g.make.slug, m.slug)} />)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      {bodyPills.length > 0 && (
        <Section title="Body type">
          {bodyPills.map((b) => <Pill key={b.slug} pill={b} on={value.body.includes(b.slug)} onClick={() => toggleBody(b.slug)} />)}
        </Section>
      )}
      {fuelPills.length > 0 && (
        <Section title="Fuel">
          {fuelPills.map((f) => <Pill key={f.slug} pill={f} on={value.fuel.includes(f.slug)} onClick={() => toggleFuel(f.slug)} />)}
        </Section>
      )}
      {makePills.length === 0 && modelGroups.length === 0 && bodyPills.length === 0 && fuelPills.length === 0 && (
        <p className="py-4 text-[var(--text-sm)] text-ink-500">{text ? `Nothing matches “${text}”.` : "No vans are listed yet."}</p>
      )}
    </div>
  );

  // The bar: chips + the text input.
  const modelChips = value.vehicles.filter((v) => v.model);
  const bar = (
    <div
      className="flex min-h-[3rem] flex-wrap items-center gap-1.5 rounded-[var(--radius-lg)] border border-border bg-white px-2.5 py-1.5 focus-within:border-brand-400 focus-within:shadow-[var(--shadow-focus)]"
      onClick={() => inputRef.current?.focus()}
    >
      {makesSelected.map((slug) => (
        <Chip key={`m:${slug}`} label={chipLabel({ make: slug })} onRemove={() => toggleMake(slug)} />
      ))}
      {modelChips.map((v) => (
        <Chip key={`d:${v.make}:${v.model}`} label={chipLabel(v)} onRemove={() => toggleModel(v.make, v.model!)} />
      ))}
      {value.body.map((b) => <Chip key={`b:${b}`} label={data.bodyTypes.find((x) => x.slug === b)?.name ?? b} onRemove={() => toggleBody(b)} />)}
      {value.fuel.map((f) => <Chip key={`f:${f}`} label={data.fuels.find((x) => x.slug === f)?.name ?? f} onRemove={() => toggleFuel(f)} />)}
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => { setText(e.target.value); if (isMobile) setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); submitFirstMatch(); }
          else if (e.key === "Backspace" && text === "") {
            if (value.fuel.length) toggleFuel(value.fuel[value.fuel.length - 1]);
            else if (value.body.length) toggleBody(value.body[value.body.length - 1]);
            else if (modelChips.length) toggleModel(modelChips[modelChips.length - 1].make, modelChips[modelChips.length - 1].model!);
            else if (makesSelected.length) toggleMake(makesSelected[makesSelected.length - 1]);
          }
        }}
        placeholder={anySelected ? "Add more…" : "Pick a make, or just type"}
        aria-label="Search makes, models, body types and fuels"
        aria-controls={sheetId}
        autoComplete="off"
        className="min-w-[8rem] flex-1 bg-transparent px-1.5 py-1.5 text-[var(--text-base)] font-medium text-ink-900 outline-none placeholder:font-normal placeholder:text-ink-400"
        readOnly={isMobile && !open}
      />
      {anySelected && (
        <button type="button" onClick={(e) => { e.stopPropagation(); clearAll(); }} className="px-2 text-[var(--text-xs)] font-semibold text-ink-400 hover:text-brand-600">
          Clear
        </button>
      )}
    </div>
  );

  const card = "rounded-[var(--radius-xl)] border border-border bg-white p-4 shadow-[var(--shadow-md)]";

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {bar}

      {/* desktop: inline panel (home) or popover (results) */}
      {!isMobile && variant === "inline" && <div id={sheetId} className={`mt-3 ${card}`}>{panel}</div>}
      {!isMobile && variant === "popover" && open && (
        <div id={sheetId} className={`absolute left-0 right-0 top-full z-30 mt-2 max-h-[70vh] overflow-y-auto ${card}`}>{panel}</div>
      )}

      {/* mobile: full-screen sheet (portalled: the sticky header's backdrop-filter would otherwise trap position:fixed) */}
      {isMobile && open && typeof document !== "undefined" && createPortal(
        <div id={sheetId} role="dialog" aria-modal="true" aria-label="Choose make, model, body type and fuel" className="fixed inset-0 z-[70] flex flex-col bg-white">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="font-display text-[var(--text-base)] font-bold text-ink-900">Find a van</p>
            <button type="button" onClick={() => setOpen(false)} className="rounded-[var(--radius-md)] px-3 py-1.5 text-[var(--text-sm)] font-semibold text-brand-600">Done</button>
          </div>
          <div className="border-b border-border px-4 py-3">{bar}</div>
          <div className="flex-1 overflow-y-auto px-4 py-4">{panel}</div>
          <div className="border-t border-border bg-white p-4">
            <button
              type="button"
              onClick={() => { setOpen(false); onSubmit?.(); }}
              className="h-12 w-full rounded-[var(--radius-xl)] text-[var(--text-base)] font-bold text-white shadow-[var(--shadow-md)]"
              style={{ background: "linear-gradient(135deg, #f47c1e 0%, #d96410 100%)" }}
            >
              Show {liveCount.toLocaleString("en-GB")} {liveCount === 1 ? "van" : "vans"}
            </button>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-600 py-1 pl-3 pr-1.5 text-[var(--text-sm)] font-semibold text-white">
      {label}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        aria-label={`Remove ${label}`}
        className="grid size-5 place-items-center rounded-full text-white/80 hover:bg-white/20 hover:text-white"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 2l6 6M8 2L2 8" /></svg>
      </button>
    </span>
  );
}
