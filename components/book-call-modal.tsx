"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "./ui";
import { IconCheck, IconX } from "./icons";
import { Field, inputCls } from "./enquiry-fields";

/** The vansales API's public host (the browser posts to it directly, like the private enquiry form, so the API rate-limits the buyer's own address). */
const API = (process.env.NEXT_PUBLIC_VANSALES_API_URL || "https://api.vansales.com").replace(/\/$/, "");

type State = "idle" | "submitting" | "success" | "error";

/**
 * "Book a call" for a dealer-portal advert: POST {API}/api/public/listings/{id}/book-call {name, phone, email?, preferred_time?}.
 * Built on the native <dialog> opened with showModal(), so the browser traps focus inside it, makes the page behind it inert, closes on Esc and
 * hands focus back to the button that opened it. The `website` input is a honeypot, invisible to people.
 */
export function BookCallModal({ listingId, dealerName, open, onClose }: { listingId: string; dealerName: string; open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  function close() {
    onClose();
    // let the success message go once it is dismissed, so reopening shows a fresh form
    setState((s) => (s === "success" ? "idle" : s));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "submitting") return;
    const fd = new FormData(e.currentTarget);
    setState("submitting");
    setError("");
    try {
      const res = await fetch(`${API}/api/public/listings/${encodeURIComponent(listingId)}/book-call`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: String(fd.get("name") ?? "").trim(),
          phone: String(fd.get("phone") ?? "").trim(),
          email: String(fd.get("email") ?? "").trim() || null,
          preferred_time: String(fd.get("preferred_time") ?? "").trim() || null,
          website: fd.get("website"), // honeypot
        }),
      });
      if (res.status === 201 || res.status === 200) { setState("success"); return; }
      const body = (await res.json().catch(() => ({}))) as { message?: string; errors?: Record<string, string[]> };
      setError(
        res.status === 422 ? (Object.values(body.errors ?? {})[0]?.[0] ?? body.message ?? "Please check your details and try again.")
        : res.status === 429 ? "You have sent a few requests already. Please try again in an hour."
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
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={() => { if (open) close(); }}
      onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-[var(--radius-xl)] border border-border bg-card p-0 text-ink-800 shadow-[var(--shadow-lg)] backdrop:bg-ink-900/60"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="font-display text-[length:var(--text-lg)] font-bold text-ink-900">Book a call</h2>
            <p className="mt-1 text-[length:var(--text-sm)] text-ink-500">{dealerName} will call you back about this van.</p>
          </div>
          <button type="button" onClick={() => ref.current?.close()} aria-label="Close" className="grid size-9 shrink-0 place-items-center rounded-[var(--radius-md)] text-ink-500 hover:bg-surface-1 hover:text-ink-900">
            <IconX width={18} height={18} aria-hidden />
          </button>
        </div>

        {state === "success" ? (
          <div className="mt-4">
            <div role="status" className="flex items-start gap-3 rounded-[var(--radius-md)] bg-success-tint p-4">
              <IconCheck width={20} height={20} className="mt-0.5 shrink-0 text-success-600" />
              <div>
                <p className="font-semibold text-success-600">Request sent.</p>
                <p className="mt-1 text-[length:var(--text-sm)] text-ink-600">{dealerName} will call you back.</p>
              </div>
            </div>
            <Button type="button" variant="primary" size="lg" className="mt-4 w-full" onClick={() => ref.current?.close()}>Done</Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            {/* Honeypot: invisible to real users */}
            <input type="text" name="website" tabIndex={-1} aria-hidden="true" autoComplete="off" className="sr-only" />

            <Field label="Your name" required>
              <input type="text" name="name" required minLength={2} maxLength={120} autoComplete="name" placeholder="Jane Smith" className={inputCls} />
            </Field>
            <Field label="Phone number" required>
              <input type="tel" name="phone" required maxLength={30} pattern="[0-9+()\s.\-]{6,30}" title="A phone number, e.g. 07700 900 000" autoComplete="tel" placeholder="07700 900 000" className={inputCls} />
            </Field>
            <Field label="Email address (optional)">
              <input type="email" name="email" maxLength={255} autoComplete="email" placeholder="you@example.com" className={inputCls} />
            </Field>
            <Field label="Best time to call (optional)">
              <input type="text" name="preferred_time" maxLength={120} placeholder="e.g. weekdays after 5pm" className={inputCls} />
            </Field>

            {state === "error" && (
              <p role="alert" className="rounded-[var(--radius-md)] bg-sold-tint px-3 py-2.5 text-[length:var(--text-sm)] font-medium text-sold-600">{error}</p>
            )}

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={state === "submitting"}>
              {state === "submitting" ? "Sending…" : "Request a call back"}
            </Button>
            <p className="text-center text-[length:var(--text-xs)] text-ink-400">Your details go only to {dealerName}.</p>
          </form>
        )}
      </div>
    </dialog>
  );
}
