import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Container, Eyebrow, Button } from "@/components/ui";
import { IconCheck, IconArrow } from "@/components/icons";
import { BodyTypeIcon } from "@/components/icons/body-types";
import { SITE } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Sell Your Van for Free | Private Listings",
  description: `List your van for free on ${SITE.name}. Enter your registration and we fill in the details; buyers enquire through the site, so your phone number stays yours.`,
  path: "/sell",
});

/** Where "List my van free" goes: the private-seller sign-up on the seller host. */
const LIST_URL = "https://sell.vansales.com/signup/private";

const BENEFITS = [
  { title: "Free listing", body: "Listing your van costs nothing." },
  { title: "Reg lookup fills the details", body: "Enter your registration and we fill in the make, model and year for you." },
  { title: "Enquiries come to you, not your number", body: "Buyers message you through the site, so your phone number stays private until you choose to share it." },
];

const STEPS = [
  { slug: "panel-van", title: "Add your reg", body: "Type your registration and we fill in the make, model and year. Add the mileage and a price." },
  { slug: "crew-cab", title: "Add your photos", body: "Upload your own photos, shown as they are." },
  { slug: "luton", title: "Get enquiries", body: "Buyers message you through the site. You choose who to reply to and when to share your number." },
];

export default function SellPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-surface-1">
        <Container className="py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow>Private sellers</Eyebrow>
            <h1 className="mt-3 font-display text-[length:var(--text-3xl)] font-extrabold leading-tight text-ink-900">Sell your van for free</h1>
            <p className="mx-auto mt-4 max-w-xl text-[length:var(--text-md)] leading-relaxed text-ink-600">
              Add your registration, a few photos and a price. Buyers enquire through the site.
            </p>
            <div className="mt-8 flex justify-center">
              <Button href={LIST_URL} variant="primary" size="lg" className="h-14 w-full max-w-sm px-10 text-[length:var(--text-lg)]">
                List my van free <IconArrow width={20} height={20} />
              </Button>
            </div>
          </div>
          <ul className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">
            {BENEFITS.map((b) => (
              <li key={b.title} className="rounded-[var(--radius-xl)] border border-border bg-white p-6 shadow-[var(--shadow-xs)]">
                <span className="mb-3 flex size-9 items-center justify-center rounded-full bg-success-tint text-success-600"><IconCheck width={18} height={18} aria-hidden /></span>
                <h2 className="font-display text-[length:var(--text-base)] font-bold text-ink-900">{b.title}</h2>
                <p className="mt-1.5 text-[length:var(--text-sm)] leading-relaxed text-ink-600">{b.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* How it works */}
      <section className="py-14">
        <Container>
          <div className="mb-8 text-center">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="mt-2 font-display text-[length:var(--text-2xl)] font-bold text-ink-900">Three steps</h2>
          </div>
          <ol className="grid gap-6 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-[var(--radius-xl)] border border-border bg-white p-7 text-center shadow-[var(--shadow-xs)]">
                <span className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-brand-tint text-brand-700">
                  <BodyTypeIcon slug={s.slug} className="size-14" />
                </span>
                <p className="mt-4 text-[length:var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-ink-400">Step {i + 1}</p>
                <h3 className="mt-1 font-display text-[length:var(--text-lg)] font-bold text-ink-900">{s.title}</h3>
                <p className="mt-2 text-[length:var(--text-sm)] leading-relaxed text-ink-600">{s.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>
    </>
  );
}
