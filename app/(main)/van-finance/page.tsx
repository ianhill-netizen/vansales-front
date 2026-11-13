import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { Container, Eyebrow, Button } from "@/components/ui";
import { IconArrow } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { FinanceEnquiryForm } from "@/components/finance/finance-enquiry-form";
import { FinanceDisclosure } from "@/components/finance/finance-disclosure";
import { VAN_FINANCE_FAQ, vanFinanceFaqSchema } from "@/lib/van-finance-faq";
import { loadCatalogue } from "@/lib/seo/catalogue";
import { isSwissVans } from "@/lib/listings/finance-scope";
import { vatOnTop } from "@/lib/listings/vat";
import { slugify } from "@/lib/listings/slug";
import { getLiveBodyTypeSlugs } from "@/lib/content/body-type-pages";
import { BODY_TYPE_PAGES, bodyTypePath } from "@/lib/used-vans/body-types";
import { DEFAULT_TERMS } from "@/lib/finance";
import { absUrl } from "@/lib/site";

// Targets "van finance", "used van finance" and "van hire purchase". Meta title is exact (absolute: no site suffix is added on top).
const TITLE = "Used Van Finance | Vansales.com";
const DESCRIPTION = "Used van finance explained: HP, PCP and finance lease, typical deposits by van, and why lenders say no. Tell us your budget and we'll match you.";
const base = pageMeta({ title: "Used Van Finance", description: DESCRIPTION, path: "/van-finance" });
export const metadata: Metadata = {
  ...base,
  title: { absolute: TITLE },
  openGraph: { ...base.openGraph, title: TITLE },
  twitter: { ...base.twitter, title: TITLE },
};

const PRODUCTS = [
  {
    name: "Hire purchase (HP)",
    tag: "Own at the end",
    text: "You pay a deposit, then fixed monthly payments over an agreed term, and the van is yours once the last payment (and any small option-to-purchase fee) is made. There is no mileage limit, because you are buying the van, and the payments are easy to budget for. It suits buyers who want to own the van and keep it.",
  },
  {
    name: "PCP (personal contract purchase)",
    tag: "Lower monthly payments",
    text: "PCP keeps the monthly payments down by deferring a large final payment, often called the balloon. At the end you can pay it and keep the van, hand the van back, or part-exchange it, depending on its value then. The agreement sets a mileage limit and charges for going over it, and on used vans PCP is less common because lenders have to forecast the future value of an older van.",
  },
  {
    name: "Finance lease",
    tag: "Business only",
    text: "With a finance lease the lender owns the van and you pay rentals for the term. It is for businesses, not individuals. At the end the van is normally sold and you may receive a share of the proceeds, or you can sometimes carry on renting. Mileage and condition terms vary by lender, so read them before you sign.",
  },
] as const;

const COMPARE: { row: string; cells: readonly [string, string, string] }[] = [
  { row: "Own the van at the end?", cells: ["Yes, after the final payment", "Only if you pay the final payment", "No, the lender owns it"] },
  { row: "Mileage limit?", cells: ["No", "Yes, set in the agreement", "Often yes; varies by lender"] },
  { row: "VAT treatment", cells: ["VAT usually due up front or financed; reclaimable if you are VAT-registered and the van is for business use", "As HP", "VAT is charged on each rental; VAT-registered businesses can usually reclaim it"] },
  { row: "Best for", cells: ["Buyers who want to keep the van", "Buyers who want lower monthly payments and a choice at the end", "VAT-registered businesses that do not need to own the van"] },
];

const PRICE_MODELS: { label: string; make: string; model: string }[] = [
  { label: "Ford Transit Custom", make: "ford", model: "transit-custom" },
  { label: "Volkswagen Transporter", make: "volkswagen", model: "transporter" },
  { label: "Vauxhall Vivaro", make: "vauxhall", model: "vivaro" },
  { label: "Mercedes-Benz Sprinter", make: "mercedes-benz", model: "sprinter" },
  { label: "Volkswagen Caddy", make: "volkswagen", model: "caddy" },
  { label: "Citroën Berlingo", make: "citroen", model: "berlingo" },
];

const MAKE_LINES: { slug: string; label: string }[] = [
  { slug: "ford", label: "Ford" }, { slug: "volkswagen", label: "Volkswagen" }, { slug: "mercedes-benz", label: "Mercedes-Benz" },
  { slug: "vauxhall", label: "Vauxhall" }, { slug: "renault", label: "Renault" }, { slug: "citroen", label: "Citroën" },
];

const TYPE_NOTES: Record<string, string> = {
  "panel-van": "The most commonly financed body type, so the most lenders will consider one.",
  luton: "Bodies and tail-lifts add to the value, and lenders often want to see the body details on the invoice.",
  tipper: "Specialist bodies are valued differently, so the choice of lenders can be narrower.",
  dropside: "Similar to tippers: the body matters to the valuation, so check the spec carefully.",
  "crew-van": "Seats and a second row can bring a van closer to car-style lending rules.",
  pickup: "Many pickups are financed as commercial vehicles, but private use changes the VAT and tax picture.",
  minibus: "Passenger vehicles may need different cover and licences, which some lenders check.",
  "chassis-cab": "Bare chassis are usually financed together with the body that goes on them.",
};

const gbp = (n: number) => `£${Math.round(n).toLocaleString("en-GB")}`;

export default async function VanFinancePage() {
  const [idx, liveTypes] = await Promise.all([loadCatalogue(), getLiveBodyTypeSlugs().catch(() => new Set<string>())]);
  const depositPct = DEFAULT_TERMS.depositPct;
  // Finance is Swiss Vans Ltd stock only, so every figure below comes from Swiss Vans vans that are listed right now.
  const swiss = idx.all.filter((l) => isSwissVans(l) && l.price != null && l.price > 0);
  const priceRows = PRICE_MODELS.map((m) => {
    const vans = swiss.filter((l) => slugify(l.make) === m.make && slugify(l.model) === m.model);
    const prices = vans.map((l) => l.price as number);
    const lo = prices.length ? Math.min(...prices) : null, hi = prices.length ? Math.max(...prices) : null;
    const dep = (n: number) => gbp(n * depositPct / 100);
    return { label: m.label, count: vans.length, band: lo == null ? null : hi !== lo ? `${gbp(lo)} to ${gbp(hi!)}` : gbp(lo), deposit: lo == null ? null : hi !== lo ? `${dep(lo)} to ${dep(hi!)}` : dep(lo) };
  });
  // The representative example is worked out for the Swiss Vans van priced nearest the middle of Swiss Vans' current stock (live, never a fixed figure).
  const sorted = [...swiss].sort((x, y) => (x.price as number) - (y.price as number));
  const exampleVan = sorted.length ? sorted[Math.floor(sorted.length / 2)] : null;
  const typeLines = BODY_TYPE_PAGES.filter((b) => liveTypes.has(b.slug) && TYPE_NOTES[b.slug]);
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
      <JsonLd data={[breadcrumb, vanFinanceFaqSchema(), { "@context": "https://schema.org", "@type": "Service", name: "Used Van Finance", description: DESCRIPTION, url: absUrl("/van-finance"), provider: { "@type": "Organization", name: "Vansales", url: absUrl("/") }, areaServed: { "@type": "Country", name: "GB" } }]} />
      {/* Hero */}
      <section className="border-b border-border bg-surface-1">
        <Container className="py-14">
          <div className="max-w-2xl">
            <Eyebrow>Van finance</Eyebrow>
            <h1 className="mt-3 font-display text-[length:var(--text-3xl)] font-extrabold leading-tight text-ink-900">Used Van Finance UK</h1>
            <p className="mt-2 font-display text-[length:var(--text-xl)] font-bold text-brand-500">Keep cash in the business.</p>
            <p className="mt-4 text-[length:var(--text-md)] leading-relaxed text-ink-600">
              Finance on Vansales is available on vans from Swiss Vans Ltd. You find a van on the marketplace and send an enquiry, which goes straight to the seller. If the van is a Swiss Vans van and you want to spread the cost, you tell us your budget in the form below. Vansales.com is a trading name of Swiss Vans Ltd, which can introduce you to a limited number of lenders; the full regulatory wording is at the foot of this page.
            </p>
            <p className="mt-3 text-[length:var(--text-md)] leading-relaxed text-ink-600">
              The lender, not Vansales, decides whether to accept your application, on what terms and at what rate. The rate and the monthly payment depend on you, the van, the deposit and the term, so the only figure we show is the representative example, calculated from the current rate. Nothing on this page is an offer of credit or a quote. Vans sold by other dealers and by private sellers are not part of this finance service.
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
          <div className="mb-8 max-w-3xl">
            <Eyebrow>Finance options</Eyebrow>
            <h2 className="mt-2 font-display text-[length:var(--text-2xl)] font-bold text-ink-900">HP, PCP or finance lease</h2>
            <div className="mt-5 space-y-5">
              {PRODUCTS.map((p) => (
                <div key={p.name}>
                  <h3 className="font-display text-[length:var(--text-lg)] font-bold text-ink-900">{p.name}</h3>
                  <p className="mt-1 text-[length:var(--text-md)] leading-relaxed text-ink-600">{p.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-[length:var(--text-sm)]">
              <caption className="sr-only">HP, PCP and finance lease compared</caption>
              <thead>
                <tr className="border-b border-border text-ink-900">
                  <th scope="col" className="py-2 pr-4 font-semibold"><span className="sr-only">Feature</span></th>
                  {PRODUCTS.map((p) => <th key={p.name} scope="col" className="py-2 pr-4 font-semibold">{p.name.split(" (")[0]}</th>)}
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((r) => (
                  <tr key={r.row} className="border-b border-border align-top">
                    <th scope="row" className="py-2.5 pr-4 font-semibold text-ink-900">{r.row}</th>
                    {r.cells.map((c, i) => <td key={i} className="py-2.5 pr-4 text-ink-600">{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {/* What used vans cost on finance */}
      <section className="bg-surface-1 py-14">
        <Container>
          <div className="max-w-3xl">
            <h2 className="font-display text-[length:var(--text-2xl)] font-bold text-ink-900">What used vans typically cost on finance</h2>
            <p className="mt-3 text-[length:var(--text-md)] leading-relaxed text-ink-600">
              Lenders finance the price of the van less your deposit, so the price you pay and the deposit you put down set the size of the loan. The table shows the price range of the Swiss Vans used vans listed right now for six common models, and the deposit that would be if you put down {depositPct}% of the price. We do not show monthly payments here, because they depend on the lender, the term and your circumstances.
            </p>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-[length:var(--text-sm)]">
              <caption className="sr-only">Used price range and a {depositPct}% deposit for six common van models</caption>
              <thead>
                <tr className="border-b border-border text-ink-900">
                  <th scope="col" className="py-2 pr-4 font-semibold">Model</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Used price range now</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">{depositPct}% deposit</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Vans listed</th>
                </tr>
              </thead>
              <tbody>
                {priceRows.map((r) => (
                  <tr key={r.label} className="border-b border-border">
                    <th scope="row" className="py-2.5 pr-4 font-semibold text-ink-900">{r.label}</th>
                    <td className="py-2.5 pr-4 text-ink-600">{r.band ?? "No stock right now"}</td>
                    <td className="py-2.5 pr-4 text-ink-600">{r.deposit ?? "Not available"}</td>
                    <td className="py-2.5 pr-4 font-mono text-ink-600">{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 max-w-3xl text-[length:var(--text-xs)] leading-relaxed text-ink-500">
            Source: Swiss Vans vans listed on Vansales, read when this page was last built (refreshed every few minutes). The deposit is {depositPct}% of the price, the default in the Vansales finance calculator; you can choose any deposit from 0% to 50% there. Lenders set their own deposit requirements, and a range of listed prices is not a quote for any particular van.
          </p>
          {exampleVan && (
            <div className="mt-6 max-w-xl">
              <FinanceDisclosure example={{ price: exampleVan.price as number, warranties: exampleVan.warranty_addons ?? [], finance: exampleVan.finance ?? null, vatQualifying: vatOnTop(exampleVan.vat_status) }} />
            </div>
          )}
        </Container>
      </section>

      {/* Why lenders say no */}
      <section className="py-14">
        <Container>
          <div className="max-w-3xl">
            <h2 className="font-display text-[length:var(--text-2xl)] font-bold text-ink-900">Why lenders say no on used vans</h2>
            <p className="mt-3 text-[length:var(--text-md)] leading-relaxed text-ink-600">
              A decline is rarely about one thing, and it is not always final. These are the reasons we see most often for used vans.
            </p>
            <ul className="mt-4 space-y-3 text-[length:var(--text-md)] leading-relaxed text-ink-600">
              <li><strong className="text-ink-900">Age and mileage caps.</strong> Many lenders set a maximum age for the van at the end of the agreement and a maximum mileage. The older the van and the higher the mileage, the fewer lenders will consider it, however good the van is.</li>
              <li><strong className="text-ink-900">Sole traders and new businesses.</strong> A business trading for under two years has little history for a lender to judge. You may be asked for bank statements or a larger deposit, and some lenders will not lend at all until the business has filed accounts.</li>
              <li><strong className="text-ink-900">Adverse credit.</strong> County court judgments, defaults, missed payments and an IVA or bankruptcy all count against an application. Some lenders specialise in them, usually with a bigger deposit and a different cost of borrowing.</li>
              <li><strong className="text-ink-900">Non-UK licences and addresses.</strong> Lenders usually want a settled UK address history and a driving licence they can check. A non-UK licence or a recent move to the UK can lead to a decline.</li>
              <li><strong className="text-ink-900">Vans over 3.5 tonnes.</strong> Heavier vehicles are a different market. Fewer lenders fund them, the checks differ, and you may also need an operator&apos;s licence.</li>
            </ul>
            <p className="mt-4 text-[length:var(--text-md)] leading-relaxed text-ink-600">
              Each application leaves a mark on your credit file, so avoid applying to several lenders at once. Ask a broker or the seller what a lender is likely to accept before you apply.
            </p>
          </div>
        </Container>
      </section>

      {/* Finance by van type */}
      <section className="bg-surface-1 py-14">
        <Container>
          <div className="max-w-3xl">
            <h2 className="font-display text-[length:var(--text-2xl)] font-bold text-ink-900">Finance by van type</h2>
            <ul className="mt-4 space-y-2 text-[length:var(--text-md)] leading-relaxed text-ink-600">
              {typeLines.map((b) => (
                <li key={b.slug}>
                  <Link href={bodyTypePath(b)} className="font-semibold text-brand-700 hover:underline">Used {b.label} for sale</Link>: {TYPE_NOTES[b.slug]}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[length:var(--text-md)] leading-relaxed text-ink-600">
              By make:{" "}
              {MAKE_LINES.map((m, i) => (
                <span key={m.slug}>
                  <Link href={`/vans/${m.slug}-vans-for-sale`} className="font-semibold text-brand-700 hover:underline">{m.label} vans for sale</Link>
                  {i < MAKE_LINES.length - 2 ? ", " : i === MAKE_LINES.length - 2 ? " and " : "."}
                </span>
              ))}
            </p>
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
            <p className="mt-2 text-[length:var(--text-sm)] font-semibold text-ink-700">This form is for Swiss Vans stock only. Your enquiry goes to Swiss Vans Ltd, which trades as Vansales.com, and covers vans that Swiss Vans has for sale.</p>
            <div className="mt-5"><FinanceEnquiryForm /></div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="bg-surface-1 py-14">
        <Container>
          <div className="mx-auto max-w-2xl">
            <Eyebrow>Questions</Eyebrow>
            <h2 className="mt-2 font-display text-[length:var(--text-2xl)] font-bold text-ink-900">Van finance questions</h2>
            <dl className="mt-5 divide-y divide-border overflow-hidden rounded-[var(--radius-xl)] border border-border bg-white">
              {VAN_FINANCE_FAQ.map((f) => (
                <div key={f.q} className="px-5 py-4">
                  <dt className="font-display text-[length:var(--text-md)] font-bold text-ink-900">{f.q}</dt>
                  <dd className="mt-1 text-[length:var(--text-sm)] leading-relaxed text-ink-600">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      {/* Honest note */}
      <section className="py-14">
        <Container>
          <div className="mx-auto max-w-2xl">
            <div className="mt-5 rounded-[var(--radius-lg)] border border-amber-200 bg-amber-50 p-5">
              <p className="text-[length:var(--text-sm)] font-semibold text-amber-800">Finance is credit. Think carefully before using any loan to buy a vehicle. Your van may be repossessed if you do not keep up repayments.</p>
            </div>
            <p className="mt-5 text-[length:var(--text-xs)] leading-relaxed text-ink-500">Finance is subject to status. 18+, UK residents.</p>
            <FinanceDisclosure className="mt-1.5" />
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
            <p className="mt-3 text-[length:var(--text-sm)] text-ink-500">
              Cover for the van?{" "}
              <Link href="/van-warranty" className="font-semibold text-brand-600 hover:underline">Van warranty explained →</Link>{" · "}
              <Link href="/van-breakdown-cover" className="font-semibold text-brand-600 hover:underline">Van breakdown cover →</Link>
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
