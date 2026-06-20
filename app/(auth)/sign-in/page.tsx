"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    if (!email) { setError("Please enter your email address."); return; }
    if (!password) { setError("Please enter your password."); return; }

    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    router.push("/account");
    router.refresh();
  }

  const inputCls =
    "mt-1.5 h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[var(--text-base)] text-ink-800 outline-none transition-colors focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/15";

  return (
    <div className="w-full max-w-sm">
      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-white shadow-[var(--shadow-md)]">
        <div className="border-b border-border px-6 py-5">
          <h1 className="font-display text-[var(--text-xl)] font-extrabold text-ink-900">Welcome back</h1>
          <p className="mt-0.5 text-[var(--text-sm)] text-ink-500">Sign in to your Vansales account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5" noValidate>
          {error && (
            <div role="alert" className="rounded-[var(--radius-md)] border border-danger-500/20 bg-danger-tint px-3 py-2.5 text-[var(--text-sm)] font-medium text-danger-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-[var(--text-xs)] font-semibold text-ink-600">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className={inputCls}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-[var(--text-xs)] font-semibold text-ink-600">
                Password
              </label>
              <Link href="/sign-in/forgot-password" className="text-[var(--text-xs)] text-brand-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className={inputCls}
            />
          </div>

          <Button type="submit" variant="brand" size="md" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>

          <div className="relative flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[var(--text-xs)] text-ink-400">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/account" })}
            className="flex h-11 w-full items-center justify-center gap-2.5 rounded-[var(--radius-md)] border border-ink-300 bg-white text-[var(--text-sm)] font-semibold text-ink-800 transition-colors hover:border-ink-500 hover:bg-surface-1"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </form>
      </div>

      <p className="mt-5 text-center text-[var(--text-sm)] text-ink-500">
        New to Vansales?{" "}
        <Link href="/sign-up" className="font-semibold text-brand-700 hover:underline">
          Create an account →
        </Link>
      </p>
      <p className="mt-3 text-center text-[var(--text-xs)] text-ink-400">
        Are you a dealer?{" "}
        <Link href="/dealer-portal/login" className="text-brand-600 hover:underline">
          Log in to Dealer Portal
        </Link>
      </p>
    </div>
  );
}
