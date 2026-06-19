import Link from "next/link";
import { Logo } from "@/components/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-1">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/"><Logo tone="dark" /></Link>
          <Link href="/vans" className="text-[var(--text-sm)] font-semibold text-ink-500 hover:text-ink-900">
            Browse vans →
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 py-12">
        {children}
      </main>
    </div>
  );
}
