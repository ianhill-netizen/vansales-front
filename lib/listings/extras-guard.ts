/**
 * Degraded-feed guard for the live stock. The catalogue is the vansales-backend feeds (private sellers + dealer adverts). When one of them is slow, rate-limited (the public API throttles per IP) or down,
 * the fetch used to come back EMPTY and look like "no stock": that empty answer was cached for a minute and baked into ISR pages, so a make with stock flipped to noindex and dropped out of the sitemap.
 * Pure functions, no I/O, no Next imports: the loader (client.ts) uses them and lib/listings/extras-guard.test.ts pins them.
 */
export interface Extras<T> {
  listings: T[];
  /** true when a feed failed this time, so `listings` is partial, stale or empty and must not be read as "no stock". */
  degraded: boolean;
}

/** What to serve after a fresh load: a good load always wins; a failed one falls back to the last good catalogue when there is one (stale-on-error), else the partial data it did get. */
export function chooseExtras<T>(fresh: Extras<T>, lastGood: T[] | null): Extras<T> {
  if (!fresh.degraded) return fresh;
  return { listings: lastGood ?? fresh.listings, degraded: true };
}

/** A make or model page is kept out of the index only for a REAL zero. A zero read while the feed is degraded proves nothing, so the page stays indexable until the next good load. */
export function shouldNoindexEmpty(count: number, degraded: boolean): boolean {
  return count === 0 && !degraded;
}

/** After a failed load, don't hit a struggling (or rate-limiting) API again for this long: serve the stale answer instead of retrying on every request. */
export const RETRY_AFTER_FAILURE_MS = 15_000;
export const shouldSkipRetry = (failedAt: number, now: number): boolean => failedAt > 0 && now - failedAt < RETRY_AFTER_FAILURE_MS;
