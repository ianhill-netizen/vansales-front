"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { Field, inputCls } from "@/components/enquiry-fields";

const API = (process.env.NEXT_PUBLIC_VANSALES_API_URL || "https://api.vansales.com").replace(/\/$/, "");

/** Email in, a one-use 15-minute link out (POST /api/auth/magic/send). The answer is always the same, so it never says whether an account exists. */
export function SignInForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    setState("sending");
    try {
      const r = await fetch(`${API}/api/auth/magic/send`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ email }) });
      setState(r.ok || r.status === 429 ? "sent" : "error");
    } catch { setState("error"); }
  }
  if (state === "sent") return <p role="status" className="mt-6 rounded-[var(--radius-md)] bg-success-tint p-4 text-[length:var(--text-sm)] text-ink-800">If that email has an account, we have sent a sign-in link. It works once, for 15 minutes. Check your spam folder too.</p>;
  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <Field label="Email" required><input type="email" name="email" required autoComplete="email" placeholder="you@example.com" className={inputCls} /></Field>
      {state === "error" && <p role="alert" className="text-[length:var(--text-sm)] font-medium text-sold-600">Something went wrong. Please try again.</p>}
      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Email me a sign-in link"}</Button>
      <p className="text-center text-[length:var(--text-sm)] text-ink-500">Prefer a password? <a className="underline" href="https://sell.vansales.com/login">Sign in on the seller site</a>.</p>
    </form>
  );
}
