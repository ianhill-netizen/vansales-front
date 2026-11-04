import type { ListingFilters } from "@/lib/listings/types";

/* =============================================================================
   CATEGORY PAGES — /vans/panel-van, /vans/luton … /vans/electric, /vans/ulez.
   One definition per page; app/(main)/vans/<slug>/page.tsx are thin wrappers
   around components/seo/category-page.tsx. `seedModels` backs the "Popular
   models" links when stock is thin (stocked models always come first).
   ============================================================================= */

export interface CategoryDef {
  slug: string;
  kind: "body" | "fuel" | "zone";
  /** Plural label used in links and headings, e.g. "Panel vans". */
  label: string;
  /** Singular lower-case noun, e.g. "panel van". */
  singular: string;
  eyebrow: string;
  title: string;
  description: string;
  intro: string;
  filter: Pick<ListingFilters, "bodyStyle" | "fuel" | "ulez">;
  blogKeywords: string[];
  seedModels: [string, string][];
}

export const CATEGORIES: CategoryDef[] = [
  {
    slug: "panel-van",
    kind: "body",
    label: "Panel vans",
    singular: "panel van",
    eyebrow: "Body type",
    title: "Panel Vans for Sale",
    description: "Browse panel vans for sale across the UK. All sizes from compact city vans to high-roof LWB panel vans. Filter by make, price and wheelbase.",
    intro: "The workhorse of the van world. Panel vans offer an enclosed load area, low running costs and year-round weather protection for your cargo. Available in short, medium and long wheelbase with low, medium and high roof options.",
    filter: { bodyStyle: "Panel Van" },
    blogKeywords: ["transit", "sprinter", "transporter", "vivaro", "crafter", "berlingo", "dispatch", "expert", "ducato", "master", "kangoo"],
    seedModels: [["ford", "transit"], ["ford", "transit-custom"], ["mercedes-benz", "sprinter"], ["volkswagen", "transporter"], ["vauxhall", "vivaro"], ["renault", "trafic"], ["renault", "master"], ["peugeot", "expert"], ["citroen", "dispatch"], ["fiat", "ducato"]],
  },
  {
    slug: "luton",
    kind: "body",
    label: "Luton vans",
    singular: "Luton van",
    eyebrow: "Body type",
    title: "Luton Vans for Sale",
    description: "Browse Luton box vans for sale. High cube volume, tail-lift options, ideal for removals and furniture delivery. Ford, Mercedes, Renault, Iveco and more.",
    intro: "Luton box vans offer the highest cubic load capacity of any van body type, making them the go-to choice for removals, furniture delivery and logistics. Often fitted with a tail-lift for easy loading without a dock.",
    filter: { bodyStyle: "Luton" },
    blogKeywords: ["luton", "box van", "removal", "tail-lift", "tail lift"],
    seedModels: [["ford", "transit"], ["mercedes-benz", "sprinter"], ["renault", "master"], ["iveco", "daily"], ["peugeot", "boxer"], ["citroen", "relay"], ["fiat", "ducato"], ["vauxhall", "movano"]],
  },
  {
    slug: "tipper",
    kind: "body",
    label: "Tipper vans",
    singular: "tipper van",
    eyebrow: "Body type",
    title: "Tipper Vans for Sale",
    description: "Browse tipper vans and trucks for sale. Single and double-axle tippers for landscaping, waste removal, construction and agriculture. All makes and prices.",
    intro: "Tippers are built for heavy-duty loose loads — aggregate, soil, spoil and green waste. A hydraulic tipping body makes unloading fast and effortless. Ideal for groundworkers, landscapers, waste contractors and farmers.",
    filter: { bodyStyle: "Tipper" },
    blogKeywords: ["tipper", "dropside", "chassis", "flatbed"],
    seedModels: [["ford", "transit"], ["iveco", "daily"], ["mercedes-benz", "sprinter"], ["renault", "master"], ["fiat", "ducato"], ["vauxhall", "movano"], ["peugeot", "boxer"], ["citroen", "relay"]],
  },
  {
    slug: "dropside",
    kind: "body",
    label: "Dropside vans",
    singular: "dropside van",
    eyebrow: "Body type",
    title: "Dropside Vans for Sale",
    description: "Browse dropside vans for sale. Open flat-bed body with fold-down sides for easy side loading. Perfect for plant hire, builders and landscapers.",
    intro: "Dropside vans combine the manoeuvrability of a van cab with an open flat-bed platform body whose sides fold down for unrestricted side-loading. Ideal for palletised goods, scaffolding, timber, machinery and anything that won't fit through van doors.",
    filter: { bodyStyle: "Dropside" },
    blogKeywords: ["dropside", "flatbed", "tipper", "chassis", "platform"],
    seedModels: [["ford", "transit"], ["iveco", "daily"], ["mercedes-benz", "sprinter"], ["renault", "master"], ["fiat", "ducato"], ["vauxhall", "movano"], ["peugeot", "boxer"], ["citroen", "relay"]],
  },
  {
    slug: "crew-van",
    kind: "body",
    label: "Crew vans",
    singular: "crew van",
    eyebrow: "Body type",
    title: "Crew Vans for Sale",
    description: "Browse crew vans and crew cab vans for sale. Dual-purpose vans with extra passenger seating plus a load area — ideal for teams that need transport and cargo capacity.",
    intro: "Crew vans (also known as crew cabs or combi vans) seat up to 6–7 people with a separate load area behind. Perfect for contractors and tradespeople who need to carry both staff and equipment in a single vehicle.",
    filter: { bodyStyle: "Crew Cab" },
    blogKeywords: ["crew", "combi", "transit custom", "vito", "trafic"],
    seedModels: [["ford", "transit-custom"], ["mercedes-benz", "vito"], ["renault", "trafic"], ["vauxhall", "vivaro"], ["volkswagen", "transporter"], ["peugeot", "expert"], ["citroen", "dispatch"], ["toyota", "proace"]],
  },
  {
    slug: "pickup",
    kind: "body",
    label: "Pickup trucks",
    singular: "pickup truck",
    eyebrow: "Body type",
    title: "Pickup Trucks for Sale",
    description: "Browse pickup trucks for sale across the UK. Single and double-cab pickups, new and used. Ford Ranger, Toyota Hilux, VW Amarok and more. Van-rate road tax.",
    intro: "Pickup trucks combine off-road capability with serious towing and payload ratings. Available as single or double cab, they're equally at home on a farm, construction site or towing a horsebox. Many qualify for van-rate road tax.",
    filter: { bodyStyle: "Pickup" },
    blogKeywords: ["ranger", "pickup", "hilux", "amarok", "4x4", "off-road", "canopy"],
    seedModels: [["ford", "ranger"], ["toyota", "hilux"], ["mitsubishi", "l200"], ["nissan", "navara"], ["volkswagen", "amarok"], ["isuzu", "d-max"], ["ssangyong", "musso"]],
  },
  {
    slug: "minibus",
    kind: "body",
    label: "Minibuses",
    singular: "minibus",
    eyebrow: "Body type",
    title: "Minibuses & People Carriers for Sale",
    description: "Browse minibuses and people carriers for sale in the UK. 9-17 seat configurations, wheelchair accessible, school and private hire. Ford Tourneo, Iveco Daily, VW Transporter Kombi and more.",
    intro: "From 9-seat people carriers to 17-seat coaches, minibuses serve schools, care homes, private hire operators and community groups. Many come in wheelchair-accessible (WAV) configurations. Popular models include the Ford Tourneo Custom, Iveco Daily Minibus and VW Transporter Kombi.",
    filter: { bodyStyle: "Minibus" },
    blogKeywords: ["minibus", "tourneo", "people carrier", "transit custom"],
    seedModels: [["ford", "transit"], ["ford", "tourneo-custom"], ["mercedes-benz", "sprinter"], ["volkswagen", "transporter"], ["renault", "trafic"], ["citroen", "relay"], ["fiat", "ducato"], ["iveco", "daily"]],
  },
  {
    slug: "chassis-cab",
    kind: "body",
    label: "Chassis cabs",
    singular: "chassis cab",
    eyebrow: "Body type",
    title: "Chassis Cab Vans for Sale",
    description: "Chassis cab vans for specialist conversions — dropsides, tippers, curtainsiders, box bodies and more. Single and double cab. Ford Transit, Mercedes Sprinter, Iveco Daily in stock.",
    intro: "A chassis cab is the base for specialist bodywork — dropsides, tippers, curtainsiders, horsebox conversions, box bodies and refrigerated units. The cab-forward design maximises payload whilst keeping the GVW at 3.5t. Popular chassis: Ford Transit, Mercedes Sprinter, Iveco Daily and Renault Master.",
    filter: { bodyStyle: "Chassis Cab" },
    blogKeywords: ["tipper", "dropside", "chassis", "luton", "flatbed"],
    seedModels: [["ford", "transit"], ["iveco", "daily"], ["mercedes-benz", "sprinter"], ["renault", "master"], ["fiat", "ducato"], ["vauxhall", "movano"], ["peugeot", "boxer"], ["citroen", "relay"]],
  },
  {
    slug: "electric",
    kind: "fuel",
    label: "Electric vans",
    singular: "electric van",
    eyebrow: "Fuel type",
    title: "Electric Vans for Sale",
    description: "Browse electric vans for sale in the UK. Zero-emission panel vans, crew vans and pickups. Ford E-Transit, VW e-Crafter, Citroën ë-Berlingo and more. ULEZ-exempt, low running costs.",
    intro: "Electric vans deliver zero tailpipe emissions, lower running costs and exemption from ULEZ and Clean Air Zone charges. Modern ranges of 100–200 miles suit most urban delivery and trade routes. Choose from pure BEV panel vans, crew vans and small vans — or a plug-in hybrid for mixed duty cycles.",
    filter: { fuel: "electric" },
    blogKeywords: ["electric", "ev", "id buzz", "e-transit", "zero emission", "charging"],
    seedModels: [["ford", "e-transit"], ["ford", "e-transit-custom"], ["mercedes-benz", "esprinter"], ["mercedes-benz", "evito"], ["volkswagen", "id-buzz-cargo"], ["vauxhall", "vivaro-e"], ["renault", "kangoo-e-tech-electric"], ["peugeot", "e-expert"], ["citroen", "e-berlingo"], ["fiat", "e-ducato"]],
  },
  {
    slug: "ulez",
    kind: "zone",
    label: "ULEZ-compliant vans",
    singular: "ULEZ-compliant van",
    eyebrow: "Clean air zones",
    title: "ULEZ-Compliant Vans for Sale",
    description: "Browse ULEZ-compliant vans for sale. Euro 6 diesel and electric vans exempt from London ULEZ and Clean Air Zone charges. All makes and body types.",
    intro: "The Ultra Low Emission Zone (ULEZ) covers all of Greater London 24 hours a day. Vans that fail to meet Euro 6 (diesel) or Euro 3 (petrol) standards pay a daily charge. All electric vans are automatically exempt. Newer diesels from 2016 onwards generally qualify — but always verify against the official TfL checker before buying.",
    filter: { ulez: true },
    blogKeywords: ["ulez", "euro 6", "emission", "clean air", "electric", "ev"],
    seedModels: [["ford", "transit-custom"], ["ford", "transit"], ["vauxhall", "vivaro"], ["mercedes-benz", "vito"], ["renault", "trafic"], ["volkswagen", "transporter"], ["ford", "transit-connect"], ["peugeot", "partner"]],
  },
];

export const BODY_TYPES = CATEGORIES.filter((c) => c.kind === "body");

export function getCategory(slug: string): CategoryDef {
  const c = CATEGORIES.find((x) => x.slug === slug);
  if (!c) throw new Error(`Unknown category page: ${slug}`);
  return c;
}
