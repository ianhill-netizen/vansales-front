"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ALL_MAKES, getMakeBySlug } from "@/lib/taxonomy/van-makes";
import { slugify } from "@/lib/listings/slug";
import { IconSearch, IconChevron } from "./icons";

const ALL_MAKE_NAMES = ALL_MAKES.map((m) => m.name);

const LABEL_CLS =
  "pointer-events-none absolute left-4 top-3 text-[var(--text-2xs)] font-bold uppercase tracking-[var(--tracking-eyebrow)] text-ink-400";

const FIELD_CLS =
  "h-full w-full appearance-none bg-transparent pl-4 pr-9 pt-5 text-[var(--text-base)] font-semibold text-ink-900 placeholder:font-normal placeholder:text-ink-400 outline-none cursor-pointer";

export function SearchHero({ total }: { total: number }) {
  const router = useRouter();
  const [make, setMake]   = useState("");
  const [model, setModel] = useState("");
  const [where, setWhere] = useState("");

  const makeData = make ? getMakeBySlug(slugify(make)) : null;
  const models = makeData ? makeData.models.map((m) => m.name) : [];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const makePath = make ? slugify(make) : null;
    const modelPath = model && makePath ? slugify(model) : null;
    const near = where.trim() ? `?near=${encodeURIComponent(where.trim())}` : "";
    if (!makePath) {
      router.push(`/vans${near}`);
    } else if (!modelPath) {
      router.push(`/vans/${makePath}${near}`);
    } else {
      router.push(`/vans/${makePath}/${modelPath}${near}`);
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
              onChange={(e) => { setMake(e.target.value); setModel(""); }}
              className={FIELD_CLS}
              aria-label="Make"
            >
              <option value="">Any make</option>
              {ALL_MAKE_NAMES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <IconChevron width={15} height={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          </div>

          {/* Model */}
          <div className="relative flex h-[5rem] items-center border-b border-border sm:border-b-0 sm:border-r">
            <span className={LABEL_CLS}>Model</span>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={!make}
              className={`${FIELD_CLS} disabled:cursor-not-allowed disabled:text-ink-400`}
              aria-label="Model"
            >
              <option value="">Any model</option>
              {models.map((m) => <option key={m} value={m}>{m}</option>)}
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
