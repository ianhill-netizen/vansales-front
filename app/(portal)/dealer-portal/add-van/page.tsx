"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRole } from "@/lib/roles/context";
import { VAN_MAKES } from "@/lib/taxonomy/van-makes";

// ── Types ──────────────────────────────────────────────────────────────────────
type Step = "entry" | "lookup-result" | "manual-pick" | "details" | "success";

type StubVehicle = {
  make: string;
  model: string;
  derivative: string;
  year: number;
  fuel: string;
  colour: string;
};

type VanForm = {
  make: string;
  model: string;
  derivative: string;
  year: string;
  fuel: string;
  colour: string;
  condition: "used" | "new";
  mileage: string;
  conversionType: string;
  wheelbase: string;
  roofHeight: string;
  sideLoadingDoors: string;
  rearDoors: string;
  payload: string;
  loadLength: string;
  seats: string;
  towBar: boolean;
  roofRack: boolean;
  internalRacking: boolean;
  bodykit: boolean;
  price: string;
  description: string;
};

// ── Constants (module-level) ───────────────────────────────────────────────────
const STUB_RESULTS: StubVehicle[] = [
  { make: "Ford", model: "Transit Custom", derivative: "2.0 TDCi 130ps L1 H1 Limited", year: 2022, fuel: "Diesel", colour: "Frozen White" },
  { make: "Volkswagen", model: "Transporter", derivative: "T6.1 2.0 TDI 150ps Highline SWB", year: 2021, fuel: "Diesel", colour: "Reflex Silver" },
  { make: "Mercedes-Benz", model: "Sprinter", derivative: "314 CDI LWB High Roof", year: 2023, fuel: "Diesel", colour: "Polar White" },
  { make: "Vauxhall", model: "Vivaro", derivative: "2.0 Turbo D 120ps L2 H1 Dynamic", year: 2022, fuel: "Diesel", colour: "Signal Orange" },
  { make: "Renault", model: "Master", derivative: "FWD LH35dCi 135 LWB High Roof", year: 2021, fuel: "Diesel", colour: "Light Grey" },
  { make: "Peugeot", model: "Expert", derivative: "2.0 BlueHDi 120ps Compact Pro", year: 2023, fuel: "Diesel", colour: "Nimbus Grey" },
  { make: "Toyota", model: "Proace", derivative: "2.0D 144ps L1 Active", year: 2022, fuel: "Diesel", colour: "Celestial Silver" },
  { make: "Maxus", model: "eDeliver 9", derivative: "LWB High Roof 88.55kWh", year: 2024, fuel: "Electric", colour: "Pearl White" },
];

// Single source: derived from lib/taxonomy/van-makes so homepage and this form stay in sync.
const MAKES = VAN_MAKES.map((m) => m.name);

const MODELS_BY_MAKE: Record<string, string[]> = {
  Ford: ["Transit", "Transit Custom", "Transit Connect", "Transit Courier", "Ranger"],
  Volkswagen: ["Transporter", "Crafter", "Caddy", "Amarok"],
  "Mercedes-Benz": ["Sprinter", "Vito", "Citan", "eSprinter"],
  Vauxhall: ["Vivaro", "Movano", "Combo"],
  Renault: ["Master", "Trafic", "Kangoo", "Kangoo E-Tech"],
  Peugeot: ["Boxer", "Expert", "Partner"],
  "Citroën": ["Relay", "Dispatch", "Berlingo"],
  Fiat: ["Ducato", "Scudo", "Doblò"],
  Nissan: ["Interstar", "Primastar", "NV200", "Townstar"],
  Toyota: ["Proace", "Proace City", "Proace Electric", "Hilux"],
  Iveco: ["Daily"],
  Maxus: ["Deliver 9", "eDeliver 9", "Deliver 3", "MIFA 9"],
  "Land Rover": ["Defender Commercial", "Defender Pickup", "Discovery Commercial"],
  MAN: ["TGE"],
  Ineos: ["Grenadier", "Quartermaster"],
};

const FUEL_TYPES = ["Diesel", "Petrol", "Electric", "Hybrid", "PHEV", "LPG"];

const COLOURS = [
  "White", "Polar White", "Frozen White", "Pearl White", "Silver", "Reflex Silver",
  "Grey", "Nimbus Grey", "Blue", "Black", "Red", "Orange", "Green", "Brown", "Beige",
];

const YEARS = Array.from({ length: 20 }, (_, i) => 2026 - i);

const CONVERSION_TYPES = [
  "Panel van", "Crew van", "Luton", "Tipper", "Dropside",
  "Chassis cab", "Minibus", "Campervan",
];

const WHEELBASES = ["SWB", "MWB", "LWB", "XLWB"];
const ROOF_HEIGHTS = ["Low roof", "Medium roof", "High roof", "Super high roof"];
const SIDE_LOADING_DOORS = ["None", "1 side door", "2 side doors", "Twin side doors"];
const REAR_DOOR_TYPES = ["Barn doors", "Tailgate", "Tail-lift", "None"];

const BOOL_EXTRAS = [
  { key: "towBar" as const, label: "Tow bar" },
  { key: "roofRack" as const, label: "Roof rack" },
  { key: "internalRacking" as const, label: "Internal racking / ply-lining" },
  { key: "bodykit" as const, label: "Bodykit" },
];

const EMPTY_FORM: VanForm = {
  make: "", model: "", derivative: "", year: "2022", fuel: "Diesel", colour: "",
  condition: "used", mileage: "",
  conversionType: "Panel van", wheelbase: "LWB", roofHeight: "High roof",
  sideLoadingDoors: "None", rearDoors: "Barn doors",
  payload: "", loadLength: "", seats: "2",
  towBar: false, roofRack: false, internalRacking: false, bodykit: false,
  price: "", description: "",
};

// ── Style helpers ──────────────────────────────────────────────────────────────
const LBL = "block text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink-500 mb-1.5";
const INPUT = "h-11 w-full rounded-[var(--radius-md)] border border-border bg-white px-3 text-[var(--text-base)] outline-none focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/20";
const SELECT = `${INPUT} cursor-pointer`;

function toggleCls(on: boolean) {
  return `flex-1 rounded-[var(--radius-md)] border px-3 py-2.5 text-[var(--text-sm)] font-semibold text-center transition-colors cursor-pointer ${on ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border bg-white text-ink-600 hover:border-ink-300"}`;
}

function checkboxBtnCls(on: boolean) {
  return `flex items-center gap-2 rounded-[var(--radius-md)] border px-4 py-3 text-[var(--text-sm)] font-semibold cursor-pointer transition-colors ${on ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border bg-white text-ink-700 hover:border-ink-300"}`;
}

function pillCls(on: boolean) {
  return `rounded-[var(--radius-md)] border px-3 py-2.5 text-[var(--text-xs)] font-semibold transition-colors ${on ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border bg-white text-ink-600 hover:border-ink-300"}`;
}

// ── Step indicator ─────────────────────────────────────────────────────────────
const STEP_LABELS = ["Find vehicle", "Enter details", "Publish"];

function StepBar({ step }: { step: Step }) {
  const activeIdx = step === "details" || step === "success" ? 2
    : step === "lookup-result" || step === "manual-pick" ? 1 : 0;
  const doneCount = step === "success" ? 3 : activeIdx;

  return (
    <div className="mb-8 flex items-start">
      {STEP_LABELS.map((label, i) => (
        <div key={label} className="flex flex-1 items-start">
          <div className="flex flex-col items-center">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-xs)] font-bold ${i < doneCount ? "bg-success-600 text-white" : i === activeIdx ? "bg-brand-500 text-white" : "bg-surface-2 text-ink-400"}`}>
              {i < doneCount ? "✓" : i + 1}
            </div>
            <span className={`mt-1 text-[var(--text-2xs)] font-semibold whitespace-nowrap ${i === activeIdx ? "text-ink-900" : "text-ink-400"}`}>
              {label}
            </span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div className={`mx-2 mt-3.5 h-px flex-1 ${i < doneCount ? "bg-success-400" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Lookup helper ──────────────────────────────────────────────────────────────
function stubLookup(reg: string): StubVehicle {
  const code = reg.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return STUB_RESULTS[code % STUB_RESULTS.length];
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AddVanPage() {
  const { isDealer, isSwissVans, isAdmin, isLoggedIn } = useRole();
  const router = useRouter();

  const [step, setStep] = useState<Step>("entry");
  const [reg, setReg] = useState("");
  const [mileage, setMileage] = useState("");
  const [stubResult, setStubResult] = useState<StubVehicle | null>(null);
  const [form, setForm] = useState<VanForm>(EMPTY_FORM);
  const [photoNames, setPhotoNames] = useState<string[]>([]);
  const [photoCount, setPhotoCount] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) router.replace("/dealer-portal/login");
    else if (!isDealer && !isSwissVans && !isAdmin) router.replace("/");
  }, [isLoggedIn, isDealer, isSwissVans, isAdmin, router]);

  if (!isLoggedIn || (!isDealer && !isSwissVans && !isAdmin)) return null;

  function setField<K extends keyof VanForm>(key: K, value: VanForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleRegSearch() {
    if (!reg.trim()) return;
    const result = stubLookup(reg.trim().toUpperCase());
    setStubResult(result);
    setForm({
      ...EMPTY_FORM,
      make: result.make,
      model: result.model,
      derivative: result.derivative,
      year: String(result.year),
      fuel: result.fuel,
      colour: result.colour,
      condition: "used",
      mileage,
    });
    setStep("lookup-result");
  }

  function handleNoReg(type: "used" | "new" | "unregistered") {
    setForm({ ...EMPTY_FORM, condition: type === "new" ? "new" : "used" });
    setStep("manual-pick");
  }

  async function handlePublish() {
    setPublishing(true);
    setPublishError(null);
    try {
      const res = await fetch("/api/portal/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          make: form.make,
          model: form.model,
          derivative: form.derivative,
          year: form.year,
          fuel: form.fuel,
          colour: form.colour,
          mileage: form.mileage,
          price: form.price,
          conversionType: form.conversionType,
          wheelbase: form.wheelbase,
          payload: form.payload,
          seats: form.seats,
          description: form.description,
          towBar: form.towBar,
          roofRack: form.roofRack,
          internalRacking: form.internalRacking,
          bodykit: form.bodykit,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Failed to create listing");
      }
      setStep("success");
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPublishing(false);
    }
  }

  function resetFlow() {
    setStep("entry");
    setReg("");
    setMileage("");
    setStubResult(null);
    setForm(EMPTY_FORM);
    setPhotoNames([]);
    setPhotoCount(0);
  }

  // ── STEP: entry ──────────────────────────────────────────────────────────────
  if (step === "entry") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <StepBar step={step} />
        <div className="rounded-[var(--radius-xl)] border border-border bg-white px-6 py-6 shadow-[var(--shadow-sm)]">
          <h1 className="font-display text-[var(--text-2xl)] font-extrabold text-ink-900">Add a van</h1>
          <p className="mt-1 text-[var(--text-sm)] text-ink-500">Enter the registration to auto-fill vehicle details.</p>

          <div className="mt-6 space-y-4">
            <div>
              <label className={LBL}>Registration plate</label>
              <input
                value={reg}
                onChange={(e) => setReg(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleRegSearch()}
                placeholder="e.g. AB12 CDE"
                maxLength={8}
                className={`${INPUT} font-mono text-[var(--text-lg)] uppercase tracking-widest`}
              />
            </div>

            <div>
              <label className={LBL}>
                Mileage
                <span className="ml-2 normal-case font-normal text-ink-400 tracking-normal">
                  not required for vehicles in stock
                </span>
              </label>
              <input
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="e.g. 28000"
                className={INPUT}
              />
            </div>

            <button
              onClick={handleRegSearch}
              disabled={!reg.trim()}
              className="w-full rounded-[var(--radius-md)] bg-brand-500 py-3 text-[var(--text-base)] font-bold text-white hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Search for vehicle
            </button>
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <p className="mb-3 text-[var(--text-xs)] font-semibold text-ink-500">No registration?</p>
            <div className="flex flex-wrap gap-2">
              {(["Used van", "Brand new van", "Unregistered / move"] as const).map((label, i) => (
                <button
                  key={label}
                  onClick={() => handleNoReg(i === 1 ? "new" : i === 2 ? "unregistered" : "used")}
                  className="rounded-[var(--radius-md)] border border-border px-4 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-brand-400 hover:text-brand-700"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP: lookup-result ──────────────────────────────────────────────────────
  if (step === "lookup-result" && stubResult) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <StepBar step={step} />

        <div className="mb-5 rounded-[var(--radius-xl)] border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-[var(--text-xs)] font-bold uppercase tracking-widest text-amber-700">Stubbed lookup — demo only</p>
          <p className="mt-1 text-[var(--text-sm)] text-amber-800">
            Vehicle data is from a mock stub, pending live VRM lookup API integration (Cardata UK / DVLA).{" "}
            Registration <span className="font-mono font-bold">{reg}</span> resolved to a plausible result.
          </p>
        </div>

        <div className="rounded-[var(--radius-xl)] border border-border bg-white px-6 py-6 shadow-[var(--shadow-sm)]">
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-success-tint text-success-600 text-[var(--text-sm)] font-bold">✓</span>
            <h2 className="font-display text-[var(--text-xl)] font-bold text-ink-900">Vehicle found</h2>
          </div>
          <p className="mb-5 text-[var(--text-sm)] text-ink-500">Confirm this is the correct vehicle before continuing.</p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              ["Make", stubResult.make],
              ["Model", stubResult.model],
              ["Derivative", stubResult.derivative],
              ["Year", String(stubResult.year)],
              ["Fuel", stubResult.fuel],
              ["Colour", stubResult.colour],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[var(--radius-lg)] bg-surface-0 px-4 py-3">
                <p className="text-[var(--text-2xs)] font-semibold uppercase tracking-wider text-ink-400">{label}</p>
                <p className="mt-0.5 font-semibold text-ink-800">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setStep("details")}
              className="flex-1 rounded-[var(--radius-md)] bg-brand-500 py-2.5 text-[var(--text-sm)] font-bold text-white hover:bg-brand-600"
            >
              This is my van — continue →
            </button>
            <button
              onClick={() => { setStubResult(null); setStep("manual-pick"); }}
              className="rounded-[var(--radius-md)] border border-border px-4 py-2.5 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400"
            >
              Not my van
            </button>
          </div>
        </div>

        <button onClick={() => setStep("entry")} className="mt-4 text-[var(--text-sm)] text-brand-600 hover:underline">
          ← Back
        </button>
      </div>
    );
  }

  // ── STEP: manual-pick ────────────────────────────────────────────────────────
  if (step === "manual-pick") {
    const models = MODELS_BY_MAKE[form.make] ?? [];
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <StepBar step={step} />

        <div className="rounded-[var(--radius-xl)] border border-border bg-white px-6 py-6 shadow-[var(--shadow-sm)]">
          <h1 className="font-display text-[var(--text-2xl)] font-extrabold text-ink-900">Vehicle details</h1>
          <p className="mt-1 mb-6 text-[var(--text-sm)] text-ink-500">Enter the make, model and key details.</p>

          <div className="space-y-5">
            <div>
              <label className={LBL}>Condition</label>
              <div className="flex gap-2">
                {(["used", "new"] as const).map((c) => (
                  <button key={c} onClick={() => setField("condition", c)} className={toggleCls(form.condition === c)}>
                    {c === "used" ? "Used" : "Brand new"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={LBL}>Make</label>
              <select
                value={form.make}
                onChange={(e) => { setField("make", e.target.value); setField("model", ""); }}
                className={SELECT}
              >
                <option value="">Select make…</option>
                {MAKES.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className={LBL}>Model</label>
              {models.length > 0 ? (
                <select value={form.model} onChange={(e) => setField("model", e.target.value)} className={SELECT}>
                  <option value="">Select model…</option>
                  {models.map((m) => <option key={m}>{m}</option>)}
                </select>
              ) : (
                <input
                  value={form.model}
                  onChange={(e) => setField("model", e.target.value)}
                  placeholder="e.g. Transit Custom"
                  className={INPUT}
                />
              )}
            </div>

            <div>
              <label className={LBL}>Derivative / variant</label>
              <input
                value={form.derivative}
                onChange={(e) => setField("derivative", e.target.value)}
                placeholder="e.g. 2.0 TDCi 130ps L1 H1 Limited"
                className={INPUT}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LBL}>Year</label>
                <select value={form.year} onChange={(e) => setField("year", e.target.value)} className={SELECT}>
                  {YEARS.map((y) => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className={LBL}>Fuel type</label>
                <select value={form.fuel} onChange={(e) => setField("fuel", e.target.value)} className={SELECT}>
                  <option value="">Select…</option>
                  {FUEL_TYPES.map((f) => <option key={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={LBL}>Colour</label>
              <input
                list="colours-manual"
                value={form.colour}
                onChange={(e) => setField("colour", e.target.value)}
                placeholder="e.g. Frozen White"
                className={INPUT}
              />
              <datalist id="colours-manual">
                {COLOURS.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>

            <button
              onClick={() => setStep("details")}
              disabled={!form.make || !form.model}
              className="w-full rounded-[var(--radius-md)] bg-brand-500 py-3 text-[var(--text-base)] font-bold text-white hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue to details →
            </button>
          </div>
        </div>

        <button onClick={() => setStep("entry")} className="mt-4 text-[var(--text-sm)] text-brand-600 hover:underline">
          ← Back
        </button>
      </div>
    );
  }

  // ── STEP: details ────────────────────────────────────────────────────────────
  if (step === "details") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <StepBar step={step} />

        <div className="space-y-5">
          {/* Vehicle details card */}
          <div className="rounded-[var(--radius-xl)] border border-border bg-white px-6 py-6 shadow-[var(--shadow-sm)]">
            <h2 className="mb-5 font-display text-[var(--text-lg)] font-bold text-ink-900">Vehicle details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LBL}>Make</label>
                  <input value={form.make} onChange={(e) => setField("make", e.target.value)} className={INPUT} />
                </div>
                <div>
                  <label className={LBL}>Model</label>
                  <input value={form.model} onChange={(e) => setField("model", e.target.value)} className={INPUT} />
                </div>
              </div>

              <div>
                <label className={LBL}>Derivative / variant</label>
                <input
                  value={form.derivative}
                  onChange={(e) => setField("derivative", e.target.value)}
                  placeholder="e.g. 2.0 TDCi 130ps L1 H1 Limited"
                  className={INPUT}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={LBL}>Year</label>
                  <select value={form.year} onChange={(e) => setField("year", e.target.value)} className={SELECT}>
                    {YEARS.map((y) => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className={LBL}>Fuel</label>
                  <select value={form.fuel} onChange={(e) => setField("fuel", e.target.value)} className={SELECT}>
                    {FUEL_TYPES.map((f) => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className={LBL}>Colour</label>
                  <input
                    list="colours-detail"
                    value={form.colour}
                    onChange={(e) => setField("colour", e.target.value)}
                    className={INPUT}
                  />
                  <datalist id="colours-detail">
                    {COLOURS.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LBL}>Condition</label>
                  <div className="flex h-11 gap-2">
                    {(["used", "new"] as const).map((c) => (
                      <button key={c} onClick={() => setField("condition", c)} className={toggleCls(form.condition === c)}>
                        {c === "used" ? "Used" : "New"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={LBL}>Mileage</label>
                  <input
                    type="number"
                    value={form.mileage}
                    onChange={(e) => setField("mileage", e.target.value)}
                    placeholder="e.g. 28000"
                    className={INPUT}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Van specification card */}
          <div className="rounded-[var(--radius-xl)] border border-border bg-white px-6 py-6 shadow-[var(--shadow-sm)]">
            <h2 className="mb-1 font-display text-[var(--text-lg)] font-bold text-ink-900">Van specification</h2>
            <p className="mb-5 text-[var(--text-xs)] text-ink-400">
              Van-specific fields not found on most classifieds — fill in as much as possible to attract the right buyers.
            </p>

            <div className="space-y-5">
              <div>
                <label className={LBL}>Conversion type</label>
                <select value={form.conversionType} onChange={(e) => setField("conversionType", e.target.value)} className={SELECT}>
                  {CONVERSION_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LBL}>Wheelbase</label>
                  <div className="flex gap-1.5">
                    {WHEELBASES.map((w) => (
                      <button key={w} onClick={() => setField("wheelbase", w)} className={pillCls(form.wheelbase === w)}>
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={LBL}>Roof height</label>
                  <select value={form.roofHeight} onChange={(e) => setField("roofHeight", e.target.value)} className={SELECT}>
                    {ROOF_HEIGHTS.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={LBL}>Side loading doors</label>
                <div className="flex gap-2">
                  {SIDE_LOADING_DOORS.map((d) => (
                    <button key={d} onClick={() => setField("sideLoadingDoors", d)}
                      className={`flex-1 rounded-[var(--radius-md)] border px-2 py-2.5 text-[var(--text-xs)] font-semibold text-center transition-colors ${form.sideLoadingDoors === d ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border bg-white text-ink-600 hover:border-ink-300"}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={LBL}>Rear doors</label>
                <div className="flex gap-2">
                  {REAR_DOOR_TYPES.map((d) => (
                    <button key={d} onClick={() => setField("rearDoors", d)}
                      className={`flex-1 rounded-[var(--radius-md)] border px-2 py-2.5 text-[var(--text-xs)] font-semibold text-center transition-colors ${form.rearDoors === d ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border bg-white text-ink-600 hover:border-ink-300"}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LBL}>Payload (kg)</label>
                  <input
                    type="number"
                    value={form.payload}
                    onChange={(e) => setField("payload", e.target.value)}
                    placeholder="e.g. 1200"
                    className={INPUT}
                  />
                </div>
                <div>
                  <label className={LBL}>Load length (mm)</label>
                  <input
                    type="number"
                    value={form.loadLength}
                    onChange={(e) => setField("loadLength", e.target.value)}
                    placeholder="e.g. 2800"
                    className={INPUT}
                  />
                </div>
              </div>

              <div>
                <label className={LBL}>Seats</label>
                <div className="flex flex-wrap gap-2">
                  {["2", "3", "4", "5", "6", "7", "8", "9+"].map((s) => (
                    <button key={s} onClick={() => setField("seats", s)} className={pillCls(form.seats === s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={LBL}>Extras</label>
                <div className="grid grid-cols-2 gap-2">
                  {BOOL_EXTRAS.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setForm((f) => ({ ...f, [key]: !f[key] }))}
                      className={checkboxBtnCls(form[key])}
                    >
                      <span className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border text-[var(--text-2xs)] ${form[key] ? "border-brand-500 bg-brand-500 text-white" : "border-border"}`}>
                        {form[key] ? "✓" : ""}
                      </span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Listing details card */}
          <div className="rounded-[var(--radius-xl)] border border-border bg-white px-6 py-6 shadow-[var(--shadow-sm)]">
            <h2 className="mb-5 font-display text-[var(--text-lg)] font-bold text-ink-900">Listing details</h2>
            <div className="space-y-4">
              <div>
                <label className={LBL}>Asking price (£)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setField("price", e.target.value)}
                  placeholder="e.g. 24995"
                  className={INPUT}
                />
              </div>

              <div>
                <label className={LBL}>Photos</label>
                <label className="flex cursor-pointer flex-col items-center rounded-[var(--radius-xl)] border-2 border-dashed border-border bg-surface-0 px-6 py-8 text-center hover:border-brand-400 hover:bg-brand-50/30 transition-colors">
                  <span className="text-[var(--text-2xl)]">📸</span>
                  <span className="mt-2 text-[var(--text-sm)] font-semibold text-ink-700">Upload photos</span>
                  <span className="mt-1 text-[var(--text-xs)] text-ink-400">Click to select multiple images — JPG, PNG, WEBP</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? []);
                      setPhotoNames(files.map((f) => f.name));
                      setPhotoCount(files.length);
                    }}
                  />
                </label>
                {photoNames.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {photoNames.map((name, i) => (
                      <li key={i} className="flex items-center gap-2 text-[var(--text-xs)] text-ink-600">
                        <span className="text-success-600 font-bold">✓</span> {name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className={LBL}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Describe the van's condition, service history, any modifications or damage…"
                  rows={5}
                  className="w-full rounded-[var(--radius-md)] border border-border bg-white px-3 py-2.5 text-[var(--text-base)] outline-none focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/20 resize-y"
                />
              </div>
            </div>
          </div>

          {publishError && (
            <div className="rounded-[var(--radius-md)] border border-danger-500/20 bg-danger-tint px-4 py-3 text-[var(--text-sm)] text-danger-700">
              {publishError}
            </div>
          )}
          <div className="flex gap-3 pb-4">
            <button
              onClick={() => setStep(stubResult ? "lookup-result" : "manual-pick")}
              className="rounded-[var(--radius-md)] border border-border px-6 py-3 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400"
            >
              ← Back
            </button>
            <button
              onClick={handlePublish}
              disabled={!form.make || !form.model || !form.price || publishing}
              className="flex-1 rounded-[var(--radius-md)] bg-brand-500 py-3 text-[var(--text-base)] font-bold text-white hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {publishing ? "Publishing…" : "Publish listing"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP: success ────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <StepBar step="success" />
      <div className="rounded-[var(--radius-xl)] border border-border bg-white px-8 py-10 shadow-[var(--shadow-sm)] text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-tint text-[var(--text-2xl)] font-bold text-success-600">
          ✓
        </div>
        <h1 className="font-display text-[var(--text-2xl)] font-extrabold text-ink-900">Van listed!</h1>
        <p className="mt-2 text-[var(--text-base)] text-ink-500">
          <span className="font-semibold text-ink-900">
            {form.year} {form.make} {form.model}
          </span>{" "}
          has been added to your live listings.
        </p>
        {photoCount > 0 && (
          <p className="mt-1 text-[var(--text-sm)] text-ink-400">
            {photoCount} photo{photoCount !== 1 ? "s" : ""} uploaded
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dealer-portal/listings"
            className="rounded-[var(--radius-md)] bg-brand-500 px-6 py-3 text-[var(--text-sm)] font-bold text-white hover:bg-brand-600"
          >
            View your listings →
          </Link>
          <button
            onClick={resetFlow}
            className="rounded-[var(--radius-md)] border border-border px-6 py-3 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400"
          >
            Add another van
          </button>
        </div>
      </div>
    </div>
  );
}
