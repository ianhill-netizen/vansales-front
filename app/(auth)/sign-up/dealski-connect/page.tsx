"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRole } from "@/lib/roles/context";

export default function DealskiConnectPage() {
  const { setPersona } = useRole();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPersona("dealer");
    router.push("/dealer-portal");
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 text-center">
        <span className="text-4xl" aria-hidden>⚡</span>
        <h1 className="mt-3 font-display text-[var(--text-xl)] font-extrabold text-ink-900">Connect Dealski account</h1>
        <p className="mt-1 text-[var(--text-sm)] text-ink-500">Your stock feeds in automatically in 5 minutes. No CSV uploads.</p>
      </div>
      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-white shadow-[var(--shadow-md)]">
        <div className="border-b border-border bg-brand-tint px-6 py-3">
          <p className="text-[var(--text-xs)] font-semibold text-brand-700">⚡ Already on Dealski? Your stock is basically live already.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          <div>
            <label htmlFor="tenant" className="block text-[var(--text-xs)] font-semibold uppercase tracking-widest text-ink-500">Dealski tenant / dealer ID</label>
            <input id="tenant" name="tenant" type="text" required placeholder="e.g. swissvans"
              className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[var(--text-sm)] outline-none focus-visible:border-brand-500" />
            <p className="mt-1 text-[var(--text-2xs)] text-ink-400">Find this in your Dealski account → Settings → Tenant ID</p>
          </div>
          <div>
            <label htmlFor="email" className="block text-[var(--text-xs)] font-semibold uppercase tracking-widest text-ink-500">Your Dealski email</label>
            <input id="email" name="email" type="email" required autoComplete="email"
              className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[var(--text-sm)] outline-none focus-visible:border-brand-500" />
          </div>
          <div>
            <label htmlFor="password" className="block text-[var(--text-xs)] font-semibold uppercase tracking-widest text-ink-500">Create Vansales password</label>
            <input id="password" name="password" type="password" required autoComplete="new-password" placeholder="Min. 8 characters"
              className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[var(--text-sm)] outline-none focus-visible:border-brand-500" />
          </div>
          <button type="submit"
            className="flex h-11 w-full items-center justify-center rounded-[var(--radius-md)] bg-brand-500 text-[var(--text-sm)] font-bold text-white hover:bg-brand-600">
            Connect & go to dashboard →
          </button>
        </form>
      </div>
      <p className="mt-3 text-center text-[var(--text-sm)] text-ink-500">
        Not on Dealski yet?{" "}
        <a href="https://dealski.co.uk" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 hover:underline">
          Get a Dealski account →
        </a>
      </p>
      <p className="mt-3 text-center text-[var(--text-xs)] text-ink-400">
        <Link href="/sign-up" className="hover:underline">← All account types</Link>
      </p>
    </div>
  );
}
