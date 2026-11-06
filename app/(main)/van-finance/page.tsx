import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { Container, Eyebrow, Button } from "@/components/ui";
import { IconArrow, IconCheck } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { FinanceEnquiryForm } from "@/components/finance/finance-enquiry-form";
import { absUrl } from "@/lib/site";

// Targets "van finance", "used van finance" and "van hire purchase". Meta title is exact (absolute: no site suffix is added on top).
const TITLE = "Used Van Finance | Vansales.com";
const DESCRIPTION = "Used van finance explained: van hire purchase (HP), PCP and finance lease compared. Tell us your budget and we will get back to you.";
const base = pageMeta({ title: "Used Van Finance", description: DESCRIPTION, path: "/van-finance" });
export const metadata: Metadata = {
  ...base,
  title: { absolute: TITLE },
  openGraph: { ...base.openGraph, title: TITLE },
  twitter: { ...base.twitter, title: TITLE },
};

const PRODUCTS = [
  {
    name: "Van hire purchase (HP)",
    tag: "Own at the end",
    description: "Pay a deposit, then fixed monthly instalments. Own the van outright once the final payment is made. Simple, predictable, and you build equity from day one.",
    pros: ["You own the van at the end", "No annual mileage limit", "Fixed rate, fixed term", "Easy to budget for"],
    best: "Best for: businesses that want to own their assets",
  },
  {
    name: "PCP (Personal/Business Contract Purchase)",
    tag: "Flexible exit",
    description: "Lower monthly payments because you defer a large 'balloon' at the end. At term you can own the van, hand it back, or use equity as a deposit on your next one.",
    pros: ["Lower monthly payments than HP", "Flexible end-of-contract options", "Suits mileage-conscious buyers", "Good if you upgrade regularly"],
    best: "Best for: buyers who want flexibility or low monthly cost",
  },
  {
    name: "Finance Lease",
    tag: "Business only",
    description: "Lease the van long-term and pay a final residual. The funder retains ownership — often more tax efficient for VAT-registered businesses. Popular with tradespeople.",
    pros: ["Often lower deposit requirement", "VAT-registered businesses can reclaim input VAT", "No balloon ownership risk", "Suited to high-mileage operators"],
    best: "Best for: VAT-registered businesses, high mileage operators",
  },
];

const TIPS = [
  "Always compare the total cost of credit, not just the monthly payment",
  "A larger deposit means lower interest payments overall",
  "Check whether the rate is fixed — some PCP deals have variable elements",
  "Ask about settlement figures before signing — understand your exit costs",
  "Pre-approval gives you negotiating power at the dealership",
];

export default function VanFinancePage() {
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
      { "@type": "ListItem", position: 2, name: "Used van finance", item: absUrl("/van-finance") },
    ],
  };
  return (
    <>
      <JsonLd data={[breadcrumb, { "@context": "https://schema.org", "@type": "Service", name: "Used Van Finance", description: DESCRIPTION, url: absUrl("/van-finance"), provider: { "@type": "Organization", name: "Vansales", url: absUrl("/") }, areaServed: { "@type": "Country", name: "GB" } }]} />
      {/* Hero */}
      <section className="border-b border-border bg-surface-1">
        <Container className="py-14">
          <div className="max-w-2xl">
            <Eyebrow>Van finance</Eyebrow>
            <h1 className="mt-3 font-display text-[length:var(--text-3xl)] font-extrabold leading-tight text-ink-900">Used Van Finance UK</h1>
            <p className="mt-2 font-display text-[length:var(--text-xl)] font-bold text-brand-500">Keep cash in the business.</p>
            <p className="mt-4 text-[length:var(--text-md)] leading-relaxed text-ink-600">
              Van finance lets you buy a used van without tying up working capital. This guide explains the
              main options — van hire purchase (HP), PCP and finance lease — so you can choose the right
              structure for your business, then tell us your budget and we will get back to you.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href="#enquire" variant="primary" size="lg">
                Tell us your budget <IconArrow width={18} height={18} />
              </Button>
              <Button href="#products" variant="outline" size="lg">Compare products</Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Products */}
      <section id="products" className="scroll-mt-20 py-14">
        <Container>
          <div className="mb-8">
            <Eyebrow>Finance options</Eyebrow>
            <h2 className="mt-2 font-display text-[length:var(--text-2xl)] font-bold text-ink-900">HP, PCP or Finance Lease?</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {PRODUCTS.map((p) => (
              <div key={p.name} className="flex flex-col rounded-[var(--radius-xl)] border border-border bg-white p-7 shadow-[var(--shadow-xs)]">
                <span className="inline-flex self-start rounded-full bg-brand-tint px-2.5 py-0.5 text-[length:var(--text-xs)] font-semibold text-brand-700 mb-4">
                  {p.tag}
                </span>
                <h3 className="font-display text-[length:var(--text-lg)] font-bold text-ink-900">{p.name}</h3>
                <p className="mt-2 text-[length:var(--text-sm)] leading-relaxed text-ink-600">{p.description}</p>
                <ul className="mt-4 flex-1 space-y-2">
                  {p.pros.map((pr) => (
                    <li key={pr} className="flex items-start gap-2.5 text-[length:var(--text-sm)] text-ink-700">
                      <IconCheck width={14} height={14} className="mt-0.5 shrink-0 text-success-600" />
                      {pr}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-[length:var(--text-xs)] font-semibold text-ink-500">{p.best}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Enquiry */}
      <section id="enquire" className="scroll-mt-20 py-14">
        <Container>
          <div className="mx-auto max-w-2xl">
            <Eyebrow>Used van finance enquiry</Eyebrow>
            <h2 className="mt-2 font-display text-[length:var(--text-2xl)] font-bold text-ink-900">Tell us your budget</h2>
            <p className="mt-2 text-[length:var(--text-sm)] text-ink-600">Leave your details and a van budget and we will get back to you about used van finance.</p>
            <div className="mt-5"><FinanceEnquiryForm /></div>
          </div>
        </Container>
      </section>

      {/* Tips */}
      <section className="bg-surface-1 py-14">
        <Container>
          <div className="mx-auto max-w-2xl">
            <Eyebrow>Buyer tips</Eyebrow>
            <h2 className="mt-2 font-display text-[length:var(--text-2xl)] font-bold text-ink-900">5 things to check before you sign</h2>
            <ul className="mt-5 space-y-3">
              {TIPS.map((tip, i) => (
                <li key={tip} className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-border bg-white p-4 shadow-[var(--shadow-xs)]">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-tint font-mono text-[length:var(--text-sm)] font-bold text-brand-600">
                    {i + 1}
                  </span>
                  <span className="text-[length:var(--text-sm)] leading-relaxed text-ink-700">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* Honest note */}
      <section className="py-14">
        <Container>
          <div className="mx-auto max-w-2xl">
            <Eyebrow>Important</Eyebrow>
            <h2 className="mt-2 font-display text-[length:var(--text-xl)] font-bold text-ink-900">We&apos;re not a lender</h2>
            <p className="mt-3 text-[length:var(--text-md)] leading-relaxed text-ink-600">
              Vansales provides this guide for information only. We do not lend money, nor are we authorised
              to give financial advice. For a personalised quote, speak to an authorised finance broker or
              your bank. Always read the full credit agreement before signing.
            </p>
            <div className="mt-5 rounded-[var(--radius-lg)] border border-amber-200 bg-amber-50 p-5">
              <p className="text-[length:var(--text-sm)] font-semibold text-amber-800">Finance is credit. Think carefully before using any loan to buy a vehicle. Your van may be repossessed if you do not keep up repayments.</p>
            </div>
            <p className="mt-6 text-[length:var(--text-sm)] text-ink-500">
              Looking at specific stock?{" "}
              <Link href="/vans" className="font-semibold text-brand-600 hover:underline">Browse available vans →</Link>{" · "}
              <Link href="/used-vans" className="font-semibold text-brand-600 hover:underline">Used vans by make and model →</Link>
            </p>
            <p className="mt-3 text-[length:var(--text-sm)] text-ink-500">
              Weighing up your options?{" "}
              <Link href="/van-lease-deals" className="font-semibold text-brand-600 hover:underline">Van lease deals explained →</Link>{" · "}
              <Link href="/hire-purchase-vans" className="font-semibold text-brand-600 hover:underline">Hire purchase vans explained →</Link>
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
