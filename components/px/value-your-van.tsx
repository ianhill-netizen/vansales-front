"use client";

import { useState } from "react";
import { EnquiryModal } from "../enquiry-modal";
import { PxLookup } from "./px-lookup";

/**
 * The dealer page's "Value your van" card (shown only for dealers with px_enabled). Reg + mileage -> clean / average / below. "Get a firm offer" then either opens the dealer's own enquiry modal pre-filled
 * (dealers with a Dealski tenant, e.g. Swiss Vans: the same /api/enquiry route as their Message button), or sends the visitor to the dealer's first advert with the enquiry form open and the part exchange filled
 * in (a dealer-portal dealer has no dealer-level enquiry endpoint: enquiries are per advert).
 */
export function ValueYourVan({ dealerName, dealskiTenant, listingHref }: { dealerName: string; dealskiTenant: string; listingHref: string | null }) {
  const [got, setGot] = useState<{ reg: string; mileage: number } | null>(null);
  const [open, setOpen] = useState(false);
  const reg = got?.reg.toUpperCase().replace(/\s+/g, "") ?? "";
  const btn = "inline-flex h-11 w-full items-center justify-center rounded-[var(--radius-md)] bg-brand-500 px-4 text-[length:var(--text-sm)] font-semibold text-white transition-colors hover:bg-brand-600";
  return (
    <div className="mt-5 rounded-[var(--radius-xl)] border border-border bg-card p-5 shadow-[var(--shadow-sm)]">
      <h2 className="font-display text-[length:var(--text-lg)] font-bold text-ink-900">Value your van</h2>
      <p className="mt-1 text-[length:var(--text-sm)] text-ink-500">See what your van is worth in part exchange, free.</p>
      <div className="mt-4">
        <PxLookup variant="full" fieldNames={false} onResult={(r) => setGot(r ? { reg: r.reg, mileage: r.mileage } : null)} />
      </div>
      {got && (
        <div className="mt-4">
          {dealskiTenant ? (
            <button type="button" onClick={() => setOpen(true)} className={btn}>Get a firm offer</button>
          ) : listingHref ? (
            <a href={`${listingHref}?enquire=1&px_reg=${encodeURIComponent(reg)}&px_mileage=${got.mileage}#enquire`} className={btn}>Get a firm offer</a>
          ) : null}
        </div>
      )}
      {open && got && (
        <EnquiryModal
          dealerName={dealerName}
          dealskiTenant={dealskiTenant}
          onClose={() => setOpen(false)}
          initialPx={{ reg, mileage: String(got.mileage) }}
          initialMessage={`I'd like a firm offer on my part exchange: ${reg}`}
        />
      )}
    </div>
  );
}
