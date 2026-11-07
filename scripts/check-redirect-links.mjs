// Flags internal hrefs in source that match a redirect source in next.config.ts. Run from the vansales-front root.
import fs from "node:fs"; import path from "node:path";
const root = process.cwd();
const { NEW_VANS_REDIRECTS } = await import(path.join(root, "lib/redirects/new-vans.ts"));
const { USED_VAN_MODELS, usedVanOldPath, usedVanPath } = await import(path.join(root, "lib/used-vans/models.ts"));
const { BODY_TYPE_PAGES, bodyTypeOldPath, bodyTypePath } = await import(path.join(root, "lib/used-vans/body-types.ts"));
const { LANDING_PAGES } = await import(path.join(root, "lib/landing-pages.ts"));
const exact = new Map();
const add = (s, d) => exact.set(s, d);
add("/van-contract-hire", "/van-lease-deals"); add("/vans/electric", "/electric-vans");
for (const l of LANDING_PAGES) add(`/blog/${l.backendSlug}`, l.path);
for (const r of NEW_VANS_REDIRECTS) if (!/[:*(]/.test(r.source)) add(r.source, r.destination);
for (const m of USED_VAN_MODELS) add(usedVanOldPath(m), usedVanPath(m));
for (const b of BODY_TYPE_PAGES) add(bodyTypeOldPath(b), bodyTypePath(b));
const categories = new Set("chassis-cab|crew-van|dropside|electric|luton|minibus|new|panel-van|pickup|tipper|ulez|used".split("|"));
function redirectOf(p) {
  p = p.split("?")[0].split("#")[0].replace(/\/$/, "") || "/";
  if (exact.has(p)) return exact.get(p);
  let m = /^\/vans\/([a-z0-9-]+)$/.exec(p);
  if (m && !categories.has(m[1]) && !m[1].endsWith("-vans-for-sale")) return `/vans/${m[1]}-vans-for-sale`;
  if (/^\/(product-category|product|shop|wp-content|wp-admin|tag|author)(\/|$)/.test(p)) return "(wordpress family)";
  return null;
}
const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) {
  if (["node_modules", ".next", ".git", "docs"].includes(e.name)) continue;
  const f = path.join(d, e.name);
  if (e.isDirectory()) walk(f); else if (/\.(tsx?|mdx?)$/.test(e.name) && !/\.test\.ts$/.test(e.name) && e.name !== "next.config.ts" && !/lib\/redirects\//.test(f)) files.push(f);
} })(root);
let hits = 0;
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  const re = /(?:href\s*[:=]\s*[{]?\s*["'`]|\]\()(\/[A-Za-z0-9\-_/?=&.%]*)/g;
  let m; while ((m = re.exec(src))) {
    const to = redirectOf(m[1]);
    if (to) { hits++; console.log(`${path.relative(root, f)}:${src.slice(0, m.index).split("\n").length}  ${m[1]}  ->  ${to}`); }
  }
}
console.log(hits === 0 ? "OK: no internal hrefs to redirecting URLs" : `${hits} href(s) to redirecting URLs`);
process.exit(hits ? 1 : 0);
