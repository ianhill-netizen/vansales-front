import { NextResponse } from "next/server";
import { getSessionDealer } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const dealer = await getSessionDealer();
  if (!dealer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [totalStock, activeStock, soldStock, draftStock, listingIds] = await Promise.all([
    prisma.listing.count({ where: { dealerId: dealer.id } }),
    prisma.listing.count({ where: { dealerId: dealer.id, status: "active" } }),
    prisma.listing.count({ where: { dealerId: dealer.id, status: "sold" } }),
    prisma.listing.count({ where: { dealerId: dealer.id, status: "draft" } }),
    prisma.listing.findMany({ where: { dealerId: dealer.id }, select: { id: true } }),
  ]);

  const ids = listingIds.map((l) => l.id);

  const totalLeads = ids.length
    ? await prisma.enquiry.count({ where: { listingRef: { in: ids } } })
    : 0;

  return NextResponse.json({
    totalStock,
    activeStock,
    soldStock,
    draftStock,
    totalLeads,
    dealer: {
      id: dealer.id,
      name: dealer.name,
      plan: dealer.plan,
      slug: dealer.slug,
    },
  });
}
