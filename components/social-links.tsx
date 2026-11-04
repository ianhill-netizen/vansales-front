import type { SVGProps } from "react";

type Network = "facebook" | "instagram" | "linkedin" | "youtube" | "twitter";

const LABEL: Record<Network, string> = { facebook: "Facebook", instagram: "Instagram", linkedin: "LinkedIn", youtube: "YouTube", twitter: "X (Twitter)" };
const ORDER: Network[] = ["facebook", "instagram", "linkedin", "youtube", "twitter"];

const svg = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true } as const;

function Icon({ network, ...p }: { network: Network } & SVGProps<SVGSVGElement>) {
  switch (network) {
    case "facebook":
      return <svg {...svg} {...p}><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.5V21h3z" /></svg>;
    case "instagram":
      return <svg {...svg} {...p}><path d="M12 7.3A4.7 4.7 0 1016.7 12 4.7 4.7 0 0012 7.3zm0 7.7a3 3 0 113-3 3 3 0 01-3 3zM17.1 6a1.1 1.1 0 101.1 1.1A1.1 1.1 0 0017.1 6zM12 3.5c-2.3 0-2.6 0-3.5.1a6.3 6.3 0 00-2.1.4A4.2 4.2 0 004 6.4a6.3 6.3 0 00-.4 2.1c-.1.9-.1 1.2-.1 3.5s0 2.6.1 3.5a6.3 6.3 0 00.4 2.1 4.2 4.2 0 002.4 2.4 6.3 6.3 0 002.1.4c.9.1 1.2.1 3.5.1s2.6 0 3.5-.1a6.3 6.3 0 002.1-.4 4.2 4.2 0 002.4-2.4 6.3 6.3 0 00.4-2.1c.1-.9.1-1.2.1-3.5s0-2.6-.1-3.5a6.3 6.3 0 00-.4-2.1A4.2 4.2 0 0017.6 4a6.3 6.3 0 00-2.1-.4c-.9-.1-1.2-.1-3.5-.1zm0 1.5c2.3 0 2.5 0 3.4.1a4.7 4.7 0 011.6.3 2.7 2.7 0 011.5 1.5 4.7 4.7 0 01.3 1.6c.1.9.1 1.1.1 3.4s0 2.5-.1 3.4a4.7 4.7 0 01-.3 1.6 2.7 2.7 0 01-1.5 1.5 4.7 4.7 0 01-1.6.3c-.9.1-1.1.1-3.4.1s-2.5 0-3.4-.1a4.7 4.7 0 01-1.6-.3 2.7 2.7 0 01-1.5-1.5 4.7 4.7 0 01-.3-1.6C5 14.5 5 14.3 5 12s0-2.5.1-3.4a4.7 4.7 0 01.3-1.6A2.7 2.7 0 016.9 5.5a4.7 4.7 0 011.6-.3C9.4 5 9.7 5 12 5z" /></svg>;
    case "linkedin":
      return <svg {...svg} {...p}><path d="M6.9 20H3.6V9.4h3.3V20zM5.3 8a1.9 1.9 0 110-3.8 1.9 1.9 0 010 3.8zM20.4 20h-3.3v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V20h-3.3V9.4h3.2v1.4a3.5 3.5 0 013.1-1.7c3.4 0 4 2.2 4 5.1V20z" /></svg>;
    case "youtube":
      return <svg {...svg} {...p}><path d="M21.6 7.2a2.5 2.5 0 00-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 002.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 001.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 001.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3z" /></svg>;
    case "twitter":
      return <svg {...svg} {...p}><path d="M17.8 3h3l-6.6 7.5L22 21h-6.1l-4.8-6.2L5.6 21h-3l7.1-8.1L2 3h6.3l4.3 5.7zm-1 16.2h1.7L7.3 4.7H5.5z" /></svg>;
  }
}

/** Round icon links to a dealer's social profiles. Only the networks that have an http(s) link are shown; renders nothing when there are none. */
export function SocialLinks({ socials, className = "" }: { socials: Partial<Record<Network, string | null | undefined>> | undefined; className?: string }) {
  const links = ORDER.flatMap((n) => {
    const raw = socials?.[n];
    if (!raw) return [];
    try {
      const u = new URL(raw);
      return u.protocol === "https:" || u.protocol === "http:" ? [{ network: n, url: u.toString() }] : [];
    } catch {
      return [];
    }
  });
  if (links.length === 0) return null;
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {links.map(({ network, url }) => (
        <li key={network}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${LABEL[network]} (opens in a new tab)`}
            title={LABEL[network]}
            className="grid size-10 place-items-center rounded-full border border-border text-brand-700 transition-colors hover:border-brand-300 hover:bg-brand-tint"
          >
            <Icon network={network} />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function hasSocials(socials: Partial<Record<Network, string | null | undefined>> | undefined): boolean {
  return !!socials && ORDER.some((n) => !!socials[n]);
}
