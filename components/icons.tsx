import type { SVGProps } from "react";

/* Compact, consistent 24px line icons drawn from the van's instrument world. */
const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconGauge(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M12 13l4-3" />
      <path d="M4.5 17a8 8 0 1115 0" />
      <circle cx="12" cy="13" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
export function IconFuel(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M5 21V6a2 2 0 012-2h6a2 2 0 012 2v15" />
      <path d="M4 21h12" />
      <path d="M15 9h2.5a1.5 1.5 0 011.5 1.5V16a1.5 1.5 0 003 0V9l-2.5-3" />
      <path d="M7 8h6" />
    </svg>
  );
}
export function IconGearbox(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M7 5v14M12 5v14M17 5v9" />
      <path d="M7 9h10" />
      <circle cx="7" cy="5" r="1.4" />
      <circle cx="12" cy="5" r="1.4" />
      <circle cx="17" cy="5" r="1.4" />
      <circle cx="7" cy="19" r="1.4" />
      <circle cx="12" cy="19" r="1.4" />
    </svg>
  );
}
export function IconRuler(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <rect x="3" y="8" width="18" height="8" rx="1.5" />
      <path d="M7 8v3M11 8v4M15 8v3M19 8v4" />
    </svg>
  );
}
export function IconWeight(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M9 7a3 3 0 116 0" />
      <path d="M6.5 7h11l1.7 12a1.5 1.5 0 01-1.5 1.7H6.3a1.5 1.5 0 01-1.5-1.7z" />
    </svg>
  );
}
export function IconCalendar(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M4 9h16M8 3v4M16 3v4" />
    </svg>
  );
}
export function IconPin(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
export function IconDoor(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M6 21V4a1 1 0 011-1h7l4 3v15" />
      <path d="M4 21h16" />
      <circle cx="14.5" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
export function IconRoof(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M3 13l9-7 9 7" />
      <path d="M5 12v8h14v-8" />
    </svg>
  );
}
export function IconBolt(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M13 3L4 14h6l-1 7 9-11h-6z" />
    </svg>
  );
}
export function IconSearch(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4-4" />
    </svg>
  );
}
export function IconArrow(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
export function IconCheck(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}
export function IconStar(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p} fill="currentColor" stroke="none">
      <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17.9 6.8 19.6l1-5.8L3.5 9.7l5.9-.9z" />
    </svg>
  );
}
export function IconShield(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
export function IconUser(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}
export function IconHeart(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 000-7.6z" />
    </svg>
  );
}
export function IconChevron(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p} strokeWidth={2}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
export function IconList(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <rect x="3" y="4" width="4" height="4" rx="1" fill="currentColor" stroke="none" />
      <rect x="3" y="10" width="4" height="4" rx="1" fill="currentColor" stroke="none" />
      <rect x="3" y="16" width="4" height="4" rx="1" fill="currentColor" stroke="none" />
      <path d="M10 6h11M10 12h11M10 18h11" />
    </svg>
  );
}
export function IconPhone(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M5 4h4l2 4.5-2.5 1.5a11 11 0 005.5 5.5L15.5 13 20 15v4a2 2 0 01-2 2C9 20 4 11 4 6a2 2 0 011-1.7z" />
    </svg>
  );
}
export function IconMessage(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}
export function IconWhatsApp(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p} strokeWidth={1.5}>
      <path d="M3 21l1.65-5A9 9 0 1112 21a8.96 8.96 0 01-5-.95z" />
      <path d="M9 10c.39.9.84 1.73 1.5 2.5s1.6 1.1 2.5 1.5c.2.09.47.04.62-.12l.6-.7c.15-.17.4-.22.6-.12l2.2 1c.2.1.28.35.2.55-.4.9-.9 1.39-1.72 1.39-1.05 0-2.6-.58-4-1.98S9.5 11.05 9.5 10c0-.82.5-1.32 1.39-1.72.2-.08.44 0 .55.2l1 2.2c.1.2.05.45-.12.6l-.7.6c-.16.15-.21.42-.12.62z" />
    </svg>
  );
}
export function IconClock(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}
export function IconGlobe(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M2 12h20M12 3a15.3 15.3 0 014 9 15.3 15.3 0 01-4 9 15.3 15.3 0 01-4-9 15.3 15.3 0 014-9z" />
    </svg>
  );
}
export function IconExternalLink(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <path d="M15 3h6v6M10 14L21 3" />
    </svg>
  );
}
