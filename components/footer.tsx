import Link from "next/link";
import { Container } from "./ui";
import { Logo } from "./brand";
import { SITE } from "@/lib/site";
import { getLiveGeoKeys } from "@/lib/content/geo";
import { NATIONS, REGIONS, geoPath } from "@/lib/geo/tree";

const COLS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Browse stock",
    links: [
      { href: "/used-vans/body-type/panel-van-for-sale", label: "Panel vans for sale" },
      { href: "/used-vans/body-type/luton-for-sale",     label: "Luton vans for sale" },
      { href: "/used-vans/body-type/tipper-for-sale",    label: "Tipper vans for sale" },
      { href: "/used-vans/body-type/dropside-for-sale",  label: "Dropside vans for sale" },
      { href: "/used-vans/body-type/crew-van-for-sale",  label: "Crew cab vans for sale" },
      { href: "/used-vans/body-type/pickup-for-sale",    label: "Pickup trucks for sale" },
      { href: "/electric-vans",  label: "Electric vans for sale" },
    ],
  },
  {
    title: "Popular models",
    links: [
      { href: "/used-vans/volkswagen/transporter-for-sale", label: "VW Transporter for sale" },
      { href: "/used-vans/ford/transit-custom-for-sale",    label: "Ford Transit Custom for sale" },
      { href: "/used-vans/ford/transit-for-sale",           label: "Ford Transit for sale" },
      { href: "/used-vans/mercedes-benz/sprinter-for-sale", label: "Mercedes Sprinter for sale" },
      { href: "/used-vans/vauxhall/vivaro-for-sale",        label: "Vauxhall Vivaro for sale" },
      { href: "/van-news",                     label: "Van news" },
      { href: "/directory",                   label: "All makes A–Z" },
      { href: "/dealers",                     label: "Find a dealer" },
    ],
  },
  {
    title: "Vansales",
    links: [
      { href: "/sell",              label: "Advertise your van" },
      { href: "/sell-my-van",       label: "Sell my van" },
      { href: "/van-finance",       label: "Van finance" },
      { href: "/van-insurance",     label: "Van insurance" },
      { href: "/van-warranty",      label: "Van warranty" },
      { href: "/van-breakdown-cover", label: "Breakdown cover" },
      { href: "/van-lease-deals", label: "Van leasing" },
      { href: "/van-reviews",       label: "Van reviews" },
      { href: "/blog",              label: "Guides & news" },
      { href: "/van-accessories",   label: "Van accessories" },
      { href: "/sitemap",           label: "Site map" },
      { href: "https://dealer.vansales.com/login",       label: "Dealer login" },
      { href: "/advertise",                              label: "Advertise with us" },
      { href: "/stock-feeds",                            label: "Stock feeds" },
      { href: "https://sell.vansales.com/signup/private", label: "List my van free" },
    ],
  },
];

// Chip groups under the footer's text column. Regions and brands are listed here so every landing page has a sitewide inbound link (five region pages and two brand pages had none, 2026-11-12).
const CHIP_GROUPS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Popular makes",
    links: [
      { href: "/vans/ford-vans-for-sale",          label: "Ford" },
      { href: "/vans/volkswagen-vans-for-sale",    label: "Volkswagen" },
      { href: "/vans/mercedes-benz-vans-for-sale", label: "Mercedes" },
      { href: "/vans/vauxhall-vans-for-sale",      label: "Vauxhall" },
      { href: "/vans/renault-vans-for-sale",       label: "Renault" },
      { href: "/vans/citroen-vans-for-sale",       label: "Citroën" },
    ],
  },
  {
    title: "Vans by region",
    links: [
      { href: "/vans-for-sale/london",     label: "London" },
      { href: "/vans-for-sale/birmingham", label: "Birmingham" },
      { href: "/vans-for-sale/manchester", label: "Manchester" },
      { href: "/vans-for-sale/leeds",      label: "Leeds" },
      { href: "/vans-for-sale/bristol",    label: "Bristol" },
      { href: "/vans-for-sale/wales",      label: "Wales" },
      { href: "/vans-for-sale/scotland",   label: "Scotland" },
    ],
  },
  {
    title: "Van brands",
    links: [
      { href: "/byd-vans-uk",       label: "BYD" },
      { href: "/maxus-vans-uk",     label: "Maxus" },
      { href: "/leapmotor-vans-uk", label: "Leapmotor" },
      { href: "/changan-vans-uk",   label: "Changan" },
    ],
  },
];

/** The Regions block: the four nations and the 12 regions that have a published page. */
async function regionLinks(): Promise<{ href: string; label: string }[]> {
  const all = [...NATIONS, ...REGIONS].filter((x, i, a) => a.findIndex((y) => y.key === x.key) === i);
  const live = await getLiveGeoKeys(all.map((x) => x.key)).catch(() => new Set<string>());
  return all.filter((x) => live.has(x.key)).map((x) => ({ href: geoPath(x.key), label: x.label }));
}

export async function Footer() {
  const regions = await regionLinks();
  const chipGroups = regions.length > 0 ? [...CHIP_GROUPS, { title: "Regions", links: regions }] : CHIP_GROUPS;
  return (
    <footer className="mt-[var(--section-y)] bg-ink-900 text-white">

      {/* Brand statement strip */}
      <div className="border-b border-ink-800">
        <Container className="flex flex-col items-start justify-between gap-6 py-12 sm:flex-row sm:items-center">
          <div>
            <Logo tone="light" />
            <p className="mt-4 max-w-sm text-[length:var(--text-base)] leading-relaxed text-ink-400">
              The UK&rsquo;s straight-talking van marketplace — spec-first search from verified dealers.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:items-end">
            <Link
              href="/sell"
              className="inline-flex items-center gap-2 rounded-[var(--radius-md)] px-4 py-2.5 text-[length:var(--text-sm)] font-bold text-white"
              style={{ background: "linear-gradient(135deg, #f47c1e 0%, #d96410 100%)" }}
            >
              Advertise your van →
            </Link>
          </div>
        </Container>
      </div>

      {/* Link columns */}
      <Container className="grid gap-10 py-12 md:grid-cols-[1.2fr_repeat(3,1fr)]">
        {/* SEO text column */}
        <div>
          <p className="text-[length:var(--text-sm)] leading-relaxed text-ink-500">
            Vansales brings together thousands of used and new vans for sale from verified UK
            dealers. Filter by payload, wheelbase, ULEZ compliance and Euro 6 status to find
            the van that fits the job.
          </p>
          {chipGroups.map((g) => (
            <div key={g.title} className="mt-6">
              <h2 className="font-mono text-[length:var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink-500">{g.title}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {g.links.map((m) => (
                  <Link
                    key={m.href}
                    href={m.href}
                    className="rounded-[var(--radius-sm)] border border-ink-800 px-2.5 py-1 text-[length:var(--text-xs)] font-semibold text-ink-500 transition-colors hover:border-ink-600 hover:text-ink-300"
                  >
                    {m.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {COLS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="font-mono text-[length:var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink-500">
              {col.title}
            </h2>
            <ul className="mt-5 space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-[length:var(--text-sm)] text-ink-400 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>

      {/* Bottom bar */}
      <div className="border-t border-ink-800">
        <Container className="flex flex-col gap-2 py-5 text-[length:var(--text-xs)] text-ink-600 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-ink-500">Vansales — the UK&apos;s straight-talking van marketplace. Built in Wales.</p>
            <p>© {new Date().getFullYear()} {SITE.name}</p>
          </div>
          <p className="font-mono tracking-[var(--tracking-wide)]">
            {SITE.domain}
          </p>
        </Container>
      </div>
    </footer>
  );
}
