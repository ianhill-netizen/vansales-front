// Pure helpers for scripts/gsc.mjs (no network, no googleapis), unit-tested in scripts/gsc-lib.test.mjs.

/** <loc> values of a sitemap or sitemap index. */
export function sitemapLocs(xml) {
  return [...String(xml).matchAll(/<loc>\s*([^<\s][^<]*?)\s*<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, "&"));
}

/** One URL per line; blank lines and # comments ignored; de-duplicated, order kept. */
export function parseUrlList(text) {
  const seen = new Set();
  const out = [];
  for (const line of String(text).split(/\r?\n/)) {
    const u = line.trim();
    if (!u || u.startsWith("#") || seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

const q = (v) => {
  const s = v == null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
export function toCsv(header, rows) {
  return [header.join(","), ...rows.map((r) => header.map((h) => q(r[h])).join(","))].join("\n") + "\n";
}

/** Maps the URL Inspection coverageState to the Pages-report bucket it belongs to. */
export function bucket(coverageState = "", verdict = "") {
  const c = coverageState.toLowerCase();
  if (c.includes("not found") || c.includes("404")) return "not_found_404";
  if (c.includes("crawled") && c.includes("not indexed")) return "crawled_not_indexed";
  if (c.includes("discovered") && c.includes("not indexed")) return "discovered_not_indexed";
  if (c.includes("submitted and indexed") || c.includes("indexed, not submitted") || verdict === "PASS") return "indexed";
  if (c.includes("noindex")) return "excluded_noindex";
  if (c.includes("redirect")) return "page_with_redirect";
  if (c.includes("canonical")) return "alternate_canonical";
  return "other";
}

/** Keeps requests under a per-minute quota: how many ms to wait between calls. URL Inspection allows 600/min; Indexing publish 380/min (200/day by default). */
export const delayMs = (perMinute) => Math.ceil(60000 / perMinute);

export function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}
