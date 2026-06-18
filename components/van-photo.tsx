import type { Listing } from "@/lib/listings/types";

/* -----------------------------------------------------------------------------
   VanPhoto — a synthetic, on-brand "studio photo" rendered as SVG.
   Tints to the van's real colour and varies the shot by image index
   (exterior → load bay → cab) so a gallery reads as several photos with no
   remote image hosts. Also the graceful fallback when a real listing has none.
   -------------------------------------------------------------------------- */

const COLOUR_HEX: Record<string, string> = {
  white: "#eef1f4",
  "candy white": "#eef1f4",
  "polar white": "#eef1f4",
  "glacier white": "#edf0f3",
  "frozen white": "#eef1f4",
  "arctic white": "#eef1f4",
  silver: "#c7ced6",
  "reflex silver": "#c4ccd4",
  grey: "#8d97a1",
  "indium grey": "#6f7a85",
  "magnetic grey": "#5d666f",
  "quartz grey": "#7b848d",
  "sea grey": "#737d86",
  black: "#23292f",
  "deep black pearl": "#1d2227",
  beige: "#cbb893",
  "mojave beige": "#c9b88f",
  blue: "#2f5d86",
  red: "#a8322c",
  green: "#2f6b4f",
  orange: "#d2682a",
};

function colourHex(name: string): string {
  const key = name.toLowerCase().trim();
  return COLOUR_HEX[key] ?? guessHex(key) ?? "#aab4bd";
}
function guessHex(key: string): string | null {
  for (const base of Object.keys(COLOUR_HEX)) {
    if (key.includes(base)) return COLOUR_HEX[base];
  }
  return null;
}

function shade(hex: string, amt: number): string {
  const n = hex.replace("#", "");
  if (n.length !== 6) return hex;
  const num = parseInt(n, 16);
  let r = (num >> 16) + amt;
  let g = ((num >> 8) & 0xff) + amt;
  let b = (num & 0xff) + amt;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

type Kind = "exterior" | "loadbay" | "cab";
function kindForIndex(i: number): Kind {
  if (i <= 0) return "exterior";
  if (i === 1) return "exterior";
  if (i === 2) return "loadbay";
  return "cab";
}

export function VanPhoto({
  listing,
  index = 0,
  plate,
  className,
  priority,
}: {
  listing: Pick<Listing, "colour" | "make" | "model" | "plate">;
  index?: number;
  plate?: boolean;
  className?: string;
  priority?: boolean;
}) {
  const body = colourHex(listing.colour);
  const bodyDark = shade(body, -26);
  const bodyLight = shade(body, 22);
  const glass = "#cdd9e2";
  const glassDark = "#9fb0bd";
  const kind = kindForIndex(index);
  const id = `${slug(listing.make)}-${slug(listing.model)}-${index}`;
  void priority;

  return (
    <svg
      viewBox="0 0 800 600"
      role="img"
      aria-label={`${listing.make} ${listing.model}`}
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`floor-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9eef3" />
          <stop offset="0.62" stopColor="#dce4ec" />
          <stop offset="1" stopColor="#c9d3dc" />
        </linearGradient>
        <linearGradient id={`body-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={bodyLight} />
          <stop offset="0.5" stopColor={body} />
          <stop offset="1" stopColor={bodyDark} />
        </linearGradient>
        <radialGradient id={`shadow-${id}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="rgba(13,22,32,0.28)" />
          <stop offset="1" stopColor="rgba(13,22,32,0)" />
        </radialGradient>
      </defs>

      {/* Studio floor + ambient grid */}
      <rect width="800" height="600" fill={`url(#floor-${id})`} />
      <g stroke="rgba(13,22,32,0.05)" strokeWidth="1">
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`v${i}`} x1={i * 100} y1="0" x2={i * 100} y2="600" />
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 100} x2="800" y2={i * 100} />
        ))}
      </g>

      {kind === "exterior" && (
        <>
          <ellipse cx="400" cy="470" rx="300" ry="40" fill={`url(#shadow-${id})`} />
          {/* Side-profile panel van */}
          <g>
            {/* body */}
            <path
              d="M120 250 L150 200 Q160 185 185 184 L470 184 Q500 184 520 208 L640 250 Q672 258 672 300 L672 408 Q672 420 660 420 L150 420 Q120 420 120 392 Z"
              fill={`url(#body-${id})`}
              stroke={bodyDark}
              strokeWidth="2"
            />
            {/* roofline highlight */}
            <path d="M150 200 Q160 185 185 184 L470 184" fill="none" stroke={bodyLight} strokeWidth="3" opacity="0.7" />
            {/* windscreen + cab window */}
            <path d="M508 210 L612 246 Q636 252 636 276 L520 276 Z" fill={glass} stroke={glassDark} strokeWidth="2" />
            <rect x="455" y="208" width="44" height="64" rx="6" fill={glass} stroke={glassDark} strokeWidth="2" />
            {/* body crease */}
            <line x1="150" y1="350" x2="660" y2="350" stroke={bodyDark} strokeWidth="2" opacity="0.5" />
            {/* sliding-door seam */}
            <line x1="330" y1="276" x2="330" y2="412" stroke={bodyDark} strokeWidth="2" opacity="0.45" />
            <rect x="300" y="338" width="34" height="8" rx="4" fill={bodyDark} opacity="0.6" />
            {/* sill */}
            <rect x="150" y="412" width="510" height="10" fill={bodyDark} opacity="0.55" />
            {/* wheels */}
            {[245, 565].map((cx) => (
              <g key={cx}>
                <circle cx={cx} cy="425" r="52" fill="#1a1f24" />
                <circle cx={cx} cy="425" r="51" fill="none" stroke="#0d1620" strokeWidth="2" />
                <circle cx={cx} cy="425" r="26" fill="#aeb8c1" />
                <circle cx={cx} cy="425" r="26" fill="none" stroke="#7d8893" strokeWidth="2" />
                <circle cx={cx} cy="425" r="7" fill="#5c6b78" />
              </g>
            ))}
            {/* headlight */}
            <path d="M636 300 L668 304 Q672 312 668 326 L636 326 Z" fill="#f4d98a" opacity="0.9" />
            {/* number plate */}
            {plate !== false && (
              <g transform="translate(600,372)">
                <rect width="58" height="22" rx="3" fill="var(--color-plate, #f7d117)" stroke="#0d1620" strokeWidth="1.5" />
                <text x="29" y="16" textAnchor="middle" fontFamily="var(--font-mono, monospace)" fontSize="13" fontWeight="700" fill="#14202c" letterSpacing="0.5">
                  {(listing.plate || "NEW").toString().slice(0, 6).toUpperCase()}
                </text>
              </g>
            )}
          </g>
        </>
      )}

      {kind === "loadbay" && (
        <>
          <ellipse cx="400" cy="500" rx="280" ry="34" fill={`url(#shadow-${id})`} />
          {/* open rear doors framing a ribbed load bay */}
          <rect x="180" y="150" width="440" height="320" rx="10" fill={shade(body, -40)} stroke={bodyDark} strokeWidth="3" />
          <rect x="210" y="180" width="380" height="260" rx="6" fill="#cfd8e0" />
          {/* ribbed ply floor + walls */}
          <g stroke="#b3bfc9" strokeWidth="3">
            {Array.from({ length: 7 }, (_, i) => (
              <line key={`rib${i}`} x1={232 + i * 52} y1="190" x2={232 + i * 52} y2="430" />
            ))}
            <line x1="210" y1="372" x2="590" y2="372" strokeWidth="4" />
          </g>
          {/* load lashing rail */}
          <rect x="220" y="206" width="360" height="10" rx="5" fill="#8e99a3" />
          {/* open door panels */}
          <rect x="150" y="150" width="34" height="320" rx="6" fill={`url(#body-${id})`} stroke={bodyDark} strokeWidth="2" />
          <rect x="616" y="150" width="34" height="320" rx="6" fill={`url(#body-${id})`} stroke={bodyDark} strokeWidth="2" />
        </>
      )}

      {kind === "cab" && (
        <>
          {/* dashboard + wheel abstract */}
          <rect x="120" y="320" width="560" height="200" rx="16" fill={shade(body, -34)} />
          <rect x="120" y="300" width="560" height="44" rx="14" fill={shade(body, -18)} />
          {/* infotainment screen */}
          <rect x="360" y="350" width="120" height="78" rx="8" fill="#11202c" stroke="#33424f" strokeWidth="2" />
          <rect x="372" y="364" width="96" height="8" rx="4" fill="var(--color-accent-500, #ff7a1a)" opacity="0.85" />
          <rect x="372" y="382" width="70" height="6" rx="3" fill="#4a5a67" />
          <rect x="372" y="396" width="84" height="6" rx="3" fill="#4a5a67" />
          {/* steering wheel */}
          <g transform="translate(232,430)">
            <circle r="86" fill="none" stroke="#1a2228" strokeWidth="22" />
            <circle r="30" fill="#262f36" />
            <rect x="-78" y="-8" width="156" height="16" rx="8" fill="#262f36" />
            <rect x="-8" y="0" width="16" height="64" rx="8" fill="#262f36" />
          </g>
          {/* vents + dash glow */}
          <rect x="520" y="362" width="120" height="16" rx="8" fill="#3a4853" />
          <circle cx="612" cy="408" r="10" fill="var(--color-brand-500, #1b7f98)" />
        </>
      )}
    </svg>
  );
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
