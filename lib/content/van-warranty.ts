import type { Section } from "./copy";

/** /van-warranty. Replaces the two backend guides used-van-warranty-options and used-van-warranty-guide-uk (their unique facts are merged here; their /blog URLs 301 here).
 *  Rules (enforced by lib/content/copy.test.ts): 1,200-1,500 words, no provider names, no prices, no affiliate links. Vansales does not sell or arrange warranties. */
export const WARRANTY_INTRO: string[] = [
  "A used van warranty is a contract that pays for repairs to named mechanical and electrical parts if they fail within an agreed period or mileage. It is not insurance for accidents, it does not pay for servicing or wear items such as tyres and brake pads, and it is only as good as its wording. This page explains the three kinds you will meet when buying a used van, what they usually cover and exclude, how claims work and what to ask before you commit.",
  "Vansales does not sell, arrange or recommend any warranty. Dealers on Vansales set their own terms, so ask the seller for the policy wording in writing before you buy.",
];

export const WARRANTY_SECTIONS: Section[] = [
  {
    id: "types",
    h2: "Dealer, manufacturer or third-party warranty",
    blocks: [
      { p: "Most used vans come with one of three kinds of cover, and some have more than one." },
      { h3: "Manufacturer warranty" },
      { p: "A newer van may still have part of its factory warranty left. It is usually counted from first registration, in years with a mileage limit, and normally passes to the next keeper with the van. It is the most complete cover you can get, but only if the van has been serviced to the manufacturer's schedule and the paperwork proves it. Ask for the service history and for the date and mileage the cover ends." },
      { h3: "Dealer warranty" },
      { p: "Many dealers include a warranty of a few months, sometimes up to a year. Some are funded by the dealer itself and some are insured or administered by a third party. Quality varies: some cover the full mechanical and electrical list, others only the engine and gearbox, and many cap the amount per claim and the hourly labour rate. If the dealer funds it, the promise is only as good as the dealer, so ask who pays the claim." },
      { h3: "Third-party (aftermarket) warranty" },
      { p: "You can buy a policy yourself from a warranty company, usually for twelve months at a time and often renewable. It suits an older or higher-mileage van outside the manufacturer's cover. Check the van is eligible: many policies set age and mileage limits, a waiting period before you can claim, and a duty to service on time." },
    ],
  },
  {
    id: "rights",
    h2: "Your legal rights as the buyer",
    blocks: [
      { p: "A warranty sits on top of your legal rights; it does not replace them, and which rights you have depends on who you are buying as. If you buy wholly or mainly outside any trade or business, the Consumer Rights Act 2015 applies: the van must be of satisfactory quality, fit for purpose and as described. You have a short right to reject a faulty van within 30 days, and for faults in the first six months the seller generally has to show the fault was not there at the point of sale." },
      { p: "If you buy the van for your business, whether you are a sole trader or a limited company, you are treated as a business buyer. The Sale of Goods Act 1979 then applies, and a seller may limit some terms if the limit is reasonable. That makes a clear written warranty more important, not less. If you are unsure which applies, ask Citizens Advice or a solicitor." },
    ],
  },
  {
    id: "covered",
    h2: "What a van warranty usually covers and excludes",
    blocks: [
      { p: "Cover is listed by component, so read the list, not the headline. Mid and top tiers usually include the engine internals, gearbox and driveline, turbocharger, fuel pump, steering rack, alternator, starter and the main electronic modules. These are the items that are often limited or excluded, so check each one by name:" },
      { ul: [
        "Wet belts. Many modern diesels run the timing belt in the engine oil. A wet belt that fails can wreck the engine, yet some policies exclude the belt, the oil pump pick-up, or any claim without proof of timed replacement.",
        "DPF and EGR valve. Emissions parts are expensive and often excluded or limited, particularly on a van used mostly for short runs.",
        "AdBlue and SCR parts: pumps, heaters and sensors on Euro 6 vans.",
        "Injectors. Often excluded, or paid only if the fault was not caused by contaminated fuel.",
        "Clutch and dual-mass flywheel. A clutch is a wear item, so it is usually excluded or covered only for the sudden failure of a specific part.",
        "Wear and tear. Basic policies pay only for sudden and unforeseen failure; higher tiers include gradual wear, which matters for a working van.",
        "Consumables: tyres, brakes, wipers, bulbs, batteries, filters, fluids and servicing.",
      ] },
    ],
  },
  {
    id: "cost",
    h2: "What a van warranty costs",
    blocks: [
      { p: "Price depends on the van's age and mileage, the level of cover, the claim limit, how long it lasts and the excess. As a rough guide only, a basic engine-and-gearbox policy on a van a few years old typically costs from a few hundred pounds for a year, mid-level cover costs somewhat more, and comprehensive cover on a newer or higher-value van can run to four figures. Older, higher-mileage vans cost more to cover and may be refused. These are indicative ranges, not quotes or offers: get the terms in writing and compare the claim limit, labour rate and exclusions as well as the price." },
    ],
  },
  {
    id: "claims",
    h2: "How a claim works",
    blocks: [
      { ul: [
        "Stop driving when a warning light comes on. Carrying on can turn a covered fault into an excluded one.",
        "Contact the administrator before any repair starts. Most policies refuse a claim where work began without authorisation.",
        "Use a garage the policy allows. You may be asked for a diagnosis first, and teardown costs are normally repaid only if the claim is accepted.",
        "Keep service records, invoices and MOT history. Missed servicing is one of the most common reasons for a refusal.",
        "The policy pays up to its claim limit and labour rate, less any excess. You pay the rest.",
      ] },
    ],
  },
  {
    id: "ask",
    h2: "Questions to ask the dealer",
    blocks: [
      { ul: [
        "Who pays the claim: the dealer, or a named insurer or administrator?",
        "How long does cover last, from what date, and is there a mileage limit?",
        "Can I see the full policy wording and the list of covered and excluded parts before I buy?",
        "Are wet belts, DPF, EGR, AdBlue and SCR parts, injectors, turbo, clutch and dual-mass flywheel covered?",
        "What are the limit per claim and in total, the hourly labour rate and the excess?",
        "Do I have to use your garage, or can I choose?",
        "What servicing do I need to keep up to stay covered?",
        "Can the cover be extended, and does it pass to the next owner when I sell?",
      ] },
    ],
  },
  {
    id: "models",
    h2: "Warranty by model",
    blocks: [
      { p: "The same questions matter on every van, but each model has its own points to check. These are things to ask about, not predictions about any particular van." },
      { h3: "Ford Transit" },
      { p: "Recent Transits use 2.0-litre EcoBlue diesels with a timing belt that runs in oil, so ask whether the policy covers the wet belt and oil pump. Cover for the DPF and AdBlue parts matters on Euro 6 vans. See [used Ford Transit for sale](/used-vans/ford/transit-for-sale)." },
      { h3: "Ford Transit Custom" },
      { p: "Later Transit Customs use the same 2.0-litre EcoBlue engine, so the wet-belt question applies here too. If the van has an automatic gearbox, check that the gearbox is on the cover list. See [used Ford Transit Custom for sale](/used-vans/ford/transit-custom-for-sale)." },
      { h3: "Volkswagen Transporter" },
      { p: "Most used Transporters have a 2.0-litre TDI. Check the cover for the DPF, EGR valve and, on later vans, AdBlue parts, and whether a DSG automatic gearbox is covered, as some policies limit or exclude it. See [used Volkswagen Transporter for sale](/used-vans/volkswagen/transporter-for-sale)." },
      { h3: "Mercedes-Benz Sprinter" },
      { p: "Euro 6 Sprinters have AdBlue and a DPF, so compare cover for the emissions system, and check whether the engine has a belt or a chain. Main-dealer labour rates on a larger van can be high, so compare the policy's labour cap with them. See [used Mercedes-Benz Sprinter for sale](/used-vans/mercedes-benz/sprinter-for-sale)." },
      { h3: "Vauxhall Vivaro" },
      { p: "The Vivaro sold from 2014 to 2019 and the one sold from 2019 are different vans with different engines, so make sure the policy lists the right one. Ask about turbo, injector and emissions cover on the diesels. See [used Vauxhall Vivaro for sale](/used-vans/vauxhall/vivaro-for-sale)." },
    ],
  },
  {
    id: "related",
    h2: "Related guides",
    blocks: [
      { p: "Cover for the road is separate: see [van breakdown cover](/van-breakdown-cover) and [van insurance](/van-insurance). To spread the cost of a van, see [van finance](/van-finance)." },
    ],
  },
];

export const WARRANTY_FAQ: ReadonlyArray<{ q: string; a: string }> = [
  { q: "Is a used van warranty worth having?", a: "It can be, if the cover list matches the parts most likely to fail on your van and the claim limit and labour rate are realistic. A cheap policy with long exclusion lists can be worth very little. Compare the wording, not just the price, and keep your legal rights in mind as well." },
  { q: "Does a van warranty cover wear and tear?", a: "Basic policies usually pay only for sudden and unforeseen failure. Higher tiers add gradual wear, and some exclude wear items such as the clutch altogether. Check the wording for the specific parts you care about." },
  { q: "Are wet belts, DPFs and injectors covered?", a: "Often they are limited or excluded, so ask by name. Some policies cover a wet belt only with proof it was replaced on time, and emissions parts such as the DPF and EGR valve are frequently capped or left out." },
  { q: "Can I claim if I have missed a service?", a: "Often not. Most policies, and manufacturer warranties, require servicing to the schedule with proof, and a missed service is a common reason for a claim to be refused. Keep every invoice." },
  { q: "Does a manufacturer warranty transfer to the next owner?", a: "Usually yes for the remaining period and mileage, because it follows the van rather than the person. Confirm the end date and mileage with the seller, and check the service history is complete." },
  { q: "What is the difference between a warranty and insurance?", a: "A warranty pays for mechanical and electrical failure of named parts. Insurance covers accident, fire and theft and liability to others. You need insurance by law; a warranty is optional. Vansales does not arrange either." },
];
