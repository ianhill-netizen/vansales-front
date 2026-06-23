import type { Listing, ListingImage, Wheelbase, RoofHeight } from "../types";
import { buildSlug } from "../slug";

/* =============================================================================
   ACME ROAD RUNNER VANS — demo dealer fixture data.
   These listings are always merged into the catalogue regardless of
   LISTINGS_SOURCE, so the multi-dealer layout can be previewed alongside
   the live Swiss Vans feed. Remove or replace when a real second dealer
   is onboarded.
   ============================================================================= */

const SELLER = "ACME Road Runner Vans";
const LOC = {
  town: "Coventry",
  region: "West Midlands",
  postcode_area: "CV",
  lat: 52.4068,
  lng: -1.5197,
};

type AcmeSeed = {
  source_id: string;
  stock_ref: string;
  make: string;
  model: string;
  derivative: string;
  condition?: "used" | "new";
  status?: Listing["status"];
  year: number;
  plate: string;
  price: number | null;
  price_type?: Listing["price_type"];
  vat_qualifying?: boolean;
  mileage: number | null;
  fuel?: string;
  transmission?: string;
  drivetrain?: string;
  colour: string;
  engine_cc?: number;
  euro_status?: string;
  ulez?: boolean;
  body_style: string;
  wheelbase: Wheelbase | null;
  roof_height: RoofHeight | null;
  payload_kg: number | null;
  load_length_mm: number | null;
  doors: number | null;
  description: string;
  features: string[];
  published_at: string;
  updated_at: string;
};

function demoImages(seed: AcmeSeed): ListingImage[] {
  const angles = ["three-quarter front", "side profile", "load bay", "cab interior"];
  return angles.map((a, i) => ({
    url: `van://${seed.source_id}/${i}`,
    alt: `${seed.year} ${seed.make} ${seed.model} ${seed.derivative} — ${a}`,
  }));
}

function build(seed: AcmeSeed): Listing {
  return {
    id: `native:${seed.source_id}`,
    source: "native",
    source_id: seed.source_id,
    tenant_id: 0,
    seller_type: "dealer",
    slug: buildSlug({ make: seed.make, model: seed.model, derivative: seed.derivative, town: LOC.town, source_id: seed.source_id }),
    status: seed.status ?? "active",
    make: seed.make,
    model: seed.model,
    derivative: seed.derivative,
    condition: seed.condition ?? "used",
    year: seed.year,
    plate: seed.plate,
    price: seed.price,
    price_type: seed.price_type ?? "inc_vat",
    vat_qualifying: seed.vat_qualifying ?? true,
    mileage: seed.mileage,
    fuel: seed.fuel ?? "Diesel",
    transmission: seed.transmission ?? "Manual",
    drivetrain: seed.drivetrain ?? "FWD",
    colour: seed.colour,
    engine_cc: seed.engine_cc ?? 1968,
    euro_status: seed.euro_status ?? "Euro 6",
    ulez: seed.ulez ?? true,
    van_spec: {
      body_style: seed.body_style,
      wheelbase: seed.wheelbase,
      roof_height: seed.roof_height,
      payload_kg: seed.payload_kg,
      load_length_mm: seed.load_length_mm,
      doors: seed.doors,
    },
    location: LOC,
    description: seed.description,
    features: seed.features,
    images: demoImages(seed),
    seller: { name: SELLER, type: "dealer", logo: null, rating: null },
    enquiry_route: { to: "native_inbox", ref: `native:${seed.source_id}` },
    enquiry_url: null,
    stock_ref: seed.stock_ref,
    published_at: seed.published_at,
    updated_at: seed.updated_at,
  };
}

const SEEDS: AcmeSeed[] = [
  {
    source_id: "99001",
    stock_ref: "ARV-001",
    make: "Ford",
    model: "Transit Custom",
    derivative: "320 Limited L2 EcoBlue 170",
    year: 2024,
    plate: "24",
    price: 22495,
    mileage: 9800,
    transmission: "Automatic",
    colour: "Frozen White",
    engine_cc: 1997,
    body_style: "Panel Van",
    wheelbase: "mwb",
    roof_height: "low",
    payload_kg: 1076,
    load_length_mm: 2614,
    doors: 4,
    description: "Nearly-new Limited Custom with the 170PS auto, heated seats, SYNC 4 sat nav and full Ford digital dash. One previous company owner, impeccable condition.",
    features: ["SYNC 4 sat nav", "Heated seats", "Apple CarPlay", "Reversing camera", "Cruise control", "Ply lining", "Twin side doors"],
    published_at: "2026-06-20T09:00:00.000Z",
    updated_at: "2026-06-22T08:00:00.000Z",
  },
  {
    source_id: "99002",
    stock_ref: "ARV-002",
    make: "Mercedes-Benz",
    model: "Sprinter",
    derivative: "314 CDI L2 H2 Progressive",
    year: 2023,
    plate: "73",
    price: 28995,
    mileage: 21400,
    transmission: "Automatic",
    drivetrain: "RWD",
    colour: "Arctic White",
    engine_cc: 1993,
    body_style: "Panel Van",
    wheelbase: "lwb",
    roof_height: "high",
    payload_kg: 1236,
    load_length_mm: 4307,
    doors: 4,
    description: "Rear-wheel-drive Sprinter 314 in Progressive spec with MBUX, keyless start and fold-flat passenger seat. One owner, dealer-serviced throughout.",
    features: ["MBUX touchscreen", "Keyless start", "360° camera", "Heated seats", "LED load lighting", "Cruise control"],
    published_at: "2026-06-19T10:30:00.000Z",
    updated_at: "2026-06-21T09:15:00.000Z",
  },
  {
    source_id: "99003",
    stock_ref: "ARV-003",
    make: "Volkswagen",
    model: "Crafter",
    derivative: "CR35 TDI 140 MWB Low Roof",
    year: 2024,
    plate: "24",
    price: 31495,
    mileage: 6200,
    colour: "Candy White",
    body_style: "Panel Van",
    wheelbase: "mwb",
    roof_height: "low",
    payload_kg: 1146,
    load_length_mm: 3250,
    doors: 4,
    description: "Fresh stock — low mileage Crafter 35 with a tidy, unmarked load bay and ply lining already fitted. Balance of VW warranty to transfer.",
    features: ["Ply lining", "Air conditioning", "Cruise control", "Sat nav", "Front + rear sensors", "LED daytime running lights"],
    published_at: "2026-06-21T08:00:00.000Z",
    updated_at: "2026-06-22T07:30:00.000Z",
  },
  {
    source_id: "99004",
    stock_ref: "ARV-004",
    make: "Peugeot",
    model: "Boxer",
    derivative: "335 L3 H2 BlueHDi 140",
    year: 2022,
    plate: "22",
    price: 18950,
    mileage: 39100,
    colour: "Bianca White",
    engine_cc: 1997,
    body_style: "Panel Van",
    wheelbase: "lwb",
    roof_height: "high",
    payload_kg: 1320,
    load_length_mm: 3705,
    doors: 4,
    description: "Big-capacity Boxer with stand-up load height — perfect for tradespeople needing volume over weight. Full service history, Peugeot-maintained.",
    features: ["High roof", "Air conditioning", "Bluetooth", "Bulkhead", "Cargo rail system", "Rear parking sensors"],
    published_at: "2026-06-17T11:00:00.000Z",
    updated_at: "2026-06-20T14:30:00.000Z",
  },
  {
    source_id: "99005",
    stock_ref: "ARV-005",
    make: "Ford",
    model: "Transit",
    derivative: "350 Leader L3 H2 EcoBlue 130",
    year: 2023,
    plate: "73",
    price: 24995,
    mileage: 28600,
    colour: "Frosted White",
    engine_cc: 1995,
    body_style: "Panel Van",
    wheelbase: "lwb",
    roof_height: "high",
    payload_kg: 1281,
    load_length_mm: 3494,
    doors: 4,
    description: "Long-wheelbase high-roof Transit — the benchmark large van. Honest fleet example, full Ford service history, no damage. Ready for the next 100k miles.",
    features: ["High roof", "Air conditioning", "Cruise control", "DAB radio", "Bulkhead", "Rear barn doors"],
    published_at: "2026-06-18T13:00:00.000Z",
    updated_at: "2026-06-21T10:00:00.000Z",
  },
  {
    source_id: "99006",
    stock_ref: "ARV-006",
    make: "Vauxhall",
    model: "Movano",
    derivative: "L2 H2 RWD 2.3 CDTi 145",
    year: 2022,
    plate: "72",
    price: 19495,
    status: "reserved",
    mileage: 44200,
    drivetrain: "RWD",
    colour: "Summit White",
    engine_cc: 2298,
    body_style: "Panel Van",
    wheelbase: "mwb",
    roof_height: "high",
    payload_kg: 1408,
    load_length_mm: 3307,
    doors: 4,
    description: "Rear-wheel-drive Movano with a great payload and solid service history. Currently reserved — call to be added to the wait list or ask about similar stock.",
    features: ["RWD chassis", "High roof", "Air conditioning", "Rear step", "Bluetooth", "Bulkhead"],
    published_at: "2026-06-15T14:00:00.000Z",
    updated_at: "2026-06-20T11:00:00.000Z",
  },
  {
    source_id: "99007",
    stock_ref: "ARV-007",
    make: "Renault",
    model: "Trafic",
    derivative: "LL30 Business L2 dCi 120",
    year: 2021,
    plate: "71",
    price: 14995,
    mileage: 56800,
    colour: "Glacier White",
    engine_cc: 1997,
    body_style: "Panel Van",
    wheelbase: "lwb",
    roof_height: "low",
    payload_kg: 1070,
    load_length_mm: 3098,
    doors: 4,
    description: "Honest Trafic Business at a strong price. MOT until May 2027, no advisories, drives straight and true. Great value for a light haulage business.",
    features: ["Twin side doors", "Bluetooth", "DAB radio", "Bulkhead", "Roof rack"],
    published_at: "2026-06-12T10:00:00.000Z",
    updated_at: "2026-06-19T09:00:00.000Z",
  },
  {
    source_id: "99008",
    stock_ref: "ARV-008",
    make: "Ford",
    model: "Transit Custom",
    derivative: "300 Trail L1 EcoBlue 130",
    condition: "new",
    year: 2025,
    plate: "25",
    price: 29995,
    mileage: 0,
    colour: "Magnetic Grey",
    engine_cc: 1997,
    body_style: "Panel Van",
    wheelbase: "swb",
    roof_height: "low",
    payload_kg: 1001,
    load_length_mm: 2168,
    doors: 4,
    description: "Brand-new 2025 Transit Custom Trail — the rugged off-road appearance pack with roof rails, side step bars and Trail-specific 17\" alloys. In stock now.",
    features: ["Trail body kit", "17\" alloys", "Roof rails", "Side step bars", "SYNC 4", "Heated seats", "Reversing camera", "Trail terrain response"],
    published_at: "2026-06-22T08:00:00.000Z",
    updated_at: "2026-06-22T08:00:00.000Z",
  },
];

const ACME_DEMO_LISTINGS: Listing[] = SEEDS.map(build);

export function getAcmeDemoListings(): Listing[] {
  return ACME_DEMO_LISTINGS;
}
