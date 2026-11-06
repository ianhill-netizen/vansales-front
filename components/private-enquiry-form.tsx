"use client";

import { useState } from "react";
import type { Listing } from "@/lib/listings/types";
import { Button } from "./ui";
import { IconCheck } from "./icons";
import { Field, inputCls } from "./enquiry-fields";
import { PxFields } from "./px/px-fields";

/** The vansales API's public host. Public on purpose: the browser posts to it directly, so the API sees the buyer's own address for its rate limit (5 messages an hour). */
const API = (process.env.NEXT_PUBLIC_VANSALES_API_URL || "https://api.vansales.com").replace(/\/$/, "");

/** 40px inputs; the label (see Field) is 12px. */
const compact = inputCls.replace("h-11", "h-10");

type State = "idle" | "submitting" | "success" | "error";

/**
 * "Message the seller" for a private seller's advert. POST {API}/api/public/listings/{id}/enquire: the API stores it and emails the seller (Reply-To is the buyer), and tells the
 * buyer nothing about the seller. The `website` input is a honeypot: invisible to people, so a bot that fills it is ignored.
 */
export function PrivateEnquiryForm({ listing }: { listing: Listing }) {
  const dealer = listing.dealer_contact; // a dealer portal advert: same endpoint, the enquiry lands in that dealer's portal inbox
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [leadRef, setLeadRef] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "submitting") return;
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    setState("submitting");
    setError("");
    const px: { px_reg?: string; px_mileage?: number } = !fd.get("px_reg") || !fd.get("px_mileage") ? {} : { px_reg: String(fd.get("px_reg")).trim().toUpperCase(), px_mileage: Number(fd.get("px_mileage")) };
    try {
      const res = await fetch(`${API}/api/public/listings/${encodeURIComponent(listing.source_id)}/enquire`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          first_name: String(fd.get("first_name") ?? "").trim(),
          last_name: String(fd.get("last_name") ?? "").trim(),
          company: String(fd.get("company") ?? "").trim() || null,
          mobile: String(fd.get("mobile") ?? "").trim() || null,
          email,
          message: String(fd.get("message") ?? "").trim(),
          website: fd.get("website"), // honeypot
          ...px, // optional part exchange: the reg and mileage only; the server looks the figure up itself
        }),
      });
      if (res.status === 201) { const b = (await res.json().catch(() => ({}))) as { ref?: string | null }; setLeadRef(b.ref ?? null); setSentTo(email); setState("success"); return; }
      const body = (await res.json().catch(() => ({}))) as { message?: string; errors?: Record<string, string[]> };
      setError(
        res.status === 422 ? (Object.values(body.errors ?? {})[0]?.[0] ?? "Please check your details and try again.")
        : res.status === 429 ? "You have sent a few messages already. Please try again in an hour."
        : res.status === 404 ? "Sorry, this advert is no longer available."
        : "Something went wrong. Please try again.",
      );
      setState("error");
    } catch {
      setError("We could not reach the server. Please check your connection and try again.");
      setState("error");
    }
  }

  return (
    <>
      <div className="relative my-4 flex items-center gap-3">
        <div className="flex-1 border-t border-border" />
        <span className="text-[length:var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-ink-400">{dealer ? "message the dealer" : "message the seller"}</span>
        <div className="flex-1 border-t border-border" />
      </div>

      {state === "success" ? (
        <div role="status" className="flex items-start gap-3 rounded-[var(--radius-md)] bg-success-tint p-4">
          <IconCheck width={20} height={20} className="mt-0.5 shrink-0 text-success-600" />
          <div>
            <p className="font-semibold text-success-600">Sent — {dealer ? dealer.name : "the seller"} will get back to you.</p>
            <p className="mt-1 text-[length:var(--text-sm)] text-ink-600">They will reply to <span className="font-semibold text-ink-800">{sentTo}</span>, so keep an eye on your inbox (and spam).{leadRef ? <> Your reference is <span className="font-semibold text-ink-800">{leadRef}</span>.</> : null}</p>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate={false}>
          {/* Honeypot: invisible to real users */}
          <input type="text" name="website" tabIndex={-1} aria-hidden="true" autoComplete="off" className="sr-only" />

          <div className="grid grid-cols-2 gap-4">
            <Field compact label="First name" required>
              <input type="text" name="first_name" required maxLength={60} autoComplete="given-name" className={compact} />
            </Field>
            <Field compact label="Last name" required>
              <input type="text" name="last_name" required maxLength={60} autoComplete="family-name" className={compact} />
            </Field>
          </div>
          <Field compact label="Company (optional)">
            <input type="text" name="company" maxLength={120} autoComplete="organization" className={compact} />
          </Field>
          <Field compact label="Mobile" required>
            <input type="tel" name="mobile" required inputMode="tel" autoComplete="tel" placeholder="07700 900000" maxLength={30} className={compact} />
          </Field>
          <Field compact label="Email" required>
            <input type="email" name="email" required autoComplete="email" placeholder="you@example.com" className={compact} />
          </Field>
          <Field compact label="Message" required>
            <textarea
              name="message" rows={3} required minLength={5} maxLength={2000}
              defaultValue={`Hi, I'm interested in the ${listing.make} ${listing.model}. Is it still available?`}
              className={compact + " h-auto py-2"}
            />
          </Field>

          {/* Part exchange is a dealer thing: not offered on a private seller's advert */}
          {listing.seller_type !== "private" && <PxFields />}

          {state === "error" && (
            <p role="alert" className="rounded-[var(--radius-md)] bg-sold-tint px-3 py-2.5 text-[length:var(--text-sm)] font-medium text-sold-600">{error}</p>
          )}

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={state === "submitting"}>
            {state === "submitting" ? "Sending…" : "Send to dealer"}
          </Button>
          <p className="text-center text-[length:var(--text-xs)] text-ink-500">We&apos;ll email you a link to track this enquiry.</p>
        </form>
      )}
    </>
  );
}
