import type { Metadata } from "next";
import Link from "next/link";
import { DealerLoginForm } from "@/components/dealer-login-form";

export const metadata: Metadata = {
  title: "Dealer Portal — Log in · Vansales",
  description: "Log in to your Vansales dealer portal to manage your stock, leads and advertising.",
  robots: { index: false, follow: false },
};

export default function DealerPortalLoginPage() {
  return (
    <div className="w-full max-w-sm space-y-4">

      {/* Login card */}
      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-white shadow-[var(--shadow-md)]">
        <div className="border-b border-border px-6 py-5">
          <p className="text-[var(--text-2xs)] font-semibold uppercase tracking-widest text-ink-400">
            Dealer portal
          </p>
          <h1 className="mt-1 font-display text-[var(--text-xl)] font-extrabold text-ink-900">
            Log in to your account
          </h1>
        </div>
        <div className="px-6 py-5">
          <DealerLoginForm />
        </div>
      </div>

      {/* Place a single advert — PAYG stub */}
      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-white">
        <div className="px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-[var(--text-base)] font-bold text-ink-900">
                Place a single advert
              </p>
              <p className="mt-0.5 text-[var(--text-sm)] text-ink-500">
                No subscription. One listing, pay once.
              </p>
            </div>
            <span className="shrink-0 rounded-[var(--radius-pill)] bg-surface-2 px-2.5 py-1 text-[var(--text-2xs)] font-semibold text-ink-500">
              Coming soon
            </span>
          </div>
          <button
            type="button"
            disabled
            className="mt-4 flex h-10 w-full cursor-not-allowed items-center justify-center rounded-[var(--radius-md)] border border-border bg-surface-1 text-[var(--text-sm)] font-semibold text-ink-400"
          >
            Get started →
          </button>
        </div>
      </div>

      {/* Stay safe notice */}
      <div className="rounded-[var(--radius-lg)] border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-[var(--text-xs)] font-semibold text-amber-800">Stay safe</p>
        <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-[var(--text-xs)] text-amber-700">
          <li>Use a unique password you don&apos;t use anywhere else.</li>
          <li>Never share your login with anyone, including Vansales staff.</li>
          <li>We will never ask for your password by email or phone.</li>
        </ul>
      </div>

      <p className="text-center text-[var(--text-sm)] text-ink-500">
        Not a dealer?{" "}
        <Link href="/sign-in" className="font-semibold text-brand-700 hover:underline">
          Customer sign in →
        </Link>
      </p>
    </div>
  );
}
