const DEALSKI_API = (
  process.env.DEALSKI_API_URL ?? "https://swissvans.dealski.co.uk"
).replace(/\/$/, "");
const MARKETPLACE_KEY = process.env.DEALSKI_MARKETPLACE_KEY ?? "";
const TTL_MS = 10 * 60 * 1000; // 10-minute in-memory cache

let cachedKey: string | null = null;
let cacheExpiry = 0;

export async function getMapsBrowserKey(): Promise<string | null> {
  if (cachedKey && Date.now() < cacheExpiry) return cachedKey;
  if (!MARKETPLACE_KEY) return null;
  try {
    const res = await fetch(`${DEALSKI_API}/api/marketplace/maps-key`, {
      headers: { Authorization: `Bearer ${MARKETPLACE_KEY}` },
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { key?: string };
    if (!data.key) return null;
    cachedKey = data.key;
    cacheExpiry = Date.now() + TTL_MS;
    return cachedKey;
  } catch {
    return null;
  }
}
