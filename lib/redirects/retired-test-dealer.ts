/**
 * Van Viking was a fictional dealer created to dogfood the dealer onboarding flow; it and its eight invented vans are retired (dealer suspended, adverts set to draft, records kept so they can be brought back:
 * vansales-backend .github/workflows/retire-test-dealer.yml). Their URLs were public and indexed, so each goes permanently (301) to the nearest live page instead of a 404:
 * the dealer page to the dealer directory, each listing to its model's buying-guide page (the same place a sold van's URL goes, lib/listings/gone.ts).
 * A redirect runs before the page, so these win whether or not the retire workflow has run yet.
 */
export const RETIRED_TEST_DEALER_SLUG = "van-viking";

/** [front listing slug, destination]. The slug is "dealer-" + the backend slug (make-model-year-id). */
const LISTINGS: ReadonlyArray<readonly [string, string]> = [
  ["dealer-ford-transit-2021-9", "/used-vans/ford/transit-for-sale"],
  ["dealer-ford-transit-2019-10", "/used-vans/ford/transit-for-sale"],
  ["dealer-volkswagen-transporter-2020-11", "/used-vans/volkswagen/transporter-for-sale"],
  ["dealer-volkswagen-transporter-2022-12", "/used-vans/volkswagen/transporter-for-sale"],
  ["dealer-mercedes-benz-sprinter-2021-13", "/used-vans/mercedes-benz/sprinter-for-sale"],
  ["dealer-mercedes-benz-sprinter-2019-14", "/used-vans/mercedes-benz/sprinter-for-sale"],
  ["dealer-vauxhall-vivaro-2023-15", "/used-vans/vauxhall/vivaro-for-sale"],
  ["dealer-vauxhall-vivaro-2019-16", "/used-vans/vauxhall/vivaro-for-sale"],
];

export const RETIRED_TEST_DEALER_REDIRECTS: ReadonlyArray<{ source: string; destination: string; statusCode: 301 }> = [
  { source: `/dealer/${RETIRED_TEST_DEALER_SLUG}`, destination: "/dealers" },
  ...LISTINGS.map(([slug, destination]) => ({ source: `/listing/${slug}`, destination })),
].map((r) => ({ ...r, statusCode: 301 as const }));
