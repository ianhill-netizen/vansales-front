"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { slugify } from "@/lib/listings/slug";
import { IconSearch, IconChevron } from "./icons";

const TAXONOMY: Record<string, string[]> = {
  "Any make": [],
  Volkswagen:      ["Any model", "Transporter", "Caddy", "Crafter"],
  Ford:            ["Any model", "Transit Custom", "Transit", "Ranger"],
  "Mercedes-Benz": ["Any model", "Sprinter", "Vito"],
  Vauxhall:        ["Any model", "Vivaro", "Combo"],
  Renault:         ["Any model", "Master", "Trafic"],
  Citroën:         ["Any model", "Berlingo", "Relay"],
  Nissan:          ["Any model", "NV200", "NV300"],
  Peugeot:         ["Any model", "Expert", "Boxer"],
  Fiat:            ["Any model", "Doblo", "Ducato"],
  Toyota:          ["Any model", "Proace"],
};

const LABEL_CLS =
  "pointer-events-none absolute left-4 top-3 text-[var(--text-2xs)] font-bold uppercase tracking-[var(--tracking-eyebrow)] text-ink-400";

const FIELD_CLS =
  "h-full w-full appearance-none bg-transparent pl-4 pr-9 pt-5 text-[var(--text-base)] font-semibold text-ink-900 placeholder:font-normal placeholder:text-ink-400 outline-none cursor-pointer";

export function SearchHero({ total }: { total: number }) {
  const router = useRouter();
  const makes = useMemo(() => Object.keys(TAXONOMY), []);
  const [make, setMake]   = useState("Any make");
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

  return (
    <div className="w-full">
      <form
        onSubmit={submit}
        className="overflow-hidden rounded-[var(--radius-2xl)] bg-white shadow-[var(--shadow-xl)] ring-1 ring-black/6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto]">

          {/* Make */}
          <div className="relative flex h-[5rem] items-center border-b border-border sm:border-b-0 sm:border-r">
            <span className={LABEL_CLS}>Make</span>
            <select
              value={make}
              onChange={(e) => { setMake(e.target.value); setModel("Any model"); }}
              className={FIELD_CLS}
              aria-label="Make"
            >
              {makes.map((m) => <option key={m}>{m}</option>)}
            </select>
            <IconChevron width={15} height={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          </div>

          {/* Model */}
          <div className="relative flex h-[5rem] items-center border-b border-border sm:border-b-0 sm:border-r">
            <span className={LABEL_CLS}>Model</span>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={make === "Any make"}
              className={`${FIELD_CLS} disabled:cursor-not-allowed disabled:text-ink-400`}
              aria-label="Model"
            >
              {make === "Any make" ? (
                <option>Any model</option>
              ) : (
                models.map((m) => <option key={m}>{m}</option>)
              )}
            </select>
            <IconChevron width={15} height={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          </div>

          {/* Location */}
          <div className="relative flex h-[5rem] items-center border-b border-border sm:border-b-0 sm:border-r">
            <span className={LABEL_CLS}>Location</span>
            <input
              value={where}
              onChange={(e) => setWhere(e.target.value)}
              placeholder="Town or postcode"
              aria-label="Town or postcode"
              className="h-full w-full bg-transparent pl-4 pr-4 pt-5 text-[var(--text-base)] font-semibold text-ink-900 placeholder:font-normal placeholder:text-ink-400 outline-none"
            />
          </div>

          {/* Search button */}
          <div className="flex h-[5rem] items-center px-4">
            <button
              type="submit"
              className="flex h-14 w-full items-center justify-center gap-2.5 rounded-[var(--radius-xl)] px-8 text-[var(--text-base)] font-bold text-white shadow-[var(--shadow-md)] transition-all duration-[var(--dur-base)] active:scale-[0.97] sm:w-auto sm:whitespace-nowrap"
              style={{ background: "linear-gradient(135deg, #f47c1e 0%, #d96410 100%)" }}
            >
              <IconSearch width={18} height={18} />
              <span>Search vans</span>
            </button>
          </div>
        </div>
      </form>

      {/* Sub-links */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[var(--text-xs)] text-white/60">
        {total > 0 && (
          <span>
            <span className="font-bold text-white/90">{total.toLocaleString()}</span>{" "}
            vans available now
          </span>
        )}
        <span className="hidden h-3 w-px bg-white/20 sm:block" aria-hidden />
        {[
          { href: "/directory",    label: "Browse by make" },
          { href: "/vans/panel-van", label: "Panel vans" },
          { href: "/vans/electric",  label: "Electric vans" },
          { href: "/vans/luton",     label: "Luton vans" },
        ].map((l) => (
          <a key={l.href} href={l.href} className="font-semibold text-white/70 underline underline-offset-2 hover:text-white">
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}
