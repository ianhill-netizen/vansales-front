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
    /** A line of directions shown under the address, e.g. "Opposite the entrance to Asda Bridgend". */
    directions?: string;
  };
  /** Exact map-pin position for the address (WGS-84). Preferred over anything derived from the stock feed. */
  coords?: { lat: number; lng: number };
  /** Social profiles. An empty string is an unfilled slot (nothing is shown until a link is set). */
  socials?: { facebook?: string; instagram?: string; linkedin?: string; youtube?: string; twitter?: string };
  /** The dealer's Google reviews page (a link only; no rating is invented). */
  googleReviewsUrl?: string;
  /** Optional wide banner image for the profile header (unset: the plain dark header). */
  coverUrl?: string;
  phone: string;
  /* WhatsApp number in international format, digits only, no + (e.g. 447XXXXXXXXX).
     Null = button renders disabled. */
  whatsapp: string | null;
  /* Featured dealers get free promoted placement — foundation for paid boosts. */
  featured: boolean;
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

const SWISSVANS_WHATSAPP: string = "447460094272"; // 07460 094272

export const DEALERS: Record<string, DealerConfig> = {
  "swiss-vans": {
    name: "Swiss Vans",
    slug: "swiss-vans",
    dealskiTenant: "swissvans",
    location: {
      line1: "Gees Yard, Coychurch Road",
      town: "Bridgend",
      county: "Mid Glamorgan",
      postcode: "CF31 3AP",
      directions: "Opposite the entrance to Asda Bridgend",
    },
    // CF31 3AP (postcodes.io): the dealer pin on the map
    coords: { lat: 51.501575, lng: -3.572743 },
    socials: { facebook: "", instagram: "", linkedin: "", youtube: "" },
    phone: "01656 674620",
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
      "Swiss Vans is one of South Wales' leading van dealers, based in Bridgend and serving customers across Wales and the UK. Specialising in new and used van sales, van leasing, and contract hire, the team at Gees Yard has over 20 years of experience helping businesses and sole traders find the right commercial vehicle. From small car-derived vans to large Luton box vans, Swiss Vans stocks a wide range of makes and models with competitive pricing, flexible finance options, and no-pressure advice. Visit the Bridgend showroom on Coychurch Road, opposite Asda, or browse the current stock online.",
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
    featured: true,
    googleRating: null,
    googleReviewCount: null,
  },

  "acme-road-runner-vans": {
    name: "ACME Road Runner Vans",
    slug: "acme-road-runner-vans",
    dealskiTenant: "",
    location: {
      line1: "Unit 7, Rowley Drive Industrial Estate",
      town: "Coventry",
      county: "West Midlands",
      postcode: "CV3 4FJ",
    },
    phone: "(024) 7600 0000",
    whatsapp: null,
    featured: false,
    websites: [
      { label: "acmeroadrunnervans.co.uk", url: "https://acmeroadrunnervans.co.uk" },
    ],
    hours: {
      mon: { open: "08:30", close: "17:30" },
      tue: { open: "08:30", close: "17:30" },
      wed: { open: "08:30", close: "17:30" },
      thu: { open: "08:30", close: "17:30" },
      fri: { open: "08:30", close: "17:00" },
      sat: { open: "09:00", close: "13:00" },
      sun: null,
    },
    about:
      "ACME Road Runner Vans is a Coventry-based commercial vehicle dealer with a hand-picked selection of panel vans, dropsides and specialist conversions. We pride ourselves on transparent pricing, thorough prep and no-pressure sales. [Demo dealer — replace with real copy when onboarding.]",
    services: [
      "Used van sales",
      "Van preparation & PDI",
      "Part exchange welcome",
      "Fleet supply",
    ],
    sellerNames: ["ACME Road Runner Vans"],
    googleRating: null,
    googleReviewCount: null,
  },
};

/** True when the seller's dealer is in the featured set. */
export function isFeaturedSeller(sellerName: string): boolean {
  return getDealerConfigBySeller(sellerName)?.featured === true;
}

/** Look up dealer config by the seller name appearing in a Dealski listing.
 *  Also matches the dealskiTenant slug so marketplace listings that carry a
 *  tenant slug as their seller name (e.g. "swissvans") still resolve. */
export function getDealerConfigBySeller(sellerName: string): DealerConfig | null {
  const lower = sellerName.trim().toLowerCase();
  return (
    Object.values(DEALERS).find(
      (d) =>
        d.sellerNames.some((n) => n.toLowerCase() === lower) ||
        (d.dealskiTenant && d.dealskiTenant.toLowerCase() === lower),
    ) ?? null
  );
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
