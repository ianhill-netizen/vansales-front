import type { GarageData } from "./types";
import { MOCK_GARAGE } from "./mock";

// TODO: replace with fetch("/api/garage/me") when endpoint ships
export async function fetchGarage(): Promise<GarageData> {
  return structuredClone(MOCK_GARAGE);
}

export async function initiateGarageTopUp(
  packKey: string,
  returnUrl: string,
): Promise<{ checkout_url: string }> {
  const base = process.env.NEXT_PUBLIC_DEALSKI_API_URL ?? "";
  const res = await fetch(`${base}/api/wallet/topup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pack_key: packKey, return_url: returnUrl }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? "Checkout failed");
  }
  return res.json() as Promise<{ checkout_url: string }>;
}
