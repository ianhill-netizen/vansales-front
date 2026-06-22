import type { Metadata } from "next";
import { Container, Eyebrow } from "@/components/ui";
import { IconCheck, IconTruck, IconLeads, IconTrendUp } from "@/components/icons";
import { TradeSignupForm } from "./form";

export const metadata: Metadata = {
  title: "List Your Stock Free | Dealer Sign Up | Vansales",
  description:
    "List your van stock free on Vansales. Buyer enquiries go directly to your inbox — no call centre, no middlemen. Launching August 2026. Register now.",
};

const BENEFITS = [
  {
    icon: IconTruck,
    title: "Free stock listing",
    body: "No setup fees, no contracts, no cost to list. Your stock in front of active UK buyers from day one.",
  },
  {
    icon: IconLeads,
    title: "Direct buyer enquiries",
    body: "Enquiries land directly with you — not a shared call centre. Every lead is yours.",
  },
  {
    icon: IconTrendUp,
    title: "Paid upgrades when you're ready",
    body: "Priority placement, featured listings and lead analytics available when we launch.",
  },
];

export default function TradeSignupPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-surface-1">
        <Container className="py-16 lg:py-20">
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_420px]">
            {/* Left — value prop */}
            <div>
              <Eyebrow>Dealers & trade</Eyebrow>
              <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3rem)] font-extrabold leading-[1.1] text-ink-900">
                List your stock free.
                <br />
                <span className="text-accent-500">Buyer enquiries in your inbox.</span>
              </h1>
              <p className="mt-5 max-w-lg text-[var(--text-md)] leading-relaxed text-ink-600">
                The van marketplace built for dealers. Your stock in front of thousands of active UK
                buyers — enquiries delivered directly to you. No middlemen, no commission.
              </p>

              {/* Benefits */}
              <ul className="mt-8 space-y-5">
                {BENEFITS.map(({ icon: Icon, title, body }) => (
                  <li key={title} className="flex items-start gap-4">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-accent-tint text-accent-600">
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
                <span className="flex size-7 items-center justify-center rounded-full bg-accent-tint text-accent-600">
                  <IconCheck width={14} height={14} />
                </span>
                <span>
                  <strong className="text-ink-900">Dealer slots open now</strong> — launching
                  August 2026. Early registrants get priority onboarding.
                </span>
              </div>
            </div>

            {/* Right — form card */}
            <div className="rounded-[var(--radius-2xl)] border border-border bg-white p-8 shadow-[var(--shadow-md)]">
              <h2 className="font-display text-[var(--text-xl)] font-bold text-ink-900">
                Register your dealership
              </h2>
              <p className="mt-1.5 text-[var(--text-sm)] text-ink-500">
                Takes 2 minutes. Free to list — always.
              </p>
              <div className="mt-6">
                <TradeSignupForm />
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
              "Free to list — no fees, ever",
              "Direct enquiries — no middlemen",
              "Paid upgrades available at launch",
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
