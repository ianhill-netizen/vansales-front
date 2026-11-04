import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { HomeSearch } from "@/components/home-search";
import { QuickFilters } from "@/components/quick-filters";
import { ListingCard } from "@/components/listing-card";
import { JsonLd } from "@/components/json-ld";
import { IconArrow } from "@/components/icons";
import { getListings, getFacets } from "@/lib/listings/client";
import { getPickerData } from "@/lib/listings/picker";
import { getMakeByName } from "@/lib/taxonomy/van-makes";
import { slugify } from "@/lib/listings/slug";
import { SITE, absUrl, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Vans for Sale UK | Used & New Vans | Vansales",
  description:
    "Browse thousands of used and new vans for sale across the UK. Panel vans, crew cabs, Lutons, dropsides and pickups from trusted dealers. Compare by payload, wheelbase and ULEZ status.",
  alternates: { canonical: absUrl("/") },
  openGraph: {
    title: "Vans for Sale UK | Used & New Vans | Vansales",
    description: "Browse thousands of used and new vans for sale across the UK from trusted dealers.",
    url: absUrl("/"),
    type: "website",
  },
};

export default async function HomePage() {
  const picker = await getPickerData();
  const [{ listings, total }, facets, all] = await Promise.all([
    getListings({ sort: "newest", limit: 6 }),
    getFacets(),
    getListings({}),
  ]);

  // Real counts from the same sources the search uses.
  const dealerNames = new Set(all.listings.filter((l) => l.seller_type === "dealer").map((l) => l.seller.name));
  const privateCount = all.listings.filter((l) => l.seller_type === "private").length;
  const stats = [
    { value: all.total, label: "Vans for sale" },
    { value: dealerNames.size, label: dealerNames.size === 1 ? "Dealer" : "Dealers" },
    { value: privateCount, label: "Private adverts" },
    { value: facets.makes.length, label: "Makes in stock" },
  ];

  // Only makes with real stock; guard against junk make strings from the feeds.
  const JUNK_MAKES = new Set(["van", ""]);
  const topMakes = facets.makes
    .filter((m) => m.count >= 2 && m.value && !JUNK_MAKES.has(m.value.toLowerCase()))
    .slice(0, 16);
  const base = siteUrl();

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: base,
    logo: `${base}/favicon.ico`,
    contactPoint: { "@type": "ContactPoint", telephone: SITE.phone, contactType: "sales", areaServed: "GB" },
  };
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: base,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${base}/vans?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <JsonLd data={[orgSchema, websiteSchema]} />

      {/* ── HERO: the search is the hero ─────────────────────────────────── */}
      <section className="border-b border-border bg-gradient-to-b from-brand-50/70 to-white">
        <Container className="pb-6 pt-8 sm:pt-12">
          <h1 className="font-display text-[clamp(1.9rem,1.2rem+3vw,3rem)] font-extrabold leading-[1.05] tracking-[var(--tracking-display)] text-ink-900">
            Search vans for sale
          </h1>
          <p className="mt-2 text-[var(--text-md)] text-ink-500">Private sellers and dealers across the UK</p>

          <div className="mt-5">
            <HomeSearch total={total} picker={picker} />
          </div>

          <QuickFilters className="mt-4" />
        </Container>
      </section>

      {/* ── SEARCH BY MAP ────────────────────────────────────────────────── */}
      <Container className="pt-8">
        <Link
          href="/vans?view=map"
          className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-ink-900 p-6 text-white shadow-[var(--shadow-md)] transition-transform hover:-translate-y-0.5 sm:p-8"
        >
          <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden style={{ backgroundImage: "radial-gradient(circle at 80% 40%, #f47c1e 0, transparent 38%), radial-gradient(circle, rgba(255,255,255,.18) 1px, transparent 1px)", backgroundSize: "auto, 26px 26px" }} />
          <div className="relative">
            <p className="font-display text-[var(--text-xl)] font-extrabold sm:text-[var(--text-2xl)]">Search by map</p>
            <p className="mt-1 max-w-md text-[var(--text-sm)] text-white/70">See every van near you with price pins. Drag and zoom the map and the list follows.</p>
          </div>
          <span className="relative inline-flex shrink-0 items-center gap-2 rounded-[var(--radius-md)] bg-white px-4 py-2.5 text-[var(--text-sm)] font-bold text-ink-900 group-hover:bg-accent-50">
            Open map <IconArrow width={14} height={14} />
          </span>
        </Link>
      </Container>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <Container className="pt-8">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-xl)] border border-border bg-border sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white px-5 py-4 text-center">
              <dd className="font-mono text-[var(--text-2xl)] font-bold text-ink-900">{s.value.toLocaleString("en-GB")}</dd>
              <dt className="mt-0.5 text-[var(--text-xs)] font-semibold uppercase tracking-wider text-ink-400">{s.label}</dt>
            </div>
          ))}
        </dl>
      </Container>

      {/* ── POPULAR MAKES ────────────────────────────────────────────────── */}
      {topMakes.length > 0 && (
        <Container className="pt-8">
          <h2 className="font-display text-[var(--text-lg)] font-bold text-ink-900">Popular makes</h2>
          <div className="-mx-[var(--gutter)] mt-3 overflow-x-auto px-[var(--gutter)] pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <ul className="flex w-max gap-2">
              {topMakes.map((m) => {
                const slug = getMakeByName(m.value)?.slug ?? slugify(m.value);
                return (
                  <li key={m.value}>
                    <Link
                      href={`/vans?v=${slug}`}
                      className="inline-flex items-center gap-2 whitespace-nowrap rounded-[var(--radius-pill)] border border-border bg-white px-4 py-2 text-[var(--text-sm)] font-semibold text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700"
                    >
                      {m.value}
                      <span className="font-mono text-[var(--text-xs)] font-normal text-ink-400">{m.count}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </Container>
      )}

      {/* ── LATEST VANS ──────────────────────────────────────────────────── */}
      <Container className="py-10">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-[var(--text-xl)] font-bold text-ink-900">Latest vans</h2>
          <Link href="/vans" className="text-[var(--text-sm)] font-semibold text-brand-700 hover:underline">View all {all.total.toLocaleString("en-GB")} →</Link>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l, i) => (
            <ListingCard key={l.id} listing={l} priority={i < 3} cardIndex={i} />
          ))}
        </div>
      </Container>
    </>
  );
}
