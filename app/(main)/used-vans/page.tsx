import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { getLiveModelPageSlugs } from "@/lib/content/model-pages";
import { usedVanMakes, usedVanPath } from "@/lib/used-vans/models";
import { SITE, absUrl } from "@/lib/site";

export const revalidate = 300;

const TITLE = `Used Vans For Sale: Buying Guides and Listings by Make and Model | ${SITE.name}`;
const DESCRIPTION = "Used van buying guides and live listings for the most searched-for makes and models in the UK: what to check, what to pay, and the vans for sale right now.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/used-vans" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/used-vans", type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default async function UsedVansIndex() {
  const live = await getLiveModelPageSlugs();
  const makes = usedVanMakes()
    .map((m) => ({ ...m, models: m.models.filter((x) => live.has(x.pageSlug)) }))
    .filter((m) => m.models.length > 0);
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
      { "@type": "ListItem", position: 2, name: "Used vans", item: absUrl("/used-vans") },
    ],
  };
  return (
    <>
      <JsonLd data={[breadcrumb]} />
      <section className="border-b border-border bg-surface-1">
        <Container className="py-8">
          <Eyebrow>Used vans</Eyebrow>
          <h1 className="mt-2 font-display text-[length:var(--text-3xl)] font-extrabold leading-tight text-ink-900">Used Vans For Sale</h1>
          <p className="mt-3 max-w-2xl text-[length:var(--text-md)] leading-relaxed text-ink-600">
            Buying guides and the vans for sale right now, for the makes and models UK buyers search for most. To filter all stock by price, year and fuel, use the{" "}
            <Link href="/vans" className="font-semibold text-brand-700 hover:underline">full van search</Link>.
          </p>
        </Container>
      </section>
      <Container className="py-8">
        {makes.length === 0 ? (
          <p className="text-ink-600">These guides are being prepared. In the meantime, <Link href="/vans" className="font-semibold text-brand-700 hover:underline">browse all vans for sale</Link>.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {makes.map((m) => (
              <section key={m.makeSlug}>
                <h2 className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">
                  <Link href={`/used-vans/${m.makeSlug}`} className="hover:underline">Used {m.make} vans</Link>
                </h2>
                <ul className="mt-3 space-y-1.5">
                  {m.models.map((x) => (
                    <li key={x.pageSlug}>
                      <Link href={usedVanPath(x)} className="text-[length:var(--text-md)] text-brand-700 hover:underline">Used {x.make} {x.model} for sale</Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
