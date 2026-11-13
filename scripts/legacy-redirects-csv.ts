// Writes tmp/legacy-redirects.csv (old_path,new_path,rule) from the redirect rules in lib/redirects: every explicit rule, every pattern rule (shown with its :param pattern), and the legacy families resolved
// by proxy.ts for the known probe URLs. Run: node scripts/legacy-redirects-csv.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { buildRedirects, rootBlogRedirects } from "../lib/redirects/all.ts";
import { resolveLegacy } from "../lib/redirects/legacy.ts";

const family = (src: string): string => {
  if (src.startsWith("/new-vans")) return "new-vans (explicit override or catch-all to /vans)";
  if (src.startsWith("/blog/")) return "landing/guide twin of a real page";
  if (src.startsWith("/detail/")) return "old listing id (308 to /used-vans)";
  if (/^\/(shop|wp-content|wp-admin|tag|author)\b/.test(src)) return "wordpress family";
  if (src === "/about-us") return "about-us";
  if (src.startsWith("/used-vans/")) return "retired /used-vans path (-for-sale suffix or backlink)";
  if (src.startsWith("/vans/")) return "vans path rename";
  return "explicit override";
};
const rows: [string, string, string][] = [];
const roots = new Set(rootBlogRedirects().map((r) => r.source));
for (const r of buildRedirects()) rows.push([r.source, r.destination, roots.has(r.source) ? "root-level old blog slug -> /blog/{slug}" : `${family(r.source)} [${r.statusCode}]`]);
const probes = [
  "/product-category/dropside/", "/product-category/crew-cab/", "/product-category/pickups/", "/product/citroen-relay-tipper/", "/van/iveco-daily-4x4/", "/product/vw-transporter-t6-kombi/",
  "/product/mercedes-sprinter-314-lwb/", "/product/ford-transit-custom-320-limited/", "/van/luton-box-van-for-hire/", "/product-category/accessories/", "/product/zzz-unknown-thing/",
];
for (const p of probes) { const h = resolveLegacy(p); rows.push([p, h?.to ?? "", `proxy pattern: ${h?.rule ?? "none"}`]); }
const q = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
mkdirSync("tmp", { recursive: true });
writeFileSync("tmp/legacy-redirects.csv", ["old_path,new_path,rule", ...rows.map((r) => r.map(q).join(","))].join("\n") + "\n");
const by: Record<string, number> = {};
for (const r of rows) by[r[2].replace(/ \[\d+\]$/, "")] = (by[r[2].replace(/ \[\d+\]$/, "")] ?? 0) + 1;
console.log(rows.length + " rows"); console.log(by);
