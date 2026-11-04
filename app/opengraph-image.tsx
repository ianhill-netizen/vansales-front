import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";
import { BRAND_BG, C, OG_SIZE, OG_TYPE, Wordmark, ogFonts } from "@/lib/og/brand";

export const alt = `${SITE.name}: ${SITE.tagline}`;
export const size = OG_SIZE;
export const contentType = OG_TYPE;

/** Default share image for every page that does not set its own. */
export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 90px", background: BRAND_BG, position: "relative" }}>
        <div style={{ position: "absolute", right: -120, top: -120, width: 520, height: 520, borderRadius: 520, background: "rgba(244,124,30,0.16)" }} />
        <Wordmark scale={2} />
        <div style={{ display: "flex", marginTop: 48, fontSize: 46, fontWeight: 700, color: "#fff", width: 1020, lineHeight: 1.2 }}>
          {SITE.tagline}
        </div>
        <div style={{ display: "flex", marginTop: 28, height: 8, width: 140, borderRadius: 4, background: C.accent }} />
      </div>
    ),
    { ...OG_SIZE, fonts: await ogFonts() },
  );
}
