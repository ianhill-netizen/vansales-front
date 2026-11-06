/** The make page URL: /vans/{make}-vans-for-sale (the old /vans/{make} is a 301 to it, see next.config.ts). Pure. */
const SUFFIX = "-vans-for-sale";

export const makeVansPath = (makeSlug: string) => `/vans/${makeSlug}${SUFFIX}`;

/** The route's [make] parameter ("ford-vans-for-sale") to the make slug ("ford"); null when it does not carry the suffix. */
export function makeSlugFromParam(param: string): string | null {
  return param.endsWith(SUFFIX) && param.length > SUFFIX.length ? param.slice(0, -SUFFIX.length) : null;
}
