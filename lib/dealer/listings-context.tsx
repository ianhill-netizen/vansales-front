"use client";

import { createContext, useContext, useState } from "react";
import { MOCK_DEALER_LISTINGS } from "@/lib/roles/mock-data";

export type DealerListing = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  condition: "used" | "new";
  status: "live" | "unadvertised";
  photos: number;
  age: number;
};

type NewListing = Omit<DealerListing, "id" | "age" | "status">;

interface DealerListingsCtx {
  listings: DealerListing[];
  addListing: (l: NewListing) => void;
}

const Ctx = createContext<DealerListingsCtx | null>(null);

export function DealerListingsProvider({ children }: { children: React.ReactNode }) {
  const [listings, setListings] = useState<DealerListing[]>(
    MOCK_DEALER_LISTINGS as DealerListing[],
  );

  function addListing(l: NewListing) {
    const entry: DealerListing = { ...l, id: `new-${listings.length + 1}`, age: 0, status: "live" };
    setListings((prev) => [entry, ...prev]);
  }

  return <Ctx.Provider value={{ listings, addListing }}>{children}</Ctx.Provider>;
}

export function useDealerListings(): DealerListingsCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDealerListings must be inside DealerListingsProvider");
  return ctx;
}
