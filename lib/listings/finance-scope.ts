import type { Listing } from "./types";

/**
 * Finance scope (Ian, 2026-11-13): finance UI (the toggle, monthly figures, the calculator, "Tell us your budget" and the representative example) exists ONLY for Swiss Vans Ltd stock. Vansales.com is a trading name of
 * Swiss Vans Ltd, which holds the FCA permission; other dealers' and private sellers' vans get no finance UI from us. A dealer that offers its own finance gets one plain line, with its FRN when we hold it.
 */
export const SWISS_VANS_SLUG = "swiss-vans";

type Scoped = Pick<Listing, "seller" | "seller_type"> & { dealer_contact?: Pick<NonNullable<Listing["dealer_contact"]>, "slug"> | undefined };

export function isSwissVans(l: Scoped): boolean {
  if (l.seller_type !== "dealer") return false;
  const slug = l.dealer_contact?.slug;
  if (slug) return slug === SWISS_VANS_SLUG;
  return /^swiss vans( ltd| limited)?$/i.test(l.seller.name.trim());   // config / legacy stock that carries only a seller name
}

/** The plain line for another dealer's listing: only when that dealer publishes its own finance link. null = no finance line at all. */
export function dealerFinanceLine(l: Scoped & { dealer_contact?: { finance_url?: string | null; fca_frn?: string | null; name?: string } }): string | null {
  if (isSwissVans(l) || l.seller_type !== "dealer" || !l.dealer_contact?.finance_url) return null;
  const name = (l.dealer_contact.name || l.seller.name).trim();
  const frn = l.dealer_contact.fca_frn?.trim();
  return `Finance available from ${name}${frn ? ` (FCA FRN ${frn})` : ""}`;
}
