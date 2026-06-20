"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRole } from "@/lib/roles/context";
import { useRouter } from "next/navigation";
import { IntegrationRow, type RowData } from "@/components/integration-row";
import { PROVIDERS_BY_CATEGORY, PROVIDER_MAP, type Category } from "@/lib/integrations/providers";

type ApiResponse = {
  rows: RowData[];
  supabaseConfigured: boolean;
  error?: string;
};

export function IntegrationsPage({
  category,
  title,
  description,
  backHref = "/admin/integrations",
}: {
  category: Category;
  title: string;
  description: string;
  backHref?: string;
}) {
  const { isAdmin, isLoggedIn } = useRole();
  const router = useRouter();
  const [rows, setRows] = useState<Map<string, RowData>>(new Map());
  const [supabaseConfigured, setSupabaseConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) router.replace("/sign-in");
    else if (!isAdmin) router.replace("/");
  }, [isAdmin, isLoggedIn, router]);

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) return;
    fetch(`/api/admin/integrations?category=${category}`)
      .then((r) => r.json())
      .then((data: ApiResponse) => {
        setSupabaseConfigured(data.supabaseConfigured ?? false);
        const map = new Map<string, RowData>();
        for (const row of data.rows ?? []) map.set(row.provider, row);
        setRows(map);
      })
      .catch(() => setSupabaseConfigured(false))
      .finally(() => setLoading(false));
  }, [category, isAdmin, isLoggedIn]);

  if (!isLoggedIn || !isAdmin) return null;

  const defs = PROVIDERS_BY_CATEGORY[category];

  function updateRow(provider: string, patch: Partial<RowData>) {
    setRows((prev) => {
      const next = new Map(prev);
      const existing = next.get(provider) ?? ({} as RowData);
      next.set(provider, { ...existing, ...patch });
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-1">
        <Link href={backHref} className="text-[var(--text-xs)] font-semibold text-brand-600 hover:underline">
          ← Integrations hub
        </Link>
      </div>
      <div className="mb-6 mt-2">
        <h1 className="font-display text-[var(--text-2xl)] font-extrabold text-ink-900">{title}</h1>
        <p className="mt-1 text-[var(--text-sm)] text-ink-500">{description}</p>
      </div>

      {supabaseConfigured === false && (
        <div className="mb-6 rounded-[var(--radius-xl)] border border-amber-300 bg-amber-50 px-5 py-4">
          <p className="font-semibold text-amber-800">Supabase not configured</p>
          <p className="mt-1 text-[var(--text-sm)] text-amber-700">
            Add <code className="rounded bg-amber-100 px-1">SUPABASE_URL</code>,{" "}
            <code className="rounded bg-amber-100 px-1">SUPABASE_SERVICE_ROLE_KEY</code>, and{" "}
            <code className="rounded bg-amber-100 px-1">ENCRYPTION_KEY</code> to Vercel environment variables, then run the schema SQL and seed script.
          </p>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {defs.map((d) => (
            <div key={d.provider} className="h-36 animate-pulse rounded-[var(--radius-xl)] bg-surface-1" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {defs.map((def) => {
            const row: RowData = rows.get(def.provider) ?? {
              provider: def.provider,
              masked_value: null,
              has_value: false,
              base_url: null,
              status: "untested",
              last_tested_at: null,
              notes: null,
            };
            return (
              <IntegrationRow
                key={def.provider}
                def={def}
                row={row}
                onSaved={(patch) => updateRow(def.provider, patch)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
// Re-export for convenient use
export { PROVIDER_MAP };
