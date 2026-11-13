/**
 * /van-insurance: a hub plus thirteen information-only topic pages. Pure data. Copy is a vansales-backend content_pages row each (page_type guide, `content:seo-silo insurance`): the hub is "insurance-hub", a topic is "insurance-{slug}".
 * Information only: no provider is named, nothing is recommended, Vansales does not arrange insurance. The only outbound link is <AffiliateCta slot="INSURANCE"/>, which stays hidden until AFF_INSURANCE_URL is set (lib/affiliates.ts).
 * Keep the slugs in step with vansales-backend App\Console\Commands\SeoSilo::INSURANCE.
 */
export interface InsuranceDef { slug: string; backendSlug: string; path: string; h1: string; title: string; description: string; group: "type" | "model" }

export const INSURANCE_HUB = {
  backendSlug: "insurance-hub",
  path: "/van-insurance",
  h1: "Van insurance",
  title: "Van Insurance UK: Types, Cover and What Affects It | Vansales",
  description: "Van insurance explained: commercial, fleet, short-term, classic and electric cover, insurance groups, tools in transit and what affects the terms. Information only.",
} as const;

const d = (slug: string, group: InsuranceDef["group"], h1: string, title: string): InsuranceDef =>
  ({ slug, backendSlug: `insurance-${slug}`, path: `/van-insurance/${slug}`, h1, title, group, description: `${h1} in the UK: what it is, what affects the terms, what to tell an insurer and the questions to ask. Information only.` });

export const INSURANCE_TOPICS: readonly InsuranceDef[] = [
  d("fleet", "type", "Fleet van insurance", "Fleet Van Insurance: How It Works and What It Covers"),
  d("commercial", "type", "Commercial van insurance", "Commercial Van Insurance Explained: Use, Cover and Terms"),
  d("short-term", "type", "Short-term van insurance", "Short-Term Van Insurance: When It Makes Sense"),
  d("classic", "type", "Classic van insurance", "Classic Van Insurance: Agreed Value, Mileage and Use"),
  d("electric", "type", "Electric van insurance", "Electric Van Insurance: Batteries, Charging and Cover"),
  d("insurance-groups", "type", "Van insurance groups", "Van Insurance Groups Explained: How Vans Are Rated"),
  d("tools-in-transit", "type", "Tools in transit insurance", "Tools in Transit Insurance: What Is and Is Not Covered"),
  d("transporter", "model", "Volkswagen Transporter insurance", "VW Transporter Insurance: What Affects the Cover"),
  d("transit", "model", "Ford Transit insurance", "Ford Transit Insurance: What Affects the Cover"),
  d("transit-custom", "model", "Ford Transit Custom insurance", "Ford Transit Custom Insurance: What Affects the Cover"),
  d("vivaro", "model", "Vauxhall Vivaro insurance", "Vauxhall Vivaro Insurance: What Affects the Cover"),
  d("sprinter", "model", "Mercedes-Benz Sprinter insurance", "Mercedes Sprinter Insurance: What Affects the Cover"),
  d("caddy", "model", "Volkswagen Caddy insurance", "VW Caddy Insurance: What Affects the Cover"),
];

export const findInsurance = (slug: string) => INSURANCE_TOPICS.find((t) => t.slug === slug);
export const INSURANCE_BACKEND_SLUGS: readonly string[] = [INSURANCE_HUB.backendSlug, ...INSURANCE_TOPICS.map((t) => t.backendSlug)];

/** Words the hub and topic copy must never contain (the rendered page is also run through the Compliance PromotionScorer before the hub merges). */
export const INSURANCE_BANNED = /\b(AA|RAC|Admiral|Aviva|Direct Line|Hastings|Axa|Zurich|Allianz|Churchill|Compare the Market|MoneySuperMarket|GoCompare|we recommend|we suggest|cheapest|get a quote|free quote|buy now|save up to)\b/i;
