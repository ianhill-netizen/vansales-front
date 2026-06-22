"use client";

import { useState } from "react";
import { Input, Select } from "@/components/ui";
import { IconArrow } from "@/components/icons";

type FormState = "idle" | "submitting" | "success" | "error";

const STOCK_SIZE_OPTIONS = [
  { value: "", label: "Select stock size…" },
  { value: "1–10", label: "1–10 vehicles" },
  { value: "11–50", label: "11–50 vehicles" },
  { value: "50+", label: "50+ vehicles" },
];

function CheckIcon() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function TradeSignupForm() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (formState === "submitting") return;
    setFormState("submitting");

    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variant: "trade",
          dealership: fd.get("dealership"),
          contact_name: fd.get("contact_name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          stock_size: fd.get("stock_size"),
          website: fd.get("website"),
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok) {
        setFormState("success");
      } else {
        setErrorMsg(data.error ?? "Something went wrong — please try again.");
        setFormState("error");
      }
    } catch {
      setErrorMsg("Network error — please try again.");
      setFormState("error");
    }
  }

  if (formState === "success") {
    return (
      <div className="py-6 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-accent-tint text-accent-500">
          <CheckIcon />
        </div>
        <h3 className="font-display text-[var(--text-xl)] font-bold text-ink-900">
          We&rsquo;ll be in touch
        </h3>
        <p className="mt-2 text-[var(--text-sm)] text-ink-500">
          Your dealer registration is received. Expect a call before launch in August 2026.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
        className="sr-only"
      />

      <Input
        label="Dealership name *"
        type="text"
        name="dealership"
        required
        autoComplete="organization"
        placeholder="Smith Vans Ltd"
      />

      <Input
        label="Your name *"
        type="text"
        name="contact_name"
        required
        autoComplete="name"
        placeholder="John Smith"
      />

      <Input
        label="Email address *"
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="john@smithvans.co.uk"
      />

      <Input
        label="Phone number *"
        type="tel"
        name="phone"
        required
        autoComplete="tel"
        placeholder="01234 567890"
      />

      <Select
        label="Typical stock size *"
        name="stock_size"
        required
        options={STOCK_SIZE_OPTIONS}
      />

      {formState === "error" && (
        <p className="rounded-[var(--radius-md)] bg-danger-tint px-3 py-2.5 text-[var(--text-sm)] text-danger-600">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={formState === "submitting"}
        className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] text-[var(--text-base)] font-bold text-white transition disabled:opacity-60"
        style={{ background: "linear-gradient(135deg, #f47c1e 0%, #d96410 100%)" }}
      >
        {formState === "submitting" ? (
          "Submitting…"
        ) : (
          <>
            List my stock free
            <IconArrow width={17} height={17} />
          </>
        )}
      </button>

      <p className="text-center text-[var(--text-xs)] text-ink-400">
        No card required. No setup fee. Cancel any time.
      </p>
    </form>
  );
}
