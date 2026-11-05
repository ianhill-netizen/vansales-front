import type { Metadata } from "next";
import type React from "react";
import { Container, Eyebrow, Button } from "@/components/ui";
import { IconArrow, IconMessage, IconFilter, IconSync, IconWhatsApp } from "@/components/icons";
import { SITE, absUrl, DEFAULT_OG_IMAGES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Advertise your vans | Vansales",
  description: "Van-specialist buyers. Enquiries straight to WhatsApp. No long contract.",
  alternates: { canonical: absUrl("/advertise") },
  openGraph: {
    images: DEFAULT_OG_IMAGES,
    title: "Advertise your vans | Vansales",
    description: "Van-specialist buyers. Enquiries straight to WhatsApp. No long contract.",
    url: absUrl("/advertise"),
    type: "website",
  },
};

/** Where every "start" button goes: the dealer sign-up on the dealer host. */
const DEALER_SIGNUP = "https://dealer.vansales.com/signup/dealer";

/** The three steps, under the hero. */
const STEPS = [
  { n: "1", title: "Sign up", body: "Create your dealer account. It takes about 30 seconds." },
  { n: "2", title: "Import your stock", body: "Bring your vans in from AutoTrader, a CSV file or Dealski, or paste a list of registrations." },
  { n: "3", title: "Enquiries land in WhatsApp", body: "Buyers enquire by WhatsApp or form and it reaches you straight away." },
];

/** The four things that really set Vansales apart for a dealer: no figures, nothing we cannot show. */
const DIFFERENTIATORS: { Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; label: string; body: string }[] = [
  { Icon: IconWhatsApp, label: "WhatsApp leads", body: "Buyers enquire by WhatsApp or form and it reaches you straight away, not an inbox you check once a week." },
  { Icon: IconFilter, label: "Specialist van filters", body: "Buyers search by body type, wheelbase, roof height, payload and ULEZ, so the enquiries you get are better matched." },
  { Icon: IconSync, label: "Import in minutes", body: "Bring your stock in from AutoTrader, a CSV file or your Dealski account instead of typing it in van by van." },
  { Icon: IconMessage, label: "No contract", body: "Try it free for 14 days. There is no contract to sign and you can cancel any time." },
];

export default function AdvertisePage() {
  return (
    <>
      {/* ─── HERO ──────────────────────────────────────────────── */}
      <section className="hero-grid relative overflow-hidden bg-ink-900">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div
            className="absolute -left-40 -top-40 size-[600px] rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)" }}
          />
        </div>

        <Container className="relative z-10 py-16 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
            <div>
              <Eyebrow light>For dealers &amp; trade</Eyebrow>
              <h1 className="mt-4 font-display text-[clamp(2.2rem,1.4rem+3.5vw,3.4rem)] font-extrabold leading-[1.04] tracking-[-0.03em] text-white">
                Advertise your vans on{" "}
                <span className="text-brand-400">vansales</span>
              </h1>
              <p className="mt-5 max-w-xl text-[length:var(--text-md)] leading-relaxed text-white/70">
                Van-specialist buyers. Enquiries straight to WhatsApp. No long contract.
              </p>
              <div className="mt-8">
                <Button href={DEALER_SIGNUP} variant="primary" size="lg" className="h-14 px-10 text-[length:var(--text-lg)]">
                  Try free for 14 days <IconArrow width={20} height={20} />
                </Button>
                <p className="mt-3 text-[length:var(--text-sm)] text-white/60">No card needed. No contract. Cancel anytime.</p>
              </div>
            </div>

            {/* Four real differentiators (no statistics) */}
            <div className="flex flex-col gap-5 rounded-[var(--radius-xl)] border border-white/10 bg-white/6 p-7 backdrop-blur-sm lg:self-center">
              {DIFFERENTIATORS.map((r) => (
                <div key={r.label} className="flex items-start gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-brand-300">
                    <r.Icon width={20} height={20} aria-hidden />
                  </span>
                  <div>
                    <p className="text-[length:var(--text-sm)] font-bold text-white">{r.label}</p>
                    <p className="mt-0.5 text-[length:var(--text-xs)] leading-relaxed text-white/60">{r.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────────── */}
      <section className="py-14">
        <Container>
          <div className="mb-8 text-center">
            <Eyebrow>How it works</Eyebrow>
          </div>
          <ol className="grid gap-5 sm:grid-cols-3">
            {STEPS.map((st) => (
              <li key={st.n} className="rounded-[var(--radius-xl)] border border-border bg-white p-7 shadow-[var(--shadow-xs)]">
                <span className="mb-4 flex size-10 items-center justify-center rounded-full bg-brand-tint font-display text-[length:var(--text-base)] font-bold text-brand-700">{st.n}</span>
                <h2 className="font-display text-[length:var(--text-lg)] font-bold text-ink-900">{st.title}</h2>
                <p className="mt-2 text-[length:var(--text-sm)] leading-relaxed text-ink-600">{st.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>
    </>
  );
}
