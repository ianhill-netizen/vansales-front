import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";

/* TODO: Replace preview-cookie gate with Supabase auth once wired. */
async function isAuthorized(): Promise<boolean> {
  const store = await cookies();
  const preview = store.get("vs_preview")?.value ?? "";
  return preview.startsWith("vsp_");
}

export async function POST(request: Request) {
  if (!(await isAuthorized())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = createServerClient();
  if (!client) {
    return Response.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { provider } = (await request.json()) as { provider: string };
  if (!provider) return Response.json({ error: "provider required" }, { status: 400 });

  const { data } = await client
    .from("integrations")
    .select("value")
    .eq("provider", provider)
    .single();

  /* Stub: connected when a value is set, failed when empty. */
  const status: "connected" | "failed" = data?.value ? "connected" : "failed";
  const message = status === "connected"
    ? "API key is set — connection verified (stub)"
    : "No API key configured — add a key and save first";

  await client
    .from("integrations")
    .update({ status, last_tested_at: new Date().toISOString() })
    .eq("provider", provider);

  return Response.json({ ok: true, status, message });
}
