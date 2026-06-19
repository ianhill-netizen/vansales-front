"use client";

import { useState, useEffect, type ReactNode } from "react";
import { Button } from "./ui";
import { IconCheck } from "./icons";

type State = "idle" | "submitting" | "success" | "error";

export function EnquiryModal({
  dealerName,
  dealskiTenant,
  onClose,
}: {
  dealerName: string;
  dealskiTenant: string;
  onClose: () => void;
}) {
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  /* Close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "submitting") return;
    setState("submitting");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          message: fd.get("message"),
          website: fd.get("website"),
          make: "",
          model: "",
          derivative: "",
          slug: `dealer-${dealskiTenant}`,
          location: dealerName,
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok) setState("success");
      else { setErrorMsg(data.error ?? "Something went wrong."); setState("error"); }
    } catch {
      setErrorMsg("Network error — please call us directly.");
      setState("error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/60 p-4 backdrop-blur-sm sm:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal
      aria-label={`Enquire to ${dealerName}`}
    >
      <div className="w-full max-w-md rounded-[var(--radius-xl)] bg-white p-6 shadow-[var(--shadow-lg)]">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="font-display text-[var(--text-xl)] font-bold text-ink-900">Get in touch</p>
            <p className="mt-0.5 text-[var(--text-sm)] text-ink-500">{dealerName}</p>
          </div>
          <button onClick={onClose} className="rounded-[var(--radius-sm)] p-1 text-ink-400 hover:bg-surface-2 hover:text-ink-800" aria-label="Close">
            ✕
          </button>
        </div>

        {state === "success" ? (
          <div className="flex items-start gap-3 rounded-[var(--radius-md)] bg-success-tint p-4">
            <IconCheck width={20} height={20} className="mt-0.5 shrink-0 text-success-600" />
            <div>
              <p className="font-semibold text-success-600">Message sent!</p>
              <p className="mt-1 text-[var(--text-sm)] text-ink-600">{dealerName} will be in touch shortly.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            <input type="text" name="website" tabIndex={-1} aria-hidden="true" autoComplete="off" className="sr-only" />
            <ModalField label="Name"><input type="text" name="name" required autoComplete="name" placeholder="Jane Smith" className={inputCls} /></ModalField>
            <ModalField label="Phone"><input type="tel" name="phone" required autoComplete="tel" placeholder="07700 900 000" className={inputCls} /></ModalField>
            <ModalField label="Email"><input type="email" name="email" required autoComplete="email" placeholder="you@example.com" className={inputCls} /></ModalField>
            <ModalField label="Message (optional)">
              <textarea name="message" rows={3} defaultValue={`Hi, I'd like to find out more about vans at ${dealerName}.`} className={inputCls + " h-auto py-2.5"} />
            </ModalField>
            {state === "error" && <p className="rounded-[var(--radius-md)] bg-sold-tint px-3 py-2.5 text-[var(--text-sm)] text-sold-600">{errorMsg}</p>}
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={state === "submitting"}>
              {state === "submitting" ? "Sending…" : "Send message"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

const inputCls = "h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[var(--text-base)] text-ink-800 outline-none transition-colors focus-visible:border-accent-500 focus-visible:ring-2 focus-visible:ring-accent-500/20";

function ModalField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[var(--text-2xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-ink-500">{label}</span>
      {children}
    </label>
  );
}
