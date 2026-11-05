import Link from "next/link";

type Search = Record<string, string | string[] | undefined>;

/* Quick-filter chips: one tap to toggle a common filter. Used under the home search and under the results search bar.
   Plain links (server rendered, no JS), so the active state always matches the URL. */

type Chip =
  | { label: string; kind: "all" }
  | { label: string; kind: "csv"; param: "bodyStyle" | "fuel"; value: string }
  | { label: string; kind: "eq"; param: "maxPrice" | "ulez"; value: string };

const CHIPS: Chip[] = [
  { label: "All vans", kind: "all" },
  { label: "Panel vans", kind: "csv", param: "bodyStyle", value: "panel-van" },
  { label: "Crew cabs", kind: "csv", param: "bodyStyle", value: "crew-cab" },
  { label: "Lutons", kind: "csv", param: "bodyStyle", value: "luton" },
  { label: "Tippers", kind: "csv", param: "bodyStyle", value: "tipper" },
  { label: "Pickups", kind: "csv", param: "bodyStyle", value: "pickup" },
  { label: "Electric", kind: "csv", param: "fuel", value: "electric" },
  { label: "Under £10k", kind: "eq", param: "maxPrice", value: "10000" },
  { label: "ULEZ", kind: "eq", param: "ulez", value: "1" },
];

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const list = (v: string) => v.split(",").map((x) => x.trim()).filter(Boolean);

function isActive(c: Chip, sp: Search): boolean {
  if (c.kind === "all") return !one(sp.bodyStyle) && !one(sp.fuel) && !one(sp.maxPrice) && !one(sp.ulez);
  if (c.kind === "csv") return list(one(sp[c.param])).includes(c.value);
  return one(sp[c.param]) === c.value;
}

function hrefFor(c: Chip, sp: Search): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    const val = one(v);
    if (val && k !== "page") p.set(k, val);
  }
  if (c.kind === "all") {
    for (const k of ["bodyStyle", "fuel", "maxPrice", "ulez", "minPrice", "monthlyMax", "condition"]) p.delete(k);
  } else if (c.kind === "csv") {
    const cur = list(one(sp[c.param]));
    const next = cur.includes(c.value) ? cur.filter((x) => x !== c.value) : [...cur, c.value];
    if (next.length) p.set(c.param, next.join(",")); else p.delete(c.param);
  } else if (isActive(c, sp)) {
    p.delete(c.param);
  } else {
    p.set(c.param, c.value);
    if (c.param === "maxPrice") { p.delete("monthlyMax"); }
  }
  const qs = p.toString();
  return `/vans${qs ? `?${qs}` : ""}`;
}

export function QuickFilters({ sp = {}, className = "" }: { sp?: Search; className?: string }) {
  return (
    <div className={`-mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}>
      <ul className="flex w-max gap-2" aria-label="Quick filters">
        {CHIPS.map((c) => {
          const active = isActive(c, sp);
          return (
            <li key={c.label}>
              <Link
                href={hrefFor(c, sp)}
                scroll={false}
                aria-current={active ? "true" : undefined}
                className={`inline-flex whitespace-nowrap rounded-[var(--radius-pill)] border px-4 py-2 text-[length:var(--text-sm)] font-semibold transition-colors ${
                  active ? "border-brand-600 bg-brand-600 text-white" : "border-border bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700"
                }`}
              >
                {c.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
