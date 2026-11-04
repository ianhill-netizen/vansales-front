import type { SVGProps } from "react";

/* =============================================================================
   BODY-TYPE ICONS — hand-drawn side-profile silhouettes, all facing right.
   viewBox 48x32, no fill, 2px round-capped stroke in currentColor (the
   `.line-art` class in globals.css makes the stroke non-scaling, so it is 2px
   at 24px wide and at 96px wide). Original artwork, no third-party assets.
   ============================================================================= */

type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & { title?: string };

function Svg({ title, className = "", strokeWidth = 2, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 48 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`line-art ${className}`}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Two wheels, at x=11 and x=37 by default. */
function Wheels({ a = 11, b = 37 }: { a?: number; b?: number }) {
  return (
    <>
      <circle cx={a} cy={25} r={4} />
      <circle cx={b} cy={25} r={4} />
    </>
  );
}

export function PanelVanIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M7 25H3V7h26.5L40 17.5h3.5c1 0 1.5.6 1.5 1.5v6h-4" />
      <path d="M15 25h18" />
      <path d="M31 10.5l6 7h-6z" />
      <path d="M26 7v18" />
      <Wheels />
    </Svg>
  );
}

export function CrewCabIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M7 25H3V8h17l5.5-2H32l8 11.5h3.5c1 0 1.5.6 1.5 1.5v6h-4" />
      <path d="M15 25h18" />
      <path d="M20 8v17" />
      <path d="M22.5 9.5h6v6.5h-6z" />
      <path d="M31 9.5l5.5 6.5H31z" />
      <path d="M29.5 9v16" />
      <Wheels />
    </Svg>
  );
}

export function LutonIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M7 25H3V3h30v22" />
      <path d="M33 11.5h5.5l6.5 7V25h-4" />
      <path d="M15 25h18" />
      <path d="M34.5 13.5h3.2l3.8 5h-7z" />
      <Wheels b={36.5} />
    </Svg>
  );
}

export function TipperIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 22L28 15 26 6 3 12z" />
      <path d="M10 20l5 -2.5" />
      <path d="M31 22V14h6l6 5v6h-2" />
      <path d="M33.5 15.8h3l3 3h-6z" />
      <path d="M3 22v3h4M15 25h16" />
      <Wheels b={37} />
    </Svg>
  );
}

export function DropsideIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 18h28" />
      <path d="M3 13.5h28" />
      <path d="M3 13.5V18M11 13.5V18M19 13.5V18M27 13.5V18" />
      <path d="M31 5v13" />
      <path d="M31 8h6l6 7.5h2c.6 0 1 .5 1 1V25h-4" />
      <path d="M33.5 10.5h2.8l3.2 5h-6z" />
      <path d="M3 18v7h4M15 25h18" />
      <Wheels />
    </Svg>
  );
}

export function PickupIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 14.5h17" />
      <path d="M3 14.5V25h4" />
      <path d="M20 14.5V8.5h11.5l7 8h5c.6 0 1.5.6 1.5 1.5v7h-4" />
      <path d="M15 25h18" />
      <path d="M22.5 10.5h5v5h-5z" />
      <path d="M29.5 10.5H31l4 5h-5.5z" />
      <path d="M3 14.5h3M9 14.5h11" />
      <Wheels />
    </Svg>
  );
}

export function MinibusIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M7 25H3V8c0-1.1.9-2 2-2h31.5c1 0 1.8.5 2.4 1.3L44 15v8c0 1-.5 2-1.5 2H41" />
      <path d="M15 25h18" />
      <path d="M6 9.5h5v6H6zM13 9.5h5v6h-5zM20 9.5h5v6h-5zM27 9.5h5v6h-5z" />
      <path d="M34.5 9.5l5.5 6h-5.5z" />
      <path d="M3 19h41" />
      <Wheels />
    </Svg>
  );
}

export function CampervanIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M7 25H3V10h26.5L40 20.5h3.5c1 0 1.5.6 1.5 1.5v3h-4" />
      <path d="M15 25h18" />
      <path d="M8 10l3-6.5h15L29 10" />
      <path d="M12 14h8v4h-8z" />
      <path d="M31 13l5 7.5h-5z" />
      <path d="M22.5 10v15" />
      <path d="M3 19l5-1.5" />
      <path d="M3 22.5l5-1.5" />
      <Wheels />
    </Svg>
  );
}

export function ChassisCabIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 20.5h28M3 24h28" />
      <path d="M8 20.5V24M17 20.5V24M26 20.5V24" />
      <path d="M31 7h7l6 8.5h1c.6 0 1 .5 1 1V25h-4" />
      <path d="M33.5 9.5h3l3.2 6h-6.2z" />
      <path d="M31 7v18" />
      <Wheels />
    </Svg>
  );
}

const MAP: Record<string, (p: IconProps) => React.ReactElement> = {
  "panel-van": PanelVanIcon,
  "crew-cab": CrewCabIcon,
  "crew-van": CrewCabIcon,
  luton: LutonIcon,
  tipper: TipperIcon,
  dropside: DropsideIcon,
  pickup: PickupIcon,
  minibus: MinibusIcon,
  campervan: CampervanIcon,
  "chassis-cab": ChassisCabIcon,
};

/** Normalises "Panel Van" / "panel_van" / "Crew Cab" to a slug. */
export function bodySlug(input: string | null | undefined): string {
  return (input ?? "").normalize("NFD").replace(/\p{Mn}/gu, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/** The icon for a body-type slug; an unknown slug gets the generic panel van. */
export function BodyTypeIcon({ slug, className, title, strokeWidth }: { slug: string; className?: string; title?: string; strokeWidth?: number }) {
  const Icon = MAP[bodySlug(slug)] ?? PanelVanIcon;
  return <Icon className={className} title={title} strokeWidth={strokeWidth} />;
}
