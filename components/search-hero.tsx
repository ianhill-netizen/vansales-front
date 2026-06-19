"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { slugify } from "@/lib/listings/slug";
import { IconSearch, IconChevron } from "./icons";

const TAXONOMY: Record<string, string[]> = {
  "Any make": [],
  Volkswagen: ["Any model", "Transporter", "Caddy", "Crafter"],
  Ford: ["Any model", "Transit Custom", "Transit", "Ranger"],
  "Mercedes-Benz": ["Any model", "Sprinter", "Vito"],
  Vauxhall: ["Any model", "Vivaro", "Combo"],
  Renault: ["Any model", "Master", "Trafic"],
  Citroën: ["Any model", "Berlingo", "Relay"],
  Nissan: ["Any model", "NV200", "NV300"],
  Peugeot: ["Any model", "Expert", "Boxer"],
  Fiat: ["Any model", "Doblo", "Ducato"],
  Toyota: ["Any model", "Proace"],
};

export function SearchHero({ total }: { total: number }) {
  const router = useRouter();
  const makes = useMemo(() => Object.keys(TAXONOMY), []);
  const [make, setMake] = useState("Any make");
  const [model, setModel] = useState("Any model");
  const [where, setWhere] = useState("");

  const models = make === "Any make" ? [] : TAXONOMY[make] ?? [];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (make === "Any make" || make === "") {
      const params = where.trim() ? `?near=${encodeURIComponent(where.trim())}` : "";
      router.push(`/vans${params}`);
    } else if (model === "Any model" || model === "") {
      router.push(`/vans/${slugify(make)}`);
    } else {
      const params = where.trim() ? `?near=${encodeURIComponent(where.trim())}` : "";
      router.push(`/vans/${slugify(make)}/${slugify(model)}${params}`);
    }
  }

  const selectCls =
    "h-full w-full appearance-none bg-transparent pl-4 pr-8 text-[var(--text-base)] font-semibold text-ink-800 outline-none cursor-pointer";

  return (
    <div className="w-full">
      <form
        onSubmit={submit}
        className="overflow-hidden rounded-[var(--radius-xl)] bg-white shadow-[var(--shadow-lg)] ring-1 ring-border"
      >
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto]">
          {/* Make */}
          <div className="relative flex h-16 items-center border-b border-border sm:border-b-0 sm:border-r">
            <div className="pointer-events-none absolute left-4 top-2.5 text-[var(--text-2xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-ink-400">
              Make
            </div>
            <select
              value={make}
              onChange={(e) => {
                setMake(e.target.value);
                setModel("Any model");
              }}
              className={selectCls + " pt-5"}
              aria-label="Make"
            >
              {makes.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
            <IconChevron width={16} height={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" />
          </div>

          {/* Model */}
          <div className="relative flex h-16 items-center border-b border-border sm:border-b-0 sm:border-r">
            <div className="pointer-events-none absolute left-4 top-2.5 text-[var(--text-2xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-ink-400">
              Model
            </div>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={make === "Any make"}
              className={selectCls + " pt-5 disabled:text-ink-400"}
              aria-label="Model"
            >
              {make === "Any make" ? (
                <option>Any model</option>
              ) : (
                models.map((m) => <option key={m}>{m}</option>)
              )}
            </select>
            <IconChevron width={16} height={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" />
          </div>

          {/* Location */}
          <div className="relative flex h-16 items-center border-b border-border sm:border-b-0 sm:border-r">
            <div className="pointer-events-none absolute left-4 top-2.5 text-[var(--text-2xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-ink-400">
              Location
            </div>
            <input
              value={where}
              onChange={(e) => setWhere(e.target.value)}
              placeholder="Postcode or town"
              aria-label="Postcode or town"
              className="h-full w-full bg-transparent pl-4 pr-4 pt-5 text-[var(--text-base)] font-semibold text-ink-800 placeholder:font-normal placeholder:text-ink-400 outline-none"
            />
          </div>

          {/* Submit */}
          <div className="flex h-16 items-center px-3">
            <button
              type="submit"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-brand-500 px-6 text-[var(--text-base)] font-bold text-white shadow-[var(--shadow-sm)] transition-colors hover:bg-brand-600 sm:w-auto sm:whitespace-nowrap"
            >
              <IconSearch width={18} height={18} />
              Search {total > 0 ? total.toLocaleString() : ""} vans
            </button>
          </div>
        </div>
      </form>

      <p className="mt-2.5 text-center text-[var(--text-xs)] text-white/60 sm:text-left">
        Or{" "}
        <a href="/directory" className="font-semibold text-white/80 underline underline-offset-2 hover:text-white">
          browse all makes &amp; models
        </a>
        {" "}in our directory
      </p>
    </div>
  );
}
