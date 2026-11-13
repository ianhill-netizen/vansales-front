import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Container, Eyebrow } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { AffiliateCta } from "@/components/affiliates/affiliate-cta";
import { getAccessoryBody } from "@/lib/content/accessories";   // generic content_pages reader (body + FAQ)
import { INSURANCE_HUB, INSURANCE_TOPICS } from "@/lib/insurance";
import { SITE, absUrl } from "@/lib/site";

type Page = { backendSlug: string; path: string; h1: string; title: string; description: string };

export function insuranceMetadata(p: Page): Metadata {
  return {
    title: { absolute: p.title }, description: p.description, alternates: { canonical: p.path },
    openGraph: { title: p.title, description: p.description, url: p.path, type: "article" },
    twitter: { card: "summary_large_image", title: p.title, description: p.description },
  };
}

const PROSE = "prose-vs max-w-3xl space-y-4 text-[length:var(--text-md)] leading-relaxed text-ink-600 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-[length:var(--text-xl)] [&_h2]:font-bold [&_h2]:text-ink-900 [&_h3]:mt-6 [&_h3]:font-display [&_h3]:font-bold [&_h3]:text-ink-900 [&_ul]:list-disc [&_ul]:pl-5";

/** Information only. The hub shows its own static sections (children) and the Gemini guide when it is published; a topic page is a 404 until its guide is. */
export async function InsurancePage({ page, isHub, children }: { page: Page; isHub?: boolean; children?: ReactNode }) {
  const res = await getAccessoryBody(page.backendSlug);
  if (res.status === "unavailable") throw new Error(`vansales-backend content API unavailable for ${page.backendSlug}`);
  if (res.status !== "ok" && !isHub) notFound();
  const body = res.status === "ok" ? res : null;
  const url = absUrl(page.path);
  const article = { "@context": "https://schema.org", "@type": "Article", headline: page.h1, description: page.description, mainEntityOfPage: url, url, author: { "@type": "Organization", name: SITE.name, url: absUrl("/") }, publisher: { "@type": "Organization", name: SITE.name, url: absUrl("/") }, ...(body?.published ? { datePublished: body.published } : {}), ...(body?.modified ? { dateModified: body.modified } : {}) };
  const breadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
      { "@type": "ListItem", position: 2, name: INSURANCE_HUB.h1, item: absUrl(INSURANCE_HUB.path) },
      ...(isHub ? [] : [{ "@type": "ListItem", position: 3, name: page.h1, item: url }]),
    ],
  };
  const faq = body && body.faq.length >= 3 ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: body.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) } : null;
  const types = INSURANCE_TOPICS.filter((t) => t.group === "type");
  const models = INSURANCE_TOPICS.filter((t) => t.group === "model");
  return (
    <>
      <JsonLd data={[article, breadcrumb, ...(faq ? [faq] : [])]} />
      <section className="border-b border-border bg-surface-1">
        <Container className="py-10">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[length:var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-900">Home</Link><span aria-hidden>/</span>
            {isHub ? <span className="font-medium text-ink-700">{INSURANCE_HUB.h1}</span> : <><Link href={INSURANCE_HUB.path} className="hover:text-ink-900">{INSURANCE_HUB.h1}</Link><span aria-hidden>/</span><span className="font-medium text-ink-700">{page.h1}</span></>}
          </nav>
          <Eyebrow>Van insurance</Eyebrow>
          <h1 className="mt-2 font-display text-[length:var(--text-3xl)] font-extrabold leading-tight text-ink-900">{page.h1}</h1>
          <p className="mt-3 max-w-2xl text-[length:var(--text-md)] text-ink-600">{page.description}</p>
          <p className="mt-3 max-w-2xl rounded-[var(--radius-md)] border border-border bg-white px-4 py-3 text-[length:var(--text-sm)] text-ink-600">
            <strong className="text-ink-900">Vansales does not arrange or sell insurance.</strong> This page is general information. Policy terms vary by insurer, so read the policy wording and ask an insurer or broker about your own van.
          </p>
          <AffiliateCta slot="INSURANCE" page={page.path} className="mt-4" />
        </Container>
      </section>
      {children}
      <Container className="space-y-12 py-10">
        {/* body_html is sanitised on the server (allow-listed tags, no attributes) before it reaches this page */}
        {body && <article className={PROSE} dangerouslySetInnerHTML={{ __html: body.bodyHtml }} />}
        {isHub && (
          <section>
            <h2 className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">Van insurance guides</h2>
            <ul className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">{types.map((t) => <li key={t.slug}><Link href={t.path} className="font-semibold text-brand-700 hover:underline">{t.h1}</Link></li>)}</ul>
            <h3 className="mt-6 font-display text-[length:var(--text-lg)] font-bold text-ink-900">Insurance by model</h3>
            <ul className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">{models.map((t) => <li key={t.slug}><Link href={t.path} className="font-semibold text-brand-700 hover:underline">{t.h1}</Link></li>)}</ul>
          </section>
        )}
        {!isHub && (
          <section>
            <h2 className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">More van insurance guides</h2>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
              {INSURANCE_TOPICS.filter((t) => t.path !== page.path).map((t) => <li key={t.slug}><Link href={t.path} className="text-brand-700 hover:underline">{t.h1}</Link></li>)}
              <li><Link href={INSURANCE_HUB.path} className="font-semibold text-brand-700 hover:underline">All van insurance guides</Link></li>
            </ul>
          </section>
        )}
        <section>
          <h2 className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">Related guides</h2>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
            <li><Link href="/van-warranty" className="text-brand-700 hover:underline">Van warranty explained</Link></li>
            <li><Link href="/van-breakdown-cover" className="text-brand-700 hover:underline">Van breakdown cover</Link></li>
            <li><Link href="/van-accessories/van-security" className="text-brand-700 hover:underline">Van security</Link></li>
            <li><Link href="/used-vans" className="text-brand-700 hover:underline">Used vans by make and model</Link></li>
          </ul>
        </section>
      </Container>
    </>
  );
}
