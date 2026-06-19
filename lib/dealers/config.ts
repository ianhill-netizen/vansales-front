/* Dealer config — add a new entry here to create a new dealer page.
   The dealskiTenant string keys the Dealski feed and finance URLs.
   No backend changes needed; the front-end reads this at build/request time. */

export type DayHours = { open: string; close: string } | null; // null = closed

export interface DealerConfig {
  name: string;
  slug: string;
  dealskiTenant: string;
  location: {
    line1: string;
    town: string;
    county: string;
    postcode: string;
    lat: number;
    lng: number;
  };
  phone: string;
  /* TODO: set to the Swiss Vans WhatsApp number in international format,
     e.g. "447700900000". Pull from Dealski tenant config when available. */
  whatsapp: string | null;
  websites: { label: string; url: string }[];
  hours: { mon: DayHours; tue: DayHours; wed: DayHours; thu: DayHours; fri: DayHours; sat: DayHours; sun: DayHours };
  about: string;
  services: string[];
  /* Seller names that appear in the Dealski feed for this dealer.
     Used to associate listings on the detail page with the dealer config. */
  sellerNames: string[];
  /* Placeholders — wire to real Google Places API when ready */
  googleRating: number | null;
  googleReviewCount: number | null;
}

// TODO: replace null with the Swiss Vans WhatsApp number (intl format, no +)
const SWISSVANS_WHATSAPP: string | null = null;

export const DEALERS: Record<string, DealerConfig> = {
  "swiss-vans": {
    name: "Swiss Vans",
    slug: "swiss-vans",
    dealskiTenant: "swissvans",
    location: {
      line1: "Bocam Park, 31 Old Field Road",
      town: "Pencoed, Bridgend",
      county: "Mid Glamorgan",
      postcode: "CF35 5LJ",
      lat: 51.5184,
      lng: -3.5076,
    },
    phone: "(01446) 361042",
    whatsapp: SWISSVANS_WHATSAPP,
    websites: [
      { label: "swissvans.com", url: "https://www.swissvans.com" },
      { label: "stock.swissvans.com", url: "https://stock.swissvans.com" },
      // TODO: add conversions link when URL is confirmed
    ],
    hours: {
      mon: { open: "08:30", close: "17:00" },
      tue: { open: "08:30", close: "17:00" },
      wed: { open: "08:30", close: "17:00" },
      thu: { open: "08:30", close: "17:00" },
      fri: { open: "08:30", close: "17:00" },
      sat: { open: "10:00", close: "13:00" },
      sun: null,
    },
    about:
      "Swiss Vans is a privately owned dealership based in Bridgend with over 20 years of experience in van leasing, sales and custom conversions. Strong manufacturer relationships, high-spec stock, bespoke builds and honest no-pressure advice — whether you need a standard panel van or a fully customised conversion, the team at Bocam Park can help.",
    services: [
      "New & used van sales",
      "Commercial van sales",
      "Racking & ply-lining",
      "Custom conversions & bespoke builds",
      "Bodyshop",
      "EV charging",
      "Van rental",
    ],
    sellerNames: ["Swiss Vans", "Swiss Vans Ltd"],
    googleRating: null,
    googleReviewCount: null,
  },
};

/** Look up dealer config by the seller name appearing in a Dealski listing. */
export function getDealerConfigBySeller(sellerName: string): DealerConfig | null {
  const lower = sellerName.toLowerCase();
  return Object.values(DEALERS).find((d) => d.sellerNames.some((n) => n.toLowerCase() === lower)) ?? null;
}

export function getDealerConfig(slug: string): DealerConfig | null {
  return DEALERS[slug] ?? null;
}

/** Finance application URL for a Dealski tenant, optionally with a van ref. */
export function financeUrl(tenant: string, vanRef?: string): string {
  const base = `https://app.dealski.co.uk/apply/${tenant}`;
  return vanRef ? `${base}?ref=${encodeURIComponent(vanRef)}` : base;
}

/** WhatsApp deep-link. Returns null when number not configured. */
export function whatsappUrl(number: string | null, prefill: string): string | null {
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(prefill)}`;
}
