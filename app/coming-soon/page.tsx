import type { Metadata } from "next";
import { WaitlistForm } from "@/components/waitlist-form";
import { Logo } from "@/components/brand";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Vansales — Opening July 2026",
  description:
    "The UK marketplace for new and used vans. Dealers and private sellers in one place. Launching July 2026 — register to be notified.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Vansales — Opening July 2026",
    description:
      "The UK marketplace for new and used vans — dealers and private sellers — launching soon.",
    type: "website",
  },
};

export default function ComingSoonPage() {
  return (
    <div
      className="hero-grid relative flex min-h-screen flex-col overflow-hidden bg-ink-900"
      style={{ isolation: "isolate" }}
    >
      {/* Top-left radial glow */}
      <div
        className="pointer-events-none absolute -left-48 -top-48 size-[700px] rounded-full opacity-15"
        aria-hidden
        style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 65%)" }}
      />
      {/* Bottom-right accent glow */}
      <div
        className="pointer-events-none absolute -bottom-32 -right-32 size-[500px] rounded-full opacity-10"
        aria-hidden
        style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 65%)" }}
      />

      {/* Top bar — wordmark only */}
      <header className="relative z-10 border-b border-white/10 px-6 py-5">
        <div className="mx-auto flex max-w-2xl items-center">
          <Logo tone="light" />
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-16">
        <div className="mx-auto w-full max-w-2xl">
          {/* Eyebrow */}
          <p className="mb-4 inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-white/15 bg-white/8 px-3.5 py-1.5 font-mono text-[var(--text-xs)] uppercase tracking-[var(--tracking-eyebrow)] text-white/60">
            <span
              className="inline-block size-2 rounded-full bg-accent-400"
              style={{ animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}
              aria-hidden
            />
            Launching soon
          </p>

          {/* Gradient spec-card decorative panel — echoes listing card treatment */}
          <div
            className="mb-7 overflow-hidden rounded-[var(--radius-xl)] border border-white/10"
            style={{ background: "linear-gradient(135deg, #0e2a6e 0%, #1a4ab0 60%, #0f3060 100%)" }}
          >
            <div className="p-7 pb-5">
              <p className="font-mono text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-white/40">
                {SITE.name}
              </p>
              <h1 className="mt-2 font-display text-[clamp(2.2rem,1rem+5vw,3.6rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-white">
                Opening July&nbsp;2026
                <span className="text-accent-400">.</span>
              </h1>
              <p className="mt-4 max-w-lg text-[var(--text-md)] leading-relaxed text-white/65">
                The UK marketplace for new &amp; used vans — dealers and private sellers in one
                honest place. Find your next van by the numbers that matter.
              </p>
            </div>

            {/* Spec-row — evokes the listing card design language */}
            <div className="flex flex-wrap gap-0 border-t border-white/10">
              {[
                { label: "Launch", value: "July 2026" },
                { label: "Market", value: "UK-wide" },
                { label: "Stock", value: "Dealers + Private" },
                { label: "Price", value: "Free to browse" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-1 flex-col gap-0.5 border-r border-white/10 px-4 py-3 last:border-r-0"
                >
                  <span className="font-mono text-[var(--text-2xs)] uppercase tracking-[var(--tracking-eyebrow)] text-white/35">
                    {item.label}
                  </span>
                  <span className="text-[var(--text-sm)] font-semibold text-white/80">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Register interest form */}
          <div>
            <p className="mb-4 font-display text-[var(--text-lg)] font-bold text-white">
              Get notified at launch
            </p>
            <WaitlistForm />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 px-6 py-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-1 text-[var(--text-xs)] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Questions?{" "}
            <a
              href="mailto:hello@vansales.com"
              className="text-white/55 underline-offset-2 hover:text-white hover:underline"
            >
              hello@vansales.com
            </a>
          </p>
          <p>© {SITE.name}.com 2026 — all rights reserved</p>
        </div>
      </footer>
    </div>
  );
}
