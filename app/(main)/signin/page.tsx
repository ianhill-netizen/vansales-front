import type { Metadata } from "next";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: true } };

export default function SignInPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-12">
      <h1 className="font-display text-[length:var(--text-2xl)] font-bold text-ink-900">Sign in</h1>
      <p className="mt-2 text-[length:var(--text-sm)] text-ink-600">Enter your email and we will send you a link. No password needed. It works on any device.</p>
      <SignInForm />
    </main>
  );
}
