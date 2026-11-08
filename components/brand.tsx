import Link from "next/link";

/** The vansales.com hub logo (public/logo.svg: navy plate, white "vansales", amber ".com" pill), 36px high everywhere it appears. */
export function Logo({ tone = "dark" }: { tone?: "light" | "dark" }) {
  void tone;   // one logo for every background: it carries its own navy plate
  return (
    <Link href="/" className="inline-flex items-center" aria-label="Vansales home">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg" alt="vansales.com" height={36} width={189} style={{ height: 36, width: "auto" }} />
    </Link>
  );
}
