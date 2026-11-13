import { FinanceCalculator, type FinanceConfig } from "@/components/finance-calculator";
import { FinanceDisclosureText } from "@/components/finance/finance-disclosure-text";
import type { WarrantyAddon } from "@/lib/hp-example";

/** A Swiss Vans van the live representative example is worked out for (same maths, rows and rate as the listing-page calculator). */
export interface DisclosureExample {
  price: number;
  warranties?: WarrantyAddon[];
  finance?: FinanceConfig | null;
  vatQualifying?: boolean;
}

/**
 * The finance disclosure. Wherever a £ figure or an APR appears on a page, pass `example`: the calculator's live-computed representative example (current rate, never static) is shown directly above the wording.
 * Without `example` it is the wording alone.
 */
export function FinanceDisclosure({ className = "", example }: { className?: string; example?: DisclosureExample }) {
  return (
    <div className={className}>
      {example && (
        <FinanceCalculator embedded price={example.price} applyHref="/van-finance#enquire" warranties={example.warranties ?? []} finance={example.finance ?? null} vatQualifying={example.vatQualifying ?? false} />
      )}
      <FinanceDisclosureText className={example ? "mt-3" : ""} />
    </div>
  );
}
