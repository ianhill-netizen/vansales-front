import { makeCard } from "@/lib/og/make-card";
import { OG_SIZE, OG_TYPE } from "@/lib/og/brand";
import { getMakeBySlug, getModelBySlug } from "@/lib/taxonomy/van-makes";

export const alt = "Vans for sale on Vansales";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

const titleize = (s: string) => s.split("-").map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w)).join(" ");

export default async function Image({ params }: { params: Promise<{ make: string; model: string }> }) {
  const { make, model } = await params;
  return makeCard({
    makeSlug: make,
    makeName: getMakeBySlug(make)?.name ?? titleize(make),
    modelName: getModelBySlug(make, model)?.name ?? titleize(model),
  });
}
