/**
 * The /used-vans/body-type/{slug} pages: ten body types and equipment types with their own search demand (luton, dropside, tipper, curtain side, refrigerated, crew van, high roof, long wheelbase, 4x4,
 * wheelchair accessible). Pure data and matching rules, no I/O. The copy (H1, meta, 150-word blurb, two pictures) lives in vansales-backend's body_type_pages table; this file only decides which of the
 * live listings belong on a page and which pages/models it links to. A slug that is not here is a 404, whatever the API holds.
 */
import { matchesFilter, type FilterDefinition } from "./filter-definition.ts";

export interface BodyTypeListing {
  make: string;
  model: string;
  derivative: string;
  features?: string[];
  van_spec: { body_style: string; wheelbase: string | null; roof_height: string | null };
  mileage?: number | null;
  transmission?: string;
  price_type?: string;
  vat_status?: string | null;
}

export interface BodyTypeDef {
  slug: string;
  /** Plural noun, e.g. "Luton vans": breadcrumb and links. */
  label: string;
  /** Singular noun for "Looking for a used ___". */
  singular: string;
  /** The stock-driven /vans/{category} page that covers the same body type, when there is one. */
  vansCategory?: string;
  /** Models (make slug, model slug) worth linking to; only those with a live /used-vans page are rendered. */
  models: ReadonlyArray<readonly [string, string]>;
  match: (l: BodyTypeListing) => boolean;
  /** The page's filter as data (the same JSON as vansales-backend body_type_pages.filter_definition, which the page prefers when the API returns one). `match` is built from it. */
  filter?: FilterDefinition;
  /** Facet pages: a title and meta description of their own (the generic "Used {label} For Sale | Vansales.com" pattern does not suit them). */
  title?: string;
  description?: string;
}

const byFilter = (filter: FilterDefinition) => (l: BodyTypeListing) => matchesFilter(filter, l);
const FOUR_BY_FOUR: FilterDefinition = { any: [{ text: ["4x4", "4wd", "awd", "four wheel", "four-wheel", "fourwheel"] }, { make: "land rover", model: "defender" }] };
const SMALL: FilterDefinition = { size: "small" };
const LARGE: FilterDefinition = { size: "large" };
const AUTOMATIC: FilterDefinition = { gearbox: "automatic" };
const COMBI: FilterDefinition = { body: ["combi", "crew"] };
const NO_VAT: FilterDefinition = { vat_qualifying: false };

const hay = (l: BodyTypeListing) => [l.make, l.model, l.derivative, l.van_spec.body_style, ...(l.features ?? [])].join(" ").toLowerCase();
const rx = (re: RegExp) => (l: BodyTypeListing) => re.test(hay(l));

export const BODY_TYPE_PAGES: readonly BodyTypeDef[] = [
  { slug: "luton", label: "Luton vans", singular: "Luton van", vansCategory: "luton", models: [["ford", "transit"], ["iveco", "daily"], ["renault", "master"], ["peugeot", "boxer"], ["citroen", "relay"], ["fiat", "ducato"], ["vauxhall", "movano"]], match: rx(/\bluton\b/) },
  { slug: "dropside", label: "dropside vans", singular: "dropside van", vansCategory: "dropside", models: [["ford", "transit"], ["iveco", "daily"], ["renault", "master"], ["peugeot", "boxer"], ["vauxhall", "movano"]], match: rx(/drop\s?-?side/) },
  { slug: "tipper", label: "tipper vans", singular: "tipper van", vansCategory: "tipper", models: [["ford", "transit"], ["iveco", "daily"], ["renault", "master"], ["peugeot", "boxer"], ["vauxhall", "movano"]], match: rx(/tipper/) },
  { slug: "curtain-side", label: "curtain side vans", singular: "curtain side van", models: [["iveco", "daily"], ["ford", "transit"], ["renault", "master"], ["fiat", "ducato"]], match: rx(/curtain\s?-?side/) },
  { slug: "refrigerated", label: "refrigerated vans", singular: "refrigerated van", models: [["ford", "transit"], ["ford", "transit-connect"], ["renault", "master"], ["peugeot", "boxer"], ["volkswagen", "caddy"], ["citroen", "berlingo"]], match: rx(/refrigerat|fridge|chiller|freezer/) },
  { slug: "crew-van", label: "crew vans", singular: "crew van", vansCategory: "crew-van", models: [["ford", "transit-custom"], ["volkswagen", "transporter"], ["vauxhall", "vivaro"], ["renault", "trafic"], ["ford", "transit"], ["mercedes-benz", "vito"]], match: (l) => /crew|double\s?cab|\bdciv\b/.test(hay(l)) },
  { slug: "high-roof", label: "high roof vans", singular: "high roof van", models: [["ford", "transit"], ["mercedes-benz", "sprinter"], ["volkswagen", "crafter"], ["renault", "master"], ["fiat", "ducato"], ["peugeot", "boxer"]], match: (l) => l.van_spec.roof_height === "high" || /high\s?roof/.test(hay(l)) },
  { slug: "long-wheelbase", label: "long wheelbase vans", singular: "long wheelbase van", models: [["ford", "transit"], ["mercedes-benz", "sprinter"], ["volkswagen", "crafter"], ["renault", "master"], ["vauxhall", "movano"], ["iveco", "daily"]], match: (l) => l.van_spec.wheelbase === "lwb" || l.van_spec.wheelbase === "xlwb" || /\blwb\b|long\s?wheel\s?base/.test(hay(l)) },
  { slug: "4x4", label: "4x4 vans", singular: "4x4 van", models: [["land-rover", "defender"], ["toyota", "hilux"], ["nissan", "navara"], ["mitsubishi", "l200"], ["ford", "ranger"], ["volkswagen", "amarok"]], filter: FOUR_BY_FOUR, match: byFilter(FOUR_BY_FOUR) },
  { slug: "tail-lift", label: "tail lift vans", singular: "tail lift van", models: [["ford", "transit"], ["iveco", "daily"], ["renault", "master"], ["peugeot", "boxer"], ["mercedes-benz", "sprinter"], ["fiat", "ducato"]], match: rx(/tail\s?-?lift|taillift/) },
  { slug: "low-mileage", label: "low mileage vans", singular: "low mileage van", models: [["ford", "transit-custom"], ["ford", "transit"], ["volkswagen", "transporter"], ["vauxhall", "vivaro"], ["renault", "trafic"], ["ford", "ranger"]], match: (l) => l.mileage != null && l.mileage > 0 && l.mileage < 30000 },
  { slug: "panel-van", label: "panel vans", singular: "panel van", vansCategory: "panel-van", models: [["ford", "transit"], ["ford", "transit-custom"], ["volkswagen", "transporter"], ["vauxhall", "vivaro"], ["mercedes-benz", "sprinter"], ["renault", "trafic"]], match: (l) => /panel\s?van/.test(l.van_spec.body_style.toLowerCase()) },
  { slug: "pickup", label: "pickup trucks", singular: "pickup truck", vansCategory: "pickup", models: [["ford", "ranger"], ["toyota", "hilux"], ["nissan", "navara"], ["mitsubishi", "l200"], ["volkswagen", "amarok"], ["isuzu", "d-max"]], match: rx(/pick\s?-?up|double\s?cab|single\s?cab|king\s?cab|extra\s?cab/) },
  { slug: "minibus", label: "minibuses", singular: "minibus", vansCategory: "minibus", models: [["ford", "transit"], ["mercedes-benz", "sprinter"], ["volkswagen", "crafter"], ["renault", "master"], ["peugeot", "boxer"], ["fiat", "ducato"]], match: rx(/mini\s?-?bus|\b(?:9|12|14|15|16)\s?-?seat/) },
  { slug: "chassis-cab", label: "chassis cabs", singular: "chassis cab", vansCategory: "chassis-cab", models: [["ford", "transit"], ["iveco", "daily"], ["renault", "master"], ["peugeot", "boxer"], ["mercedes-benz", "sprinter"]], match: rx(/chassis\s?-?cab|cab\s?-?chassis/) },
  { slug: "wheelchair-accessible", label: "wheelchair accessible vans", singular: "wheelchair accessible van", models: [["volkswagen", "caddy"], ["ford", "transit-connect"], ["peugeot", "partner"], ["citroen", "berlingo"], ["fiat", "doblo"], ["renault", "kangoo"]], match: rx(/wheelchair|\bwav\b|accessible/) },
  // Facet pages (2026-11-13): the same template, filtered by size, gearbox, body or VAT status (lib/used-vans/filter-definition.ts).
  { slug: "small-vans", label: "small vans", singular: "small van", models: [["volkswagen", "caddy"], ["citroen", "berlingo"], ["renault", "kangoo"], ["ford", "transit-connect"], ["peugeot", "partner"], ["vauxhall", "combo"]], filter: SMALL, match: byFilter(SMALL), title: "Small Vans for Sale | Used Small Vans UK | Vansales", description: "Small vans: car-derived and compact panel vans for tradespeople and couriers. Browse used small vans for sale from verified UK dealers on Vansales.com." },
  { slug: "large-vans", label: "large vans", singular: "large van", models: [["ford", "transit"], ["mercedes-benz", "sprinter"], ["volkswagen", "crafter"], ["renault", "master"], ["vauxhall", "movano"], ["fiat", "ducato"]], filter: LARGE, match: byFilter(LARGE), title: "Large Vans for Sale | Used Large Vans UK | Vansales", description: "Large vans for big loads and heavy payloads: used large vans for sale from verified UK dealers on Vansales.com. Compare size, payload and mileage." },
  { slug: "automatic-vans", label: "automatic vans", singular: "automatic van", models: [["ford", "transit-custom"], ["volkswagen", "transporter"], ["vauxhall", "vivaro"], ["mercedes-benz", "sprinter"], ["volkswagen", "caddy"], ["mercedes-benz", "vito"]], filter: AUTOMATIC, match: byFilter(AUTOMATIC), title: "Automatic Vans for Sale | Used Automatic Vans UK | Vansales", description: "Automatic vans for easier driving in town and on long runs. Browse used automatic vans for sale from verified UK dealers on Vansales.com." },
  { slug: "combi-vans", label: "combi vans", singular: "combi van", models: [["ford", "transit-custom"], ["volkswagen", "transporter"], ["vauxhall", "vivaro"], ["renault", "trafic"], ["mercedes-benz", "vito"], ["volkswagen", "caddy"]], filter: COMBI, match: byFilter(COMBI), title: "Combi Vans for Sale | Used Combi Vans UK | Vansales", description: "Combi vans carry people and a load: rear seats and windows with a loadspace. Browse used combi vans for sale from verified UK dealers on Vansales.com." },
  { slug: "no-vat-vans", label: "no VAT vans", singular: "van with no VAT", models: [["ford", "transit"], ["ford", "transit-custom"], ["volkswagen", "transporter"], ["vauxhall", "vivaro"], ["mercedes-benz", "sprinter"], ["volkswagen", "caddy"]], filter: NO_VAT, match: byFilter(NO_VAT), title: "Vans with No VAT for Sale | Used Vans UK | Vansales", description: "Used vans with no VAT to pay on the price: how it works, who it suits and what to check. Browse used vans for sale from verified UK dealers on Vansales.com." },
];

export function findBodyType(slug: string): BodyTypeDef | undefined {
  return BODY_TYPE_PAGES.find((b) => b.slug === slug);
}

/** /used-vans/body-type/{slug}-for-sale (the old /used-vans/body-type/{slug} is a 301 to it, see next.config.ts). */
export const bodyTypePath = (b: Pick<BodyTypeDef, "slug">) => `/used-vans/body-type/${b.slug}-for-sale`;
export const bodyTypeOldPath = (b: Pick<BodyTypeDef, "slug">) => `/used-vans/body-type/${b.slug}`;

/** The route's [slug] parameter ("luton-for-sale") to the body type; no -for-sale suffix = not a page. */
export function findBodyTypeByParam(param: string): BodyTypeDef | undefined {
  return param.endsWith("-for-sale") ? findBodyType(param.slice(0, -"-for-sale".length)) : undefined;
}

const titleCase = (s: string) => s.replace(/\b([a-z])/g, (c) => c.toUpperCase());
export const bodyTypeH1 = (b: Pick<BodyTypeDef, "label">) => `Used ${titleCase(b.label)} For Sale`;
export const bodyTypeTitle = (b: Pick<BodyTypeDef, "label" | "title">) => b.title ?? `${bodyTypeH1(b)} | Vansales.com`;
export const bodyTypeDescription = (b: Pick<BodyTypeDef, "label" | "description">) => b.description ?? `Browse used ${b.label} for sale from verified UK dealers. Compare prices, specs and mileage. No nonsense, straight-talking marketplace.`;
