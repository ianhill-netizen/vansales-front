import type { Stat, ModelStat } from "./catalogue";
import { getCompetitors } from "./competitors";

/* Intro copy for the SEO pages, written from the real stock so every page's text is different
   (counts, prices, years, body types, fuels, wheelbases, payloads) rather than one template with the name swapped. */

const gbp = (n: number) => `£${n.toLocaleString("en-GB")}`;

function list(items: string[], max = 3): string {
  const xs = items.slice(0, max);
  if (xs.length <= 1) return xs[0] ?? "";
  return `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;
}

export function priceRange(s: Stat): string | null {
  if (s.minPrice == null) return null;
  return s.maxPrice != null && s.maxPrice !== s.minPrice ? `${gbp(s.minPrice)} to ${gbp(s.maxPrice)}` : gbp(s.minPrice);
}

/** "priced at £9,000" for one price, "priced from £9,000 to £12,000" for a range. */
function pricedPhrase(s: Stat): string | null {
  const pr = priceRange(s);
  if (!pr) return null;
  return pr.includes(" to ") ? `priced from ${pr}` : `priced at ${pr}`;
}

/** "in 2022" for one year, "between 2018 and 2022" for a range; null when no year is known. Use after the word "registered". */
export function registeredPhrase(s: Stat): string | null {
  if (s.minYear == null) return null;
  return s.maxYear != null && s.maxYear !== s.minYear ? `between ${s.minYear} and ${s.maxYear}` : `in ${s.minYear}`;
}

const vans = (n: number) => `${n.toLocaleString("en-GB")} ${n === 1 ? "van" : "vans"}`;

export function modelIntro(m: ModelStat): string[] {
  const full = `${m.makeName} ${m.name}`;
  const rivals = getCompetitors(m.makeSlug, m.modelSlug, 3).map((c) => c.label);
  const out: string[] = [];

  if (m.count === 0) {
    out.push(
      `There are no ${full} vans listed on Vansales right now. Stock from dealers and private sellers changes every day, so check back soon, or look at similar vans below.`,
    );
  } else {
    const pp = pricedPhrase(m), yr = registeredPhrase(m);
    out.push(
      `${vans(m.count)} ${m.count === 1 ? "is" : "are"} currently for sale as a ${full}${pp ? `, ${pp}` : ""}${yr ? ` and registered ${yr}` : ""}. Listings come from UK dealers and private sellers and are updated as stock changes.`,
    );
  }

  const bits: string[] = [];
  if (m.bodyStyles.length) bits.push(`Body styles in stock include ${list(m.bodyStyles)}`);
  if (m.fuels.length) bits.push(`${m.fuels.length > 1 ? "fuels are" : "the fuel is"} ${list(m.fuels)}`);
  if (m.wheelbases.length) bits.push(`wheelbases come in ${list(m.wheelbases, 4)}`);
  if (m.payloadMin != null) bits.push(m.payloadMax !== m.payloadMin ? `payloads run from ${m.payloadMin.toLocaleString("en-GB")}kg to ${m.payloadMax!.toLocaleString("en-GB")}kg` : `payload is ${m.payloadMin.toLocaleString("en-GB")}kg`);
  if (bits.length) {
    out.push(`${bits.join("; ")}. Use the filters to narrow by price, year, wheelbase, body style and fuel, or sort by price and mileage to find the right ${m.name}.`);
  } else {
    out.push(`Use the filters to narrow the ${full} by price, year, wheelbase, body style and fuel once stock is listed.`);
  }

  out.push(
    rivals.length
      ? `Not sure the ${m.name} is the right fit? Buyers also compare it with the ${list(rivals)}, and you can see every ${m.makeName} van in the range below.`
      : `You can see every ${m.makeName} van in the range below, or browse by body type and make to compare alternatives.`,
  );
  return out;
}

export function makeIntro(makeName: string, s: Stat, models: ModelStat[]): string {
  const stocked = models.filter((m) => m.count > 0);
  if (s.count === 0) return `There are no ${makeName} vans listed right now. Browse the ${makeName} models below, or look at other makes.`;
  const pp = pricedPhrase(s), yr = registeredPhrase(s);
  return (
    `${vans(s.count)} for sale from ${makeName}, across ${stocked.length} ${stocked.length === 1 ? "model" : "models"}` +
    (stocked.length ? ` including ${list(stocked.map((m) => m.name), 4)}` : "") +
    `${pp ? `, ${pp}` : ""}${yr ? ` and registered ${yr}` : ""}.` +
    (s.fuels.length ? ` Fuel types in stock: ${list(s.fuels)}.` : "") +
    ` Pick a model to see only that van, or scroll for every ${makeName} listing.`
  );
}

export function categoryIntro(label: string, s: Stat, popular: string[]): string | null {
  if (s.count === 0) return null;
  const pp = pricedPhrase(s), yr = registeredPhrase(s);
  return (
    `${vans(s.count)} ${s.count === 1 ? "is" : "are"} listed in this category right now` +
    `${pp ? `, ${pp}` : ""}${yr ? `, registered ${yr}` : ""}.` +
    (popular.length ? ` The most common models are ${list(popular, 4)}.` : "") +
    ` Filter by make, price and mileage to narrow the ${label.toLowerCase()}.`
  );
}
