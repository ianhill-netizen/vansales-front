import type { Metadata } from "next";
import { DealerLoginForm } from "@/components/dealer-login-form";

export const metadata: Metadata = {
  title: "Dealer Portal — Log in",
  description: "Log in to your Vansales dealer portal to manage your stock, leads and advertising.",
  robots: { index: false, follow: false },
};

export default function DealerPortalLoginPage() {
  return (
    <div className="hero-grid min-h-screen bg-ink-900" style={{ isolation: "isolate" }}>
      <div
        className="pointer-events-none absolute -left-48 -top-48 size-[600px] rounded-full opacity-10"
        aria-hidden
        style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 65%)" }}
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <div className="mb-8 text-center">
          <p className="font-mono text-[var(--text-xs)] uppercase tracking-[var(--tracking-eyebrow)] text-white/40">
            Vansales
          </p>
          <h1 className="mt-1 font-display text-[var(--text-2xl)] font-extrabold text-white">Dealer portal</h1>
        </div>

        <div className="w-full max-w-md space-y-4">
          {/* Login card */}
          <div className="overflow-hidden rounded-[var(--radius-xl)] border border-white/12 bg-white/6 backdrop-blur-sm">
            <div className="border-b border-white/10 px-6 py-4">
              <p className="font-display text-[var(--text-lg)] font-bold text-white">Log in to your account</p>
            </div>
            <div className="px-6 py-5">
              <DealerLoginForm />
            </div>
          </div>

          {/* Place a single advert — pay-as-you-go stub */}
          <div className="overflow-hidden rounded-[var(--radius-xl)] border border-white/12 bg-white/4">
            <div className="px-6 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-[var(--text-base)] font-bold text-white">Place a single advert</p>
                  <p className="mt-0.5 text-[var(--text-sm)] text-white/55">
                    No subscription. One listing, pay once. Coming soon.
                  </p>
                </div>
                <span className="shrink-0 rounded-[var(--radius-pill)] border border-white/20 bg-white/8 px-2.5 py-1 font-mono text-[var(--text-2xs)] uppercase tracking-[var(--tracking-eyebrow)] text-white/50">
                  Soon
                </span>
              </div>
              <button
                type="button"
                disabled
                className="mt-4 flex h-10 w-full cursor-not-allowed items-center justify-center rounded-[var(--radius-md)] border border-white/15 bg-white/6 text-[var(--text-sm)] font-semibold text-white/40"
              >
                Get started →
              </button>
            </div>
          </div>

          {/* Stay safe note */}
          <div className="rounded-[var(--radius-lg)] border border-yellow-500/25 bg-yellow-500/8 px-4 py-3">
            <p className="text-[var(--text-xs)] font-semibold text-yellow-300">Stay safe</p>
            <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-[var(--text-xs)] text-yellow-100/70">
              <li>Use a unique password you don&apos;t use anywhere else.</li>
              <li>Never share your login with anyone, including Vansales staff.</li>
              <li>We will never ask for your password by email or phone.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
