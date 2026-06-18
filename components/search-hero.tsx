"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { slugify } from "@/lib/listings/slug";
import { IconSearch } from "./icons";

/* Curated make → models for the hero selects. Mirrors the live feed's makes
   plus the demo fixtures; the form routes to the programmatic model page. */
const TAXONOMY: Record<string, string[]> = {
  Volkswagen: ["Transporter", "Caddy", "Crafter"],
  Ford: ["Transit Custom", "Transit", "Ranger"],
  "Mercedes-Benz": ["Sprinter", "Vito"],
  Vauxhall: ["Vivaro", "Combo"],
  Renault: ["Master", "Trafic"],
  Citroën: ["Berlingo", "Relay"],
};

export function SearchHero() {
  const router = useRouter();
  const makes = useMemo(() => Object.keys(TAXONOMY), []);
  const [make, setMake] = useState("Volkswagen");
  const [model, setModel] = useState("Transporter");
  const [where, setWhere] = useState("");

  const models = TAXONOMY[make] ?? [];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = where.trim() ? `?near=${encodeURIComponent(where.trim())}` : "";
    router.push(`/vans/${slugify(make)}/${slugify(model)}${params}`);
  }

  const fieldClass =
    "h-12 w-full appearance-none rounded-[var(--radius-md)] border border-border bg-surface-0 px-3.5 text-[var(--text-md)] font-medium text-ink-800 shadow-[var(--shadow-xs)] outline-none focus-visible:border-accent-500";

  return (
    <form
      onSubmit={submit}
      className="rounded-[var(--radius-xl)] border border-border bg-surface-0/95 p-3 shadow-[var(--shadow-lg)] backdrop-blur sm:p-4"
    >
      <div className="grid gap-2.5 sm:grid-cols-[1fr_1fr_1fr_auto] sm:gap-3">
        <label className="block">
          <span className="mb-1 block text-[var(--text-2xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-ink-500">
            Make
          </span>
          <select
            value={make}
            onChange={(e) => {
              setMake(e.target.value);
              setModel(TAXONOMY[e.target.value][0]);
            }}
            className={fieldClass}
          >
            {makes.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-[var(--text-2xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-ink-500">
            Model
          </span>
          <select value={model} onChange={(e) => setModel(e.target.value)} className={fieldClass}>
            {models.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-[var(--text-2xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-ink-500">
            Postcode or town
          </span>
          <input
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            placeholder="e.g. Cardiff"
            className={fieldClass}
          />
        </label>

        <div className="flex items-end">
          <button
            type="submit"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-accent-500 px-6 font-semibold text-white shadow-[var(--shadow-sm)] transition-colors hover:bg-accent-600 sm:w-auto"
          >
            <IconSearch width={18} height={18} />
            Search vans
          </button>
        </div>
      </div>
    </form>
  );
}
