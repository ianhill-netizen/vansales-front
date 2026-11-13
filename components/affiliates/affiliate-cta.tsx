import { AffiliateLink } from "@/components/affiliates/affiliate-link";
import { COMMISSION_LINE } from "@/lib/affiliates";
import { getPlacements } from "@/lib/affiliates-api";

/** Renders nothing until Dealski has an active placement for this page (lib/affiliates.ts). When it does, the commission line is shown with the link. */
export async function AffiliateCta({ page, className = "" }: { page: string; className?: string }) {
  const [p] = await getPlacements(page);
  if (!p) return null;
  return (
    <div className={className}>
      <AffiliateLink href={p.href} label={p.label} slot={String(p.advertiserId)} page={page} />
      <p className="mt-2 text-[length:var(--text-xs)] text-ink-500">{COMMISSION_LINE}</p>
    </div>
  );
}
