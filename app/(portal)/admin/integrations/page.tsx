"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRole } from "@/lib/roles/context";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/integrations/providers";

type CategorySummary = {
  category: Category;
  label: string;
  description: string;
  href: string;
  icon: string;
  connected: number;
  total: number;
};

const PILL_CONFIG: Omit<CategorySummary, "connected" | "total">[] = [
  {
    category: "api",
    label: "APIs",
    description: "Vehicle data, payments, email and feed integrations.",
    href: "/admin/integrations/apis",
    icon: "🔌",
  },
  {
    category: "ai",
    label: "AI",
    description: "Language models for content and image generation.",
    href: "/admin/integrations/ai",
    icon: "🤖",
  },
  {
    category: "tracking",
    label: "Tracking",
    description: "GTM, GA4, and Meta Pixel — injected into <head> site-wide.",
    href: "/admin/integrations/tracking",
    icon: "📊",
  },
];

export default function IntegrationsHubPage() {
  const { isAdmin, isLoggedIn } = useRole();
  const router = useRouter();
  const [counts, setCounts] = useState<Record<string, { connected: number; total: number }>>({});
  const [supabaseConfigured, setSupabaseConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) router.replace("/sign-in");
    else if (!isAdmin) router.replace("/");
  }, [isAdmin, isLoggedIn, router]);

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) return;
    fetch("/api/admin/integrations")
      .then((r) => r.json())
      .then((data: { rows?: { category: string; status: string }[]; supabaseConfigured?: boolean }) => {
        setSupabaseConfigured(data.supabaseConfigured ?? false);
        const map: Record<string, { connected: number; total: number }> = {};
        for (const row of data.rows ?? []) {
          if (!map[row.category]) map[row.category] = { connected: 0, total: 0 };
          map[row.category].total++;
          if (row.status === "connected") map[row.category].connected++;
        }
        setCounts(map);
      })
      .catch(() => setSupabaseConfigured(false))
      .finally(() => setLoading(false));
  }, [isAdmin, isLoggedIn]);

  if (!isLoggedIn || !isAdmin) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-[var(--text-2xl)] font-extrabold text-ink-900">Integrations</h1>
        <p className="mt-1 text-[var(--text-sm)] text-ink-500">
          Manage API keys, AI providers, and site-wide tracking — all encrypted at rest.
        </p>
      </div>

      {supabaseConfigured === false && !loading && (
        <div className="mb-6 rounded-[var(--radius-xl)] border border-amber-300 bg-amber-50 px-5 py-4">
          <p className="font-semibold text-amber-800">Supabase not configured</p>
          <p className="mt-1 text-[var(--text-sm)] text-amber-700">
            Add{" "}
            <code className="rounded bg-amber-100 px-1 font-mono">SUPABASE_URL</code>,{" "}
            <code className="rounded bg-amber-100 px-1 font-mono">SUPABASE_ANON_KEY</code>,{" "}
            <code className="rounded bg-amber-100 px-1 font-mono">SUPABASE_SERVICE_ROLE_KEY</code>, and{" "}
            <code className="rounded bg-amber-100 px-1 font-mono">ENCRYPTION_KEY</code>{" "}
            to Vercel → Settings → Environment variables, then run the schema SQL and seed.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {PILL_CONFIG.map((pill) => {
          const count = counts[pill.category] ?? { connected: 0, total: 0 };
          return (
            <Link
              key={pill.category}
              href={pill.href}
              className="group flex flex-col rounded-[var(--radius-xl)] border border-border bg-white px-6 py-5 shadow-[var(--shadow-xs)] transition-[box-shadow,border-color] hover:border-brand-400/40 hover:shadow-[var(--shadow-md)]"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <span className="text-2xl" aria-hidden>{pill.icon}</span>
                {supabaseConfigured && !loading ? (
                  <span className={`rounded-full px-2.5 py-0.5 text-[var(--text-2xs)] font-semibold ${count.connected > 0 ? "bg-success-tint text-success-700" : "bg-surface-2 text-ink-400"}`}>
                    {count.connected}/{count.total} connected
                  </span>
                ) : (
                  <span className="h-5 w-20 animate-pulse rounded-full bg-surface-2" />
                )}
              </div>
              <h2 className="font-display text-[var(--text-lg)] font-bold text-ink-900 group-hover:text-brand-600">
                {pill.label}
              </h2>
              <p className="mt-1 text-[var(--text-xs)] text-ink-500">{pill.description}</p>
              <div className="mt-4 text-[var(--text-xs)] font-semibold text-brand-600">
                Configure →
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
