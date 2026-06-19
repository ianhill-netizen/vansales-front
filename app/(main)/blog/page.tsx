import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { getBlogIndex, formatDate } from "@/lib/content/blog";
import { SITE, absUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Van Guides & News",
  description: "Van buying guides, news, finance tips, dimensions, reviews and more. Updated guides for UK van buyers and fleet operators.",
  alternates: { canonical: absUrl("/blog") },
  openGraph: {
    title: `Van Guides & News · ${SITE.name}`,
    description: "Van buying guides, news and finance tips for UK businesses.",
    url: absUrl("/blog"),
    type: "website",
  },
};

export default function BlogIndexPage() {
  const posts = getBlogIndex();

  const breadcrumbs = [
    { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
    { "@type": "ListItem", position: 2, name: "Blog", item: absUrl("/blog") },
  ];

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Blog",
        name: `Van Guides & News · ${SITE.name}`,
        url: absUrl("/blog"),
        breadcrumb: { "@type": "BreadcrumbList", itemListElement: breadcrumbs },
      }} />

      <section className="border-b border-border bg-surface-1">
        <Container className="py-10">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-900">Home</Link>
            <span>/</span>
            <span className="font-medium text-ink-700">Blog</span>
          </nav>
          <Eyebrow>Guides &amp; news</Eyebrow>
          <h1 className="mt-2 font-display text-[var(--text-3xl)] font-extrabold leading-tight text-ink-900">
            Van guides &amp; news
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--text-md)] text-ink-600">
            Buying guides, dimensions, finance tips, reviews and industry news for UK van buyers and fleet operators.
          </p>
        </Container>
      </section>

      <Container className="py-10">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-border bg-white shadow-[var(--shadow-sm)] transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
            >
              {/* Coloured header strip */}
              <div className="h-2 bg-gradient-to-r from-brand-500 to-brand-300" />
              <div className="flex flex-1 flex-col p-5">
                {post.date && (
                  <time dateTime={post.date} className="text-[var(--text-xs)] text-ink-400">
                    {formatDate(post.date)}
                  </time>
                )}
                <h2 className="mt-1.5 font-display text-[var(--text-base)] font-bold leading-snug text-ink-900 group-hover:text-brand-700">
                  {post.title}
                </h2>
                {post.description && (
                  <p className="mt-2 line-clamp-3 flex-1 text-[var(--text-sm)] leading-relaxed text-ink-500">
                    {post.description}
                  </p>
                )}
                <span className="mt-4 text-[var(--text-xs)] font-semibold text-brand-700 group-hover:underline">
                  Read guide →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <p className="py-16 text-center text-[var(--text-sm)] text-ink-400">No posts yet.</p>
        )}
      </Container>
    </>
  );
}
