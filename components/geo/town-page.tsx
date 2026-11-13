import type { Metadata } from "next";
import { Container, Eyebrow, Button } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { DealersSection, GeoBreadcrumb, LinkList, RelatedPages, StockSection } from "@/components/geo/geo-parts";
import { getLiveModelPageSlugs } from "@/lib/content/model-pages";
import { GEO } from "@/lib/geo/config";
import { townIntro } from "@/lib/geo/intro";
import { loadGeoInputs, topBodyStyles } from "@/lib/geo/load";
import { summarisePlace } from "@/lib/geo/summary";
import { nearbyPlaces, type Place } from "@/lib/geo/towns";
import { REGIONS, geoPath, geoTrail } from "@/lib/geo/tree";
import { fitTitle } from "@/lib/seo/title";
import { listingPath } from "@/lib/listings/slug";
import { SITE, absUrl } from "@/lib/site";
import type { InRange } from "@/lib/geo/stock";
import type { Listing } from "@/lib/listings/types";
import type { DirectoryDealer } from "@/lib/dealers/directory";

const regionLabel = (key: string) => REGIONS.find((r) => r.key === key)!.label;
const townPath = (t: Place) => geoPath(t.s);

async function townData(t: Place) {
  const { vans, dealers } = await loadGeoInputs();
  return summarisePlace({ lat: t.la, lng: t.ln }, vans, dealers);
}

/** "Vans for Sale in {Town}, {County} | Vansales", fitted. Indexed only with enough vans or a dealer in range; otherwise noindex,follow with the canonical on the region page. */
export async function townMetadata(t: Place): Promise<Metadata> {
  const s = await townData(t);
  const county = t.c && t.c.toLowerCase() !== t.n.toLowerCase() ? `, ${t.c}` : "";
  const title = `${fitTitle(`Vans for Sale in ${t.n}${county}`, " | Vansales")} | Vansales`;
  const description = `Used vans for sale near ${t.n}${county}: ${s.stock.vans.length} listed within ${s.stock.radius} miles, with nearby dealers and towns.`.slice(0, 160);
  const canonical = s.indexable ? townPath(t) : geoPath(t.r);
  return {
    title: { absolute: title }, description, alternates: { canonical },
    robots: s.indexable ? undefined : { index: false, follow: true },
    openGraph: { title, description, url: canonical, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export async function TownPage({ town }: { town: Place }) {
  const [{ vans, dealers }, liveModels] = await Promise.all([loadGeoInputs(), getLiveModelPageSlugs().catch(() => new Set<string>())]);
  const s = summarisePlace({ lat: town.la, lng: town.ln }, vans, dealers);
  const region = regionLabel(town.r);
  const near = s.stock.vans.map((v) => v.item);
  const intro = townIntro({ town: town.n, county: town.c, region, vans: near.length, radius: s.stock.radius, dealers: s.dealers.length, bodyTypes: topBodyStyles(near) });
  const trail = geoTrail({ key: town.s, nation: town.t, region: town.r }).slice(0, -1);
  const nearby = nearbyPlaces(town, GEO.nearbyTowns).map((p) => ({ href: geoPath(p.s), label: `Vans for sale in ${p.n}` }));
  const url = absUrl(townPath(town));
  const collection = {
    "@context": "https://schema.org", "@type": "CollectionPage", name: `Vans for sale in ${town.n}`, url, inLanguage: "en-GB",
    isPartOf: { "@type": "WebSite", name: SITE.name, url: absUrl("/") },
    mainEntity: { "@type": "ItemList", numberOfItems: near.length, itemListElement: s.stock.vans.slice(0, GEO.shownVans).map((v, i) => ({ "@type": "ListItem", position: i + 1, url: absUrl(listingPath(v.item)) })) },
  };
  const breadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", item: absUrl("/") }, ...trail.map((t) => ({ name: t.label, item: absUrl(geoPath(t.key)) })), { name: town.n, item: url }]
      .map((x, i) => ({ "@type": "ListItem", position: i + 1, name: x.name, item: x.item })),
  };
  return (
    <>
      <JsonLd data={[collection, breadcrumb]} />
      <section className="border-b border-border bg-surface-1">
        <Container className="py-10">
          <GeoBreadcrumb trail={trail} last={town.n} />
          <Eyebrow>Vans near {town.n}</Eyebrow>
          <h1 className="mt-2 font-display text-[length:var(--text-3xl)] font-extrabold leading-tight text-ink-900">Vans for sale in {town.n}</h1>
          <p className="mt-3 max-w-3xl text-[length:var(--text-md)] text-ink-600">{intro}</p>
          <div className="mt-6 flex flex-wrap gap-3"><Button href="/vans" variant="outline" size="lg">Search all vans for sale</Button></div>
        </Container>
      </section>
      <Container className="space-y-12 py-10">
        <StockSection title={`Used vans near ${town.n}`} vans={s.stock.vans as InRange<Listing>[]} radius={s.stock.radius} expanded={s.stock.expanded} label={town.n} />
        <DealersSection dealers={s.dealers as { item: DirectoryDealer; miles?: number }[]} label={town.n} />
        <RelatedPages vans={near} liveModels={liveModels} />
        <LinkList title="Nearby towns" items={nearby} />
        <LinkList title="More vans for sale" items={[{ href: geoPath(town.r), label: `Vans for sale in ${region}` }, { href: "/vans", label: "All vans for sale" }]} />
        <p className="text-[length:var(--text-xs)] text-ink-400">Place names and locations: <a href="https://www.geonames.org" rel="noopener noreferrer" className="hover:underline">GeoNames</a>, CC BY 4.0.</p>
      </Container>
    </>
  );
}
