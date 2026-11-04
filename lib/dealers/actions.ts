import type { Listing } from "@/lib/listings/types";
import { financeUrl, whatsappUrl, type DealerConfig } from "@/lib/dealers/config";

/** What the button row on a listing offers. A field that is null/false means that button is not shown. */
export interface ListingActionLinks {
  whatsappHref: string | null;
  /** Opens in a new tab. */
  financeHref: string | null;
  /** The numeric advert id the vansales API's book-call endpoint takes; null = no call booking. */
  bookCall: { listingId: string; dealerName: string } | null;
}

/** "Hi, I'm interested in your <make model> <reg> on vansales.com"; the registration only when the listing has one. */
export function whatsappPrefill(l: Pick<Listing, "make" | "model" | "vrm">): string {
  return `Hi, I'm interested in your ${l.make} ${l.model}${l.vrm ? ` ${l.vrm}` : ""} on vansales.com`;
}

/** Only an http(s) URL is ever linked (a stored value is data, never trusted as a scheme). */
function safeHttpUrl(v: string | null | undefined): string | null {
  if (!v) return null;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/** Links for one listing: a vansales-API dealer's own details (listing.dealer_contact), else the config dealer (Swiss Vans via Dealski), else nothing. */
export function listingActionLinks(listing: Listing, dealerConfig: DealerConfig | null): ListingActionLinks {
  const prefill = whatsappPrefill(listing);
  const dc = listing.dealer_contact;
  if (dc) {
    const digits = (dc.whatsapp_number ?? "").replace(/\D/g, "");
    return {
      whatsappHref: digits ? whatsappUrl(digits, prefill) : null,
      financeHref: safeHttpUrl(dc.finance_url),
      bookCall: dc.has_call_booking ? { listingId: listing.source_id, dealerName: dc.name } : null,
    };
  }
  if (dealerConfig) {
    return {
      whatsappHref: whatsappUrl(dealerConfig.whatsapp, prefill),
      financeHref: dealerConfig.dealskiTenant ? financeUrl(dealerConfig.dealskiTenant, listing.slug) : null,
      bookCall: null,
    };
  }
  return { whatsappHref: null, financeHref: null, bookCall: null };
}
