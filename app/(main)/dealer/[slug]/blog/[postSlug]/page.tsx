import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { getBlogPost, formatDate } from "@/lib/content/blog";
import { mdToHtml } from "@/lib/content/markdown";
import { DEALERS } from "@/lib/dealers/config";
import { SITE, absUrl } from "@/lib/site";

interface Props { params: Promise<{ slug: string; postSlug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, postSlug } = await params;
  const post = getBlogPost(postSlug);
  if (!post) return {};
  const dealer = DEALERS[slug];
  const dealerName = dealer?.name ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const title = `${post.title.slice(0, 45)} · ${dealerName}`;
  return {
    title,
    description: post.description.slice(0, 155),
    alternates: { canonical: absUrl(`/dealer/${slug}/blog/${postSlug}`) },
    openGraph: {
      title: `${title} · ${SITE.name}`,
      description: post.description,
      url: absUrl(`/dealer/${slug}/blog/${postSlug}`),
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function DealerBlogPostPage({ params }: Props) {
  const { slug, postSlug } = await params;
  const post = getBlogPost(postSlug);
  if (!post) notFound();

  const dealer = DEALERS[slug];
  const dealerName = dealer?.name ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const breadcrumbs = [
    { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
    { "@type": "ListItem", position: 2, name: dealerName, item: absUrl(`/dealer/${slug}`) },
    { "@type": "ListItem", position: 3, name: "Blog", item: absUrl(`/dealer/${slug}/blog`) },
    { "@type": "ListItem", position: 4, name: post.title, item: absUrl(`/dealer/${slug}/blog/${postSlug}`) },
  ];

  return (
    <>
      <JsonLd data={[
        {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          datePublished: post.date,
          author: { "@type": "Organization", name: dealerName },
          publisher: { "@type": "Organization", name: SITE.name, url: absUrl("/") },
          url: absUrl(`/dealer/${slug}/blog/${postSlug}`),
          description: post.description,
        },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: breadcrumbs },
      ]} />

      <div className="border-b border-border bg-surface-1">
        <Container className="py-10">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 flex-wrap text-[var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-900">Home</Link>
            <span>/</span>
            <Link href={`/dealer/${slug}`} className="hover:text-ink-900">{dealerName}</Link>
            <span>/</span>
            <Link href={`/dealer/${slug}/blog`} className="hover:text-ink-900">Blog</Link>
            <span>/</span>
            <span className="max-w-[140px] truncate font-medium text-ink-700">{post.title}</span>
          </nav>
          <div className="max-w-3xl">
            {post.date && (
              <time dateTime={post.date} className="text-[var(--text-sm)] text-ink-400">{formatDate(post.date)}</time>
            )}
            <h1 className="mt-2 font-display text-[var(--text-3xl)] font-extrabold leading-tight text-ink-900">
              {post.title}
            </h1>
          </div>
        </Container>
      </div>

      <Container className="py-10">
        <div className="mx-auto max-w-3xl">
          <article dangerouslySetInnerHTML={{ __html: mdToHtml(post.body) }} />
          <div className="mt-10 flex gap-4 border-t border-border pt-6 text-[var(--text-sm)]">
            <Link href={`/dealer/${slug}/blog`} className="font-semibold text-brand-700 hover:underline">← Back to {dealerName} blog</Link>
            <span className="text-ink-300">·</span>
            <Link href={`/dealer/${slug}`} className="text-ink-500 hover:text-ink-900">View {dealerName} stock →</Link>
          </div>
        </div>
      </Container>
    </>
  );
}
