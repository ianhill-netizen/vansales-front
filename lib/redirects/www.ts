/**
 * https://www.vansales.com answers 200 with a canonical pointing at the apex, so Google can crawl every page twice. One permanent redirect from the www host to the apex, path and query kept,
 * folds the two hosts into one. The `has` host condition means it never applies to the apex, preview deployments or localhost. (Vercel's own domain setting can do the same; this works without it.)
 */
export const WWW_HOST = "www.vansales.com";
export const APEX_ORIGIN = "https://vansales.com";

export const WWW_TO_APEX_REDIRECT = {
  source: "/:path*",
  has: [{ type: "host" as const, value: WWW_HOST }],
  destination: `${APEX_ORIGIN}/:path*`,
  statusCode: 301 as const,
};
