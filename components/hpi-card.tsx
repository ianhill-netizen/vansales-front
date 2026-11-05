import type { HpiCheckPublic } from "@/lib/listings/types";
import { IconCheck } from "./icons";

/* Vehicle history check card (private adverts). Reads the vansales API's hpi_check:
   each flag is true = problem found, false = checked and clear, null = NOT checked.
   Green tick = clear; red cross = a problem; a dash = not checked (never shown as a pass). */

type Row = { label: string; state: "clear" | "flag" | "unknown" };

const ROWS: { key: keyof Pick<HpiCheckPublic, "stolen" | "finance" | "written_off" | "mileage_discrepancy" | "plate_changes">; clear: string; flagged: string; unchecked: string }[] = [
  { key: "stolen", clear: "Not reported stolen", flagged: "Reported stolen", unchecked: "Stolen marker: not checked" },
  { key: "finance", clear: "No outstanding finance", flagged: "Outstanding finance recorded", unchecked: "Finance: not checked" },
  { key: "written_off", clear: "Not written off", flagged: "Recorded as written off", unchecked: "Write-off: not checked" },
  { key: "mileage_discrepancy", clear: "No mileage discrepancy", flagged: "Mileage discrepancy recorded", unchecked: "Mileage history: not checked" },
  { key: "plate_changes", clear: "No plate changes", flagged: "Plate changes recorded", unchecked: "Plate changes: not checked" },
];

const fmtDate = (d: string) =>
  new Date(d.length <= 10 ? `${d}T00:00:00Z` : d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export function HpiCard({ result }: { result: HpiCheckPublic }) {
  const rows: (Row & { text: string })[] = ROWS.map((r) => {
    const v = result[r.key];
    return v === true
      ? { label: r.flagged, text: r.flagged, state: "flag" }
      : v === false
        ? { label: r.clear, text: r.clear, state: "clear" }
        : { label: r.unchecked, text: r.unchecked, state: "unknown" };
  });
  const anyFlag = rows.some((r) => r.state === "flag");

  return (
    <section
      aria-label="Vehicle history check"
      className={`mt-6 rounded-[var(--radius-lg)] border p-5 ${anyFlag ? "border-red-200 bg-red-50/50" : "border-success-500/30 bg-success-500/5"}`}
    >
      <h2 className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">Vehicle history check</h2>
      <ul className="mt-3 space-y-2.5">
        {rows.map((r) => (
          <li key={r.label} className="flex items-start gap-2.5 text-[length:var(--text-md)] text-ink-800">
            {r.state === "clear" ? (
              <IconCheck width={18} height={18} className="mt-0.5 shrink-0 text-success-500" aria-label="Clear" />
            ) : r.state === "flag" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" className="mt-0.5 shrink-0" role="img" aria-label="Flagged"><path d="M6 6l12 12M18 6L6 18" /></svg>
            ) : (
              <span className="mt-0.5 grid size-[18px] shrink-0 place-items-center text-ink-400" role="img" aria-label="Not checked">–</span>
            )}
            <span className={r.state === "flag" ? "font-semibold text-red-700" : r.state === "unknown" ? "text-ink-500" : ""}>{r.text}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 grid gap-x-8 gap-y-1 border-t border-black/5 pt-3 text-[length:var(--text-sm)] sm:grid-cols-2">
        {result.previous_keepers != null && (
          <div className="flex justify-between gap-3"><dt className="text-ink-500">Previous keepers</dt><dd className="font-medium text-ink-900">{result.previous_keepers}</dd></div>
        )}
        {result.checked_at && (
          <div className="flex justify-between gap-3"><dt className="text-ink-500">Checked</dt><dd className="font-medium text-ink-900">{fmtDate(result.checked_at)}</dd></div>
        )}
      </dl>
    </section>
  );
}
