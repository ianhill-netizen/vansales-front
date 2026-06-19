import Link from "next/link";

export function Logo({ tone = "dark" }: { tone?: "light" | "dark" }) {
  const word = tone === "light" ? "text-white" : "text-ink-900";
  return (
    <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Vansales home">
      <span className="grid h-8 w-11 place-items-center rounded-[var(--radius-sm)] bg-plate font-mono text-[var(--text-base)] font-bold tracking-[var(--tracking-plate)] text-plate-ink ring-2 ring-ink-900/85">
        VS
      </span>
      <span className={`font-display text-[var(--text-xl)] font-extrabold leading-none tracking-[var(--tracking-display)] ${word}`}>
        vansales
        <span className="text-accent-500">.</span>
      </span>
    </Link>
  );
}
