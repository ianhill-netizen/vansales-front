/**
 * Text and JSON-LD for the make page (/vans/{make}-vans-for-sale). Pure functions, no I/O, so they are unit-tested.
 */
import type { Listing } from "../listings/types.ts";

/** The stock line of a model card: "2 vans for sale" / "1 van for sale" / "no stock right now". null, undefined and NaN count as zero. */
export function modelStockLabel(count: number | null | undefined): string {
  const n = typeof count === "number" && Number.isFinite(count) ? count : 0;
  if (n <= 0) return "no stock right now";
  return `${n.toLocaleString("en-GB")} ${n === 1 ? "van" : "vans"} for sale`;
}

/** The whole card as plain text: "Volkswagen Transporter — 2 vans for sale". The separator is a real character, so text-only readers never see the name and count glued together. */
export function modelCardText(makeName: string, modelName: string, count: number | null | undefined): string {
  return `${makeName} ${modelName} — ${modelStockLabel(count)}`;
}

const isBlank = (v: unknown) => v === null || v === undefined || (typeof v === "string" && v.trim() === "") || (typeof v === "number" && !Number.isFinite(v));

/** Drops null, undefined, empty-string and non-finite fields (recursively), so the JSON-LD never carries an empty value. */
export function prune<T>(v: T): T {
  if (Array.isArray(v)) return v.map(prune).filter((x) => !isBlank(x)) as unknown as T;
  if (v && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      const p = prune(val);
      if (!isBlank(p)) out[k] = p;
    }
    return out as T;
  }
  return v;
}

type VehicleSource = Pick<Listing, "slug" | "make" | "model" | "year" | "mileage" | "fuel" | "price" | "images">;

const realImage = (u: string | undefined) => (u && /^https?:\/\//i.test(u) ? u : undefined);

export function vehicleJsonLd(l: VehicleSource, abs: (path: string) => string) {
  const url = abs(`/listing/${l.slug}`);
  return prune({
    "@type": "Vehicle",
    name: `${l.make} ${l.model}`,
    url,
    image: realImage(l.images?.[0]?.url),
    brand: { "@type": "Brand", name: l.make },
    vehicleModelDate: l.year ? String(l.year) : undefined,
    mileageFromOdometer: l.mileage != null && l.mileage >= 0 ? { "@type": "QuantitativeValue", value: l.mileage, unitCode: "SMI" } : undefined,
    fuelType: l.fuel,
    // An Offer without a price is invalid, so a price-on-application van carries no offer at all.
    offers: l.price != null && l.price > 0
      ? { "@type": "Offer", price: l.price, priceCurrency: "GBP", availability: "https://schema.org/InStock", url }
      : undefined,
  });
}

export function vehicleItemList(listings: readonly VehicleSource[], abs: (path: string) => string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: listings.map((l, i) => ({ "@type": "ListItem", position: i + 1, item: vehicleJsonLd(l, abs) })),
  };
}

export function makeBreadcrumbList(makeName: string, makePath: string, abs: (path: string) => string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: abs("/") },
      { "@type": "ListItem", position: 2, name: "Vans for sale", item: abs("/vans") },
      { "@type": "ListItem", position: 3, name: `${makeName} vans for sale`, item: abs(makePath) },
    ],
  };
}
