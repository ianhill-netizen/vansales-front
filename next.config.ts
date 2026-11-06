import type { NextConfig } from "next";
import { NEW_VANS_REDIRECTS } from "./lib/redirects/new-vans";

const nextConfig: NextConfig = {
  // /new-vans was retired: every guide has a 301 to its nearest stock page, the index goes to /van-news (statusCode, not permanent, so it is a 301 and not Next's 308).
  async redirects() {
    return NEW_VANS_REDIRECTS.map((r) => ({ ...r }));
  },
  // The share-image routes read fonts and make logos from disk at request time; make sure they ship with the functions.
  outputFileTracingIncludes: {
    "/**/opengraph-image*": ["./assets/og/**", "./public/logos/**"],
    "/api/og/[slug]": ["./assets/og/**"],
  },
};

export default nextConfig;
