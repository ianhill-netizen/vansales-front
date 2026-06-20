import type { Metadata } from "next";
import Link from "next/link";
import { Container, Button, Badge, SectionHeader } from "@/components/ui";
import { SearchHero } from "@/components/search-hero";
import { ListingCard } from "@/components/listing-card";
import { SpecCard } from "@/components/spec-card";
import { JsonLd } from "@/components/json-ld";
import {
  IconArrow, IconCheck, IconShield, IconBolt, IconFilter, IconSearch,
} from "@/components/icons";
import { getListings, getFacets } from "@/lib/listings/client";
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

const BODY_TYPES = [
  { label: "Panel vans",    href: "/vans/panel-van",  accent: "#1b5aa8", desc: "The workhorse" },
  { label: "Crew cabs",     href: "/vans/crew-van",   accent: "#4f35a8", desc: "Extra seating" },
  { label: "Pickup trucks", href: "/vans/pickup",     accent: "#0c4f7a", desc: "Open load bed" },
  { label: "Luton vans",    href: "/vans/luton",      accent: "#0d5050", desc: "Box body" },
  { label: "Dropsides",     href: "/vans/dropside",   accent: "#b84e07", desc: "Flatbed" },
  { label: "Electric vans", href: "/vans/electric",   accent: "#0c6030", desc: "ULEZ-free" },
] as const;

const POPULAR_MODELS = [
  { make: "Volkswagen",    model: "Transporter",    slug: "volkswagen/transporter",    body_style: "Panel Van" },
  { make: "Ford",          model: "Transit",        slug: "ford/transit",              body_style: "Panel Van" },
  { make: "Mercedes-Benz", model: "Sprinter",       slug: "mercedes-benz/sprinter",    body_style: "Panel Van" },
  { make: "Ford",          model: "Transit Custom", slug: "ford/transit-custom",       body_style: "Panel Van" },
  { make: "Vauxhall",      model: "Vivaro",         slug: "vauxhall/vivaro",           body_style: "Panel Van" },
  { make: "Ford",          model: "Ranger",         slug: "ford/ranger",               body_style: "Pickup" },
] as const;

const TRUST_POINTS = [
  {
    icon: <IconShield width={22} height={22} />,
    title: "Verified dealers only",
    body: "Every dealer on Vansales is verified and rated — no private sellers hiding problems.",
    color: "bg-brand-tint text-brand-600",
  },
  {
    icon: <IconBolt width={22} height={22} />,
    title: "Live stock, not stale listings",
    body: "Our catalogue syncs directly from dealer stock systems — what you see is what's available today.",
    color: "bg-accent-tint text-accent-600",
  },
  {
    icon: <IconFilter width={22} height={22} />,
    title: "Spec-first search",
    body: "Filter by payload, wheelbase, ULEZ compliance and Euro 6 status — not just price and colour.",
    color: "bg-success-tint text-success-600",
  },
] as const;

export default async function HomePage() {
  const [{ listings, total, servedBy }, facets] = await Promise.all([
    getListings({ sort: "newest", limit: 6 }),
    getFacets(),
  ]);

  const topMakes = facets.makes.slice(0, 10);
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

      {/* ────────────────────────── HERO ─────────────────────────────────────
          Full-bleed deep navy + diagonal texture + floating search card.
          Hero copy is large, editorial, left-aligned.
          ───────────────────────────────────────────────────────────────────── */}
      <section
        className="hero-grid hero-lines relative"
        style={{ background: "var(--gradient-brand-hero)" }}
      >
        {/* Ambient glow orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div
            className="absolute -right-40 -top-40 size-[700px] rounded-full opacity-12"
            style={{ background: "radial-gradient(circle, #f47c1e 0%, transparent 68%)" }}
          />
          <div
            className="absolute -left-24 bottom-[-5rem] size-[550px] rounded-full opacity-08"
            style={{ background: "radial-gradient(circle, #1b5aa8 0%, transparent 68%)" }}
          />
        </div>

        <Container className="relative z-10 pt-[var(--hero-y-top)] pb-[var(--hero-y-bottom)]">
          {/* Eyebrow pill */}
          <div className="mb-8 inline-flex items-center gap-2.5 rounded-[var(--radius-pill)] border border-white/15 bg-white/08 px-4 py-2 backdrop-blur-sm">
            <span className="size-1.5 animate-pulse rounded-full bg-accent-500" />
            <span className="font-mono text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-white/70">
              UK&rsquo;s commercial van marketplace
            </span>
          </div>

          {/* Headline */}
          <h1 className="max-w-3xl font-display font-extrabold leading-[1.0] tracking-[var(--tracking-display)] text-white"
              style={{ fontSize: "clamp(2.6rem, 1.6rem + 5vw, 4.2rem)" }}>
            Find your next van.{" "}
            <span className="text-accent-400">By the numbers that matter.</span>
          </h1>

          <p className="mt-6 max-w-lg text-[var(--text-lg)] leading-relaxed text-white/60">
            {total.toLocaleString()}+ vans from verified UK dealers — search by payload,
            wheelbase and ULEZ status, not just price.
          </p>

          {/* Trust points */}
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2.5">
            {[
              { icon: <IconShield  width={14} height={14} />, label: "Verified dealers only" },
              { icon: <IconBolt    width={14} height={14} />, label: "Live stock, updated daily" },
              { icon: <IconSearch  width={14} height={14} />, label: "Spec-first search" },
            ].map((t) => (
              <span key={t.label} className="flex items-center gap-2 text-[var(--text-sm)] text-white/55">
                <span className="text-accent-400">{t.icon}</span>
                {t.label}
              </span>
            ))}
          </div>
        </Container>

        {/* Floating search card — hovers over the fold break */}
        <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-1/2 px-[var(--gutter)]">
          <div className="mx-auto max-w-[var(--container-max)]">
            <SearchHero total={total} />
          </div>
        </div>
      </section>

      {/* Spacer compensates for floating search card.
          Mobile: card stacks to ~22rem, half (11rem) hangs below section → need ≥14rem.
          Desktop (sm+): card is one 5rem row, half (3.5rem) hangs below → 7rem is generous. */}
      <div className="h-56 bg-surface-1 sm:h-28" />

      {/* ──────────────────────── BROWSE BY MAKE ────────────────────────── */}
      <section className="bg-surface-1 pb-[var(--section-y)] pt-6">
        <Container>
          <div className="mb-8 flex items-end justify-between">
            <SectionHeader eyebrow="Browse by make" heading="Vans for sale by manufacturer" />
            <Link
              href="/directory"
              className="hidden items-center gap-1.5 text-[var(--text-sm)] font-semibold text-brand-600 hover:text-brand-700 sm:flex"
            >
              All makes <IconArrow width={14} height={14} />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {topMakes.map((m) => (
              <Link
                key={m.value}
                href={`/vans/${slugify(m.value)}`}
                className="group flex flex-col items-center gap-2.5 rounded-[var(--radius-xl)] border border-border bg-white px-3 py-5 text-center shadow-[var(--shadow-xs)] transition-all duration-[var(--dur-base)] hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[var(--shadow-md)]"
              >
                <span className="font-display text-[var(--text-base)] font-bold text-ink-800 group-hover:text-brand-600">
                  {m.value}
                </span>
                <span className="rounded-[var(--radius-pill)] bg-surface-2 px-2.5 py-0.5 font-mono text-[var(--text-xs)] text-ink-500">
                  {m.count}
                </span>
              </Link>
            ))}
            <Link
              href="/directory"
              className="flex flex-col items-center justify-center gap-1.5 rounded-[var(--radius-xl)] border border-dashed border-border bg-white px-3 py-5 text-center shadow-[var(--shadow-xs)] transition-all hover:border-brand-300 hover:shadow-[var(--shadow-sm)]"
            >
              <span className="font-display text-[var(--text-xl)] font-bold text-ink-300">A–Z</span>
              <span className="text-[var(--text-xs)] font-semibold text-ink-500">All makes</span>
            </Link>
          </div>
        </Container>
      </section>

      {/* ─────────────────────── BROWSE BY TYPE ─────────────────────────── */}
      <section className="py-[var(--section-y)]">
        <Container>
          <div className="mb-8">
            <SectionHeader eyebrow="Browse by body type" heading="Used vans for sale by body type" />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {BODY_TYPES.map((bt) => (
              <Link
                key={bt.label}
                href={bt.href}
                className="group overflow-hidden rounded-[var(--radius-xl)] border border-border bg-white shadow-[var(--shadow-xs)] transition-all duration-[var(--dur-base)] hover:-translate-y-1 hover:border-transparent hover:shadow-[var(--shadow-md)]"
              >
                {/* Coloured accent top bar */}
                <div
                  className="h-1.5 transition-all duration-[var(--dur-base)] group-hover:h-2"
                  style={{ background: bt.accent }}
                />
                <div className="p-4">
                  <p className="font-display text-[var(--text-base)] font-bold text-ink-900 leading-tight group-hover:text-brand-700 transition-colors">
                    {bt.label}
                  </p>
                  <p className="mt-1 text-[var(--text-xs)] text-ink-400">{bt.desc}</p>
                  <p className="mt-3 flex items-center gap-1 text-[var(--text-xs)] font-semibold text-ink-500 transition-colors group-hover:text-accent-600">
                    Browse
                    <IconArrow width={12} height={12} className="transition-transform group-hover:translate-x-0.5" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ──────────────────────── LATEST VANS ────────────────────────────── */}
      <section className="bg-surface-1 py-[var(--section-y)]">
        <Container>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <SectionHeader
              eyebrow="Fresh stock"
              heading="Latest vans for sale"
              sub={
                servedBy === "dealski"
                  ? `Live stock · ${total.toLocaleString()} vans available`
                  : "Sample listings from our catalogue."
              }
            />
            <Button href="/vans" variant="outline" size="md">
              View all {total.toLocaleString()} vans <IconArrow width={16} height={16} />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l, i) => (
              <ListingCard key={l.id} listing={l} priority={i < 3} cardIndex={i} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button href="/vans" variant="primary" size="lg">
              Browse all vans for sale <IconArrow width={18} height={18} />
            </Button>
          </div>
        </Container>
      </section>

      {/* ─────────────────────── TRUST SECTION ───────────────────────────── */}
      <section className="py-[var(--section-y)]">
        <Container>
          <div className="mx-auto mb-12 max-w-xl text-center">
            <SectionHeader eyebrow="Why Vansales" heading="The smarter way to buy a van" centered />
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {TRUST_POINTS.map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-5 rounded-[var(--radius-2xl)] border border-border bg-white p-7 shadow-[var(--shadow-xs)] transition-[box-shadow,transform] duration-[var(--dur-base)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] ${item.color}`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-display text-[var(--text-lg)] font-bold text-ink-900">{item.title}</h3>
                  <p className="mt-2 text-[var(--text-sm)] leading-relaxed text-ink-600">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ────────────────────── SELL / ADVERTISE ─────────────────────────── */}
      <section className="bg-surface-1 py-[var(--section-y)]">
        <Container>
          <div className="mb-10 text-center">
            <SectionHeader eyebrow="For sellers & dealers" heading="Two ways to list" centered />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {/* Private */}
            <div className="flex flex-col gap-5 rounded-[var(--radius-2xl)] border border-border bg-white p-8 shadow-[var(--shadow-sm)]">
              <Badge tone="success" className="self-start">Free to list</Badge>
              <div>
                <h3 className="font-display text-[var(--text-xl)] font-bold text-ink-900">Sell your van</h3>
                <p className="mt-2 text-[var(--text-md)] leading-relaxed text-ink-600">
                  List your van for free in under 5 minutes. Full spec, photos, direct enquiries.
                </p>
              </div>
              <ul className="space-y-2.5 text-[var(--text-sm)] text-ink-600">
                {["No listing fee — completely free", "Enquiries straight to you", "Photos + full spec published"].map((t) => (
                  <li key={t} className="flex items-center gap-2.5">
                    <IconCheck width={15} height={15} className="shrink-0 text-success-600" />{t}
                  </li>
                ))}
              </ul>
              <Button href="/sell" variant="primary" size="md" className="mt-auto">
                List your van free
              </Button>
            </div>

            {/* Dealer */}
            <div className="flex flex-col gap-5 rounded-[var(--radius-2xl)] border border-brand-200 bg-brand-50 p-8 shadow-[var(--shadow-sm)]">
              <Badge tone="brand" className="self-start">Powered by Dealski</Badge>
              <div>
                <h3 className="font-display text-[var(--text-xl)] font-bold text-ink-900">Trade &amp; dealer</h3>
                <p className="mt-2 text-[var(--text-md)] leading-relaxed text-ink-600">
                  Dealer stock syncs automatically via the Dealski feed. Your full inventory, live.
                </p>
              </div>
              <ul className="space-y-2.5 text-[var(--text-sm)] text-ink-600">
                {["Auto-sync from your DMS", "Full spec, photos and pricing", "Lead management included"].map((t) => (
                  <li key={t} className="flex items-center gap-2.5">
                    <IconCheck width={15} height={15} className="shrink-0 text-brand-600" />{t}
                  </li>
                ))}
              </ul>
              <Button href="/advertise" variant="brand" size="md" className="mt-auto">
                Dealer enquiry
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* ──────────────────── POPULAR MODELS STRIP ───────────────────────── */}
      <section className="py-[var(--section-y)]">
        <Container>
          <div className="mb-8">
            <SectionHeader eyebrow="Popular choices" heading="Most searched vans for sale" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {POPULAR_MODELS.map((m) => {
              const fakeListing = {
                make: m.make,
                model: m.model,
                van_spec: { body_style: m.body_style, wheelbase: null, roof_height: null, payload_kg: null, load_length_mm: null, doors: null },
              };
              return (
                <Link
                  key={m.slug}
                  href={`/vans/${m.slug}`}
                  className="group overflow-hidden rounded-[var(--radius-xl)] border border-border bg-white shadow-[var(--shadow-xs)] transition-all duration-[var(--dur-base)] hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[var(--shadow-md)]"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-surface-1">
                    <SpecCard listing={fakeListing as Parameters<typeof SpecCard>[0]["listing"]} className="size-full" />
                  </div>
                  <div className="flex items-center justify-between bg-white px-3 py-3">
                    <span className="truncate font-display text-[var(--text-sm)] font-bold text-ink-800 group-hover:text-brand-600">
                      {m.make} {m.model}
                    </span>
                    <IconArrow width={13} height={13} className="ml-1 shrink-0 text-ink-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" />
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ─────────────────── SEO CONTENT SECTION ─────────────────────────── */}
      <section className="bg-surface-1 py-[var(--section-y)]">
        <Container>
          <div className="mx-auto max-w-3xl">
            <SectionHeader eyebrow="About Vansales" heading="The UK's straight-talking van marketplace" />
            <div className="mt-6 space-y-4 text-[var(--text-md)] leading-relaxed text-ink-600">
              <p>
                Vansales brings together thousands of used and new vans for sale from trusted UK
                dealers in one searchable catalogue. Whether you need a compact{" "}
                <Link href="/vans/panel-van" className="font-semibold text-brand-600 hover:underline">panel van</Link>{" "}
                for last-mile deliveries, a{" "}
                <Link href="/vans/luton" className="font-semibold text-brand-600 hover:underline">Luton van</Link>{" "}
                for removals, or a{" "}
                <Link href="/vans/crew-van" className="font-semibold text-brand-600 hover:underline">crew cab</Link>{" "}
                for your trade team, you&rsquo;ll find it here.
              </p>
              <p>
                Every listing shows full spec — payload capacity, wheelbase, roof height, ULEZ
                compliance and Euro 6 status — so you can match van to job before you pick up the phone.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                { label: "Ford vans for sale",     href: "/vans/ford" },
                { label: "Volkswagen vans",         href: "/vans/volkswagen" },
                { label: "Mercedes vans",           href: "/vans/mercedes-benz" },
                { label: "Vauxhall vans",           href: "/vans/vauxhall" },
                { label: "Panel vans for sale",     href: "/vans/panel-van" },
                { label: "Luton vans for sale",     href: "/vans/luton" },
                { label: "Tipper vans for sale",    href: "/vans/tipper" },
                { label: "Electric vans for sale",  href: "/vans/electric" },
                { label: "Crew vans for sale",      href: "/vans/crew-van" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-[var(--radius-md)] border border-border bg-white px-3 py-2.5 text-[var(--text-sm)] font-semibold text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ──────────────────────── DARK CTA BAND ──────────────────────────── */}
      <section
        className="relative overflow-hidden py-20"
        style={{ background: "var(--gradient-brand-cta)" }}
      >
        <div className="hero-grid hero-lines absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute -right-40 top-1/2 -translate-y-1/2 size-[600px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #f47c1e 0%, transparent 70%)" }}
          aria-hidden
        />
        <Container className="relative text-center">
          <h2 className="font-display font-extrabold leading-tight text-white"
              style={{ fontSize: "var(--text-3xl)" }}>
            {total.toLocaleString()}+ vans for sale — one search.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[var(--text-lg)] leading-relaxed text-white/60">
            New vans, used vans, contract hire — Vansales brings every option together.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button href="/vans/used" variant="primary" size="lg">
              Browse used vans
            </Button>
            <Button href="/vans/new" variant="outline-light" size="lg">
              Browse new vans
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
