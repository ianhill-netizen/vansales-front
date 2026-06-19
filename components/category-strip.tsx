import Link from "next/link";
import { IconRuler, IconWeight, IconRoof, IconDoor, IconBolt, IconArrow } from "./icons";
import type { ReactNode } from "react";

const CATEGORIES: { label: string; note: string; href: string; icon: ReactNode }[] = [
  { label: "Panel vans", note: "The everyday workhorse", href: "/vans/volkswagen/transporter", icon: <IconRuler /> },
  { label: "Luton & box", note: "Maximum cube", href: "/vans/renault/master", icon: <IconRoof /> },
  { label: "Dropsides & tippers", note: "Open-bed graft", href: "/#browse", icon: <IconWeight /> },
  { label: "Crew cabs", note: "Carry the whole team", href: "/vans/volkswagen/transporter", icon: <IconDoor /> },
  { label: "Pickups", note: "On-site, off-road", href: "/vans/ford/ranger", icon: <IconArrow /> },
  { label: "Electric vans", note: "Zero-emission rounds", href: "/#browse", icon: <IconBolt /> },
];

export function CategoryStrip() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {CATEGORIES.map((c) => (
        <Link
          key={c.label}
          href={c.href}
          className="group flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border bg-card p-4 transition-[border-color,box-shadow,transform] duration-[var(--dur-base)] hover:-translate-y-0.5 hover:border-brand-700 hover:shadow-[var(--shadow-md)]"
        >
          <span className="grid size-10 place-items-center rounded-[var(--radius-md)] bg-brand-tint text-brand-700 transition-colors group-hover:bg-brand-tint group-hover:text-brand-600">
            {c.icon}
          </span>
          <span>
            <span className="block font-display text-[var(--text-base)] font-bold text-ink-900">{c.label}</span>
            <span className="block text-[var(--text-sm)] text-ink-500">{c.note}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
