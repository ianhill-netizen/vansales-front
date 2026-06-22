"use client";

import { useState } from "react";
import { Input, Select } from "@/components/ui";
import { IconArrow } from "@/components/icons";

type FormState = "idle" | "submitting" | "success" | "error";

const ADVERTISE_OPTIONS = [
  { value: "", label: "Select category…" },
  { value: "Insurance", label: "Insurance" },
  { value: "Finance", label: "Finance" },
  { value: "Warranty", label: "Warranty" },
  { value: "Accessories", label: "Accessories" },
  { value: "Other", label: "Other" },
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

export function AdvertiseSignupForm() {
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
          variant: "advertise",
          company: fd.get("company"),
          contact_name: fd.get("contact_name"),
          email: fd.get("email"),
          advertise_category: fd.get("advertise_category"),
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
          Media pack on its way
        </h3>
        <p className="mt-2 text-[var(--text-sm)] text-ink-500">
          We&rsquo;ll send our media pack within 1 business day.
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
        label="Company name *"
        type="text"
        name="company"
        required
        autoComplete="organization"
        placeholder="Acme Insurance Ltd"
      />

      <Input
        label="Your name *"
        type="text"
        name="contact_name"
        required
        autoComplete="name"
        placeholder="Sarah Jones"
      />

      <Input
        label="Email address *"
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="sarah@acme.co.uk"
      />

      <Select
        label="What would you like to advertise? *"
        name="advertise_category"
        required
        options={ADVERTISE_OPTIONS}
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
        style={{ background: "linear-gradient(135deg, #1b5aa8 0%, #0d2d5a 100%)" }}
      >
        {formState === "submitting" ? (
          "Submitting…"
        ) : (
          <>
            Request media pack
            <IconArrow width={17} height={17} />
          </>
        )}
      </button>
    </form>
  );
}
