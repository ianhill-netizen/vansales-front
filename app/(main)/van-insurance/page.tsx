import type { Metadata } from "next";
import { InsurancePage, insuranceMetadata } from "@/components/insurance/insurance-page";
import { INSURANCE_HUB } from "@/lib/insurance";
import { Container, Eyebrow } from "@/components/ui";
import { IconShield } from "@/components/icons";

export const revalidate = 300;
export const metadata: Metadata = insuranceMetadata(INSURANCE_HUB);

const COVER_TYPES = [
  {
    title: "Third party only",
    description: "The minimum legal cover. Pays for damage or injury you cause to others. Does not cover your own van.",
    badge: "Basic",
    badgeColor: "bg-ink-100 text-ink-600",
  },
  {
    title: "Third party, fire and theft",
    description: "Adds cover for fire damage or theft of your van, on top of third party liability.",
    badge: "Standard",
    badgeColor: "bg-amber-50 text-amber-700",
  },
  {
    title: "Comprehensive",
    description: "Covers damage to your own van as well as third-party claims — the most complete protection.",
    badge: "Fuller cover",
    badgeColor: "bg-brand-tint text-brand-700",
  },
];

const CONSIDERATIONS = [
  { icon: <IconShield width={20} height={20} />, title: "Goods in transit", body: "If you carry tools or stock, a standard policy may not cover them. Ask about goods in transit add-ons." },
  { icon: <IconShield width={20} height={20} />, title: "Business use class", body: "Social and domestic use is not sufficient if you use your van for work. Declare business use accurately or a claim may be refused." },
  { icon: <IconShield width={20} height={20} />, title: "Fleet vs. single vehicle", body: "A fleet policy covers several vans under one arrangement. Ask how a fleet is defined and priced compared with insuring each van separately." },
  { icon: <IconShield width={20} height={20} />, title: "Named drivers vs. any driver", body: "Any-driver policies are convenient; named-driver policies limit who may drive. Ask how each affects the terms." },
  { icon: <IconShield width={20} height={20} />, title: "Breakdown cover", body: "Breakdown cover is usually arranged separately from insurance. Check the weight and size limits on any breakdown policy before relying on it for a van." },
  { icon: <IconShield width={20} height={20} />, title: "ULEZ & LEZ compliance", body: "Some insurers may take emissions standard or fuel type into account. It is worth asking whether it affects your terms." },
];

function HubSections() {
  return (
    <>
      {/* Cover types */}
      <section id="compare" className="scroll-mt-20 py-14">
        <Container>
          <div className="mb-8">
            <Eyebrow>Types of cover</Eyebrow>
            <h2 className="mt-2 font-display text-[length:var(--text-2xl)] font-bold text-ink-900">Which level of cover do you need?</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {COVER_TYPES.map((ct) => (
              <div key={ct.title} className="flex flex-col rounded-[var(--radius-xl)] border border-border bg-white p-7 shadow-[var(--shadow-xs)]">
                <span className={`inline-flex self-start rounded-full px-2.5 py-0.5 text-[length:var(--text-xs)] font-semibold ${ct.badgeColor} mb-4`}>
                  {ct.badge}
                </span>
                <h3 className="font-display text-[length:var(--text-lg)] font-bold text-ink-900">{ct.title}</h3>
                <p className="mt-2 flex-1 text-[length:var(--text-sm)] leading-relaxed text-ink-600">{ct.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Key considerations */}
      <section className="bg-surface-1 py-14">
        <Container>
          <div className="mb-8">
            <Eyebrow>What to check</Eyebrow>
            <h2 className="mt-2 font-display text-[length:var(--text-2xl)] font-bold text-ink-900">6 things to get right</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CONSIDERATIONS.map((c) => (
              <div key={c.title} className="rounded-[var(--radius-xl)] border border-border bg-white p-6 shadow-[var(--shadow-xs)]">
                <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-brand-tint text-brand-600">
                  {c.icon}
                </div>
                <h3 className="font-display text-[length:var(--text-base)] font-bold text-ink-900">{c.title}</h3>
                <p className="mt-1.5 text-[length:var(--text-sm)] leading-relaxed text-ink-600">{c.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

    </>
  );
}

export default function Page() {
  return <InsurancePage page={INSURANCE_HUB} isHub><HubSections /></InsurancePage>;
}
