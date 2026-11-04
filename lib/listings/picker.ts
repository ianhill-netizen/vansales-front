import { loadCatalogue } from "@/lib/seo/catalogue";
import { resolveModelSlug } from "@/lib/models/image";
import { slugify } from "@/lib/listings/slug";
import { getMakeByName, getModelBySlug } from "@/lib/taxonomy/van-makes";

/* =============================================================================
   PICKER DATA — what the make / model / body type / fuel picker shows, with real
   stock counts, plus one compact row per listing so the picker can show a live
   "Show N vans" total on the client without a request.
   ============================================================================= */

export interface PickerPill { slug: string; name: string; count: number }

export interface PickerData {
  makes: PickerPill[];                       // only makes with stock
  models: Record<string, PickerPill[]>;      // makeSlug -> models with stock
  bodyTypes: PickerPill[];                   // the fixed set, with counts (0 allowed)
  fuels: PickerPill[];                       // the fixed set, with counts (0 allowed)
  /** [make slug, base model slug | "", body slug, fuel slug] for every listing. */
  rows: [string, string, string, string][];
}

export const BODY_TYPES: { slug: string; name: string }[] = [
  { slug: "panel-van", name: "Panel van" },
  { slug: "crew-cab", name: "Crew cab" },
  { slug: "luton", name: "Luton" },
  { slug: "tipper", name: "Tipper" },
  { slug: "dropside", name: "Dropside" },
  { slug: "pickup", name: "Pickup" },
  { slug: "minibus", name: "Minibus" },
  { slug: "campervan", name: "Campervan" },
];

export const FUELS: { slug: string; name: string }[] = [
  { slug: "diesel", name: "Diesel" },
  { slug: "petrol", name: "Petrol" },
  { slug: "electric", name: "Electric" },
  { slug: "hybrid", name: "Hybrid" },
];

export async function getPickerData(): Promise<PickerData> {
  const idx = await loadCatalogue();
  const makes = new Map<string, PickerPill>();
  const models = new Map<string, Map<string, PickerPill>>();
  const body = new Map<string, number>();
  const fuel = new Map<string, number>();
  const rows: PickerData["rows"] = [];

  for (const l of idx.all) {
    const mk = getMakeByName(l.make);
    const makeSlug = mk?.slug ?? slugify(l.make);
    if (!makeSlug || makeSlug === "van") continue;
    const m = makes.get(makeSlug) ?? { slug: makeSlug, name: mk?.name ?? l.make, count: 0 };
    m.count++;
    makes.set(makeSlug, m);

    const r = resolveModelSlug(l.make, l.model);
    const modelSlug = r && r.makeSlug === makeSlug ? r.modelSlug : "";
    if (modelSlug) {
      const group = models.get(makeSlug) ?? new Map<string, PickerPill>();
      const p = group.get(modelSlug) ?? { slug: modelSlug, name: getModelBySlug(makeSlug, modelSlug)?.name ?? modelSlug, count: 0 };
      p.count++;
      group.set(modelSlug, p);
      models.set(makeSlug, group);
    }
    const b = slugify(l.van_spec.body_style);
    const f = slugify(l.fuel);
    body.set(b, (body.get(b) ?? 0) + 1);
    fuel.set(f, (fuel.get(f) ?? 0) + 1);
    rows.push([makeSlug, modelSlug, b, f]);
  }

  const byName = (a: PickerPill, b: PickerPill) => a.name.localeCompare(b.name, "en", { sensitivity: "base" });
  return {
    makes: [...makes.values()].sort((a, b) => b.count - a.count || byName(a, b)),
    models: Object.fromEntries([...models.entries()].map(([k, g]) => [k, [...g.values()].sort((a, b) => b.count - a.count || byName(a, b))])),
    bodyTypes: BODY_TYPES.map((t) => ({ ...t, count: body.get(t.slug) ?? 0 })),
    fuels: FUELS.map((t) => ({ ...t, count: fuel.get(t.slug) ?? 0 })),
    rows,
  };
}
