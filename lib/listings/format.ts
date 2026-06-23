import type { Listing, PriceType, Wheelbase, RoofHeight } from "./types";

const GBP = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

/** "£24,995" or "POA" when price is unknown. */
export function formatPrice(price: number | null): string {
  return price == null ? "Contact for price" : GBP.format(price);
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

/** New vans with no mileage show "100 mi" (delivery miles), used shows "—". */
export function formatMileageDisplay(mileage: number | null, condition: "used" | "new"): string {
  if (mileage == null) return condition === "new" ? "100 mi" : "—";
  return `${new Intl.NumberFormat("en-GB").format(mileage)} mi`;
}

/** Returns "Manual" as default when the feed omits transmission. */
export function formatGearbox(transmission: string): string {
  if (!transmission || transmission === "—") return "Manual";
  return titleCase(transmission);
}

/** Engine cc → "2.0L", "2.2L", etc. */
export function formatEngineCC(cc: number | null): string {
  if (cc == null) return "—";
  return `${(cc / 1000).toFixed(1)}L`;
}

/** UK plate display: a year turns into a registration prefix, e.g. 2024 → "73 / 24". */
export function plateDisplay(plate: string): string {
  return plate ? plate.toUpperCase() : "—";
}

export const WHEELBASE_LABEL: Record<Wheelbase, string> = {
  swb: "Short wheelbase",
  mwb: "Medium wheelbase",
  lwb: "Long wheelbase",
  xlwb: "Extra-long wheelbase",
};

export const WHEELBASE_SHORT: Record<Wheelbase, string> = {
  swb: "SWB",
  mwb: "MWB",
  lwb: "LWB",
  xlwb: "XLWB",
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

/** A clean human title, e.g. "Volkswagen Transporter T32 Highline".
   Drops the derivative when the (often verbose) feed model already contains it. */
export function listingTitle(l: Listing): string {
  const model = (l.model || "").trim();
  const deriv = (l.derivative || "").trim();
  const parts = [l.make, model];
  if (deriv && !model.toLowerCase().includes(deriv.toLowerCase())) parts.push(deriv);
  return parts.filter(Boolean).join(" ").trim();
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
