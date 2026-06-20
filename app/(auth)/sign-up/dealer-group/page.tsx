"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export default function DealerGroupSignUpPage() {
  const router = useRouter();
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/sign-up/dealer-group/submitted");
  }

  return (
    <div className="w-full max-w-lg">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-[var(--radius-xl)] bg-ink-900 text-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <h1 className="mt-3 font-display text-[var(--text-xl)] font-extrabold text-ink-900">Dealer group enquiry</h1>
        <p className="mt-1 text-[var(--text-sm)] text-ink-500">Multi-site, bulk stock, custom lead routing. We&apos;ll come back within one business day.</p>
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
          <Button type="submit" variant="brand" size="md" className="w-full">
            Send enquiry →
          </Button>
        </form>
      </div>
      <p className="mt-4 text-center text-[var(--text-xs)] text-ink-400">
        <Link href="/sign-up" className="hover:underline">← All account types</Link>
      </p>
    </div>
  );
}
