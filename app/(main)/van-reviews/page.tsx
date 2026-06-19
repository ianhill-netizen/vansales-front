import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui";
import { IconArrow, IconStar } from "@/components/icons";
import { getModelIndex } from "@/lib/listings/client";
import { slugify } from "@/lib/listings/slug";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Van Reviews | Expert Guides by Model",
  description: `In-depth reviews of the UK's most popular vans. Real-world pros, cons and who each van suits best — from the ${SITE.name} team.`,
};

const FEATURED: {
  make: string;
  model: string;
  tag: string;
  verdict: string;
  pros: string[];
  con: string;
}[] = [
  {
    make: "Ford",
    model: "Transit Custom",
    tag: "Best medium van",
    verdict: "The Transit Custom is the benchmark medium van for good reason — polished interior, strong resale value and one of the best driving experiences in class. The 2024 PHEV version extends its lead for city operators.",
    pros: ["Class-leading cabin quality", "Strong second-hand market", "Wide dealer and parts network"],
    con: "Pricier new than some rivals",
  },
  {
    make: "Volkswagen",
    model: "Transporter",
    tag: "Premium compact",
    verdict: "The T6.1 Transporter commands a price premium that's hard to justify purely on load space — but the DSG gearbox, refined ride and resale hold make it a compelling long-term fleet choice.",
    pros: ["Outstanding build quality", "Exceptional residuals", "Smooth DSG auto available"],
    con: "Load volume smaller than rivals at the same price point",
  },
  {
    make: "Mercedes-Benz",
    model: "Sprinter",
    tag: "Best large van",
    verdict: "The Sprinter's wide body, huge payload range and comprehensive spec options make it the default choice for anyone who needs serious large van capability. The MBUX system and ADAS suite set it apart.",
    pros: ["Enormous payload and volume choice", "Best ADAS suite in class", "Comfortable for long-distance drivers"],
    con: "Maintenance costs are higher than Ford Transit",
  },
  {
    make: "Renault",
    model: "Trafic",
    tag: "Value medium",
    verdict: "The Trafic punches above its price — the 130 EDC auto is surprisingly refined and the load bay dimensions beat the Transit Custom at an often lower acquisition cost.",
    pros: ["Competitive pricing", "Practical, squared-off load bay", "Auto option available"],
    con: "Interior quality lags behind VW and Ford",
  },
  {
    make: "Vauxhall",
    model: "Vivaro",
    tag: "Fleet workhorse",
    verdict: "Platform-shared with the Trafic and Citroën Dispatch, the Vivaro-e EV stands out as one of the most usable electric vans for sub-100-mile daily rounds. The diesel is solid if unspectacular.",
    pros: ["Electric variant suits city fleets", "Shared platform means wide parts availability", "Competitive list prices"],
    con: "Less distinctive than either sibling platform",
  },
  {
    make: "Toyota",
    model: "Proace",
    tag: "Reliability pick",
    verdict: "Toyota's reliability record lends the Proace a strong appeal to buyers who prioritise low downtime over lowest acquisition cost. The Electric variant has real range. A quiet but capable fleet choice.",
    pros: ["Toyota reliability reputation", "Long manufacturer warranty", "Electric variant with usable range"],
    con: "Dealer network less dense than Ford or Vauxhall",
  },
];

export default async function VanReviewsPage() {
  const index = await getModelIndex();
  const topMakes = [...new Set(index.map((e) => e.make))].slice(0, 12);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-surface-1">
        <Container className="py-12">
          <Eyebrow>Van Reviews</Eyebrow>
          <h1 className="mt-3 font-display text-[var(--text-3xl)] font-extrabold leading-tight text-ink-900">
            Expert van reviews
          </h1>
          <p className="mt-3 max-w-xl text-[var(--text-md)] leading-relaxed text-ink-600">
            In-depth guides to the UK&apos;s most popular commercial vans — real-world pros, cons and who
            each model suits best. No manufacturer money, no sponsored rankings.
          </p>
        </Container>
      </section>

      {/* Featured reviews */}
      <section className="py-14">
        <Container>
          <div className="mb-8">
            <Eyebrow>Our picks</Eyebrow>
            <h2 className="mt-2 font-display text-[var(--text-2xl)] font-bold text-ink-900">Most searched-for models</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED.map((r) => (
              <article
                key={`${r.make}-${r.model}`}
                className="flex flex-col rounded-[var(--radius-xl)] border border-border bg-white p-7 shadow-[var(--shadow-xs)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-flex rounded-full bg-brand-tint px-2.5 py-0.5 text-[var(--text-xs)] font-semibold text-brand-700">
                      {r.tag}
                    </span>
                    <h3 className="mt-2 font-display text-[var(--text-lg)] font-bold text-ink-900">
                      {r.make} {r.model}
                    </h3>
                  </div>
                  <div className="flex shrink-0 gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <IconStar key={i} width={14} height={14} />
                    ))}
                  </div>
                </div>
                <p className="mt-3 flex-1 text-[var(--text-sm)] leading-relaxed text-ink-600">{r.verdict}</p>
                <div className="mt-4 space-y-1">
                  {r.pros.map((p) => (
                    <p key={p} className="flex items-start gap-2 text-[var(--text-xs)] text-success-700">
                      <span className="mt-0.5 shrink-0">✓</span>{p}
                    </p>
                  ))}
                  <p className="flex items-start gap-2 text-[var(--text-xs)] text-ink-500">
                    <span className="mt-0.5 shrink-0">✕</span>{r.con}
                  </p>
                </div>
                <Link
                  href={`/vans/${slugify(r.make)}/${slugify(r.model)}`}
                  className="mt-5 flex items-center gap-1.5 text-[var(--text-sm)] font-semibold text-brand-600 hover:underline"
                >
                  See {r.make} {r.model} stock <IconArrow width={15} height={15} />
                </Link>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* Browse by make */}
      <section className="bg-surface-1 py-14">
        <Container>
          <div className="mb-6">
            <Eyebrow>Browse by make</Eyebrow>
            <h2 className="mt-2 font-display text-[var(--text-2xl)] font-bold text-ink-900">Explore stock by brand</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {topMakes.map((make) => (
              <Link
                key={make}
                href={`/vans/${slugify(make)}`}
                className="rounded-[var(--radius-pill)] border border-border bg-white px-4 py-2 text-[var(--text-sm)] font-semibold text-ink-700 shadow-[var(--shadow-xs)] transition-colors hover:border-brand-500 hover:text-brand-600"
              >
                {make}
              </Link>
            ))}
          </div>
          <p className="mt-5 text-[var(--text-sm)] text-ink-500">
            <Link href="/directory" className="font-semibold text-brand-600 hover:underline">
              Full A–Z directory of all makes &amp; models →
            </Link>
          </p>
        </Container>
      </section>

      {/* Honest note */}
      <section className="py-10">
        <Container>
          <div className="mx-auto max-w-2xl rounded-[var(--radius-lg)] border border-border bg-white p-6 text-center shadow-[var(--shadow-xs)]">
            <p className="text-[var(--text-sm)] text-ink-600">
              Our reviews are written by the Vansales team based on experience, owner feedback and
              published test data. We have no commercial arrangement with any manufacturer. Stock
              availability and prices come from our live Dealski feed and change daily.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
