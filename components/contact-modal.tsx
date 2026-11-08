"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "./ui";
import { IconCheck, IconPhone, IconWhatsApp, IconX } from "./icons";
import { Field, inputCls } from "./enquiry-fields";

/** The vansales API's public host (the browser posts to it directly so the API rate-limits the buyer's own address: 10 an hour). */
const API = (process.env.NEXT_PUBLIC_VANSALES_API_URL || "https://api.vansales.com").replace(/\/$/, "");

type State = "idle" | "submitting" | "done" | "error";
export type ContactChannel = "whatsapp" | "call";
const KEY = "vansales:buyer";

/**
 * Gated contact: the WhatsApp and Call buttons never carry a number. They open this modal (centred on a desktop, a bottom sheet on a phone) for First name, Last name and Mobile; the details are POSTed to
 * {API}/api/public/listings/{id}/lead, which logs a lead FIRST and returns {ref, whatsapp_url} or {ref, phone_number}. Only then is a number shown or opened: WhatsApp opens wa.me with the message already typed
 * (it quotes the ref), Call reveals a tap-to-call link and "Quote ref VS-4821". Built on the native <dialog> (focus trap, Esc, inert page behind). `website` is a honeypot.
 */
/** UK numbers in any spelling to E.164 (07700 900123 -> +447700900123); a number already starting + is kept. Null when it is not a phone number the API will take. */
function toE164(raw: string): string | null {
  const d = raw.replace(/[\s\-().]/g, "");
  const n = d.startsWith("+") ? d : d.startsWith("00") ? `+${d.slice(2)}` : d.startsWith("0") ? `+44${d.slice(1)}` : d;
  return /^\+[1-9]\d{7,14}$/.test(n) ? n.replace(/^\+440/, "+44") : null;
}

export function ContactModal({ listingId, dealerName, label, channel, open, onClose, callIntent = false }: { listingId: string; dealerName: string; label: string; channel: ContactChannel; open: boolean; onClose: () => void; /** Call: ring the vansales number instead of being given the dealer's: POST /api/public/call-intent/{id} (the lead is logged by the API). */ callIntent?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ ref: string; whatsapp_url?: string; phone_number?: string; dial_number?: string; dealer_name?: string } | null>(null);
  const [saved, setSaved] = useState<{ first_name?: string; last_name?: string; mobile?: string }>({});

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the remembered buyer details from localStorage on open (it does not exist on the server)
    if (open && !d.open) { d.showModal(); try { setSaved(JSON.parse(localStorage.getItem(KEY) || "{}")); } catch {} }
    if (!open && d.open) d.close();
  }, [open]);

  function close() {
    onClose();
    setState((s) => (s === "done" ? "idle" : s));
    setResult(null);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "submitting") return;
    const fd = new FormData(e.currentTarget);
    const mine = { first_name: String(fd.get("first_name") ?? "").trim(), last_name: String(fd.get("last_name") ?? "").trim(), mobile: String(fd.get("mobile") ?? "").trim() };
    setState("submitting"); setError("");
    if (channel === "call" && callIntent) {
      // Masked call: the API makes a call intent for this mobile and hands back the vansales number to ring; the call is then forwarded to the dealer's team. The dealer's own number is never sent.
      const e164 = toE164(mine.mobile);
      if (!e164) { setError("Please enter a phone number we can call you back on, e.g. 07700 900 000."); setState("error"); return; }
      try {
        const res = await fetch(`${API}/api/public/call-intent/${encodeURIComponent(listingId)}`, {
          method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ buyer_mobile: e164, first_name: mine.first_name, last_name: mine.last_name, website: fd.get("website") }),
        });
        const body = (await res.json().catch(() => ({}))) as { dial_number?: string; dealer_name?: string; ref?: string; message?: string; error?: string };
        if (res.status === 201 && body.dial_number) {
          try { localStorage.setItem(KEY, JSON.stringify(mine)); } catch {}
          setResult({ ref: body.ref ?? "", dial_number: body.dial_number, dealer_name: body.dealer_name ?? dealerName }); setState("done");
          // on a phone, dial straight away (the link below is the fallback)
          if (window.matchMedia("(pointer: coarse)").matches) window.location.href = `tel:${body.dial_number.replace(/[^\d+]/g, "")}`;
          return;
        }
        setError(res.status === 402 ? "This dealer is not taking calls through vansales right now. Please send a message instead."
          : res.status === 429 ? "You have asked for a few calls already. Please try again in an hour."
          : res.status === 404 ? "Sorry, this advert is no longer available." : (body.message ?? "Something went wrong. Please try again."));
      } catch {
        setError("We could not reach the server. Please check your connection and try again.");
      }
      setState("error");
      return;
    }
    try {
      const res = await fetch(`${API}/api/public/listings/${encodeURIComponent(listingId)}/lead`, {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...mine, channel, website: fd.get("website") }),
      });
      if (res.status === 201) {
        const body = (await res.json()) as { ref: string; whatsapp_url?: string; phone_number?: string };
        try { localStorage.setItem(KEY, JSON.stringify(mine)); } catch {}
        setResult(body); setState("done");
        if (channel === "whatsapp" && body.whatsapp_url) window.open(body.whatsapp_url, "_blank", "noopener,noreferrer");   // the link below is the fallback if a popup blocker stops this
        return;
      }
      const body = (await res.json().catch(() => ({}))) as { message?: string; errors?: Record<string, string[]> };
      setError(res.status === 422 ? (Object.values(body.errors ?? {})[0]?.[0] ?? body.message ?? "Please check your details and try again.")
        : res.status === 429 ? "You have asked for a few contacts already. Please try again in an hour."
        : res.status === 404 ? "Sorry, this advert is no longer available." : "Something went wrong. Please try again.");
      setState("error");
    } catch {
      setError("We could not reach the server. Please check your connection and try again.");
      setState("error");
    }
  }

  const Icon = channel === "whatsapp" ? IconWhatsApp : IconPhone;
  return (
    <dialog
      ref={ref} aria-labelledby={titleId}
      onClose={() => { if (open) close(); }}
      onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}
      // a bottom sheet under 640px, a centred card above it
      className="m-0 mt-auto w-full max-w-none rounded-t-[var(--radius-xl)] rounded-b-none border border-border bg-card p-0 text-ink-800 shadow-[var(--shadow-lg)] backdrop:bg-ink-900/60 sm:m-auto sm:w-[calc(100%-2rem)] sm:max-w-md sm:rounded-[var(--radius-xl)]"
    >
      <div className="p-5 pb-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="font-display text-[length:var(--text-lg)] font-bold text-ink-900">Contact {dealerName}</h2>
            <p className="mt-1 text-[length:var(--text-sm)] text-ink-500">{channel === "whatsapp" ? `Tell us who you are and we will open WhatsApp about the ${label}.` : `Tell us who you are and we will show you the number for the ${label}.`}</p>
          </div>
          <button type="button" onClick={() => ref.current?.close()} aria-label="Close" className="grid size-9 shrink-0 place-items-center rounded-[var(--radius-md)] text-ink-500 hover:bg-surface-1 hover:text-ink-900"><IconX width={18} height={18} aria-hidden /></button>
        </div>

        {state === "done" && result ? (
          <div className="mt-4 space-y-3" role="status">
            <div className="flex items-start gap-3 rounded-[var(--radius-md)] bg-success-tint p-4">
              <IconCheck width={20} height={20} className="mt-0.5 shrink-0 text-success-600" />
              <div>
                <p className="font-semibold text-success-600">{channel === "whatsapp" ? "Opening WhatsApp…" : result.dial_number ? "You're all set." : "Here is the number."}</p>
                {result.ref && <p className="mt-1 text-[length:var(--text-sm)] text-ink-600">Your reference is <span className="font-semibold text-ink-900" data-testid="lead-ref">{result.ref}</span>.{channel === "call" && !result.dial_number ? " Quote it when you call." : ""}</p>}
              </div>
            </div>
            {channel === "whatsapp" && result.whatsapp_url && (
              <a href={result.whatsapp_url} target="_blank" rel="noopener noreferrer" className="flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[#25D366] font-semibold text-white hover:bg-[#1ebe5d]"><IconWhatsApp width={18} height={18} aria-hidden />Open WhatsApp</a>
            )}
            {channel === "call" && result.dial_number && (
              <>
                <p className="text-[length:var(--text-sm)] text-ink-700" data-testid="call-now">Call <span className="font-semibold">{result.dial_number}</span> now — you&apos;ll be connected to {result.dealer_name}. Calls are recorded.</p>
                <a href={`tel:${result.dial_number.replace(/[^\d+]/g, "")}`} className="flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-brand-600 text-[length:var(--text-lg)] font-bold text-white hover:bg-brand-700" data-testid="phone-link"><IconPhone width={18} height={18} aria-hidden />Call {result.dial_number}</a>
              </>
            )}
            {channel === "call" && result.phone_number && (
              <a href={`tel:${result.phone_number.replace(/[^\d+]/g, "")}`} className="flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-brand-600 text-[length:var(--text-lg)] font-bold text-white hover:bg-brand-700" data-testid="phone-link"><IconPhone width={18} height={18} aria-hidden />{result.phone_number}</a>
            )}
            <Button type="button" variant="outline" size="lg" className="w-full" onClick={() => ref.current?.close()}>Done</Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-4 space-y-3" key={`${open}-${saved.mobile ?? ""}`}>
            <input type="text" name="website" tabIndex={-1} aria-hidden="true" autoComplete="off" className="sr-only" />
            <div className="grid grid-cols-2 gap-3">
              <Field compact label="First name" required><input type="text" name="first_name" required maxLength={60} autoComplete="given-name" defaultValue={saved.first_name ?? ""} className={inputCls} /></Field>
              <Field compact label="Last name" required><input type="text" name="last_name" required maxLength={60} autoComplete="family-name" defaultValue={saved.last_name ?? ""} className={inputCls} /></Field>
            </div>
            <Field compact label="Mobile" required><input type="tel" name="mobile" required inputMode="tel" maxLength={30} pattern="[0-9+()\s.\-]{6,30}" title="A mobile number, e.g. 07700 900 000" autoComplete="tel" placeholder="07700 900 000" defaultValue={saved.mobile ?? ""} className={inputCls} /></Field>
            {state === "error" && <p role="alert" className="rounded-[var(--radius-md)] bg-sold-tint px-3 py-2.5 text-[length:var(--text-sm)] font-medium text-sold-600">{error}</p>}
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={state === "submitting"}>
              <Icon width={16} height={16} aria-hidden />{state === "submitting" ? "One moment…" : channel === "whatsapp" ? "Continue to WhatsApp" : callIntent ? "Get the number to call" : "Show the number"}
            </Button>
            <p className="text-center text-[length:var(--text-xs)] text-ink-400">We log every contact so a dealer can trace it. Your details go only to {dealerName}.</p>
          </form>
        )}
      </div>
    </dialog>
  );
}
