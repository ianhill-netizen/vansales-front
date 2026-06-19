"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FinanceHireFleetPage() {
  const router = useRouter();
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/sign-up/finance-hire-fleet/submitted");
  }

  return (
    <div className="w-full max-w-lg">
      <div className="mb-6 text-center">
        <span className="text-4xl" aria-hidden>💸</span>
        <h1 className="mt-3 font-display text-[var(--text-xl)] font-extrabold text-ink-900">Finance / hire / fleet enquiry</h1>
        <p className="mt-1 text-[var(--text-sm)] text-ink-500">Bulk disposal, fleet remarketing, wholesale. Tell us about your operation and we'll arrange a call.</p>
      </div>
      <div className="rounded-[var(--radius-xl)] border border-border bg-white shadow-[var(--shadow-md)]">
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          {[
            { id: "name", label: "Contact name", type: "text", auto: "name" },
            { id: "company", label: "Company name", type: "text", auto: "organization" },
            { id: "email", label: "Email address", type: "email", auto: "email" },
            { id: "phone", label: "Phone", type: "tel", auto: "tel" },
          ].map((f) => (
            <div key={f.id}>
              <label htmlFor={f.id} className="block text-[var(--text-xs)] font-semibold uppercase tracking-widest text-ink-500">{f.label}</label>
              <input id={f.id} name={f.id} type={f.type} autoComplete={f.auto} required
                className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[var(--text-sm)] outline-none focus-visible:border-brand-500" />
            </div>
          ))}
          <div>
            <label htmlFor="type" className="block text-[var(--text-xs)] font-semibold uppercase tracking-widest text-ink-500">Operation type</label>
            <select id="type" name="type"
              className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[var(--text-sm)] outline-none focus-visible:border-brand-500">
              <option>Finance company (disposal)</option>
              <option>Daily / weekly hire</option>
              <option>Fleet management / leasing</option>
              <option>Auction house</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="volume" className="block text-[var(--text-xs)] font-semibold uppercase tracking-widest text-ink-500">Monthly disposal volume</label>
            <input id="volume" name="volume" type="number" placeholder="e.g. 30"
              className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[var(--text-sm)] outline-none focus-visible:border-brand-500" />
          </div>
          <div>
            <label htmlFor="notes" className="block text-[var(--text-xs)] font-semibold uppercase tracking-widest text-ink-500">Tell us more</label>
            <textarea id="notes" name="notes" rows={3}
              className="mt-1 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 py-2 text-[var(--text-sm)] outline-none focus-visible:border-brand-500" />
          </div>
          <button type="submit"
            className="flex h-11 w-full items-center justify-center rounded-[var(--radius-md)] bg-ink-900 text-[var(--text-sm)] font-bold text-white hover:bg-ink-700">
            Send enquiry →
          </button>
        </form>
      </div>
      <p className="mt-4 text-center text-[var(--text-xs)] text-ink-400">
        <Link href="/sign-up" className="hover:underline">← All account types</Link>
      </p>
    </div>
  );
}
