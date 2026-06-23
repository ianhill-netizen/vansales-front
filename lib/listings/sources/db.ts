import { prisma } from "@/lib/prisma";
import type { Listing, ListingImage, Wheelbase, RoofHeight } from "../types";
import { buildSlug } from "../slug";

function mapWheelbase(wb: string | null): Wheelbase | null {
  if (!wb) return null;
  const s = wb.toLowerCase();
  if (s.startsWith("swb")) return "swb";
  if (s.startsWith("mwb")) return "mwb";
  if (s.startsWith("lwb") || s.startsWith("xlwb")) return "lwb";
  return null;
}

function mapRoofHeight(rh: string | null): RoofHeight | null {
  if (!rh) return null;
  const s = rh.toLowerCase();
  if (s.includes("low")) return "low";
  if (s.includes("high")) return "high";
  if (s.includes("medium") || s.includes("mid")) return "medium";
  return null;
}

function yearToPlate(year: number | null): string {
  if (!year) return "";
  return String(year).slice(-2);
}

export async function fetchNativeDbListings(dealerId?: string): Promise<Listing[]> {
  const rows = await prisma.listing.findMany({
    where: {
      source: "native",
      status: "active",
      ...(dealerId ? { dealerId } : {}),
    },
    include: { dealer: true },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((row): Listing => {
    const rawLocation = row.dealer.location ?? "UK";
    const town = rawLocation.split(",")[0].trim();

    const slug = buildSlug({
      make: row.make,
      model: row.model,
      derivative: row.derivative ?? "",
      town,
      source_id: row.id,
    });

    let images: ListingImage[] = [];
    if (Array.isArray(row.images)) {
      images = (row.images as unknown[]).flatMap((img) => {
        if (typeof img === "object" && img !== null && "url" in img) {
          return [img as ListingImage];
        }
        return [];
      });
    }

    return {
      id: `native:${row.id}`,
      source: "native",
      source_id: row.id,
      tenant_id: 0,
      seller_type: "dealer",
      slug,
      status: row.status === "active" ? "active" : row.status === "sold" ? "sold" : "removed",
      make: row.make,
      model: row.model,
      derivative: row.derivative ?? "",
      condition: "used",
      year: row.year ?? new Date().getFullYear(),
      plate: yearToPlate(row.year),
      price: row.price ?? null,
      price_type: "inc_vat",
      vat_qualifying: false,
      mileage: row.mileage ?? null,
      fuel: row.fuel ?? "Diesel",
      transmission: row.transmission ?? "Manual",
      drivetrain: "FWD",
      colour: row.colour ?? "",
      engine_cc: null,
      euro_status: null,
      ulez: false,
      van_spec: {
        body_style: row.bodyType ?? "Panel Van",
        wheelbase: mapWheelbase(row.wheelbase),
        roof_height: mapRoofHeight(null),
        payload_kg: row.payload ?? null,
        load_length_mm: null,
        doors: row.doors ?? null,
      },
      location: {
        town,
        region: "",
        postcode_area: "",
        lat: row.dealer.lat ?? null,
        lng: row.dealer.lng ?? null,
      },
      description: row.description ?? "",
      features: row.features ?? [],
      images,
      seller: {
        name: row.dealer.name,
        type: "dealer",
        logo: null,
        rating: row.dealer.googleRating ?? null,
      },
      enquiry_route: {
        to: "native",
        ref: row.id,
      },
      enquiry_url: null,
      stock_ref: null,
      published_at: row.createdAt.toISOString(),
      updated_at: row.createdAt.toISOString(),
    };
  });
}

export async function fetchNativeDbListingById(id: string): Promise<Listing | null> {
  const row = await prisma.listing.findUnique({
    where: { id },
    include: { dealer: true },
  });
  if (!row || row.source !== "native") return null;
  const rawLocation = row.dealer.location ?? "UK";
  const town = rawLocation.split(",")[0].trim();
  const slug = buildSlug({ make: row.make, model: row.model, derivative: row.derivative ?? "", town, source_id: row.id });
  let images: ListingImage[] = [];
  if (Array.isArray(row.images)) {
    images = (row.images as unknown[]).flatMap((img) => {
      if (typeof img === "object" && img !== null && "url" in img) return [img as ListingImage];
      return [];
    });
  }
  return {
    id: `native:${row.id}`,
    source: "native",
    source_id: row.id,
    tenant_id: 0,
    seller_type: "dealer",
    slug,
    status: row.status === "active" ? "active" : row.status === "sold" ? "sold" : "removed",
    make: row.make,
    model: row.model,
    derivative: row.derivative ?? "",
    condition: "used",
    year: row.year ?? new Date().getFullYear(),
    plate: yearToPlate(row.year),
    price: row.price ?? null,
    price_type: "inc_vat",
    vat_qualifying: false,
    mileage: row.mileage ?? null,
    fuel: row.fuel ?? "Diesel",
    transmission: row.transmission ?? "Manual",
    drivetrain: "FWD",
    colour: row.colour ?? "",
    engine_cc: null,
    euro_status: null,
    ulez: false,
    van_spec: {
      body_style: row.bodyType ?? "Panel Van",
      wheelbase: mapWheelbase(row.wheelbase),
      roof_height: null,
      payload_kg: row.payload ?? null,
      load_length_mm: null,
      doors: row.doors ?? null,
    },
    location: {
      town,
      region: "",
      postcode_area: "",
      lat: row.dealer.lat ?? null,
      lng: row.dealer.lng ?? null,
    },
    description: row.description ?? "",
    features: row.features ?? [],
    images,
    seller: { name: row.dealer.name, type: "dealer", logo: null, rating: row.dealer.googleRating ?? null },
    enquiry_route: { to: "native", ref: row.id },
    enquiry_url: null,
    stock_ref: null,
    published_at: row.createdAt.toISOString(),
    updated_at: row.createdAt.toISOString(),
  };
}
