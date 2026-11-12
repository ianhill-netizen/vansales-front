/**
 * 301s that recover inbound links (SE Ranking backlink report, 2026-11-12) pointing at URLs of the previous vansales.com (ASP/PHP site, WordPress blog, old listing paths) that now 404.
 * Each goes to the closest live page: an exact equivalent first, then a make / body-type page, then a hub, home only as a last resort. Destinations must be real 200 pages that are not themselves redirected (lib/redirects/redirects.test.ts).
 * Deliberately NOT here: the Cyrillic casino-spam URLs injected into the site in 2026 (nothing to recover) and the paths a Vercel firewall rule denies before redirects run (/finance.php, /blog/wp-content/*).
 */
export const BACKLINK_REDIRECTS: ReadonlyArray<{ source: string; destination: string; statusCode: 301 }> = [
  { source: "/hire_purchase_van.asp", destination: "/hire-purchase-vans" },
  { source: "/cheap_vans.asp", destination: "/vans" },
  { source: "/van-rental", destination: "/van-lease-deals" },
  { source: "/contact-us", destination: "/" },
  { source: "/new-vans-for-sale", destination: "/vans" },
  { source: "/sprinter-van-for-sale-under-5000", destination: "/used-vans/mercedes-benz/sprinter-for-sale" },
  { source: "/14-passenger-mercedes-sprinter-for-sale", destination: "/vans/minibus" },
  { source: "/Directory/Van-Insurance-Companies", destination: "/van-insurance" },
  { source: "/van_sales_blog/index.php/van-finance-explained/van-leasing-explained", destination: "/van-lease-deals" },
  { source: "/blog/2014/2015-transporter-concept-real", destination: "/used-vans/volkswagen/transporter-for-sale" },
  { source: "/themes/swissvehiclecontracts/img/logo.jpeg", destination: "/" },
  { source: "/uploads/vans/Toyota_hilux_invincible_.jpg", destination: "/used-vans/toyota/hilux-invincible-for-sale" },
  // "VW" was the old make slug.
  { source: "/used-vans/VW", destination: "/used-vans/volkswagen" },
  { source: "/used-vans/VW/Transporter", destination: "/used-vans/volkswagen/transporter-for-sale" },
  // Old make / body-type index pages (the id segment differs per make).
  { source: "/van_makes/volkswagen_vans/:id/:file", destination: "/used-vans/volkswagen" },
  { source: "/van_makes/renault_vans/:id/:file", destination: "/used-vans/renault" },
  { source: "/van_makes/toyota_vans/:id/:file", destination: "/used-vans/toyota" },
  { source: "/van_types/luton_vans/:id/:file", destination: "/used-vans/body-type/luton-for-sale" },
  { source: "/van_types/dropsides/:id/:file", destination: "/used-vans/body-type/dropside-for-sale" },
  // Old listing pages /van_details/{Make_Model}/{id}/{title}.html: the ids are the ones linked to from outside.
  { source: "/van_details/:car/351/:file", destination: "/used-vans/ford/transit-custom-for-sale" },
  { source: "/van_details/:car/299/:file", destination: "/used-vans/renault/kangoo-for-sale" },
  { source: "/van_details/:car/433/:file", destination: "/used-vans/ford/ranger-for-sale" },
  // A removed listing of the previous site's /used-vans/{make}/{model}/{listing}.
  { source: "/used-vans/Ford/Ranger/Ford-Ranger-Hornet-MK2-Facelift-Panel-Van-SWB-H1-290-Sport", destination: "/used-vans/ford/ranger-for-sale" },
  // Must stay ahead of the generic /wp-content/:path* -> / rule: this upload is the hero image of the Transit Custom dimensions guide.
  { source: "/wp-content/uploads/2024/07/2b242c5b-5382-43a4-a938-7cde86067349.png", destination: "/blog/complete-guide-to-ford-transit-custom-dimensions" },
].map((r) => ({ ...r, statusCode: 301 as const }));
