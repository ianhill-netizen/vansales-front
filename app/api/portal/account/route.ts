import { NextResponse } from "next/server";
import { getSessionDealer, getSessionRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const dealer = await getSessionDealer();
  if (!dealer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = await getSessionRole();

  // Count listings
  const listingCount = await prisma.listing.count({ where: { dealerId: dealer.id } });

  return NextResponse.json({
    dealer: {
      id: dealer.id,
      slug: dealer.slug,
      name: dealer.name,
      location: dealer.location,
      phone: dealer.phone,
      plan: dealer.plan,
      googleRating: dealer.googleRating,
    },
    listingCount,
    role,
  });
}

export async function PUT(req: Request) {
  const dealer = await getSessionDealer();
  if (!dealer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const updated = await prisma.dealer.update({
    where: { id: dealer.id },
    data: {
      name: body.name ? String(body.name).trim() : dealer.name,
      location: body.location !== undefined ? String(body.location).trim() || null : dealer.location,
      phone: body.phone !== undefined ? String(body.phone).trim() || null : dealer.phone,
    },
  });

  return NextResponse.json({ dealer: updated });
}
