/**
 * Internal links inside article bodies (blog posts, guides, van news): the FIRST mention of each make links to its /vans/{make}-vans-for-sale page and the first mention of each model to its
 * /used-vans/{make}/{model}-for-sale page. Applied when an article is RENDERED (so nothing stored is changed and a retired URL can never be baked into a body). Only text is touched: nothing inside
 * an existing link, a heading, a code block, a script/style, or a tag attribute. Case-sensitive proper names, so "master" or "daily" in a sentence never links; a few model names that are also
 * ordinary words (Master, Daily, Expert...) link only when their make comes straight before them ("Renault Master"). Pure: no I/O.
 */
import { USED_VAN_MODELS, type UsedVanModel, usedVanPath } from "../used-vans/models.ts";
import { makeVansPath } from "../seo/make-url.ts";

const MAKES: ReadonlyArray<{ slug: string; names: readonly string[] }> = [
  { slug: "citroen", names: ["Citroën", "Citroen"] },
  { slug: "ford", names: ["Ford"] },
  { slug: "volkswagen", names: ["Volkswagen", "VW"] },
  { slug: "mercedes-benz", names: ["Mercedes-Benz", "Mercedes"] },
  { slug: "vauxhall", names: ["Vauxhall"] },
  { slug: "renault", names: ["Renault"] },
  { slug: "fiat", names: ["Fiat"] },
  { slug: "iveco", names: ["Iveco"] },
  { slug: "toyota", names: ["Toyota"] },
  { slug: "nissan", names: ["Nissan"] },
  { slug: "peugeot", names: ["Peugeot"] },
];

/** Model names that are also ordinary words or too generic alone: linked only straight after their make. */
const NEEDS_MAKE = new Set(["Daily", "Expert", "Master", "Partner", "Relay", "Dispatch", "Combo", "Ranger", "Defender", "Boxer"]);
const MAKE_ALIASES: Record<string, string[]> = { "land-rover": ["Land Rover"], citroen: ["Citroën", "Citroen"], volkswagen: ["Volkswagen", "VW"], "mercedes-benz": ["Mercedes-Benz", "Mercedes"] };

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const SKIP_TAGS = new Set(["a", "h1", "h2", "h3", "h4", "h5", "h6", "script", "style", "code", "pre", "button"]);

interface Target { key: string; href: string; re: RegExp }

function targets(): Target[] {
  const models: Target[] = [...USED_VAN_MODELS]
    .sort((a, b) => b.model.length - a.model.length)   // "Transit Custom" before "Transit"
    .map((m: UsedVanModel) => {
      const aliases = MAKE_ALIASES[m.makeSlug] ?? [m.make];
      const lead = NEEDS_MAKE.has(m.model) ? `(?<=(?:${aliases.map(esc).join("|")})\\s)` : "";
      return { key: `model:${m.makeSlug}/${m.modelSlug}`, href: usedVanPath(m), re: new RegExp(`${lead}(?<![\\w-])(${esc(m.model)})(?![\\w-])`) };
    });
  const makes: Target[] = MAKES.map((mk) => ({ key: `make:${mk.slug}`, href: makeVansPath(mk.slug), re: new RegExp(`(?<![\\w-])(${[...mk.names].sort((a, b) => b.length - a.length).map(esc).join("|")})(?![\\w-])`) }));
  return [...models, ...makes];
}

let TARGETS: Target[] | null = null;

/** Replaces the first eligible text mention of one target; returns the new html or null when there is none. */
function linkFirst(html: string, t: Target): string | null {
  const tag = /(<[^>]*>)|([^<]+)/g;
  const stack: string[] = [];
  let out = "";
  let done = false;
  let m: RegExpExecArray | null;
  while ((m = tag.exec(html)) !== null) {
    if (m[1]) {
      out += m[1];
      const open = /^<\s*([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>$/.exec(m[1]);
      const close = /^<\s*\/\s*([a-zA-Z][a-zA-Z0-9]*)/.exec(m[1]);
      if (open && !open[2] && SKIP_TAGS.has(open[1].toLowerCase())) stack.push(open[1].toLowerCase());
      else if (close && SKIP_TAGS.has(close[1].toLowerCase())) { const i = stack.lastIndexOf(close[1].toLowerCase()); if (i >= 0) stack.length = i; }
      continue;
    }
    const text = m[2];
    if (done || stack.length > 0) { out += text; continue; }
    const hit = t.re.exec(text);
    if (!hit) { out += text; continue; }
    const at = hit.index + hit[0].indexOf(hit[1]);
    out += `${text.slice(0, at)}<a href="${t.href}" data-auto-link="1">${hit[1]}</a>${text.slice(at + hit[1].length)}`;
    done = true;
  }
  return done ? out : null;
}

/** The article html with first mentions linked. `skipHrefs`: pages not to link to (an article about a model should not link to itself). */
export function autoLink(html: string, skipHrefs: readonly string[] = []): string {
  if (!html) return html;
  TARGETS ??= targets();
  let result = html;
  for (const t of TARGETS) {
    if (skipHrefs.includes(t.href)) continue;
    const next = linkFirst(result, t);
    if (next !== null) result = next;
  }
  return result;
}

export const AUTO_LINK_MARK = 'data-auto-link="1"';
