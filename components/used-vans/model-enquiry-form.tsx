"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { IconCheck } from "@/components/icons";
import { Field, inputCls } from "@/components/enquiry-fields";

type State = "idle" | "submitting" | "success" | "error";

/**
 * "Tell us what you're looking for" on a /used-vans page. Posts to the site's existing /api/register-interest (rate limited, honeypot, forwarded to Dealski leads) with the page it came from,
 * so a lead says which model it was about. Reuses the shared Field / inputCls / Button building blocks of the listing enquiry forms.
 */
export function ModelEnquiryForm({ vehicle, path }: { vehicle: string; path: string }) {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "submitting") return;
    const fd = new FormData(e.currentTarget);
    setState("submitting");
    setError("");
    try {
      const res = await fetch("/api/register-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(fd.get("name") ?? "").trim(),
          email: String(fd.get("email") ?? "").trim(),
          enquiry_type: String(fd.get("enquiry_type") ?? ""),
          message: String(fd.get("message") ?? "").trim(),
          website: String(fd.get("website") ?? ""),
          context: `Looking for a ${vehicle}`,
          page_path: path,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (data.ok) setState("success");
      else {
        setError(data.error ?? "Something went wrong.");
        setState("error");
      }
    } catch {
      setError("Network error. Please try again in a moment.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-border bg-surface-1 p-5">
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-500">
          <IconCheck width={14} height={14} className="text-ink-900" />
        </span>
        <div>
          <p className="font-display font-bold text-ink-900">Thanks, we have your enquiry.</p>
          <p className="mt-1 text-[length:var(--text-sm)] text-ink-600">We&apos;ll be in touch about a {vehicle}.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Your name" required compact>
          <input name="name" type="text" required autoComplete="name" className={inputCls} />
        </Field>
        <Field label="Email" required compact>
          <input name="email" type="email" required autoComplete="email" className={inputCls} />
        </Field>
      </div>
      <Field label="I am a" required compact>
        <select name="enquiry_type" required defaultValue="retail" className={inputCls}>
          <option value="retail">Retail buyer</option>
          <option value="trade">Trade buyer</option>
        </select>
      </Field>
      <Field label="What are you looking for? (optional)" compact>
        <textarea name="message" rows={3} className={inputCls.replace("h-11", "min-h-20 py-2")} />
      </Field>
      <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {state === "error" && <p role="alert" className="text-[length:var(--text-sm)] text-sold-600">{error}</p>}
      <Button type="submit" disabled={state === "submitting"}>{state === "submitting" ? "Sending…" : `Enquire about a ${vehicle}`}</Button>
    </form>
  );
}
