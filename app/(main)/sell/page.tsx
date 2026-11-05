import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { Container, Eyebrow, Button } from "@/components/ui";
import { IconCheck, IconArrow } from "@/components/icons";
import { BodyTypeIcon } from "@/components/icons/body-types";
import { SITE } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Sell Your Van for Free | Private Listings",
  description: `List your van for free on ${SITE.name}. Enter your registration and we fill in the details; buyers enquire through the site, so your phone number stays yours.`,
  path: "/sell",
});

/** Where "List my van" goes: the private-seller sign-up on the seller host. */
const LIST_URL = "https://sell.vansales.com/signup/private";

const BENEFITS = [
  { title: "Free listing", body: "Listing your van costs nothing. Extras are optional and paid for with credits, listed below." },
  { title: "Reg lookup fills the details", body: "Enter your registration and we fill in the make, model and year for you." },
  { title: "Enquiries come to you, not your number", body: "Buyers message you through the site, so your phone number stays private until you choose to share it." },
];

const STEPS = [
  { slug: "panel-van", title: "Add your reg", body: "Type your registration and we fill in the make, model and year. Add the mileage and a price." },
  { slug: "crew-cab", title: "Add your photos", body: "Upload your own photos, shown as they are. A studio background is an optional extra." },
  { slug: "luton", title: "Get enquiries", body: "Buyers message you through the site. You choose who to reply to and when to share your number." },
];

/** Credit costs come from the backend's seller_services; the packs from seller_credit_packs (GET /api/seller/services). */
const EXTRAS = [
  { name: "Studio background", credits: 1, body: "We remove the background behind your van for clean, studio-style photos." },
  { name: "Video", credits: 2, body: "A short promotional video of your van, made from your photos." },
  { name: "HPI check", credits: 3, body: "A vehicle history check. A clear result puts an HPI checked badge on your advert." },
];

const PACKS = [
  { name: "Starter", credits: 5, price: 5 },
  { name: "Plus", credits: 12, price: 10 },
  { name: "Pro", credits: 30, price: 25 },
];

const FAQ = [
  { q: "Is it really free?", a: "Yes. Listing your van is free. The extras above are optional and paid for with credits." },
  { q: "Can I edit my listing?", a: "Yes. You can change the price, photos and description at any time from your account." },
  { q: "I'm a dealer. Is this for me?", a: "Dealers have their own sign-up and tools. See the Advertise page." },
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
            <div className="mt-8 flex flex-col items-center gap-3">
              <Button href={LIST_URL} variant="primary" size="lg" className="h-14 w-full max-w-sm px-10 text-[length:var(--text-lg)]">
                List my van <IconArrow width={20} height={20} />
              </Button>
              <Link href="/advertise" className="text-[length:var(--text-sm)] text-ink-500 hover:text-ink-800 hover:underline">Trade or dealer? See dealer options</Link>
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

      {/* Optional extras, paid in credits */}
      <section className="border-y border-border bg-surface-1 py-14">
        <Container>
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <Eyebrow>Optional extras</Eyebrow>
            <h2 className="mt-2 font-display text-[length:var(--text-2xl)] font-bold text-ink-900">Pay only for what you add, in credits</h2>
            <p className="mt-2 text-[length:var(--text-sm)] text-ink-500">Listing is free. If you want an extra, it costs credits. You buy credits in a pack, once, with no subscription.</p>
          </div>
          <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-3">
            {EXTRAS.map((e) => (
              <div key={e.name} className="flex flex-col rounded-[var(--radius-xl)] border border-border bg-white p-6 shadow-[var(--shadow-xs)]">
                <p className="font-display text-[length:var(--text-base)] font-bold text-ink-900">{e.name}</p>
                <p className="mt-1 text-[length:var(--text-2xl)] font-extrabold tabular-nums text-brand-700">{e.credits} credit{e.credits === 1 ? "" : "s"}</p>
                <p className="mt-2 text-[length:var(--text-sm)] leading-relaxed text-ink-600">{e.body}</p>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-8 max-w-4xl rounded-[var(--radius-xl)] border border-dashed border-border bg-white p-6">
            <p className="text-center font-display text-[length:var(--text-base)] font-bold text-ink-900">Credit packs</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {PACKS.map((p) => (
                <li key={p.name} className="rounded-[var(--radius-lg)] bg-surface-1 px-4 py-3 text-center">
                  <p className="text-[length:var(--text-sm)] font-semibold text-ink-700">{p.name}</p>
                  <p className="text-[length:var(--text-lg)] font-bold tabular-nums text-ink-900">£{p.price}</p>
                  <p className="text-[length:var(--text-xs)] text-ink-500">{p.credits} credits</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8 flex justify-center">
            <Button href={LIST_URL} variant="primary" size="lg" className="h-14 px-10 text-[length:var(--text-lg)]">
              List my van <IconArrow width={20} height={20} />
            </Button>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-14">
        <Container>
          <div className="mx-auto max-w-2xl">
            <h2 className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">Common questions</h2>
            <div className="mt-4 divide-y divide-border">
              {FAQ.map((item) => (
                <div key={item.q} className="py-4">
                  <p className="font-semibold text-ink-900">{item.q}</p>
                  <p className="mt-1 text-[length:var(--text-sm)] text-ink-600">{item.a}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[length:var(--text-sm)] text-ink-500">
              More questions?{" "}
              <Link href="/advertise" className="font-semibold text-brand-600 hover:underline">See our dealer options →</Link>
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
