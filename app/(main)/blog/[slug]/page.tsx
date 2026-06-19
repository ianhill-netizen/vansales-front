import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { getBlogPost, getBlogSlugs, formatDate } from "@/lib/content/blog";
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
  const title = post.title.slice(0, 60);
  const description = post.description.slice(0, 155);
  return {
    title,
    description,
    alternates: { canonical: absUrl(`/blog/${slug}`) },
    openGraph: {
      title: `${title} · ${SITE.name}`,
      description,
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
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: breadcrumbs,
        },
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

          <div className="mt-12 border-t border-border pt-8">
            <Link href="/blog" className="text-[var(--text-sm)] font-semibold text-brand-700 hover:underline">
              ← Back to all guides
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}
