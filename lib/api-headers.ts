/**
 * Headers for server-side reads of the vansales-backend public API. While `next build` prerenders (hundreds of pages from one Vercel IP) the request also carries Vercel's x-vercel-deployment-url,
 * which the backend counts in its own 600/min bucket instead of the normal 120/min per IP. At runtime (ISR, requests) nothing extra is sent.
 */
export function apiHeaders(): Record<string, string> {
  const h: Record<string, string> = { Accept: "application/json" };
  const host = process.env.VERCEL_URL;
  if (process.env.NEXT_PHASE === "phase-production-build" && host && /^[a-z0-9-]+\.vercel\.app$/i.test(host)) h["x-vercel-deployment-url"] = host;
  return h;
}
