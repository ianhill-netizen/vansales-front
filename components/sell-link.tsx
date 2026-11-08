"use client";

import { useState } from "react";
import { sellerUrl } from "@/lib/person";

/** "Sell your van": opens the seller portal, signed in when this device has a buyer session (a one-time handoff link), else the plain address. */
export function SellLink({ href, className, style, children }: { href: string; className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  const [busy, setBusy] = useState(false);
  return (
    <a href={href} className={className} style={style} aria-busy={busy}
      onClick={async (e) => {
        if (busy || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        setBusy(true);
        const url = await sellerUrl(href);
        window.location.assign(url);
      }}>
      {children}
    </a>
  );
}
