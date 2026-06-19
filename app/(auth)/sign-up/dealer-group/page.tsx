"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DealerGroupSignUpPage() {
  const router = useRouter();
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/sign-up/dealer-group/submitted");
  }

  return (
    <div className="w-full max-w-lg">
      <div className="mb-6 text-center">
        <span className="text-4xl" aria-hidden>🏢</span>
        <h1 className="mt-3 font-display text-[var(--text-xl)] font-extrabold text-ink-900">Dealer group enquiry</h1>
        <p className="mt-1 text-[var(--text-sm)] text-ink-500">Multi-site, bulk stock, custom lead routing. We'll come back within one business day.</p>
      </div>
      <div className="rounded-[var(--radius-xl)] border border-border bg-white shadow-[var(--shadow-md)]">
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          {[
            { id: "contact", label: "Contact name", type: "text", auto: "name" },
            { id: "group", label: "Dealer group name", type: "text", auto: "organization" },
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
            <label htmlFor="sites" className="block text-[var(--text-xs)] font-semibold uppercase tracking-widest text-ink-500">Number of sites</label>
            <input id="sites" name="sites" type="number" min={2} placeholder="e.g. 5"
              className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[var(--text-sm)] outline-none focus-visible:border-brand-500" />
          </div>
          <div>
            <label htmlFor="total-vans" className="block text-[var(--text-xs)] font-semibold uppercase tracking-widest text-ink-500">Approx. total vans</label>
            <input id="total-vans" name="total-vans" type="number" min={1} placeholder="e.g. 200"
              className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[var(--text-sm)] outline-none focus-visible:border-brand-500" />
          </div>
          <div>
            <label htmlFor="notes" className="block text-[var(--text-xs)] font-semibold uppercase tracking-widest text-ink-500">Anything else to tell us?</label>
            <textarea id="notes" name="notes" rows={3} placeholder="Current DMS, current advertising platforms, lead routing requirements…"
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
