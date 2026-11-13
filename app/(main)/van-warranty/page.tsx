import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Container, Eyebrow } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { CopySections, InlineLinks } from "@/components/content/copy-sections";
import { WARRANTY_FAQ, WARRANTY_INTRO, WARRANTY_SECTIONS } from "@/lib/content/van-warranty";
import { absUrl } from "@/lib/site";

const TITLE = "Van Warranty UK: Used Van Warranties Explained | Vansales";
const DESCRIPTION = "Dealer, manufacturer and third-party used van warranties explained: what is covered and excluded, typical cost bands, how claims work and what to ask the dealer.";
const base = pageMeta({ title: TITLE, description: DESCRIPTION, path: "/van-warranty" });
export const metadata: Metadata = { ...base, title: { absolute: TITLE }, openGraph: { ...base.openGraph, title: TITLE }, twitter: { ...base.twitter, title: TITLE } };

export default function VanWarrantyPage() {
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
      { "@type": "ListItem", position: 2, name: "Van warranty", item: absUrl("/van-warranty") },
    ],
  };
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: WARRANTY_FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <>
      <JsonLd data={[breadcrumb, faq]} />
      <section className="border-b border-border bg-surface-1">
        <Container className="py-12">
          <div className="max-w-3xl">
            <Eyebrow>Finance &amp; cover</Eyebrow>
            <h1 className="mt-3 font-display text-[length:var(--text-3xl)] font-extrabold leading-tight text-ink-900">Van warranty</h1>
            {WARRANTY_INTRO.map((p) => <p key={p} className="mt-4 leading-relaxed text-ink-700">{p}</p>)}
          </div>
        </Container>
      </section>
      <Container className="py-4 pb-14">
        <article className="max-w-3xl">
          <CopySections sections={WARRANTY_SECTIONS} />
          <section id="faq" className="mt-10 scroll-mt-20">
            <h2 className="font-display text-[length:var(--text-2xl)] font-bold text-ink-900">Van warranty questions</h2>
            <dl className="mt-3 space-y-5">
              {WARRANTY_FAQ.map((f) => (
                <div key={f.q}>
                  <dt className="font-semibold text-ink-900">{f.q}</dt>
                  <dd className="mt-1 leading-relaxed text-ink-700"><InlineLinks text={f.a} /></dd>
                </div>
              ))}
            </dl>
          </section>
          <p className="mt-10 rounded-[var(--radius-lg)] border border-border bg-surface-1 p-4 text-[length:var(--text-sm)] text-ink-600">
            Vansales does not arrange warranties. This page is general information, not advice on any particular policy.
          </p>
        </article>
      </Container>
    </>
  );
}
