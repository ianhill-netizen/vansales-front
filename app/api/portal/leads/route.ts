import { NextResponse } from "next/server";
import { getSessionDealer } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const dealer = await getSessionDealer();
  if (!dealer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const listings = await prisma.listing.findMany({
    where: { dealerId: dealer.id },
    select: { id: true, make: true, model: true, year: true, derivative: true },
  });

  if (listings.length === 0) {
    return NextResponse.json({ leads: [] });
  }

  const ids = listings.map((l) => l.id);
  const listingMap = new Map(listings.map((l) => [l.id, l]));

  const enquiries = await prisma.enquiry.findMany({
    where: { listingRef: { in: ids } },
    orderBy: { createdAt: "desc" },
  });

  const leads = enquiries.map((e) => ({
    id: e.id,
    listingRef: e.listingRef,
    name: e.name,
    contact: e.contact,
    channel: e.channel,
    message: e.message,
    createdAt: e.createdAt.toISOString(),
    listing: listingMap.get(e.listingRef) ?? null,
  }));

  return NextResponse.json({ leads });
}
