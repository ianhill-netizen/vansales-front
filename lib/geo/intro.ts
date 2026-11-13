/** The short intro of a town page (~120 words), filled from the page's own numbers. No model call, no claims beyond the data. Pure. */
export interface IntroVars {
  town: string; county: string; region: string; vans: number; radius: number; dealers: number; bodyTypes: string[];
}

const hash = (s: string): number => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const plural = (n: number, one: string, many: string): string => (n === 1 ? one : many);
const list = (xs: string[]): string => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

export function townIntro(v: IntroVars): string {
  const where = v.county && v.county.toLowerCase() !== v.town.toLowerCase() ? `${v.town}, ${v.county}` : v.town;
  const open = [
    `Looking for a used van in ${where}? This page lists the vans on Vansales within ${v.radius} miles of ${v.town}, nearest first.`,
    `Vans for sale around ${where}: every advert on Vansales within ${v.radius} miles of ${v.town}, with the closest listed first.`,
    `This is the Vansales list of used vans near ${v.town} in ${v.region}, covering adverts up to ${v.radius} miles away and showing the nearest first.`,
  ][hash(v.town + v.county) % 3];
  const stock = v.vans === 0
    ? `There are no vans listed within ${v.radius} miles of ${v.town} at the moment, so the links below lead to the wider ${v.region} page and to the full search.`
    : `There ${plural(v.vans, "is", "are")} ${v.vans} ${plural(v.vans, "van", "vans")} listed within ${v.radius} miles right now${v.bodyTypes.length ? `, mostly ${list(v.bodyTypes.slice(0, 3).map((b) => b.toLowerCase()))}` : ""}.`;
  const dealers = v.dealers > 0
    ? `${v.dealers} ${plural(v.dealers, "dealer", "dealers")} on Vansales ${plural(v.dealers, "is", "are")} based within ${v.radius} miles, and you can contact them through any of their adverts.`
    : `No Vansales dealer is based within ${v.radius} miles yet.`;
  const close = `Use the filters on the full search to narrow by make, price, mileage or body type, and check the nearby towns below if you are happy to travel a little further.`;
  return [open, stock, dealers, close].join(" ");
}
