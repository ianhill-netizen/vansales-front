import { readFile } from "node:fs/promises";
import { join } from "node:path";

/* Shared pieces for the next/og images: size, font, the VS plate + wordmark, and the make-logo loader. */

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_TYPE = "image/png";

// Brand colours (kept in step with app/styles/tokens.css; ImageResponse cannot read CSS variables).
export const C = { brand: "#13427f", brandDark: "#081c3a", ink: "#080e1c", accent: "#f47c1e", plate: "#ffd400" } as const;

export async function ogFonts() {
  const data = await readFile(join(process.cwd(), "assets/og/Geist-Bold.ttf"));
  return [{ name: "Geist", data, weight: 700 as const, style: "normal" as const }];
}

/** The vansales.com hub logo (same as public/logo.svg): navy plate, "vansales", amber ".com" pill. `light` = navy plate; false = white plate with navy text. */
export function Wordmark({ scale = 1, light = true }: { scale?: number; light?: boolean }) {
  const k = scale * 0.8;   // 420 x 80 units at scale 1 = 336 x 64 px
  const ink = "#0d1b2a";
  return (
    <div style={{ display: "flex", alignItems: "center", position: "relative", width: 420 * k, height: 80 * k, borderRadius: 12 * k, background: light ? ink : "#fff" }}>
      <div style={{ display: "flex", marginLeft: 20 * k, fontSize: 52 * k, fontWeight: 700, color: light ? "#fff" : ink, letterSpacing: -1 * k }}>vansales</div>
      <div style={{ display: "flex", position: "absolute", left: 274 * k, top: 10 * k, width: 132 * k, height: 60 * k, borderRadius: 10 * k, background: "#F5A623", alignItems: "center", justifyContent: "center", fontSize: 40 * k, fontWeight: 700, color: ink }}>.com</div>
    </div>
  );
}

const SLUG = /^[a-z0-9-]+$/;

/** A make's logo (from /public/logos) as a data URI, or null when we have none (the caller draws a monogram). */
export async function makeLogoDataUri(slug: string): Promise<string | null> {
  if (!SLUG.test(slug)) return null;
  try {
    const svg = await readFile(join(process.cwd(), "public", "logos", `${slug}.svg`));
    return `data:image/svg+xml;base64,${svg.toString("base64")}`;
  } catch {
    return null;
  }
}

export function Monogram({ name, size }: { name: string; size: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: size, height: size, borderRadius: size / 5, background: "#eaeff5", color: "#5a7a9a", fontSize: size * 0.5, fontWeight: 700 }}>
      {(name.trim()[0] ?? "V").toUpperCase()}
    </div>
  );
}

/** Same background used by every branded card. */
export const BRAND_BG = `linear-gradient(135deg, ${C.brandDark} 0%, ${C.brand} 100%)`;
