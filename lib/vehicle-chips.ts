import { SORTED_MAKES, getMakeBySlug } from "@/lib/taxonomy/van-makes";

/** One chip in the vehicle search: a make, or a make narrowed to one model (slugs). URL form: ?v=ford:transit-custom,volkswagen */
export type VehicleChip = { make: string; model?: string };

export function parseVehicles(raw: string | undefined | null): VehicleChip[] {
  if (!raw) return [];
  const out: VehicleChip[] = [];
  for (const part of raw.split(",")) {
    const [make, model] = part.trim().toLowerCase().split(":");
    if (!make || !/^[a-z0-9-]+$/.test(make)) continue;
    if (model && !/^[a-z0-9-]+$/.test(model)) continue;
    if (!out.some((c) => c.make === make && c.model === (model || undefined))) out.push({ make, model: model || undefined });
  }
  return out;
}

export function stringifyVehicles(chips: VehicleChip[]): string {
  return chips.map((c) => (c.model ? `${c.make}:${c.model}` : c.make)).join(",");
}

/** Legacy ?make=ford&models=a,b (or ?model=a) → chips, so old links and the make landing pages keep working. */
export function legacyToVehicles(make: string | undefined, models: string[] | undefined): VehicleChip[] {
  if (!make) return [];
  return models && models.length > 0 ? models.map((m) => ({ make, model: m })) : [{ make }];
}

export function chipLabel(c: VehicleChip): string {
  const mk = getMakeBySlug(c.make);
  const makeName = mk?.name ?? titleize(c.make);
  if (!c.model) return makeName;
  const model = mk?.models.find((m) => m.slug === c.model)?.name ?? titleize(c.model);
  return `${makeName} ${model}`;
}

function titleize(s: string) {
  return s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export interface VehicleSuggestion extends VehicleChip { label: string }

let _all: VehicleSuggestion[] | null = null;
function allSuggestions(): VehicleSuggestion[] {
  if (_all) return _all;
  const list: VehicleSuggestion[] = [];
  for (const m of SORTED_MAKES) {
    list.push({ make: m.slug, label: m.name });
    for (const mod of m.models) list.push({ make: m.slug, model: mod.slug, label: `${m.name} ${mod.name}` });
  }
  _all = list;
  return list;
}

/** Autocomplete: every word typed must appear in "make model". Makes rank above their models; chips already chosen are excluded. */
export function suggestVehicles(query: string, chosen: VehicleChip[], limit = 8): VehicleSuggestion[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const taken = new Set(chosen.map((c) => `${c.make}:${c.model ?? ""}`));
  const scored: { s: VehicleSuggestion; score: number }[] = [];
  for (const s of allSuggestions()) {
    if (taken.has(`${s.make}:${s.model ?? ""}`)) continue;
    const hay = s.label.toLowerCase();
    if (!words.every((w) => hay.includes(w))) continue;
    const startsWith = hay.startsWith(words[0]) ? 0 : 1;
    scored.push({ s, score: startsWith * 2 + (s.model ? 1 : 0) });
  }
  return scored.sort((a, b) => a.score - b.score || a.s.label.localeCompare(b.s.label)).slice(0, limit).map((x) => x.s);
}
