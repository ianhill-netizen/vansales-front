import type { Section } from "./copy";

/** /van-breakdown-cover. Rules (enforced by lib/content/copy.test.ts): 1,000-1,200 words, no provider names, no prices, no affiliate links. Vansales does not sell or arrange breakdown cover. */
export const BREAKDOWN_INTRO: string[] = [
  "Breakdown cover pays for help when your van stops working on the road: a mechanic to try to fix it where it stands, or a recovery vehicle to take it to a garage. It does not pay for the repair itself. This page explains what van cover includes, the difference between business and personal policies, what to check for heavy vans and crew vans, and what to ask before you buy.",
  "Vansales does not sell, arrange or recommend breakdown cover. This is general information to help you compare policies.",
];

export const BREAKDOWN_SECTIONS: Section[] = [
  {
    id: "covers",
    h2: "What van breakdown cover covers",
    blocks: [
      { p: "Policies are built in levels, and the names differ between providers, so look at what each level actually lists:" },
      { ul: [
        "Roadside assistance: a patrol attends and tries to fix the van at the roadside. This usually covers a flat battery, a flat tyre if you have a usable spare, and many minor faults.",
        "Recovery: if the van cannot be fixed at the roadside it is taken to a garage, often with a limit on distance or cost.",
        "At home: help if the van will not start at or near your address. This is often a separate level.",
        "Onward travel: a way to continue your journey, or somewhere to stay, if the van cannot be repaired the same day. Check the limits.",
        "Misfuelling, lost or broken keys and wheel locks: sometimes included and sometimes an extra.",
      ] },
      { p: "These levels do not pay for parts or repair work, or for the cost of the garage's labour. Some policies repay a limited number of call-outs a year, so check how many." },
    ],
  },
  {
    id: "business",
    h2: "Business or personal cover",
    blocks: [
      { p: "Many personal policies exclude vans, or vehicles used for work, or limit them by weight and size, so a policy that suits your car may not cover your van at all. If the van is used for your business, tell the provider and choose a policy that says it covers commercial use." },
      { p: "There is also a choice between cover for the person and cover for the vehicle. Person cover follows you into any vehicle you are in, which suits one driver. Vehicle cover applies to the van whoever is driving it, which suits a van that several people use. Breakdown cover does not insure the load, tools or stock inside the van, and recovery of the van does not always include getting your load to its destination, so ask what happens to it." },
    ],
  },
  {
    id: "europe",
    h2: "UK only or European cover",
    blocks: [
      { p: "National cover applies in the UK. If you take the van abroad you need European cover, which is normally an extra and has its own limits: the countries covered, the length of each trip, the cost of recovery and bringing the van home, and the size of van it will take. A large or high van may be excluded abroad even where it is accepted at home, so check before you travel and carry the documents your policy and the country you are visiting ask for." },
    ],
  },
  {
    id: "heavy",
    h2: "Vans over 3.5 tonnes and crew vans",
    blocks: [
      { p: "Standard policies often set limits on a van's gross weight, length, height and the number of passengers. Check each one against your vehicle's own figures, which are on the V5C and the plate." },
      { ul: [
        "Over 3.5 tonnes: heavier vehicles may not qualify for a standard policy at all and can need a specialist commercial or heavy-vehicle policy, because they need a larger recovery vehicle.",
        "Crew vans: ask whether the policy recovers the passengers with the van, and how many it allows, as well as the van.",
        "Loaded vans and conversions: racking, a tail lift or a heavy body can take a van over a limit. Ask whether recovery is possible with the van loaded.",
        "High roofs and long wheelbases: a very tall or long van may need a particular recovery vehicle, and some providers do not offer one.",
        "Electric vans: many cannot be towed on their wheels and need to be carried on a flatbed. Check the policy covers this and does not cap the distance.",
      ] },
    ],
  },
  {
    id: "limits",
    h2: "Common limits and exclusions",
    blocks: [
      { p: "Read the small print on what the policy will not do, because these limits are where most disputes start:" },
      { ul: [
        "Pre-existing faults: a problem that was already present when you took out the policy may not be covered, and some policies apply a waiting period before cover begins.",
        "Repeat call-outs: a second breakdown for the same fault within a short time may be refused or treated as a repair rather than a rescue.",
        "Recovery distance: many policies recover only to the nearest suitable garage or to a set distance, and charge for the rest.",
        "Unroadworthy or untaxed vans: a van without a valid MOT, tax or insurance may not be eligible.",
        "Accident recovery: some policies exclude vans damaged in a collision, and leave that to your insurer.",
      ] },
    ],
  },
  {
    id: "cost",
    h2: "What van breakdown cover costs",
    blocks: [
      { p: "Cost depends on the level of cover, whether it is for you or the van, how heavy and old the van is, whether you want European cover, and how many vans you cover. Roadside only is usually the lowest-priced level, and national recovery, at-home help and European cover each add to it. Insuring several vans together is often cheaper per van. These are general pointers, not quotes or offers, so ask for the terms in writing and compare what each level includes, not just the price." },
    ],
  },
  {
    id: "ask",
    h2: "Questions to ask before you buy",
    blocks: [
      { ul: [
        "Does the policy cover a van used for business, and is there a weight, length, height or age limit?",
        "Is it cover for me or for the van, and who else can use it?",
        "Is recovery to a garage included, and is there a limit on distance or cost?",
        "Is at-home cover included, and how many call-outs can I make in a year?",
        "What happens to my load and tools if the van is recovered?",
        "If I carry passengers, are they recovered too, and how many?",
        "Is a loaded or modified van covered, and is an electric van carried on a flatbed?",
        "Does the policy include Europe, and for how long per trip?",
      ] },
    ],
  },
  {
    id: "related",
    h2: "Breakdown cover, insurance and warranty",
    blocks: [
      { p: "Breakdown cover is different from insurance and from a warranty. [Van insurance](/van-insurance) pays for accidents, fire, theft and liability, and the law requires it. A [van warranty](/van-warranty) pays for repairs when named parts fail. Breakdown cover pays for the help to get you moving again, and some policies from other providers include some elements of each, so check what is actually covered." },
    ],
  },
];
