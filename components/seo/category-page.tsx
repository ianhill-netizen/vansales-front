import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui";
import { EmptyState } from "@/components/empty/empty-state";
import { BodyTypeIcon } from "@/components/icons/body-types";
import { ListingCard } from "@/components/listing-card";
import { JsonLd } from "@/components/json-ld";
import { RelatedLinks } from "@/components/related-links";
import { InternalLinks } from "@/components/seo/internal-links";
import { getListings } from "@/lib/listings/client";
import { getBlogIndex } from "@/lib/content/blog";
import { matchBlogPosts } from "@/lib/content/cross-links";
import { absUrl, DEFAULT_OG_IMAGES, DEFAULT_TWITTER_IMAGES } from "@/lib/site";
import { getCategory } from "@/lib/seo/categories";
import { categoryListings, loadCatalogue, popularModelsFor, statOf } from "@/lib/seo/catalogue";
import { categoryIntro, priceRange } from "@/lib/seo/intro";
import { categoryLinks, makeLinks, popularModelLinks } from "@/lib/seo/links";
import { slugify } from "@/lib/listings/slug";
import { SITE } from "@/lib/site";
import type { Metadata } from "next";

/** Metadata for a category page: unique title and description (with stock count and price range), canonical, OG. */
export async function categoryMetadata(slug: string): Promise<Metadata> {
  const c = getCategory(slug);
  const idx = await loadCatalogue();
  const stat = statOf(categoryListings(idx, c));
  const title = `${c.label.replace(/\b[a-z]/g, (m) => m.toUpperCase())} for Sale UK | ${SITE.name}`;
  const pr = priceRange(stat);
  const description = stat.count > 0
    ? `${c.label} for sale across the UK: ${stat.count.toLocaleString("en-GB")} in stock${pr ? `, priced ${pr}` : ""}. Compare makes, mileage and prices from dealers and private sellers on ${SITE.name}.`
    : c.description;
  const url = absUrl(`/vans/${slug}`);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: { images: DEFAULT_OG_IMAGES, title, description, url, type: "website" },
    twitter: { card: "summary_large_image", title, description, images: DEFAULT_TWITTER_IMAGES },
  };
}

function browseHref(c: ReturnType<typeof getCategory>, extra = ""): string {
  const p = new URLSearchParams();
  if (c.filter.bodyStyle) p.set("bodyStyle", slugify(c.filter.bodyStyle));
  if (c.filter.fuel) p.set("fuel", c.filter.fuel);
  if (c.filter.ulez) p.set("ulez", "1");
  return `/vans?${p.toString()}${extra}`;
}

export async function CategoryPage({ slug }: { slug: string }) {
  const c = getCategory(slug);
  const [result, idx] = await Promise.all([getListings({ ...c.filter, pageSize: 24 }), loadCatalogue()]);
  const stat = statOf(categoryListings(idx, c));
  const popular = popularModelsFor(idx, c, 10);
  const intro = categoryIntro(c.label, stat, popular.filter((m) => m.count > 0).map((m) => m.label));
  const relatedBlog = matchBlogPosts(getBlogIndex(), c.blogKeywords, undefined, 3);

  const breadcrumbs = [
    { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
    { "@type": "ListItem", position: 2, name: c.label, item: absUrl(`/vans/${slug}`) },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${c.label} for Sale`,
          url: absUrl(`/vans/${slug}`),
          description: c.description,
          breadcrumb: { "@type": "BreadcrumbList", itemListElement: breadcrumbs },
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: result.total,
            itemListElement: result.listings.map((l, i) => ({ "@type": "ListItem", position: i + 1, url: absUrl(`/listing/${l.slug}`), name: `${l.make} ${l.model}` })),
          },
        }}
      />

      <section className="border-b border-border bg-surface-1">
        <Container className="py-10">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-900">Home</Link>
            <span aria-hidden>/</span>
            <span className="font-medium text-ink-700">{c.label}</span>
          </nav>
          <Eyebrow>{c.eyebrow}</Eyebrow>
          <div className="mt-2 flex items-center gap-4">
            {c.kind === "body" && <BodyTypeIcon slug={c.slug} className="h-16 w-24 shrink-0 text-brand-300" />}
            <h1 className="font-display text-[var(--text-3xl)] font-extrabold leading-tight text-ink-900">{c.label} for sale</h1>
          </div>
          <p className="mt-3 max-w-2xl text-[var(--text-md)] leading-relaxed text-ink-600">{c.intro}</p>
          {intro && <p className="mt-3 max-w-2xl text-[var(--text-md)] leading-relaxed text-ink-600">{intro}</p>}
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={browseHref(c)} className="rounded-[var(--radius-pill)] bg-ink-900 px-5 py-2 text-[var(--text-sm)] font-semibold text-white hover:bg-ink-700">
              Browse {result.total > 0 ? `all ${result.total}` : ""} {c.label.toLowerCase()} →
            </Link>
            <Link href={browseHref(c, "&condition=new")} className="rounded-[var(--radius-pill)] border border-border bg-white px-5 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400">
              New {c.label.toLowerCase()}
            </Link>
            <Link href={browseHref(c, "&condition=used")} className="rounded-[var(--radius-pill)] border border-border bg-white px-5 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400">
              Used {c.label.toLowerCase()}
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-10">
        {result.listings.length > 0 ? (
          <>
            <h2 className="mb-4 font-display text-[var(--text-xl)] font-bold text-ink-900">Latest {c.label.toLowerCase()}</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {result.listings.map((l, i) => <ListingCard key={l.id} listing={l} priority={i < 3} cardIndex={i} />)}
            </div>
            <div className="mt-8 text-center">
              <Link href={browseHref(c)} className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-ink-900 px-6 py-3 text-[var(--text-sm)] font-semibold text-white hover:bg-ink-700">
                View all {result.total} {c.label.toLowerCase()} →
              </Link>
            </div>
          </>
        ) : (
          <EmptyState
            illustration="no-vans"
            title={`No ${c.label.toLowerCase()} in stock right now`}
            body="Stock updates through the day. Browse every van in the meantime, or try the models below."
            action={{ label: "Browse all vans", href: "/vans" }}
          />
        )}
      </Container>

      {/* ── Internal link network ───────────────────────────────────────── */}
      <section className="border-t border-border bg-surface-1 py-10">
        <Container className="space-y-9">
          <InternalLinks
            title={`Popular ${c.label.toLowerCase()} models`}
            links={popularModelLinks(popular.map((m) => ({ makeSlug: m.makeSlug, modelSlug: m.modelSlug, makeName: m.label.split(" ")[0], name: m.label.split(" ").slice(1).join(" ") })))}
            columns={3}
          />
          <InternalLinks title="Other body types" links={categoryLinks(slug)} columns={3} />
          <InternalLinks title="Browse by make" links={makeLinks()} columns={4} />
          {relatedBlog.length > 0 && (
            <div className="rounded-[var(--radius-xl)] border border-border bg-white p-5">
              <RelatedLinks title="Related guides" links={relatedBlog.map((p) => ({ href: `/blog/${p.slug}`, label: p.title }))} />
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
