"use client";

import { useState } from "react";
import type { ListingActionLinks } from "@/lib/dealers/actions";
import { BookCallModal } from "./book-call-modal";
import { ContactModal, type ContactChannel } from "./contact-modal";
import { IconWhatsApp, IconMessage, IconPhone, IconExternalLink, IconHeart } from "./icons";
import { ListingPxModal } from "./px/listing-px-modal";
import { useSaved } from "@/lib/saved";

/** Fired by the Enquire button; components/enquiry-panel.tsx opens its form and focuses it. */
export const OPEN_ENQUIRY_EVENT = "vansales:open-enquiry";

const btn = "flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] px-3 text-[length:var(--text-sm)] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

/** Vansales' own WhatsApp / SMS number: buyers on a vansales advert message this one (quoting VS-{id}) instead of the dealer. */
export const VANSALES_CONTACT_NUMBER = "+447463580222";

/** What the stacked buyer buttons need: the advert id (the "VS-" reference), its plain-English label ("AB12CDE Ford Transit"), its page URL, and whether a part-exchange valuation is on offer (dealer adverts). */
export interface BuyerActions { listingId: string; label: string; shareUrl: string; shareTitle: string; partExchange: boolean }

const secondary = "border border-border bg-white text-ink-800 hover:border-ink-400 hover:bg-surface-1 focus-visible:ring-brand-500";

function IconShare(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7" /><path d="M16 6l-4-4-4 4" /><path d="M12 2v13" /></svg>;
}

/** Share: the native share sheet on a phone, copy-the-link on a desktop. */
function ShareButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const touch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
    if (touch && typeof navigator.share === "function") {
      try { await navigator.share({ title, url }); return; } catch (e) { if ((e as Error).name === "AbortError") return; }
    }
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { window.prompt("Copy this link", url); }
  }
  return (
    <button type="button" onClick={() => void share()} className={`${btn} ${secondary}`}>
      <IconShare width={16} height={16} aria-hidden />
      <span aria-live="polite">{copied ? "Link copied" : "Share"}</span>
    </button>
  );
}

/** Save: the same browser-only saved list as the heart in the header (lib/saved.ts), no login. */
function SaveRowButton({ id }: { id: string }) {
  const { has, toggle, ready } = useSaved();
  const saved = ready && has(id);
  return (
    <button type="button" aria-pressed={saved} onClick={() => toggle(id)} className={`${btn} ${secondary}`}>
      <IconHeart width={16} height={16} aria-hidden className={saved ? "fill-sold-600 text-sold-600" : ""} />
      {saved ? "Saved" : "Save"}
    </button>
  );
}

/**
 * The button row on a listing: Enquire, then WhatsApp / Apply for finance / Book a call, each only when the seller offers it. The same row serves config dealers (Swiss Vans via
 * Dealski) and vansales-API dealers; private sellers get Enquire only (the form beside it). Buttons stack on a phone and sit two to a row from 400px up.
 */
export function ListingActions({ links, sold = false, showEnquire = true, buyer }: { links: ListingActionLinks; sold?: boolean; showEnquire?: boolean; buyer?: BuyerActions }) {
  const [callOpen, setCallOpen] = useState(false);
  const [pxOpen, setPxOpen] = useState(false);
  const [contact, setContact] = useState<ContactChannel | null>(null);
  if (buyer) {
    // The stacked, full-width buttons of a vansales advert: Enquire, WhatsApp and Text me (vansales' own number, quoting the reference), Call and Book a call (the dealer's, when offered), Part exchange, Share, Save.
    const message = `Hi, I'm interested in ${buyer.label} — is it still available? Ref: VS-${buyer.listingId}`;
    const number = VANSALES_CONTACT_NUMBER;
    return (
      <>
        <div className="grid grid-cols-1 gap-2" data-testid="listing-actions">
          <button type="button" disabled={sold} onClick={() => window.dispatchEvent(new Event(OPEN_ENQUIRY_EVENT))} className={`${btn} bg-accent-500 text-white hover:brightness-105 focus-visible:ring-accent-500 disabled:opacity-50`}>
            <IconMessage width={16} height={16} aria-hidden />
            Enquire
          </button>
          <a href={`https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" aria-disabled={sold} className={`${btn} bg-[#25D366] text-white hover:bg-[#1ebe5d] focus-visible:ring-[#25D366] ${sold ? "pointer-events-none opacity-50" : ""}`}>
            <IconWhatsApp width={16} height={16} aria-hidden />
            WhatsApp
          </a>
          <a href={`sms:${number}?&body=${encodeURIComponent(message)}`} aria-disabled={sold} className={`${btn} bg-[#0a84ff] text-white hover:brightness-110 focus-visible:ring-[#0a84ff] ${sold ? "pointer-events-none opacity-50" : ""}`}>
            <IconMessage width={16} height={16} aria-hidden />
            Text me
          </a>
          {links.call && (
            <button type="button" disabled={sold} onClick={() => setContact("call")} className={`${btn} ${secondary} disabled:opacity-50`}>
              <IconPhone width={16} height={16} aria-hidden />
              Call
            </button>
          )}
          {links.bookCall && (
            <button type="button" onClick={() => setCallOpen(true)} className={`${btn} ${secondary}`}>
              <IconPhone width={16} height={16} aria-hidden />
              Book a call
            </button>
          )}
          {buyer.partExchange && (
            <button type="button" disabled={sold} onClick={() => setPxOpen(true)} className={`${btn} ${secondary} disabled:opacity-50`}>
              Part exchange
            </button>
          )}
          <ShareButton url={buyer.shareUrl} title={buyer.shareTitle} />
          <SaveRowButton id={buyer.listingId} />
        </div>
        {links.call && <ContactModal listingId={links.call.listingId} dealerName={links.call.dealerName} label={links.call.label} channel="call" open={contact !== null} onClose={() => setContact(null)} />}
        {links.bookCall && <BookCallModal listingId={links.bookCall.listingId} dealerName={links.bookCall.dealerName} open={callOpen} onClose={() => setCallOpen(false)} />}
        {buyer.partExchange && <ListingPxModal listingId={buyer.listingId} open={pxOpen} onClose={() => setPxOpen(false)} />}
      </>
    );
  }
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
        {links.whatsapp && (
          <button type="button" disabled={sold} onClick={() => setContact("whatsapp")} className={`${btn} bg-[#25D366] text-white hover:bg-[#1ebe5d] focus-visible:ring-[#25D366] disabled:opacity-50`}>
            <IconWhatsApp width={16} height={16} aria-hidden />
            WhatsApp
          </button>
        )}
        {links.call && (
          <button type="button" disabled={sold} onClick={() => setContact("call")} className={`${btn} border border-border bg-white text-ink-800 hover:border-ink-400 hover:bg-surface-1 focus-visible:ring-brand-500 disabled:opacity-50`}>
            <IconPhone width={16} height={16} aria-hidden />
            Call
          </button>
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
      {(links.whatsapp || links.call) && (
        <ContactModal listingId={(links.whatsapp ?? links.call)!.listingId} dealerName={(links.whatsapp ?? links.call)!.dealerName} label={(links.whatsapp ?? links.call)!.label} channel={contact ?? "whatsapp"} open={contact !== null} onClose={() => setContact(null)} />
      )}
      {links.bookCall && (
        <BookCallModal listingId={links.bookCall.listingId} dealerName={links.bookCall.dealerName} open={callOpen} onClose={() => setCallOpen(false)} />
      )}
    </>
  );
}
