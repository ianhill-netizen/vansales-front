import type { Listing } from "@/lib/listings/types";

/** The optional van details a private seller can give (vansales-backend). Every field is null until they say. */
export interface VanDetails {
  body_type: string | null; // readable ("Panel Van"), already formatted by the API
  wheelbase: "swb" | "mwb" | "lwb" | "xlwb" | null;
  roof_height: "low" | "medium" | "high" | "super_high" | null;
  rear_doors: "barn_doors" | "top_hinged" | "roller_shutter" | "none" | null;
  side_loading_door: "nearside" | "offside" | "both" | "none" | null;
  seats: number | null;
  payload_kg: number | null;
  gross_weight_kg: number | null;
  service_history: "full" | "partial" | "none" | null;
  engine_cc: number | null;
  euro_class: string | null;
  previous_owners: number | null;
}

export type VatStatus = "vat_qualifying" | "ex_vat" | "inc_vat" | "no_vat";

const WHEELBASE = { swb: "SWB (short wheelbase)", mwb: "MWB (medium wheelbase)", lwb: "LWB (long wheelbase)", xlwb: "XLWB (extra-long wheelbase)" } as const;
const ROOF = { low: "Low roof", medium: "Medium roof", high: "High roof", super_high: "Super high roof" } as const;
const REAR = { barn_doors: "Barn doors", top_hinged: "Top-hinged door", roller_shutter: "Roller shutter", none: "None" } as const;
const SIDE = { nearside: "Nearside", offside: "Offside", both: "Both sides", none: "None" } as const;
const SERVICE = { full: "Full", partial: "Partial", none: "None" } as const;
export const VAT_BADGE: Record<VatStatus, string> = { vat_qualifying: "VAT qualifying", ex_vat: "Ex-VAT", inc_vat: "Inc. VAT", no_vat: "No VAT" };

const n = (v: number) => new Intl.NumberFormat("en-GB").format(v);

/** The specification rows to show on the advert: only the ones the seller filled in, in a fixed order. */
export function detailRows(d: Partial<VanDetails> | undefined): { label: string; value: string }[] {
  if (!d) return [];
  const rows: [string, string | null][] = [
    ["Body type", d.body_type || null],
    ["Wheelbase", d.wheelbase ? WHEELBASE[d.wheelbase] : null],
    ["Roof height", d.roof_height ? ROOF[d.roof_height] : null],
    ["Rear doors", d.rear_doors ? REAR[d.rear_doors] : null],
    ["Side loading door", d.side_loading_door ? SIDE[d.side_loading_door] : null],
    ["Seats", d.seats ? String(d.seats) : null],
    ["Payload", d.payload_kg ? `${n(d.payload_kg)} kg` : null],
    ["Gross vehicle weight", d.gross_weight_kg ? `${n(d.gross_weight_kg)} kg` : null],
    ["Service history", d.service_history ? SERVICE[d.service_history] : null],
    ["Engine size", d.engine_cc ? `${n(d.engine_cc)} cc` : null],
    ["Euro class", d.euro_class || null],
    ["Previous owners", d.previous_owners != null ? String(d.previous_owners) : null],
  ];
  return rows.filter((r): r is [string, string] => r[1] !== null).map(([label, value]) => ({ label, value }));
}

export type Condition = "excellent" | "good" | "fair" | "project";
export type WarrantyType = "none" | "manufacturer" | "aftermarket";
export const CONDITION_LABEL: Record<Condition, string> = { excellent: "Excellent condition", good: "Good condition", fair: "Fair condition", project: "Project / needs work" };

/** "Manufacturer warranty until Jun 2027" / "Aftermarket warranty" / "No warranty"; null when the seller did not say. */
export function warrantyText(type: WarrantyType | null | undefined, expiry: string | null | undefined): string | null {
  if (!type) return null;
  if (type === "none") return "No warranty";
  const kind = type === "manufacturer" ? "Manufacturer warranty" : "Aftermarket warranty";
  if (!expiry) return kind;
  const d = new Date(`${expiry}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? kind : `${kind} until ${d.toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" })}`;
}

export type WithDetails = Pick<Listing, "van_spec"> & { details?: Partial<VanDetails> };
