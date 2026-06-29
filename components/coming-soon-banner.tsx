"use client";

import { useEffect, useState } from "react";

const BANNER_HEIGHT = "2.5rem"; // 40 px — must match h-10 on the outer div

type FormState = "idle" | "submitting" | "success" | "error";

function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M4.22 4.22a.75.75 0 0 1 1.06 0L8 6.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L9.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L8 9.06l-2.72 2.72a.75.75 0 0 1-1.06-1.06L6.94 8 4.22 5.28a.75.75 0 0 1 0-1.06Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

const inputCls =
  "h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[var(--text-sm)] text-ink-800 placeholder-ink-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

export function ComingSoonBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [open, setOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [enquiryType, setEnquiryType] = useState<"retail" | "trade" | null>(null);

  // Keep header's sticky offset in sync with banner visibility.
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--coming-soon-h",
      dismissed ? "0px" : BANNER_HEIGHT,
    );
    return () => {
      document.documentElement.style.setProperty("--coming-soon-h", "0px");
    };
  }, [dismissed]);

  if (dismissed) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (formState === "submitting") return;
    setFormState("submitting");
    if (!enquiryType) {
      setErrorMsg("Please select whether you're retail or trade.");
      setFormState("error");
      return;
    }
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/register-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          message: fd.get("message"),
          enquiry_type: enquiryType,
          website: fd.get("website"), // honeypot
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

  function closeModal() {
    if (formState !== "submitting") setOpen(false);
  }

  return (
    <>
      {/* ── Sticky banner ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 flex h-10 items-center justify-between gap-3 bg-ink-900 px-4 sm:px-6">
        <p className="min-w-0 truncate text-[var(--text-sm)] text-white/85">
          <span className="font-semibold text-white">Opening August 2026</span>
          <span className="mx-1.5 text-white/70">—</span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="font-semibold text-accent-400 underline underline-offset-2 hover:text-accent-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-1 focus-visible:ring-offset-ink-900"
          >
            register your interest
          </button>
        </p>
        <button
          type="button"
          aria-label="Dismiss banner"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded p-1 text-white/70 transition hover:text-white/90"
        >
          <XIcon />
        </button>
      </div>

      {/* ── Register-interest modal ────────────────────────────────────────── */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Register your interest"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Card */}
          <div className="relative w-full max-w-md rounded-[var(--radius-xl)] border border-border bg-white p-6 shadow-[var(--shadow-xl)]">

            {/* Close button */}
            {formState !== "submitting" && (
              <button
                type="button"
                aria-label="Close"
                onClick={closeModal}
                className="absolute right-4 top-4 rounded p-1 text-ink-400 transition hover:text-ink-700"
              >
                <XIcon />
              </button>
            )}

            {formState === "success" ? (
              /* ── Success state ── */
              <div className="py-4 text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-accent-tint text-accent-500">
                  <CheckIcon />
                </div>
                <h2 className="font-display text-[var(--text-xl)] font-bold text-ink-900">
                  You&apos;re on the list
                </h2>
                <p className="mt-2 text-[var(--text-sm)] text-ink-500">
                  We&apos;ll be in touch before we open in August 2026.
                </p>
                <button
                  type="button"
                  onClick={() => { setOpen(false); setDismissed(true); }}
                  className="mt-6 h-11 w-full rounded-[var(--radius-md)] bg-ink-900 text-[var(--text-sm)] font-semibold text-white transition hover:bg-ink-700"
                >
                  Close
                </button>
              </div>
            ) : (
              /* ── Form state ── */
              <>
                <div className="mb-5">
                  <h2 className="font-display text-[var(--text-xl)] font-bold text-ink-900">
                    Opening August 2026
                  </h2>
                  <p className="mt-1 text-[var(--text-sm)] text-ink-500">
                    Leave your details and we&apos;ll let you know when we go live.
                  </p>
                </div>

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

                  {/* Enquiry type toggle */}
                  <div>
                    <p className="mb-1.5 text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink-500">
                      I am a&hellip; <span className="text-accent-500">*</span>
                    </p>
                    <div className="flex gap-2">
                      {(["retail", "trade"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setEnquiryType(t)}
                          className={`flex-1 rounded-[var(--radius-md)] border py-2.5 text-[var(--text-sm)] font-semibold transition ${
                            enquiryType === t
                              ? "border-brand-500 bg-brand-500 text-white"
                              : "border-border bg-surface-0 text-ink-600 hover:border-brand-400"
                          }`}
                        >
                          {t === "retail" ? "Retail (buying a van)" : "Trade (dealer)"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink-500">
                      Your name <span className="text-accent-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      autoComplete="name"
                      placeholder="Jane Smith"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink-500">
                      Email address <span className="text-accent-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      placeholder="jane@example.com"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink-500">
                      Message{" "}
                      <span className="normal-case tracking-normal text-ink-400">(optional)</span>
                    </label>
                    <textarea
                      name="message"
                      rows={3}
                      placeholder="What kind of van are you looking for?"
                      className={`${inputCls} h-auto resize-none py-2.5`}
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
                    className="mt-1 flex h-11 w-full items-center justify-center rounded-[var(--radius-md)] bg-accent-500 text-[var(--text-sm)] font-semibold text-white transition hover:bg-accent-600 disabled:opacity-60"
                  >
                    {formState === "submitting" ? "Submitting…" : "Register my interest →"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
