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
    return [...NEW_VANS_REDIRECTS.map((r) => ({ ...r })), ...forSale];
  },
  // The share-image routes read fonts and make logos from disk at request time; make sure they ship with the functions.
  outputFileTracingIncludes: {
    "/**/opengraph-image*": ["./assets/og/**", "./public/logos/**"],
    "/api/og/[slug]": ["./assets/og/**"],
  },
};

export default nextConfig;
