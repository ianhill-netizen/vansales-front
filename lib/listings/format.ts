import type { Listing, PriceType, Wheelbase, RoofHeight } from "./types";

const GBP = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

/** "£24,995" or "POA" when price is unknown. */
export function formatPrice(price: number | null): string {
  return price == null ? "POA" : GBP.format(price);
}

/** Short VAT qualifier shown next to a price. */
export function vatLabel(priceType: PriceType, vatQualifying: boolean): string {
  if (priceType === "no_vat") return "No VAT";
  return vatQualifying ? "+ VAT" : "inc. VAT";
}

export function formatMileage(mileage: number | null): string {
  if (mileage == null) return "—";
  return `${new Intl.NumberFormat("en-GB").format(mileage)} mi`;
}

/** UK plate display: a year turns into a registration prefix, e.g. 2024 → "73 / 24". */
export function plateDisplay(plate: string): string {
  return plate ? plate.toUpperCase() : "—";
}

export const WHEELBASE_LABEL: Record<Wheelbase, string> = {
  swb: "Short wheelbase",
  mwb: "Medium wheelbase",
  lwb: "Long wheelbase",
};

export const WHEELBASE_SHORT: Record<Wheelbase, string> = {
  swb: "SWB",
  mwb: "MWB",
  lwb: "LWB",
};

export const ROOF_LABEL: Record<RoofHeight, string> = {
  low: "Low roof",
  medium: "Medium roof",
  high: "High roof",
};

export function titleCase(input: string): string {
  return input
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/** A clean human title for a listing, e.g. "Volkswagen Transporter T32 Highline". */
export function listingTitle(l: Listing): string {
  return [l.make, l.model, l.derivative].filter(Boolean).join(" ").trim();
}

/** Compact subtitle used under the price block, e.g. "2024 (73) · 18,420 mi · Diesel". */
export function listingMeta(l: Listing): string {
  return [
    `${l.year}${l.plate ? ` (${l.plate})` : ""}`,
    formatMileage(l.mileage),
    titleCase(l.fuel),
  ]
    .filter((s) => s && s !== "—")
    .join("  ·  ");
}

export function payloadDisplay(kg: number | null): string {
  return kg == null ? "—" : `${new Intl.NumberFormat("en-GB").format(kg)} kg`;
}

export function loadLengthDisplay(mm: number | null): string {
  return mm == null ? "—" : `${(mm / 1000).toFixed(2)} m`;
}

export const STATUS_LABEL: Record<Listing["status"], string> = {
  active: "Available",
  reserved: "Reserved",
  sold: "Sold",
  removed: "Removed",
};
