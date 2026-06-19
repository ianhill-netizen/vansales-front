import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow, Button } from "@/components/ui";
import { IconCheck, IconArrow, IconSearch } from "@/components/icons";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Advertise Your Stock | Dealer & Trade Plans",
  description: `Reach thousands of UK van buyers. Powered by Dealski — your live stock syncs automatically. Call ${SITE.phone} to get started.`,
};

const FEATURES = [
  "Live stock feed via Dealski — no manual uploading",
  "Every vehicle gets its own SEO-optimised listing page",
  "Enquiries delivered by email and SMS",
  "Highlight featured vehicles on the homepage",
  "Detailed click and enquiry analytics dashboard",
  "Dedicated account manager",
  "Instant stock updates when you mark vehicles sold",
  "ULEZ and LEZ compliance flags auto-populated",
];

const PLANS = [
  {
    name: "Starter",
    vans: "Up to 10 vehicles",
    price: "Contact us",
    highlight: false,
    bullets: ["Live Dealski feed", "Standard listing pages", "Email enquiries"],
  },
  {
    name: "Growth",
    vans: "Up to 50 vehicles",
    price: "Contact us",
    highlight: true,
    bullets: ["Everything in Starter", "SMS enquiry alerts", "Homepage featured slots", "Priority listing placement"],
  },
  {
    name: "Enterprise",
    vans: "Unlimited vehicles",
    price: "Contact us",
    highlight: false,
    bullets: ["Everything in Growth", "Dedicated account manager", "Custom landing pages", "Analytics API access"],
  },
];

export default function AdvertisePage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-ink-900 text-white">
        <Container className="py-14">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <Eyebrow light>For dealers &amp; trade</Eyebrow>
              <h1 className="mt-3 font-display text-[var(--text-3xl)] font-extrabold leading-tight">
                Your stock. Live.<br />
                <span className="text-brand-400">Zero manual work.</span>
              </h1>
              <p className="mt-4 max-w-lg text-[var(--text-md)] leading-relaxed text-white/75">
                Vansales is powered by Dealski. If you&apos;re already on Dealski, your stock can appear
                here automatically — live prices, photos and spec synced in real time.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button href="#contact" variant="primary" size="lg">
                  Get started <IconArrow width={18} height={18} />
                </Button>
                <Button href="tel:+441656507619" variant="outline-light" size="lg">
                  Call 01656 507619
                </Button>
              </div>
              <p className="mt-5 text-[var(--text-sm)] text-white/50">
                Not on Dealski?{" "}
                <a href="https://dealski.co.uk" target="_blank" rel="noopener noreferrer" className="text-white/70 underline hover:text-white">
                  Visit dealski.co.uk
                </a>{" "}
                to create your account first.
              </p>
            </div>
            <div className="rounded-[var(--radius-xl)] border border-white/10 bg-white/5 p-8">
              <p className="font-display text-[var(--text-lg)] font-bold text-white">What&apos;s included in every plan</p>
              <ul className="mt-4 space-y-3">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[var(--text-sm)] text-white/80">
                    <IconCheck width={16} height={16} className="mt-0.5 shrink-0 text-brand-400" />
                    {f}
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
          <div className="mb-10 text-center">
            <Eyebrow>Powered by Dealski</Eyebrow>
            <h2 className="mt-2 font-display text-[var(--text-2xl)] font-bold text-ink-900">How the integration works</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { n: "1", title: "Connect your Dealski account", body: "Tell us your Dealski dealer ID. We enable the Vansales feed for your account — takes 5 minutes." },
              { n: "2", title: "Stock syncs automatically", body: "Every vehicle in your Dealski inventory appears on Vansales within minutes. Price changes and sold status update in real time." },
              { n: "3", title: "Receive live enquiries", body: "When a buyer enquires, the lead goes to your Dealski inbox and your email simultaneously. No manual checking needed." },
            ].map((s) => (
              <div key={s.n} className="rounded-[var(--radius-xl)] border border-border bg-white p-7 shadow-[var(--shadow-xs)]">
                <span className="mb-4 flex size-10 items-center justify-center rounded-full bg-brand-tint font-mono text-[var(--text-base)] font-bold text-brand-600">
                  {s.n}
                </span>
                <h3 className="font-display text-[var(--text-lg)] font-bold text-ink-900">{s.title}</h3>
                <p className="mt-2 text-[var(--text-sm)] leading-relaxed text-ink-600">{s.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Plans */}
      <section className="bg-surface-1 py-14">
        <Container>
          <div className="mb-8 text-center">
            <Eyebrow>Pricing</Eyebrow>
            <h2 className="mt-2 font-display text-[var(--text-2xl)] font-bold text-ink-900">Plans for every dealer</h2>
            <p className="mt-2 text-[var(--text-sm)] text-ink-500">Pricing is tailored to your stock volume. Contact us for exact figures.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col rounded-[var(--radius-xl)] border p-7 shadow-[var(--shadow-xs)] ${
                  plan.highlight
                    ? "border-brand-500 bg-white ring-2 ring-brand-200"
                    : "border-border bg-white"
                }`}
              >
                {plan.highlight && (
                  <span className="mb-3 inline-flex self-start rounded-full bg-brand-tint px-2.5 py-0.5 text-[var(--text-xs)] font-semibold text-brand-700">
                    Most popular
                  </span>
                )}
                <h3 className="font-display text-[var(--text-xl)] font-extrabold text-ink-900">{plan.name}</h3>
                <p className="mt-1 text-[var(--text-sm)] text-ink-500">{plan.vans}</p>
                <p className="mt-3 font-display text-[var(--text-lg)] font-bold text-ink-900">{plan.price}</p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {plan.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-[var(--text-sm)] text-ink-700">
                      <IconCheck width={15} height={15} className="mt-0.5 shrink-0 text-success-600" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Button href="#contact" variant={plan.highlight ? "primary" : "outline"} size="md" className="mt-6 w-full">
                  Get a quote
                </Button>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Contact */}
      <section id="contact" className="scroll-mt-20 py-14">
        <Container>
          <div className="mx-auto max-w-xl rounded-[var(--radius-2xl)] border border-border bg-white p-8 shadow-[var(--shadow-md)]">
            <Eyebrow>Get in touch</Eyebrow>
            <h2 className="mt-2 font-display text-[var(--text-2xl)] font-bold text-ink-900">Start advertising today</h2>
            <p className="mt-1 text-[var(--text-sm)] text-ink-500">
              Tell us about your dealership and we&apos;ll come back with a tailored quote within one business day.
            </p>
            <div className="mt-6 space-y-3">
              {[
                { label: "Your name", type: "text" },
                { label: "Dealership / business name", type: "text" },
                { label: "Email address", type: "email" },
                { label: "Phone number", type: "tel" },
                { label: "Approx. vehicles in stock", type: "number" },
              ].map(({ label, type }) => (
                <label key={label} className="block">
                  <span className="mb-1 block text-[var(--text-2xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-ink-500">{label}</span>
                  <input
                    type={type}
                    className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[var(--text-base)] text-ink-800 outline-none focus-visible:border-brand-500"
                  />
                </label>
              ))}
              <label className="block">
                <span className="mb-1 block text-[var(--text-2xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-ink-500">Are you already on Dealski?</span>
                <select className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[var(--text-base)] text-ink-800 outline-none focus-visible:border-brand-500">
                  <option>Yes — I have a Dealski account</option>
                  <option>No — not yet</option>
                  <option>Not sure</option>
                </select>
              </label>
              <Button variant="primary" size="lg" className="mt-2 w-full" disabled>
                Send enquiry
              </Button>
              <p className="text-center text-[var(--text-xs)] text-ink-400">
                Or call <a href="tel:+441656507619" className="font-semibold text-ink-600 underline">01656 507619</a>
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Link to sell page */}
      <section className="border-t border-border bg-surface-1 py-8">
        <Container>
          <p className="text-center text-[var(--text-sm)] text-ink-500">
            Not a dealer?{" "}
            <Link href="/sell" className="font-semibold text-brand-600 hover:underline">
              List your van as a private seller — it&apos;s free →
            </Link>
          </p>
        </Container>
      </section>
    </>
  );
}
