import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { RelatedLinks } from "@/components/related-links";
import { getBlogPost, getBlogIndex, getBlogSlugs, formatDate } from "@/lib/content/blog";
import { getNewVanIndex } from "@/lib/content/new-vans";
import { blogKeywords, matchBlogPosts, matchRelatedVans } from "@/lib/content/cross-links";
import { mdToHtml } from "@/lib/content/markdown";
import { SITE, absUrl } from "@/lib/site";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: post.title.slice(0, 60),
    description: post.description.slice(0, 155),
    alternates: { canonical: absUrl(`/blog/${slug}`) },
    openGraph: {
      title: `${post.title.slice(0, 60)} · ${SITE.name}`,
      description: post.description.slice(0, 155),
      url: absUrl(`/blog/${slug}`),
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  // Cross-link data
  const allBlog = getBlogIndex();
  const allVans = getNewVanIndex();
  const kws = blogKeywords(post.title, post.description);

  // Related blog posts sharing keywords
  const relatedPosts = matchBlogPosts(allBlog, kws.length ? kws : [post.title.split(" ")[0]], slug, 3);

  // New-van model pages relevant to this post
  const relatedModels = kws.length
    ? matchRelatedVans(allVans, kws, "", 3)
    : [];

  // Category pages inferred from keywords
  const categoryMap: Record<string, { href: string; label: string }> = {
    ford: { href: "/vans/ford", label: "Ford vans" },
    volkswagen: { href: "/vans/volkswagen", label: "Volkswagen vans" },
    vw: { href: "/vans/volkswagen", label: "Volkswagen vans" },
    mercedes: { href: "/vans/mercedes-benz", label: "Mercedes-Benz vans" },
    vauxhall: { href: "/vans/vauxhall", label: "Vauxhall vans" },
    renault: { href: "/vans/renault", label: "Renault vans" },
    citro: { href: "/vans/citroen", label: "Citroën vans" },
    peugeot: { href: "/vans/peugeot", label: "Peugeot vans" },
    fiat: { href: "/vans/fiat", label: "Fiat vans" },
    nissan: { href: "/vans/nissan", label: "Nissan vans" },
    toyota: { href: "/vans/toyota", label: "Toyota vans" },
    iveco: { href: "/vans/iveco", label: "Iveco vans" },
    tipper: { href: "/vans/tipper", label: "Tipper vans" },
    luton: { href: "/vans/luton", label: "Luton vans" },
    crew: { href: "/vans/crew-van", label: "Crew vans" },
    minibus: { href: "/vans/minibus", label: "Minibuses" },
    chassis: { href: "/vans/chassis-cab", label: "Chassis cabs" },
    dropside: { href: "/vans/dropside", label: "Dropside vans" },
    ranger: { href: "/vans/pickup", label: "Pickup trucks" },
    hilux: { href: "/vans/pickup", label: "Pickup trucks" },
    amarok: { href: "/vans/pickup", label: "Pickup trucks" },
    electric: { href: "/vans/electric", label: "Electric vans" },
    ev: { href: "/vans/electric", label: "Electric vans" },
  };

  const seenHrefs = new Set<string>();
  const relatedCategories = kws
    .map((k) => categoryMap[k])
    .filter((c): c is { href: string; label: string } => {
      if (!c || seenHrefs.has(c.href)) return false;
      seenHrefs.add(c.href);
      return true;
    })
    .slice(0, 4);

  const breadcrumbs = [
    { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
    { "@type": "ListItem", position: 2, name: "Blog", item: absUrl("/blog") },
    { "@type": "ListItem", position: 3, name: post.title, item: absUrl(`/blog/${slug}`) },
  ];

  return (
    <>
      <JsonLd data={[
        {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          datePublished: post.date,
          author: { "@type": "Organization", name: SITE.name, url: absUrl("/") },
          publisher: { "@type": "Organization", name: SITE.name, url: absUrl("/"), logo: { "@type": "ImageObject", url: absUrl("/icons/icon-192.png") } },
          url: absUrl(`/blog/${slug}`),
          description: post.description,
        },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: breadcrumbs },
      ]} />

      <div className="border-b border-border bg-surface-1">
        <Container className="py-10">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-900">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-ink-900">Blog</Link>
            <span>/</span>
            <span className="max-w-[200px] truncate font-medium text-ink-700">{post.title}</span>
          </nav>
          <div className="max-w-3xl">
            {post.date && (
              <time dateTime={post.date} className="text-[var(--text-sm)] text-ink-400">
                {formatDate(post.date)}
              </time>
            )}
            <h1 className="mt-2 font-display text-[var(--text-3xl)] font-extrabold leading-tight text-ink-900">
              {post.title}
            </h1>
            {post.description && (
              <p className="mt-3 text-[var(--text-md)] text-ink-600">{post.description}</p>
            )}
          </div>
        </Container>
      </div>

      <Container className="py-10">
        <div className="mx-auto max-w-3xl">
          <article dangerouslySetInnerHTML={{ __html: mdToHtml(post.body) }} />

          {/* Related cross-links */}
          {(relatedPosts.length > 0 || relatedModels.length > 0 || relatedCategories.length > 0) && (
            <div className="mt-12 border-t border-border pt-8">
              <div className="grid gap-6 md:grid-cols-2">
                {(relatedModels.length > 0 || relatedCategories.length > 0) && (
                  <div className="space-y-5">
                    {relatedModels.length > 0 && (
                      <div className="rounded-[var(--radius-xl)] border border-border bg-white p-5">
                        <RelatedLinks
                          title="New van guides"
                          links={relatedModels.map((e) => ({ href: `/new-vans/${e.slug}`, label: e.title }))}
                        />
                      </div>
                    )}
                    {relatedCategories.length > 0 && (
                      <div className="rounded-[var(--radius-xl)] border border-border bg-white p-5">
                        <RelatedLinks
                          title="Browse van stock"
                          links={relatedCategories}
                          variant="pills"
                        />
                      </div>
                    )}
                  </div>
                )}
                {relatedPosts.length > 0 && (
                  <div className="rounded-[var(--radius-xl)] border border-border bg-white p-5">
                    <RelatedLinks
                      title="Related articles"
                      links={relatedPosts.map((p) => ({ href: `/blog/${p.slug}`, label: p.title }))}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-10 border-t border-border pt-8">
            <Link href="/blog" className="text-[var(--text-sm)] font-semibold text-brand-700 hover:underline">
              ← Back to all guides
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}
