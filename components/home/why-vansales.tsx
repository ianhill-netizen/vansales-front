import Link from "next/link";
import { Container } from "@/components/ui";
import { SELL_URL } from "@/lib/site";
import { PanelVanIcon } from "@/components/icons/body-types";

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const CARDS = [
  {
    title: "For buyers",
    body: "Search by what matters: payload, wheelbase, ULEZ, mileage. Not just price.",
    href: "/vans",
    link: "Find a van",
    external: false,
    icon: (<PanelVanIcon className="h-5 w-[30px]" strokeWidth={1.75} />),
  },
  {
    title: "For sellers",
    body: "List free in about five minutes. Enquiries come straight to you, and we never share your number.",
    href: SELL_URL,
    link: "Sell your van",
    external: true,
    icon: (<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden {...stroke}><path d="M4 12.5l5 5L20 6.5" /></svg>),
  },
  {
    title: "For dealers",
    body: "Your stock, your enquiries, your own page. Bring your vans in from AutoTrader or a CSV.",
    href: "/advertise",
    link: "Advertise with us",
    external: false,
    icon: (<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden {...stroke}><path d="M4 20V9l8-5 8 5v11" /><path d="M9 20v-6h6v6" /></svg>),
  },
] as const;

/** Three short cards under the latest vans: who vansales is for, in plain English. */
export function WhyVansales() {
  return (
    <Container className="pt-10"><section aria-labelledby="why-heading">
      <h2 id="why-heading" className="font-display text-[var(--text-xl)] font-bold text-ink-900">Why Vansales</h2>
      <ul className="mt-4 grid gap-4 md:grid-cols-3">
        {CARDS.map((c) => (
          <li key={c.title} className="flex flex-col rounded-[var(--radius-xl)] border border-border bg-white p-5 shadow-[var(--shadow-xs)]">
            <span className="grid size-10 place-items-center rounded-[var(--radius-lg)] bg-brand-50 text-brand-700">{c.icon}</span>
            <h3 className="mt-3 font-display text-[var(--text-lg)] font-bold text-ink-900">{c.title}</h3>
            <p className="mt-1 text-[var(--text-sm)] leading-relaxed text-ink-600">{c.body}</p>
            {c.external ? (
              <a href={c.href} className="mt-4 text-[var(--text-sm)] font-semibold text-brand-700 hover:underline">{c.link} →</a>
            ) : (
              <Link href={c.href} className="mt-4 text-[var(--text-sm)] font-semibold text-brand-700 hover:underline">{c.link} →</Link>
            )}
          </li>
        ))}
      </ul>
    </section></Container>
  );
}
