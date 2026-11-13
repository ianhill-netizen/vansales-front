import { FINANCE_DISCLOSURE } from "@/lib/finance-disclosure";

/** Renders the regulated-status wording from lib/finance-disclosure.ts (the single source). Server- and client-safe (no hooks). */
export function FinanceDisclosure({ className = "" }: { className?: string }) {
  return (
    <p data-finance-disclosure className={`text-[length:var(--text-xs)] leading-relaxed text-ink-500 ${className}`}>
      {FINANCE_DISCLOSURE}
    </p>
  );
}
