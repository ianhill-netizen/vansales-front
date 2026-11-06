"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { IconCheck } from "@/components/icons";
import { Field, inputCls } from "@/components/enquiry-fields";

type State = "idle" | "submitting" | "success" | "error";

const BUDGETS = ["Under £10,000", "£10,000 to £20,000", "£20,000 to £30,000", "£30,000 or more", "Not sure yet"];

/**
 * The /van-finance enquiry: name, email, mobile, budget. Posts to the site's existing /api/register-interest (rate limited, honeypot, forwarded to Dealski leads) with the page it came from.
 * Not a credit application and not a calculator: it only asks the Vansales team to get in touch.
 */
export function FinanceEnquiryForm() {
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
          mobile: String(fd.get("mobile") ?? "").trim(),
          budget: String(fd.get("budget") ?? ""),
          enquiry_type: "retail",
          message: "Van finance enquiry from /van-finance.",
          website: String(fd.get("website") ?? ""),
          context: "Van finance enquiry",
          page_path: "/van-finance",
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
          <p className="font-display font-bold text-ink-900">Thanks, we have your van finance enquiry.</p>
          <p className="mt-1 text-[length:var(--text-sm)] text-ink-600">We&apos;ll be in touch on the mobile or email you gave us.</p>
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
        <Field label="Mobile" required compact>
          <input name="mobile" type="tel" required autoComplete="tel" inputMode="tel" className={inputCls} />
        </Field>
        <Field label="Van budget" required compact>
          <select name="budget" required defaultValue="" className={inputCls}>
            <option value="" disabled>Choose a range</option>
            {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>
      </div>
      <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {state === "error" && <p role="alert" className="text-[length:var(--text-sm)] text-sold-600">{error}</p>}
      <Button type="submit" disabled={state === "submitting"}>{state === "submitting" ? "Sending…" : "Send my van finance enquiry"}</Button>
      <p className="text-[length:var(--text-xs)] text-ink-500">This is an enquiry, not a credit application. We use your details only to get back to you about your enquiry.</p>
    </form>
  );
}
