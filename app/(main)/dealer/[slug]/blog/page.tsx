import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Eyebrow } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { getBlogIndex, formatDate } from "@/lib/content/blog";
import { DEALERS } from "@/lib/dealers/config";
import { absUrl } from "@/lib/site";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dealer = DEALERS[slug];
  const name = dealer?.name ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: `${name} — Van Guides & News`,
    description: `Van guides, stock news and tips from ${name}.`,
    alternates: { canonical: absUrl(`/dealer/${slug}/blog`) },
    robots: { index: !!dealer },
  };
}

export default async function DealerBlogIndexPage({ params }: Props) {
  const { slug } = await params;
  // Use platform blog posts seeded as dealer content
  const posts = getBlogIndex().slice(0, 12);

  const dealer = DEALERS[slug];
  const dealerName = dealer?.name ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Blog",
        name: `${dealerName} — Van Guides`,
        url: absUrl(`/dealer/${slug}/blog`),
      }} />

      <section className="border-b border-border bg-surface-1">
        <Container className="py-8">
          <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-[var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-900">Home</Link>
            <span>/</span>
            <Link href={`/dealer/${slug}`} className="hover:text-ink-900">{dealerName}</Link>
            <span>/</span>
            <span className="font-medium text-ink-700">Blog</span>
          </nav>
          <Eyebrow>{dealerName}</Eyebrow>
          <h1 className="mt-1.5 font-display text-[var(--text-2xl)] font-extrabold text-ink-900">Van guides &amp; news</h1>
          <p className="mt-2 text-[var(--text-sm)] text-ink-600">Tips, buying guides and stock news from {dealerName}.</p>
        </Container>
      </section>

      <Container className="py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/dealer/${slug}/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-border bg-white shadow-[var(--shadow-sm)] transition-[box-shadow] hover:shadow-[var(--shadow-md)]"
            >
              <div className="h-1.5 bg-gradient-to-r from-brand-500 to-brand-300" />
              <div className="flex flex-1 flex-col p-4">
                {post.date && (
                  <time dateTime={post.date} className="text-[var(--text-2xs)] text-ink-400">{formatDate(post.date)}</time>
                )}
                <h2 className="mt-1 font-display text-[var(--text-sm)] font-bold leading-snug text-ink-900 group-hover:text-brand-700">
                  {post.title}
                </h2>
                {post.description && (
                  <p className="mt-1.5 line-clamp-2 flex-1 text-[var(--text-xs)] text-ink-500">{post.description}</p>
                )}
                <span className="mt-3 text-[var(--text-2xs)] font-semibold text-brand-700">Read →</span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </>
  );
}
