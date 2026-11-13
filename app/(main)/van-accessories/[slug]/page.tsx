import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AccessoryPage, accessoryMetadata } from "@/components/accessories/accessory-page";
import { ACCESSORIES, findAccessory } from "@/lib/accessories";

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
  return <AccessoryPage page={def} />;
}
