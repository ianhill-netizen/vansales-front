import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, Eyebrow, Button } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { DealersSection, GeoBreadcrumb, LinkList, RelatedPages, StockSection } from "@/components/geo/geo-parts";
import { getGeoBody, getLiveGeoKeys } from "@/lib/content/geo";
import { getLiveModelPageSlugs } from "@/lib/content/model-pages";
import { loadGeoInputs } from "@/lib/geo/load";
import { summarisePlace } from "@/lib/geo/summary";
import { CITIES, GEO_NODES, REGIONS, geoPath, geoTitle, geoTrail, type GeoNode } from "@/lib/geo/tree";
import { findPlace, nearbyPlaces, nearestPlace } from "@/lib/geo/towns";
import { GEO } from "@/lib/geo/config";
import { listingPath } from "@/lib/listings/slug";
import { SITE, absUrl } from "@/lib/site";
import type { InRange } from "@/lib/geo/stock";
import type { Listing } from "@/lib/listings/types";
import type { DirectoryDealer } from "@/lib/dealers/directory";

/** A nation / region owns every van and dealer whose nearest gazetteer place lies inside it; a city owns those within its radius (config.ts). */
async function areaData(node: GeoNode) {
  const { vans, dealers } = await loadGeoInputs();
  if (node.kind === "city") {
    const place = findPlace(node.key)!;
    const s = summarisePlace({ lat: place.la, lng: place.ln }, vans, dealers);
    return { vans: s.stock.vans as InRange<Listing>[], radius: s.stock.radius, expanded: s.stock.expanded, dealers: s.dealers as { item: DirectoryDealer; miles?: number }[], indexable: s.indexable };
  }
  const inArea = (lat: number | null, lng: number | null) => {
    if (lat == null || lng == null) return false;
    const p = nearestPlace(lat, lng);
    return node.kind === "nation" ? p.t === node.key : p.r === node.key;
  };
  return {
    vans: vans.filter((v) => inArea(v.location.lat, v.location.lng)).map((item) => ({ item, miles: 0 })),
    radius: undefined as number | undefined, expanded: false,
    dealers: dealers.filter((d) => inArea(d.lat, d.lng)).map((item) => ({ item })),
    indexable: true,   // nation and region pages always index
  };
}

export async function geoMetadata(node: GeoNode): Promise<Metadata> {
  const title = geoTitle(node.label);
  const description = `Used vans for sale in ${node.label}: stock from dealers near you, a local buying guide, and the body types and models to look at.`;
  const area = await areaData(node);
  const path = geoPath(node.key);
  // A city below the index rule defers to its region page.
  const canonical = area.indexable ? path : geoPath(node.region && node.region !== node.key ? node.region : node.nation);
  return {
    title: { absolute: title }, description, alternates: { canonical },
    robots: area.indexable ? undefined : { index: false, follow: true },
    openGraph: { title, description, url: canonical, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export async function GeoPage({ node }: { node: GeoNode }) {
  const [body, area, liveModels] = await Promise.all([
    getGeoBody(node.key), areaData(node), getLiveModelPageSlugs().catch(() => new Set<string>()),
  ]);
  if (body.status === "unavailable") throw new Error(`vansales-backend content API unavailable for ${node.key}`);
  if (body.status !== "ok") notFound();

  const trail = geoTrail(node);
  const parents = trail.slice(0, -1);
  const childKeys: { key: string; label: string }[] =
    node.kind === "nation" && node.nation === "england" ? REGIONS.filter((r) => r.nation === "england").map((r) => ({ key: r.key, label: r.label }))
    : node.kind === "city" ? nearbyPlaces(findPlace(node.key)!, GEO.nearbyTowns).map((p) => ({ key: p.s, label: p.n }))
    : CITIES.filter(([, , r]) => r === node.key || (node.kind === "nation" && r === node.key)).map(([k, l]) => ({ key: k, label: l }));
  // Cities in a region / nation, and (for a city) the towns around it, link only when they have a page: a city needs a published guide, a town is always served.
  const cityKeys = new Set(GEO_NODES.map((n) => n.key));
  const live = await getLiveGeoKeys(childKeys.map((c) => c.key).filter((k) => cityKeys.has(k)));
  const children = childKeys.filter((c) => !cityKeys.has(c.key) || live.has(c.key)).map((c) => ({ href: geoPath(c.key), label: node.kind === "city" ? `Vans for sale in ${c.label}` : `Used vans in ${c.label}` }));

  const url = absUrl(geoPath(node.key));
  const shown = area.vans.slice(0, GEO.shownVans);
  const collection = {
    "@context": "https://schema.org", "@type": "CollectionPage", name: `Vans for sale in ${node.label}`, url, inLanguage: "en-GB",
    isPartOf: { "@type": "WebSite", name: SITE.name, url: absUrl("/") },
    ...(body.modified ? { dateModified: body.modified } : {}),
    mainEntity: { "@type": "ItemList", numberOfItems: area.vans.length, itemListElement: shown.map((v, i) => ({ "@type": "ListItem", position: i + 1, url: absUrl(listingPath(v.item)) })) },
  };
  const breadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", item: absUrl("/") }, ...parents.map((t) => ({ name: t.label, item: absUrl(geoPath(t.key)) })), { name: node.label, item: url }]
      .map((x, i) => ({ "@type": "ListItem", position: i + 1, name: x.name, item: x.item })),
  };
  return (
    <>
      <JsonLd data={[collection, breadcrumb]} />
      <section className="border-b border-border bg-surface-1">
        <Container className="py-10">
          <GeoBreadcrumb trail={parents} last={node.label} />
          <Eyebrow>{node.kind === "nation" ? "Vans by nation" : node.kind === "region" ? "Vans by region" : "Vans by city"}</Eyebrow>
          <h1 className="mt-2 font-display text-[length:var(--text-3xl)] font-extrabold leading-tight text-ink-900">Used Vans For Sale in {node.label}</h1>
          <div className="mt-6 flex flex-wrap gap-3"><Button href="/vans" variant="outline" size="lg">Browse all vans for sale</Button></div>
        </Container>
      </section>
      <Container className="space-y-12 py-10">
        <StockSection title={`Used vans for sale in ${node.label}`} vans={area.vans} radius={area.radius} expanded={area.expanded} label={node.label} />
        {/* body_html is sanitised on the server (allow-listed tags, no attributes) before it reaches this page */}
        <article className="prose-vs max-w-3xl space-y-4 text-[length:var(--text-md)] leading-relaxed text-ink-600 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-[length:var(--text-xl)] [&_h2]:font-bold [&_h2]:text-ink-900 [&_h3]:mt-6 [&_h3]:font-display [&_h3]:font-bold [&_h3]:text-ink-900 [&_ul]:list-disc [&_ul]:pl-5" dangerouslySetInnerHTML={{ __html: body.bodyHtml }} />
        <DealersSection dealers={area.dealers} label={node.label} />
        <RelatedPages vans={area.vans.map((v) => v.item)} liveModels={liveModels} />
        <LinkList title={node.kind === "city" ? "Nearby towns" : node.kind === "nation" || node.region === node.key ? "Cities and areas" : `Cities in ${node.label}`} items={children} />
        <LinkList title="Keep reading" items={[...parents.map((t) => ({ href: geoPath(t.key), label: `Vans for sale in ${t.label}` })), { href: "/van-finance", label: "Van finance" }, { href: "/used-vans", label: "Used vans by make and model" }]} />
      </Container>
    </>
  );
}
