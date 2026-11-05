import type { Metadata } from "next";
import { Container, Eyebrow } from "@/components/ui";
import { SavedVans } from "@/components/saved-vans";
import { SITE, absUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Saved vans",
  description: `The vans you have saved on ${SITE.name}.`,
  alternates: { canonical: absUrl("/saved") },
  robots: { index: false, follow: true },   // it is per visitor: nothing for a search engine to index
};

export default function SavedPage() {
  return (
    <Container className="py-8">
      <Eyebrow>Saved</Eyebrow>
      <h1 className="mt-2 font-display text-[length:var(--text-3xl)] font-extrabold text-ink-900">Saved vans</h1>
      <p className="mt-1.5 text-[length:var(--text-sm)] text-ink-500">Saved on this device. Sign in to keep them on every device.</p>
      <SavedVans />
    </Container>
  );
}
