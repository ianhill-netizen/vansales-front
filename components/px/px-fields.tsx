"use client";

import { useEffect, useState } from "react";
import { PxLookup } from "./px-lookup";

/**
 * The optional "Part exchange?" part of a buyer enquiry form. Off: renders only the checkbox and the surrounding form posts exactly what it did before. On: reg + mileage + "Value my van"
 * (the average is shown inline); the two inputs are named px_reg / px_mileage, so the parent form's FormData carries them. No valuation figure is ever sent with an enquiry: the server fills that in
 * from its own lookup. `?px_reg=&px_mileage=` in the page URL (the dealer page's "Get a firm offer" link) opens it pre-filled.
 */
export function PxFields({ initial }: { initial?: { reg: string; mileage: string } }) {
  const [open, setOpen] = useState(!!initial);
  const [pre, setPre] = useState(initial ?? { reg: "", mileage: "" });
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const reg = sp.get("px_reg");
      const mileage = sp.get("px_mileage");
      if (reg && /^[A-Za-z0-9 ]{2,10}$/.test(reg) && mileage && /^\d{1,7}$/.test(mileage)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPre({ reg: reg.toUpperCase(), mileage });
        setOpen(true);
      }
    } catch { /* non-fatal */ }
  }, []);
  return (
    <div className="rounded-[var(--radius-md)] border border-border p-3">
      <label className="flex cursor-pointer items-center gap-2.5 text-[length:var(--text-sm)] font-semibold text-ink-800">
        <input type="checkbox" checked={open} onChange={(e) => setOpen(e.target.checked)} className="size-4 accent-[var(--brand-600,#1b5aa8)]" />
        Part exchange?
      </label>
      {open && <div className="mt-3"><PxLookup key={pre.reg + pre.mileage} variant="average" initialReg={pre.reg} initialMileage={pre.mileage} /></div>}
    </div>
  );
}
