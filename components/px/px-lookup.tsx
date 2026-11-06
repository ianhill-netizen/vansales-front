"use client";

import { useState } from "react";
import { inputCls } from "../enquiry-fields";

/** The vansales API's public host. The browser calls it directly (like the private-seller enquiry form), so the API's per-visitor rate limit sees the visitor's own address. */
const API = (process.env.NEXT_PUBLIC_VANSALES_API_URL || "https://api.vansales.com").replace(/\/$/, "");

export interface PxResult {
  vrm: string;
  vehicle: { make: string | null; model: string | null; derivative: string | null };
  valuation: { clean: number | null; average: number | null; below: number | null };
}

/** One answer per reg + mileage per page session: a lookup is billed by the API, so a repeat press (or the same van in two boxes) never calls twice. */
const memo = new Map<string, PxResult>();
const key = (reg: string, mileage: number) => `${reg.toUpperCase().replace(/\s+/g, "")}:${mileage}`;

export const gbp = (n: number | null | undefined) => (n == null ? "n/a" : `£${n.toLocaleString("en-GB")}`);
const compact = inputCls.replace("h-11", "h-10");

/**
 * Reg + mileage + a "Value my van" button. NEVER calls on typing or on load, only on the button. Renders the reg and mileage as real form fields (names px_reg / px_mileage), so a surrounding <form>
 * submits them with FormData; `variant` "average" shows one figure, "full" shows clean / average / below. The honesty line is always shown with a figure: it is a guide, not an offer.
 */
export function PxLookup({ variant, initialReg = "", initialMileage = "", fieldNames = true, onResult }: { variant: "average" | "full"; initialReg?: string; initialMileage?: string; fieldNames?: boolean; onResult?: (r: { reg: string; mileage: number; result: PxResult } | null) => void }) {
  const [reg, setReg] = useState(initialReg);
  const [mileage, setMileage] = useState(initialMileage);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PxResult | null>(null);
  const [error, setError] = useState("");

  const miles = Number(mileage.replace(/[^\d]/g, ""));
  const regOk = /^[A-Za-z0-9 ]{2,10}$/.test(reg.trim());
  const ready = regOk && miles >= 1 && !busy;

  async function lookup() {
    if (!ready) return;
    setError("");
    const hit = memo.get(key(reg, miles));
    if (hit) { setResult(hit); onResult?.({ reg, mileage: miles, result: hit }); return; }
    setBusy(true);
    try {
      const res = await fetch(`${API}/api/public/px-lookup`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ reg: reg.trim(), mileage: miles, website: "" }) });
      const body = (await res.json().catch(() => ({}))) as { data?: PxResult; message?: string };
      if (res.ok && body.data?.valuation) {
        memo.set(key(reg, miles), body.data);
        setResult(body.data);
        onResult?.({ reg, mileage: miles, result: body.data });
      } else {
        setResult(null);
        onResult?.(null);
        setError(body.message ?? (res.status === 422 ? "Please check the registration and mileage." : "We could not value that van right now. Please try again later."));
      }
    } catch {
      setError("We could not reach the server. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const v = result?.valuation;
  const name = [result?.vehicle.make, result?.vehicle.model].filter(Boolean).join(" ");
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-[length:var(--text-xs)] font-semibold text-ink-600">Your registration</span>
          <input name={fieldNames ? "px_reg" : undefined} value={reg} onChange={(e) => { setReg(e.target.value.toUpperCase()); setResult(null); }} maxLength={10} autoComplete="off" placeholder="AB19 CDE" className={compact + " font-mono uppercase"} />
        </label>
        <label className="block">
          <span className="mb-1 block text-[length:var(--text-xs)] font-semibold text-ink-600">Mileage</span>
          <input name={fieldNames ? "px_mileage" : undefined} value={mileage} onChange={(e) => { setMileage(e.target.value.replace(/[^\d]/g, "")); setResult(null); }} inputMode="numeric" maxLength={7} autoComplete="off" placeholder="45000" className={compact} />
        </label>
      </div>
      <button type="button" onClick={lookup} disabled={!ready} className="inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] border border-brand-500/40 bg-brand-tint px-4 text-[length:var(--text-sm)] font-semibold text-brand-700 transition-colors hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-50">
        {busy ? "Valuing…" : "Value my van"}
      </button>
      {error && <p role="alert" className="rounded-[var(--radius-md)] bg-sold-tint px-3 py-2 text-[length:var(--text-sm)] font-medium text-sold-600">{error}</p>}
      {v && (
        <div role="status" className="rounded-[var(--radius-md)] border border-border bg-surface-1 p-3">
          {variant === "average" ? (
            <p className="text-[length:var(--text-sm)] text-ink-800">{name ? `Your ${name} is` : "Your van is"} worth about <span className="font-mono text-[length:var(--text-md)] font-bold text-ink-900">{gbp(v.average)}</span>.</p>
          ) : (
            <>
              {name && <p className="mb-2 text-[length:var(--text-sm)] font-semibold text-ink-800">{name}{result?.vehicle.derivative ? `, ${result.vehicle.derivative}` : ""}</p>}
              <dl className="grid grid-cols-3 gap-2 text-center">
                {([["Clean", v.clean], ["Average", v.average], ["Below", v.below]] as const).map(([l, n]) => (
                  <div key={l} className="rounded-[var(--radius-sm)] bg-white p-2 ring-1 ring-border">
                    <dt className="text-[length:var(--text-xs)] text-ink-500">{l}</dt>
                    <dd className="font-mono text-[length:var(--text-md)] font-bold text-ink-900">{gbp(n)}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
          <p className="mt-2 text-[length:var(--text-xs)] text-ink-500">A guide based on trade data, not an offer. The dealer will confirm a price once they have seen the van.</p>
        </div>
      )}
    </div>
  );
}
