"use client";

import { useState } from "react";
import type { DealerConfig } from "@/lib/dealers/config";
import { whatsappUrl } from "@/lib/dealers/config";
import { EnquiryModal } from "./enquiry-modal";
import { IconWhatsApp, IconMessage, IconPhone } from "./icons";

export function DealerCTAButtons({
  dealer,
  compact = false,
}: {
  dealer: Pick<DealerConfig, "name" | "phone" | "whatsapp" | "dealskiTenant">;
  compact?: boolean;
}) {
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const waUrl = whatsappUrl(
    dealer.whatsapp,
    `Hi, I'm enquiring via Vansales about ${dealer.name}.`,
  );
  const telHref = `tel:${dealer.phone.replace(/[^\d+]/g, "")}`;
  const btnBase = compact
    ? "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] px-4 py-2.5 text-[var(--text-sm)] font-semibold transition-colors"
    : "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] h-12 px-5 text-[var(--text-base)] font-semibold transition-colors";

  return (
    <>
      <div className={`flex flex-wrap gap-3 ${compact ? "" : "w-full"}`}>
        {waUrl ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btnBase} bg-[#25D366] text-white hover:bg-[#1ebe5d] ${compact ? "" : "flex-1 sm:flex-none"}`}
          >
            <IconWhatsApp width={18} height={18} />
            WhatsApp
          </a>
        ) : (
          /* WhatsApp number not yet configured — show disabled state */
          <span
            title="WhatsApp number not yet configured"
            className={`${btnBase} cursor-not-allowed bg-[#25D366]/40 text-white ${compact ? "" : "flex-1 sm:flex-none"}`}
          >
            <IconWhatsApp width={18} height={18} />
            WhatsApp
          </span>
        )}

        <button
          type="button"
          onClick={() => setEnquiryOpen(true)}
          className={`${btnBase} bg-brand-500 text-white hover:bg-brand-600 ${compact ? "" : "flex-1 sm:flex-none"}`}
        >
          <IconMessage width={18} height={18} />
          Message
        </button>

        <a
          href={telHref}
          className={`${btnBase} border border-border bg-white text-ink-800 hover:border-ink-400 hover:bg-surface-1 ${compact ? "" : "flex-1 sm:flex-none"}`}
        >
          <IconPhone width={18} height={18} />
          {compact ? "Call" : dealer.phone}
        </a>
      </div>

      {enquiryOpen && (
        <EnquiryModal
          dealerName={dealer.name}
          dealskiTenant={dealer.dealskiTenant}
          onClose={() => setEnquiryOpen(false)}
        />
      )}
    </>
  );
}
