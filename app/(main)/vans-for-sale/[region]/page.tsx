import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingPage, landingMetadata } from "@/components/landing/landing-page";
import { GeoPage, geoMetadata } from "@/components/geo/geo-page";
import { TownPage, townMetadata } from "@/components/geo/town-page";
import { REGION_KEYS, findRegion } from "@/lib/landing-pages";
import { findGeo } from "@/lib/geo/tree";
import { findTown } from "@/lib/geo/towns";

// /vans-for-sale/{key}: one namespace for the geography tree. The seven original pages (london, wales, scotland, bristol, manchester, birmingham, leeds) keep their landing definitions; every other nation, region and
// city is a guide-backed GeoPage (404 until its guide is published, never a thin page); every other gazetteer place is a programmatic TownPage (noindex below the index rule). Anything else is a 404.
// An unreachable API errors the render instead of caching a 404. ISR 5 minutes; towns are rendered on first request.
export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return REGION_KEYS.map((region) => ({ region }));
}

type Params = { region: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const key = (await params).region;
  const legacy = findRegion(key);
  if (legacy) return landingMetadata(legacy);
  const node = findGeo(key);
  if (node) return geoMetadata(node);
  const town = findTown(key);
  return town ? townMetadata(town) : {};
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const key = (await params).region;
  const legacy = findRegion(key);
  if (legacy) return <LandingPage def={legacy} />;
  const node = findGeo(key);
  if (node) return <GeoPage node={node} />;
  const town = findTown(key);
  if (town) return <TownPage town={town} />;
  notFound();
}
