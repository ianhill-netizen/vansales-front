/**
 * The geography tree behind /vans-for-sale/{key}: nations -> the 12 UK regions -> cities (the 100,000+ cities, plus Inverness, Derry and Bridgend), then ~1,200 towns (towns.ts).
 * Scotland, Wales and Northern Ireland are both a nation and a region (one page each). London is a region and a city (one page). Pure data, no I/O.
 * Backend copy: content_pages slug `vans-for-sale-{key}` (page_type regional), written by the content pipeline.
 */
export type GeoKind = "nation" | "region" | "city";
export interface GeoNode { key: string; label: string; kind: GeoKind; nation: string; region: string | null }

export const NATIONS: readonly { key: string; label: string }[] = [
  { key: "england", label: "England" }, { key: "scotland", label: "Scotland" }, { key: "wales", label: "Wales" }, { key: "northern-ireland", label: "Northern Ireland" },
];

/** The 12 UK regions. The three non-English nations are their own region. */
export const REGIONS: readonly { key: string; label: string; nation: string }[] = [
  { key: "north-east", label: "North East", nation: "england" },
  { key: "north-west", label: "North West", nation: "england" },
  { key: "yorkshire-and-the-humber", label: "Yorkshire and the Humber", nation: "england" },
  { key: "east-midlands", label: "East Midlands", nation: "england" },
  { key: "west-midlands", label: "West Midlands", nation: "england" },
  { key: "east-of-england", label: "East of England", nation: "england" },
  { key: "london", label: "London", nation: "england" },
  { key: "south-east", label: "South East", nation: "england" },
  { key: "south-west", label: "South West", nation: "england" },
  { key: "scotland", label: "Scotland", nation: "scotland" },
  { key: "wales", label: "Wales", nation: "wales" },
  { key: "northern-ireland", label: "Northern Ireland", nation: "northern-ireland" },
];

/** [key, label, region]. Keys match scripts/build-places.py. */
export const CITIES: readonly (readonly [string, string, string])[] = [
  ["birmingham", "Birmingham", "west-midlands"], ["bradford", "Bradford", "yorkshire-and-the-humber"], ["brighton", "Brighton", "south-east"], ["bristol", "Bristol", "south-west"],
  ["cambridge", "Cambridge", "east-of-england"], ["coventry", "Coventry", "west-midlands"], ["derby", "Derby", "east-midlands"], ["exeter", "Exeter", "south-west"],
  ["gloucester", "Gloucester", "south-west"], ["hull", "Hull", "yorkshire-and-the-humber"], ["leeds", "Leeds", "yorkshire-and-the-humber"], ["leicester", "Leicester", "east-midlands"],
  ["liverpool", "Liverpool", "north-west"], ["manchester", "Manchester", "north-west"], ["newcastle", "Newcastle", "north-east"], ["norwich", "Norwich", "east-of-england"],
  ["nottingham", "Nottingham", "east-midlands"], ["oxford", "Oxford", "south-east"], ["peterborough", "Peterborough", "east-of-england"], ["plymouth", "Plymouth", "south-west"],
  ["portsmouth", "Portsmouth", "south-east"], ["preston", "Preston", "north-west"], ["salford", "Salford", "north-west"], ["sheffield", "Sheffield", "yorkshire-and-the-humber"],
  ["southampton", "Southampton", "south-east"], ["stoke-on-trent", "Stoke-on-Trent", "west-midlands"], ["sunderland", "Sunderland", "north-east"], ["wakefield", "Wakefield", "yorkshire-and-the-humber"],
  ["wolverhampton", "Wolverhampton", "west-midlands"], ["york", "York", "yorkshire-and-the-humber"], ["worcester", "Worcester", "west-midlands"], ["bath", "Bath", "south-west"],
  ["lincoln", "Lincoln", "east-midlands"], ["glasgow", "Glasgow", "scotland"], ["edinburgh", "Edinburgh", "scotland"], ["aberdeen", "Aberdeen", "scotland"], ["dundee", "Dundee", "scotland"],
  ["inverness", "Inverness", "scotland"], ["cardiff", "Cardiff", "wales"], ["swansea", "Swansea", "wales"], ["newport", "Newport", "wales"], ["bridgend", "Bridgend", "wales"],
  ["belfast", "Belfast", "northern-ireland"], ["derry", "Derry", "northern-ireland"],
];

const nationLabel = new Map(NATIONS.map((n) => [n.key, n.label]));
const regionByKey = new Map(REGIONS.map((r) => [r.key, r]));

const NODES: GeoNode[] = [
  ...NATIONS.map((n) => ({ key: n.key, label: n.label, kind: "nation" as const, nation: n.key, region: regionByKey.has(n.key) ? n.key : null })),
  ...REGIONS.filter((r) => r.nation === "england").map((r) => ({ key: r.key, label: r.label, kind: "region" as const, nation: r.nation, region: r.key })),
  ...CITIES.map(([key, label, region]) => ({ key, label, kind: "city" as const, nation: regionByKey.get(region)!.nation, region })),
];
export const GEO_NODES: readonly GeoNode[] = NODES;
const byKey = new Map(NODES.map((n) => [n.key, n]));
export const findGeo = (key: string): GeoNode | undefined => byKey.get(key);
export const geoBackendSlug = (key: string): string => `vans-for-sale-${key}`;
export const geoPath = (key: string): string => `/vans-for-sale/${key}`;

/** Nation -> region -> city, ending at the node itself; a nation that is also its own region appears once. */
export function geoTrail(node: { key: string; nation: string; region: string | null }): { key: string; label: string }[] {
  const trail: { key: string; label: string }[] = [{ key: node.nation, label: nationLabel.get(node.nation)! }];
  if (node.region && node.region !== node.nation) trail.push({ key: node.region, label: regionByKey.get(node.region)!.label });
  if (node.key !== trail[trail.length - 1].key) trail.push({ key: node.key, label: findGeo(node.key)?.label ?? node.key });
  return trail;
}

/** "Vans for Sale in {X} | Used Vans {X} | Vansales"; the short form when the long one would not fit a search result. */
export function geoTitle(label: string): string {
  const long = `Vans for Sale in ${label} | Used Vans ${label} | Vansales`;
  return long.length <= 70 ? long : `Vans for Sale in ${label} | Vansales`;
}
