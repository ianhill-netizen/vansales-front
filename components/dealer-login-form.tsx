"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui";

export function DealerLoginForm() {
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

    router.push("/dealer-portal");
    router.refresh();
  }

  const inputCls =
    "mt-1.5 h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[var(--text-base)] text-ink-800 outline-none transition-colors focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/15";

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div role="alert" className="rounded-[var(--radius-md)] border border-danger-500/20 bg-danger-tint px-3 py-2.5 text-[var(--text-sm)] font-medium text-danger-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="dp-email" className="block text-[var(--text-xs)] font-semibold text-ink-600">
          Email address
        </label>
        <input
          id="dp-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@dealership.com"
          className={inputCls}
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="dp-password" className="text-[var(--text-xs)] font-semibold text-ink-600">
            Password
          </label>
          <a href="/dealer-portal/forgot-password" className="text-[var(--text-xs)] text-brand-600 hover:underline">
            Forgot password?
          </a>
        </div>
        <div className="relative mt-1.5">
          <input
            id="dp-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 pr-14 text-[var(--text-base)] text-ink-800 outline-none transition-colors focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/15"
          />
          <button
            type="button"
            aria-label="Show password"
            onClick={(e) => {
              const btn = e.currentTarget;
              const input = btn.previousElementSibling as HTMLInputElement;
              const isText = input.type === "text";
              input.type = isText ? "password" : "text";
              btn.setAttribute("aria-label", isText ? "Show password" : "Hide password");
              btn.textContent = isText ? "Show" : "Hide";
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-xs)] font-semibold text-ink-400 hover:text-ink-700"
          >
            Show
          </button>
        </div>
      </div>

      <Button type="submit" variant="brand" size="md" className="w-full" disabled={loading}>
        {loading ? "Logging in…" : "Log in"}
      </Button>

      <p className="text-center text-[var(--text-xs)] text-ink-400">
        Don&apos;t have an account?{" "}
        <a href="/sign-up/dealer" className="text-brand-600 hover:underline">
          Get started
        </a>
      </p>
    </form>
  );
}
