import "server-only";
import { apiHeaders } from "@/lib/api-headers";

/** The HP calculator's settings (vansales-backend GET /api/public/finance: admin Settings > Prices), fetched once on the server and passed down. Falls back to Swiss Vans' values when the API is unavailable. */
export interface FinanceConfig { apr: number; termMonths: number; warranty: number }
export const FINANCE_FALLBACK: FinanceConfig = { apr: 11.4, termMonths: 60, warranty: 699 };

const BASE = (process.env.VANSALES_API_URL || process.env.NEXT_PUBLIC_VANSALES_API_URL || "https://api.vansales.com").replace(/\/$/, "");

export async function getFinanceConfig(): Promise<FinanceConfig> {
  try {
    const res = await fetch(`${BASE}/api/public/finance`, { headers: apiHeaders(), next: { revalidate: 300 }, signal: AbortSignal.timeout(4_000) });
    if (!res.ok) return FINANCE_FALLBACK;
    const d = ((await res.json()) as { data?: { apr?: number; default_term?: number; warranty_default?: number } }).data;
    const apr = Number(d?.apr), term = Number(d?.default_term), warranty = Number(d?.warranty_default);
    return {
      apr: Number.isFinite(apr) && apr > 0 && apr < 50 ? apr : FINANCE_FALLBACK.apr,
      termMonths: Number.isInteger(term) && term >= 12 && term <= 84 ? term : FINANCE_FALLBACK.termMonths,
      warranty: Number.isFinite(warranty) && warranty >= 0 ? warranty : FINANCE_FALLBACK.warranty,
    };
  } catch {
    return FINANCE_FALLBACK;
  }
}
