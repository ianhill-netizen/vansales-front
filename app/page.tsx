import Link from "next/link";
import { Container, Button, Badge } from "@/components/ui";
import { SearchHero } from "@/components/search-hero";
import { ListingCard } from "@/components/listing-card";
import { SpecCard } from "@/components/spec-card";
import { IconArrow, IconCheck, IconShield, IconBolt, IconSearch } from "@/components/icons";
import { getListings, getFacets } from "@/lib/listings/client";
import { slugify } from "@/lib/listings/slug";

/* Body-type browse tiles — gradient per body style */
const BODY_TYPES: { label: string; href: string; gradient: string }[] = [
  { label: "Panel vans",   href: "/vans?bodyStyle=panel-van",  gradient: "135deg, #0e2a6e 0%, #143a8c 100%" },
  { label: "Crew cabs",    href: "/vans?bodyStyle=crew-cab",   gradient: "135deg, #1e0e3a 0%, #3a1f6e 100%" },
  { label: "Pickups",      href: "/vans?bodyStyle=pickup",     gradient: "135deg, #0c1f42 0%, #163f7a 100%" },
  { label: "Luton vans",   href: "/vans?bodyStyle=luton",      gradient: "135deg, #0a2020 0%, #0f3030 100%" },
  { label: "Dropsides",    href: "/vans?bodyStyle=dropside",   gradient: "135deg, #1a1a0e 0%, #2a2a1a 100%" },
  { label: "Electric vans",href: "/vans?fuel=electric",        gradient: "135deg, #0a2010 0%, #0b5e28 100%" },
] as const;

/* Popular models strip — distinct spec-card style tiles */
const POPULAR_MODELS = [
  { make: "Volkswagen",    model: "Transporter",    slug: "volkswagen/transporter",    body_style: "Panel Van" },
  { make: "Ford",          model: "Transit",        slug: "ford/transit",              body_style: "Panel Van" },
  { make: "Mercedes-Benz", model: "Sprinter",       slug: "mercedes-benz/sprinter",    body_style: "Panel Van" },
  { make: "Ford",          model: "Transit Custom", slug: "ford/transit-custom",       body_style: "Panel Van" },
  { make: "Vauxhall",      model: "Vivaro",         slug: "vauxhall/vivaro",           body_style: "Panel Van" },
  { make: "Ford",          model: "Ranger",         slug: "ford/ranger",               body_style: "Pickup" },
] as const;

export default async function HomePage() {
  const [{ listings, total, servedBy }, facets] = await Promise.all([
    getListings({ sort: "newest", limit: 6 }),
    getFacets(),
  ]);

  const topMakes = facets.makes.slice(0, 10);

  return (
    <>
      {/* ──────────────────────── HERO ──────────────────────────── */}
      <section className="hero-grid relative overflow-hidden bg-ink-900">
        {/* Subtle radial highlight — top-left */}
        <div
          className="pointer-events-none absolute -left-40 -top-40 size-[600px] rounded-full opacity-20"
          aria-hidden
          style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)" }}
        />

        <Container className="relative z-10 pb-28 pt-14 sm:pt-20 lg:pb-36 lg:pt-24">
          {/* Eyebrow */}
          <p className="mb-5 inline-block rounded-[var(--radius-pill)] border border-white/20 bg-white/8 px-3 py-1 font-mono text-[var(--text-xs)] uppercase tracking-[var(--tracking-eyebrow)] text-white/65">
            UK&rsquo;s commercial van marketplace
          </p>

          {/* Headline */}
          <h1 className="max-w-2xl font-display text-[clamp(2.4rem,1.5rem+4vw,3.8rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-white">
            Find your next van.{" "}
            <span className="text-accent-400">Straight-talking.</span>
          </h1>

          {/* Sub-headline */}
          <p className="mt-5 max-w-xl text-[var(--text-md)] leading-relaxed text-white/65">
            {total.toLocaleString()}+ used and new vans from verified UK dealers — compare by
            payload, wheelbase and ULEZ status, not just price.
          </p>

          {/* Trust strip */}
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2">
            {[
              { icon: <IconShield width={14} height={14} />, label: "Verified dealers only" },
              { icon: <IconBolt width={14} height={14} />,   label: "Live stock, updated daily" },
              { icon: <IconSearch width={14} height={14} />, label: "Spec-first search" },
            ].map((t) => (
              <span key={t.label} className="flex items-center gap-1.5 text-[var(--text-sm)] text-white/55">
                <span className="text-brand-400">{t.icon}</span>
                {t.label}
              </span>
            ))}
          </div>
        </Container>

        {/* Search pill — overlaps hero bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-1/2 px-[var(--gutter)]">
          <div className="mx-auto max-w-[var(--container-max)]">
            <SearchHero total={total} />
          </div>
        </div>
      </section>

      {/* Spacer for the overhanging search pill */}
      <div className="h-16 bg-surface-1 sm:h-20" />

      {/* ──────────────────── BROWSE BY MAKE ────────────────────── */}
      <section className="bg-surface-1 pb-14 pt-4">
        <Container>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="eyebrow">Browse by make</p>
              <h2 className="mt-1 font-display text-[var(--text-2xl)] font-bold text-ink-900">
                Your trusted van marketplace
              </h2>
            </div>
            <Link href="/directory" className="hidden items-center gap-1.5 text-[var(--text-sm)] font-semibold text-brand-600 hover:text-brand-700 sm:flex">
              All makes <IconArrow width={14} height={14} />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {topMakes.map((m) => (
              <Link
                key={m.value}
                href={`/vans/${slugify(m.value)}`}
                className="group flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-border bg-white px-3 py-4 text-center shadow-[var(--shadow-xs)] transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-[var(--shadow-md)]"
              >
                <span className="font-display text-[var(--text-base)] font-bold text-ink-800 group-hover:text-brand-600">
                  {m.value}
                </span>
                <span className="rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[var(--text-xs)] text-ink-500">
                  {m.count}
                </span>
              </Link>
            ))}
            <Link
              href="/directory"
              className="flex flex-col items-center justify-center gap-1 rounded-[var(--radius-lg)] border border-dashed border-border bg-white px-3 py-4 text-center shadow-[var(--shadow-xs)] transition-colors hover:border-brand-500/40 hover:text-brand-600"
            >
              <span className="text-[var(--text-xl)] font-bold text-ink-300">A–Z</span>
              <span className="text-[var(--text-xs)] font-semibold text-ink-500">All makes</span>
            </Link>
          </div>
        </Container>
      </section>

      {/* ─────────────────────── BROWSE BY TYPE ──────────────────── */}
      <section className="py-12">
        <Container>
          <div className="mb-5">
            <p className="eyebrow">Browse by body type</p>
            <h2 className="mt-1 font-display text-[var(--text-2xl)] font-bold text-ink-900">
              Start with the shape of the job
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {BODY_TYPES.map((bt) => (
              <Link
                key={bt.label}
                href={bt.href}
                className="group overflow-hidden rounded-[var(--radius-lg)] border border-border shadow-[var(--shadow-xs)] transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-[var(--shadow-md)]"
              >
                {/* Gradient panel */}
                <div
                  className="flex aspect-[4/3] items-end p-4 text-white"
                  style={{ background: `linear-gradient(${bt.gradient})` }}
                  aria-hidden
                >
                  <span className="font-display text-[var(--text-base)] font-bold leading-tight text-white/90">
                    {bt.label}
                  </span>
                </div>
                {/* Footer */}
                <div className="flex items-center justify-between bg-white px-3 py-2.5">
                  <span className="text-[var(--text-sm)] font-semibold text-ink-700 group-hover:text-brand-600">
                    Browse
                  </span>
                  <IconArrow width={13} height={13} className="shrink-0 text-ink-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" />
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ─────────────────────── LATEST VANS ─────────────────────── */}
      <section className="bg-surface-1 py-12">
        <Container>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Fresh stock</p>
              <h2 className="mt-1 font-display text-[var(--text-2xl)] font-bold text-ink-900">
                Latest vans added
              </h2>
              <p className="mt-1 text-[var(--text-sm)] text-ink-500">
                {servedBy === "dealski"
                  ? `Live stock from Swiss Vans · ${total.toLocaleString()} vans available`
                  : "Showing sample listings."}
              </p>
            </div>
            <Button href="/vans" variant="outline" size="md">
              View all {total.toLocaleString()} vans <IconArrow width={16} height={16} />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l, i) => (
              <ListingCard key={l.id} listing={l} priority={i < 3} cardIndex={i} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button href="/vans" variant="primary" size="lg">
              Browse all vans <IconArrow width={18} height={18} />
            </Button>
          </div>
        </Container>
      </section>

      {/* ─────────────── WHY VANSALES — TRUST SECTION ───────────── */}
      <section className="py-14">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow">Why Vansales</p>
            <h2 className="mt-2 font-display text-[var(--text-2xl)] font-bold text-ink-900">
              The smarter way to buy a van
            </h2>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {[
              {
                title: "Verified dealers only",
                body: "Every dealer on Vansales is verified and rated. No private sellers hiding problems.",
                icon: "🛡️",
              },
              {
                title: "Live stock, not stale listings",
                body: "Our catalogue syncs directly from dealer stock systems — what you see is what&apos;s available.",
                icon: "⚡",
              },
              {
                title: "Spec-first search",
                body: "Filter by payload, wheelbase, ULEZ zone compliance and Euro 6 status — not just price.",
                icon: "🔧",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[var(--radius-xl)] border border-border bg-white p-6 shadow-[var(--shadow-xs)]"
              >
                <div className="mb-3 text-3xl" role="img" aria-hidden>{item.icon}</div>
                <h3 className="font-display text-[var(--text-lg)] font-bold text-ink-900">{item.title}</h3>
                <p className="mt-2 text-[var(--text-sm)] leading-relaxed text-ink-600"
                   dangerouslySetInnerHTML={{ __html: item.body }} />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─────────────── SELL / ADVERTISE BLOCK ─────────────────── */}
      <section className="bg-surface-1 py-14">
        <Container>
          <div className="mb-7 text-center">
            <p className="eyebrow">For sellers &amp; dealers</p>
            <h2 className="mt-2 font-display text-[var(--text-2xl)] font-bold text-ink-900">Two ways to list</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {/* Private */}
            <div className="flex flex-col gap-4 rounded-[var(--radius-xl)] border border-border bg-white p-7 shadow-[var(--shadow-sm)]">
              <Badge tone="success" className="self-start">Free</Badge>
              <div>
                <h3 className="font-display text-[var(--text-xl)] font-bold text-ink-900">Sell your van</h3>
                <p className="mt-2 text-[var(--text-md)] leading-relaxed text-ink-600">
                  List your van for free in under 5 minutes. Full spec, photos, direct enquiries.
                </p>
              </div>
              <ul className="space-y-1.5 text-[var(--text-sm)] text-ink-600">
                {["No listing fee — completely free", "Enquiries straight to you", "Photos + full spec published"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <IconCheck width={15} height={15} className="shrink-0 text-success-600" />{t}
                  </li>
                ))}
              </ul>
              <Button href="/sell" variant="primary" size="md" className="mt-auto">
                List your van free
              </Button>
            </div>

            {/* Trade */}
            <div className="flex flex-col gap-4 rounded-[var(--radius-xl)] border border-border bg-white p-7 shadow-[var(--shadow-sm)]">
              <Badge tone="brand" className="self-start">Powered by Dealski</Badge>
              <div>
                <h3 className="font-display text-[var(--text-xl)] font-bold text-ink-900">Trade &amp; dealer</h3>
                <p className="mt-2 text-[var(--text-md)] leading-relaxed text-ink-600">
                  Dealer stock syncs automatically via the Dealski feed. Your full inventory, live.
                </p>
              </div>
              <ul className="space-y-1.5 text-[var(--text-sm)] text-ink-600">
                {["Auto-sync from your DMS", "Full spec, photos and pricing", "Lead management included"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <IconCheck width={15} height={15} className="shrink-0 text-brand-600" />{t}
                  </li>
                ))}
              </ul>
              <Button href="/advertise" variant="outline" size="md" className="mt-auto">
                Dealer enquiry
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* ───────────────── POPULAR MODELS STRIP ─────────────────── */}
      <section className="py-14">
        <Container>
          <div className="mb-5">
            <p className="eyebrow">Popular choices</p>
            <h2 className="mt-1 font-display text-[var(--text-2xl)] font-bold text-ink-900">Most searched vans</h2>
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
                  className="group overflow-hidden rounded-[var(--radius-lg)] border border-border bg-white shadow-[var(--shadow-xs)] transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-[var(--shadow-md)]"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <SpecCard listing={fakeListing as Parameters<typeof SpecCard>[0]["listing"]} className="size-full" />
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5 bg-white">
                    <span className="text-[var(--text-sm)] font-bold text-ink-800 group-hover:text-brand-600 truncate">
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

      {/* ─────────────────── DARK CTA BAND ──────────────────────── */}
      <section className="relative overflow-hidden bg-ink-900 py-14">
        <div className="hero-grid absolute inset-0" aria-hidden />
        <Container className="relative text-center">
          <h2 className="font-display text-[var(--text-3xl)] font-extrabold leading-tight text-white">
            {total.toLocaleString()}+ vans, one search.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[var(--text-lg)] leading-relaxed text-white/70">
            New vans, used vans, contract hire — Vansales brings every option together.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/vans?condition=used" variant="primary" size="lg">
              Browse used vans
            </Button>
            <Button href="/vans?condition=new" variant="accent" size="lg">
              Browse new vans
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
