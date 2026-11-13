/** Home page FAQ: one source for the visible Q&A and the FAQPage JSON-LD, so the markup always matches what is on the page. Plain text only. */
export const HOME_FAQ: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: "Is Vansales.com a dealer?",
    a: "No. Vansales.com is a marketplace. The vans are listed by UK dealers and private sellers, and your enquiry goes straight to the seller, so the price and the sale are between you and them.",
  },
  {
    q: "Are the vans HPI checked?",
    a: "Vans that have been HPI checked carry an HPI badge. Not every van has been checked, so look for the badge on the advert and ask the seller if you are unsure.",
  },
  {
    q: "Can private sellers list for free?",
    a: "Yes. Private sellers list free in about five minutes. Enquiries come straight to you, and we never share your number.",
  },
  {
    q: "Are prices plus VAT?",
    a: "It depends on the van. Each advert shows its VAT status on the price: a price labelled as including VAT has VAT in it. If an advert shows no VAT label, ask the seller before you buy.",
  },
  {
    q: "Can I search vans near me?",
    a: "Yes. Enter your postcode or use the near-me option to see vans closest to you first, or open the map and drag it around to see what is nearby. You can also set a search radius.",
  },
];

export function homeFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOME_FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
