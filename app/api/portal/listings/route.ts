import { NextResponse } from "next/server";
import { getSessionDealer } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const dealer = await getSessionDealer();
  if (!dealer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const listings = await prisma.listing.findMany({
    where: { dealerId: dealer.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ listings });
}

export async function POST(req: Request) {
  const dealer = await getSessionDealer();
  if (!dealer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const make = String(body.make ?? "").trim();
  const model = String(body.model ?? "").trim();
  if (!make || !model) {
    return NextResponse.json({ error: "make and model are required" }, { status: 400 });
  }

  const features: string[] = [];
  if (body.towBar) features.push("Tow bar");
  if (body.roofRack) features.push("Roof rack");
  if (body.internalRacking) features.push("Internal racking");
  if (body.bodykit) features.push("Bodykit");
  if (body.seats) features.push(`${body.seats} seats`);

  const listing = await prisma.listing.create({
    data: {
      dealerId: dealer.id,
      make,
      model,
      derivative: String(body.derivative ?? "").trim() || null,
      year: body.year ? parseInt(String(body.year)) : null,
      fuel: String(body.fuel ?? "").trim() || null,
      colour: String(body.colour ?? "").trim() || null,
      mileage: body.mileage ? parseInt(String(body.mileage)) : null,
      price: body.price ? parseInt(String(body.price)) : null,
      bodyType: String(body.conversionType ?? "").trim() || null,
      wheelbase: String(body.wheelbase ?? "").trim() || null,
      payload: body.payload ? parseInt(String(body.payload)) : null,
      seats: body.seats ? parseInt(String(body.seats)) : null,
      description: String(body.description ?? "").trim() || null,
      status: "active",
      source: "native",
      features,
      images: [],
    },
  });

  return NextResponse.json({ listing }, { status: 201 });
}
