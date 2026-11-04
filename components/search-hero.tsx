"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { stringifyVehicles, type VehicleChip } from "@/lib/vehicle-chips";
import { ChipSearch } from "./chip-search";
import { IconSearch } from "./icons";

const LABEL_CLS =
  "pointer-events-none absolute left-4 top-3 text-[var(--text-2xs)] font-bold uppercase tracking-[var(--tracking-eyebrow)] text-ink-400";

export function SearchHero({
  total,
}: {
  total: number;
  /** @deprecated no longer used: the chip search suggests from the full make / model taxonomy. */
  makeModels?: Record<string, string[]>;
}) {
  const router = useRouter();
  const [chips, setChips] = useState<VehicleChip[]>([]);
  const [where, setWhere] = useState("");

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const p = new URLSearchParams();
    if (chips.length > 0) p.set("v", stringifyVehicles(chips));
    if (where.trim()) p.set("near", where.trim());
    const qs = p.toString();
    router.push(`/vans${qs ? `?${qs}` : ""}`);
  }

  return (
    <div className="w-full">
      <form
        onSubmit={submit}
        className="rounded-[var(--radius-2xl)] bg-white shadow-[var(--shadow-xl)] ring-1 ring-black/6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_auto]">

          {/* Make / model chips */}
          <div className="relative flex min-h-[5rem] items-end border-b border-border px-2 pb-2 pt-7 sm:border-b-0 sm:border-r">
            <span className={LABEL_CLS}>Make &amp; model</span>
            <ChipSearch
              className="w-full"
              value={chips}
              onChange={setChips}
              onEnterEmpty={() => submit()}
              placeholder="Type a make or model, e.g. Transit Custom"
            />
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
          { href: "/directory",      label: "Browse by make" },
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
