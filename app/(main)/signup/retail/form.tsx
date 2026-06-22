"use client";

import { useState } from "react";
import { Input } from "@/components/ui";
import { IconArrow } from "@/components/icons";

type FormState = "idle" | "submitting" | "success" | "error";

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

export function RetailSignupForm() {
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
          variant: "retail",
          email: fd.get("email"),
          name: fd.get("name"),
          looking_for: fd.get("looking_for"),
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
          You&rsquo;re on the list
        </h3>
        <p className="mt-2 text-[var(--text-sm)] text-ink-500">
          We&rsquo;ll alert you the moment matching stock arrives.
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
        label="Email address *"
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
      />

      <Input
        label="Your name (optional)"
        type="text"
        name="name"
        autoComplete="name"
        placeholder="Jane Smith"
      />

      <div className="flex flex-col gap-1">
        <label
          htmlFor="looking_for"
          className="text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-ink-500"
        >
          What are you after?{" "}
          <span className="normal-case tracking-normal text-ink-400">(optional)</span>
        </label>
        <textarea
          id="looking_for"
          name="looking_for"
          rows={3}
          placeholder="e.g. Ford Transit Custom, medium wheelbase, diesel, under £20k"
          className="w-full resize-none rounded-[var(--radius-md)] border border-border bg-surface-0 px-3.5 py-2.5 text-[var(--text-base)] font-medium text-ink-800 placeholder:text-ink-400 outline-none transition-colors duration-[var(--dur-fast)] focus-visible:border-brand-500 focus-visible:shadow-[var(--shadow-focus)]"
        />
      </div>

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
            Get van alerts
            <IconArrow width={17} height={17} />
          </>
        )}
      </button>
    </form>
  );
}
