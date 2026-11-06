import { makeCard } from "@/lib/og/make-card";
import { OG_SIZE, OG_TYPE } from "@/lib/og/brand";
import { getMakeBySlug } from "@/lib/taxonomy/van-makes";
import { makeSlugFromParam } from "@/lib/seo/make-url";

export const alt = "Vans for sale on Vansales";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default async function Image({ params }: { params: Promise<{ make: string }> }) {
  const { make: param } = await params;
  const make = makeSlugFromParam(param) ?? param;
  const name = getMakeBySlug(make)?.name ?? make.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return makeCard({ makeSlug: make, makeName: name });
}
