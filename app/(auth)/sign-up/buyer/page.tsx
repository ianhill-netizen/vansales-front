"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function BuyerSignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const first = (form.elements.namedItem("first") as HTMLInputElement).value.trim();
    const last = (form.elements.namedItem("last") as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    if (!email || !password) { setError("All fields are required."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }

    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: `${first} ${last}`.trim(), role: "customer" }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Registration failed.");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Account created — please sign in.");
      setLoading(false);
      router.push("/sign-in");
      return;
    }

    router.push("/account");
    router.refresh();
  }

  const inputCls = "mt-1 h-10 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[var(--text-sm)] outline-none focus-visible:border-brand-500";
  const labelCls = "block text-[var(--text-xs)] font-semibold uppercase tracking-widest text-ink-500";

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 text-center">
        <h1 className="font-display text-[var(--text-xl)] font-extrabold text-ink-900">Create buyer account</h1>
        <p className="mt-1 text-[var(--text-sm)] text-ink-500">Free forever. No credit card.</p>
      </div>
      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-white shadow-[var(--shadow-md)]">
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6" noValidate>
          {error && (
            <div role="alert" className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-3 py-2.5 text-[var(--text-sm)] font-medium text-red-700">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="first" className={labelCls}>First name</label>
              <input id="first" name="first" type="text" required autoComplete="given-name" className={inputCls} />
            </div>
            <div>
              <label htmlFor="last" className={labelCls}>Last name</label>
              <input id="last" name="last" type="text" required autoComplete="family-name" className={inputCls} />
            </div>
          </div>
          <div>
            <label htmlFor="email" className={labelCls}>Email address</label>
            <input id="email" name="email" type="email" required autoComplete="email" className={inputCls} />
          </div>
          <div>
            <label htmlFor="password" className={labelCls}>Password</label>
            <input id="password" name="password" type="password" required autoComplete="new-password" placeholder="Min. 8 characters" className={inputCls} />
          </div>
          <label className="flex items-start gap-2.5">
            <input type="checkbox" required className="mt-0.5 accent-brand-500" />
            <span className="text-[var(--text-xs)] text-ink-500">
              I agree to the <Link href="/legal/terms" className="text-brand-600 hover:underline">terms</Link> and <Link href="/legal/privacy" className="text-brand-600 hover:underline">privacy policy</Link>
            </span>
          </label>
          <button type="submit" disabled={loading}
            className="flex h-11 w-full items-center justify-center rounded-[var(--radius-md)] bg-brand-500 text-[var(--text-sm)] font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60">
            {loading ? "Creating account…" : "Create account →"}
          </button>
          <div className="relative flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[var(--text-xs)] text-ink-400">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <button type="button" onClick={() => signIn("google", { callbackUrl: "/account" })}
            className="flex h-10 w-full items-center justify-center gap-2.5 rounded-[var(--radius-md)] border border-border bg-white text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
        </form>
      </div>
      <p className="mt-4 text-center text-[var(--text-xs)] text-ink-400">
        <Link href="/sign-up" className="hover:underline">← All account types</Link>
      </p>
    </div>
  );
}
