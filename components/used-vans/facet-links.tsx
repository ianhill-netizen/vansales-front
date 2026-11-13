import Link from "next/link";
import { getLiveBodyTypeSlugs } from "@/lib/content/body-type-pages";
import { BODY_TYPE_PAGES, bodyTypePath } from "@/lib/used-vans/body-types";

const FACETS = ["small-vans", "large-vans", "automatic-vans", "combi-vans", "no-vat-vans"];

/** Links to the published facet pages (small, large, automatic, combi, no VAT). Renders nothing when none is published or the API is down. */
export async function FacetLinks({ className = "" }: { className?: string }) {
  const live = await getLiveBodyTypeSlugs().catch(() => new Set<string>());
  const pages = BODY_TYPE_PAGES.filter((b) => FACETS.includes(b.slug) && live.has(b.slug));
  if (pages.length === 0) return null;
  return (
    <p className={className}>
      Looking for a particular kind of van?{" "}
      {pages.map((b, i) => <span key={b.slug}>{i > 0 && ", "}<Link href={bodyTypePath(b)} className="font-semibold text-brand-700 hover:underline">{b.label}</Link></span>)}.
    </p>
  );
}
