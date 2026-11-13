/** /van-finance FAQ: one source for the visible Q&A and the FAQPage JSON-LD. Generic, information only, no rates, figures or promises. */
export const VAN_FINANCE_FAQ: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: "Can I get van finance as a sole trader?",
    a: "Often yes, but lenders look harder at sole traders, especially in the first two years of trading. Expect to be asked for bank statements or tax returns, and possibly for a larger deposit. A lender decides each application on its own criteria, so approval is never certain.",
  },
  {
    q: "Can I finance a van over 10 years old?",
    a: "It is harder. Many lenders set a maximum age for the van at the end of the agreement, so an older van leaves fewer lenders to choose from, and some will not consider it at all. A shorter term or a bigger deposit can help, but there is no guarantee.",
  },
  {
    q: "Do I need a deposit?",
    a: "Some agreements need one and some do not, and the amount depends on the lender, the van and your circumstances. A larger deposit usually means a smaller amount borrowed and less interest paid overall, and it can improve your chances with a cautious lender.",
  },
  {
    q: "Is VAT added on HP?",
    a: "It depends on the van and on you. VAT on a van sold by a VAT-registered dealer is normally part of the price and is often financed or paid at the start. If you are VAT-registered and the van is for business use you may be able to reclaim it. Check with your accountant and ask the seller for a written breakdown.",
  },
  {
    q: "Can I settle early?",
    a: "Usually yes. You have a legal right to settle a regulated credit agreement early, and the lender must give you a settlement figure on request. You may pay less interest overall, though some agreements include an early settlement charge, so read the agreement and ask for the figure first.",
  },
  {
    q: "What does Vansales do with my budget?",
    a: "The details you enter in the form (your name, contact details and budget range) are used to follow up your enquiry about van finance. They go to Swiss Vans Ltd, which trades as Vansales.com, and are used only for Swiss Vans stock; they are not published or sold. Submitting the form does not apply for credit and is not an offer of finance.",
  },
];

export function vanFinanceFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: VAN_FINANCE_FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}
