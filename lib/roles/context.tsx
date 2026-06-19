"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { PersonaId, Persona } from "./types";
import { PERSONAS } from "./types";

interface RoleContextValue {
  persona: Persona;
  personaId: PersonaId;
  setPersona: (id: PersonaId) => void;
  isLoggedIn: boolean;
  isDealer: boolean;
  isAdmin: boolean;
  isBuyer: boolean;
  isSwissVans: boolean;
}

const RoleContext = createContext<RoleContextValue | null>(null);

const LS_KEY = "vs_persona";

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [personaId, setPersonaId] = useState<PersonaId>("logged-out");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY) as PersonaId | null;
      if (stored && stored in PERSONAS) setPersonaId(stored);
    } catch {}
  }, []);

  const setPersona = useCallback((id: PersonaId) => {
    setPersonaId(id);
    try { localStorage.setItem(LS_KEY, id); } catch {}
  }, []);

  const persona = PERSONAS[personaId];

  return (
    <RoleContext.Provider
      value={{
        persona,
        personaId,
        setPersona,
        isLoggedIn: personaId !== "logged-out",
        isDealer: personaId === "dealer" || personaId === "swiss-vans",
        isAdmin: personaId === "admin",
        isBuyer: personaId === "buyer",
        isSwissVans: personaId === "swiss-vans",
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
