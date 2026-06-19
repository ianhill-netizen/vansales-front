import type { Listing } from "@/lib/listings/types";

/* -----------------------------------------------------------------------------
   VanPhoto — synthetic, on-brand "studio" illustration rendered as SVG.
   Tinted to the van's real colour from the feed `colour` field.
   Silhouette varies by body_style (panel / crew cab / pickup+dropside / luton).
   Three shot kinds cycle for gallery use: exterior, load bay, cab interior.
   -------------------------------------------------------------------------- */

const COLOUR_HEX: Record<string, string> = {
  // Whites
  "candy white": "#eef1f4",
  "pure white": "#eef1f4",
  "polar white": "#eef1f4",
  "glacier white": "#edf0f3",
  "frozen white": "#eef1f4",
  "arctic white": "#eef1f4",
  "olympic white": "#edf1f5",
  white: "#eef1f4",

  // Silvers
  silver: "#c7ced6",
  "reflex silver": "#c4ccd4",
  "reflex silver metallic": "#c4ccd4",
  "moondust silver": "#bec6ce",
  "moon silver": "#bec6ce",
  "cool silver": "#c0c8d0",

  // Greys
  grey: "#8d97a1",
  "indium grey": "#6f7a85",
  "indium grey metallic": "#6f7a85",
  "magnetic grey": "#5d666f",
  "quartz grey": "#7b848d",
  "sea grey": "#737d86",
  "flint grey": "#78828c",
  "mouse grey": "#7e8890",
  "dark grey": "#55606a",
  "graphite grey": "#4e5960",
  "dark pewter metallic": "#5c6670",

  // Blacks
  black: "#23292f",
  "deep black": "#1d2227",
  "deep black pearl": "#1d2227",
  "deep black pearl effect": "#1d2227",
  "obsidian black": "#1a1f24",
  "midnight black": "#1d2227",

  // Blues
  blue: "#2f5d86",
  "ming blue": "#2a5a82",
  "ming blue metallic": "#2a5a82",
  "ravenna blue": "#2b4f7a",
  "ravenna blue metallic": "#2b4f7a",
  "starlight blue": "#3a5f96",
  "starlight blue metallic": "#3a5f96",
  "ocean blue": "#1e4d7a",
  "dark blue": "#1e3d6b",
  "cobalt blue": "#1e4d80",
  "brilliant blue": "#2b5ea0",
  "gentian blue": "#1b3e7a",
  "steel blue": "#3a5f80",
  "bay leaf green": "#3a6b6b",

  // Reds
  red: "#a8322c",
  "cherry red": "#992022",
  "maroon red": "#7a1e28",
  "chili red": "#b02020",
  "flame red": "#b02828",

  // Greens
  green: "#2f6b4f",
  "bottle green": "#1f5a38",
  "dark green": "#1e4a2e",
  "forest green": "#2a5c3a",

  // Yellows / Oranges
  orange: "#d2682a",
  yellow: "#d4b820",
  "solar gold": "#c8a820",

  // Beiges / Browns
  beige: "#cbb893",
  "mojave beige": "#c9b88f",
  "mojave beige metallic": "#c9b88f",
  brown: "#8a6a4e",
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

type BodyKind = "panel" | "crewcab" | "pickup" | "luton";

function deriveBodyKind(s: string | undefined): BodyKind {
  if (!s) return "panel";
  const l = s.toLowerCase();
  if (l.includes("luton")) return "luton";
  if (l.includes("pickup") || l.includes("dropside") || l.includes("tipper") || l.includes("chassis")) return "pickup";
  if (l.includes("crew") || l.includes("kombi")) return "crewcab";
  return "panel";
}

type Shot = "exterior" | "loadbay" | "cab";
function shotForIndex(i: number): Shot {
  if (i <= 1) return "exterior";
  if (i === 2) return "loadbay";
  return "cab";
}

export function VanPhoto({
  listing,
  index = 0,
  plate,
  bodyStyle,
  className,
  priority,
}: {
  listing: Pick<Listing, "colour" | "make" | "model" | "plate">;
  index?: number;
  plate?: boolean;
  bodyStyle?: string;
  className?: string;
  priority?: boolean;
}) {
  const body = colourHex(listing.colour);
  const bodyDark = shade(body, -28);
  const bodyLight = shade(body, 24);
  const glass = "#cdd9e2";
  const glassDark = "#9fb0bd";
  const shot = shotForIndex(index);
  const bk = deriveBodyKind(bodyStyle);
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

      {/* Studio floor */}
      <rect width="800" height="600" fill={`url(#floor-${id})`} />
      <g stroke="rgba(13,22,32,0.045)" strokeWidth="1">
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`v${i}`} x1={i * 100} y1="0" x2={i * 100} y2="600" />
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 100} x2="800" y2={i * 100} />
        ))}
      </g>

      {shot === "exterior" && (
        <>
          <ellipse cx="400" cy="472" rx="310" ry="42" fill={`url(#shadow-${id})`} />

          {bk === "panel" && <PanelVanExterior id={id} body={body} bodyDark={bodyDark} bodyLight={bodyLight} glass={glass} glassDark={glassDark} listing={listing} plate={plate} />}
          {bk === "crewcab" && <CrewCabExterior id={id} body={body} bodyDark={bodyDark} bodyLight={bodyLight} glass={glass} glassDark={glassDark} listing={listing} plate={plate} />}
          {bk === "pickup" && <PickupExterior id={id} body={body} bodyDark={bodyDark} bodyLight={bodyLight} glass={glass} glassDark={glassDark} listing={listing} plate={plate} />}
          {bk === "luton" && <LutonExterior id={id} body={body} bodyDark={bodyDark} bodyLight={bodyLight} glass={glass} glassDark={glassDark} listing={listing} plate={plate} />}
        </>
      )}

      {shot === "loadbay" && (
        <>
          <ellipse cx="400" cy="502" rx="280" ry="34" fill={`url(#shadow-${id})`} />
          <rect x="180" y="148" width="440" height="322" rx="10" fill={shade(body, -42)} stroke={bodyDark} strokeWidth="3" />
          <rect x="210" y="178" width="380" height="262" rx="6" fill="#cfd8e0" />
          <g stroke="#b3bfc9" strokeWidth="3">
            {Array.from({ length: 7 }, (_, i) => (
              <line key={`rib${i}`} x1={232 + i * 52} y1="188" x2={232 + i * 52} y2="432" />
            ))}
            <line x1="210" y1="374" x2="590" y2="374" strokeWidth="4" />
          </g>
          <rect x="220" y="204" width="360" height="10" rx="5" fill="#8e99a3" />
          <rect x="150" y="148" width="34" height="322" rx="6" fill={`url(#body-${id})`} stroke={bodyDark} strokeWidth="2" />
          <rect x="616" y="148" width="34" height="322" rx="6" fill={`url(#body-${id})`} stroke={bodyDark} strokeWidth="2" />
        </>
      )}

      {shot === "cab" && (
        <>
          <rect x="120" y="318" width="560" height="202" rx="16" fill={shade(body, -36)} />
          <rect x="120" y="298" width="560" height="44" rx="14" fill={shade(body, -20)} />
          <rect x="360" y="348" width="120" height="80" rx="8" fill="#11202c" stroke="#33424f" strokeWidth="2" />
          <rect x="372" y="362" width="96" height="8" rx="4" fill="var(--color-accent-500, #ff7a1a)" opacity="0.85" />
          <rect x="372" y="380" width="70" height="6" rx="3" fill="#4a5a67" />
          <rect x="372" y="396" width="84" height="6" rx="3" fill="#4a5a67" />
          <g transform="translate(232,432)">
            <circle r="86" fill="none" stroke="#1a2228" strokeWidth="22" />
            <circle r="30" fill="#262f36" />
            <rect x="-78" y="-8" width="156" height="16" rx="8" fill="#262f36" />
            <rect x="-8" y="0" width="16" height="64" rx="8" fill="#262f36" />
          </g>
          <rect x="520" y="360" width="120" height="16" rx="8" fill="#3a4853" />
          <circle cx="612" cy="406" r="10" fill="var(--color-brand-500, #1b7f98)" />
        </>
      )}
    </svg>
  );
}

/* --------------------------------------------------------------------------
   Panel Van exterior (side profile)
   -------------------------------------------------------------------------- */
function PanelVanExterior({ id, body, bodyDark, bodyLight, glass, glassDark, listing, plate }: ExteriorProps) {
  void body;
  return (
    <g>
      <path
        d="M120 250 L150 200 Q160 185 185 184 L470 184 Q500 184 520 208 L640 250 Q672 258 672 300 L672 408 Q672 420 660 420 L150 420 Q120 420 120 392 Z"
        fill={`url(#body-${id})`}
        stroke={bodyDark}
        strokeWidth="2"
      />
      <path d="M150 200 Q160 185 185 184 L470 184" fill="none" stroke={bodyLight} strokeWidth="3" opacity="0.7" />
      {/* windscreen + cab side window */}
      <path d="M508 210 L612 246 Q636 252 636 276 L520 276 Z" fill={glass} stroke={glassDark} strokeWidth="2" />
      <rect x="455" y="208" width="44" height="64" rx="6" fill={glass} stroke={glassDark} strokeWidth="2" />
      {/* body crease + sliding door */}
      <line x1="150" y1="350" x2="660" y2="350" stroke={bodyDark} strokeWidth="2" opacity="0.5" />
      <line x1="330" y1="278" x2="330" y2="412" stroke={bodyDark} strokeWidth="2" opacity="0.4" />
      <rect x="300" y="338" width="34" height="8" rx="4" fill={bodyDark} opacity="0.55" />
      <rect x="150" y="412" width="510" height="10" fill={bodyDark} opacity="0.5" />
      <Wheels cx1={245} cx2={565} cy={424} />
      {/* headlight */}
      <path d="M636 300 L668 304 Q672 312 668 326 L636 326 Z" fill="#f4d98a" opacity="0.9" />
      <NumberPlate listing={listing} plate={plate} x={600} y={372} />
    </g>
  );
}

/* --------------------------------------------------------------------------
   Crew Cab exterior — panel van + rear quarter windows
   -------------------------------------------------------------------------- */
function CrewCabExterior({ id, body, bodyDark, bodyLight, glass, glassDark, listing, plate }: ExteriorProps) {
  void body;
  return (
    <g>
      <path
        d="M120 250 L150 200 Q160 185 185 184 L470 184 Q500 184 520 208 L640 250 Q672 258 672 300 L672 408 Q672 420 660 420 L150 420 Q120 420 120 392 Z"
        fill={`url(#body-${id})`}
        stroke={bodyDark}
        strokeWidth="2"
      />
      <path d="M150 200 Q160 185 185 184 L470 184" fill="none" stroke={bodyLight} strokeWidth="3" opacity="0.7" />
      {/* windscreen + front cab window */}
      <path d="M508 210 L612 246 Q636 252 636 276 L520 276 Z" fill={glass} stroke={glassDark} strokeWidth="2" />
      <rect x="455" y="208" width="44" height="64" rx="6" fill={glass} stroke={glassDark} strokeWidth="2" />
      {/* rear seating quarter windows */}
      <rect x="185" y="204" width="68" height="52" rx="6" fill={glass} stroke={glassDark} strokeWidth="2" />
      <rect x="268" y="204" width="68" height="52" rx="6" fill={glass} stroke={glassDark} strokeWidth="2" />
      {/* cab/crew divider seam */}
      <line x1="350" y1="184" x2="350" y2="412" stroke={bodyDark} strokeWidth="2.5" opacity="0.5" />
      {/* body crease */}
      <line x1="150" y1="350" x2="660" y2="350" stroke={bodyDark} strokeWidth="2" opacity="0.5" />
      <rect x="150" y="412" width="510" height="10" fill={bodyDark} opacity="0.5" />
      <Wheels cx1={245} cx2={565} cy={424} />
      <path d="M636 300 L668 304 Q672 312 668 326 L636 326 Z" fill="#f4d98a" opacity="0.9" />
      <NumberPlate listing={listing} plate={plate} x={600} y={372} />
    </g>
  );
}

/* --------------------------------------------------------------------------
   Pickup / Dropside / Tipper exterior
   Van faces right; cab on right, open flatbed on left.
   -------------------------------------------------------------------------- */
function PickupExterior({ id, body, bodyDark, bodyLight, glass, glassDark, listing, plate }: ExteriorProps) {
  void body; void bodyLight;
  return (
    <g>
      {/* Cab body */}
      <path
        d="M390 418 L390 202 Q400 190 422 188 L526 188 Q550 190 568 208 L634 250 Q662 260 662 298 L662 418 Z"
        fill={`url(#body-${id})`}
        stroke={bodyDark}
        strokeWidth="2"
      />
      {/* Cab roof highlight */}
      <path d="M390 202 Q400 190 422 188 L526 188" fill="none" stroke={bodyLight} strokeWidth="3" opacity="0.7" />
      {/* windscreen */}
      <path d="M542 210 L626 248 Q646 256 646 276 L530 276 Z" fill={glass} stroke={glassDark} strokeWidth="2" />
      {/* Cab side window */}
      <rect x="400" y="205" width="120" height="66" rx="6" fill={glass} stroke={glassDark} strokeWidth="2" />
      {/* Flatbed deck */}
      <rect x="155" y="348" width="238" height="16" rx="4" fill={`url(#body-${id})`} stroke={bodyDark} strokeWidth="2" />
      {/* Flatbed floor */}
      <rect x="155" y="362" width="238" height="56" rx="0" fill={shade(bodyDark, -8)} opacity="0.85" />
      {/* Flatbed rear stake */}
      <rect x="155" y="296" width="14" height="66" rx="3" fill={`url(#body-${id})`} stroke={bodyDark} strokeWidth="1.5" />
      {/* Flatbed tailgate */}
      <rect x="155" y="348" width="14" height="70" rx="0" fill={bodyDark} opacity="0.7" />
      {/* Cab sill */}
      <rect x="390" y="412" width="272" height="10" fill={bodyDark} opacity="0.5" />
      <Wheels cx1={248} cx2={558} cy={424} />
      {/* headlight */}
      <path d="M634 298 L660 302 Q664 310 660 324 L634 324 Z" fill="#f4d98a" opacity="0.9" />
      <NumberPlate listing={listing} plate={plate} x={594} y={368} />
    </g>
  );
}

/* --------------------------------------------------------------------------
   Luton van exterior — tall box body with overhang over cab
   -------------------------------------------------------------------------- */
function LutonExterior({ id, body, bodyDark, bodyLight, glass, glassDark, listing, plate }: ExteriorProps) {
  void body;
  return (
    <g>
      {/* Luton box body (tall rear section + overhang) */}
      <path
        d="M148 418 L148 162 L492 162 L492 218 Q 510 218 526 226 L636 254 Q664 264 664 300 L664 418 Z"
        fill={`url(#body-${id})`}
        stroke={bodyDark}
        strokeWidth="2"
      />
      {/* Box/cab divider vertical crease */}
      <line x1="492" y1="162" x2="492" y2="418" stroke={bodyDark} strokeWidth="2.5" opacity="0.55" />
      {/* Box roof highlight */}
      <path d="M148 162 L492 162" fill="none" stroke={bodyLight} strokeWidth="3" opacity="0.7" />
      {/* Luton face (front of overhang — visible from side) */}
      <line x1="492" y1="162" x2="492" y2="218" stroke={bodyDark} strokeWidth="3" opacity="0.7" />
      {/* Rear cargo door seam */}
      <line x1="310" y1="162" x2="310" y2="418" stroke={bodyDark} strokeWidth="2" opacity="0.35" />
      {/* Windscreen */}
      <path d="M516 222 L626 252 Q646 262 646 280 L516 280 Z" fill={glass} stroke={glassDark} strokeWidth="2" />
      {/* Cab side window */}
      <rect x="498" y="222" width="14" height="54" rx="4" fill={glass} stroke={glassDark} strokeWidth="1.5" />
      {/* Body crease */}
      <line x1="148" y1="352" x2="664" y2="352" stroke={bodyDark} strokeWidth="2" opacity="0.45" />
      {/* Sill */}
      <rect x="148" y="412" width="516" height="10" fill={bodyDark} opacity="0.5" />
      <Wheels cx1={230} cx2={560} cy={424} />
      {/* headlight */}
      <path d="M634 300 L662 305 Q666 313 662 328 L634 328 Z" fill="#f4d98a" opacity="0.9" />
      <NumberPlate listing={listing} plate={plate} x={596} y={374} />
    </g>
  );
}

/* --------------------------------------------------------------------------
   Shared sub-components
   -------------------------------------------------------------------------- */
function Wheels({ cx1, cx2, cy }: { cx1: number; cx2: number; cy: number }) {
  return (
    <>
      {[cx1, cx2].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={cy} r="52" fill="#1a1f24" />
          <circle cx={cx} cy={cy} r="51" fill="none" stroke="#0d1620" strokeWidth="2" />
          <circle cx={cx} cy={cy} r="26" fill="#aeb8c1" />
          <circle cx={cx} cy={cy} r="26" fill="none" stroke="#7d8893" strokeWidth="2" />
          <circle cx={cx} cy={cy} r="7" fill="#5c6b78" />
        </g>
      ))}
    </>
  );
}

function NumberPlate({
  listing,
  plate,
  x,
  y,
}: {
  listing: Pick<Listing, "plate">;
  plate?: boolean;
  x: number;
  y: number;
}) {
  if (plate === false) return null;
  return (
    <g transform={`translate(${x},${y})`}>
      <rect width="58" height="22" rx="3" fill="var(--color-plate, #f7d117)" stroke="#0d1620" strokeWidth="1.5" />
      <text
        x="29"
        y="16"
        textAnchor="middle"
        fontFamily="var(--font-mono, monospace)"
        fontSize="13"
        fontWeight="700"
        fill="#14202c"
        letterSpacing="0.5"
      >
        {(listing.plate || "NEW").toString().slice(0, 6).toUpperCase()}
      </text>
    </g>
  );
}

type ExteriorProps = {
  id: string;
  body: string;
  bodyDark: string;
  bodyLight: string;
  glass: string;
  glassDark: string;
  listing: Pick<Listing, "colour" | "make" | "model" | "plate">;
  plate?: boolean;
};

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
