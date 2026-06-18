"use client";

import { useState } from "react";
import type { Listing } from "@/lib/listings/types";
import { Button } from "./ui";
import { IconCheck, IconShield, IconStar } from "./icons";

/* Enquiry CTA — stub only. No network submit; on send it shows an inline
   confirmation so the flow is demonstrable without a backend. */
export function EnquiryPanel({ listing }: { listing: Listing }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const sold = listing.status === "sold";

  return (
    <div className="rounded-[var(--radius-xl)] border border-border bg-card p-5 shadow-[var(--shadow-sm)]">
      {/* Seller */}
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-[var(--radius-md)] bg-ink-900 font-display text-[var(--text-lg)] font-bold text-white">
          {listing.seller.name.slice(0, 1)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-[var(--text-base)] font-bold text-ink-900">
            {listing.seller.name}
          </p>
          <p className="flex items-center gap-1.5 text-[var(--text-sm)] text-ink-500">
            {listing.seller_type === "dealer" ? "Trusted dealer" : "Private seller"}
            {listing.seller.rating != null && (
              <span className="inline-flex items-center gap-0.5 text-ink-700">
                <IconStar width={13} height={13} className="text-accent-500" />
                {listing.seller.rating.toFixed(1)}
              </span>
            )}
          </p>
        </div>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-[var(--text-sm)] text-ink-500">
        <IconShield width={15} height={15} className="text-brand-600" />
        {listing.location.town}, {listing.location.region}
      </p>

      {sent ? (
        <div className="mt-4 flex items-start gap-2.5 rounded-[var(--radius-md)] bg-success-tint p-3.5 text-success-600">
          <IconCheck width={18} height={18} className="mt-0.5 shrink-0" />
          <p className="text-[var(--text-sm)] font-medium">
            Enquiry ready to send. This is a demo, so nothing leaves your browser — but in
            production this would reach {listing.seller.name} with reference{" "}
            <span className="font-mono">{listing.enquiry_route.ref}</span>.
          </p>
        </div>
      ) : !open ? (
        <div className="mt-4 space-y-2.5">
          <Button onClick={() => setOpen(true)} variant="primary" size="lg" className="w-full" disabled={sold}>
            {sold ? "Now sold" : "Enquire about this van"}
          </Button>
          <Button href="tel:+440000000000" variant="outline" size="lg" className="w-full">
            Call the seller
          </Button>
          <p className="text-center text-[var(--text-xs)] text-ink-400">
            Usually replies within a few hours
          </p>
        </div>
      ) : (
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          {["Your name", "Email", "Phone (optional)"].map((label, i) => (
            <label key={label} className="block">
              <span className="mb-1 block text-[var(--text-2xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-ink-500">
                {label}
              </span>
              <input
                type={i === 1 ? "email" : i === 2 ? "tel" : "text"}
                required={i < 2}
                className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[var(--text-base)] text-ink-800 outline-none focus-visible:border-accent-500"
              />
            </label>
          ))}
          <label className="block">
            <span className="mb-1 block text-[var(--text-2xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-ink-500">
              Message
            </span>
            <textarea
              rows={3}
              defaultValue={`Hi, is the ${listing.make} ${listing.model} still available?`}
              className="w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 py-2 text-[var(--text-base)] text-ink-800 outline-none focus-visible:border-accent-500"
            />
          </label>
          <Button type="submit" variant="primary" size="lg" className="w-full">
            Send enquiry
          </Button>
        </form>
      )}
    </div>
  );
}
