/**
 * lib/taxonomy/van-makes.ts
 *
 * Comprehensive UK van make/model taxonomy.
 *
 * Ordering:
 *   - POPULAR tier (popular: true) — 10 brands ordered by UK van registration
 *     share, matching AutoTrader's "common ones first" convention.
 *   - ALPHABETICAL tier (popular: false) — all remaining makes A→Z.
 *
 * counts are undefined at build time; populate from live stock at runtime
 * (e.g. by aggregating fetchDealskiCatalogue results) to render
 * "Transit (140)" style labels in make/model selectors.
 */

export interface VanModel {
  name: string;    // display label, e.g. "Transit Custom"
  slug: string;    // URL-safe, e.g. "transit-custom"
  count?: number;  // live stock count — filled externally
}

export interface VanMake {
  name: string;      // display label, e.g. "Mercedes-Benz"
  slug: string;      // URL-safe, e.g. "mercedes-benz"
  /** true → rendered in the popular tier at the top of make selectors */
  popular: boolean;
  models: VanModel[];
  count?: number;    // live stock count — filled externally
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Slug builder — mirrors lib/listings/slug.ts slugify but adds NFD
 * normalisation so accented chars (ë, è, ò) produce clean ASCII slugs.
 */
function sl(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")   // strip combining diacritics
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function make(name: string, popular: boolean, modelNames: string[]): VanMake {
  return {
    name,
    slug: sl(name),
    popular,
    models: modelNames.map((n) => ({ name: n, slug: sl(n) })),
  };
}

// ---------------------------------------------------------------------------
// Taxonomy
// ---------------------------------------------------------------------------

export const VAN_MAKES: VanMake[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // POPULAR TIER — ordered by UK van market share
  // ══════════════════════════════════════════════════════════════════════════

  make("Ford", true, [
    // Large panel vans
    "Transit",
    "E-Transit",
    // Medium panel vans
    "Transit Custom",
    "E-Transit Custom",
    // Small panel vans
    "Transit Connect",
    // City/mini vans
    "Transit Courier",
    // People carriers (commercial variants)
    "Tourneo Custom",
    "Tourneo Connect",
    "Tourneo Courier",
    // Pickups
    "Ranger",
  ]),

  make("Volkswagen", true, [
    // Medium panel vans
    "Transporter",
    "ID.Buzz Cargo",
    // Large panel vans
    "Crafter",
    // Small/compact panel vans
    "Caddy Cargo",
    "Caddy",
    // Pickups
    "Amarok",
  ]),

  make("Mercedes-Benz", true, [
    // Large panel vans
    "Sprinter",
    "eSprinter",
    // Medium panel vans
    "Vito",
    "eVito",
    // Small panel vans
    "Citan",
    "eCitan",
  ]),

  make("Vauxhall", true, [
    // Medium panel vans
    "Vivaro",
    "Vivaro-e",
    // Large panel vans
    "Movano",
    "Movano-e",
    // Small/compact panel vans
    "Combo Cargo",
    "Combo-e Cargo",
    // Used market
    "Astravan",
    "Corsavan",
  ]),

  make("Renault", true, [
    // Large panel vans
    "Master",
    "Master E-Tech Electric",
    // Medium panel vans
    "Trafic",
    "Trafic E-Tech",
    // Small panel vans
    "Kangoo",
    "Kangoo E-Tech Electric",
    // Mini/city vans
    "Express Cargo",
  ]),

  make("Citroën", true, [
    // Large panel vans
    "Relay",
    "ë-Relay",
    // Medium panel vans
    "Dispatch",
    "ë-Dispatch",
    // Small/compact panel vans
    "Berlingo",
    "ë-Berlingo",
    // Used market model names
    "Jumpy",
    "Jumper",
    "Nemo",
  ]),

  make("Peugeot", true, [
    // Large panel vans
    "Boxer",
    "e-Boxer",
    // Medium panel vans
    "Expert",
    "e-Expert",
    // Small/compact panel vans
    "Partner",
    "e-Partner",
    // Mini vans (used market)
    "Bipper",
  ]),

  make("Toyota", true, [
    // Medium panel vans
    "Proace",
    "Proace Electric",
    // Small/compact panel vans
    "Proace City",
    "Proace City Electric",
    // People carriers (commercial)
    "Proace Verso",
    "Proace City Verso",
    // Pickups
    "Hilux",
    // Land Cruiser 70-series sold as commercial in UK
    "Land Cruiser Commercial",
  ]),

  make("Nissan", true, [
    // Small panel vans — current
    "Townstar",
    "Townstar EV",
    // Small panel vans — used market
    "NV200",
    "e-NV200",
    // Medium panel vans — used market
    "NV300",
    "Primastar",
    // Large panel vans — used market / transitional
    "NV400",
    "Interstar",
    // Pickups
    "Navara",
  ]),

  make("Fiat", true, [
    // Large panel vans
    "Ducato",
    "e-Ducato",
    // Medium panel vans
    "Scudo",
    "e-Scudo",
    // Small/compact panel vans
    "Doblò",
    "e-Doblò",
    // Mini vans (used market)
    "Fiorino",
    // Medium vans — used market (replaced by Scudo)
    "Talento",
  ]),

  // ══════════════════════════════════════════════════════════════════════════
  // ALPHABETICAL TIER
  // ══════════════════════════════════════════════════════════════════════════

  make("BYD", false, [
    "eT3",
    "eT6",
    // Electric pickup entering UK market
    "Shark",
  ]),

  make("Dacia", false, [
    // Limited UK commercial presence; Dokker sold in some EU markets
    "Dokker",
    "Dokker Cargo",
  ]),

  make("Farizon", false, [
    // Geely's commercial vehicle brand, entering UK EV van market
    "SV",
    "V7E",
  ]),

  make("Hyundai", false, [
    // Mostly used market in UK; new van presence is limited
    "H350",
    "iLoad",
    "H1",
    "Staria",
  ]),

  make("Isuzu", false, [
    // UK commercial presence = D-Max pickup
    "D-Max",
  ]),

  make("Iveco", false, [
    "Daily",
    "eDaily",
  ]),

  make("Kia", false, [
    // PV5 launching in UK ~2025; Bongo sold in some markets
    "PV5",
    "Bongo",
  ]),

  make("Land Rover", false, [
    "Defender Commercial",
    "Defender Pickup",
    "Discovery Commercial",
    "Discovery Sport Commercial",
  ]),

  make("LDV", false, [
    // Historical SAIC brand (now trading as Maxus in UK new market)
    "V80",
    "EV80",
    "Convoy",
  ]),

  make("LEVC", false, [
    // London Electric Vehicle Company — range-extended electric van
    "VN5",
  ]),

  make("MAN", false, [
    // TGE = badge-engineered VW Crafter
    "TGE",
    "eTGE",
  ]),

  make("Maxus", false, [
    // SAIC's UK commercial brand (successor to LDV branding)
    // Diesel
    "Deliver 9",
    // Electric panel vans
    "eDeliver 3",
    "eDeliver 7",
    "eDeliver 9",
    // Electric minibus
    "Mifa 9",
    // Electric pickup
    "T90 EV",
  ]),

  make("Mitsubishi", false, [
    // UK commercial presence = L200 pickup; Canter is Mitsubishi Fuso (separate brand)
    "L200",
  ]),

  make("SsangYong", false, [
    // Now branded KG Mobility in some markets; Musso is the UK commercial offering
    "Musso",
    "Rexton Sports",
  ]),

];

// ---------------------------------------------------------------------------
// Convenience exports
// ---------------------------------------------------------------------------

/** Popular makes only, in market-share order. */
export const POPULAR_MAKES: VanMake[] = VAN_MAKES.filter((m) => m.popular);

/** All makes (popular first, then A→Z). */
export const ALL_MAKES: VanMake[] = VAN_MAKES;

// Build lookup maps once at module load.
const _byMakeSlug = new Map<string, VanMake>(VAN_MAKES.map((m) => [m.slug, m]));

export function getMakeBySlug(slug: string): VanMake | undefined {
  return _byMakeSlug.get(slug);
}

export function getModelBySlug(makeSlug: string, modelSlug: string): VanModel | undefined {
  return getMakeBySlug(makeSlug)?.models.find((m) => m.slug === modelSlug);
}

/**
 * Given a raw make string from the live feed (e.g. "FORD", "Mercedes-Benz"),
 * returns the matching VanMake entry or undefined.
 */
export function getMakeByName(rawName: string): VanMake | undefined {
  const lower = rawName.toLowerCase().trim();
  return VAN_MAKES.find((m) => m.name.toLowerCase() === lower);
}
