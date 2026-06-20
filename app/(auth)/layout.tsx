import Link from "next/link";
import { Logo } from "@/components/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-1">
      <header className="border-b border-border bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/"><Logo tone="dark" /></Link>
          <div className="flex items-center gap-4">
            <Link href="/vans" className="text-[var(--text-sm)] font-medium text-ink-500 hover:text-ink-900">Browse vans</Link>
            <Link href="/advertise" className="rounded-[var(--radius-md)] border border-border px-3 py-1.5 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400 hover:bg-surface-1 transition-colors">For dealers →</Link>
          </div>
        </div>
      </header>
      <main className="flex flex-1 items-start justify-center bg-gradient-to-b from-surface-1 to-white px-4 py-12 md:py-16">
        {children}
      </main>
    </div>
  );
}
