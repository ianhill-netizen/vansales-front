"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/lib/roles/context";
import type { PersonaId } from "@/lib/roles/types";
import { PERSONAS } from "@/lib/roles/types";

const PERSONA_ORDER: PersonaId[] = ["logged-out", "buyer", "dealer", "swiss-vans", "admin"];

const PERSONA_COLORS: Record<PersonaId, string> = {
  "logged-out": "bg-ink-600",
  buyer: "bg-brand-600",
  dealer: "bg-teal-600",
  "swiss-vans": "bg-amber-600",
  admin: "bg-red-600",
};

export function RoleSimulator() {
  const { personaId, persona, setPersona } = useRole();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Show only when preview cookie is present
    const hasCookie =
      document.cookie.split(";").some((c) => c.trim().startsWith("vs_preview=vsp_"));
    const isDev = process.env.NODE_ENV === "development";
    setVisible(hasCookie || isDev);
  }, []);

  if (!visible) return null;

  function activate(id: PersonaId) {
    setPersona(id);
    setOpen(false);
    const dest = PERSONAS[id].accountHref;
    if (id === "logged-out") { router.push("/"); return; }
    router.push(dest);
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] font-mono text-[var(--text-xs)]">
      {/* Collapsed pill */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-white shadow-lg ${PERSONA_COLORS[personaId]}`}
      >
        <span className="text-white/60">SIM</span>
        <span className="font-bold">{PERSONAS[personaId].label}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M5 6.5L1 2.5h8L5 6.5z" />
        </svg>
      </button>

      {/* Expanded panel */}
      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-64 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-white shadow-[var(--shadow-xl)]">
          <div className="border-b border-border bg-ink-900 px-4 py-3">
            <p className="text-[var(--text-2xs)] font-bold uppercase tracking-widest text-white/50">
              SIMULATION
            </p>
            <p className="mt-0.5 text-[var(--text-xs)] font-semibold text-white/80">
              Switch persona → navigates to their dashboard
            </p>
          </div>
          <ul className="p-1">
            {PERSONA_ORDER.map((id) => {
              const p = PERSONAS[id];
              const active = id === personaId;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => activate(id)}
                    className={`flex w-full items-center gap-3 rounded px-3 py-2.5 text-left transition-colors ${
                      active ? "bg-brand-tint text-brand-800" : "hover:bg-surface-2 text-ink-700"
                    }`}
                  >
                    <span className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${PERSONA_COLORS[id]}`}>
                      {p.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold leading-tight">{p.label}</p>
                      {p.email && <p className="truncate text-[10px] text-ink-400">{p.email}</p>}
                    </div>
                    {active && <span className="ml-auto text-brand-600">✓</span>}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-border px-4 py-2 text-[10px] text-ink-400">
            Preview-mode only · Submitting forms activates persona
          </div>
        </div>
      )}
    </div>
  );
}
