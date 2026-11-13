import Link from "next/link";
import { ListingCard } from "@/components/listing-card";
import { GEO } from "@/lib/geo/config";
import { geoPath, geoTrail } from "@/lib/geo/tree";
import { townSlug, townLabel } from "@/lib/dealers/places";
import { BODY_TYPE_PAGES, bodyTypePath } from "@/lib/used-vans/body-types";
import { findUsedVanModel, usedVanPath } from "@/lib/used-vans/models";
import type { DirectoryDealer } from "@/lib/dealers/directory";
import type { Listing } from "@/lib/listings/types";
import type { InRange } from "@/lib/geo/stock";

const H2 = "font-display text-[length:var(--text-xl)] font-bold text-ink-900";

export function GeoBreadcrumb({ trail, last }: { trail: { key: string; label: string }[]; last: string }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-[length:var(--text-sm)] text-ink-400">
      <Link href="/" className="hover:text-ink-900">Home</Link><span aria-hidden>/</span>
      {trail.map((t) => <span key={t.key} className="contents"><Link href={geoPath(t.key)} className="hover:text-ink-900">{t.label}</Link><span aria-hidden>/</span></span>)}
      <span className="font-medium text-ink-700">{last}</span>
    </nav>
  );
}

export { geoTrail };

export function StockSection({ title, vans, radius, expanded, label }: { title: string; vans: InRange<Listing>[]; radius?: number; expanded?: boolean; label: string }) {
  const shown = vans.slice(0, GEO.shownVans);
  return (
    <section>
      <h2 className={H2}>{title}</h2>
      {radius != null && <p className="mt-2 text-[length:var(--text-sm)] text-ink-500">{vans.length} {vans.length === 1 ? "van" : "vans"} within {radius} miles of {label}{expanded ? ` (widened from ${GEO.radiusMiles} miles because fewer than ${GEO.expandBelow} are closer)` : ""}.</p>}
      {shown.length === 0 ? (
        <p className="mt-3 max-w-2xl text-ink-600">There are no vans listed here right now. <Link href="/vans" className="font-semibold text-brand-700 hover:underline">Browse all vans for sale</Link>.</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((v, i) => <ListingCard key={v.item.id} listing={v.item} priority={i < 3} cardIndex={i} />)}
        </div>
      )}
    </section>
  );
}

export function DealersSection({ dealers, label }: { dealers: { item: DirectoryDealer; miles?: number }[]; label: string }) {
  if (dealers.length === 0) return null;
  const towns = new Map<string, string>();
  for (const d of dealers) if (d.item.town) towns.set(townSlug(d.item.town), townLabel(d.item.town));
  return (
    <section>
      <h2 className={H2}>Dealers near {label}</h2>
      <ul className="mt-3 space-y-1.5">
        {dealers.slice(0, 8).map(({ item: d, miles }) => (
          <li key={d.slug}><Link href={`/dealer/${d.slug}`} className="font-semibold text-brand-700 hover:underline">{d.name}</Link>{d.town ? <span className="text-ink-500"> · {townLabel(d.town)}{miles != null ? `, ${Math.round(miles)} miles away` : ""}</span> : null}</li>
        ))}
      </ul>
      {towns.size > 0 && <p className="mt-3 text-[length:var(--text-sm)] text-ink-600">All dealers in: {[...towns].map(([s, l], i) => <span key={s}>{i > 0 && ", "}<Link href={`/dealers/${s}`} className="text-brand-700 hover:underline">{l}</Link></span>)}</p>}
    </section>
  );
}

/** Body-type and model pages for the vans in this area: the types that are actually in stock first, then the usual models. Only models with a live page. */
export function RelatedPages({ vans, liveModels }: { vans: Listing[]; liveModels: ReadonlySet<string> }) {
  const types = BODY_TYPE_PAGES.map((b) => ({ b, n: vans.filter((v) => b.match(v)).length })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 5).map((x) => x.b);
  const models = [["ford", "transit"], ["ford", "transit-custom"], ["volkswagen", "transporter"], ["vauxhall", "vivaro"], ["mercedes-benz", "sprinter"], ["volkswagen", "caddy"]]
    .flatMap(([mk, md]) => { const m = findUsedVanModel(mk, md); return m && liveModels.has(m.pageSlug) ? [m] : []; });
  return (
    <section>
      <h2 className={H2}>Browse by body type and model</h2>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {types.map((b) => <li key={b.slug}><Link href={bodyTypePath(b)} className="text-brand-700 hover:underline">Used {b.label}</Link></li>)}
        {models.map((m) => <li key={m.pageSlug}><Link href={usedVanPath(m)} className="text-brand-700 hover:underline">Used {m.make} {m.model}</Link></li>)}
        <li><Link href="/vans" className="text-brand-700 hover:underline">All vans for sale</Link></li>
      </ul>
    </section>
  );
}

export function LinkList({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className={H2}>{title}</h2>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">{items.map((i) => <li key={i.href}><Link href={i.href} className="text-brand-700 hover:underline">{i.label}</Link></li>)}</ul>
    </section>
  );
}
