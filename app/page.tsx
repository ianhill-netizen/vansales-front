import Image from "next/image";
import Link from "next/link";
import { Container, Button, Badge } from "@/components/ui";
import { SearchHero } from "@/components/search-hero";
import { ListingCard } from "@/components/listing-card";
import { VanPhoto } from "@/components/van-photo";
import { IconArrow, IconCheck } from "@/components/icons";
import { getListings, getFacets } from "@/lib/listings/client";
import { slugify } from "@/lib/listings/slug";

/* ─────────────────────────────────────────────────────────────────────────────
   Hero image — clean studio photo of a white VW Transporter.
   Source: Unsplash, photo ID 1621929747188 (check /admin to swap if needed).
   The photo appears on the dark-navy right panel with a left-side gradient fade.
   ───────────────────────────────────────────────────────────────────────────── */
const HERO_IMG =
  "https://images.unsplash.com/photo-1621929747188-0b4dc28498d2?auto=format&fit=crop&w=1000&q=80";

const HERO_VAN = { colour: "Pure White", make: "Volkswagen", model: "Transporter", plate: "74" };

/* Browse by type tiles — curated body-style filter links */
const BODY_TYPES = [
  { label: "Panel vans", href: "/vans?bodyStyle=panel-van", colour: "Reflex Silver" },
  { label: "Crew cabs", href: "/vans?bodyStyle=crew-cab", colour: "Deep Black" },
  { label: "Pickups", href: "/vans?bodyStyle=pickup", colour: "Mojave Beige" },
  { label: "Luton vans", href: "/vans?bodyStyle=luton", colour: "Starlight Blue" },
  { label: "Dropsides", href: "/vans?bodyStyle=dropside", colour: "Cherry Red" },
  { label: "Electric vans", href: "/vans?fuel=electric", colour: "Ocean Blue" },
] as const;

export default async function HomePage() {
  const [{ listings, total, servedBy }, facets] = await Promise.all([
    getListings({ sort: "newest", limit: 6 }),
    getFacets(),
  ]);

  /* Top makes by count from live catalogue */
  const topMakes = facets.makes.slice(0, 10);

  return (
    <>
      {/* ──────────────────────── HERO BAND ──────────────────────────── */}
      <section className="relative overflow-hidden bg-ink-900">
        {/* Van photo — right half, fades left into the navy band */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[50%] lg:block" aria-hidden>
          <div className="absolute inset-y-0 left-0 z-10 w-2/5 bg-gradient-to-r from-ink-900 to-transparent" />
          <div className="absolute inset-0">
            <Image
              src={HERO_IMG}
              alt="Clean professional van"
              fill
              priority
              sizes="50vw"
              className="object-cover object-center"
            />
          </div>
        </div>

        <Container className="relative z-10 pb-28 pt-12 lg:pb-32 lg:pt-16">
          <div className="max-w-lg">
            <p className="mb-4 inline-block rounded-[var(--radius-pill)] border border-white/20 bg-white/10 px-3 py-1 font-mono text-[var(--text-xs)] uppercase tracking-[var(--tracking-eyebrow)] text-white/70">
              UK&rsquo;s commercial van marketplace
            </p>
            <h1 className="font-display text-[clamp(2.2rem,1.4rem+4vw,3.5rem)] font-extrabold leading-[1.04] tracking-[-0.03em] text-white">
              Find your next van. Fast.
            </h1>
            <p className="mt-4 max-w-md text-[var(--text-md)] leading-relaxed text-white/70">
              Compare {total.toLocaleString()}+ used and new vans from trusted UK dealers — filter
              by payload, wheelbase, ULEZ status and the numbers that matter.
            </p>
          </div>
        </Container>

        {/* Search pill — overlaps the bottom of the hero */}
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
                className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-border bg-white shadow-[var(--shadow-xs)] transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-[var(--shadow-md)]"
              >
                <div className="aspect-[4/3] bg-surface-1">
                  <VanPhoto
                    listing={{ colour: bt.colour, make: "Van", model: bt.label, plate: "" }}
                    index={0}
                    bodyStyle={bt.label}
                    className="size-full"
                  />
                </div>
                <div className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[var(--text-sm)] font-bold text-ink-800 group-hover:text-brand-600">
                    {bt.label}
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
                body: "Our catalogue syncs directly from dealer stock systems — what you see is what's available.",
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
                <p className="mt-2 text-[var(--text-sm)] leading-relaxed text-ink-600">{item.body}</p>
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
            {[
              { make: "volkswagen", model: "transporter", label: "VW Transporter", colour: "Starlight Blue", bs: "Panel Van" },
              { make: "ford", model: "transit", label: "Ford Transit", colour: "Frozen White", bs: "Panel Van" },
              { make: "mercedes-benz", model: "sprinter", label: "Mercedes Sprinter", colour: "Polar White", bs: "Panel Van" },
              { make: "ford", model: "transit-custom", label: "Ford Transit Custom", colour: "Reflex Silver", bs: "Panel Van" },
              { make: "vauxhall", model: "vivaro", label: "Vauxhall Vivaro", colour: "Deep Black", bs: "Panel Van" },
              { make: "ford", model: "ranger", label: "Ford Ranger", colour: "Mojave Beige", bs: "Pickup" },
            ].map((m) => (
              <Link
                key={`${m.make}/${m.model}`}
                href={`/vans/${m.make}/${m.model}`}
                className="group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-white shadow-[var(--shadow-xs)] transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-[var(--shadow-md)]"
              >
                <div className="aspect-[4/3] overflow-hidden bg-surface-1">
                  <VanPhoto
                    listing={{ colour: m.colour, make: m.label.split(" ").slice(1).join(" "), model: m.model, plate: "" }}
                    index={0}
                    bodyStyle={m.bs}
                    className="size-full"
                  />
                </div>
                <div className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[var(--text-sm)] font-bold text-ink-800 group-hover:text-brand-600">
                    {m.label}
                  </span>
                  <IconArrow width={13} height={13} className="shrink-0 text-ink-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" />
                </div>
              </Link>
            ))}
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
