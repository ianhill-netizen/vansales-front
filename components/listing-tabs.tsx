"use client";

import { useEffect, useState, type ReactNode } from "react";

export interface ListingTab { id: string; label: string; content: ReactNode }

const valid = (tabs: ListingTab[], h: string) => tabs.some((t) => t.id === h);

/** Overview | Spec | Description | History. The active tab lives in the URL hash (#spec); every panel stays in the HTML (hidden), so the page's text is all still crawlable. */
export function ListingTabs({ tabs }: { tabs: ListingTab[] }) {
  const [active, setActive] = useState(tabs[0]!.id);
  useEffect(() => {
    const read = () => { const h = window.location.hash.slice(1); if (valid(tabs, h)) setActive(h); };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [tabs]);
  const select = (id: string) => { setActive(id); try { history.replaceState(null, "", `#${id}`); } catch { /* non-fatal */ } };
  return (
    <div data-testid="listing-tabs">
      <div role="tablist" aria-label="Van details" className="flex gap-1 overflow-x-auto border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((t) => (
          <button key={t.id} role="tab" type="button" id={`tab-${t.id}`} aria-selected={active === t.id} aria-controls={`panel-${t.id}`} onClick={() => select(t.id)}
            className={`-mb-px shrink-0 border-b-2 px-4 py-3 text-[length:var(--text-sm)] font-semibold transition-colors ${active === t.id ? "border-accent-500 text-ink-900" : "border-transparent text-ink-500 hover:text-ink-800"}`}>{t.label}</button>
        ))}
      </div>
      {tabs.map((t) => (
        <div key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} hidden={active !== t.id} className="pt-5">{t.content}</div>
      ))}
    </div>
  );
}
