import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AccessoryPage, accessoryMetadata } from "@/components/accessories/accessory-page";
import { ACCESSORIES, findAccessory } from "@/lib/accessories";
import { ALLOY_MODELS } from "@/lib/alloy-wheels";
import { getLiveAccessorySlugs } from "@/lib/content/accessories";

export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return ACCESSORIES.map((a) => ({ slug: a.slug }));
}

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const def = findAccessory((await params).slug);
  return def ? accessoryMetadata(def) : {};
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const def = findAccessory((await params).slug);
  if (!def) notFound();
  // The alloy-wheels topic links to its six model pages (only the published ones).
  if (def.slug === "van-alloy-wheels") {
    const live = await getLiveAccessorySlugs(ALLOY_MODELS.map((a) => a.backendSlug)).catch(() => new Set<string>());
    const links = ALLOY_MODELS.filter((a) => live.has(a.backendSlug)).map((a) => ({ href: a.path, label: a.h1 }));
    return <AccessoryPage page={def} childLinks={{ title: "Alloy wheels by model", links }} />;
  }
  return <AccessoryPage page={def} />;
}
