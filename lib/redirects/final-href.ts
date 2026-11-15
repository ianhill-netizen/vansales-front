/**
 * The final URL for an internal href. Article and page bodies are stored in vansales-backend (and a few in content/), and some of them still carry links to URLs that now 301 (/vans/ford/transit-custom,
 * /used-vans/body-type/panel-van, /blog/{retired guide}). This resolves such a path through the SAME redirect rules the site serves (buildRedirects + the /vans/{make} rule), so a rendered link goes straight
 * to its destination in one hop instead of through a 301. Applied when a body is RENDERED (sanitize.ts, markdown.ts): nothing stored is changed. Pure apart from reading the content/blog file names once.
 */
import { buildRedirects } from "./all.ts";
import { resolveLegacy } from "./legacy.ts";
import { MOVED_CATEGORY_SLUGS, modelPagePath } from "../used-vans/paths.ts";
import { makeVansPath } from "../seo/make-url.ts";

/** Category pages under /vans that are real pages of their own, so /vans/{x} for them is never a make. */
const NOT_A_MAKE = new Set(["chassis-cab", "crew-van", "dropside", "electric", "luton", "minibus", "new", "panel-van", "pickup", "tipper", "ulez", "used"]);

let EXACT: Map<string, string> | null = null;
function exact(): Map<string, string> {
  if (!EXACT) {
    EXACT = new Map();
    for (const r of buildRedirects()) if (!/[:*(]/.test(r.source) && !EXACT.has(r.source)) EXACT.set(r.source.toLowerCase(), r.destination);   // first match wins, like Next
  }
  return EXACT;
}

function step(path: string): string | null {
  const hit = exact().get(path.toLowerCase());
  if (hit && hit !== path) return hit;
  const legacy = resolveLegacy(path);
  if (legacy && legacy.to !== path) return legacy.to;
  const model = /^\/vans\/([a-z0-9-]+)\/([a-z0-9-]+)$/.exec(path);
  if (model) { const to = modelPagePath(model[1], model[2]); return to !== path ? to : null; }
  const make = /^\/vans\/([a-z0-9-]+)$/.exec(path);
  if (make && !NOT_A_MAKE.has(make[1]) && !MOVED_CATEGORY_SLUGS.includes(make[1]) && !make[1].endsWith("-vans-for-sale")) return makeVansPath(make[1]);
  return null;
}

/** `href` (a path on this site, optionally with ?query and #hash) with its redirect followed to the end; any other href is returned unchanged. */
export function finalHref(href: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const m = /^([^?#]*)(.*)$/.exec(href)!;
  let path = m[1].length > 1 ? m[1].replace(/\/+$/, "") : m[1];
  for (let i = 0; i < 4; i++) {   // a rule's destination is already final; the loop only guards against a future chain
    const next = step(path);
    if (!next) break;
    path = next;
  }
  return path === m[1] ? href : `${path}${m[2]}`;
}
