import type { Listing, ListingImage } from "../types";
import { buildSlug } from "../slug";

/* -----------------------------------------------------------------------------
   12 canonical fixtures. Used when LISTINGS_SOURCE=mock, and as the automatic
   fallback when the live Dealski feed is unreachable. Several VW Transporters
   across different UK towns, plus a realistic spread of the rest of the market.

   Images use a synthetic "van://" descriptor — the <VanPhoto> renderer draws an
   on-brand SVG tinted to the van's colour, so the preview needs no remote hosts.
   -------------------------------------------------------------------------- */

type Seed = {
  source_id: string;
  make: string;
  model: string;
  derivative: string;
  condition?: Listing["condition"];
  year: number;
  plate: string;
  price: number | null;
  price_type?: Listing["price_type"];
  vat_qualifying?: boolean;
  status?: Listing["status"];
  seller_type?: Listing["seller_type"];
  mileage: number | null;
  fuel?: string;
  transmission?: string;
  drivetrain?: string;
  colour: string;
  engine_cc?: number | null;
  euro_status?: string | null;
  ulez?: boolean;
  body_style: string;
  wheelbase: Listing["van_spec"]["wheelbase"];
  roof_height: Listing["van_spec"]["roof_height"];
  payload_kg: number | null;
  load_length_mm: number | null;
  doors: number | null;
  town: string;
  region: string;
  postcode_area: string;
  lat: number;
  lng: number;
  description: string;
  features: string[];
  seller: { name: string; rating: number | null; logo?: string | null };
  published_at: string;
  updated_at: string;
};

function images(seed: Seed): ListingImage[] {
  const angles = ["three-quarter front", "side profile", "load bay", "cab interior"];
  return angles.map((a, i) => ({
    url: `van://${seed.source_id}/${i}`,
    alt: `${seed.year} ${seed.make} ${seed.model} ${seed.derivative} — ${a}`,
  }));
}

function build(seed: Seed): Listing {
  return {
    id: `native:${seed.source_id}`,
    source: "native",
    source_id: seed.source_id,
    tenant_id: 0,
    seller_type: seed.seller_type ?? "dealer",
    slug: buildSlug({
      make: seed.make,
      model: seed.model,
      derivative: seed.derivative,
      town: seed.town,
      source_id: seed.source_id,
    }),
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
    location: {
      town: seed.town,
      region: seed.region,
      postcode_area: seed.postcode_area,
      lat: seed.lat,
      lng: seed.lng,
    },
    description: seed.description,
    features: seed.features,
    images: images(seed),
    seller: {
      name: seed.seller.name,
      type: seed.seller_type ?? "dealer",
      logo: seed.seller.logo ?? null,
      rating: seed.seller.rating,
    },
    enquiry_route: { to: "native_inbox", ref: `native:${seed.source_id}` },
    published_at: seed.published_at,
    updated_at: seed.updated_at,
  };
}

const SEEDS: Seed[] = [
  {
    source_id: "10241",
    make: "Volkswagen",
    model: "Transporter",
    derivative: "T32 Highline TDI 150",
    year: 2024,
    plate: "73",
    price: 32995,
    vat_qualifying: true,
    mileage: 12480,
    transmission: "DSG Automatic",
    colour: "Reflex Silver",
    body_style: "Panel Van",
    wheelbase: "lwb",
    roof_height: "low",
    payload_kg: 1198,
    load_length_mm: 2975,
    doors: 4,
    town: "Cardiff",
    region: "Wales",
    postcode_area: "CF",
    lat: 51.4816,
    lng: -3.1791,
    description:
      "One-owner T32 Highline in Reflex Silver with the desirable DSG gearbox. Full VW service history, ply-lined load bay and a tow bar already fitted. Drives faultlessly.",
    features: ["Air conditioning", "Apple CarPlay", "Tow bar", "Ply lining", "Cruise control", "Front + rear sensors"],
    seller: { name: "Severn Commercials", rating: 4.8 },
    published_at: "2026-06-09T09:10:00.000Z",
    updated_at: "2026-06-16T08:00:00.000Z",
  },
  {
    source_id: "10255",
    make: "Volkswagen",
    model: "Transporter",
    derivative: "T28 Trendline TDI 110",
    year: 2022,
    plate: "22",
    price: 24450,
    mileage: 31900,
    colour: "Candy White",
    body_style: "Panel Van",
    wheelbase: "swb",
    roof_height: "low",
    payload_kg: 988,
    load_length_mm: 2570,
    doors: 4,
    town: "Bristol",
    region: "South West",
    postcode_area: "BS",
    lat: 51.4545,
    lng: -2.5879,
    description:
      "Tidy short-wheelbase T28 Trendline, ideal first van for a sole trader. Twin side loading doors and a clean, unmarked load area. MOT until March.",
    features: ["Twin side doors", "Bluetooth", "DAB radio", "Bulkhead", "Electric windows"],
    seller: { name: "Bristol Van Centre", rating: 4.5 },
    published_at: "2026-06-04T11:30:00.000Z",
    updated_at: "2026-06-15T10:15:00.000Z",
  },
  {
    source_id: "10260",
    make: "Volkswagen",
    model: "Transporter",
    derivative: "T32 Sportline TDI 204",
    year: 2023,
    plate: "23",
    price: 41995,
    status: "reserved",
    mileage: 9650,
    transmission: "DSG Automatic",
    drivetrain: "4MOTION",
    colour: "Deep Black Pearl",
    engine_cc: 1968,
    payload_kg: 1009,
    load_length_mm: 2975,
    doors: 4,
    body_style: "Panel Van",
    wheelbase: "lwb",
    roof_height: "low",
    town: "Manchester",
    region: "North West",
    postcode_area: "M",
    lat: 53.4808,
    lng: -2.2426,
    description:
      "Range-topping Sportline with the 204PS engine, 4MOTION and full body styling kit. Finished in Deep Black Pearl on factory 18\" Springfield alloys. A genuinely stunning van.",
    features: ["4MOTION all-wheel drive", "18\" alloys", "Sportline body kit", "Heated seats", "Sat nav", "LED headlights", "Reversing camera"],
    seller: { name: "Northern VW Vans", rating: 4.9 },
    published_at: "2026-05-28T14:00:00.000Z",
    updated_at: "2026-06-17T09:45:00.000Z",
  },
  {
    source_id: "10277",
    make: "Volkswagen",
    model: "Transporter",
    derivative: "T30 Startline TDI 150",
    year: 2021,
    plate: "21",
    price: 21995,
    seller_type: "private",
    vat_qualifying: false,
    price_type: "no_vat",
    mileage: 44210,
    colour: "Indium Grey",
    payload_kg: 1063,
    load_length_mm: 2570,
    doors: 3,
    body_style: "Panel Van",
    wheelbase: "swb",
    roof_height: "low",
    town: "Leeds",
    region: "Yorkshire",
    postcode_area: "LS",
    lat: 53.8008,
    lng: -1.5491,
    description:
      "Private sale, no VAT. My reliable work van for the last three years — never let me down. Selling as I'm changing trade. Some honest marks on the load floor, all in the photos.",
    features: ["Bluetooth", "Bulkhead", "Roof rack", "Tow bar", "Parking sensors"],
    seller: { name: "Daniel (private seller)", rating: null },
    published_at: "2026-06-12T16:20:00.000Z",
    updated_at: "2026-06-12T16:20:00.000Z",
  },
  {
    source_id: "10288",
    make: "Volkswagen",
    model: "Transporter",
    derivative: "T32 Highline DSG Kombi",
    year: 2024,
    plate: "24",
    price: 36750,
    mileage: 6200,
    transmission: "DSG Automatic",
    colour: "Mojave Beige",
    payload_kg: 920,
    load_length_mm: 1900,
    doors: 5,
    body_style: "Kombi",
    wheelbase: "lwb",
    roof_height: "low",
    town: "Glasgow",
    region: "Scotland",
    postcode_area: "G",
    lat: 55.8642,
    lng: -4.2518,
    description:
      "Nearly-new Kombi with removable second-row seats — five seats plus a proper load bay. Perfect for crews who carry both people and kit. Balance of VW warranty remaining.",
    features: ["5 seats", "Removable rear bench", "Air conditioning", "Apple CarPlay", "Adaptive cruise", "Twin side doors"],
    seller: { name: "Clyde Commercial", rating: 4.7 },
    published_at: "2026-06-10T08:05:00.000Z",
    updated_at: "2026-06-16T12:00:00.000Z",
  },
  {
    source_id: "10302",
    make: "Ford",
    model: "Transit Custom",
    derivative: "320 Limited L2 EcoBlue 170",
    year: 2023,
    plate: "73",
    price: 27495,
    mileage: 18420,
    transmission: "Automatic",
    colour: "Magnetic Grey",
    payload_kg: 1142,
    load_length_mm: 3050,
    doors: 4,
    body_style: "Panel Van",
    wheelbase: "mwb",
    roof_height: "low",
    town: "Birmingham",
    region: "West Midlands",
    postcode_area: "B",
    lat: 52.4862,
    lng: -1.8904,
    description:
      "Top-spec Limited Custom with the 170PS auto, heated seats and full Ford SYNC. The benchmark medium van — comfortable, quick and well looked after.",
    features: ["Heated seats", "SYNC 4 nav", "Reversing camera", "LED load light", "Cruise control", "Ply lining"],
    seller: { name: "Midland Van Hub", rating: 4.6 },
    published_at: "2026-06-07T09:50:00.000Z",
    updated_at: "2026-06-14T11:00:00.000Z",
  },
  {
    source_id: "10318",
    make: "Ford",
    model: "Transit",
    derivative: "350 Leader L3 H2 EcoBlue 130",
    year: 2022,
    plate: "72",
    price: 23950,
    mileage: 41750,
    colour: "Frozen White",
    engine_cc: 1995,
    payload_kg: 1281,
    load_length_mm: 3494,
    doors: 4,
    body_style: "Panel Van",
    wheelbase: "lwb",
    roof_height: "high",
    town: "Sheffield",
    region: "Yorkshire",
    postcode_area: "S",
    lat: 53.3811,
    lng: -1.4701,
    description:
      "Long-wheelbase high-roof Transit with stand-up load space and over 1.2 tonnes of payload. Honest fleet-maintained van with full history.",
    features: ["High roof", "Air conditioning", "Bluetooth", "Bulkhead", "Cargo tie-downs"],
    seller: { name: "Steel City Commercials", rating: 4.3 },
    published_at: "2026-06-02T13:15:00.000Z",
    updated_at: "2026-06-13T09:30:00.000Z",
  },
  {
    source_id: "10324",
    make: "Mercedes-Benz",
    model: "Sprinter",
    derivative: "315 CDI Progressive L3 H2",
    year: 2024,
    plate: "24",
    price: 38995,
    mileage: 8900,
    transmission: "Automatic",
    drivetrain: "RWD",
    colour: "Arctic White",
    engine_cc: 1993,
    payload_kg: 1430,
    load_length_mm: 4307,
    doors: 4,
    body_style: "Panel Van",
    wheelbase: "lwb",
    roof_height: "high",
    town: "London",
    region: "Greater London",
    postcode_area: "E",
    lat: 51.5416,
    lng: -0.0042,
    description:
      "Rear-wheel-drive Sprinter 315 in Progressive trim with MBUX, keyless start and a huge L3 H2 load area. Ideal for couriers and removals working inside the ULEZ.",
    features: ["MBUX touchscreen", "Keyless start", "Reversing camera", "Cruise control", "LED load lighting", "Wood-lined floor"],
    seller: { name: "Capital Vans London", rating: 4.4 },
    published_at: "2026-06-11T10:40:00.000Z",
    updated_at: "2026-06-17T07:20:00.000Z",
  },
  {
    source_id: "10337",
    make: "Vauxhall",
    model: "Vivaro",
    derivative: "2900 Dynamic L2 Diesel 130",
    year: 2021,
    plate: "71",
    price: 16995,
    mileage: 52300,
    colour: "Quartz Grey",
    engine_cc: 1997,
    payload_kg: 1002,
    load_length_mm: 2862,
    doors: 4,
    body_style: "Panel Van",
    wheelbase: "mwb",
    roof_height: "low",
    town: "Liverpool",
    region: "North West",
    postcode_area: "L",
    lat: 53.4084,
    lng: -2.9916,
    description:
      "Well-priced Vivaro Dynamic with twin side doors and a tidy load bay. Great value medium van with plenty of life left. Drives well, ready for work.",
    features: ["Twin side doors", "Apple CarPlay", "Air conditioning", "Bulkhead", "Rear parking sensors"],
    seller: { name: "Mersey Van Sales", rating: 4.1 },
    published_at: "2026-05-30T15:25:00.000Z",
    updated_at: "2026-06-12T14:10:00.000Z",
  },
  {
    source_id: "10350",
    make: "Renault",
    model: "Master",
    derivative: "LL35 Business dCi 145 Luton",
    year: 2022,
    plate: "22",
    price: 25995,
    mileage: 36400,
    colour: "Glacier White",
    engine_cc: 2298,
    payload_kg: 1100,
    load_length_mm: 4100,
    doors: 3,
    body_style: "Luton",
    wheelbase: "lwb",
    roof_height: "high",
    town: "Nottingham",
    region: "East Midlands",
    postcode_area: "NG",
    lat: 52.9548,
    lng: -1.1581,
    description:
      "Master Luton box van with tail-lift — removals-ready and barn-door access at the cab. Big cubic capacity and an easy-to-drive 145PS engine.",
    features: ["Tail lift", "Box body", "Bluetooth", "Reversing camera", "Cruise control"],
    seller: { name: "Trent Commercial Vehicles", rating: 4.2 },
    published_at: "2026-06-05T12:00:00.000Z",
    updated_at: "2026-06-14T16:45:00.000Z",
  },
  {
    source_id: "10361",
    make: "Citroën",
    model: "Berlingo",
    derivative: "Enterprise M BlueHDi 100",
    year: 2023,
    plate: "23",
    price: 14495,
    mileage: 22150,
    colour: "Polar White",
    engine_cc: 1499,
    payload_kg: 803,
    load_length_mm: 1817,
    doors: 4,
    body_style: "Car-derived Van",
    wheelbase: "swb",
    roof_height: "low",
    town: "Reading",
    region: "South East",
    postcode_area: "RG",
    lat: 51.4543,
    lng: -0.9781,
    description:
      "Economical Berlingo Enterprise — the small-van workhorse. Twin side doors, sensors and CarPlay as standard. Fantastic running costs for urban work.",
    features: ["Twin side doors", "Apple CarPlay", "Parking sensors", "Bulkhead", "Air conditioning"],
    seller: { name: "Thames Valley Vans", rating: 4.0 },
    published_at: "2026-06-08T09:00:00.000Z",
    updated_at: "2026-06-15T08:30:00.000Z",
  },
  {
    source_id: "10377",
    make: "Ford",
    model: "Ranger",
    derivative: "Wildtrak 2.0 EcoBlue Double Cab",
    year: 2023,
    plate: "73",
    price: 33995,
    status: "sold",
    mileage: 19800,
    transmission: "Automatic",
    drivetrain: "4WD",
    colour: "Sea Grey",
    engine_cc: 1996,
    payload_kg: 1035,
    load_length_mm: 1543,
    doors: 5,
    body_style: "Double Cab Pickup",
    wheelbase: "mwb",
    roof_height: "low",
    town: "Aberdeen",
    region: "Scotland",
    postcode_area: "AB",
    lat: 57.1497,
    lng: -2.0943,
    description:
      "Wildtrak double cab with the 10-speed auto, load-bed liner and roller shutter. Equally at home on site or on the school run. Now sold — similar wanted.",
    features: ["4WD", "Roller shutter", "Load liner", "Heated seats", "Sat nav", "Tow pack", "360 camera"],
    seller: { name: "Granite City 4x4", rating: 4.7 },
    published_at: "2026-05-20T10:00:00.000Z",
    updated_at: "2026-06-10T13:00:00.000Z",
  },
];

export const MOCK_LISTINGS: Listing[] = SEEDS.map(build);

export function getMockListings(): Listing[] {
  return MOCK_LISTINGS;
}
