/**
 * body_type_pages.filter_definition (vansales-backend): which listings belong on a body-type / facet page, as data. Pure, no app imports (node:test runs it directly).
 * Every key present must match (AND); `any` is a list of sub-filters of which one must match (OR).
 *   size            "small" (car-derived and compact vans) | "large" (full-size vans): from the make and model, see SMALL / LARGE
 *   gearbox         "automatic" | "manual": from the advert's transmission
 *   vat_qualifying  true = a "+ VAT" price; false = a price with no VAT to add (VAT included, or no VAT). A listing whose VAT status is unknown matches neither.
 *   body            keywords, any one in the body style, derivative or model
 *   text            keywords, any one anywhere in make, model, derivative, body style or features
 *   make, model     the listing's make / model (case-insensitive, exact)
 */
import { vatState } from "../listings/vat.ts";

export interface FilterDefinition {
  size?: "small" | "large";
  gearbox?: "automatic" | "manual";
  vat_qualifying?: boolean;
  body?: string[];
  text?: string[];
  make?: string;
  model?: string;
  any?: FilterDefinition[];
}

export interface FilterListing {
  make: string;
  model: string;
  derivative: string;
  features?: string[];
  van_spec: { body_style: string };
  transmission?: string;
  price_type?: string;
  vat_status?: string | null;
}

const SMALL = /\b(caddy|berlingo|kangoo|transit connect|connect|courier|partner|combo|doblo|nv200|e-?nv200|citan|fiorino|nemo|bipper|rifter|townstar|e-?kangoo|kangoo e-tech)\b/;
const LARGE = /\b(sprinter|esprinter|crafter|e-?crafter|master|movano|boxer|e-?boxer|ducato|e-?ducato|relay|e-?relay|daily|tge|interstar|nv400|deliver 9|edeliver 9|transit(?! (custom|connect|courier|trail)))\b/;

const norm = (s: string | null | undefined) => (s ?? "").toLowerCase().replace(/\s+/g, " ").trim();
const hay = (l: FilterListing) => norm([l.make, l.model, l.derivative, l.van_spec.body_style, ...(l.features ?? [])].join(" "));

export function sizeOf(l: Pick<FilterListing, "make" | "model">): "small" | "large" | null {
  const m = norm(`${l.make} ${l.model}`);
  if (SMALL.test(m)) return "small";
  if (LARGE.test(m)) return "large";
  return null;
}

export function gearboxOf(l: Pick<FilterListing, "transmission">): "automatic" | "manual" | null {
  const t = norm(l.transmission);
  if (!t) return null;
  if (/auto|dsg|dct|tiptronic|cvt|steptronic|powershift|9g|7g/.test(t)) return "automatic";
  if (/manual/.test(t)) return "manual";
  return null;
}

function vatOf(l: FilterListing): "ex_vat" | "inc_vat" | "no_vat" | "unknown" {
  if (l.vat_status) return vatState(l.vat_status);
  return l.price_type === "ex_vat" || l.price_type === "inc_vat" || l.price_type === "no_vat" ? l.price_type : "unknown";
}

export function matchesFilter(def: FilterDefinition, l: FilterListing): boolean {
  if (def.any && !def.any.some((d) => matchesFilter(d, l))) return false;
  if (def.size && sizeOf(l) !== def.size) return false;
  if (def.gearbox && gearboxOf(l) !== def.gearbox) return false;
  if (def.vat_qualifying !== undefined) {
    const v = vatOf(l);
    if (def.vat_qualifying ? v !== "ex_vat" : v !== "inc_vat" && v !== "no_vat") return false;
  }
  if (def.body && !def.body.some((k) => norm([l.van_spec.body_style, l.derivative, l.model].join(" ")).includes(norm(k)))) return false;
  if (def.text && !def.text.some((k) => hay(l).includes(norm(k)))) return false;
  if (def.make && norm(l.make) !== norm(def.make)) return false;
  if (def.model && norm(l.model) !== norm(def.model)) return false;
  return true;
}

/** A filter_definition from the API, or null when it is absent or not a usable shape (the page then uses its built-in rule). Unknown keys are dropped. */
export function parseFilterDefinition(raw: unknown, depth = 0): FilterDefinition | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw) || depth > 3) return null;
  const r = raw as Record<string, unknown>;
  const out: FilterDefinition = {};
  const strs = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "") : []);
  if (r.size === "small" || r.size === "large") out.size = r.size;
  if (r.gearbox === "automatic" || r.gearbox === "manual") out.gearbox = r.gearbox;
  if (typeof r.vat_qualifying === "boolean") out.vat_qualifying = r.vat_qualifying;
  if (strs(r.body).length) out.body = strs(r.body);
  if (strs(r.text).length) out.text = strs(r.text);
  if (typeof r.make === "string" && r.make) out.make = r.make;
  if (typeof r.model === "string" && r.model) out.model = r.model;
  if (Array.isArray(r.any)) {
    const subs = r.any.map((x) => parseFilterDefinition(x, depth + 1)).filter((x): x is FilterDefinition => x !== null);
    if (subs.length) out.any = subs;
  }
  return Object.keys(out).length ? out : null;
}
