import type { Listing } from "@/lib/listings/types";
import {
  formatMileage,
  titleCase,
  WHEELBASE_LABEL,
  ROOF_LABEL,
  payloadDisplay,
  loadLengthDisplay,
} from "@/lib/listings/format";

type Row = { label: string; value: string | null };
type Group = { title: string; rows: Row[] };

function buildGroups(l: Listing): Group[] {
  const v = l.van_spec;
  return [
    {
      title: "Overview",
      rows: [
        { label: "Make", value: l.make },
        { label: "Model", value: l.model },
        { label: "Derivative", value: l.derivative || null },
        { label: "Condition", value: titleCase(l.condition) },
        { label: "Registration year", value: l.year > 0 ? `${l.year}${l.plate ? ` (${l.plate} plate)` : ""}` : null },
        { label: "Colour", value: l.colour && l.colour !== "—" ? l.colour : null },
      ],
    },
    {
      title: "Running gear",
      rows: [
        { label: "Mileage", value: formatMileage(l.mileage) },
        { label: "Fuel", value: titleCase(l.fuel) },
        { label: "Transmission", value: titleCase(l.transmission) },
        { label: "Drivetrain", value: l.drivetrain },
        { label: "Engine", value: l.engine_cc ? `${(l.engine_cc / 1000).toFixed(1)}L (${l.engine_cc}cc)` : null },
        { label: "Emissions", value: l.euro_status },
        { label: "ULEZ compliant", value: l.ulez ? "Yes" : "No" },
      ],
    },
    {
      title: "Load & dimensions",
      rows: [
        { label: "Body style", value: v.body_style },
        { label: "Wheelbase", value: v.wheelbase ? WHEELBASE_LABEL[v.wheelbase] : null },
        { label: "Roof height", value: v.roof_height ? ROOF_LABEL[v.roof_height] : null },
        { label: "Payload", value: payloadDisplay(v.payload_kg) },
        { label: "Load length", value: loadLengthDisplay(v.load_length_mm) },
        { label: "Doors", value: v.doors != null ? String(v.doors) : null },
      ],
    },
  ];
}

export function SpecTable({ listing }: { listing: Listing }) {
  const groups = buildGroups(listing).map((g) => ({
    ...g,
    rows: g.rows.filter((r) => r.value && r.value !== "—"),
  }));

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((g) => (
        <section key={g.title} className="rounded-[var(--radius-lg)] border border-border bg-card p-1">
          <h3 className="px-3 pb-1 pt-3 font-display text-[var(--text-base)] font-bold text-ink-900">
            {g.title}
          </h3>
          <dl className="divide-y divide-border">
            {g.rows.map((r) => (
              <div key={r.label} className="flex items-baseline justify-between gap-4 px-3 py-2.5">
                <dt className="text-[var(--text-sm)] text-ink-500">{r.label}</dt>
                <dd className="text-right font-mono text-[var(--text-sm)] font-medium text-ink-800">
                  {r.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
