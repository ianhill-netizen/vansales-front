"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "../ui";
import { IconX } from "../icons";
import { Field, inputCls } from "../enquiry-fields";
import { authHeaders, getSession, keepSession } from "@/lib/person";

const API = (process.env.NEXT_PUBLIC_VANSALES_API_URL || "https://api.vansales.com").replace(/\/$/, "");

interface PxAnswer {
  make: string | null; model: string | null; year: number | null; mileage: number;
  valuation_range: { low: number; high: number };
  hpi: { finance: boolean | null; stolen: boolean | null; written_off: boolean | null } | null;
}
const BUYER_KEY = "vansales:buyer";
const PX_KEY = "vansales:px";   // the buyer's last PX on this device: {reg, label} so every listing's PX box can offer it
interface SavedPx { reg: string; label: string }
function toE164(raw: string): string | null {
  const d = raw.replace(/[\s\-().]/g, "");
  const n = d.startsWith("+") ? d : d.startsWith("00") ? `+${d.slice(2)}` : d.startsWith("0") ? `+44${d.slice(1)}` : d;
  return /^\+[1-9]\d{7,14}$/.test(n) ? n : null;
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
  const [saved, setSaved] = useState<SavedPx | null>(null);
  const [buyer, setBuyer] = useState<{ first_name?: string; last_name?: string; mobile?: string }>({});
  const [step, setStep] = useState<"value" | "send" | "sent">("value");
  const [sending, setSending] = useState(false);
  const [photos, setPhotos] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the remembered PX and buyer details from localStorage on open
      try { setSaved(JSON.parse(localStorage.getItem(PX_KEY) || "null")); setBuyer(JSON.parse(localStorage.getItem(BUYER_KEY) || "{}")); } catch {}
    }
    if (!open && d.open) d.close();
  }, [open]);

  async function submit(e: React.FormEvent, useReg?: string) {
    e.preventDefault();
    const theReg = useReg ?? reg;
    const miles = Number(mileage.replace(/[^\d]/g, ""));
    if (busy || !/^[A-Za-z0-9 ]{2,10}$/.test(theReg.trim()) || (needMileage && miles < 1)) return;
    setBusy(true); setError("");
    try {
      const res = await fetch(`${API}/api/public/px-lookup/${encodeURIComponent(listingId)}`, {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ reg: theReg.trim(), ...(miles > 0 ? { mileage: miles } : {}), website: "" }),
      });
      const body = (await res.json().catch(() => ({}))) as { data?: PxAnswer; message?: string; reason?: string };
      if (res.ok && body.data?.valuation_range) { setReg(theReg); setAnswer(body.data); setNeedMileage(false); setStep("value"); }
      else if (res.status === 422 && body.reason === "mileage_required") { setNeedMileage(true); setError(body.message ?? "What is the mileage?"); }
      else setError(body.message ?? (res.status === 429 ? "You have used your valuations for now. Please try again later." : "We could not value that van right now. Please try again later."));
    } catch {
      setError("We could not reach the server. Please check your connection and try again.");
    } finally { setBusy(false); }
  }

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending || !answer) return;
    const fd = new FormData(e.currentTarget);
    const mine = { first_name: String(fd.get("first_name") ?? buyer.first_name ?? "").trim(), last_name: String(fd.get("last_name") ?? buyer.last_name ?? "").trim(), mobile: String(fd.get("mobile") ?? buyer.mobile ?? "").trim() };
    const mobile = toE164(mine.mobile);
    if (getSession() === null && (!mine.first_name || !mobile)) { setError("Please enter your first name and a mobile number we can reach you on."); return; }
    setSending(true); setError("");
    try {
      const res = await fetch(`${API}/api/public/px-submit/${encodeURIComponent(listingId)}`, {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
        body: JSON.stringify({ reg: reg.trim(), first_name: mine.first_name, last_name: mine.last_name || null, mobile, website: "" }),
      });
      const body = (await res.json().catch(() => ({}))) as { data?: { photos_requested?: boolean }; message?: string; session?: unknown };
      keepSession(body.session);
      if (res.ok) {
        setPhotos(!!body.data?.photos_requested); setStep("sent");
        try {
          localStorage.setItem(BUYER_KEY, JSON.stringify({ ...buyer, ...mine, mobile: mine.mobile }));
          localStorage.setItem(PX_KEY, JSON.stringify({ reg: reg.trim().toUpperCase().replace(/\s+/g, ""), label: [answer.year, answer.make, answer.model].filter(Boolean).join(" ") }));
        } catch {}
      } else setError(body.message ?? (res.status === 429 ? "Please try again in a little while." : "We could not send that. Please try again."));
    } catch { setError("We could not reach the server. Please check your connection and try again."); }
    finally { setSending(false); }
  }

  function reset() { setStep("value"); setAnswer(null); setError(""); setNeedMileage(false); setMileage(""); }
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
            {step === "value" && <div className="flex gap-2"><Button type="button" variant="outline" size="lg" className="flex-1" onClick={reset}>Try another</Button><Button type="button" variant="primary" size="lg" className="flex-1" onClick={() => setStep("send")}>Send to the dealer</Button></div>}
            {step === "send" && (
              <form onSubmit={send} className="space-y-3">
                <p className="text-[length:var(--text-sm)] text-ink-600">The dealer will see your part exchange and contact you about this van.</p>
                {!(buyer.first_name && buyer.mobile) && getSession() === null && <>
                  <Field compact label="First name"><input name="first_name" required maxLength={60} autoComplete="given-name" defaultValue={buyer.first_name} className={inputCls} /></Field>
                  <Field compact label="Mobile"><input name="mobile" type="tel" required maxLength={30} autoComplete="tel" defaultValue={buyer.mobile} placeholder="07700 900 000" className={inputCls} /></Field>
                </>}
                {buyer.first_name && buyer.mobile && <p className="text-[length:var(--text-xs)] text-ink-400">Sending as {buyer.first_name} · {buyer.mobile}</p>}
                {error && <p role="alert" className="rounded-[var(--radius-md)] bg-sold-tint px-3 py-2.5 text-[length:var(--text-sm)] font-medium text-sold-600">{error}</p>}
                <Button type="submit" variant="primary" size="lg" className="w-full" disabled={sending}>{sending ? "Sending…" : "Send my part exchange"}</Button>
              </form>
            )}
            {step === "sent" && <div><p className="font-semibold text-success-600">Sent to the dealer.</p><p className="mt-1 text-[length:var(--text-sm)] text-ink-600">{photos ? "You will get a message asking for a few photos so they can firm up the number." : "They will be in touch."}</p><Button type="button" variant="primary" size="lg" className="mt-3 w-full" onClick={() => ref.current?.close()}>Done</Button></div>}
          </div>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-3">
            {saved && <button type="button" onClick={(e) => { setReg(saved.reg); void submit(e as unknown as React.FormEvent, saved.reg); }} className="w-full rounded-[var(--radius-md)] border border-border bg-surface-1 px-3 py-2 text-left text-[length:var(--text-sm)] text-ink-800 hover:border-ink-400">Your {saved.label || saved.reg} · <span className="font-semibold text-brand-600">use this?</span></button>}
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
