import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The share-image routes read fonts and make logos from disk at request time; make sure they ship with the functions.
  outputFileTracingIncludes: {
    "/**/opengraph-image*": ["./assets/og/**", "./public/logos/**"],
    "/api/og/[slug]": ["./assets/og/**"],
  },
};

export default nextConfig;
