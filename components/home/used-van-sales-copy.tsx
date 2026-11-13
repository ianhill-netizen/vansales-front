import Link from "next/link";
import { Container } from "@/components/ui";
import { findUsedVanModel, usedVanPath } from "@/lib/used-vans/models";
import { bodyTypePath, findBodyType } from "@/lib/used-vans/body-types";

type Anchor = { label: string; href: string };

// Anchor text -> the real page. A model or body-type anchor renders only when its page is published (live set); the rest are fixed routes that exist in the app.
const MODEL_ANCHORS: ReadonlyArray<readonly [string, string, string]> = [
  ["Ford Transit Custom for sale", "ford", "transit-custom"],
  ["VW Transporter for sale", "volkswagen", "transporter"],
  ["VW Caddy for sale", "volkswagen", "caddy"],
  ["Vauxhall Vivaro for sale", "vauxhall", "vivaro"],
  ["Mercedes Sprinter for sale", "mercedes-benz", "sprinter"],
  ["Renault Trafic for sale", "renault", "trafic"],
];
const BODY_ANCHORS: ReadonlyArray<readonly [string, string]> = [
  ["crew cab vans for sale", "crew-van"],
  ["tipper vans for sale", "tipper"],
  ["dropside vans for sale", "dropside"],
  ["Luton vans for sale", "luton"],
];
// "small vans for sale" and "automatic vans for sale" have no page in the app, so they are not linked.
const FIXED_ANCHORS: readonly Anchor[] = [
  { label: "electric vans for sale", href: "/electric-vans" },
  { label: "pickup trucks for sale", href: "/vans/pickup" },
];

function List({ items }: { items: Anchor[] }) {
  return (
    <>
      {items.map((a, i) => (
        <span key={a.href}>
          <Link href={a.href} className="font-semibold text-brand-700 hover:underline">{a.label}</Link>
          {i < items.length - 2 ? ", " : i === items.length - 2 ? " and " : ""}
        </span>
      ))}
    </>
  );
}

/** ~300 words of plain copy above the three Why Vansales cards, with internal links to the model and body-type pages. */
export function UsedVanSalesCopy({ liveModelSlugs, liveBodyTypeSlugs }: { liveModelSlugs: ReadonlySet<string>; liveBodyTypeSlugs: ReadonlySet<string> }) {
  const models: Anchor[] = MODEL_ANCHORS.flatMap(([label, make, model]) => {
    const m = findUsedVanModel(make, model);
    return m && liveModelSlugs.has(m.pageSlug) ? [{ label, href: usedVanPath(m) }] : [];
  });
  const bodies: Anchor[] = [
    ...BODY_ANCHORS.flatMap(([label, slug]) => {
      const b = findBodyType(slug);
      return b && liveBodyTypeSlugs.has(slug) ? [{ label, href: bodyTypePath(b) }] : [];
    }),
    ...FIXED_ANCHORS,
  ];
  return (
    <Container className="pt-10">
      <section aria-labelledby="used-van-sales-heading" className="max-w-3xl space-y-4 text-[length:var(--text-md)] leading-relaxed text-ink-600">
        <h2 id="used-van-sales-heading" className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">Used van sales across the UK</h2>
        <p>
          Vansales.com brings used vans for sale from franchised dealers, independent van sales specialists and private sellers into one place. Dealers send us their stock feed and private sellers list for free, so you can see the UK van market in one search instead of checking a dozen sites.
        </p>
        <p>
          Coverage is UK-wide. Search by town or postcode, or open the map to see vans near you and drag it around while the list follows. You can sort by distance and set a search radius, so you see what is actually close enough to go and look at.
        </p>
        <p>
          Search the way a working van buyer thinks, not just by price. Filter by payload, wheelbase, ULEZ compliance, mileage, body type and automatic gearbox, then narrow it down by make, model, fuel and year. Every advert shows real photos, and a van that has been HPI checked carries an HPI badge, so you can tell at a glance which ones have a history check behind them.
        </p>
        {models.length > 0 && (
          <p>
            Looking for a particular model? Start with the <List items={models} />.
          </p>
        )}
        {bodies.length > 0 && (
          <p>
            Need a specific body? Browse <List items={bodies} />.
          </p>
        )}
        <p>
          There are no hidden fees for buyers, and private sellers list free. Whatever you are buying or selling, the aim is the same: honest listings, straight answers and no nonsense.
        </p>
      </section>
    </Container>
  );
}
