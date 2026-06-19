import Image from "next/image";
import Link from "next/link";
import { Container, Eyebrow, Button, Badge } from "@/components/ui";
import { SearchHero } from "@/components/search-hero";
import { CategoryStrip } from "@/components/category-strip";
import { ListingCard } from "@/components/listing-card";
import { IconArrow, IconCheck } from "@/components/icons";
import { getListings } from "@/lib/listings/client";
import { modelImageSet } from "@/lib/models/image";

const POPULAR_MODELS = [
  { makeSlug: "volkswagen", modelSlug: "transporter", label: "VW Transporter" },
  { makeSlug: "ford", modelSlug: "transit", label: "Ford Transit" },
  { makeSlug: "mercedes-benz", modelSlug: "sprinter", label: "Mercedes Sprinter" },
  { makeSlug: "ford", modelSlug: "transit-custom", label: "Ford Transit Custom" },
  { makeSlug: "vauxhall", modelSlug: "vivaro", label: "Vauxhall Vivaro" },
  { makeSlug: "ford", modelSlug: "ranger", label: "Ford Ranger" },
];

export default async function HomePage() {
  const { listings, total, servedBy } = await getListings({ sort: "newest", limit: 6 });
  const featured = listings;

  const heroVanSet = modelImageSet("volkswagen", "transporter");
  const heroVanImg = heroVanSet?.find((i) => i.fit === "cover") ?? heroVanSet?.[0] ?? null;

  const popularModels = POPULAR_MODELS.map((m) => {
    const set = modelImageSet(m.makeSlug, m.modelSlug);
    const img = set?.find((i) => i.fit === "cover") ?? set?.[0] ?? null;
    return { ...m, img };
  });

  return (
    <>
      {/* ─────────────────────────── Hero — light ─────────────────────────── */}
      <section className="relative overflow-hidden bg-white">
        {heroVanImg && (
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] lg:block" aria-hidden>
            <div className="absolute inset-y-0 left-0 z-10 w-1/3 bg-gradient-to-r from-white to-transparent" />
            <Image
              src={heroVanImg.src}
              alt=""
              fill
              priority
              sizes="48vw"
              className="object-cover object-center"
            />
          </div>
        )}

        <Container className="relative py-[clamp(3.5rem,8vw,6rem)]">
          <div className="max-w-2xl">
            <Eyebrow>UK van marketplace</Eyebrow>
            <h1 className="mt-4 font-display text-[var(--text-4xl)] font-extrabold leading-[1.02] tracking-[var(--tracking-display)] text-ink-900">
              The van that{" "}
              <em className="not-italic rounded-sm bg-accent-500 px-1.5 text-plate-ink">earns</em>
              {" "}its keep.
            </h1>
            <p className="mt-5 max-w-xl text-[var(--text-lg)] leading-relaxed text-ink-600">
              Compare {total}+ used and new vans from trusted UK dealers and private sellers —
              by payload, wheelbase, ULEZ status and the numbers that matter on the job.
            </p>
          </div>

          <div className="mt-8 max-w-3xl">
            <SearchHero />
          </div>

          <p className="mt-4 flex flex-wrap items-center gap-x-4 font-mono text-[var(--text-xs)] uppercase tracking-[var(--tracking-eyebrow)] text-ink-400">
            <span>{total.toLocaleString()} vans live</span>
            <span aria-hidden>·</span>
            <span>private &amp; trade</span>
            <span aria-hidden>·</span>
            <span>1,500+ reviews</span>
          </p>
        </Container>
      </section>

      {/* ───────────────────────── Categories ─────────────────────── */}
      <section id="browse" className="scroll-mt-20 py-[var(--section-y)]">
        <Container>
          <div className="mb-6">
            <Eyebrow>Browse by body type</Eyebrow>
            <h2 className="mt-2 font-display text-[var(--text-2xl)] font-bold text-ink-900">
              Start with the shape of the job
            </h2>
          </div>
          <CategoryStrip />
        </Container>
      </section>

      {/* ──────────────────────── Popular models ─────────────────── */}
      <section className="py-[var(--section-y)]">
        <Container>
          <div className="mb-6">
            <Eyebrow>Browse by model</Eyebrow>
            <h2 className="mt-2 font-display text-[var(--text-2xl)] font-bold text-ink-900">
              Popular models
            </h2>
          </div>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {popularModels.map((m) => (
              <li key={`${m.makeSlug}/${m.modelSlug}`}>
                <Link
                  href={`/vans/${m.makeSlug}/${m.modelSlug}`}
                  className="group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card shadow-[var(--shadow-xs)] transition-[box-shadow,transform,border-color] duration-[var(--dur-base)] hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-md)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
                    {m.img ? (
                      <Image
                        src={m.img.src}
                        alt={m.img.alt || m.label}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
                        className={m.img.fit === "contain" ? "object-contain p-2" : "object-cover"}
                      />
                    ) : (
                      <div className="size-full bg-surface-2" />
                    )}
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <span className="text-[var(--text-sm)] font-semibold text-ink-800 group-hover:text-brand-700">
                      {m.label}
                    </span>
                    <IconArrow width={14} height={14} className="shrink-0 text-ink-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-700" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ───────────────────────── Featured listings ───────────────────────── */}
      <section className="pb-[var(--section-y)]">
        <Container>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Fresh stock</Eyebrow>
              <h2 className="mt-2 font-display text-[var(--text-2xl)] font-bold text-ink-900">
                Recently listed vans
              </h2>
              <p className="mt-1 text-[var(--text-sm)] text-ink-500">
                {servedBy === "dealski"
                  ? "Live stock from Swiss Vans via the Dealski feed."
                  : "Showing demonstration listings."}
              </p>
            </div>
            <Button href="/vans/volkswagen/transporter" variant="outline" size="md">
              See all VW Transporters <IconArrow width={16} height={16} />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((l, i) => (
              <ListingCard key={l.id} listing={l} priority={i < 3} cardIndex={i} />
            ))}
          </div>
        </Container>
      </section>

      {/* ─────────────────────── Dual-advertiser block ──────────────────────── */}
      <section id="sell" className="scroll-mt-20 bg-surface-1 py-[var(--section-y)]">
        <Container>
          <div className="mb-8 text-center">
            <Eyebrow>For sellers</Eyebrow>
            <h2 className="mt-2 font-display text-[var(--text-2xl)] font-bold text-ink-900">
              Selling a van? Two ways in.
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {/* Private seller */}
            <div className="flex flex-col gap-5 rounded-[var(--radius-xl)] border border-border bg-white p-7 shadow-[var(--shadow-sm)]">
              <Badge tone="success" className="self-start">Free</Badge>
              <div>
                <h3 className="font-display text-[var(--text-xl)] font-bold text-ink-900">Private seller</h3>
                <p className="mt-2 text-[var(--text-md)] leading-relaxed text-ink-600">
                  List your van for free in under 5 minutes. Full spec, photos, direct enquiries.
                </p>
              </div>
              <ul className="space-y-2 text-[var(--text-sm)] text-ink-600">
                <li className="flex items-center gap-2">
                  <IconCheck width={16} height={16} className="shrink-0 text-success-600" />
                  No listing fee — completely free
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck width={16} height={16} className="shrink-0 text-success-600" />
                  Enquiries straight to you
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck width={16} height={16} className="shrink-0 text-success-600" />
                  Full spec and photos published
                </li>
              </ul>
              <Button href="/#" variant="primary" size="md" className="mt-auto">
                List free — takes 5 min
              </Button>
            </div>

            {/* Dealer / trade */}
            <div className="flex flex-col gap-5 rounded-[var(--radius-xl)] border border-border bg-white p-7 shadow-[var(--shadow-sm)]">
              <Badge tone="brand" className="self-start">Dealski-powered</Badge>
              <div>
                <h3 className="font-display text-[var(--text-xl)] font-bold text-ink-900">Trade &amp; dealer</h3>
                <p className="mt-2 text-[var(--text-md)] leading-relaxed text-ink-600">
                  Dealer stock syncs automatically via the Dealski feed. Your full inventory, live.
                </p>
              </div>
              <ul className="space-y-2 text-[var(--text-sm)] text-ink-600">
                <li className="flex items-center gap-2">
                  <IconCheck width={16} height={16} className="shrink-0 text-brand-700" />
                  Auto-sync from your DMS
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck width={16} height={16} className="shrink-0 text-brand-700" />
                  Full spec and photos
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck width={16} height={16} className="shrink-0 text-brand-700" />
                  Enquiry management included
                </li>
              </ul>
              <Button href="/#" variant="outline" size="md" className="mt-auto">
                Enquire about dealer listing
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* ─────────────────────── Dark CTA band — ONE dark section ──────────── */}
      <section className="relative overflow-hidden bg-ink-900 py-[var(--section-y)]">
        <div className="hero-grid absolute inset-0" aria-hidden />
        <Container>
          <div className="relative text-center">
            <h2 className="font-display text-[var(--text-3xl)] font-extrabold leading-tight text-white">
              Got a van to sell?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[var(--text-lg)] leading-relaxed text-white/70">
              Put it in front of thousands of UK buyers. List free in under 5 minutes.
            </p>
            <div className="mt-8">
              <Button href="/#sell" variant="accent" size="lg">
                List your van free
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
