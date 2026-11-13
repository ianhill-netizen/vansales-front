import { NEW_VANS_REDIRECTS } from "./new-vans.ts";
import { BACKLINK_REDIRECTS } from "./backlinks.ts";
import { RETIRED_TEST_DEALER_REDIRECTS } from "./retired-test-dealer.ts";
import { USED_VAN_MODELS, usedVanOldPath, usedVanPath } from "../used-vans/models.ts";
import { BODY_TYPE_PAGES, bodyTypeOldPath, bodyTypePath } from "../used-vans/body-types.ts";
import { HAND_BUILT_GUIDE_SLUGS, LANDING_PAGES } from "../landing-pages.ts";
import { MOVED_CATEGORY_SLUGS, canonicalDestination, categoryPath } from "../used-vans/paths.ts";

import { readdirSync } from "node:fs";
import { join } from "node:path";

export type RedirectRule = { source: string; destination: string; statusCode: 301 | 308 };

/**
 * The old WordPress site served every post at /{slug}/; here a post is /blog/{slug}. One redirect per post that exists as a content/blog markdown file, skipping any slug that is a real route.
 * Read from disk at build time (next.config); at runtime on a server without the sources it is simply empty. The published-guides list (backend) is not included: those slugs were never on the old site.
 */
export function rootBlogRedirects(cwd: string = process.cwd()): RedirectRule[] {
  try {
    const routes = new Set(readdirSync(join(cwd, "app", "(main)")));
    return readdirSync(join(cwd, "content", "blog")).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3)).filter((slug) => !routes.has(slug))
      .map((slug) => ({ source: `/${slug}`, destination: `/blog/${slug}`, statusCode: 301 as const }));
  } catch {
    return [];
  }
}

/** Every redirect of the site, in match order (next.config.ts returns this from redirects(); redirects.test.ts checks it). */
export function buildRedirects(): RedirectRule[] {
    // /used-vans/{make}/{model} -> /used-vans/{make}/{model}-for-sale and /used-vans/body-type/{slug} -> .../{slug}-for-sale (the money pages carry the keyword in the URL).
    const forSale = [
      ...USED_VAN_MODELS.map((m) => ({ source: usedVanOldPath(m), destination: usedVanPath(m), statusCode: 301 as const })),
      ...BODY_TYPE_PAGES.map((b) => ({ source: bodyTypeOldPath(b), destination: bodyTypePath(b), statusCode: 301 as const })),
    ];
    // /vans/{category} for the eight body types -> its /used-vans body-type page (all eight are published with a guide). The other categories (ulez, used, new) and /vans/electric (-> /electric-vans) are handled elsewhere.
    const categories301 = MOVED_CATEGORY_SLUGS.map((slug) => ({ source: `/vans/${slug}`, destination: categoryPath(slug), statusCode: 301 as const }));
    // The ID. Buzz Cargo model URL now follows the stock slug (id-buzz-cargo); the old content-slug URLs go to it in one hop.
    const idBuzz = [
      { source: "/used-vans/volkswagen/idbuzz-cargo-for-sale", destination: "/used-vans/volkswagen/id-buzz-cargo-for-sale", statusCode: 301 as const },
      { source: "/used-vans/volkswagen/idbuzz-cargo", destination: "/used-vans/volkswagen/id-buzz-cargo-for-sale", statusCode: 301 as const },
    ];
    // /vans/{make} -> /vans/{make}-vans-for-sale. The category pages (/vans/luton ...) are real pages of their own and are excluded, as is anything already carrying the suffix.
    const categories = "chassis-cab|crew-van|dropside|electric|luton|minibus|new|panel-van|pickup|tipper|ulez|used";
    const makePages = [{ source: `/vans/:make((?!(?:${categories})$)(?!.*-vans-for-sale$)[a-z0-9-]+)`, destination: "/vans/:make-vans-for-sale", statusCode: 301 as const }];
    // Dead WordPress URLs from the old site: nothing here is worth keeping, so each family goes to the nearest live page.
    const wordpress = [
      // /product-category/*, /product/* and /van/* are resolved by proxy.ts (lib/redirects/legacy.ts): body type, model or make page where the slug names one, else /vans.
      { source: "/about-us", destination: "/" },
      { source: "/shop/:path*", destination: "/vans" },
      { source: "/wp-content/:path*", destination: "/" },
      { source: "/wp-admin/:path*", destination: "/" },
      { source: "/tag/:path*", destination: "/blog" },
      { source: "/author/:path*", destination: "/blog" },
    ].map((r) => ({ ...r, statusCode: 301 as const }));
    // The landing pages replace two older URLs (/van-contract-hire -> /van-lease-deals, /vans/electric -> /electric-vans), and each one is also a guide row in the backend, so its /blog/{slug} twin goes to the real URL.
    const landing = [
      { source: "/van-contract-hire", destination: "/van-lease-deals" },
      { source: "/vans/electric", destination: "/electric-vans" },
      ...LANDING_PAGES.map((l) => ({ source: `/blog/${l.backendSlug}`, destination: l.path })),
      ...Object.entries(HAND_BUILT_GUIDE_SLUGS).map(([slug, path]) => ({ source: `/blog/${slug}`, destination: path })),
    ].map((r) => ({ ...r, statusCode: 301 as const }));
    // /inspection-guide never existed on this site (a dead link found by the SE Ranking audit of 2026-11-06, 404): it goes to the used-van inspection checklist, the guide it was meant for.
    const retired = [
      { source: "/inspection-guide", destination: "/blog/used-van-inspection-checklist", statusCode: 301 as const },
      // The previous vansales.com's listing URLs, /detail/{number}: 502 of the 503 URLs Google reports as 404 (Agent 19's seo_404_feed, 2026-11-07). The numbers are not stored anywhere now, so there is no make or model
      // to send them to: they go to /used-vans, permanently (308). A removed listing of THIS site is handled by /listing/{slug} (it redirects to its model page).
      { source: "/detail/:id(\\d+)", destination: "/used-vans", statusCode: 308 as const },
      // "Citroën" used to slugify to "citro-n" (accent dropped as a separator): Google has /vans/citro-n/* indexed. Listed before the generic /vans/:make rule, which would otherwise send /vans/citro-n to /vans/citro-n-vans-for-sale.
      { source: "/vans/citro-n/:model", destination: "/vans/citroen/:model", statusCode: 301 as const },
      { source: "/vans/citro-n", destination: "/vans/citroen-vans-for-sale", statusCode: 301 as const },
      { source: "/vans/citro-n-vans-for-sale", destination: "/vans/citroen-vans-for-sale", statusCode: 301 as const },
    ];
    const all = [...landing, ...retired, ...RETIRED_TEST_DEALER_REDIRECTS.map((r) => ({ ...r })), ...BACKLINK_REDIRECTS.map((r) => ({ ...r })), ...NEW_VANS_REDIRECTS.map((r) => ({ ...r })), ...categories301, ...idBuzz, ...forSale, ...makePages, ...wordpress, ...rootBlogRedirects()];
    return all.map((r) => ({ ...r, destination: canonicalDestination(r.destination) }));
}
