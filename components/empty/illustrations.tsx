import type { SVGProps } from "react";

/* Friendly line-art for empty states. Same style as components/icons/body-types.tsx:
   2px round-capped stroke in currentColor, no fill, original artwork. */

function Art({ children, className = "", ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 96 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`line-art ${className}`}
      {...rest}
    >
      {children}
    </svg>
  );
}

type P = Omit<SVGProps<SVGSVGElement>, "children">;

/** A van with a question mark: no vans found. */
export function NoVansIllustration(p: P) {
  return (
    <Art {...p}>
      <g transform="translate(4 14) scale(1.3)">
        <path d="M7 25H3V7h26.5L40 17.5h3.5c1 0 1.5.6 1.5 1.5v6h-4" />
        <path d="M15 25h18" />
        <path d="M31 10.5l6 7h-6z" />
        <circle cx="11" cy="25" r="4" />
        <circle cx="37" cy="25" r="4" />
      </g>
      <path d="M58 14c0-4.4 3.4-7 7.5-7s7.5 2.6 7.5 6.5c0 5.5-7.5 5.5-7.5 11" />
      <circle cx="65.5" cy="31.5" r="0.6" />
    </Art>
  );
}

/** An empty inbox tray. */
export function EmptyInboxIllustration(p: P) {
  return (
    <Art {...p}>
      <path d="M22 36L31 16h34l9 20" />
      <path d="M22 36v16c0 1.1.9 2 2 2h48c1.1 0 2-.9 2-2V36H60l-4 7H40l-4-7z" />
      <path d="M42 26h12" />
    </Art>
  );
}

/** A map pin: no dealers in this area. */
export function MapPinIllustration(p: P) {
  return (
    <Art {...p}>
      <path d="M48 52S31 38 31 26a17 17 0 0134 0c0 12-17 26-17 26z" />
      <circle cx="48" cy="26" r="6.5" />
      <path d="M30 58h36" strokeDasharray="1 6" />
    </Art>
  );
}

/** An empty list next to a clock: no import history. */
export function EmptyHistoryIllustration(p: P) {
  return (
    <Art {...p}>
      <path d="M16 10h38a2 2 0 012 2v40a2 2 0 01-2 2H16a2 2 0 01-2-2V12a2 2 0 012-2z" />
      <path d="M22 22h24M22 32h16M22 42h10" />
      <circle cx="66" cy="42" r="15" />
      <path d="M66 33v9l6 4" />
    </Art>
  );
}

export const ILLUSTRATIONS = {
  "no-vans": NoVansIllustration,
  inbox: EmptyInboxIllustration,
  pin: MapPinIllustration,
  history: EmptyHistoryIllustration,
} as const;

export type IllustrationName = keyof typeof ILLUSTRATIONS;
