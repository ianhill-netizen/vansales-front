import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui";
import { IconSearch, IconTruck, IconBarChart } from "@/components/icons";

export const metadata: Metadata = {
  title: "Sign Up | Vansales — Van Buyers, Dealers & Advertisers",
  description:
    "Join Vansales as a van buyer, dealer, or advertiser. Get stock alerts, list your vans free, or reach thousands of active UK van buyers.",
};

const OPTIONS = [
  {
    href: "/signup/retail",
    icon: IconSearch,
    label: "Van buyer",
    tagline: "I'm looking for a van",
    description:
      "Get alerted the moment matching stock lands. Filter by spec, body type, ULEZ status and more.",
    cta: "Get van alerts →",
    accent: "brand",
  },
  {
    href: "/signup/trade",
    icon: IconTruck,
    label: "Dealer / trade",
    tagline: "I want to list my stock",
    description:
      "List your vehicles free and receive buyer enquiries directly. No middlemen, no call centres.",
    cta: "List my stock free →",
    accent: "accent",
  },
  {
    href: "/signup/advertise",
    icon: IconBarChart,
    label: "Advertiser",
    tagline: "I want to reach van buyers",
    description:
      "Put your brand in front of 50,000+ UK buyers actively comparing, financing and insuring.",
    cta: "Request media pack →",
    accent: "brand",
  },
] as const;

export default function SignupHubPage() {
  return (
    <section className="min-h-[70vh] bg-surface-1 py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Get started</Eyebrow>
          <h1 className="mt-3 font-display text-[var(--text-3xl)] font-extrabold leading-tight text-ink-900">
            Which best describes you?
          </h1>
          <p className="mt-4 text-[var(--text-md)] text-ink-500">
            Choose your path — we&rsquo;ll ask only what&rsquo;s relevant.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-3">
          {OPTIONS.map(({ href, icon: Icon, label, tagline, description, cta, accent }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col rounded-[var(--radius-2xl)] border border-border bg-white p-8 shadow-[var(--shadow-xs)] transition hover:border-brand-400 hover:shadow-[var(--shadow-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <div
                className={`mb-5 flex size-12 items-center justify-center rounded-[var(--radius-lg)] ${
                  accent === "accent" ? "bg-accent-tint text-accent-600" : "bg-brand-tint text-brand-600"
                }`}
              >
                <Icon width={22} height={22} />
              </div>

              <p className="text-[var(--text-2xs)] font-bold uppercase tracking-[var(--tracking-eyebrow)] text-ink-400">
                {label}
              </p>
              <h2 className="mt-1 font-display text-[var(--text-lg)] font-bold text-ink-900">
                {tagline}
              </h2>
              <p className="mt-2 flex-1 text-[var(--text-sm)] leading-relaxed text-ink-500">
                {description}
              </p>

              <span
                className={`mt-6 text-[var(--text-sm)] font-semibold transition ${
                  accent === "accent"
                    ? "text-accent-600 group-hover:text-accent-700"
                    : "text-brand-600 group-hover:text-brand-700"
                }`}
              >
                {cta}
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
