import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Container, Eyebrow, Button } from "@/components/ui";
import { IconArrow } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { absUrl } from "@/lib/site";
import { FEED_GROUPS, NEXT_STEPS, STOCK_FEEDS_DESCRIPTION, STOCK_FEEDS_H1, STOCK_FEEDS_PATH, STOCK_FEEDS_TITLE } from "@/lib/stock-feeds";

// Title is Ian's, fitted by the site title helper (the root layout appends " · Vansales"). Sitemap lastmod lives in lib/stock-feeds.ts (STOCK_FEEDS_LASTMOD).
const base = pageMeta({ title: STOCK_FEEDS_TITLE, description: STOCK_FEEDS_DESCRIPTION, path: STOCK_FEEDS_PATH });
export const metadata: Metadata = {
  ...base,
  alternates: { canonical: absUrl(STOCK_FEEDS_PATH) },
  openGraph: { ...base.openGraph, url: absUrl(STOCK_FEEDS_PATH) },
};

export default function StockFeedsPage() {
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
      { "@type": "ListItem", position: 2, name: "Stock feeds", item: absUrl(STOCK_FEEDS_PATH) },
    ],
  };
  return (
    <>
      <JsonLd data={[breadcrumb]} />
      <section className="border-b border-border bg-surface-1">
        <Container className="py-14">
          <div className="max-w-2xl">
            <Eyebrow>For dealers</Eyebrow>
            <h1 className="mt-3 font-display text-[length:var(--text-3xl)] font-extrabold leading-tight text-ink-900">{STOCK_FEEDS_H1}</h1>
            <p className="mt-4 text-[length:var(--text-md)] leading-relaxed text-ink-600">
              The thing that puts dealers off a new platform is typing in 40 vans all over again. You do not have to. We take the stock feed you already produce, and we do the setup, not you.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <h2 className="font-display text-[length:var(--text-2xl)] font-bold text-ink-900">Where your stock can come from</h2>
          <p className="mt-2 max-w-2xl text-[length:var(--text-sm)] leading-relaxed text-ink-600">Send us the feed you already produce from any of these, and we will set it up.</p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {FEED_GROUPS.map((g) => (
              <div key={g.title} className="rounded-[var(--radius-xl)] border border-border bg-white p-6 shadow-[var(--shadow-xs)]">
                <h3 className="font-display text-[length:var(--text-lg)] font-bold text-ink-900">{g.title}</h3>
                <ul className="mt-3 space-y-3">
                  {g.sources.map((s) => (
                    <li key={s.name}>
                      <p className="text-[length:var(--text-sm)] font-semibold text-ink-900">{s.name}</p>
                      <p className="text-[length:var(--text-sm)] leading-relaxed text-ink-600">{s.note}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-border py-12">
        <Container>
          <div className="max-w-2xl">
            <h2 className="font-display text-[length:var(--text-2xl)] font-bold text-ink-900">What we need from you</h2>
            <p className="mt-3 text-[length:var(--text-sm)] leading-relaxed text-ink-600">
              The link to your stock feed, or the export or login details for the account that produces it. If you do not have it to hand, ask your platform provider for your stock feed or a CSV or XML export of your stock, and send us their contact if you would like us to ask them.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-t border-border bg-surface-1 py-12">
        <Container>
          <h2 className="font-display text-[length:var(--text-2xl)] font-bold text-ink-900">What happens next</h2>
          <ul className="mt-6 grid gap-5 md:grid-cols-3">
            {NEXT_STEPS.map((s) => (
              <li key={s.title} className="rounded-[var(--radius-xl)] border border-border bg-white p-6 shadow-[var(--shadow-xs)]">
                <h3 className="font-display text-[length:var(--text-lg)] font-bold text-ink-900">{s.title}</h3>
                <p className="mt-2 text-[length:var(--text-sm)] leading-relaxed text-ink-600">{s.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-t border-border py-12">
        <Container>
          <div className="max-w-2xl">
            <h2 className="font-display text-[length:var(--text-2xl)] font-bold text-ink-900">Not on the list?</h2>
            <p className="mt-3 text-[length:var(--text-sm)] leading-relaxed text-ink-600">
              Send us whatever you have. Many platforms can export your stock as CSV or XML, and that is enough for us to work with.
            </p>
            <div className="mt-6">
              <Button href="/advertise" variant="primary" size="lg">
                Advertise with us <IconArrow width={20} height={20} />
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
