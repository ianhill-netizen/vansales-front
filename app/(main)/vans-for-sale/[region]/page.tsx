import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GeoPage, geoMetadata } from "@/components/geo/geo-page";
import { TownPage, townMetadata } from "@/components/geo/town-page";
import { GEO_NODES, findGeo } from "@/lib/geo/tree";
import { findTown } from "@/lib/geo/towns";

// /vans-for-sale/{key}: one namespace for the geography tree. Every nation, region and city (the original seven pages included, with their existing guide rows) is a guide-backed GeoPage (404 until its guide is published, never a thin page); every other gazetteer place is a programmatic TownPage (noindex below the index rule). Anything else is a 404.
// An unreachable API errors the render instead of caching a 404. ISR 5 minutes; towns are rendered on first request.
export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return GEO_NODES.map((n) => ({ region: n.key }));
}

type Params = { region: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const key = (await params).region;
  const node = findGeo(key);
  if (node) return geoMetadata(node);
  const town = findTown(key);
  return town ? townMetadata(town) : {};
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const key = (await params).region;
  const node = findGeo(key);
  if (node) return <GeoPage node={node} />;
  const town = findTown(key);
  if (town) return <TownPage town={town} />;
  notFound();
}
