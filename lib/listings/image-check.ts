import type { Listing, ListingImage } from "./types";
import { isPlaceholderImageUrl } from "./photo.ts";

/**
 * Is this image really an image of the van? Pure module (no Next imports) so node:test can run it; the one-hour cache around it lives in lib/listings/client.ts.
 * A photo must answer 200, with an image/* content type, and be at least MIN_BYTES: the grey WooCommerce "no photo" frame is a valid 200 image/jpeg of ~12 KB, so status alone would pass it.
 * A check that itself errors or times out says "unknown" (never "bad"): the card is kept, so a slow CDN can never empty the site.
 */
export const MIN_IMAGE_BYTES = 15 * 1024;
export const CHECK_TIMEOUT_MS = 2000;
export const CHECK_CONCURRENCY = 8;
/** Whole pass budget: once spent, remaining listings are kept unchecked (fail open). */
export const PASS_BUDGET_MS = 6000;
/** How many leading images are tried before a listing is given up on. */
export const MAX_TRIES = 3;

export type ImageVerdict = { ok: true } | { ok: false; reason: string } | { ok: "unknown"; reason: string };

type FetchLike = (url: string, init: { method: string; signal: AbortSignal; headers?: Record<string, string>; redirect?: "follow" }) => Promise<{ status: number; headers: { get(n: string): string | null }; arrayBuffer(): Promise<ArrayBuffer> }>;

export async function checkImage(url: string, fetchImpl: FetchLike = fetch as unknown as FetchLike, timeoutMs = CHECK_TIMEOUT_MS): Promise<ImageVerdict> {
  if (!/^https?:\/\//i.test(url)) return { ok: false, reason: "not an http url" };
  if (isPlaceholderImageUrl(url)) return { ok: false, reason: "placeholder url" };
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    let res = await fetchImpl(url, { method: "HEAD", signal: ctl.signal, redirect: "follow" });
    // Some CDNs refuse HEAD: ask for the body instead (its length is then measured).
    if (res.status === 405 || res.status === 501) res = await fetchImpl(url, { method: "GET", signal: ctl.signal, redirect: "follow" });
    if (res.status !== 200) return { ok: false, reason: `status ${res.status}` };
    const type = (res.headers.get("content-type") ?? "").toLowerCase();
    if (!type.startsWith("image/")) return { ok: false, reason: `content-type ${type || "missing"}` };
    let bytes = Number(res.headers.get("content-length"));
    if (!Number.isFinite(bytes) || bytes <= 0) bytes = (await (await fetchImpl(url, { method: "GET", signal: ctl.signal, redirect: "follow" })).arrayBuffer()).byteLength;
    if (bytes < MIN_IMAGE_BYTES) return { ok: false, reason: `only ${bytes} bytes (placeholder-sized)` };
    return { ok: true };
  } catch (e) {
    return { ok: "unknown", reason: (e as Error)?.name === "AbortError" ? `timed out after ${timeoutMs}ms` : `check failed: ${(e as Error)?.message ?? e}` };
  } finally {
    clearTimeout(timer);
  }
}

/** A checker answers per URL. true = fine or unknown (kept), false = definitely not a usable photo. */
export type UrlChecker = (url: string) => Promise<boolean>;

/** Run `fn` over `items` with at most `limit` in flight. */
export async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T, i: number) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

/**
 * Make every listing's lead image a valid one, once, for the whole catalogue. Per listing: try its first MAX_TRIES images in order; the first that passes leads, the ones that failed are dropped,
 * the untried rest follow. If every tried image failed, `images` is emptied so hasCardPhoto() is false and the card is dropped from every grid, facet, count and the sitemap (the listing's own page
 * is a separate fetch and still renders). A listing whose lead passes is returned untouched (same object). Fail open: past the pass budget, or when a check is "unknown", nothing is dropped.
 */
export async function validateLeadImages(listings: Listing[], check: UrlChecker, opts: { now?: () => number; budgetMs?: number; concurrency?: number } = {}): Promise<Listing[]> {
  const now = opts.now ?? Date.now;
  const deadline = now() + (opts.budgetMs ?? PASS_BUDGET_MS);
  return mapLimit(listings, opts.concurrency ?? CHECK_CONCURRENCY, async (l) => {
    const imgs: ListingImage[] = l.images ?? [];
    const real = imgs.filter((i) => !isPlaceholderImageUrl(i.url));
    if (real.length === 0) return imgs.length === 0 ? l : { ...l, images: [] };
    const failed = new Set<ListingImage>();
    let lead: ListingImage | null = null;
    let tried = 0;
    for (const img of real) {
      if (!img.url.startsWith("http")) { failed.add(img); continue; }
      if (tried >= MAX_TRIES) break;
      tried++;
      if (now() > deadline || (await check(img.url))) { lead = img; break; }
      failed.add(img);
    }
    if (!lead) return { ...l, images: [] };
    const rest = real.filter((i) => i !== lead && !failed.has(i));
    const next = [lead, ...rest];
    const unchanged = next.length === imgs.length && next.every((i, n) => i === imgs[n]);
    return unchanged ? l : { ...l, images: next };
  });
}

/** Adapts checkImage to a UrlChecker: only a definite "bad" is false. */
export function verdictChecker(run: (url: string) => Promise<ImageVerdict>): UrlChecker {
  return async (url) => (await run(url)).ok !== false;
}
