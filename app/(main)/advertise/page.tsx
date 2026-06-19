import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow, Badge } from "@/components/ui";
import { IconCheck, IconArrow } from "@/components/icons";
import { SITE, absUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Advertise with Vansales | Dealer & Trade Packages",
  description: "Reach 100,000+ UK van buyers. Cheaper than AutoTrader, leads straight to WhatsApp, van-specialist audience. 14-day free trial — no contract.",
  alternates: { canonical: absUrl("/advertise") },
  openGraph: {
    title: `Advertise with Vansales · ${SITE.name}`,
    description: "Reach 100,000+ UK van buyers. Cheaper than AutoTrader, leads straight to WhatsApp.",
    url: absUrl("/advertise"),
    type: "website",
  },
};

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
      "Full spec + up to 20 photos",
      "Enquiries by email",
      "Listed for 60 days",
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
    ctaHref: "/dealer-portal/login",
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
    ctaHref: "/dealer-portal/login",
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
    ctaHref: "/dealer-portal/login",
  },
];

const SELLER_TYPES = [
  {
    icon: "⚡",
    who: "Already on Dealski?",
    body: "Your stock feeds in automatically — live prices, photos and spec with no manual uploads.",
    cta: "Connect my Dealski stock",
    ctaHref: "/dealer-portal/login",
  },
  {
    icon: "🏪",
    who: "Independent dealer",
    body: "From 20 to 75 vans. Dealer profile page, WhatsApp leads, finance module. No contract.",
    cta: "Start free trial",
    ctaHref: "/dealer-portal/login",
  },
  {
    icon: "🏢",
    who: "Dealer group (multi-site)",
    body: "Volume pricing, multiple locations, white-label lead routing. Let's talk.",
    cta: "Talk to us",
    ctaHref: "mailto:dealers@vansales.com",
  },
  {
    icon: "🚐",
    who: "Private seller",
    body: "Selling one van? List it free in under 5 minutes — no subscription needed.",
    cta: "List one van",
    ctaHref: "/sell",
  },
  {
    icon: "💸",
    who: "Finance / hire / fleet disposal",
    body: "Bulk disposals, fleet remarketing, wholesale. Custom volume arrangements available.",
    cta: "Talk to us",
    ctaHref: "mailto:dealers@vansales.com",
  },
];

const VS_REASONS = [
  {
    stat: "100K+",
    label: "Van-buyer community",
    body: "Vansales is built around an active UK van-buyer audience — not a generic classified site.",
  },
  {
    stat: "WhatsApp",
    label: "Leads in your pocket",
    body: "Enquiries land in WhatsApp and your CRM inbox — not an email void. Faster response, more sales.",
  },
  {
    stat: "Van-first",
    label: "Specialist filters",
    body: "Buyers filter by payload, wheelbase, ULEZ status and Euro grade — not just colour. Better-matched leads.",
  },
  {
    stat: "£39/mo",
    label: "A fraction of AutoTrader",
    body: "Pro features at prices independent dealers can actually afford. No long-term contract.",
  },
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
                Advertise your vans to{" "}
                <span className="text-brand-400">100,000+ UK van buyers.</span>
              </h1>
              <p className="mt-5 max-w-xl text-[var(--text-md)] leading-relaxed text-white/70">
                Cheaper than AutoTrader. Every lead lands in WhatsApp. A van-specialist audience
                who filter by payload and ULEZ — not just colour.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/dealer-portal/login"
                  className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-md)] bg-brand-500 px-6 text-[var(--text-base)] font-bold text-white transition-colors hover:bg-brand-600"
                >
                  Start free 14-day trial <IconArrow width={18} height={18} />
                </Link>
                <a
                  href="mailto:dealers@vansales.com"
                  className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-md)] border border-white/30 px-6 text-[var(--text-base)] font-semibold text-white/80 transition-colors hover:border-white/60 hover:text-white"
                >
                  Talk to the team
                </a>
              </div>
              <p className="mt-4 text-[var(--text-xs)] text-white/40">
                14-day free trial · No credit card · Cancel anytime
              </p>
            </div>

            {/* Quick-stats card */}
            <div className="flex flex-col gap-4 rounded-[var(--radius-xl)] border border-white/10 bg-white/6 p-7 backdrop-blur-sm lg:self-center">
              {VS_REASONS.map((r) => (
                <div key={r.stat} className="flex items-start gap-4">
                  <div className="w-16 shrink-0 font-display text-[var(--text-2xl)] font-extrabold leading-none text-brand-400">
                    {r.stat}
                  </div>
                  <div>
                    <p className="text-[var(--text-sm)] font-bold text-white">{r.label}</p>
                    <p className="mt-0.5 text-[var(--text-xs)] leading-relaxed text-white/55">{r.body}</p>
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
            <h2 className="mt-2 font-display text-[var(--text-2xl)] font-bold text-ink-900">
              The right plan starts here
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SELLER_TYPES.map((s) => (
              <div
                key={s.who}
                className="flex flex-col rounded-[var(--radius-xl)] border border-border bg-white p-6 shadow-[var(--shadow-xs)] transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-brand-500/30 hover:shadow-[var(--shadow-md)]"
              >
                <div className="mb-3 text-3xl" role="img" aria-hidden>{s.icon}</div>
                <h3 className="font-display text-[var(--text-base)] font-bold text-ink-900">{s.who}</h3>
                <p className="mt-1.5 flex-1 text-[var(--text-sm)] leading-relaxed text-ink-600">{s.body}</p>
                <Link
                  href={s.ctaHref}
                  className="mt-4 inline-flex items-center gap-1.5 text-[var(--text-sm)] font-semibold text-brand-700 hover:underline"
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
            <h2 className="mt-2 font-display text-[var(--text-2xl)] font-bold text-ink-900">
              Simple, honest pricing
            </h2>
            <p className="mt-2 text-[var(--text-sm)] text-ink-500">
              All plans include a 14-day free trial. No contract. All prices +VAT.
            </p>
            <p className="mt-1 text-[var(--text-xs)] text-ink-400">
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
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-500 px-3 py-1 text-[var(--text-xs)] font-bold text-white">
                    Most popular
                  </span>
                )}

                <div className="mb-1">
                  <p className={`font-display text-[var(--text-xl)] font-extrabold ${plan.highlight ? "text-white" : "text-ink-900"}`}>
                    {plan.name}
                  </p>
                  <p className={`text-[var(--text-xs)] ${plan.highlight ? "text-white/55" : "text-ink-500"}`}>
                    {plan.tagline}
                  </p>
                </div>

                <div className="my-4 flex items-baseline gap-1">
                  {plan.price !== null ? (
                    <>
                      <span className={`font-display text-[var(--text-3xl)] font-extrabold ${plan.highlight ? "text-white" : "text-ink-900"}`}>
                        £{plan.price}
                      </span>
                      <span className={`text-[var(--text-xs)] ${plan.highlight ? "text-white/50" : "text-ink-400"}`}>
                        {plan.priceSuffix}
                      </span>
                    </>
                  ) : (
                    <span className={`font-display text-[var(--text-base)] font-bold ${plan.highlight ? "text-white" : "text-ink-700"}`}>
                      {plan.priceSuffix}
                    </span>
                  )}
                </div>

                {plan.trial && (
                  <p className={`mb-4 text-[var(--text-2xs)] font-semibold ${plan.highlight ? "text-brand-300" : "text-brand-700"}`}>
                    14-day free trial included
                  </p>
                )}

                <ul className="flex-1 space-y-2">
                  {plan.bullets.map((b) => (
                    <li key={b} className={`flex items-start gap-2 text-[var(--text-xs)] ${plan.highlight ? "text-white/80" : "text-ink-700"}`}>
                      <IconCheck
                        width={14}
                        height={14}
                        className={`mt-0.5 shrink-0 ${plan.highlight ? "text-brand-400" : "text-success-600"}`}
                      />
                      {b}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaHref}
                  className={`mt-6 flex h-11 w-full items-center justify-center rounded-[var(--radius-md)] text-[var(--text-sm)] font-bold transition-colors ${
                    plan.highlight
                      ? "bg-brand-500 text-white hover:bg-brand-600"
                      : "border border-border bg-surface-1 text-ink-800 hover:border-ink-400 hover:bg-surface-2"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* Custom row */}
          <div className="mt-5 rounded-[var(--radius-xl)] border border-dashed border-border bg-surface-1 p-6 text-center">
            <p className="font-display text-[var(--text-lg)] font-bold text-ink-900">
              Dealer groups · Finance companies · Hire fleets
            </p>
            <p className="mt-1.5 text-[var(--text-sm)] text-ink-500">
              Multi-location stock, bulk lead routing, API integration, white-label options. Custom pricing.
            </p>
            <a
              href="mailto:dealers@vansales.com"
              className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-ink-900 px-6 py-2.5 text-[var(--text-sm)] font-semibold text-white hover:bg-ink-700"
            >
              Talk to us <IconArrow width={14} height={14} />
            </a>
          </div>
        </Container>
      </section>

      {/* ─── WHY VANSALES vs AUTOTRADER ──────────────────────── */}
      <section className="bg-surface-1 py-14">
        <Container>
          <div className="mb-8 text-center">
            <Eyebrow>Why Vansales</Eyebrow>
            <h2 className="mt-2 font-display text-[var(--text-2xl)] font-bold text-ink-900">
              Not AutoTrader. Better.
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "100K-member van-buyer community",
                body: "Vansales attracts buyers who already know they want a van — not general car buyers. Higher intent, better conversion.",
              },
              {
                title: "Leads to WhatsApp, not a void",
                body: "Buyers enquire via WhatsApp or form — you get a live notification. Not buried in an inbox you check once a week.",
              },
              {
                title: "Van-specialist filters",
                body: "Payload, wheelbase, ULEZ, roof height, Euro status. Buyers self-qualify. You spend less time on tyre-kickers.",
              },
              {
                title: "A fraction of the cost",
                body: "AutoTrader Pro starts at £800+/mo. Vansales Pro is £89. Same buyers, fraction of the cost, direct relationship.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[var(--radius-xl)] border border-border bg-white p-6 shadow-[var(--shadow-xs)]"
              >
                <IconCheck width={18} height={18} className="mb-3 text-success-600" />
                <h3 className="font-display text-[var(--text-base)] font-bold text-ink-900">{item.title}</h3>
                <p className="mt-2 text-[var(--text-sm)] leading-relaxed text-ink-600">{item.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── HOW IT WORKS (for Dealski dealers) ──────────────── */}
      <section className="py-14">
        <Container>
          <div className="mb-8 text-center">
            <Eyebrow>Already on Dealski?</Eyebrow>
            <h2 className="mt-2 font-display text-[var(--text-2xl)] font-bold text-ink-900">
              Your stock can be live in 5 minutes
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              { n: "1", title: "Connect your Dealski account", body: "Tell us your Dealski dealer ID. We enable the Vansales feed — no CSV uploads, no copying and pasting." },
              { n: "2", title: "Stock syncs automatically", body: "Every vehicle appears on Vansales within minutes. Price changes, sold status and new arrivals update in real time." },
              { n: "3", title: "Receive live enquiries", body: "Lead goes straight to WhatsApp and your Dealski CRM. Nothing to check, nothing to miss." },
            ].map((s) => (
              <div key={s.n} className="rounded-[var(--radius-xl)] border border-border bg-white p-7 shadow-[var(--shadow-xs)]">
                <span className="mb-4 flex size-10 items-center justify-center rounded-full bg-brand-tint font-display text-[var(--text-base)] font-bold text-brand-700">
                  {s.n}
                </span>
                <h3 className="font-display text-[var(--text-lg)] font-bold text-ink-900">{s.title}</h3>
                <p className="mt-2 text-[var(--text-sm)] leading-relaxed text-ink-600">{s.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-[var(--text-sm)] text-ink-500">
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
          <h2 className="font-display text-[var(--text-3xl)] font-extrabold leading-tight text-white">
            Ready to advertise?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[var(--text-md)] leading-relaxed text-white/65">
            Start free. No credit card. Cancel any time.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/dealer-portal/login"
              className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-md)] bg-brand-500 px-7 text-[var(--text-base)] font-bold text-white transition-colors hover:bg-brand-600"
            >
              Start free trial <IconArrow width={18} height={18} />
            </Link>
            <a
              href="mailto:dealers@vansales.com"
              className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-md)] border border-white/25 px-7 text-[var(--text-base)] font-semibold text-white/80 transition-colors hover:border-white/50 hover:text-white"
            >
              Email the team
            </a>
          </div>
        </Container>
      </section>

      {/* ─── PRIVATE SELLER NOTE ─────────────────────────────── */}
      <section className="border-t border-border py-7">
        <Container className="text-center">
          <p className="text-[var(--text-sm)] text-ink-500">
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
