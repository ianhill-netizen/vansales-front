/**
 * /van-accessories: a hub plus ten topic pages. Pure data. Copy is a vansales-backend content_pages row each (page_type guide, written by `content:seo-silo accessories`): the hub is "van-accessories", a topic is "accessory-{slug}".
 * The backend slugs are in HAND_BUILT_GUIDE_SLUGS (lib/landing-pages.ts) so the blog does not list them and /blog/{slug} is a 301 here.
 * `stock` says which listing attribute the "Vans in stock with this" block looks for (a regex over the listing's features, extras and description); a topic with none shows no block.
 */
export interface AccessoryDef { slug: string; backendSlug: string; path: string; h1: string; title: string; description: string; stock?: { label: string; match: RegExp } }

export const ACCESSORY_HUB = {
  backendSlug: "van-accessories",
  path: "/van-accessories",
  h1: "Van accessories",
  title: "Van Accessories UK: Racking, Ply Lining, Security & More | Vansales",
  description: "Van accessories explained: racking, ply lining, roof racks, bulkheads, tool storage, security, alloys, dash cams and conversions, with what to check on a used van.",
} as const;

const d = (slug: string, h1: string, title: string, description: string, stock?: AccessoryDef["stock"]): AccessoryDef =>
  ({ slug, backendSlug: `accessory-${slug}`, path: `/van-accessories/${slug}`, h1, title, description, stock });

export const ACCESSORIES: readonly AccessoryDef[] = [
  d("van-racking", "Van racking", "Van Racking: Systems, Costs and What Fits Your Van", "Van racking and shelving: systems, materials, weight, layouts and what to check on a used van that already has racking.", { label: "racking or shelving", match: /\b(rack(ing)?|shelv(es|ing))\b/i }),
  d("van-ply-lining", "Van ply lining", "Van Ply Lining: Costs, Kits and Is It Worth It", "Van ply lining: full versus half lining, thickness, DIY versus fitted kits, and whether it is worth it.", { label: "ply lining", match: /ply[\s_-]?lin/i }),
  d("van-roof-racks", "Van roof racks", "Van Roof Racks and Ladder Racks Explained", "Van roof racks, roof bars and ladder racks: types, load ratings, fitting and safe carrying.", { label: "a roof rack", match: /roof[\s_-]?(rack|bar)|ladder[\s_-]?rack/i }),
  d("van-bulkheads", "Van bulkheads", "Van Bulkheads: Types, Legal Requirements and Fitting", "Van bulkheads: full, half and mesh types, why they matter for load restraint, and what to check when buying.", { label: "a bulkhead", match: /bulkhead/i }),
  d("van-tool-storage", "Van tool storage", "Van Tool Storage: Secure Tool Boxes, Drawers and Vaults", "Van tool storage: secure tool boxes, drawer units and vaults, fixing them down and the theft and insurance points."),
  d("van-security", "Van security", "Van Security: Deadlocks, Alarms and Trackers Compared", "Van security: deadlocks, slamlocks, alarms, trackers and immobilisers compared."),
  d("van-seat-covers-and-mats", "Van seat covers and mats", "Van Seat Covers and Floor Mats: Heavy-Duty Options", "Van seat covers and floor mats: tailored versus universal, materials and airbag safety points."),
  d("van-alloy-wheels", "Van alloy wheels", "Van Alloy Wheels: Load Ratings, Sizes and What to Avoid", "Van alloy wheels: load ratings, sizes, tyre ratings and what to avoid.", { label: "alloy wheels", match: /alloy/i }),
  d("van-dash-cams", "Van dash cams", "Van Dash Cams: Fleet, Front/Rear and Insurance Discounts", "Van dash cams: front and rear, fleet systems, features, fitting and privacy rules."),
  d("van-conversions", "Van conversions", "Van Conversions: Camper, Crew and Trade Conversions Explained", "Van conversions: camper, crew and trade conversions, what to check on a used converted van and the paperwork."),
];

export const findAccessory = (slug: string) => ACCESSORIES.find((a) => a.slug === slug);
export const ACCESSORY_BACKEND_SLUGS: readonly string[] = [ACCESSORY_HUB.backendSlug, ...ACCESSORIES.map((a) => a.backendSlug)];
