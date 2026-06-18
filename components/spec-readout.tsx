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
  return (
    <dl
      className={`grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0 ${className}`}
    >
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 first:pl-0">
          <span className="text-ink-400" aria-hidden>
            {it.icon}
          </span>
          <div className="min-w-0">
            <dt className="text-[var(--text-2xs)] uppercase tracking-[var(--tracking-wide)] text-ink-400">
              {it.label}
            </dt>
            <dd className="truncate font-mono text-[var(--text-sm)] font-medium text-ink-800">
              {it.value}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  );
}
