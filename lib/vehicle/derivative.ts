/**
 * Raw DVLA / CAP derivative strings arrive shouted and abbreviated ("FORD TRANSIT CUSTOM 320LMTD EBLUE A"). prettyDerivative() makes them read like a person wrote them:
 * "Ford Transit Custom 320 Limited EcoBlue Auto". Text that is already mixed case is left alone (somebody typed it properly); model codes (T32, 320, L2H2) and short engineering initialisms (TDI, SWB, LWB, 4WD) stay as they are.
 */
const WORDS: Record<string, string> = {
  LMTD: "Limited", EBLUE: "EcoBlue", TDCI: "TDCi", DCIV: "Double Cab-in-Van", DCI: "dCi", CDTI: "CDTi", HDI: "HDi", BLUEHDI: "BlueHDi", MHEV: "MHEV", PHEV: "PHEV", ECOBLUE: "EcoBlue",
  AUTO: "Auto", AUTOMATIC: "Automatic", MANUAL: "Manual", SPORT: "Sport", TREND: "Trend", LIMITED: "Limited",
};
/** Letters-only tokens this short stay upper case: engine and body initialisms. Anything longer is title case. */
const KEEP = new Set(["TDI", "SWB", "MWB", "LWB", "XLWB", "4WD", "AWD", "RWD", "FWD", "EV", "GT", "RS", "ST", "XL", "SE", "LE", "VW", "BMW", "DSG", "LCV", "RHD", "LHD", "PX", "DPF", "ECO", "BMT", "HSE", "HDTP", "XDYN", "VTR", "CR", "NV"]);

const titleWord = (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

function token(t: string, last: boolean): string {
  if (t !== t.toUpperCase()) return t;                       // already mixed case: leave it
  if (WORDS[t]) return WORDS[t];
  if (t === "A" && last) return "Auto";                       // a lone trailing A is the gearbox
  const num = t.match(/^(\d+(?:\.\d+)?)([A-Z]{3,})$/);        // 320LMTD -> 320 Limited
  if (num && (WORDS[num[2]] || num[2].length >= 4)) return `${num[1]} ${WORDS[num[2]] ?? titleWord(num[2])}`;
  if (/\d/.test(t)) return t;                                 // codes: T32, 320, L2H2, 2.0, 4X4
  if (KEEP.has(t)) return t;
  if (t.length <= 2) return t;                                // single / double letters and units stay
  return t.split("-").map(titleWord).join("-");
}

export function prettyDerivative(raw: string | null | undefined): string {
  const words = String(raw ?? "").trim().split(/\s+/).filter(Boolean);
  return words.map((w, i) => token(w, i === words.length - 1 && words.length > 1)).join(" ");
}
