"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Listing } from "@/lib/listings/types";
import { ListingCard } from "@/components/listing-card";
import { advertCardToListing } from "@/lib/listings/sources/vansales";
import { useSaved } from "@/lib/saved";

const API = (process.env.NEXT_PUBLIC_VANSALES_API_URL || "https://api.vansales.com").replace(/\/$/, "");

/** The saved vans of this browser: the ids come from localStorage, the cards from the API (only vans still for sale come back, so a sold one quietly drops off). Works signed out. */
export function SavedVans() {
  const { ids, ready } = useSaved();
  const [cards, setCards] = useState<Listing[] | null>(null);
  const key = ids.join(",");

  useEffect(() => {
    if (!ready) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (ids.length === 0) { setCards([]); return; }
    let live = true;
    fetch(`${API}/api/public/listings/by-ids?ids=${encodeURIComponent(key)}`, { headers: { Accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((b: { data?: unknown[] }) => { if (live) setCards((b.data ?? []).map(advertCardToListing).filter((l): l is Listing => l !== null)); })
      .catch(() => { if (live) setCards([]); });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, key]);

  if (cards === null) return <p className="mt-8 text-ink-500" role="status">Loading your saved vans…</p>;
  if (cards.length === 0) {
    return (
      <div className="mt-8 rounded-[var(--radius-lg)] border border-border bg-surface-1 p-8 text-center">
        <p className="font-semibold text-ink-800">No saved vans yet</p>
        <p className="mt-1 text-[length:var(--text-sm)] text-ink-500">Tap the heart on a van to keep it here.</p>
        <Link href="/vans" className="mt-4 inline-flex h-10 items-center rounded-[var(--radius-md)] bg-accent-500 px-4 text-[length:var(--text-sm)] font-semibold text-white">Browse vans</Link>
      </div>
    );
  }
  return (
    <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((l, i) => (
        <li key={l.id}><ListingCard listing={l} priority={i < 3} cardIndex={i} /></li>
      ))}
    </ul>
  );
}
