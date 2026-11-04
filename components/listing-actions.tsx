"use client";

import { useState } from "react";
import type { ListingActionLinks } from "@/lib/dealers/actions";
import { BookCallModal } from "./book-call-modal";
import { IconWhatsApp, IconMessage, IconPhone, IconExternalLink } from "./icons";

/** Fired by the Enquire button; components/enquiry-panel.tsx opens its form and focuses it. */
export const OPEN_ENQUIRY_EVENT = "vansales:open-enquiry";

const btn = "flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] px-3 text-[var(--text-sm)] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

/**
 * The button row on a listing: Enquire, then WhatsApp / Apply for finance / Book a call, each only when the seller offers it. The same row serves config dealers (Swiss Vans via
 * Dealski) and vansales-API dealers; private sellers get Enquire only (the form beside it). Buttons stack on a phone and sit two to a row from 400px up.
 */
export function ListingActions({ links, sold = false, showEnquire = true }: { links: ListingActionLinks; sold?: boolean; showEnquire?: boolean }) {
  const [callOpen, setCallOpen] = useState(false);
  return (
    <>
      <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2" data-testid="listing-actions">
        {showEnquire && (
          <button
            type="button"
            disabled={sold}
            onClick={() => window.dispatchEvent(new Event(OPEN_ENQUIRY_EVENT))}
            className={`${btn} bg-accent-500 text-white hover:brightness-105 focus-visible:ring-accent-500 disabled:opacity-50`}
          >
            <IconMessage width={16} height={16} aria-hidden />
            Enquire
          </button>
        )}
        {links.whatsappHref && (
          <a href={links.whatsappHref} target="_blank" rel="noopener noreferrer" className={`${btn} bg-[#25D366] text-white hover:bg-[#1ebe5d] focus-visible:ring-[#25D366]`}>
            <IconWhatsApp width={16} height={16} aria-hidden />
            WhatsApp
          </a>
        )}
        {links.financeHref && (
          <a href={links.financeHref} target="_blank" rel="noopener noreferrer" className={`${btn} bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500`}>
            Apply for finance
            <IconExternalLink width={13} height={13} aria-hidden />
          </a>
        )}
        {links.bookCall && (
          <button type="button" onClick={() => setCallOpen(true)} className={`${btn} border border-border bg-white text-ink-800 hover:border-ink-400 hover:bg-surface-1 focus-visible:ring-brand-500`}>
            <IconPhone width={16} height={16} aria-hidden />
            Book a call
          </button>
        )}
      </div>
      {links.bookCall && (
        <BookCallModal listingId={links.bookCall.listingId} dealerName={links.bookCall.dealerName} open={callOpen} onClose={() => setCallOpen(false)} />
      )}
    </>
  );
}
