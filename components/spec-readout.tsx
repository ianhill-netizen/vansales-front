import type { ReactNode } from "react";

/* -----------------------------------------------------------------------------
   SpecReadout — the instrument-cluster strip. A row of mono "readouts" with
   hairline dividers, like a dashboard. Used on cards and the detail header.
   -------------------------------------------------------------------------- */
export interface Readout {
  icon: ReactNode;
  label: string;
  value: string;
}

export function SpecReadout({
  items,
  className = "",
}: {
  items: Readout[];
  className?: string;
}) {
  // A tile with nothing to say is not shown, and the grid reflows to what is left.
  const shown = items.filter((it) => it.value && !["—", "-", "–"].includes(it.value.trim()));
  if (shown.length === 0) return null;
  const cols = ({ 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3" } as Record<number, string>)[shown.length] ?? "sm:grid-cols-4";
  return (
    <dl
      className={`grid ${shown.length === 1 ? "grid-cols-1" : "grid-cols-2"} divide-x divide-y divide-border ${cols} sm:divide-y-0 ${className}`}
    >
      {shown.map((it, i) => (
        <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 first:pl-0">
          <span className="text-ink-400" aria-hidden>
            {it.icon}
          </span>
          <div className="min-w-0">
            <dt className="text-[length:var(--text-2xs)] uppercase tracking-[var(--tracking-wide)] text-ink-400">
              {it.label}
            </dt>
            <dd className="truncate font-mono text-[length:var(--text-sm)] font-medium text-ink-800">
              {it.value}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  );
}
