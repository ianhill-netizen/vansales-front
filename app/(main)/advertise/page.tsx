import type { Metadata } from "next";
import type React from "react";
import Link from "next/link";
import { Container, Eyebrow, Badge, Button } from "@/components/ui";
import { IconCheck, IconArrow, IconBolt, IconTruck, IconUser, IconMessage, IconFilter, IconSync, IconWhatsApp } from "@/components/icons";
import { SITE, absUrl, DEFAULT_OG_IMAGES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Advertise with Vansales | Dealer & Trade Packages",
  description: "Van-specialist buyers. Enquiries straight to WhatsApp. No long contract.",
  alternates: { canonical: absUrl("/advertise") },
  openGraph: {
    images: DEFAULT_OG_IMAGES,
    title: `Advertise with Vansales · ${SITE.name}`,
    description: "Van-specialist buyers. Enquiries straight to WhatsApp. No long contract.",
    url: absUrl("/advertise"),
    type: "website",
  },
};

/** Where every "start" button goes: the dealer sign-up on the dealer host. Plan buttons add ?plan=<slug>. */
const DEALER_SIGNUP = "https://dealer.vansales.com/signup/dealer";

const PRICING = [
  {
    name: "Private",
    tagline: "Sell one van",
    price: null,
    priceSuffix: "pay as you go",
    highlight: false,
    trial: false,
    bullets: [
      "Single-van listing",
      "Full spec and your own photos",
      "Enquiries by email",
    ],
    cta: "List one van",
    ctaHref: "/sell",
  },
  {
    name: "Starter",
    tagline: "Independent dealer",
    price: 39,
    priceSuffix: "/mo +VAT",
    highlight: false,
    trial: true,
    bullets: [
      "Up to 20 vans",
      "Dealer profile page",
      "WhatsApp + enquiry leads",
      "Small boost-token allowance",
      "Email support",
    ],
    cta: "Start free trial",
    ctaHref: `${DEALER_SIGNUP}?plan=starter`,
  },
  {
    name: "Pro",
    tagline: "Growing dealer",
    price: 89,
    priceSuffix: "/mo +VAT",
    highlight: true,
    trial: true,
    bullets: [
      "Up to 75 vans",
      "Dealer profile page",
      "WhatsApp + CRM leads",
      "Finance + part-exchange module",
      "Priority placement in search",
      "More boost tokens",
      "Analytics dashboard",
    ],
    cta: "Start free trial",
    ctaHref: `${DEALER_SIGNUP}?plan=pro`,
  },
  {
    name: "Premium",
    tagline: "High-volume dealer",
    price: 199,
    priceSuffix: "/mo +VAT",
    highlight: false,
    trial: true,
    bullets: [
      "Unlimited vans",
      "Top search ranking",
      "Large boost-token allocation",
      "Featured homepage slots",
      "Dedicated account manager",
      "Analytics API",
    ],
    cta: "Start free trial",
    ctaHref: `${DEALER_SIGNUP}?plan=premium`,
  },
];

const SELLER_TYPES: { Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; who: string; body: string; cta: string; ctaHref: string }[] = [
  {
    Icon: IconBolt,
    who: "Already on Dealski?",
    body: "Your used stock syncs in from Dealski: prices, photos and spec with no manual uploads.",
    cta: "Connect my Dealski stock",
    ctaHref: DEALER_SIGNUP,
  },
  {
    Icon: IconTruck,
    who: "Independent dealer",
    body: "A dealer profile page, WhatsApp leads and stock import from AutoTrader or CSV. No long contract.",
    cta: "Start free trial",
    ctaHref: DEALER_SIGNUP,
  },
  {
    Icon: IconTruck,
    who: "Dealer group (multi-site)",
    body: "Volume pricing, multiple locations, white-label lead routing. Let’s talk.",
    cta: "Talk to us",
    ctaHref: "mailto:dealers@vansales.com",
  },
  {
    Icon: IconUser,
    who: "Private seller",
    body: "Selling one van? List it free. No subscription needed.",
    cta: "List one van",
    ctaHref: "/sell",
  },
  {
    Icon: IconTruck,
    who: "Finance / hire / fleet disposal",
    body: "Bulk disposals, fleet remarketing, wholesale. Custom volume arrangements available.",
    cta: "Talk to us",
    ctaHref: "mailto:dealers@vansales.com",
  },
];

/** The four things that really set Vansales apart for a dealer: no figures, nothing we cannot show. */
const DIFFERENTIATORS: { Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; label: string; body: string }[] = [
  { Icon: IconWhatsApp, label: "WhatsApp leads", body: "Buyers enquire by WhatsApp or form and it reaches you straight away, not an inbox you check once a week." },
  { Icon: IconFilter, label: "Specialist van filters", body: "Buyers search by body type, wheelbase, roof height, payload and ULEZ, so the enquiries you get are better matched." },
  { Icon: IconSync, label: "Import in minutes", body: "Bring your stock in from AutoTrader, a CSV file or your Dealski account instead of typing it in van by van." },
  { Icon: IconMessage, label: "No contract", body: "Start with a free 14-day trial and stay as long as it works for you. There is no long contract to sign." },
];

export default function AdvertisePage() {
  return (
    <>
      {/* ─── HERO ──────────────────────────────────────────────── */}
      <section className="hero-grid relative overflow-hidden bg-ink-900">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div
            className="absolute -left-40 -top-40 size-[600px] rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)" }}
          />
        </div>

        <Container className="relative z-10 py-16 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
            <div>
              <Eyebrow light>For dealers &amp; trade</Eyebrow>
              <h1 className="mt-4 font-display text-[clamp(2.2rem,1.4rem+3.5vw,3.4rem)] font-extrabold leading-[1.04] tracking-[-0.03em] text-white">
                Advertise your vans on{" "}
                <span className="text-brand-400">vansales</span>
              </h1>
              <p className="mt-5 max-w-xl text-[length:var(--text-md)] leading-relaxed text-white/70">
                Van-specialist buyers. Enquiries straight to WhatsApp. No long contract.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button href={DEALER_SIGNUP} variant="primary" size="lg">
                  Start free 14-day trial <IconArrow width={18} height={18} />
                </Button>
                <Button href="mailto:dealers@vansales.com" variant="outline-light" size="lg">
                  Talk to the team
                </Button>
              </div>
              <p className="mt-4 text-[length:var(--text-xs)] text-white/40">
                14-day free trial · No long contract
              </p>
            </div>

            {/* Four real differentiators (no statistics) */}
            <div className="flex flex-col gap-5 rounded-[var(--radius-xl)] border border-white/10 bg-white/6 p-7 backdrop-blur-sm lg:self-center">
              {DIFFERENTIATORS.map((r) => (
                <div key={r.label} className="flex items-start gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-brand-300">
                    <r.Icon width={20} height={20} aria-hidden />
                  </span>
                  <div>
                    <p className="text-[length:var(--text-sm)] font-bold text-white">{r.label}</p>
                    <p className="mt-0.5 text-[length:var(--text-xs)] leading-relaxed text-white/60">{r.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ─── WHO ARE YOU? ─────────────────────────────────────── */}
      <section className="border-b border-border bg-surface-1 py-14">
        <Container>
          <div className="mb-8 text-center">
            <Eyebrow>Who are you?</Eyebrow>
            <h2 className="mt-2 font-display text-[length:var(--text-2xl)] font-bold text-ink-900">
              The right plan starts here
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SELLER_TYPES.map((s) => (
              <div
                key={s.who}
                className="flex flex-col rounded-[var(--radius-xl)] border border-border bg-white p-6 shadow-[var(--shadow-xs)] transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-brand-500/30 hover:shadow-[var(--shadow-md)]"
              >
                <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-brand-tint">
                  <s.Icon width={20} height={20} className="text-brand-700" aria-hidden />
                </div>
                <h3 className="font-display text-[length:var(--text-base)] font-bold text-ink-900">{s.who}</h3>
                <p className="mt-1.5 flex-1 text-[length:var(--text-sm)] leading-relaxed text-ink-600">{s.body}</p>
                <Link
                  href={s.ctaHref}
                  className="mt-4 inline-flex items-center gap-1.5 text-[length:var(--text-sm)] font-semibold text-brand-700 hover:underline"
                >
                  {s.cta} <IconArrow width={14} height={14} />
                </Link>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── PRICING ─────────────────────────────────────────── */}
      <section className="py-14">
        <Container>
          <div className="mb-8 text-center">
            <Eyebrow>Pricing</Eyebrow>
            <h2 className="mt-2 font-display text-[length:var(--text-2xl)] font-bold text-ink-900">
              Simple, honest pricing
            </h2>
            <p className="mt-2 text-[length:var(--text-sm)] text-ink-500">
              All plans include a 14-day free trial. No contract. All prices +VAT.
            </p>
            <p className="mt-1 text-[length:var(--text-xs)] text-ink-400">
              Boost tokens are used for promoting individual listings and HPI checks.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-[var(--radius-xl)] border p-6 shadow-[var(--shadow-xs)] ${
                  plan.highlight
                    ? "border-brand-500 bg-ink-900 text-white ring-2 ring-brand-500/30"
                    : "border-border bg-white"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-500 px-3 py-1 text-[length:var(--text-xs)] font-bold text-white">
                    Most popular
                  </span>
                )}

                <div className="mb-1">
                  <p className={`font-display text-[length:var(--text-xl)] font-extrabold ${plan.highlight ? "text-white" : "text-ink-900"}`}>
                    {plan.name}
                  </p>
                  <p className={`text-[length:var(--text-xs)] ${plan.highlight ? "text-white/55" : "text-ink-500"}`}>
                    {plan.tagline}
                  </p>
                </div>

                <div className="my-4 flex items-baseline gap-1">
                  {plan.price !== null ? (
                    <>
                      <span className={`font-display text-[length:var(--text-3xl)] font-extrabold ${plan.highlight ? "text-white" : "text-ink-900"}`}>
                        £{plan.price}
                      </span>
                      <span className={`text-[length:var(--text-xs)] ${plan.highlight ? "text-white/50" : "text-ink-400"}`}>
                        {plan.priceSuffix}
                      </span>
                    </>
                  ) : (
                    <span className={`font-display text-[length:var(--text-base)] font-bold ${plan.highlight ? "text-white" : "text-ink-700"}`}>
                      {plan.priceSuffix}
                    </span>
                  )}
                </div>

                {plan.trial && (
                  <p className={`mb-4 text-[length:var(--text-2xs)] font-semibold ${plan.highlight ? "text-brand-300" : "text-brand-700"}`}>
                    14-day free trial included
                  </p>
                )}

                <ul className="flex-1 space-y-2">
                  {plan.bullets.map((b) => (
                    <li key={b} className={`flex items-start gap-2 text-[length:var(--text-xs)] ${plan.highlight ? "text-white/80" : "text-ink-700"}`}>
                      <IconCheck
                        width={14}
                        height={14}
                        className={`mt-0.5 shrink-0 ${plan.highlight ? "text-brand-400" : "text-success-600"}`}
                      />
                      {b}
                    </li>
                  ))}
                </ul>

                {plan.highlight ? (
                  <Button href={plan.ctaHref} variant="primary" size="md" className="mt-6 w-full">
                    {plan.cta}
                  </Button>
                ) : (
                  <Button href={plan.ctaHref} variant="outline" size="md" className="mt-6 w-full">
                    {plan.cta}
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Custom row */}
          <div className="mt-5 rounded-[var(--radius-xl)] border border-dashed border-border bg-surface-1 p-6 text-center">
            <p className="font-display text-[length:var(--text-lg)] font-bold text-ink-900">
              Dealer groups · Finance companies · Hire fleets
            </p>
            <p className="mt-1.5 text-[length:var(--text-sm)] text-ink-500">
              Multi-location stock, bulk lead routing, API integration, white-label options. Custom pricing.
            </p>
            <div className="mt-4 flex justify-center">
              <Button href="mailto:dealers@vansales.com" variant="dark" size="md">
                Talk to us <IconArrow width={14} height={14} />
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── HOW IT WORKS (for Dealski dealers) ──────────────── */}
      <section className="py-14">
        <Container>
          <div className="mb-8 text-center">
            <Eyebrow>Already on Dealski?</Eyebrow>
            <h2 className="mt-2 font-display text-[length:var(--text-2xl)] font-bold text-ink-900">
              Already on Dealski? Connect your stock
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              { n: "1", title: "Connect your Dealski account", body: "Tell us your Dealski dealer ID. We enable the Vansales feed: no CSV uploads, no copying and pasting." },
              { n: "2", title: "Stock syncs automatically", body: "Your used vans are read from Dealski every day: new arrivals appear, price changes update and sold vans come off." },
              { n: "3", title: "Receive live enquiries", body: "Lead goes straight to WhatsApp and your Dealski CRM. Nothing to check, nothing to miss." },
            ].map((s) => (
              <div key={s.n} className="rounded-[var(--radius-xl)] border border-border bg-white p-7 shadow-[var(--shadow-xs)]">
                <span className="mb-4 flex size-10 items-center justify-center rounded-full bg-brand-tint font-display text-[length:var(--text-base)] font-bold text-brand-700">
                  {s.n}
                </span>
                <h3 className="font-display text-[length:var(--text-lg)] font-bold text-ink-900">{s.title}</h3>
                <p className="mt-2 text-[length:var(--text-sm)] leading-relaxed text-ink-600">{s.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-[length:var(--text-sm)] text-ink-500">
            Not on Dealski yet?{" "}
            <a
              href="https://dealski.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-700 hover:underline"
            >
              Visit dealski.co.uk to set up your account
            </a>
          </p>
        </Container>
      </section>

      {/* ─── CTA BAND ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink-900 py-14">
        <div className="hero-grid absolute inset-0" aria-hidden />
        <Container className="relative text-center">
          <Badge tone="brand" className="mb-4">14-day free trial</Badge>
          <h2 className="font-display text-[length:var(--text-3xl)] font-extrabold leading-tight text-white">
            Ready to advertise?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[length:var(--text-md)] leading-relaxed text-white/65">
            Start free. No long contract.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href={DEALER_SIGNUP} variant="primary" size="lg">
              Start free trial <IconArrow width={18} height={18} />
            </Button>
            <Button href="mailto:dealers@vansales.com" variant="outline-light" size="lg">
              Email the team
            </Button>
          </div>
        </Container>
      </section>

      {/* ─── PRIVATE SELLER NOTE ─────────────────────────────── */}
      <section className="border-t border-border py-7">
        <Container className="text-center">
          <p className="text-[length:var(--text-sm)] text-ink-500">
            Not a dealer?{" "}
            <Link href="/sell" className="font-semibold text-brand-700 hover:underline">
              List your van as a private seller — it&apos;s free →
            </Link>
          </p>
        </Container>
      </section>
    </>
  );
}
