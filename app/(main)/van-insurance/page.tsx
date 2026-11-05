import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Container, Eyebrow, Button } from "@/components/ui";
import { IconShield, IconCheck, IconArrow } from "@/components/icons";
import { SITE } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Van Insurance | Commercial Vehicle Cover",
  description: `Compare commercial van insurance options for sole traders, small fleets and businesses. Understand the right cover for your van.`,
  path: "/van-insurance",
});

const COVER_TYPES = [
  {
    title: "Third party only",
    description: "The minimum legal cover. Pays for damage or injury you cause to others. Does not cover your own van.",
    badge: "Basic",
    badgeColor: "bg-ink-100 text-ink-600",
  },
  {
    title: "Third party, fire and theft",
    description: "Adds cover for fire damage or theft of your van, on top of third party liability.",
    badge: "Standard",
    badgeColor: "bg-amber-50 text-amber-700",
  },
  {
    title: "Comprehensive",
    description: "Covers damage to your own van as well as third-party claims — the most complete protection.",
    badge: "Most popular",
    badgeColor: "bg-brand-tint text-brand-700",
  },
];

const CONSIDERATIONS = [
  { icon: <IconShield width={20} height={20} />, title: "Goods in transit", body: "If you carry tools or stock, a standard policy may not cover them. Ask about goods in transit add-ons." },
  { icon: <IconShield width={20} height={20} />, title: "Business use class", body: "Social and domestic use is not sufficient if you use your van for work. Declare business use accurately or a claim may be refused." },
  { icon: <IconShield width={20} height={20} />, title: "Fleet vs. single vehicle", body: "Insuring 3+ vans on a single fleet policy is almost always cheaper than individual policies." },
  { icon: <IconShield width={20} height={20} />, title: "Named drivers vs. any driver", body: "Any-driver policies are convenient but more expensive. Named-driver limits can reduce premium significantly." },
  { icon: <IconShield width={20} height={20} />, title: "Breakdown cover", body: "Commercial breakdown is a separate add-on — consumer AA/RAC policies typically exclude vans over a certain weight or size." },
  { icon: <IconShield width={20} height={20} />, title: "ULEZ & LEZ compliance", body: "Some insurers now offer reduced premiums for ULEZ-compliant Euro 6 diesels and pure EVs — worth asking about." },
];

export default function VanInsurancePage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-surface-1">
        <Container className="py-14">
          <div className="max-w-2xl">
            <Eyebrow>Van Insurance</Eyebrow>
            <h1 className="mt-3 font-display text-[length:var(--text-3xl)] font-extrabold leading-tight text-ink-900">
              Commercial van insurance.<br />
              <span className="text-brand-500">Know what you&apos;re buying.</span>
            </h1>
            <p className="mt-4 text-[length:var(--text-md)] leading-relaxed text-ink-600">
              Commercial van insurance isn&apos;t the same as car insurance. This guide covers what to look
              for, the types of cover available, and the common traps that leave businesses underinsured.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href="#compare" variant="primary" size="lg">
                Compare cover types <IconArrow width={18} height={18} />
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Cover types */}
      <section id="compare" className="scroll-mt-20 py-14">
        <Container>
          <div className="mb-8">
            <Eyebrow>Types of cover</Eyebrow>
            <h2 className="mt-2 font-display text-[length:var(--text-2xl)] font-bold text-ink-900">Which level of cover do you need?</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {COVER_TYPES.map((ct) => (
              <div key={ct.title} className="flex flex-col rounded-[var(--radius-xl)] border border-border bg-white p-7 shadow-[var(--shadow-xs)]">
                <span className={`inline-flex self-start rounded-full px-2.5 py-0.5 text-[length:var(--text-xs)] font-semibold ${ct.badgeColor} mb-4`}>
                  {ct.badge}
                </span>
                <h3 className="font-display text-[length:var(--text-lg)] font-bold text-ink-900">{ct.title}</h3>
                <p className="mt-2 flex-1 text-[length:var(--text-sm)] leading-relaxed text-ink-600">{ct.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Key considerations */}
      <section className="bg-surface-1 py-14">
        <Container>
          <div className="mb-8">
            <Eyebrow>What to check</Eyebrow>
            <h2 className="mt-2 font-display text-[length:var(--text-2xl)] font-bold text-ink-900">6 things to get right</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CONSIDERATIONS.map((c) => (
              <div key={c.title} className="rounded-[var(--radius-xl)] border border-border bg-white p-6 shadow-[var(--shadow-xs)]">
                <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-brand-tint text-brand-600">
                  {c.icon}
                </div>
                <h3 className="font-display text-[length:var(--text-base)] font-bold text-ink-900">{c.title}</h3>
                <p className="mt-1.5 text-[length:var(--text-sm)] leading-relaxed text-ink-600">{c.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Honest info band */}
      <section className="py-14">
        <Container>
          <div className="mx-auto max-w-2xl">
            <Eyebrow>Honest info</Eyebrow>
            <h2 className="mt-2 font-display text-[length:var(--text-2xl)] font-bold text-ink-900">We don&apos;t sell insurance</h2>
            <p className="mt-3 text-[length:var(--text-md)] leading-relaxed text-ink-600">
              Vansales is a van marketplace, not an insurance broker. We&apos;ve written this guide because
              we see buyers purchase the wrong cover — or discover they&apos;re underinsured only when
              it&apos;s too late.
            </p>
            <p className="mt-3 text-[length:var(--text-md)] leading-relaxed text-ink-600">
              For a quote, we recommend using a specialist commercial vehicle broker rather than a price
              comparison site — brokers can negotiate better rates and will read your policy wording for you.
            </p>
            <div className="mt-4 rounded-[var(--radius-lg)] border border-amber-200 bg-amber-50 p-5">
              <ul className="space-y-2">
                {[
                  "Always declare the correct business use class",
                  "Check your policy covers the van's payload and gross weight",
                  "Read the excess structure — commercial van excesses can be high",
                  "Confirm your tools/goods are covered if you carry them regularly",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-[length:var(--text-sm)] text-amber-800">
                    <IconCheck width={15} height={15} className="mt-0.5 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
