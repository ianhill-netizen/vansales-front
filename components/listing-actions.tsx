"use client";

import { useEffect, useRef, useState } from "react";
import type { ListingActionLinks } from "@/lib/dealers/actions";
import { BookCallModal } from "./book-call-modal";
import { TestDriveModal } from "./test-drive-modal";
import { ContactModal, type ContactChannel } from "./contact-modal";
import { IconWhatsApp, IconMessage, IconPhone, IconExternalLink, IconHeart } from "./icons";
import { ListingPxModal } from "./px/listing-px-modal";
import { useSaved } from "@/lib/saved";

/** Fired by the Enquire button; components/enquiry-panel.tsx opens its form and focuses it. */
export const OPEN_ENQUIRY_EVENT = "vansales:open-enquiry";

const btn = "flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] px-3 text-[length:var(--text-sm)] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

/** Vansales' own WhatsApp / SMS number: buyers on a vansales advert message this one (quoting VS-{id}) instead of the dealer. */
export const VANSALES_CONTACT_NUMBER = "+447463580222";   // WhatsApp (Meta Cloud API number)
/** Vansales' Twilio number: calls are forwarded to the dealer through it, and texts to it land on the lead. */
export const VANSALES_SMS_NUMBER = "+447366906777";

/** What the stacked buyer buttons need: the advert id (the "VS-" reference), its plain-English label ("AB12CDE Ford Transit"), its page URL, and whether a part-exchange valuation is on offer (dealer adverts). */
export interface BuyerActions { listingId: string; label: string; shareUrl: string; shareTitle: string; partExchange: boolean; /** Swiss Vans stock only: allows the generic /hire-purchase-vans finance fallback. */ swissFinance?: boolean }

const pill = "inline-flex h-9 items-center justify-center gap-1.5 rounded-[var(--radius-pill)] border border-border bg-card px-3.5 text-[length:var(--text-sm)] font-semibold text-ink-800 transition-colors hover:border-ink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50";

const secondary = "border border-border bg-white text-ink-800 hover:border-ink-400 hover:bg-surface-1 focus-visible:ring-brand-500";

function IconShare(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7" /><path d="M16 6l-4-4-4 4" /><path d="M12 2v13" /></svg>;
}

/** Share: the native share sheet on a phone, copy-the-link on a desktop. */
function ShareButton({ url, title, pill: asPill = false }: { url: string; title: string; pill?: boolean }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const touch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
    if (touch && typeof navigator.share === "function") {
      try { await navigator.share({ title, url }); return; } catch (e) { if ((e as Error).name === "AbortError") return; }
    }
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { window.prompt("Copy this link", url); }
  }
  return (
    <button type="button" onClick={() => void share()} className={asPill ? pill : `${btn} ${secondary}`}>
      <IconShare width={16} height={16} aria-hidden />
      <span aria-live="polite">{copied ? "Link copied" : "Share"}</span>
    </button>
  );
}

/** Save: the same browser-only saved list as the heart in the header (lib/saved.ts), no login. */
function SaveRowButton({ id, pill: asPill = false }: { id: string; pill?: boolean }) {
  const { has, toggle, ready } = useSaved();
  const saved = ready && has(id);
  return (
    <button type="button" aria-pressed={saved} onClick={() => toggle(id)} className={asPill ? pill : `${btn} ${secondary}`}>
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
  const [tdOpen, setTdOpen] = useState(false);
  const [contact, setContact] = useState<ContactChannel | null>(null);
  // Mobile: once the Enquire + WhatsApp row has scrolled off the top, the same two buttons stick to the bottom of the screen.
  const primaryRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const el = primaryRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setStuck(!!e && !e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Vansales adverts message vansales' own numbers (quoting VS-{id}); config / Dealski dealers open the logged-lead contact modal.
  const message = buyer ? `Hi, I'm interested in ${buyer.label} — is it still available? Ref: VS-${buyer.listingId}` : "";
  const hasWhatsapp = !!buyer || !!links.whatsapp;
  const enquire = showEnquire && (
    <button type="button" disabled={sold} onClick={() => window.dispatchEvent(new Event(OPEN_ENQUIRY_EVENT))} className={`${btn} ${hasWhatsapp ? "" : "col-span-2"} bg-accent-500 text-white hover:brightness-105 focus-visible:ring-accent-500 disabled:opacity-50`}>
      <IconMessage width={16} height={16} aria-hidden />
      Enquire
    </button>
  );
  const whatsapp = buyer ? (
    <a href={`https://wa.me/${VANSALES_CONTACT_NUMBER.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" aria-disabled={sold} className={`${btn} bg-[#25D366] text-white hover:bg-[#1ebe5d] focus-visible:ring-[#25D366] ${sold ? "pointer-events-none opacity-50" : ""}`}>
      <IconWhatsApp width={16} height={16} aria-hidden />
      WhatsApp
    </a>
  ) : links.whatsapp ? (
    <button type="button" disabled={sold} onClick={() => setContact("whatsapp")} className={`${btn} bg-[#25D366] text-white hover:bg-[#1ebe5d] focus-visible:ring-[#25D366] disabled:opacity-50`}>
      <IconWhatsApp width={16} height={16} aria-hidden />
      WhatsApp
    </button>
  ) : null;
  const financeHref = links.financeHref ?? (buyer?.swissFinance ? "/hire-purchase-vans" : null);   // the generic finance page is Swiss Vans stock only

  return (
    <>
      <div className="space-y-2.5" data-testid="listing-actions">
        <div ref={primaryRef} className="grid grid-cols-2 gap-2">{enquire}{whatsapp}</div>
        <div className="flex flex-wrap gap-2">
          {buyer && (
            <a href={`sms:${VANSALES_SMS_NUMBER}?&body=${encodeURIComponent(message)}`} aria-disabled={sold} className={`${pill} ${sold ? "pointer-events-none opacity-50" : ""}`}>
              <IconMessage width={14} height={14} aria-hidden />
              Text me
            </a>
          )}
          {links.call && (
            <button type="button" disabled={sold} onClick={() => setContact("call")} className={pill}>
              <IconPhone width={14} height={14} aria-hidden />
              Call
            </button>
          )}
          {links.bookCall && (
            <button type="button" onClick={() => setCallOpen(true)} className={pill}>
              <IconPhone width={14} height={14} aria-hidden />
              Book a call
            </button>
          )}
          {buyer && links.bookCall && (
            <button type="button" disabled={sold} onClick={() => setTdOpen(true)} className={pill}>
              Book a test drive
            </button>
          )}
          {financeHref && (
            <a href={financeHref} {...(links.financeHref ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={pill}>
              Apply for finance
              {links.financeHref && <IconExternalLink width={12} height={12} aria-hidden />}
            </a>
          )}
          {buyer?.partExchange && (
            <button type="button" disabled={sold} onClick={() => setPxOpen(true)} className={pill}>
              Part exchange
            </button>
          )}
          {buyer && <ShareButton url={buyer.shareUrl} title={buyer.shareTitle} pill />}
          {buyer && <SaveRowButton id={buyer.listingId} pill />}
        </div>
      </div>
      {/* Sticky bar (phones): the primary pair again, same handlers */}
      {stuck && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden" data-testid="listing-sticky-bar">
          <div className="mx-auto grid max-w-xl grid-cols-2 gap-2">{enquire}{whatsapp}</div>
        </div>
      )}
      {buyer ? (
        <>
          {links.call && <ContactModal listingId={links.call.listingId} dealerName={links.call.dealerName} label={links.call.label} channel="call" callIntent open={contact !== null} onClose={() => setContact(null)} />}
          {links.bookCall && <BookCallModal listingId={links.bookCall.listingId} dealerName={links.bookCall.dealerName} open={callOpen} onClose={() => setCallOpen(false)} />}
          {links.bookCall && <TestDriveModal listingId={links.bookCall.listingId} dealerName={links.bookCall.dealerName} open={tdOpen} onClose={() => setTdOpen(false)} />}
          {buyer.partExchange && <ListingPxModal listingId={buyer.listingId} open={pxOpen} onClose={() => setPxOpen(false)} />}
        </>
      ) : (
        <>
          {(links.whatsapp || links.call) && (
            <ContactModal listingId={(links.whatsapp ?? links.call)!.listingId} dealerName={(links.whatsapp ?? links.call)!.dealerName} label={(links.whatsapp ?? links.call)!.label} channel={contact ?? "whatsapp"} open={contact !== null} onClose={() => setContact(null)} />
          )}
          {links.bookCall && <BookCallModal listingId={links.bookCall.listingId} dealerName={links.bookCall.dealerName} open={callOpen} onClose={() => setCallOpen(false)} />}
        </>
      )}
    </>
  );
}
