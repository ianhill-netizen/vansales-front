"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "../ui";
import { IconX } from "../icons";
import { Field, inputCls } from "../enquiry-fields";

const API = (process.env.NEXT_PUBLIC_VANSALES_API_URL || "https://api.vansales.com").replace(/\/$/, "");

interface PxAnswer {
  make: string | null; model: string | null; year: number | null; mileage: number;
  valuation_range: { low: number; high: number };
  hpi: { finance: boolean | null; stolen: boolean | null; written_off: boolean | null } | null;
}
const gbp = (n: number) => `£${n.toLocaleString("en-GB")}`;
const HPI_ROWS: { key: "finance" | "stolen" | "written_off"; label: string }[] = [
  { key: "finance", label: "Outstanding finance" }, { key: "stolen", label: "Reported stolen" }, { key: "written_off", label: "Written off" },
];

/** "Part exchange" on a listing: reg in, the valuation range and history flags out (POST {API}/api/public/px-lookup/{id}). Free. Asks for the mileage only when the reg has no MOT reading to use. Native <dialog>, like the contact modal. */
export function ListingPxModal({ listingId, open, onClose }: { listingId: string; open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [reg, setReg] = useState("");
  const [mileage, setMileage] = useState("");
  const [needMileage, setNeedMileage] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [answer, setAnswer] = useState<PxAnswer | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const miles = Number(mileage.replace(/[^\d]/g, ""));
    if (busy || !/^[A-Za-z0-9 ]{2,10}$/.test(reg.trim()) || (needMileage && miles < 1)) return;
    setBusy(true); setError("");
    try {
      const res = await fetch(`${API}/api/public/px-lookup/${encodeURIComponent(listingId)}`, {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ reg: reg.trim(), ...(miles > 0 ? { mileage: miles } : {}), website: "" }),
      });
      const body = (await res.json().catch(() => ({}))) as { data?: PxAnswer; message?: string; reason?: string };
      if (res.ok && body.data?.valuation_range) { setAnswer(body.data); setNeedMileage(false); }
      else if (res.status === 422 && body.reason === "mileage_required") { setNeedMileage(true); setError(body.message ?? "What is the mileage?"); }
      else setError(body.message ?? (res.status === 429 ? "You have used your valuations for now. Please try again later." : "We could not value that van right now. Please try again later."));
    } catch {
      setError("We could not reach the server. Please check your connection and try again.");
    } finally { setBusy(false); }
  }

  function reset() { setAnswer(null); setError(""); setNeedMileage(false); setMileage(""); }
  const title = answer ? `Your ${[answer.year, answer.make, answer.model].filter(Boolean).join(" ")}` : "";
  return (
    <dialog ref={ref} aria-labelledby={titleId} onClose={() => { if (open) onClose(); }} onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-[var(--radius-xl)] border border-border bg-card p-0 text-ink-800 shadow-[var(--shadow-lg)] backdrop:bg-ink-900/60">
      <div className="p-5 pb-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="font-display text-[length:var(--text-lg)] font-bold text-ink-900">Part exchange</h2>
            <p className="mt-1 text-[length:var(--text-sm)] text-ink-500">Enter your registration for a free guide valuation.</p>
          </div>
          <button type="button" onClick={() => ref.current?.close()} aria-label="Close" className="grid size-9 shrink-0 place-items-center rounded-[var(--radius-md)] text-ink-500 hover:bg-surface-1 hover:text-ink-900"><IconX width={18} height={18} aria-hidden /></button>
        </div>
        {answer ? (
          <div className="mt-4 space-y-3" role="status">
            <div className="rounded-[var(--radius-lg)] bg-surface-1 p-4">
              <p className="text-[length:var(--text-md)] text-ink-800">{title} is worth approximately</p>
              <p className="mt-1 font-display text-[length:var(--text-2xl)] font-extrabold text-ink-900" data-testid="px-range">{gbp(answer.valuation_range.low)}–{gbp(answer.valuation_range.high)}</p>
              <p className="mt-1 text-[length:var(--text-xs)] text-ink-500">Based on {answer.mileage.toLocaleString("en-GB")} miles. A guide from a trade valuation tool, not an offer.</p>
            </div>
            {answer.hpi && (
              <ul className="divide-y divide-border rounded-[var(--radius-lg)] border border-border text-[length:var(--text-sm)]">
                {HPI_ROWS.map((r) => {
                  const v = answer.hpi![r.key];
                  return <li key={r.key} className="flex justify-between gap-3 px-3 py-2"><span className="text-ink-600">{r.label}</span><span className={`font-semibold ${v === false ? "text-success-600" : v === true ? "text-sold-600" : "text-ink-400"}`}>{v === false ? "Clear" : v === true ? "Flagged" : "Unknown"}</span></li>;
                })}
              </ul>
            )}
            <div className="flex gap-2"><Button type="button" variant="outline" size="lg" className="flex-1" onClick={reset}>Try another</Button><Button type="button" variant="primary" size="lg" className="flex-1" onClick={() => ref.current?.close()}>Done</Button></div>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-3">
            <Field compact label="Registration"><input type="text" value={reg} onChange={(e) => setReg(e.target.value)} placeholder="e.g. AB12 CDE" maxLength={10} autoCapitalize="characters" autoComplete="off" required className={inputCls + " uppercase"} /></Field>
            {needMileage && <Field compact label="Mileage"><input type="text" inputMode="numeric" value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="e.g. 62000" required className={inputCls} /></Field>}
            {error && <p role="alert" className="rounded-[var(--radius-md)] bg-sold-tint px-3 py-2.5 text-[length:var(--text-sm)] font-medium text-sold-600">{error}</p>}
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={busy}>{busy ? "Valuing…" : "Get valuation"}</Button>
          </form>
        )}
      </div>
    </dialog>
  );
}
