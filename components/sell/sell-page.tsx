import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Eyebrow, Button } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { getSellPageBody } from "@/lib/content/sell-pages";
import { SELL_PAGES, SELL_STEPS, findSellPage, sellPagePath } from "@/lib/sell-pages";
import { absUrl } from "@/lib/site";

/** The shared body of the five sell-my-van routes (app/(main)/{slug}/page.tsx). H1, title, description and canonical are fixed in lib/sell-pages.ts; the body is the Gemini guide from the API. */
export function sellMetadata(slug: string): Metadata {
  const d = findSellPage(slug)!;
  const path = sellPagePath(d);
  return {
    title: { absolute: d.title },
    description: d.description,
    alternates: { canonical: path },
    openGraph: { title: d.title, description: d.description, url: path, type: "website" },
    twitter: { card: "summary_large_image", title: d.title, description: d.description },
  };
}

export async function SellPage({ slug }: { slug: string }) {
  const d = findSellPage(slug);
  if (!d) notFound();
  const res = await getSellPageBody(slug);
  if (res.status === "unavailable") throw new Error(`vansales-backend sell page API unavailable for ${slug}`);
  if (res.status !== "ok") notFound();
  const others = SELL_PAGES.filter((p) => p.slug !== slug);
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: d.h1,
    description: d.description,
    url: absUrl(sellPagePath(d)),
    numberOfItems: SELL_STEPS.length,
    itemListElement: SELL_STEPS.map((name, i) => ({ "@type": "ListItem", position: i + 1, name })),
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
      { "@type": "ListItem", position: 2, name: d.h1, item: absUrl(sellPagePath(d)) },
    ],
  };
  return (
    <>
      <JsonLd data={[itemList, breadcrumb]} />
      <section className="border-b border-border bg-surface-1">
        <Container className="py-10">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[length:var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-900">Home</Link><span aria-hidden>/</span>
            <span className="font-medium text-ink-700">{d.h1}</span>
          </nav>
          <Eyebrow>Sell your van</Eyebrow>
          <h1 className="mt-2 font-display text-[length:var(--text-3xl)] font-extrabold leading-tight text-ink-900">{d.h1}</h1>
          <p className="mt-3 max-w-2xl text-[length:var(--text-md)] text-ink-600">{d.description}</p>
          <div className="mt-6"><Button href="/sell" variant="primary" size="lg">List my van free</Button></div>
        </Container>
      </section>
      <Container className="space-y-12 py-10">
        {/* body_html is sanitised on the server (allow-listed tags, no attributes) before it reaches this page */}
        <article className="prose-vs max-w-3xl space-y-4 text-[length:var(--text-md)] leading-relaxed text-ink-600 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-[length:var(--text-xl)] [&_h2]:font-bold [&_h2]:text-ink-900 [&_ul]:list-disc [&_ul]:pl-5" dangerouslySetInnerHTML={{ __html: res.bodyHtml }} />
        <section className="max-w-3xl">
          <h2 className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">Selling your van in six steps</h2>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-ink-700">{SELL_STEPS.map((s) => <li key={s}>{s}</li>)}</ol>
          <div className="mt-5"><Button href="/sell" variant="primary">List my van free</Button></div>
        </section>
        <section>
          <h2 className="font-display text-[length:var(--text-lg)] font-bold text-ink-900">More on selling a van</h2>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
            {others.map((p) => <li key={p.slug}><Link href={sellPagePath(p)} className="text-brand-700 hover:underline">{p.h1.split(":")[0]}</Link></li>)}
            <li><Link href="/used-vans" className="text-brand-700 hover:underline">Used vans for sale</Link></li>
            <li><Link href="/van-finance" className="text-brand-700 hover:underline">Van finance</Link></li>
          </ul>
        </section>
      </Container>
    </>
  );
}
