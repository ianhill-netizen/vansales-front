import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { encrypt, maskValue } from "@/lib/integrations/encrypt";

/* TODO: Replace preview-cookie gate with Supabase auth once wired. */
async function isAuthorized(): Promise<boolean> {
  const store = await cookies();
  const preview = store.get("vs_preview")?.value ?? "";
  return preview.startsWith("vsp_");
}

export async function GET(request: Request) {
  if (!(await isAuthorized())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const client = createServerClient();
  if (!client) {
    return Response.json({ rows: [], supabaseConfigured: false });
  }

  let query = client.from("integrations").select("*");
  if (category) query = query.eq("category", category);

  const { data, error } = await query.order("provider");
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []).map((row) => ({
    id: row.id,
    category: row.category,
    provider: row.provider,
    label: row.label,
    masked_value: row.value ? maskValue(row.value) : null,
    has_value: !!row.value,
    base_url: row.base_url ?? null,
    status: row.status,
    last_tested_at: row.last_tested_at ?? null,
    notes: row.notes ?? null,
    updated_at: row.updated_at ?? null,
  }));

  return Response.json({ rows, supabaseConfigured: true });
}

export async function PUT(request: Request) {
  if (!(await isAuthorized())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = createServerClient();
  if (!client) {
    return Response.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const body = (await request.json()) as {
    provider: string;
    value?: string;
    base_url?: string;
    notes?: string;
  };

  const { provider, value, base_url, notes } = body;
  if (!provider) return Response.json({ error: "provider required" }, { status: 400 });

  const patch: Record<string, unknown> = {
    base_url: base_url ?? null,
    notes: notes ?? null,
    status: "untested",
    updated_at: new Date().toISOString(),
  };

  if (value && value.trim() !== "") {
    try {
      patch.value = encrypt(value.trim());
    } catch (e) {
      return Response.json({ error: String(e) }, { status: 500 });
    }
  }

  const { error } = await client.from("integrations").update(patch).eq("provider", provider);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}
