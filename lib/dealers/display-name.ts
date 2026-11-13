/**
 * The name a dealer is shown under. The vansales API sends `display_name` (derived from the legal name on the server, or the dealer's own override); this is the same derivation for the cases where
 * only the legal name is known (an older API, a database dealer): Title Case, trailing Limited / Ltd / LLP / PLC removed, makes and acronyms such as VW, LDV and MAN kept in capitals.
 * Keep in step with App\Support\DealerDisplayName in vansales-backend.
 */
const KEEP_CAPS = new Set(["VW", "LDV", "MAN", "UK", "GB", "BMW", "DAF", "JCB", "MG", "BYD", "KIA", "DS", "RAC", "AA", "LCV", "HGV", "PCP", "MOT", "EV", "SUV", "4X4", "WAV"]);
const SMALL = new Set(["and", "of", "the", "in", "for", "at", "to", "on"]);
const SUFFIX = /[\s,]+(?:limited|ltd\.?|llp|l\.l\.p\.?|plc|p\.l\.c\.?|cic|inc\.?)\s*$/i;

export function deriveDealerName(legal: string): string {
  let name = legal.replace(/\s+/g, " ").trim();
  for (let i = 0; i < 3; i++) {
    const next = name.replace(SUFFIX, "").replace(/^[\s,.-]+|[\s,.-]+$/g, "");
    if (next === name || next === "") break;
    name = next;
  }
  return name.toLowerCase().split(" ").map((w, i) => {
    const up = w.toUpperCase();
    if (KEEP_CAPS.has(up)) return up;
    if (i > 0 && SMALL.has(w)) return w;
    const cap = w.split("-").map((part, k) => (k > 0 && SMALL.has(part) ? part : part.replace(/(^|['(’])(\p{L})/gu, (_m, a: string, b: string) => a + b.toUpperCase()))).join("-");
    return cap.replace(/^(Mc)(\p{L})/u, (_m, a: string, b: string) => a + b.toUpperCase());
  }).join(" ");
}

/** The API's display_name when it sent one, else derived from the legal name. */
export const dealerDisplayName = (d: { name: string; display_name?: string | null }): string => (d.display_name && d.display_name.trim() !== "" ? d.display_name.trim() : deriveDealerName(d.name));
