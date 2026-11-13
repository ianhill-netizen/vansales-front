import { AffiliateLink } from "@/components/affiliates/affiliate-link";
import { COMMISSION_LINE, affiliateFor, type AffiliateSlot } from "@/lib/affiliates";

/** Renders nothing until the slot's AFF_* env is set (lib/affiliates.ts). When it does render, the commission line is shown with the link. */
export function AffiliateCta({ slot, page, className = "" }: { slot: AffiliateSlot; page: string; className?: string }) {
  const a = affiliateFor(slot);
  if (!a) return null;
  return (
    <div className={className}>
      <AffiliateLink href={a.href} label={a.label} slot={slot.toLowerCase()} page={page} />
      <p className="mt-2 text-[length:var(--text-xs)] text-ink-500">{COMMISSION_LINE}</p>
    </div>
  );
}
