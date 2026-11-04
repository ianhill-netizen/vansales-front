"use client";

import { useId, useRef, useState } from "react";
import { chipLabel, suggestVehicles, type VehicleChip } from "@/lib/vehicle-chips";

/* =============================================================================
   CHIP SEARCH — type a make or model, pick a suggestion, it becomes a removable
   chip in the bar. Several chips (any makes) are OR'd. Used on /vans and the
   home hero. Controlled: the parent owns `value`.
   ============================================================================= */

export function ChipSearch({
  value,
  onChange,
  onEnterEmpty,
  placeholder = "Make or model, e.g. Transit",
  className = "",
  inputClassName = "",
}: {
  value: VehicleChip[];
  onChange: (next: VehicleChip[]) => void;
  /** Enter pressed with nothing typed (the host can use it to submit its form). */
  onEnterEmpty?: () => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const suggestions = suggestVehicles(text, value);
  const showList = open && suggestions.length > 0;

  function add(s: VehicleChip) {
    onChange([...value, { make: s.make, model: s.model }]);
    setText("");
    setActive(0);
    setOpen(false);
    inputRef.current?.focus();
  }
  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
    inputRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, Math.max(suggestions.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      if (showList) {
        e.preventDefault();
        add(suggestions[Math.min(active, suggestions.length - 1)]);
      } else if (!text.trim() && onEnterEmpty) {
        e.preventDefault();
        onEnterEmpty();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Backspace" && text === "" && value.length > 0) {
      remove(value.length - 1);
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className="flex min-h-[3rem] flex-wrap items-center gap-1.5 rounded-[var(--radius-lg)] border border-border bg-white px-2.5 py-1.5 focus-within:border-brand-400 focus-within:shadow-[var(--shadow-focus)]"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((c, i) => (
          <span
            key={`${c.make}:${c.model ?? ""}`}
            className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] bg-brand-600 py-1 pl-3 pr-1.5 text-[var(--text-sm)] font-semibold text-white"
          >
            {chipLabel(c)}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); remove(i); }}
              aria-label={`Remove ${chipLabel(c)}`}
              className="grid size-5 place-items-center rounded-full text-white/80 hover:bg-white/20 hover:text-white"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 2l6 6M8 2L2 8" /></svg>
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList ? `${listId}-${active}` : undefined}
          value={text}
          onChange={(e) => { setText(e.target.value); setOpen(true); setActive(0); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          placeholder={value.length === 0 ? placeholder : "Add another make or model…"}
          autoComplete="off"
          className={`min-w-[10rem] flex-1 bg-transparent px-1.5 py-1.5 text-[var(--text-base)] font-medium text-ink-900 outline-none placeholder:font-normal placeholder:text-ink-400 ${inputClassName}`}
        />
      </div>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1.5 max-h-72 overflow-y-auto rounded-[var(--radius-lg)] border border-border bg-white p-1 shadow-[var(--shadow-lg)]"
        >
          {suggestions.map((s, i) => (
            <li
              key={`${s.make}:${s.model ?? ""}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => { e.preventDefault(); add(s); }}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-center justify-between rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-sm)] ${i === active ? "bg-brand-50 text-brand-700" : "text-ink-700"}`}
            >
              <span className="font-semibold">{s.label}</span>
              <span className="text-[var(--text-2xs)] uppercase tracking-wider text-ink-400">{s.model ? "Model" : "Make"}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
