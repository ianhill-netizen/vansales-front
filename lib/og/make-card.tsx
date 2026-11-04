import { ImageResponse } from "next/og";
import { BRAND_BG, C, Monogram, OG_SIZE, Wordmark, makeLogoDataUri, ogFonts } from "./brand";

/** Make / model share image: the make's logo on a white tile, "{Make} {Model} vans for sale", and the wordmark. */
export async function makeCard({ makeSlug, makeName, modelName }: { makeSlug: string; makeName: string; modelName?: string }) {
  const logo = await makeLogoDataUri(makeSlug);
  const headline = modelName ? `${makeName} ${modelName}` : makeName;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "70px 90px", background: BRAND_BG }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 220, height: 220, borderRadius: 36, background: "#fff", padding: 28 }}>
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" width={164} height={164} style={{ objectFit: "contain" }} />
            ) : (
              <Monogram name={makeName} size={164} />
            )}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: headline.length > 22 ? 78 : 96, fontWeight: 700, color: "#fff", lineHeight: 1.05, letterSpacing: -2 }}>{headline}</div>
          <div style={{ display: "flex", marginTop: 14, fontSize: 52, fontWeight: 700, color: C.accent }}>vans for sale</div>
        </div>
        <Wordmark scale={0.8} />
      </div>
    ),
    { ...OG_SIZE, fonts: await ogFonts() },
  );
}
