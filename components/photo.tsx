import Image from "next/image";

/** The vansales S3 bucket every advert photo and dealer image lives in (next.config.ts images.remotePatterns allows exactly this host). */
export const PHOTO_HOST = "vansales-images-781856667851-eu-west-2.s3.eu-west-2.amazonaws.com";

const optimisable = (url: string) => {
  try { return new URL(url).hostname === PHOTO_HOST; } catch { return false; }
};

/**
 * A photo that fills its (position: relative) parent. Bucket images go through next/image: resized to the `sizes` hint and served as AVIF / WebP, lazy unless `first`.
 * `first` (the LCP photo) is eager, preloaded and high priority. Any other host (a synced dealer feed's own URLs) is shown as a plain <img>, exactly as before, because the optimiser only accepts the bucket.
 */
export function Photo({ src, alt, sizes, first = false, className = "", draggable }: { src: string; alt: string; sizes: string; first?: boolean; className?: string; draggable?: boolean }) {
  if (optimisable(src)) {
    return <Image src={src} alt={alt} fill sizes={sizes} quality={70} className={className} draggable={draggable} {...(first ? { preload: true, loading: "eager" as const, fetchPriority: "high" as const } : { loading: "lazy" as const })} />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={`absolute inset-0 size-full ${className}`} loading={first ? "eager" : "lazy"} {...(first ? { fetchPriority: "high" as const } : {})} draggable={draggable} />;
}
