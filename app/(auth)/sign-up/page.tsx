import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false },
};

const JOURNEYS = [
  {
    icon: "🔍",
    title: "I'm a buyer",
    body: "Save vans, set alerts and enquire directly via WhatsApp.",
    href: "/sign-up/buyer",
    cta: "Create buyer account",
    highlight: false,
  },
  {
    icon: "🏪",
    title: "I'm a trade dealer",
    body: "Advertise your stock. Plans from £39/mo. 14-day free trial.",
    href: "/sign-up/dealer",
    cta: "Start free trial",
    highlight: true,
  },
  {
    icon: "🏢",
    title: "Dealer group / enterprise",
    body: "Multi-site, bulk stock, custom lead routing. Let's talk.",
    href: "/sign-up/dealer-group",
    cta: "Contact enterprise sales",
    highlight: false,
  },
  {
    icon: "🚐",
    title: "Private seller",
    body: "Sell one van for free. No subscription.",
    href: "/sign-up/private-seller",
    cta: "List my van",
    highlight: false,
  },
  {
    icon: "💸",
    title: "Finance / hire / fleet",
    body: "Bulk disposal, fleet remarketing, wholesale enquiries.",
    href: "/sign-up/finance-hire-fleet",
    cta: "Talk to us",
    highlight: false,
  },
  {
    icon: "⚡",
    title: "Already on Dealski?",
    body: "Your stock feeds in automatically in 5 minutes. No manual uploads.",
    href: "/sign-up/dealski-connect",
    cta: "Connect my Dealski account",
    highlight: false,
  },
];

export default function SignUpChoosePage() {
  return (
    <div className="w-full max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="font-display text-[var(--text-2xl)] font-extrabold text-ink-900">Join Vansales</h1>
        <p className="mt-2 text-[var(--text-sm)] text-ink-500">Choose the account type that fits you</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {JOURNEYS.map((j) => (
          <Link
            key={j.href}
            href={j.href}
            className={`group flex flex-col rounded-[var(--radius-xl)] border p-5 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] ${
              j.highlight
                ? "border-brand-500 bg-white ring-2 ring-brand-200"
                : "border-border bg-white hover:border-brand-400/40"
            }`}
          >
            <div className="mb-3 text-3xl" aria-hidden>{j.icon}</div>
            <h2 className="font-display text-[var(--text-base)] font-bold text-ink-900">{j.title}</h2>
            <p className="mt-1 flex-1 text-[var(--text-sm)] leading-relaxed text-ink-600">{j.body}</p>
            <span className={`mt-4 inline-flex items-center gap-1.5 text-[var(--text-sm)] font-semibold ${j.highlight ? "text-brand-700" : "text-ink-700 group-hover:text-brand-700"}`}>
              {j.cta} →
            </span>
          </Link>
        ))}
      </div>
      <p className="mt-6 text-center text-[var(--text-sm)] text-ink-500">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-brand-700 hover:underline">Sign in →</Link>
      </p>
    </div>
  );
}
