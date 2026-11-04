import type { HpiCheck, HpiResult } from "@/lib/listings/types";
import { IconCheck } from "./icons";

/* Vehicle history check card (private adverts). Only renders when the API publishes
   the findings (hpi_result). Green tick = clear; red cross + the issue text = flagged.
   A check the provider could not answer is shown as "Not checked", never as a tick. */

type Row = { label: string; state: "clear" | "flag" | "unknown"; text?: string };

const CHECKS: { key: keyof HpiResult; clear: string; flagged: string }[] = [
  { key: "stolen", clear: "Not reported stolen", flagged: "Reported stolen" },
  { key: "finance_outstanding", clear: "No outstanding finance", flagged: "Outstanding finance" },
  { key: "written_off", clear: "Not written off", flagged: "Recorded as written off" },
  { key: "mileage_discrepancy", clear: "No mileage discrepancy", flagged: "Mileage discrepancy" },
  { key: "plate_changes", clear: "No plate changes", flagged: "Plate changes recorded" },
];

function rowFor(r: HpiResult, c: (typeof CHECKS)[number]): Row {
  const check = r[c.key] as HpiCheck | null | undefined;
  if (!check || typeof check !== "object") return { label: c.clear, state: "unknown" };
  const flagged = check.flag === true || check.status === "issues";
  if (flagged) return { label: c.flagged, state: "flag", text: check.detail || undefined };
  if (check.status === "clear" || check.flag === false) return { label: c.clear, state: "clear" };
  return { label: c.clear, state: "unknown" };
}

function keepers(r: HpiResult): number | null {
  const k = r.previous_keepers;
  if (typeof k === "number") return k;
  if (k && typeof k === "object") {
    const n = (k as { count?: number | null }).count;
    if (typeof n === "number") return n;
    const m = String((k as HpiCheck).detail ?? "").match(/\d+/);
    if (m) return Number(m[0]);
  }
  return null;
}

const fmtDate = (d: string) =>
  new Date(d.length <= 10 ? `${d}T00:00:00Z` : d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export function HpiCard({ result, checkedAt }: { result: HpiResult; checkedAt?: string | null }) {
  const rows = CHECKS.map((c) => rowFor(result, c));
  const owners = keepers(result);
  const date = checkedAt || result.checked_at || null;
  const anyFlag = rows.some((r) => r.state === "flag");

  return (
    <section
      aria-label="Vehicle history check"
      className={`mt-6 rounded-[var(--radius-lg)] border p-5 ${anyFlag ? "border-red-200 bg-red-50/50" : "border-success-500/30 bg-success-500/5"}`}
    >
      <h2 className="font-display text-[var(--text-xl)] font-bold text-ink-900">Vehicle history check</h2>
      <ul className="mt-3 space-y-2.5">
        {rows.map((r) => (
          <li key={r.label} className="flex items-start gap-2.5 text-[var(--text-md)] text-ink-800">
            {r.state === "clear" ? (
              <IconCheck width={18} height={18} className="mt-0.5 shrink-0 text-success-500" aria-label="Clear" />
            ) : r.state === "flag" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" className="mt-0.5 shrink-0" role="img" aria-label="Flagged"><path d="M6 6l12 12M18 6L6 18" /></svg>
            ) : (
              <span className="mt-0.5 grid size-[18px] shrink-0 place-items-center text-ink-400" role="img" aria-label="Not checked">–</span>
            )}
            <span>
              <span className={r.state === "flag" ? "font-semibold text-red-700" : r.state === "unknown" ? "text-ink-500" : ""}>
                {r.state === "unknown" ? `${r.label.replace(/^(Not |No )/, "")}: not checked` : r.label}
              </span>
              {r.text && <span className="block text-[var(--text-sm)] text-red-700">{r.text}</span>}
            </span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 grid gap-x-8 gap-y-1 border-t border-black/5 pt-3 text-[var(--text-sm)] sm:grid-cols-2">
        {owners != null && (
          <div className="flex justify-between gap-3"><dt className="text-ink-500">Previous keepers</dt><dd className="font-medium text-ink-900">{owners}</dd></div>
        )}
        {date && (
          <div className="flex justify-between gap-3"><dt className="text-ink-500">Checked</dt><dd className="font-medium text-ink-900">{fmtDate(date)}</dd></div>
        )}
      </dl>
    </section>
  );
}
