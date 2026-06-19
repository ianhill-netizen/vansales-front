"use client";

import { useState } from "react";
import { INTEGRATIONS, type Integration } from "@/lib/roles/mock-data";

const STATUS_CONFIG = {
  connected: { dot: "bg-success-500", label: "Connected", chip: "bg-success-tint text-success-700" },
  disconnected: { dot: "bg-red-400", label: "Disconnected", chip: "bg-red-50 text-red-600" },
  error: { dot: "bg-red-500 animate-pulse", label: "Error", chip: "bg-red-100 text-red-700" },
  "coming-soon": { dot: "bg-surface-2 border border-border", label: "Coming soon", chip: "bg-surface-2 text-ink-400" },
};

function KeyField({ keyEnvVar }: { keyEnvVar: string | null }) {
  const [reveal, setReveal] = useState(false);
  if (!keyEnvVar) return <span className="text-ink-400">—</span>;
  return (
    <div className="flex items-center gap-2">
      <code className="rounded bg-surface-1 px-2 py-0.5 text-[var(--text-xs)] font-mono text-ink-700">
        {keyEnvVar}
      </code>
      <span className="font-mono text-[var(--text-xs)] text-ink-400">
        {reveal ? "vs_*****_mock_key_01" : "••••••••••••"}
      </span>
      <button onClick={() => setReveal((r) => !r)}
        className="text-[var(--text-2xs)] text-brand-600 hover:underline">
        {reveal ? "Hide" : "Show"}
      </button>
    </div>
  );
}

function IntegrationCard({ integration: i }: { integration: Integration }) {
  const sc = STATUS_CONFIG[i.status];
  const isActionable = i.status === "disconnected" || i.status === "error";
  return (
    <div className={`rounded-[var(--radius-xl)] border bg-white px-5 py-5 shadow-[var(--shadow-sm)] ${i.status === "error" ? "border-red-200" : i.status === "connected" ? "border-success-200/60" : "border-border"}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="font-display font-bold text-ink-900">{i.name}</h3>
        <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-[var(--text-2xs)] font-semibold ${sc.chip}`}>
          <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${sc.dot}`} />
          {sc.label}
        </span>
      </div>
      <p className="mb-3 text-[var(--text-xs)] text-ink-500">{i.purpose}</p>
      {i.configNote && (
        <p className="mb-3 rounded-[var(--radius-md)] bg-surface-0 px-3 py-2 text-[var(--text-xs)] text-ink-500">
          {i.configNote}
        </p>
      )}
      <div className="mb-4">
        <p className="mb-1 text-[var(--text-2xs)] font-semibold uppercase tracking-wider text-ink-400">Env var / key</p>
        <KeyField keyEnvVar={i.keyEnvVar} />
      </div>
      <div className="flex items-center gap-2">
        {isActionable && (
          <button className="rounded-[var(--radius-md)] bg-brand-500 px-3 py-1.5 text-[var(--text-xs)] font-bold text-white hover:bg-brand-600">
            Connect
          </button>
        )}
        {i.status === "connected" && (
          <button className="rounded-[var(--radius-md)] border border-border px-3 py-1.5 text-[var(--text-xs)] font-semibold text-ink-600 hover:border-red-300 hover:text-red-600">
            Disconnect
          </button>
        )}
        {i.docsUrl && (
          <a href={i.docsUrl} target="_blank" rel="noopener noreferrer"
            className="text-[var(--text-xs)] font-semibold text-brand-600 hover:underline">
            Docs →
          </a>
        )}
        {i.status === "coming-soon" && (
          <span className="text-[var(--text-xs)] text-ink-400">In Phase 1 roadmap</span>
        )}
      </div>
    </div>
  );
}

export default function AdminIntegrationsPage() {
  const connected = INTEGRATIONS.filter((i) => i.status === "connected" || i.status === "error");
  const disconnected = INTEGRATIONS.filter((i) => i.status === "disconnected");
  const comingSoon = INTEGRATIONS.filter((i) => i.status === "coming-soon");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-[var(--text-2xl)] font-extrabold text-ink-900">API &amp; Integrations</h1>
        <p className="mt-1 text-[var(--text-sm)] text-ink-500">Manage third-party connections, API keys, and service status.</p>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-[var(--text-xs)] font-bold uppercase tracking-widest text-ink-400">Active</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {connected.map((i) => <IntegrationCard key={i.id} integration={i} />)}
        </div>
      </section>

      {disconnected.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-[var(--text-xs)] font-bold uppercase tracking-widest text-ink-400">Not connected</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {disconnected.map((i) => <IntegrationCard key={i.id} integration={i} />)}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-[var(--text-xs)] font-bold uppercase tracking-widest text-ink-400">Coming in Phase 1</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {comingSoon.map((i) => <IntegrationCard key={i.id} integration={i} />)}
        </div>
      </section>
    </div>
  );
}
