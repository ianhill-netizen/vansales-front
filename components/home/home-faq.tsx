import { Container } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { HOME_FAQ, homeFaqSchema } from "@/lib/home-faq";

/** Visible FAQ plus its FAQPage JSON-LD (same data, so they cannot drift). */
export function HomeFaq() {
  return (
    <Container className="pt-10">
      <JsonLd data={homeFaqSchema()} />
      <section aria-labelledby="home-faq-heading">
        <h2 id="home-faq-heading" className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">Frequently asked questions</h2>
        <dl className="mt-4 divide-y divide-border overflow-hidden rounded-[var(--radius-xl)] border border-border bg-white">
          {HOME_FAQ.map((f) => (
            <div key={f.q} className="px-5 py-4">
              <dt className="font-display text-[length:var(--text-md)] font-bold text-ink-900">{f.q}</dt>
              <dd className="mt-1 text-[length:var(--text-sm)] leading-relaxed text-ink-600">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </Container>
  );
}
