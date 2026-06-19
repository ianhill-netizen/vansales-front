"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRole } from "@/lib/roles/context";
import {
  MOCK_SAVED_VANS,
  MOCK_SAVED_SEARCHES,
  MOCK_ENQUIRIES,
  MOCK_ALERTS,
} from "@/lib/roles/mock-data";
import { Container } from "@/components/ui";

const CHANNEL_COLOR: Record<string, string> = {
  WhatsApp: "bg-success-tint text-success-700",
  Message: "bg-surface-2 text-ink-600",
  Finance: "bg-amber-50 text-amber-700",
  PX: "bg-purple-50 text-purple-700",
};

export default function AccountPage() {
  const { isLoggedIn, isBuyer, persona } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) router.replace("/sign-in");
    if (!isBuyer) router.replace(persona.accountHref);
  }, [isLoggedIn, isBuyer, persona, router]);

  if (!isLoggedIn || !isBuyer) return null;

  return (
    <Container className="py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-[var(--text-2xl)] font-extrabold text-ink-900">
            Hi, {persona.displayName}
          </h1>
          <p className="mt-0.5 text-[var(--text-sm)] text-ink-500">{persona.email}</p>
        </div>
        <button className="rounded-[var(--radius-md)] border border-border px-4 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400">
          Edit profile
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: 2/3 */}
        <div className="space-y-6 lg:col-span-2">
          {/* Alerts */}
          {MOCK_ALERTS.length > 0 && (
            <section className="rounded-[var(--radius-xl)] border border-brand-200 bg-brand-tint px-5 py-4">
              <p className="mb-2 text-[var(--text-xs)] font-bold uppercase tracking-widest text-brand-700">
                {MOCK_ALERTS.length} new alert{MOCK_ALERTS.length > 1 ? "s" : ""}
              </p>
              <ul className="space-y-2">
                {MOCK_ALERTS.map((a) => (
                  <li key={a.id}>
                    <Link href={a.href} className="block rounded-[var(--radius-lg)] bg-white px-4 py-3 text-[var(--text-sm)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]">
                      <span className="font-semibold text-ink-900">{a.query}</span>
                      <span className="ml-2 text-ink-500">{a.trigger}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Saved vans */}
          <section>
            <h2 className="mb-3 font-display text-[var(--text-lg)] font-bold text-ink-900">Saved vans</h2>
            <div className="space-y-3">
              {MOCK_SAVED_VANS.map((v) => (
                <div key={v.id} className="flex items-center gap-4 rounded-[var(--radius-xl)] border border-border bg-white px-4 py-3 shadow-[var(--shadow-sm)]">
                  <div className="flex h-16 w-24 flex-shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-surface-1 text-[var(--text-2xs)] text-ink-400">
                    No photo
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink-900">{v.year} {v.make} {v.model}</p>
                    <p className="text-[var(--text-sm)] text-ink-500">{v.mileage.toLocaleString()} mi · £{v.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/listing/${v.slug}`} className="rounded-[var(--radius-md)] border border-border px-3 py-1.5 text-[var(--text-xs)] font-semibold text-ink-700 hover:border-brand-500 hover:text-brand-700">
                      View
                    </Link>
                    <button className="rounded-[var(--radius-md)] border border-border px-3 py-1.5 text-[var(--text-xs)] font-semibold text-ink-400 hover:border-red-300 hover:text-red-500">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              {MOCK_SAVED_VANS.length === 0 && (
                <p className="rounded-[var(--radius-xl)] border border-dashed border-border bg-surface-0 py-8 text-center text-[var(--text-sm)] text-ink-400">
                  No saved vans yet. <Link href="/vans" className="text-brand-600 hover:underline">Browse vans →</Link>
                </p>
              )}
            </div>
          </section>

          {/* Enquiry history */}
          <section>
            <h2 className="mb-3 font-display text-[var(--text-lg)] font-bold text-ink-900">Enquiry history</h2>
            <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-white">
              <table className="w-full text-[var(--text-sm)]">
                <thead>
                  <tr className="border-b border-border bg-surface-0">
                    <th className="px-4 py-2.5 text-left text-[var(--text-xs)] font-semibold uppercase tracking-wider text-ink-400">Van</th>
                    <th className="px-4 py-2.5 text-left text-[var(--text-xs)] font-semibold uppercase tracking-wider text-ink-400">Dealer</th>
                    <th className="hidden px-4 py-2.5 text-left text-[var(--text-xs)] font-semibold uppercase tracking-wider text-ink-400 sm:table-cell">Channel</th>
                    <th className="px-4 py-2.5 text-left text-[var(--text-xs)] font-semibold uppercase tracking-wider text-ink-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {MOCK_ENQUIRIES.map((e) => (
                    <tr key={e.id} className="hover:bg-surface-0">
                      <td className="px-4 py-3 font-medium text-ink-800">{e.van}</td>
                      <td className="px-4 py-3 text-ink-500">{e.dealer}</td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[var(--text-2xs)] font-semibold ${CHANNEL_COLOR[e.channel] ?? "bg-surface-2 text-ink-600"}`}>
                          {e.channel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[var(--text-2xs)] font-semibold capitalize ${e.status === "replied" ? "bg-success-tint text-success-700" : e.status === "viewed" ? "bg-amber-50 text-amber-700" : "bg-surface-2 text-ink-500"}`}>
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right column: 1/3 */}
        <div className="space-y-5">
          {/* Saved searches */}
          <section>
            <h2 className="mb-3 font-display text-[var(--text-base)] font-bold text-ink-900">Saved searches</h2>
            <div className="space-y-2">
              {MOCK_SAVED_SEARCHES.map((s) => (
                <Link key={s.id} href={s.href} className="flex items-center justify-between rounded-[var(--radius-xl)] border border-border bg-white px-4 py-3 shadow-[var(--shadow-sm)] hover:border-brand-400/40">
                  <div>
                    <p className="text-[var(--text-sm)] font-semibold text-ink-800">{s.label}</p>
                    <p className="text-[var(--text-xs)] text-ink-400">{s.count} vans · updated {s.lastUpdated}</p>
                  </div>
                  <span className="text-ink-400">→</span>
                </Link>
              ))}
              <Link href="/vans" className="flex items-center gap-2 rounded-[var(--radius-xl)] border border-dashed border-border px-4 py-3 text-[var(--text-sm)] text-brand-600 hover:border-brand-400">
                + New search
              </Link>
            </div>
          </section>

          {/* Quick profile */}
          <section className="rounded-[var(--radius-xl)] border border-border bg-white px-5 py-5">
            <h2 className="mb-3 font-display text-[var(--text-base)] font-bold text-ink-900">Profile</h2>
            <dl className="space-y-2 text-[var(--text-sm)]">
              <div className="flex justify-between"><dt className="text-ink-500">Name</dt><dd className="font-medium text-ink-800">{persona.displayName}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-500">Email</dt><dd className="font-medium text-ink-800">{persona.email}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-500">Member since</dt><dd className="font-medium text-ink-800">Jan 2025</dd></div>
            </dl>
            <button className="mt-4 w-full rounded-[var(--radius-md)] border border-border py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400">
              Change password
            </button>
          </section>

          {/* Danger zone */}
          <section className="rounded-[var(--radius-xl)] border border-border px-5 py-4">
            <p className="text-[var(--text-xs)] font-bold uppercase tracking-widest text-ink-400">Account</p>
            <button className="mt-2 text-[var(--text-sm)] text-red-500 hover:underline">Sign out</button>
          </section>
        </div>
      </div>
    </Container>
  );
}
