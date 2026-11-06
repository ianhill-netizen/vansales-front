/**
 * The /used-vans/body-type/{slug} pages: ten body types and equipment types with their own search demand (luton, dropside, tipper, curtain side, refrigerated, crew van, high roof, long wheelbase, 4x4,
 * wheelchair accessible). Pure data and matching rules, no I/O. The copy (H1, meta, 150-word blurb, two pictures) lives in vansales-backend's body_type_pages table; this file only decides which of the
 * live listings belong on a page and which pages/models it links to. A slug that is not here is a 404, whatever the API holds.
 */
export interface BodyTypeListing {
  make: string;
  model: string;
  derivative: string;
  features?: string[];
  van_spec: { body_style: string; wheelbase: string | null; roof_height: string | null };
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
}

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
  { slug: "4x4", label: "4x4 vans", singular: "4x4 van", models: [["land-rover", "defender"], ["toyota", "hilux"], ["nissan", "navara"], ["mitsubishi", "l200"], ["ford", "ranger"], ["volkswagen", "amarok"]], match: (l) => /4x4|4wd|awd|four[\s-]?wheel/.test(hay(l)) || (/land rover/.test(l.make.toLowerCase()) && /defender/.test(l.model.toLowerCase())) },
  { slug: "wheelchair-accessible", label: "wheelchair accessible vans", singular: "wheelchair accessible van", models: [["volkswagen", "caddy"], ["ford", "transit-connect"], ["peugeot", "partner"], ["citroen", "berlingo"], ["fiat", "doblo"], ["renault", "kangoo"]], match: rx(/wheelchair|\bwav\b|accessible/) },
];

export function findBodyType(slug: string): BodyTypeDef | undefined {
  return BODY_TYPE_PAGES.find((b) => b.slug === slug);
}

export const bodyTypePath = (b: Pick<BodyTypeDef, "slug">) => `/used-vans/body-type/${b.slug}`;
