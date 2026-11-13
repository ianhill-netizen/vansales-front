import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Container, Eyebrow } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { CopySections } from "@/components/content/copy-sections";
import { BREAKDOWN_INTRO, BREAKDOWN_SECTIONS } from "@/lib/content/van-breakdown";
import { absUrl } from "@/lib/site";

const TITLE = "Van Breakdown Cover UK | Vansales";
const DESCRIPTION = "What van breakdown cover includes, business versus personal policies, UK versus European cover, and what to check for vans over 3.5 tonnes and crew vans.";
const base = pageMeta({ title: TITLE, description: DESCRIPTION, path: "/van-breakdown-cover" });
export const metadata: Metadata = { ...base, title: { absolute: TITLE }, openGraph: { ...base.openGraph, title: TITLE }, twitter: { ...base.twitter, title: TITLE } };

export default function VanBreakdownCoverPage() {
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
      { "@type": "ListItem", position: 2, name: "Van breakdown cover", item: absUrl("/van-breakdown-cover") },
    ],
  };
  return (
    <>
      <JsonLd data={breadcrumb} />
      <section className="border-b border-border bg-surface-1">
        <Container className="py-12">
          <div className="max-w-3xl">
            <Eyebrow>Finance &amp; cover</Eyebrow>
            <h1 className="mt-3 font-display text-[length:var(--text-3xl)] font-extrabold leading-tight text-ink-900">Van breakdown cover</h1>
            {BREAKDOWN_INTRO.map((p) => <p key={p} className="mt-4 leading-relaxed text-ink-700">{p}</p>)}
          </div>
        </Container>
      </section>
      <Container className="py-4 pb-14">
        <article className="max-w-3xl">
          <CopySections sections={BREAKDOWN_SECTIONS} />
          <p className="mt-10 rounded-[var(--radius-lg)] border border-border bg-surface-1 p-4 text-[length:var(--text-sm)] text-ink-600">
            Vansales does not arrange breakdown cover. This page is general information, not advice on any particular policy.
          </p>
        </article>
      </Container>
    </>
  );
}
