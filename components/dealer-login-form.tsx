"use client";

export function DealerLoginForm() {
  return (
    <form className="space-y-4" action="#" method="post">
      <div>
        <label
          htmlFor="dp-email"
          className="block text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-white/55"
        >
          Email address
        </label>
        <input
          id="dp-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@dealership.com"
          className="mt-1.5 h-11 w-full rounded-[var(--radius-md)] border border-white/15 bg-white/8 px-3 text-[var(--text-base)] text-white placeholder-white/30 outline-none transition-colors focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/20"
        />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="dp-password"
            className="block text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-white/55"
          >
            Password
          </label>
          <a
            href="/dealer-portal/forgot-password"
            className="text-[var(--text-xs)] text-brand-400 hover:text-brand-300 hover:underline"
          >
            Forgotten password?
          </a>
        </div>
        <div className="relative mt-1.5">
          <input
            id="dp-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="h-11 w-full rounded-[var(--radius-md)] border border-white/15 bg-white/8 px-3 pr-12 text-[var(--text-base)] text-white placeholder-white/30 outline-none transition-colors focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/20"
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-xs)] font-semibold text-white/40 hover:text-white/70"
          >
            Show
          </button>
        </div>
      </div>
      <button
        type="submit"
        className="flex h-11 w-full items-center justify-center rounded-[var(--radius-md)] bg-brand-500 text-[var(--text-base)] font-semibold text-white transition-colors hover:bg-brand-600"
      >
        Log in
      </button>
      <p className="text-center text-[var(--text-xs)] text-white/40">
        Don&apos;t have an account?{" "}
        <a href="/advertise" className="text-brand-400 hover:underline">
          Find out about advertising
        </a>
      </p>
    </form>
  );
}
