"use client";

import Link from "next/link";
import { useRole } from "@/lib/roles/context";
import { IconUser } from "./icons";

export function AccountButton() {
  const { isLoggedIn, persona } = useRole();

  if (!isLoggedIn) {
    return (
      <Link
        href="/sign-in"
        className="hidden items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-sm)] font-semibold text-ink-600 transition-colors hover:bg-surface-2 hover:text-ink-900 sm:flex"
      >
        <IconUser width={16} height={16} />
        Sign in
      </Link>
    );
  }

  return (
    <Link
      href={persona.accountHref}
      className="hidden items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-sm)] font-semibold text-ink-600 transition-colors hover:bg-surface-2 hover:text-ink-900 sm:flex"
    >
      <span className="flex size-6 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
        {persona.initials}
      </span>
      <span className="max-w-[100px] truncate">{persona.displayName}</span>
    </Link>
  );
}
