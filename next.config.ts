import type { NextConfig } from "next";
import { NEW_VANS_REDIRECTS } from "./lib/redirects/new-vans";
import { USED_VAN_MODELS, usedVanOldPath, usedVanPath } from "./lib/used-vans/models";
import { BODY_TYPE_PAGES, bodyTypeOldPath, bodyTypePath } from "./lib/used-vans/body-types";

const nextConfig: NextConfig = {
  // /new-vans was retired: every guide has a 301 to its nearest stock page, the index goes to /van-news (statusCode, not permanent, so it is a 301 and not Next's 308).
  async redirects() {
    // /used-vans/{make}/{model} -> /used-vans/{make}/{model}-for-sale and /used-vans/body-type/{slug} -> .../{slug}-for-sale (the money pages carry the keyword in the URL).
    const forSale = [
      ...USED_VAN_MODELS.map((m) => ({ source: usedVanOldPath(m), destination: usedVanPath(m), statusCode: 301 as const })),
      ...BODY_TYPE_PAGES.map((b) => ({ source: bodyTypeOldPath(b), destination: bodyTypePath(b), statusCode: 301 as const })),
    ];
    // /vans/{make} -> /vans/{make}-vans-for-sale. The category pages (/vans/luton ...) are real pages of their own and are excluded, as is anything already carrying the suffix.
    const categories = "chassis-cab|crew-van|dropside|electric|luton|minibus|new|panel-van|pickup|tipper|ulez|used";
    const makePages = [{ source: `/vans/:make((?!(?:${categories})$)(?!.*-vans-for-sale$)[a-z0-9-]+)`, destination: "/vans/:make-vans-for-sale", statusCode: 301 as const }];
    // Dead WordPress URLs from the old site: nothing here is worth keeping, so each family goes to the nearest live page.
    const wordpress = [
      { source: "/product-category/:path*", destination: "/vans" },
      { source: "/product/:path*", destination: "/vans" },
      { source: "/shop/:path*", destination: "/vans" },
      { source: "/wp-content/:path*", destination: "/" },
      { source: "/wp-admin/:path*", destination: "/" },
      { source: "/tag/:path*", destination: "/blog" },
      { source: "/author/:path*", destination: "/blog" },
    ].map((r) => ({ ...r, statusCode: 301 as const }));
    return [...NEW_VANS_REDIRECTS.map((r) => ({ ...r })), ...forSale, ...makePages, ...wordpress];
  },
  // The share-image routes read fonts and make logos from disk at request time; make sure they ship with the functions.
  outputFileTracingIncludes: {
    "/**/opengraph-image*": ["./assets/og/**", "./public/logos/**"],
    "/api/og/[slug]": ["./assets/og/**"],
  },
};

export default nextConfig;
