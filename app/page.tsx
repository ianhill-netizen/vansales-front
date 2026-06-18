import { Container, Eyebrow, Button, Badge } from "@/components/ui";
import { SearchHero } from "@/components/search-hero";
import { CategoryStrip } from "@/components/category-strip";
import { ListingCard } from "@/components/listing-card";
import { VanPhoto } from "@/components/van-photo";
import { IconShield, IconCheck, IconArrow, IconStar } from "@/components/icons";
import { getListings } from "@/lib/listings/client";

export default async function HomePage() {
  const { listings, total, servedBy } = await getListings({ sort: "newest", limit: 6 });
  const featured = listings;

  return (
    <>
      {/* ─────────────────────────── Hero ─────────────────────────── */}
      <section className="relative overflow-hidden bg-ink-900 text-white">
        <div className="hero-grid absolute inset-0 opacity-70" aria-hidden />
        <div
          className="absolute inset-0 opacity-90"
          aria-hidden
          style={{
            background:
              "radial-gradient(120% 90% at 85% 0%, rgba(255,122,26,0.18), transparent 55%), radial-gradient(80% 70% at 0% 100%, rgba(27,127,152,0.20), transparent 60%)",
          }}
        />
        {/* Ghost van — the subject, large and confident, behind the copy */}
        <div className="pointer-events-none absolute -right-20 bottom-0 hidden w-[640px] opacity-[0.16] lg:block" aria-hidden>
          <VanPhoto
            listing={{ colour: "Reflex Silver", make: "VW", model: "Transporter", plate: "" }}
            index={0}
            plate={false}
            className="h-auto w-full"
          />
        </div>

        <Container className="relative py-[clamp(3.5rem,8vw,6.5rem)]">
          <div className="max-w-2xl">
            <Eyebrow className="text-accent-400">UK van marketplace</Eyebrow>
            <h1 className="mt-4 font-display text-[var(--text-4xl)] font-extrabold leading-[1.02] tracking-[var(--tracking-display)]">
              The van that
              <br />
              earns its keep.
            </h1>
            <p className="mt-5 max-w-xl text-[var(--text-lg)] leading-relaxed text-white/70">
              Compare {total}+ used and new vans from trusted UK dealers and private sellers —
              by payload, wheelbase, ULEZ status and the numbers that actually matter on the job.
            </p>
          </div>

          <div className="mt-8 max-w-3xl">
            <SearchHero />
          </div>

          <ul className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[var(--text-sm)] text-white/70">
            <li className="flex items-center gap-2"><IconShield width={16} height={16} className="text-accent-400" /> Verified UK dealers</li>
            <li className="flex items-center gap-2"><IconCheck width={16} height={16} className="text-accent-400" /> Full spec on every van</li>
            <li className="flex items-center gap-2"><IconCheck width={16} height={16} className="text-accent-400" /> No-VAT &amp; VAT-qualifying clearly flagged</li>
          </ul>
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

      {/* ───────────────────────── Featured ───────────────────────── */}
      <section className="pb-[var(--section-y)]">
        <Container>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Fresh on the forecourt</Eyebrow>
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
              <ListingCard key={l.id} listing={l} priority={i < 3} />
            ))}
          </div>
        </Container>
      </section>

      {/* ─────────────────────── Sell / trust band ────────────────── */}
      <section id="sell" className="scroll-mt-20">
        <Container>
          <div className="relative overflow-hidden rounded-[var(--radius-2xl)] bg-brand-700 px-6 py-10 text-white sm:px-10 sm:py-12">
            <div className="hero-grid absolute inset-0 opacity-50" aria-hidden />
            <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <Badge tone="accent" className="bg-accent-500 text-white">For sellers</Badge>
                <h2 className="mt-3 max-w-lg font-display text-[var(--text-3xl)] font-extrabold leading-tight text-white">
                  List your van where the trade looks first.
                </h2>
                <p className="mt-3 max-w-md text-[var(--text-md)] leading-relaxed text-white/75">
                  Dealers and private sellers reach thousands of UK buyers a week. Add the spec,
                  set your price, and field enquiries in one place.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button href="/#" variant="primary" size="lg">Sell your van</Button>
                  <Button href="/#" variant="ghost" size="lg" className="text-white hover:bg-white/10">
                    How it works
                  </Button>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-4">
                {[
                  { n: "2,400+", l: "vans listed weekly" },
                  { n: "4.8/5", l: "average dealer rating", star: true },
                  { n: "48 hrs", l: "average time to first enquiry" },
                  { n: "100%", l: "spec-checked listings" },
                ].map((s) => (
                  <div key={s.l} className="rounded-[var(--radius-lg)] bg-white/10 p-4 backdrop-blur">
                    <dd className="flex items-center gap-1.5 font-display text-[var(--text-2xl)] font-extrabold text-white">
                      {s.n}
                      {s.star && <IconStar width={18} height={18} className="text-plate" />}
                    </dd>
                    <dt className="mt-1 text-[var(--text-sm)] text-white/70">{s.l}</dt>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
