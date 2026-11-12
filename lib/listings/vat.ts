/**
 * The ONE place that turns a stored VAT status into what a buyer sees. The label is driven by the record, never by a default:
 *   ex_vat | vat_qualifying -> "+ VAT"   (the price is before VAT)
 *   inc_vat                 -> "inc. VAT" (ONLY here)
 *   no_vat                  -> "No VAT"
 *   null / absent / other   -> ""         (unknown: no qualifier at all; the listing page adds "VAT status to be confirmed")
 * No price is ever converted. Pure, no imports from the app (node:test runs it directly).
 */
export type VatStatusValue = "vat_qualifying" | "ex_vat" | "inc_vat" | "no_vat";
export type VatPriceType = "inc_vat" | "ex_vat" | "no_vat" | "unknown";
export type VatState = "ex_vat" | "inc_vat" | "no_vat" | "unknown";

export function vatState(status: string | null | undefined): VatState {
  if (status === "ex_vat" || status === "vat_qualifying") return "ex_vat";
  if (status === "inc_vat") return "inc_vat";
  if (status === "no_vat") return "no_vat";
  return "unknown";
}

/** The Listing's price_type / vat_qualifying pair for a stored status (vat_qualifying stays true for "+ VAT" prices, as before). */
export function priceFieldsFor(status: string | null | undefined): { price_type: VatPriceType; vat_qualifying: boolean } {
  const s = vatState(status);
  return { price_type: s, vat_qualifying: s === "ex_vat" };
}

/** Short qualifier shown next to a price; "" = show nothing. (vatQualifying only matters for the legacy demo sources that say inc_vat + qualifying.) */
export function vatLabel(priceType: VatPriceType, vatQualifying: boolean): string {
  switch (priceType) {
    case "no_vat": return "No VAT";
    case "ex_vat": return "+ VAT";
    case "unknown": return "";
    default: return vatQualifying ? "+ VAT" : "inc. VAT";
  }
}

/**
 * The finance calculator's VAT-as-deposit treatment: UNCHANGED from before, it applies to `vat_qualifying` only. Never for ex_vat, inc_vat, no_vat or unknown.
 * (ex_vat vs vat_qualifying finance treatment is an existing inconsistency, to be decided separately.)
 */
export function vatOnTop(status: string | null | undefined): boolean {
  return status === "vat_qualifying";
}

/** schema.org PriceSpecification.valueAddedTaxIncluded: true only for inc_vat, false for ex_vat, undefined (omit it) for no_vat and unknown. */
export function valueAddedTaxIncluded(status: string | null | undefined): boolean | undefined {
  const s = vatState(status);
  return s === "inc_vat" ? true : s === "ex_vat" ? false : undefined;
}

/** The JSON-LD Offer price fields for a listing: price, plus a priceSpecification that carries valueAddedTaxIncluded when the record says. */
export function offerPriceLd(price: number | null, status: string | null | undefined): Record<string, unknown> {
  if (price == null) return { priceCurrency: "GBP" };
  const vat = valueAddedTaxIncluded(status);
  return {
    priceCurrency: "GBP",
    price,
    ...(vat === undefined ? {} : { priceSpecification: { "@type": "PriceSpecification", price, priceCurrency: "GBP", valueAddedTaxIncluded: vat } }),
  };
}

/**
 * A dealer advert whose VAT status is not recorded is a data fault, and a bare price beside it reads as the price the buyer pays. So it is never shown as a card anywhere
 * (grids, search, maps, dealer pages, saved vans, sitemap): it reappears as soon as the record says ex_vat / inc_vat / no_vat. Private adverts are unaffected (a private price is final).
 * Its direct URL still renders, with an explicit "VAT status to be confirmed" warning (see the listing page).
 */
export function isVatUnconfirmedDealerAdvert(l: { seller_type: string; price_type: string; price: number | null }): boolean {
  return l.seller_type === "dealer" && l.price_type === "unknown" && l.price != null;
}
