"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Button } from "./ui";
import { IconCheck, IconX } from "./icons";
import { Field, inputCls } from "./enquiry-fields";

const API = (process.env.NEXT_PUBLIC_VANSALES_API_URL || "https://api.vansales.com").replace(/\/$/, "");
const KEY = "vansales:buyer";

type Day = { date: string; slots: string[] };
type State = "loading" | "pick" | "details" | "submitting" | "done" | "error";
interface Buyer { first_name?: string; last_name?: string; mobile?: string; email?: string }

/** Normalises the slots endpoint, which may return [{date, slots:[ISO|HH:mm]}] or a flat list of ISO datetimes. */
function groupDays(raw: unknown): Day[] {
  const arr = Array.isArray(raw) ? raw : (raw as { data?: unknown })?.data;
  if (!Array.isArray(arr)) return [];
  if (arr.length && typeof arr[0] === "object" && arr[0] !== null && "slots" in (arr[0] as object)) {
    return (arr as { date: string; slots: string[] }[]).filter((d) => d.slots?.length).map((d) => ({ date: d.date, slots: d.slots }));
  }
  const by = new Map<string, string[]>();
  for (const s of arr as string[]) { const d = String(s).slice(0, 10); by.set(d, [...(by.get(d) ?? []), String(s)]); }
  return [...by].map(([date, slots]) => ({ date, slots }));
}
/** Slots come as London wall-clock "HH:mm"; send them with London's UTC offset on that date (+00:00 in winter, +01:00 in summer) so the API reads the right instant. */
function fullIso(day: string, slot: string): string {
  if (slot.length > 8) return slot;
  const probe = new Date(`${day}T${slot}:00Z`);
  const london = new Date(probe.toLocaleString("en-US", { timeZone: "Europe/London" }));
  const utc = new Date(probe.toLocaleString("en-US", { timeZone: "UTC" }));
  const mins = Math.round((london.getTime() - utc.getTime()) / 60000);
  return `${day}T${slot}:00${mins === 0 ? "+00:00" : "+01:00"}`;
}
const timeOf = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" });
const dayLabel = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
function toE164(raw: string): string | null {
  const d = raw.replace(/[\s\-().]/g, "");
  const n = d.startsWith("+") ? d : d.startsWith("00") ? `+${d.slice(2)}` : d.startsWith("0") ? `+44${d.slice(1)}` : d;
  return /^\+[1-9]\d{7,14}$/.test(n) ? n.replace(/^\+440/, "+44") : null;
}

/** "Book a test drive": pick a day (next 14, within the dealer's open hours) and a slot, then confirm. POST {API}/api/public/test-drive/{id} {requested_at, first_name, last_name, mobile, email?}. The buyer's remembered details (vansales:buyer) are used when present; otherwise it asks. */
export function TestDriveModal({ listingId, dealerName, open, onClose }: { listingId: string; dealerName: string; open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [state, setState] = useState<State>("loading");
  const [error, setError] = useState("");
  const [days, setDays] = useState<Day[]>([]);
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [saved, setSaved] = useState<Buyer>({});
  const [reference, setReference] = useState<string | null>(null);
  const known = !!(saved.first_name && saved.mobile);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading remembered buyer details on open
      try { setSaved(JSON.parse(localStorage.getItem(KEY) || "{}")); } catch {}
      setState("loading"); setError(""); setSlot(null);
      void fetch(`${API}/api/public/listings/${encodeURIComponent(listingId)}/test-drive-slots`, { headers: { Accept: "application/json" } })
        .then(async (r) => { if (!r.ok) throw new Error(String(r.status)); const g = groupDays(await r.json()); setDays(g); setDay(g[0]?.date ?? null); setState("pick"); })
        .catch(() => { setError("We could not load the available times. Please try again."); setState("error"); });
    }
    if (!open && d.open) d.close();
  }, [open, listingId]);

  const slots = useMemo(() => days.find((x) => x.date === day)?.slots ?? [], [days, day]);
  const close = () => { onClose(); setState((s) => (s === "done" ? "loading" : s)); };

  async function send(buyer: Buyer) {
    if (!slot || !day) return;
    const mobile = toE164(buyer.mobile ?? "");
    if (!mobile) { setError("Please enter a mobile number we can reach you on, e.g. 07700 900 000."); setState("details"); return; }
    setState("submitting"); setError("");
    try {
      const res = await fetch(`${API}/api/public/test-drive/${encodeURIComponent(listingId)}`, {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ requested_at: fullIso(day, slot), first_name: buyer.first_name, last_name: buyer.last_name || null, mobile, email: buyer.email || null }),
      });
      if (res.ok) {
        const b = (await res.json().catch(() => ({}))) as { ref?: string | null; data?: { ref?: string } };
        setReference(b.ref ?? b.data?.ref ?? null); setState("done");
        try { localStorage.setItem(KEY, JSON.stringify({ ...saved, first_name: buyer.first_name, last_name: buyer.last_name, mobile: buyer.mobile })); } catch {}
        return;
      }
      const body = (await res.json().catch(() => ({}))) as { message?: string; errors?: Record<string, string[]> };
      setError(res.status === 422 ? (Object.values(body.errors ?? {})[0]?.[0] ?? body.message ?? "That time is no longer available. Please pick another.") : res.status === 429 ? "You have sent a few requests already. Please try again in an hour." : "Something went wrong. Please try again.");
      setState(res.status === 422 ? "pick" : "error");
    } catch { setError("We could not reach the server. Please check your connection and try again."); setState("error"); }
  }

  function onDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    void send({ first_name: String(fd.get("first_name") ?? "").trim(), last_name: String(fd.get("last_name") ?? "").trim(), mobile: String(fd.get("mobile") ?? "").trim(), email: String(fd.get("email") ?? "").trim() });
  }
  const chip = (on: boolean) => `rounded-[var(--radius-md)] border px-3 py-2 text-[length:var(--text-sm)] font-semibold ${on ? "border-brand-500 bg-brand-500 text-white" : "border-border bg-white text-ink-800 hover:border-ink-400"}`;

  return (
    <dialog ref={ref} aria-labelledby={titleId} onClose={() => { if (open) close(); }} onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-[var(--radius-xl)] border border-border bg-card p-0 text-ink-800 shadow-[var(--shadow-lg)] backdrop:bg-ink-900/60">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="font-display text-[length:var(--text-lg)] font-bold text-ink-900">Book a test drive</h2>
            <p className="mt-1 text-[length:var(--text-sm)] text-ink-500">Pick a time and {dealerName} will confirm it.</p>
          </div>
          <button type="button" onClick={() => ref.current?.close()} aria-label="Close" className="grid size-9 shrink-0 place-items-center rounded-[var(--radius-md)] text-ink-500 hover:bg-surface-1 hover:text-ink-900"><IconX width={18} height={18} aria-hidden /></button>
        </div>

        {state === "loading" && <p role="status" className="mt-4 text-[length:var(--text-sm)] text-ink-500">Loading available times…</p>}
        {error && state !== "done" && <p role="alert" className="mt-4 rounded-[var(--radius-md)] bg-sold-tint px-3 py-2.5 text-[length:var(--text-sm)] font-medium text-sold-600">{error}</p>}

        {state === "pick" && (days.length === 0 ? <p className="mt-4 text-[length:var(--text-sm)] text-ink-600">There are no free times in the next 14 days. Please use Enquire and the dealer will arrange one.</p> : (
          <div className="mt-4 space-y-4">
            <div><p className="mb-2 text-[length:var(--text-xs)] font-semibold uppercase tracking-wide text-ink-400">Day</p>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Day">{days.map((d) => <button key={d.date} type="button" role="radio" aria-checked={day === d.date} onClick={() => { setDay(d.date); setSlot(null); }} className={chip(day === d.date)}>{dayLabel(d.date)}</button>)}</div></div>
            <div><p className="mb-2 text-[length:var(--text-xs)] font-semibold uppercase tracking-wide text-ink-400">Time</p>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Time">{slots.map((s) => { const label = s.length > 8 ? timeOf(s) : s.slice(0, 5); return <button key={s} type="button" role="radio" aria-checked={slot === s} onClick={() => setSlot(s)} className={chip(slot === s)}>{label}</button>; })}</div></div>
            <Button type="button" variant="primary" size="lg" className="w-full" disabled={!slot} onClick={() => (known ? void send(saved) : setState("details"))}>{known ? `Request ${slot ? (slot.length > 8 ? timeOf(slot) : slot.slice(0, 5)) : "a time"}` : "Continue"}</Button>
            {known && <p className="text-center text-[length:var(--text-xs)] text-ink-400">Booking as {saved.first_name} · {saved.mobile}</p>}
          </div>
        ))}

        {(state === "details" || (state === "submitting" && !known)) && (
          <form onSubmit={onDetails} className="mt-4 space-y-3">
            <Field label="First name" required><input name="first_name" required maxLength={60} autoComplete="given-name" defaultValue={saved.first_name} className={inputCls} /></Field>
            <Field label="Last name"><input name="last_name" maxLength={60} autoComplete="family-name" defaultValue={saved.last_name} className={inputCls} /></Field>
            <Field label="Mobile" required><input type="tel" name="mobile" required maxLength={30} autoComplete="tel" defaultValue={saved.mobile} placeholder="07700 900 000" className={inputCls} /></Field>
            <Field label="Email (optional)"><input type="email" name="email" maxLength={255} autoComplete="email" defaultValue={saved.email} className={inputCls} /></Field>
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={state === "submitting"}>{state === "submitting" ? "Sending…" : "Request test drive"}</Button>
            <button type="button" onClick={() => setState("pick")} className="w-full text-center text-[length:var(--text-sm)] text-ink-500 underline">Back</button>
          </form>
        )}

        {state === "submitting" && known && <p role="status" className="mt-4 text-[length:var(--text-sm)] text-ink-500">Sending…</p>}
        {state === "error" && <Button type="button" variant="primary" size="lg" className="mt-4 w-full" onClick={() => ref.current?.close()}>Close</Button>}
        {state === "done" && (
          <div className="mt-4">
            <div role="status" className="flex items-start gap-3 rounded-[var(--radius-md)] bg-success-tint p-4">
              <IconCheck width={20} height={20} className="mt-0.5 shrink-0 text-success-600" />
              <div><p className="font-semibold text-success-600">Request sent.</p>
                <p className="mt-1 text-[length:var(--text-sm)] text-ink-600">{dealerName} will confirm your test drive by text.{reference ? <> Your reference is <span className="font-semibold text-ink-900">{reference}</span>.</> : null}</p></div>
            </div>
            <Button type="button" variant="primary" size="lg" className="mt-4 w-full" onClick={() => ref.current?.close()}>Done</Button>
          </div>
        )}
      </div>
    </dialog>
  );
}
