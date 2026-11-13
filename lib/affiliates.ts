/**
 * Affiliate links. Env-driven and OFF until set: with `AFF_{SLOT}_URL` empty or not https, `affiliateFor` returns null and nothing links out and no commission line shows.
 * AFF_INSURANCE_URL (https link) and, optionally, AFF_INSURANCE_LABEL (button text). No provider is named anywhere in the code or the copy.
 * Rendered by <AffiliateCta>: rel="sponsored nofollow noopener", a GA4 `affiliate_click` event and the visible commission line.
 */
export type AffiliateSlot = "INSURANCE";

export interface Affiliate { href: string; label: string }

export const COMMISSION_LINE = "Vansales may earn a commission if you use this link. It does not change what this page says.";

const DEFAULT_LABEL: Record<AffiliateSlot, string> = { INSURANCE: "Visit our van insurance partner" };

/** Pure so it can be tested: pass the env object. */
export function affiliateFor(slot: AffiliateSlot, env: Record<string, string | undefined> = process.env): Affiliate | null {
  const raw = (env[`AFF_${slot}_URL`] ?? "").trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return null;
    const label = (env[`AFF_${slot}_LABEL`] ?? "").trim() || DEFAULT_LABEL[slot];
    return { href: u.toString(), label: label.slice(0, 60) };
  } catch {
    return null;
  }
}
