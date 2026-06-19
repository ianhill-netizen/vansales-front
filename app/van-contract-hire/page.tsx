import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow, Button } from "@/components/ui";
import { IconArrow, IconCheck, IconCalendar, IconRuler } from "@/components/icons";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Van Contract Hire | Fixed Monthly Payments",
  description: `New vans on fixed monthly contract hire from leading funders. Browse van leasing deals or call ${SITE.phone} to discuss your requirements.`,
};

const BENEFITS = [
  "Fixed monthly payments — no surprises",
  "Drive a new van every 2–4 years",
  "Full manufacturer warranty included",
  "Road tax included throughout",
  "Flexible mileage contracts from 5,000 to 50,000 mi/yr",
  "Business users can reclaim up to 50 % VAT",
];

const HOW = [
  { icon: "1", title: "Choose your van", body: "Pick the make, model and spec. We'll show you real monthly costs with no hidden extras." },
  { icon: "2", title: "Select your contract", body: "Choose contract length (24, 36 or 48 months) and annual mileage to suit your business." },
  { icon: "3", title: "Drive away", body: "Once your finance is approved, your new van is delivered direct to your door." },
];

const FAQS = [
  { q: "What's the difference between contract hire and finance lease?", a: "Contract hire (also called PCH/BCH) means you never own the van — you return it at the end. Finance lease lets you own the van by paying an optional balloon payment. Most businesses prefer contract hire for the simplicity and off-balance-sheet treatment." },
  { q: "Can I include maintenance in my contract?", a: "Yes. Fully maintained packages add servicing, tyres and routine wear to your monthly payment, so you have one predictable cost." },
  { q: "What happens if I exceed my mileage?", a: "Excess mileage is charged per mile agreed upfront in your contract. You can adjust mileage mid-contract with most funders — call us to discuss." },
  { q: "Is contract hire available for sole traders?", a: "Yes, both personal and business contract hire is available. Sole traders may have slightly different VAT reclaim rules — speak to your accountant." },
];

export default function VanContractHirePage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-ink-900 text-white">
        <Container className="py-14">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <Eyebrow light>Van Contract Hire</Eyebrow>
              <h1 className="mt-3 font-display text-[var(--text-3xl)] font-extrabold leading-tight">
                New vans.<br />
                <span className="text-brand-400">One fixed monthly cost.</span>
              </h1>
              <p className="mt-4 max-w-lg text-[var(--text-md)] leading-relaxed text-white/75">
                Drive a brand-new van without the capital outlay. Van contract hire gives you fixed monthly
                payments, full warranty coverage and road tax included — so your fleet costs are always predictable.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button href="#enquire" variant="primary" size="lg">
                  Get a quote <IconArrow width={18} height={18} />
                </Button>
                <Button href="tel:+441656507619" variant="outline-light" size="lg">
                  Call 01656 507619
                </Button>
              </div>
            </div>
            <div className="rounded-[var(--radius-xl)] border border-white/10 bg-white/5 p-8">
              <p className="font-display text-[var(--text-lg)] font-bold text-white">What&apos;s included</p>
              <ul className="mt-4 space-y-3">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-[var(--text-sm)] text-white/80">
                    <IconCheck width={16} height={16} className="mt-0.5 shrink-0 text-brand-400" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section className="py-14">
        <Container>
          <div className="mb-8 text-center">
            <Eyebrow>Simple process</Eyebrow>
            <h2 className="mt-2 font-display text-[var(--text-2xl)] font-bold text-ink-900">How contract hire works</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {HOW.map((h) => (
              <div key={h.icon} className="rounded-[var(--radius-xl)] border border-border bg-white p-7 shadow-[var(--shadow-xs)]">
                <span className="mb-4 flex size-10 items-center justify-center rounded-full bg-brand-tint font-mono text-[var(--text-base)] font-bold text-brand-600">
                  {h.icon}
                </span>
                <h3 className="font-display text-[var(--text-lg)] font-bold text-ink-900">{h.title}</h3>
                <p className="mt-2 text-[var(--text-sm)] leading-relaxed text-ink-600">{h.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Popular choices */}
      <section className="bg-surface-1 py-14">
        <Container>
          <div className="mb-8">
            <Eyebrow>Popular choices</Eyebrow>
            <h2 className="mt-2 font-display text-[var(--text-2xl)] font-bold text-ink-900">Commonly hired vans</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { make: "Ford", model: "Transit Custom", detail: "Medium wheelbase, L1H1", slug: "ford/transit-custom" },
              { make: "Volkswagen", model: "Transporter", detail: "T6.1, SWB, DSG auto", slug: "volkswagen/transporter" },
              { make: "Mercedes-Benz", model: "Sprinter", detail: "315 CDI, L2H2", slug: "mercedes-benz/sprinter" },
              { make: "Vauxhall", model: "Vivaro", detail: "2900 L1, 120ps", slug: "vauxhall/vivaro" },
              { make: "Renault", model: "Master", detail: "FWD L2H2, 135ps", slug: "renault/master" },
              { make: "Volkswagen", model: "Crafter", detail: "35 L3H2 CR, 140ps", slug: "volkswagen/crafter" },
            ].map((van) => (
              <Link
                key={van.slug}
                href={`/vans/${van.slug}`}
                className="group flex items-center justify-between rounded-[var(--radius-lg)] border border-border bg-white p-5 shadow-[var(--shadow-xs)] transition-all hover:border-brand-500 hover:shadow-[var(--shadow-sm)]"
              >
                <div>
                  <p className="font-display font-bold text-ink-900 group-hover:text-brand-600">
                    {van.make} {van.model}
                  </p>
                  <p className="mt-0.5 text-[var(--text-sm)] text-ink-500">{van.detail}</p>
                </div>
                <IconArrow width={18} height={18} className="shrink-0 text-ink-400 group-hover:text-brand-500" />
              </Link>
            ))}
          </div>
          <p className="mt-4 text-center text-[var(--text-sm)] text-ink-500">
            <Link href="/vans" className="font-semibold text-brand-600 hover:underline">Browse all available stock →</Link>
          </p>
        </Container>
      </section>

      {/* Enquiry form anchor */}
      <section id="enquire" className="scroll-mt-20 py-14">
        <Container>
          <div className="mx-auto max-w-xl rounded-[var(--radius-2xl)] border border-border bg-white p-8 shadow-[var(--shadow-md)]">
            <Eyebrow>Get a quote</Eyebrow>
            <h2 className="mt-2 font-display text-[var(--text-2xl)] font-bold text-ink-900">Contract hire enquiry</h2>
            <p className="mt-1 text-[var(--text-sm)] text-ink-500">
              Fill in the form and one of our team will call you back with tailored contract hire quotes.
            </p>
            <div className="mt-6 space-y-3">
              {[
                { label: "Your name", type: "text" },
                { label: "Email address", type: "email" },
                { label: "Phone number", type: "tel" },
                { label: "Van you&apos;re interested in", type: "text" },
              ].map(({ label, type }) => (
                <label key={label} className="block">
                  <span className="mb-1 block text-[var(--text-2xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-ink-500"
                    dangerouslySetInnerHTML={{ __html: label }} />
                  <input
                    type={type}
                    className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[var(--text-base)] text-ink-800 outline-none focus-visible:border-brand-500"
                  />
                </label>
              ))}
              <div className="flex gap-3 pt-1">
                <div className="flex items-center gap-2 text-[var(--text-sm)] text-ink-600">
                  <IconCalendar width={16} height={16} className="shrink-0 text-ink-400" />
                  Contract length
                </div>
                {["24 months", "36 months", "48 months"].map((opt) => (
                  <label key={opt} className="flex cursor-pointer items-center gap-1.5 text-[var(--text-sm)] text-ink-700">
                    <input type="radio" name="term" value={opt} className="accent-brand-500" />
                    {opt.replace(" months", "m")}
                  </label>
                ))}
              </div>
              <Button variant="primary" size="lg" className="mt-2 w-full" disabled>
                Request quotes
              </Button>
              <p className="text-center text-[var(--text-xs)] text-ink-400">
                Or call <a href="tel:+441656507619" className="font-semibold text-ink-600 underline">01656 507619</a> — we respond same day.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="bg-surface-1 py-14">
        <Container>
          <div className="mx-auto max-w-2xl">
            <h2 className="font-display text-[var(--text-xl)] font-bold text-ink-900">Frequently asked questions</h2>
            <div className="mt-4 divide-y divide-border">
              {FAQS.map((f) => (
                <div key={f.q} className="py-5">
                  <p className="font-semibold text-ink-900">{f.q}</p>
                  <p className="mt-1.5 text-[var(--text-sm)] leading-relaxed text-ink-600">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
