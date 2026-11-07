/**
 * The standalone landing pages (including the two finance_sub guides). Pure data, no I/O. H1, meta title, meta description and canonical are fixed here; the body is vansales-backend's content_pages row (page_type guide), written by Gemini.
 * Keep the backend slugs in step with vansales-backend App\Support\LandingPageDefs.
 * `kind: "buying"` pages carry an ItemList of live stock; `kind: "guide"` pages carry an Article.
 * A landing page is a guide row in content_pages, so the blog would list it too: LANDING_BACKEND_SLUGS keeps it out of /blog and its sitemap, and /blog/{slug} is a 301 to the real URL (next.config.ts).
 */
export interface LandingLink { href: string; label: string }

export interface LandingDef {
  /** URL-safe key used by the route. */
  key: string;
  /** content_pages.slug in vansales-backend. */
  backendSlug: string;
  path: string;
  h1: string;
  title: string;
  description: string;
  kind: "buying" | "guide";
  eyebrow: string;
  /** Links UP to money pages (at least two each). */
  related: readonly LandingLink[];
  /** Buying pages only: which live listings belong on the page. */
  /** Buying pages only: the listings API price cap (GBP, inclusive). */
  maxPrice?: number;
  match?: (l: { fuel: string; location: { town: string; region: string; postcode_area?: string } }) => boolean;
}

const FINANCE: LandingLink = { href: "/van-finance", label: "Van finance" };

export const LANDING_PAGES: readonly LandingDef[] = [
  {
    key: "van-lease-deals", backendSlug: "van-lease-deals", path: "/van-lease-deals", kind: "guide", eyebrow: "Van leasing",
    h1: "Van Lease Deals: What You're Actually Getting",
    title: "Van Lease Deals UK | Vansales.com",
    description: "Straight talk on van lease deals in the UK — what to look for, what to avoid, and whether leasing beats buying for your business.",
    related: [FINANCE, { href: "/hire-purchase-vans", label: "Hire purchase vans" }, { href: "/used-vans/ford/transit-for-sale", label: "Used Ford Transit for sale" }, { href: "/used-vans/volkswagen/transporter-for-sale", label: "Used VW Transporter for sale" }],
  },
  {
    key: "electric-vans", backendSlug: "electric-vans", path: "/electric-vans", kind: "buying", eyebrow: "Electric vans",
    h1: "Electric Vans For Sale UK",
    title: "Used Electric Vans For Sale UK | Vansales.com",
    description: "Browse used electric vans for sale in the UK. Honest guide to range, charging, costs and which models are worth buying.",
    related: [FINANCE, { href: "/used-vans/vauxhall/vivaro-for-sale", label: "Used Vauxhall Vivaro for sale" }, { href: "/used-vans/mercedes-benz/sprinter-for-sale", label: "Used Mercedes Sprinter for sale" }, { href: "/vans/ulez", label: "ULEZ-compliant vans" }],
    match: (l) => /electric/i.test(l.fuel),
  },
  {
    key: "london", backendSlug: "vans-for-sale-london", path: "/vans-for-sale/london", kind: "buying", eyebrow: "Vans by region",
    h1: "Used Vans For Sale in London",
    title: "Vans For Sale London | Used Commercial Vans | Vansales.com",
    description: "Used vans for sale in London. ULEZ-compliant stock, Euro 6 diesel and electric vans from verified dealers. Honest London van buying guide.",
    related: [FINANCE, { href: "/used-vans/ford/transit-custom-for-sale", label: "Used Ford Transit Custom for sale" }, { href: "/used-vans/vauxhall/vivaro-for-sale", label: "Used Vauxhall Vivaro for sale" }, { href: "/vans/ulez", label: "ULEZ-compliant vans" }],
    match: (l) => /london/i.test(`${l.location.region} ${l.location.town}`),
  },
  {
    key: "hire-purchase-vans", backendSlug: "hire-purchase-vans", path: "/hire-purchase-vans", kind: "guide", eyebrow: "Van finance",
    h1: "Hire Purchase Vans UK",
    title: "Hire Purchase Vans | Van Finance | Vansales.com",
    description: "Hire purchase vans explained. Fixed monthly payments, you own it at the end. How HP van finance works and what to expect.",
    related: [FINANCE, { href: "/van-lease-deals", label: "Van lease deals" }, { href: "/used-vans/ford/transit-custom-for-sale", label: "Used Ford Transit Custom for sale" }],
  },
  {
    key: "wales", backendSlug: "vans-for-sale-wales", path: "/vans-for-sale/wales", kind: "buying", eyebrow: "Vans by region",
    h1: "Used Vans For Sale in Wales",
    title: "Vans For Sale Wales | Used Commercial Vans | Vansales.com",
    description: "Used vans for sale in Wales. Browse stock from verified dealers. Local buying guide covering Cardiff, Swansea, Newport and beyond.",
    related: [FINANCE, { href: "/electric-vans", label: "Used electric vans for sale" }, { href: "/used-vans/ford/transit-custom-for-sale", label: "Used Ford Transit Custom for sale" }, { href: "/used-vans/body-type/4x4-for-sale", label: "Used 4x4 vans for sale" }],
    match: (l) => /wales|cardiff|swansea|newport|wrexham/i.test(`${l.location.region} ${l.location.town}`) || ["CF", "SA", "NP", "LL"].includes((l.location.postcode_area ?? "").toUpperCase()),
  },
  {
    key: "bristol", backendSlug: "vans-for-sale-bristol", path: "/vans-for-sale/bristol", kind: "buying", eyebrow: "Vans by region",
    h1: "Used Vans For Sale in Bristol",
    title: "Vans For Sale Bristol | Used Commercial Vans | Vansales.com",
    description: "Used vans for sale in Bristol. CAZ-compliant stock, Euro 6 diesel and electric vans. Honest Bristol van buying guide.",
    related: [FINANCE, { href: "/electric-vans", label: "Used electric vans for sale" }, { href: "/used-vans/vauxhall/vivaro-for-sale", label: "Used Vauxhall Vivaro for sale" }, { href: "/vans/ulez", label: "ULEZ-compliant vans" }],
    match: (l) => /bristol/i.test(`${l.location.region} ${l.location.town}`) || (l.location.postcode_area ?? "").toUpperCase() === "BS",
  },
  {
    key: "vans-for-sale-under-5000", backendSlug: "vans-for-sale-under-5000", path: "/vans-for-sale-under-5000", kind: "buying", eyebrow: "Budget", maxPrice: 4999,
    h1: "Used Vans For Sale Under £5,000",
    title: "Vans For Sale Under £5000 | Used Vans UK | Vansales.com",
    description: "Used vans for sale under £5,000. Browse affordable stock and read our honest guide to what your budget actually gets you.",
    related: [FINANCE, { href: "/vans-for-sale-under-10000", label: "Used vans under £10,000" }, { href: "/used-vans/ford/transit-connect-for-sale", label: "Used Ford Transit Connect for sale" }, { href: "/used-vans/ford/transit-for-sale", label: "Used Ford Transit for sale" }],
  },
  {
    key: "vans-for-sale-under-10000", backendSlug: "vans-for-sale-under-10000", path: "/vans-for-sale-under-10000", kind: "buying", eyebrow: "Budget", maxPrice: 9999,
    h1: "Used Vans For Sale Under £10,000",
    title: "Vans For Sale Under £10000 | Used Vans UK | Vansales.com",
    description: "Used vans for sale under £10,000. Browse stock and read our guide to the best used vans at this budget in 2026.",
    related: [FINANCE, { href: "/vans-for-sale-under-15000", label: "Used vans under £15,000" }, { href: "/used-vans/ford/transit-custom-for-sale", label: "Used Ford Transit Custom for sale" }, { href: "/used-vans/volkswagen/transporter-for-sale", label: "Used VW Transporter for sale" }],
  },
  {
    key: "vans-for-sale-under-15000", backendSlug: "vans-for-sale-under-15000", path: "/vans-for-sale-under-15000", kind: "buying", eyebrow: "Budget", maxPrice: 14999,
    h1: "Used Vans For Sale Under £15,000",
    title: "Vans For Sale Under £15000 | Used Vans UK | Vansales.com",
    description: "Used vans for sale under £15,000. The sweet spot budget. Browse stock and read our guide to the best used van value in 2026.",
    related: [FINANCE, { href: "/van-lease-deals", label: "Van lease deals" }, { href: "/used-vans/ford/transit-custom-for-sale", label: "Used Ford Transit Custom for sale" }, { href: "/used-vans/mercedes-benz/sprinter-for-sale", label: "Used Mercedes Sprinter for sale" }],
  },
  {
    key: "bad-credit-van-finance", backendSlug: "bad-credit-van-finance", path: "/bad-credit-van-finance", kind: "guide", eyebrow: "Van finance",
    h1: "Bad Credit Van Finance",
    title: "Bad Credit Van Finance UK | Vansales.com",
    description: "Van finance with a poor credit history: how it works, who can apply, what to watch for and how to apply. A plain guide for tradespeople.",
    related: [FINANCE, { href: "/hire-purchase-vans", label: "Hire purchase vans" }, { href: "/van-lease-deals", label: "Van lease deals" }, { href: "/van-finance-calculator", label: "Van finance calculator" }],
  },
  {
    key: "van-finance-calculator", backendSlug: "van-finance-calculator", path: "/van-finance-calculator", kind: "guide", eyebrow: "Van finance",
    h1: "Van Finance Calculator",
    title: "Van Finance Calculator UK | Vansales.com",
    description: "How a van finance calculator works, what to put in it and how to read the result. A plain guide for tradespeople and small businesses.",
    related: [FINANCE, { href: "/hire-purchase-vans", label: "Hire purchase vans" }, { href: "/bad-credit-van-finance", label: "Bad credit van finance" }, { href: "/used-vans/ford/transit-custom-for-sale", label: "Used Ford Transit Custom for sale" }],
  },
  {
    key: "manchester", backendSlug: "vans-for-sale-manchester", path: "/vans-for-sale/manchester", kind: "buying", eyebrow: "Vans by region",
    h1: "Used Vans For Sale in Manchester",
    title: "Vans For Sale Manchester | Used Vans | Vansales.com",
    description: "Used vans for sale in Manchester. Browse stock from verified dealers. Local buying guide covering Manchester, Salford, Stockport and Bolton.",
    related: [FINANCE, { href: "/electric-vans", label: "Used electric vans for sale" }, { href: "/used-vans/ford/transit-custom-for-sale", label: "Used Ford Transit Custom for sale" }, { href: "/vans-for-sale/leeds", label: "Used vans for sale in Leeds" }],
    match: (l) => /\b(manchester|salford|stockport|oldham|bolton|rochdale|wigan|trafford|tameside|greater manchester)\b/i.test(`${l.location.region} ${l.location.town}`) || ["M", "SK", "OL", "BL", "WN"].includes((l.location.postcode_area ?? "").toUpperCase()),
  },
  {
    key: "birmingham", backendSlug: "vans-for-sale-birmingham", path: "/vans-for-sale/birmingham", kind: "buying", eyebrow: "Vans by region",
    h1: "Used Vans For Sale in Birmingham",
    title: "Vans For Sale Birmingham | Used Vans | Vansales.com",
    description: "Used vans for sale in Birmingham. Browse stock from verified dealers. Local buying guide covering Birmingham, Wolverhampton, Solihull and the Black Country.",
    related: [FINANCE, { href: "/electric-vans", label: "Used electric vans for sale" }, { href: "/used-vans/ford/transit-for-sale", label: "Used Ford Transit for sale" }, { href: "/vans-for-sale/manchester", label: "Used vans for sale in Manchester" }],
    match: (l) => /\b(birmingham|solihull|wolverhampton|walsall|dudley|west bromwich|sandwell|west midlands)\b/i.test(`${l.location.region} ${l.location.town}`) || ["B", "WV", "DY", "WS"].includes((l.location.postcode_area ?? "").toUpperCase()),
  },
  {
    key: "leeds", backendSlug: "vans-for-sale-leeds", path: "/vans-for-sale/leeds", kind: "buying", eyebrow: "Vans by region",
    h1: "Used Vans For Sale in Leeds",
    title: "Vans For Sale Leeds | Used Commercial Vans | Vansales.com",
    description: "Used vans for sale in Leeds. Browse stock from verified dealers. Local buying guide covering Leeds, Bradford, Wakefield and Huddersfield.",
    related: [FINANCE, { href: "/electric-vans", label: "Used electric vans for sale" }, { href: "/used-vans/vauxhall/vivaro-for-sale", label: "Used Vauxhall Vivaro for sale" }, { href: "/vans-for-sale/manchester", label: "Used vans for sale in Manchester" }],
    match: (l) => /\b(leeds|bradford|wakefield|huddersfield|halifax|west yorkshire)\b/i.test(`${l.location.region} ${l.location.town}`) || ["LS", "BD", "WF", "HX", "HD"].includes((l.location.postcode_area ?? "").toUpperCase()),
  },
  {
    key: "scotland", backendSlug: "vans-for-sale-scotland", path: "/vans-for-sale/scotland", kind: "buying", eyebrow: "Vans by region",
    h1: "Used Vans For Sale in Scotland",
    title: "Vans For Sale Scotland | Used Commercial Vans | Vansales.com",
    description: "Used vans for sale in Scotland. Browse stock from verified dealers. Local buying guide covering Glasgow, Edinburgh, Aberdeen and Dundee.",
    related: [FINANCE, { href: "/used-vans/body-type/4x4-for-sale", label: "Used 4x4 vans for sale" }, { href: "/used-vans/toyota/hilux-for-sale", label: "Used Toyota Hilux for sale" }, { href: "/electric-vans", label: "Used electric vans for sale" }],
    match: (l) => /\b(scotland|glasgow|edinburgh|aberdeen|dundee|inverness|stirling|perth|fife|lanarkshire|ayrshire)\b/i.test(`${l.location.region} ${l.location.town}`) || ["AB", "DD", "DG", "EH", "FK", "G", "HS", "IV", "KA", "KW", "KY", "ML", "PA", "PH", "TD", "ZE"].includes((l.location.postcode_area ?? "").toUpperCase()),
  },
];

export const LANDING_BACKEND_SLUGS: ReadonlySet<string> = new Set(LANDING_PAGES.map((p) => p.backendSlug));

/** /vans-for-sale/{region}: the regions that have a page. */
export const REGION_KEYS: readonly string[] = ["london", "wales", "bristol", "manchester", "birmingham", "leeds", "scotland"];

export const findLanding = (key: string) => LANDING_PAGES.find((p) => p.key === key);
export const findRegion = (region: string) => (REGION_KEYS.includes(region) ? findLanding(region) : undefined);
