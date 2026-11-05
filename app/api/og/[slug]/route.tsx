import { ImageResponse } from "next/og";
import { getListingBySlug } from "@/lib/listings/client";
import { listingTitle } from "@/lib/listings/format";
import { BRAND_BG, C, OG_SIZE, Wordmark, ogFonts } from "@/lib/og/brand";

/* GET /api/og/{slug}: per-listing share image (1200x630; JPEG when it has a photo, PNG for the branded card). The van's first photo behind a dark
   gradient, with price, make + model (+ year) and the wordmark. It never fails: no photo, a slow
   or oversized or non-https image, or a lookup error all fall back to the branded card. */

export const revalidate = 3600;

const IMAGE_TIMEOUT_MS = 3000;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const HEADERS = { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" };

/**
 * Photos are mostly WebP, which satori cannot draw (it throws), and satori only emits PNG, which makes a photo card ~800KB.
 * So the photo never goes through satori: it is resized with sharp (max 1200px wide, cover-cropped to 1200x630), the
 * gradient + text overlay is rendered as a small transparent PNG, and sharp composites the two into a quality-80 JPEG.
 * sharp is imported lazily so a missing binary just means the branded card. Magic bytes are checked first:
 * never trust the URL or the content-type header.
 */
async function toPhotoBuffer(buf: ArrayBuffer): Promise<Buffer | null> {
  const b = new Uint8Array(buf);
  const isJpeg = b[0] === 0xff && b[1] === 0xd8;
  const isPng = b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
  const isWebp = b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50;
  if (!isJpeg && !isPng && !isWebp) return null;
  try {
    const sharp = (await import("sharp")).default;
    return await sharp(Buffer.from(buf)).resize(1200, 630, { fit: "cover", withoutEnlargement: false }).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
  } catch {
    return null;
  }
}

async function fetchPhoto(url: string | undefined): Promise<Buffer | null> {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return null;
    const res = await fetch(u, { signal: AbortSignal.timeout(IMAGE_TIMEOUT_MS), redirect: "follow" });
    if (!res.ok) return null;
    const declared = Number(res.headers.get("content-length") ?? 0);
    if (declared > MAX_IMAGE_BYTES) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_IMAGE_BYTES) return null;
    return await toPhotoBuffer(buf);
  } catch {
    return null;
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const fonts = await ogFonts();
  let title = "Van for sale";
  let price = "";
  let photo: Buffer | null = null;
  try {
    const { slug } = await params;
    const { listing } = await getListingBySlug(slug);
    if (listing) {
      title = `${listingTitle(listing)}${listing.year > 0 ? ` (${listing.year})` : ""}`;
      price = listing.price != null ? `£${listing.price.toLocaleString("en-GB")}` : "POA";
      photo = await fetchPhoto(listing.images.find((i) => i.url.startsWith("https://"))?.url);
    }
  } catch {
    /* fall through to the branded card */
  }

  const card = (withPhoto: boolean) => (
    <div style={{ width: 1200, height: 630, display: "flex", position: "relative", background: withPhoto ? "transparent" : BRAND_BG }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, display: "flex", background: withPhoto ? "linear-gradient(to top, rgba(8,14,28,0.95) 0%, rgba(8,14,28,0.55) 55%, rgba(8,14,28,0.25) 100%)" : "transparent" }} />
      <div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 70px" }}>
        <Wordmark scale={0.8} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          {price && <div style={{ display: "flex", alignSelf: "flex-start", padding: "6px 26px", borderRadius: 14, background: C.accent, color: "#fff", fontSize: 76, fontWeight: 700, letterSpacing: -1 }}>{price}</div>}
          <div style={{ display: "flex", width: 1060, marginTop: 20, fontSize: title.length > 30 ? 60 : 72, fontWeight: 700, color: "#fff", lineHeight: 1.08, letterSpacing: -1.5 }}>{title}</div>
        </div>
      </div>
    </div>
  );

  if (photo) {
    try {
      const overlay = Buffer.from(await new ImageResponse(card(true), { ...OG_SIZE, fonts }).arrayBuffer());
      const sharp = (await import("sharp")).default;
      const out = await sharp(photo).composite([{ input: overlay }]).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
      return new Response(new Uint8Array(out), { headers: { ...HEADERS, "Content-Type": "image/jpeg" } });
    } catch {
      /* fall through to the branded card */
    }
  }

  return new ImageResponse(card(false), { ...OG_SIZE, fonts, headers: HEADERS });
}
