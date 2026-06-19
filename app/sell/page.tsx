import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow, Button } from "@/components/ui";
import { IconCheck, IconArrow } from "@/components/icons";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sell Your Van | Free Private Listings",
  description: `List your van for free on ${SITE.name} and reach thousands of UK buyers. Takes under 5 minutes — full spec, photos, direct enquiries.`,
};

const STEPS = [
  { n: "1", title: "Create your listing", body: "Tell us the make, model, spec and mileage. We'll fill in most details automatically from your registration." },
  { n: "2", title: "Add photos", body: "Upload up to 20 photos. Listings with photos get 4× more enquiries. Our tips show you exactly what to shoot." },
  { n: "3", title: "Receive enquiries", body: "Serious buyers contact you directly. You're always in control — no middlemen, no fees." },
];

const FEATURES = [
  "Free to list — no charge, ever",
  "Reach buyers across the whole UK",
  "Your number stays private until you share it",
  "Pause or remove your listing anytime",
  "No hidden upgrade fees or featured slots",
  "Simple, spam-free enquiry flow",
];

export default function SellPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-surface-1">
        <Container className="py-14">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <Eyebrow>Sell your van</Eyebrow>
              <h1 className="mt-3 font-display text-[var(--text-3xl)] font-extrabold leading-tight text-ink-900">
                Sell your van for free.<br />
                <span className="text-brand-500">No fees. No hassle.</span>
              </h1>
              <p className="mt-4 max-w-lg text-[var(--text-md)] leading-relaxed text-ink-600">
                List your van in under 5 minutes and reach thousands of UK buyers who are actively
                searching right now. Private listings are completely free.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button href="#list" variant="primary" size="lg">
                  List your van free <IconArrow width={18} height={18} />
                </Button>
                <Button href="/advertise" variant="outline" size="lg">
                  Trade / dealer? See dealer plans
                </Button>
              </div>
            </div>
            {/* Feature checklist */}
            <div className="rounded-[var(--radius-xl)] border border-border bg-white p-8 shadow-[var(--shadow-md)]">
              <p className="font-display text-[var(--text-lg)] font-bold text-ink-900">What you get, free</p>
              <ul className="mt-4 space-y-3">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[var(--text-sm)] text-ink-700">
                    <IconCheck width={16} height={16} className="mt-0.5 shrink-0 text-success-600" />
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
          <div className="mb-8 text-center">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="mt-2 font-display text-[var(--text-2xl)] font-bold text-ink-900">3 steps to sold</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="relative rounded-[var(--radius-xl)] border border-border bg-white p-7 shadow-[var(--shadow-xs)]">
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

      {/* Placeholder listing form — full listing form coming soon */}
      <section id="list" className="scroll-mt-20 bg-surface-1 py-14">
        <Container>
          <div className="mx-auto max-w-xl rounded-[var(--radius-2xl)] border border-border bg-white p-8 shadow-[var(--shadow-md)]">
            <Eyebrow>Get started</Eyebrow>
            <h2 className="mt-2 font-display text-[var(--text-2xl)] font-bold text-ink-900">List your van</h2>
            <p className="mt-2 text-[var(--text-sm)] text-ink-500">
              Full self-serve listing is coming soon. In the meantime, contact us and we&apos;ll list your van within 1 business hour.
            </p>
            <div className="mt-6 space-y-3">
              {["Your name", "Email address", "Phone number", "Van registration"].map((label, i) => (
                <label key={label} className="block">
                  <span className="mb-1 block text-[var(--text-2xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-ink-500">{label}</span>
                  <input
                    type={i === 1 ? "email" : i === 2 ? "tel" : "text"}
                    placeholder={i === 3 ? "e.g. AB12 CDE" : ""}
                    className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[var(--text-base)] text-ink-800 outline-none focus-visible:border-brand-500"
                  />
                </label>
              ))}
              <Button variant="primary" size="lg" className="mt-2 w-full" disabled>
                Submit listing request
              </Button>
              <p className="text-center text-[var(--text-xs)] text-ink-400">
                Or call <a href="tel:+441656507619" className="font-semibold text-ink-600 underline">01656 507619</a> — we&apos;ll list it for you in minutes.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ teaser */}
      <section className="py-14">
        <Container>
          <div className="mx-auto max-w-2xl">
            <h2 className="font-display text-[var(--text-xl)] font-bold text-ink-900">Common questions</h2>
            <div className="mt-4 divide-y divide-border">
              {[
                { q: "Is it really free?", a: "Yes. Private listings are always free on Vansales. No card required, no trial period." },
                { q: "How long will it take to sell?", a: "Most vans priced fairly sell within 2–3 weeks. Pricing competitively and adding good photos are the biggest factors." },
                { q: "Can I edit my listing?", a: "Yes — you can update the price, photos and description at any time from your account dashboard." },
                { q: "I'm a dealer. Is this for me?", a: "Dealers should use our Dealski-powered trade plan. See the Advertise page." },
              ].map((item) => (
                <div key={item.q} className="py-4">
                  <p className="font-semibold text-ink-900">{item.q}</p>
                  <p className="mt-1 text-[var(--text-sm)] text-ink-600">{item.a}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[var(--text-sm)] text-ink-500">
              More questions?{" "}
              <Link href="/advertise" className="font-semibold text-brand-600 hover:underline">
                See our dealer / trade options →
              </Link>
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
