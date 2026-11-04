/** Decorative hero art: one clean white panel van, side-on, desaturated. Original artwork (no photo licence involved), drawn as inline SVG so it costs no image request. Sits behind the search box at low opacity and fades to white at the bottom. */
export function HeroVan() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg
        viewBox="0 0 1200 420"
        preserveAspectRatio="xMaxYMid meet"
        className="absolute right-[-6%] top-2 h-[52%] w-[85%] opacity-[0.3] sm:right-[1%] sm:h-[58%] sm:w-[52%]"
      >
        {/* road shadow */}
        <ellipse cx="610" cy="352" rx="470" ry="16" fill="#94a3b8" opacity="0.5" />
        {/* body */}
        <path
          d="M150 306 V162 q0-36 36-36 H655 q28 0 48 20 l108 118 q22 24 22 54 v20 q0 20-20 20 H170 q-20 0-20-20 Z"
          fill="#ffffff" stroke="#94a3b8" strokeWidth="5" strokeLinejoin="round"
        />
        {/* roof line + load-bay panel lines */}
        <path d="M186 140 H655" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
        <path d="M470 126 V312 M300 126 V312" stroke="#cbd5e1" strokeWidth="4" />
        {/* cab side window */}
        <path d="M530 150 H668 q14 0 24 11 l74 82 H530 Z" fill="#dbe4ee" stroke="#94a3b8" strokeWidth="4" strokeLinejoin="round" />
        {/* door handle, mirror, lights */}
        <rect x="498" y="238" width="22" height="7" rx="3.5" fill="#94a3b8" />
        <rect x="738" y="204" width="26" height="22" rx="6" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="3" />
        <path d="M828 270 h22 q10 0 10 10 v14 h-32 Z" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="3" />
        <rect x="150" y="262" width="26" height="20" rx="5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="3" />
        {/* bumpers */}
        <rect x="140" y="322" width="62" height="14" rx="7" fill="#cbd5e1" />
        <rect x="788" y="322" width="84" height="14" rx="7" fill="#cbd5e1" />
        {/* wheels */}
        {[300, 700].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="322" r="52" fill="#475569" />
            <circle cx={cx} cy="322" r="30" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="4" />
            <circle cx={cx} cy="322" r="8" fill="#94a3b8" />
          </g>
        ))}
        <path d="M242 322 a58 58 0 0 1 116 0 M642 322 a58 58 0 0 1 116 0" fill="none" stroke="#94a3b8" strokeWidth="5" />
      </svg>
      {/* fade to white at the bottom, and a touch from the left so the heading stays crisp */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/25 to-transparent" />
      <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-white/70 to-transparent max-sm:hidden" />
    </div>
  );
}
