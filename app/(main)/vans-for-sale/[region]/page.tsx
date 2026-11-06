import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingPage, landingMetadata } from "@/components/landing/landing-page";
import { REGION_KEYS, findRegion } from "@/lib/landing-pages";

// /vans-for-sale/{region}: London first. A region that has no page is a 404 (never a thin page); an unreachable API errors the render instead of caching a 404. Self-referencing canonical. ISR 5 minutes.
export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return REGION_KEYS.map((region) => ({ region }));
}

type Params = { region: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const def = findRegion((await params).region);
  return def ? landingMetadata(def) : {};
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const def = findRegion((await params).region);
  if (!def) notFound();
  return <LandingPage def={def} />;
}
