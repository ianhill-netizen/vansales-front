"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/lib/roles/context";
import { IconCheck } from "@/components/icons";

const PLANS = [
  { id: "trial", label: "Free 14-day trial", price: "Free", desc: "Try Pro free, cancel any time", popular: true },
  { id: "payg", label: "Single advert (PAYG)", price: "~£9", desc: "One listing, no subscription" , popular: false },
  { id: "starter", label: "Starter — £39/mo", price: "£39", desc: "Up to 20 vans", popular: false },
  { id: "pro", label: "Pro — £89/mo", price: "£89", desc: "Up to 75 vans + analytics", popular: false },
  { id: "premium", label: "Premium — £199/mo", price: "£199", desc: "Unlimited vans + featured", popular: false },
];

export default function DealerSignUpPage() {
  const { setPersona } = useRole();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [plan, setPlan] = useState("trial");

  function handleStep1(e: React.FormEvent) { e.preventDefault(); setStep(2); }
  function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    setPersona("dealer");
    router.push("/dealer-portal");
  }

  return (
    <div className="w-full max-w-lg">
      <div className="mb-6 text-center">
        <span className="text-4xl" aria-hidden>🏪</span>
        <h1 className="mt-3 font-display text-[var(--text-xl)] font-extrabold text-ink-900">Trade dealer account</h1>
        <p className="mt-1 text-[var(--text-sm)] text-ink-500">Step {step} of 2 · {step === 1 ? "Your details" : "Choose a plan"}</p>
      </div>

      <div className="rounded-[var(--radius-xl)] border border-border bg-white shadow-[var(--shadow-md)]">
        {step === 1 ? (
          <form onSubmit={handleStep1} className="space-y-4 px-6 py-6">
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "first", label: "First name", type: "text", auto: "given-name" },
                { id: "last", label: "Last name", type: "text", auto: "family-name" },
              ].map((f) => (
                <div key={f.id}>
                  <label htmlFor={f.id} className="block text-[var(--text-xs)] font-semibold uppercase tracking-widest text-ink-500">{f.label}</label>
                  <input id={f.id} name={f.id} type={f.type} autoComplete={f.auto} required
                    className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[var(--text-sm)] outline-none focus-visible:border-brand-500" />
                </div>
              ))}
            </div>
            {[
              { id: "business", label: "Dealership / business name", type: "text", auto: "organization" },
              { id: "email", label: "Email address", type: "email", auto: "email" },
              { id: "phone", label: "Phone number", type: "tel", auto: "tel" },
            ].map((f) => (
              <div key={f.id}>
                <label htmlFor={f.id} className="block text-[var(--text-xs)] font-semibold uppercase tracking-widest text-ink-500">{f.label}</label>
                <input id={f.id} name={f.id} type={f.type} autoComplete={f.auto} required
                  className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[var(--text-sm)] outline-none focus-visible:border-brand-500" />
              </div>
            ))}
            <div>
              <label htmlFor="vans" className="block text-[var(--text-xs)] font-semibold uppercase tracking-widest text-ink-500">Approx. vans in stock</label>
              <input id="vans" name="vans" type="number" min={1}
                className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[var(--text-sm)] outline-none focus-visible:border-brand-500" />
            </div>
            <div>
              <label htmlFor="dealski" className="block text-[var(--text-xs)] font-semibold uppercase tracking-widest text-ink-500">Already on Dealski?</label>
              <select id="dealski" name="dealski"
                className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[var(--text-sm)] outline-none focus-visible:border-brand-500">
                <option value="yes">Yes — I have a Dealski account</option>
                <option value="no">No — not yet</option>
                <option value="unsure">Not sure</option>
              </select>
            </div>
            <button type="submit"
              className="flex h-11 w-full items-center justify-center rounded-[var(--radius-md)] bg-brand-500 text-[var(--text-sm)] font-bold text-white hover:bg-brand-600">
              Next: Choose plan →
            </button>
          </form>
        ) : (
          <form onSubmit={handleStep2} className="space-y-3 px-6 py-6">
            <p className="text-[var(--text-sm)] font-semibold text-ink-700">Choose your plan</p>
            {PLANS.map((p) => (
              <label key={p.id} className={`flex cursor-pointer items-center gap-4 rounded-[var(--radius-lg)] border p-4 transition-colors ${plan === p.id ? "border-brand-500 bg-brand-tint" : "border-border hover:border-brand-400/40"}`}>
                <input type="radio" name="plan" value={p.id} checked={plan === p.id} onChange={() => setPlan(p.id)} className="accent-brand-500" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink-900">{p.label}</span>
                    {p.popular && <span className="rounded-full bg-brand-tint px-2 py-0.5 text-[var(--text-2xs)] font-bold text-brand-700">Recommended</span>}
                  </div>
                  <p className="text-[var(--text-xs)] text-ink-500">{p.desc}</p>
                </div>
              </label>
            ))}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep(1)}
                className="flex h-11 flex-1 items-center justify-center rounded-[var(--radius-md)] border border-border text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400">
                ← Back
              </button>
              <button type="submit"
                className="flex h-11 flex-1 items-center justify-center rounded-[var(--radius-md)] bg-brand-500 text-[var(--text-sm)] font-bold text-white hover:bg-brand-600">
                Start {plan === "trial" ? "free trial" : plan === "payg" ? "listing" : "plan"} →
              </button>
            </div>
          </form>
        )}
      </div>
      <p className="mt-4 text-center text-[var(--text-xs)] text-ink-400">
        <Link href="/sign-up" className="hover:underline">← All account types</Link>
      </p>
    </div>
  );
}
