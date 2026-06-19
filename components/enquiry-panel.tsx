"use client";

import { useState, type ReactNode } from "react";
import type { Listing } from "@/lib/listings/types";
import { Button } from "./ui";
import { IconCheck, IconShield, IconStar, IconArrow } from "./icons";

type FormState = "idle" | "open" | "submitting" | "success" | "error";

const PHONE_DISPLAY = "01656 507619";
const PHONE_TEL = "tel:+441656507619";

export function EnquiryPanel({ listing }: { listing: Listing }) {
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const sold = listing.status === "sold";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "submitting") return;
    setState("submitting");

    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          message: fd.get("message"),
          website: fd.get("website"), // honeypot
          make: listing.make,
          model: listing.model,
          derivative: listing.derivative,
          slug: listing.slug,
          location: `${listing.location.town}, ${listing.location.region}`,
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok) {
        setState("success");
      } else {
        setErrorMsg(data.error ?? "Something went wrong — please try again.");
        setState("error");
      }
    } catch {
      setErrorMsg("Network error — please call us directly.");
      setState("error");
    }
  }

  return (
    <div className="rounded-[var(--radius-xl)] border border-border bg-card p-5 shadow-[var(--shadow-sm)]">
      {/* Seller */}
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-md)] bg-ink-900 font-display text-[var(--text-lg)] font-bold text-white">
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

      {/* Phone CTA — always visible */}
      <a
        href={PHONE_TEL}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-success-500/30 bg-success-tint px-4 py-3 text-[var(--text-base)] font-bold text-success-600 transition-colors hover:bg-success-500 hover:text-white"
      >
        <PhoneIcon />
        <span>{PHONE_DISPLAY}</span>
        <span className="text-[var(--text-sm)] font-normal opacity-75">· Request callback</span>
      </a>

      {/* Divider */}
      <div className="relative my-4 flex items-center gap-3">
        <div className="flex-1 border-t border-border" />
        <span className="text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-ink-400">
          or enquire online
        </span>
        <div className="flex-1 border-t border-border" />
      </div>

      {/* Success */}
      {state === "success" ? (
        <div className="flex items-start gap-3 rounded-[var(--radius-md)] bg-success-tint p-4">
          <IconCheck width={20} height={20} className="mt-0.5 shrink-0 text-success-600" />
          <div>
            <p className="font-semibold text-success-600">Enquiry sent!</p>
            <p className="mt-1 text-[var(--text-sm)] text-ink-600">
              {listing.seller.name} has your details and will be in touch shortly. For a faster
              reply, call <a href={PHONE_TEL} className="font-bold text-ink-800 underline">{PHONE_DISPLAY}</a>.
            </p>
          </div>
        </div>
      ) : state === "idle" ? (
        /* Idle — show expand button */
        <Button
          onClick={() => setState("open")}
          variant="primary"
          size="lg"
          className="w-full"
          disabled={sold}
        >
          {sold ? "Now sold" : (
            <><span>Enquire about this van</span><IconArrow width={16} height={16} /></>
          )}
        </Button>
      ) : (
        /* Open / submitting / error — show form */
        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          {/* Honeypot: invisible to real users */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            aria-hidden="true"
            autoComplete="off"
            className="sr-only"
          />

          <Field label="Your name" required>
            <input
              type="text"
              name="name"
              required
              autoComplete="name"
              placeholder="Jane Smith"
              className={inputCls}
            />
          </Field>

          <Field label="Phone number" required>
            <input
              type="tel"
              name="phone"
              required
              autoComplete="tel"
              placeholder="07700 900 000"
              className={inputCls}
            />
          </Field>

          <Field label="Email address" required>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className={inputCls}
            />
          </Field>

          <Field label="Message (optional)">
            <textarea
              name="message"
              rows={3}
              defaultValue={`Hi, I'm interested in the ${listing.make} ${listing.model}. Is it still available?`}
              className={inputCls + " h-auto py-2.5"}
            />
          </Field>

          {state === "error" && (
            <p className="rounded-[var(--radius-md)] bg-sold-tint px-3 py-2.5 text-[var(--text-sm)] font-medium text-sold-600">
              {errorMsg}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={state === "submitting"}
          >
            {state === "submitting" ? "Sending…" : "Send enquiry"}
          </Button>

          <p className="text-center text-[var(--text-xs)] text-ink-400">
            Your details go only to {listing.seller.name}. No spam, ever.
          </p>
        </form>
      )}
    </div>
  );
}

const inputCls =
  "h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[var(--text-base)] text-ink-800 outline-none transition-colors focus-visible:border-accent-500 focus-visible:ring-2 focus-visible:ring-accent-500/20";

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[var(--text-2xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-ink-500">
        {label}
        {required && <span className="ml-0.5 text-sold-600" aria-hidden>*</span>}
      </span>
      {children}
    </label>
  );
}

function PhoneIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.1-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.5c.9.3 1.8.6 2.8.7a2 2 0 011.7 2z" />
    </svg>
  );
}
