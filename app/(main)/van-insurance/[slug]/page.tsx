import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InsurancePage, insuranceMetadata } from "@/components/insurance/insurance-page";
import { findInsurance } from "@/lib/insurance";

// /van-insurance/{slug}: copy is the backend row insurance-{slug}. Rendered on first request (an unpublished guide must not fail the build); a missing row is a 404, an unreachable API errors the render instead of caching a 404. ISR 5 minutes.
export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const def = findInsurance((await params).slug);
  return def ? insuranceMetadata(def) : {};
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const def = findInsurance((await params).slug);
  if (!def) notFound();
  return <InsurancePage page={def} />;
}
