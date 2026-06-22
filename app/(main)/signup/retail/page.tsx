import type { Metadata } from "next";
import { Container, Eyebrow } from "@/components/ui";
import { IconCheck, IconSearch, IconBolt, IconShield } from "@/components/icons";
import { RetailSignupForm } from "./form";

export const metadata: Metadata = {
  title: "Get Van Alerts | Sign Up as a Van Buyer | Vansales",
  description:
    "Tell us what you're looking for and we'll alert you the moment matching stock lands from verified UK dealers. Spec-first search, instant alerts, free.",
};

const BENEFITS = [
  {
    icon: IconSearch,
    title: "Spec-first search",
    body: "Filter by payload, wheelbase, body type and ULEZ status — not just make and model.",
  },
  {
    icon: IconBolt,
    title: "Instant stock alerts",
    body: "Be first to know when matching vans arrive. Act before they sell.",
  },
  {
    icon: IconShield,
    title: "Verified dealers only",
    body: "Every listing from a real UK dealer — no private sellers, no time-wasters.",
  },
];

export default function RetailSignupPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-surface-1">
        <Container className="py-16 lg:py-20">
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_420px]">
            {/* Left — value prop */}
            <div>
              <Eyebrow>Van buyers</Eyebrow>
              <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3rem)] font-extrabold leading-[1.1] text-ink-900">
                Find the right van.
                <br />
                <span className="text-brand-500">Get alerted when it lands.</span>
              </h1>
              <p className="mt-5 max-w-lg text-[var(--text-md)] leading-relaxed text-ink-600">
                Tell us what you&rsquo;re after and we&rsquo;ll ping you the moment matching stock
                arrives from verified UK dealers. Spec-first, not just make and model.
              </p>

              {/* Benefits */}
              <ul className="mt-8 space-y-5">
                {BENEFITS.map(({ icon: Icon, title, body }) => (
                  <li key={title} className="flex items-start gap-4">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-brand-tint text-brand-600">
                      <Icon width={18} height={18} />
                    </span>
                    <div>
                      <p className="font-semibold text-ink-900">{title}</p>
                      <p className="mt-0.5 text-[var(--text-sm)] leading-relaxed text-ink-500">
                        {body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Social proof */}
              <div className="mt-8 flex items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-white px-5 py-3.5 text-[var(--text-sm)] text-ink-600 shadow-[var(--shadow-xs)]">
                <span className="flex size-7 items-center justify-center rounded-full bg-success-tint text-success-600">
                  <IconCheck width={14} height={14} />
                </span>
                <span>
                  <strong className="text-ink-900">800+ buyers</strong> already registered for early
                  access
                </span>
              </div>
            </div>

            {/* Right — form card */}
            <div className="rounded-[var(--radius-2xl)] border border-border bg-white p-8 shadow-[var(--shadow-md)]">
              <h2 className="font-display text-[var(--text-xl)] font-bold text-ink-900">
                Register for alerts
              </h2>
              <p className="mt-1.5 text-[var(--text-sm)] text-ink-500">
                Takes 30 seconds. Free forever.
              </p>
              <div className="mt-6">
                <RetailSignupForm />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Trust strip */}
      <section className="border-b border-border bg-white py-10">
        <Container>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-[var(--text-sm)] text-ink-500">
            {[
              "No spam — only relevant stock alerts",
              "Unsubscribe any time",
              "Listings from verified UK dealers only",
            ].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <IconCheck width={14} height={14} className="shrink-0 text-success-500" />
                {t}
              </span>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
