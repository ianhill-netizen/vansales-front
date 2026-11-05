"use client";

import { IconHeart } from "./icons";
import { useSaved } from "@/lib/saved";

/** The heart on a listing card and on the detail page. Saves the advert's id in this browser (see lib/saved.ts); only adverts from the vansales API have an id the saved page can look up. */
export function SaveButton({ id, className = "", label = false }: { id: string; className?: string; label?: boolean }) {
  const { has, toggle, ready } = useSaved();
  const saved = ready && has(id);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved vans" : "Save this van"}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(id); }}
      className={`relative z-20 inline-flex items-center justify-center gap-1.5 rounded-full bg-white/95 text-ink-700 shadow-[var(--shadow-sm)] backdrop-blur-sm transition-colors hover:text-sold-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${label ? "h-9 px-3 text-[length:var(--text-sm)] font-semibold" : "size-9"} ${className}`}
    >
      <IconHeart width={18} height={18} className={saved ? "fill-sold-600 text-sold-600" : ""} aria-hidden />
      {label && <span>{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}
