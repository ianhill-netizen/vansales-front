import { NextResponse } from "next/server";
import { getSessionDealer } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

async function verifyOwnership(dealerId: string, listingId: string) {
  return prisma.listing.findFirst({ where: { id: listingId, dealerId } });
}

export async function PUT(req: Request, { params }: Params) {
  const dealer = await getSessionDealer();
  if (!dealer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await verifyOwnership(dealer.id, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const listing = await prisma.listing.update({
    where: { id },
    data: {
      make: body.make !== undefined ? String(body.make) : existing.make,
      model: body.model !== undefined ? String(body.model) : existing.model,
      price: body.price !== undefined ? parseInt(String(body.price)) : existing.price,
      mileage: body.mileage !== undefined ? parseInt(String(body.mileage)) : existing.mileage,
      description: body.description !== undefined ? String(body.description) : existing.description,
      status: body.status !== undefined ? (body.status as "active" | "draft" | "sold") : existing.status,
    },
  });

  return NextResponse.json({ listing });
}

export async function DELETE(_req: Request, { params }: Params) {
  const dealer = await getSessionDealer();
  if (!dealer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await verifyOwnership(dealer.id, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.listing.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
