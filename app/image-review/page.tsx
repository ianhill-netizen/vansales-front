import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ImageReviewClient } from "./client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Image review",
  robots: { index: false, follow: false },
};

export default async function ImageReviewPage() {
  const store = await cookies();
  const preview = store.get("vs_preview")?.value ?? "";
  if (!preview.startsWith("vsp_")) notFound();
  return <ImageReviewClient />;
}
