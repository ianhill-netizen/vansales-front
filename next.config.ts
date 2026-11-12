import type { NextConfig } from "next";
import { buildRedirects } from "./lib/redirects/all";
import { WWW_TO_APEX_REDIRECT } from "./lib/redirects/www";

const nextConfig: NextConfig = {
  // Advert photos and dealer images are in one S3 bucket: next/image resizes them to what the screen needs and serves AVIF / WebP (components/photo.tsx).
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70],
    remotePatterns: [{ protocol: "https", hostname: "vansales-images-781856667851-eu-west-2.s3.eu-west-2.amazonaws.com" }],
  },
  // /new-vans was retired: every guide has a 301 to its nearest stock page, the index goes to /van-news (statusCode, not permanent, so it is a 301 and not Next's 308).
  async redirects() {
    return [WWW_TO_APEX_REDIRECT, ...buildRedirects()];
  },
  // The share-image routes read fonts and make logos from disk at request time; make sure they ship with the functions.
  outputFileTracingIncludes: {
    "/**/opengraph-image*": ["./assets/og/**", "./public/logos/**"],
    "/api/og/[slug]": ["./assets/og/**"],
  },
};

export default nextConfig;
