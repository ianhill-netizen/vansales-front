import type { Metadata } from "next";
import { Container, Eyebrow } from "@/components/ui";
import { IconCheck, IconUser, IconBarChart, IconShield } from "@/components/icons";
import { AdvertiseSignupForm } from "./form";

export const metadata: Metadata = {
  title: "Advertise with Vansales | Reach UK Van Buyers | Media Pack",
  description:
    "Reach 50,000+ UK van buyers at the moment they're ready to buy. Audience and intent targeting across insurance, finance, warranty and more. Request our media pack.",
};

const BENEFITS = [
  {
    icon: IconUser,
    title: "High-intent audience",
    body: "50,000+ UK buyers actively comparing, financing and insuring their next van — not casual browsers.",
  },
  {
    icon: IconBarChart,
    title: "Audience & intent targeting",
    body: "Target by vehicle type, geography, buyer stage and device. Your spend goes where it converts.",
  },
  {
    icon: IconShield,
    title: "Brand-safe, premium placements",
    body: "Above-the-fold, in-listing and takeover formats on a clean, editorial site. No ad networks.",
  },
];

export default function AdvertiseSignupPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-surface-1">
        <Container className="py-16 lg:py-20">
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_420px]">
            {/* Left — value prop */}
            <div>
              <Eyebrow>Advertising & media</Eyebrow>
              <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3rem)] font-extrabold leading-[1.1] text-ink-900">
                Reach UK van buyers
                <br />
                <span className="text-brand-500">at the moment they&rsquo;re ready.</span>
              </h1>
              <p className="mt-5 max-w-lg text-[var(--text-md)] leading-relaxed text-ink-600">
                Vansales puts your brand in front of a high-intent audience of UK van buyers
                actively comparing, financing and insuring their next vehicle. Audience and intent
                targeting — not spray-and-pray display.
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
                <span className="flex size-7 items-center justify-center rounded-full bg-brand-tint text-brand-600">
                  <IconCheck width={14} height={14} />
                </span>
                <span>
                  <strong className="text-ink-900">Media pack sent</strong> within 1 business
                  day — no obligation
                </span>
              </div>
            </div>

            {/* Right — form card */}
            <div className="rounded-[var(--radius-2xl)] border border-border bg-white p-8 shadow-[var(--shadow-md)]">
              <h2 className="font-display text-[var(--text-xl)] font-bold text-ink-900">
                Request our media pack
              </h2>
              <p className="mt-1.5 text-[var(--text-sm)] text-ink-500">
                Audience data, formats, and rates. No hard sell.
              </p>
              <div className="mt-6">
                <AdvertiseSignupForm />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Audience stats strip */}
      <section className="border-b border-border bg-white py-10">
        <Container>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-[var(--text-sm)] text-ink-500">
            {[
              "50,000+ monthly active buyers",
              "Audience, intent & geo targeting",
              "Premium, brand-safe placements",
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
