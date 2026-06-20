import { createServerClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/integrations/encrypt";
import { unstable_cache } from "next/cache";

export type TrackingConfig = {
  gtmId: string | null;
  ga4Id: string | null;
  metaPixelId: string | null;
};

async function _getTrackingConfig(): Promise<TrackingConfig> {
  const client = createServerClient();
  if (!client) return { gtmId: null, ga4Id: null, metaPixelId: null };

  const { data } = await client
    .from("integrations")
    .select("provider, value")
    .eq("category", "tracking")
    .in("provider", ["gtm", "ga4", "meta-pixel"]);

  if (!data) return { gtmId: null, ga4Id: null, metaPixelId: null };

  function rawValue(provider: string): string | null {
    const row = data!.find((r) => r.provider === provider);
    if (!row?.value) return null;
    try { return decrypt(row.value); } catch { return null; }
  }

  return {
    gtmId: rawValue("gtm"),
    ga4Id: rawValue("ga4"),
    metaPixelId: rawValue("meta-pixel"),
  };
}

/** Cached with 60s revalidation so tracking IDs are picked up quickly after save. */
export const getTrackingConfig = unstable_cache(
  _getTrackingConfig,
  ["tracking-config"],
  { revalidate: 60 },
);
