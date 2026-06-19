"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRole } from "@/lib/roles/context";

export default function PrivateSellerSignUpPage() {
  const { setPersona } = useRole();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPersona("buyer");
    router.push("/account");
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 text-center">
        <span className="text-4xl" aria-hidden>🚐</span>
        <h1 className="mt-3 font-display text-[var(--text-xl)] font-extrabold text-ink-900">Sell your van</h1>
        <p className="mt-1 text-[var(--text-sm)] text-ink-500">Free listing. No subscription. Ready in 5 minutes.</p>
      </div>
      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-white shadow-[var(--shadow-md)]">
        <div className="border-b border-border bg-success-tint px-6 py-3">
          <p className="text-[var(--text-xs)] font-semibold text-success-700">✓ Completely free — no credit card needed</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "first", label: "First name", auto: "given-name" },
              { id: "last", label: "Last name", auto: "family-name" },
            ].map((f) => (
              <div key={f.id}>
                <label htmlFor={f.id} className="block text-[var(--text-xs)] font-semibold uppercase tracking-widest text-ink-500">{f.label}</label>
                <input id={f.id} name={f.id} type="text" autoComplete={f.auto} required
                  className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[var(--text-sm)] outline-none focus-visible:border-brand-500" />
              </div>
            ))}
          </div>
          <div>
            <label htmlFor="email" className="block text-[var(--text-xs)] font-semibold uppercase tracking-widest text-ink-500">Email address</label>
            <input id="email" name="email" type="email" autoComplete="email" required
              className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[var(--text-sm)] outline-none focus-visible:border-brand-500" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-[var(--text-xs)] font-semibold uppercase tracking-widest text-ink-500">Phone (optional — for WhatsApp enquiries)</label>
            <input id="phone" name="phone" type="tel" autoComplete="tel"
              className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[var(--text-sm)] outline-none focus-visible:border-brand-500" />
          </div>
          <div>
            <label htmlFor="password" className="block text-[var(--text-xs)] font-semibold uppercase tracking-widest text-ink-500">Password</label>
            <input id="password" name="password" type="password" autoComplete="new-password" required placeholder="Min. 8 characters"
              className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[var(--text-sm)] outline-none focus-visible:border-brand-500" />
          </div>
          <button type="submit"
            className="flex h-11 w-full items-center justify-center rounded-[var(--radius-md)] bg-success-600 text-[var(--text-sm)] font-bold text-white hover:bg-success-700">
            Create free account & list my van →
          </button>
        </form>
      </div>
      <p className="mt-4 text-center text-[var(--text-xs)] text-ink-400">
        <Link href="/sign-up" className="hover:underline">← All account types</Link>
      </p>
    </div>
  );
}
