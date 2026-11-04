import type { ReactNode } from "react";

export const inputCls =
  "h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[var(--text-base)] text-ink-800 outline-none transition-colors focus-visible:border-accent-500 focus-visible:ring-2 focus-visible:ring-accent-500/20";

export function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[var(--text-2xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-ink-500">
        {label}
        {required && <span className="ml-0.5 text-sold-600" aria-hidden>*</span>}
      </span>
      {children}
    </label>
  );
}
