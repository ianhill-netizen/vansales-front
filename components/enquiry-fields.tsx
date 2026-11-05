import type { ReactNode } from "react";

export const inputCls =
  "h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[length:var(--text-base)] text-ink-800 outline-none transition-colors focus-visible:border-accent-500 focus-visible:ring-2 focus-visible:ring-accent-500/20";

/** `compact`: a 12px sentence-case label (the buyer enquiry form); the default is the small-caps label the other forms use. */
export function Field({ label, required, compact, children }: { label: string; required?: boolean; compact?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className={compact ? "mb-1 block text-[length:var(--text-xs)] font-semibold text-ink-600" : "mb-1 block text-[length:var(--text-2xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-ink-500"}>
        {label}
        {required && <span className="ml-0.5 text-sold-600" aria-hidden>*</span>}
      </span>
      {children}
    </label>
  );
}
