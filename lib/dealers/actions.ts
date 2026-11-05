import type { Listing } from "@/lib/listings/types";
import { financeUrl, type DealerConfig } from "@/lib/dealers/config";

/** What the button row on a listing offers. A field that is null/false means that button is not shown. */
export interface ListingActionLinks {
  /** WhatsApp and Call do NOT carry a number: they open the contact modal, which logs a lead (POST /api/public/listings/{id}/lead) and only then hands over the wa.me link / phone number. */
  whatsapp: { listingId: string; dealerName: string; label: string } | null;
  call: { listingId: string; dealerName: string; label: string } | null;
  /** Opens in a new tab. */
  financeHref: string | null;
  /** The numeric advert id the vansales API's book-call endpoint takes; null = no call booking. */
  bookCall: { listingId: string; dealerName: string } | null;
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

/** Links for one listing: a vansales-API dealer's own details (listing.dealer_contact); a config dealer only gets finance (its WhatsApp number is never rendered: contact goes through a logged lead). */
export function listingActionLinks(listing: Listing, dealerConfig: DealerConfig | null): ListingActionLinks {
  const dc = listing.dealer_contact;
  const label = `${listing.make} ${listing.model}${listing.vrm ? ` ${listing.vrm}` : ""}`;
  if (dc) {
    return {
      whatsapp: dc.has_whatsapp ? { listingId: listing.source_id, dealerName: dc.name, label } : null,
      call: dc.has_phone ? { listingId: listing.source_id, dealerName: dc.name, label } : null,
      financeHref: safeHttpUrl(dc.finance_url),
      bookCall: dc.has_call_booking ? { listingId: listing.source_id, dealerName: dc.name } : null,
    };
  }
  if (dealerConfig) {
    return { whatsapp: null, call: null, financeHref: dealerConfig.dealskiTenant ? financeUrl(dealerConfig.dealskiTenant, listing.slug) : null, bookCall: null };
  }
  return { whatsapp: null, call: null, financeHref: null, bookCall: null };
}
