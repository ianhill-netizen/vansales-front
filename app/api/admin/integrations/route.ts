import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { encrypt, maskValue } from "@/lib/integrations/encrypt";

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

  const rows = await prisma.integration.findMany({
    where: category ? { category: category as "api" | "ai" | "tracking" } : undefined,
    orderBy: { provider: "asc" },
  });

  return Response.json({
    rows: rows.map((row: typeof rows[0]) => ({
      id: row.id,
      category: row.category,
      provider: row.provider,
      label: row.label,
      masked_value: row.value ? maskValue(row.value) : null,
      has_value: !!row.value,
      base_url: row.baseUrl ?? null,
      status: row.status,
      last_tested_at: row.lastTestedAt ?? null,
      updated_at: row.updatedAt ?? null,
    })),
  });
}

export async function PUT(request: Request) {
  if (!(await isAuthorized())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    provider: string;
    value?: string;
    base_url?: string;
  };

  const { provider, value, base_url } = body;
  if (!provider) return Response.json({ error: "provider required" }, { status: 400 });

  const patch: Record<string, unknown> = {
    baseUrl: base_url ?? null,
    status: "untested",
  };

  if (value && value.trim() !== "") {
    try {
      patch.value = encrypt(value.trim());
    } catch (e) {
      return Response.json({ error: String(e) }, { status: 500 });
    }
  }

  await prisma.integration.update({
    where: { provider },
    data: patch,
  });

  return Response.json({ ok: true });
}
