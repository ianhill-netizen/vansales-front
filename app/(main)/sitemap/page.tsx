import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui";
import { getAllGuides } from "@/lib/content/all-guides";
import { getVanNewsArticles } from "@/lib/content/van-news";
import { getLiveModelPageSlugs } from "@/lib/content/model-pages";
import { getLiveBodyTypeSlugs } from "@/lib/content/body-type-pages";
import { getLiveMakeHubSlugs } from "@/lib/content/make-hubs";
import { getLiveLandingSlugs } from "@/lib/content/landing-pages";
import { getDealerDirectory } from "@/lib/dealers/directory";
import { CATEGORIES } from "@/lib/seo/categories";
import { loadCatalogue, makeStat } from "@/lib/seo/catalogue";
import { makeVansPath } from "@/lib/seo/make-url";
import { BODY_TYPE_PAGES, bodyTypePath } from "@/lib/used-vans/body-types";
import { USED_VAN_MODELS, usedVanMakes, usedVanName, usedVanPath } from "@/lib/used-vans/models";
import { LANDING_PAGES } from "@/lib/landing-pages";
import { SITE, absUrl } from "@/lib/site";

// The human sitemap: one crawlable page that links every content page on the site, so no page depends on a single index or a single related-links block to be found. Rebuilt every 5 minutes.
export const revalidate = 300;

const TITLE = "Site map";
const DESCRIPTION = `Every page on ${SITE.name} in one place: vans for sale by type, make and model, used van buying guides, van news, dealers, finance and selling.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absUrl("/sitemap") },
};

const MAIN: { href: string; label: string }[] = [
  { href: "/vans", label: "Vans for sale" },
  { href: "/used-vans", label: "Used vans by make and model" },
  { href: "/electric-vans", label: "Electric vans" },
  { href: "/dealers", label: "Van dealers" },
  { href: "/directory", label: "All makes A to Z" },
  { href: "/van-finance", label: "Van finance" },
  { href: "/van-insurance", label: "Van insurance" },
  { href: "/van-reviews", label: "Van reviews" },
  { href: "/sell", label: "Advertise your van" },
  { href: "/sell-my-van", label: "Sell my van" },
  { href: "/advertise", label: "Advertise with us" },
  { href: "/blog", label: "Van guides" },
  { href: "/van-news", label: "Van news" },
];

const BRANDS = [
  { href: "/byd-vans-uk", label: "BYD vans" },
  { href: "/maxus-vans-uk", label: "Maxus vans" },
  { href: "/leapmotor-vans-uk", label: "Leapmotor vans" },
  { href: "/changan-vans-uk", label: "Changan vans" },
];

function Group({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  if (links.length === 0) return null;
  return (
    <section>
      <h2 className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">{title}</h2>
      <ul className="mt-3 grid gap-x-8 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((l) => (
          <li key={l.href}><Link href={l.href} className="text-[length:var(--text-sm)] text-brand-700 hover:underline">{l.label}</Link></li>
        ))}
      </ul>
    </section>
  );
}

export default async function SiteMapPage() {
  // Each source is optional: if one is down the page still renders the rest.
  const [guides, news, liveModels, liveTypes, liveHubs, liveLanding, dealers, idx] = await Promise.all([
    getAllGuides().catch(() => []),
    getVanNewsArticles().catch(() => []),
    getLiveModelPageSlugs().catch(() => new Set<string>()),
    getLiveBodyTypeSlugs().catch(() => new Set<string>()),
    getLiveMakeHubSlugs().catch(() => new Set<string>()),
    getLiveLandingSlugs().catch(() => new Set<string>()),
    getDealerDirectory().catch(() => []),
    loadCatalogue().catch(() => null),
  ]);

  const stockMakes = idx ? [...idx.byMake.keys()].filter((s) => makeStat(idx, s).count > 0).sort() : [];
  const usedMakes = usedVanMakes().filter((m) => m.models.some((x) => liveModels.has(x.pageSlug)) || liveHubs.has(m.makeSlug));
  const hubOnly = [...liveHubs].filter((s) => !usedMakes.some((m) => m.makeSlug === s)).sort();
  const cap = (s: string) => s.split("-").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ");

  return (
    <>
      <section className="border-b border-border bg-surface-1">
        <Container className="py-10">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[length:var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-900">Home</Link><span aria-hidden>/</span><span className="font-medium text-ink-700">Site map</span>
          </nav>
          <Eyebrow>Site map</Eyebrow>
          <h1 className="mt-2 font-display text-[length:var(--text-3xl)] font-extrabold leading-tight text-ink-900">Site map</h1>
          <p className="mt-3 max-w-2xl text-[length:var(--text-md)] text-ink-600">{DESCRIPTION}</p>
        </Container>
      </section>
      <Container className="space-y-10 py-10">
        <Group title="Main pages" links={MAIN} />
        <Group title="Vans for sale by type" links={CATEGORIES.map((c) => ({ href: `/vans/${c.slug}`, label: c.label }))} />
        <Group title="Vans for sale by make" links={stockMakes.map((s) => ({ href: makeVansPath(s), label: `${cap(s)} vans for sale` }))} />
        <Group title="Used vans by make" links={[...usedMakes.map((m) => ({ href: `/used-vans/${m.makeSlug}`, label: `Used ${m.make} vans` })), ...hubOnly.map((s) => ({ href: `/used-vans/${s}`, label: `Used ${cap(s)} vans` }))]} />
        <Group title="Used van buying guides by model" links={USED_VAN_MODELS.filter((m) => liveModels.has(m.pageSlug)).map((m) => ({ href: usedVanPath(m), label: `Used ${usedVanName(m)} for sale` }))} />
        <Group title="Used vans by body type" links={BODY_TYPE_PAGES.filter((b) => liveTypes.has(b.slug)).map((b) => ({ href: bodyTypePath(b), label: `Used ${b.label}` }))} />
        <Group title="Vans by region and brand" links={[...LANDING_PAGES.filter((p) => liveLanding.has(p.backendSlug)).map((p) => ({ href: p.path, label: p.h1 })), ...BRANDS]} />
        <Group title="Van dealers" links={dealers.map((d) => ({ href: `/dealer/${d.slug}`, label: d.name }))} />
        <Group title="Van news" links={news.map((a) => ({ href: `/van-news/${a.slug}`, label: a.title }))} />
        <Group title="Van guides" links={guides.map((g) => ({ href: `/blog/${g.slug}`, label: g.title }))} />
      </Container>
    </>
  );
}
