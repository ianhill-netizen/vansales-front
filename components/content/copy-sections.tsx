import Link from "next/link";
import type { Block, Section } from "@/lib/content/copy";

/** Renders inline [text](/path) links as next/link; everything else is plain text. */
export function InlineLinks({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(<Link key={m.index} href={m[2]} className="font-semibold text-brand-700 hover:underline">{m[1]}</Link>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

function BlockView({ b }: { b: Block }) {
  if ("h3" in b) return <h3 className="mt-6 font-display text-[length:var(--text-lg)] font-bold text-ink-900">{b.h3}</h3>;
  if ("p" in b) return <p className="mt-3 leading-relaxed text-ink-700"><InlineLinks text={b.p} /></p>;
  return (
    <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-ink-700">
      {b.ul.map((li) => <li key={li}><InlineLinks text={li} /></li>)}
    </ul>
  );
}

export function CopySections({ sections }: { sections: readonly Section[] }) {
  return (
    <>
      {sections.map((s) => (
        <section key={s.id} id={s.id} className="mt-10 scroll-mt-20">
          <h2 className="font-display text-[length:var(--text-2xl)] font-bold text-ink-900">{s.h2}</h2>
          {s.blocks.map((b, i) => <BlockView key={i} b={b} />)}
        </section>
      ))}
    </>
  );
}
