"use client";

import Link from "next/link";
import { ILLUSTRATIONS, type IllustrationName } from "./illustrations";

const ACTION = "mt-5 inline-flex items-center rounded-[var(--radius-pill)] bg-brand-600 px-5 py-2 text-[length:var(--text-sm)] font-semibold text-white hover:bg-brand-700";

/** A friendly empty list: line-art, one plain sentence, and a next step. Never a blank box. */
export function EmptyState({
  illustration,
  title,
  body,
  action,
  className = "",
}: {
  illustration: IllustrationName;
  title: string;
  body?: string;
  action?: { label: string; href?: string; onClick?: () => void };
  className?: string;
}) {
  const Art = ILLUSTRATIONS[illustration];
  return (
    <div role="status" className={`flex flex-col items-center rounded-[var(--radius-xl)] border border-border bg-surface-1 px-6 py-10 text-center ${className}`}>
      <Art className="h-20 w-[7.5rem] text-brand-300" />
      <h2 className="mt-4 font-display text-[length:var(--text-lg)] font-bold text-ink-900">{title}</h2>
      {body && <p className="mt-1.5 max-w-md text-[length:var(--text-sm)] leading-relaxed text-ink-600">{body}</p>}
      {action && (action.href ? (
        <Link href={action.href} onClick={action.onClick} className={ACTION}>{action.label}</Link>
      ) : (
        <button type="button" onClick={action.onClick} className={ACTION}>{action.label}</button>
      ))}
    </div>
  );
}
