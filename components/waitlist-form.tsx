"use client";

import { useState } from "react";
import { IconCheck } from "./icons";

type State = "idle" | "submitting" | "success" | "error";

export function WaitlistForm() {
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [buyerType, setBuyerType] = useState<"buyer" | "dealer">("buyer");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "submitting") return;
    setState("submitting");
    setErrorMsg("");

    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fd.get("email"),
          buyer_type: fd.get("buyer_type"),
          website: fd.get("website"),
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok) {
        setState("success");
      } else {
        setErrorMsg(data.error ?? "Something went wrong.");
        setState("error");
      }
    } catch {
      setErrorMsg("Network error — please email hello@vansales.com.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="flex items-start gap-3 rounded-[var(--radius-lg)] bg-white/10 p-5">
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-500">
          <IconCheck width={14} height={14} className="text-ink-900" />
        </span>
        <div>
          <p className="font-display font-bold text-white">You&apos;re on the list.</p>
          <p className="mt-1 text-[var(--text-sm)] text-white/65">
            We&apos;ll email you when Vansales goes live in August 2026. No spam, ever.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
        className="sr-only"
      />

      {/* Buyer / Dealer toggle */}
      <div className="flex rounded-[var(--radius-md)] border border-white/20 bg-white/8 p-1">
        {(["buyer", "dealer"] as const).map((t) => (
          <label
            key={t}
            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-sm)] py-2 text-[var(--text-sm)] font-semibold transition-colors ${
              buyerType === t
                ? "bg-white text-ink-900 shadow-[var(--shadow-xs)]"
                : "text-white/65 hover:text-white"
            }`}
          >
            <input
              type="radio"
              name="buyer_type"
              value={t}
              checked={buyerType === t}
              onChange={() => setBuyerType(t)}
              className="sr-only"
            />
            {t === "buyer" ? "I'm buying a van" : "I'm a dealer / seller"}
          </label>
        ))}
      </div>

      {/* Email */}
      <div>
        <label className="block">
          <span className="sr-only">Email address</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="h-12 w-full rounded-[var(--radius-md)] border border-white/20 bg-white/10 px-4 text-[var(--text-base)] text-white placeholder:text-white/35 outline-none transition-colors focus-visible:border-accent-400 focus-visible:ring-2 focus-visible:ring-accent-400/20"
          />
        </label>
      </div>

      {state === "error" && (
        <p className="rounded-[var(--radius-md)] bg-red-900/40 px-3 py-2.5 text-[var(--text-sm)] text-red-300">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "submitting"}
        className="h-12 w-full rounded-[var(--radius-md)] bg-accent-500 font-semibold text-plate-ink shadow-[var(--shadow-sm)] transition-[background-color,transform] hover:bg-accent-400 active:translate-y-px disabled:opacity-60"
      >
        {state === "submitting" ? "Registering…" : "Notify me at launch"}
      </button>

      <p className="text-center text-[var(--text-2xs)] text-white/35">
        One email at launch. No marketing. Unsubscribe any time.
      </p>
    </form>
  );
}
