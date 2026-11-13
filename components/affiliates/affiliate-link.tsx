"use client";

/** The outbound link of <AffiliateCta>: sponsored, nofollow, noopener, and a GA4 `affiliate_click` event on click. */
export function AffiliateLink({ href, label, slot, page }: { href: string; label: string; slot: string; page: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored nofollow noopener"
      onClick={() => {
        try {
          const w = window as unknown as { gtag?: (...a: unknown[]) => void; dataLayer?: unknown[] };
          if (typeof w.gtag === "function") w.gtag("event", "affiliate_click", { slot, page });
          else (w.dataLayer = w.dataLayer || []).push({ event: "affiliate_click", slot, page });
        } catch { /* analytics must never block the click */ }
      }}
      className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-brand-500/40 bg-brand-tint px-5 py-2.5 text-[length:var(--text-sm)] font-semibold text-brand-700 transition-colors hover:bg-brand-500 hover:text-white"
    >
      {label}
    </a>
  );
}
