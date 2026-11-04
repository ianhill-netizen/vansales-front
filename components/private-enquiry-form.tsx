"use client";

import { useState } from "react";
import type { Listing } from "@/lib/listings/types";
import { Button } from "./ui";
import { IconCheck } from "./icons";
import { Field, inputCls } from "./enquiry-fields";

/** The vansales API's public host. Public on purpose: the browser posts to it directly, so the API sees the buyer's own address for its rate limit (5 messages an hour). */
const API = (process.env.NEXT_PUBLIC_VANSALES_API_URL || "https://api.vansales.com").replace(/\/$/, "");

type State = "idle" | "submitting" | "success" | "error";

/**
 * "Message the seller" for a private seller's advert. POST {API}/api/public/listings/{id}/enquire: the API stores it and emails the seller (Reply-To is the buyer), and tells the
 * buyer nothing about the seller. The `website` input is a honeypot: invisible to people, so a bot that fills it is ignored.
 */
export function PrivateEnquiryForm({ listing }: { listing: Listing }) {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "submitting") return;
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    setState("submitting");
    setError("");
    try {
      const res = await fetch(`${API}/api/public/listings/${encodeURIComponent(listing.source_id)}/enquire`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          buyer_name: String(fd.get("name") ?? "").trim(),
          buyer_email: email,
          buyer_phone: String(fd.get("phone") ?? "").trim() || null,
          message: String(fd.get("message") ?? "").trim(),
          website: fd.get("website"), // honeypot
        }),
      });
      if (res.status === 201) { setSentTo(email); setState("success"); return; }
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
        <span className="text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-ink-400">message the seller</span>
        <div className="flex-1 border-t border-border" />
      </div>

      {state === "success" ? (
        <div role="status" className="flex items-start gap-3 rounded-[var(--radius-md)] bg-success-tint p-4">
          <IconCheck width={20} height={20} className="mt-0.5 shrink-0 text-success-600" />
          <div>
            <p className="font-semibold text-success-600">Sent — the seller will get back to you.</p>
            <p className="mt-1 text-[var(--text-sm)] text-ink-600">They will reply to <span className="font-semibold text-ink-800">{sentTo}</span>, so keep an eye on your inbox (and spam).</p>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3" noValidate={false}>
          {/* Honeypot: invisible to real users */}
          <input type="text" name="website" tabIndex={-1} aria-hidden="true" autoComplete="off" className="sr-only" />

          <Field label="Your name" required>
            <input type="text" name="name" required minLength={2} maxLength={120} autoComplete="name" placeholder="Jane Smith" className={inputCls} />
          </Field>
          <Field label="Email address" required>
            <input type="email" name="email" required autoComplete="email" placeholder="you@example.com" className={inputCls} />
          </Field>
          <Field label="Phone number (optional)">
            <input type="tel" name="phone" autoComplete="tel" placeholder="07700 900 000" maxLength={30} className={inputCls} />
          </Field>
          <Field label="Message" required>
            <textarea
              name="message" rows={4} required minLength={5} maxLength={2000}
              defaultValue={`Hi, I'm interested in the ${listing.make} ${listing.model}. Is it still available?`}
              className={inputCls + " h-auto py-2.5"}
            />
          </Field>

          {state === "error" && (
            <p role="alert" className="rounded-[var(--radius-md)] bg-sold-tint px-3 py-2.5 text-[var(--text-sm)] font-medium text-sold-600">{error}</p>
          )}

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={state === "submitting"}>
            {state === "submitting" ? "Sending…" : "Send message"}
          </Button>
          <p className="text-center text-[var(--text-xs)] text-ink-400">
            Your name, email and phone number are sent to the seller so they can reply. Never agree to pay a deposit before you have seen the van.
          </p>
        </form>
      )}
    </>
  );
}
