import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AccessoryPage, accessoryMetadata } from "@/components/accessories/accessory-page";
import { ALLOY_PARENT, findAlloyModel } from "@/lib/alloy-wheels";

// /van-accessories/van-alloy-wheels/{model}: copy is the backend row accessory-van-alloy-wheels-{model}; photos are Swiss Vans' own (lib/alloy-wheels.ts). Rendered on first request (an unpublished guide must not fail the build); a missing row is a 404.
export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

type Params = { model: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const def = findAlloyModel((await params).model);
  return def ? accessoryMetadata(def) : {};
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const def = findAlloyModel((await params).model);
  if (!def) notFound();
  return <AccessoryPage page={def} parent={ALLOY_PARENT} photos={def.photos} />;
}
