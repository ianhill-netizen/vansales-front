import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { getVanNewsArticles, getVanNewsMakes } from "@/lib/content/van-news";
import { formatDate } from "@/lib/content/blog";
import { SITE, absUrl, DEFAULT_OG_IMAGES } from "@/lib/site";

export const revalidate = 300;

const TITLE = "Van News: New Models, Specs and Pricing";
const DESCRIPTION = "New van launches, spec updates and market news for UK buyers: what is coming, what it costs and whether it is worth waiting for.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absUrl("/van-news") },
  openGraph: { images: DEFAULT_OG_IMAGES, title: `${TITLE} · ${SITE.name}`, description: DESCRIPTION, url: absUrl("/van-news"), type: "website" },
};

// /van-news: the latest 20 articles, optionally one make (?make=BYD). The filter is a plain link (no client JS), the filtered view is noindex so only /van-news itself is in search.
export default async function VanNewsIndex({ searchParams }: { searchParams: Promise<{ make?: string }> }) {
  const { make: rawMake } = await searchParams;
  const makes = await getVanNewsMakes();
  const make = makes.find((m) => m === rawMake);
  const posts = (await getVanNewsArticles(make)).slice(0, 20);
  const chip = (active: boolean) => `rounded-full border px-3 py-1 text-[length:var(--text-sm)] font-medium transition-colors ${active ? "border-brand-700 bg-brand-700 text-white" : "border-border bg-white text-ink-700 hover:border-brand-700 hover:text-brand-700"}`;
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "CollectionPage", name: `${TITLE} · ${SITE.name}`, url: absUrl("/van-news"), breadcrumb: { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") }, { "@type": "ListItem", position: 2, name: "Van news", item: absUrl("/van-news") }] } }} />
      {make && <meta name="robots" content="noindex,follow" />}
      <section className="border-b border-border bg-surface-1">
        <Container className="py-10">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[length:var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-900">Home</Link><span>/</span><span className="font-medium text-ink-700">Van news</span>
          </nav>
          <Eyebrow>Van news</Eyebrow>
          <h1 className="mt-2 font-display text-[length:var(--text-3xl)] font-extrabold leading-tight text-ink-900">Van news</h1>
          <p className="mt-3 max-w-2xl text-[length:var(--text-md)] text-ink-600">{DESCRIPTION}</p>
          {makes.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Filter by make">
              <li><Link href="/van-news" className={chip(!make)}>All</Link></li>
              {makes.map((m) => <li key={m}><Link href={`/van-news?make=${encodeURIComponent(m)}`} className={chip(m === make)}>{m}</Link></li>)}
            </ul>
          )}
        </Container>
      </section>
      <Container className="py-10">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.slug} href={`/van-news/${post.slug}`} className="group flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-border bg-white shadow-[var(--shadow-sm)] transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
              <div className="h-2 bg-gradient-to-r from-brand-500 to-brand-300" />
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2 text-[length:var(--text-xs)] text-ink-400">
                  {post.make && <span className="rounded-full bg-brand-tint px-2 py-0.5 font-semibold text-brand-700">{post.make}</span>}
                  {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>}
                </div>
                <h2 className="mt-1.5 font-display text-[length:var(--text-base)] font-bold leading-snug text-ink-900 group-hover:text-brand-700">{post.title}</h2>
                {post.description && <p className="mt-2 line-clamp-3 flex-1 text-[length:var(--text-sm)] leading-relaxed text-ink-500">{post.description}</p>}
                <span className="mt-4 text-[length:var(--text-xs)] font-semibold text-brand-700 group-hover:underline">Read the news →</span>
              </div>
            </Link>
          ))}
        </div>
        {posts.length === 0 && <p className="py-16 text-center text-[length:var(--text-sm)] text-ink-400">No van news yet. In the meantime, read our <Link href="/blog" className="font-semibold text-brand-700 hover:underline">guides</Link>.</p>}
      </Container>
    </>
  );
}
