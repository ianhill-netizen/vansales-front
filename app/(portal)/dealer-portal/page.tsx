"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRole } from "@/lib/roles/context";
import {
  MOCK_DASH_STOCK,
  MOCK_DASH_LEADS,
  MOCK_PERF_TIMELINE,
  MOCK_LISTING_PERF,
  MOCK_PRICE_INDICATORS,
  MOCK_QUALITY_ISSUES,
  MOCK_BOOST_LISTINGS,
  type DashLead,
  type LeadChannel,
  type LeadStatus,
  type PricePosition,
  type PerfMetric,
  type BoostItem,
} from "@/lib/dealer/mock-dashboard-data";
import { Badge } from "@/components/ui";
import { IconTrendUp, IconBarChart, IconArrow } from "@/components/icons";

/* ── Channel tag ─────────────────────────────────────────────────────────── */
const CHANNEL_STYLE: Record<LeadChannel, string> = {
  WhatsApp: "bg-success-tint text-success-700",
  Phone:    "bg-brand-tint text-brand-700",
  Web:      "bg-surface-2 text-ink-600",
  Finance:  "bg-amber-50 text-amber-700",
  PX:       "bg-purple-50 text-purple-700",
};
const CHANNEL_ICON: Record<LeadChannel, string> = {
  WhatsApp: "💬", Phone: "📞", Web: "🌐", Finance: "£", PX: "⇄",
};

function ChannelTag({ channel }: { channel: LeadChannel }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[var(--text-2xs)] font-semibold ${CHANNEL_STYLE[channel]}`}>
      <span aria-hidden>{CHANNEL_ICON[channel]}</span>
      {channel}
    </span>
  );
}

/* ── Lead status badge ───────────────────────────────────────────────────── */
const STATUS_STYLE: Record<LeadStatus, string> = {
  new:     "bg-brand-tint text-brand-700",
  replied: "bg-success-tint text-success-700",
  closed:  "bg-surface-2 text-ink-400",
};
function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[var(--text-2xs)] font-semibold capitalize ${STATUS_STYLE[status]}`}>
      {status}
    </span>
  );
}

/* ── Price badge ─────────────────────────────────────────────────────────── */
const PRICE_BADGE: Record<PricePosition, { label: string; cls: string }> = {
  great: { label: "Great Price", cls: "bg-success-tint text-success-700 border border-success-500/20" },
  good:  { label: "Good Price",  cls: "bg-brand-tint text-brand-700 border border-brand-500/20" },
  fair:  { label: "Fair Price",  cls: "bg-amber-50 text-amber-700 border border-amber-200" },
  high:  { label: "High Price",  cls: "bg-danger-tint text-danger-700 border border-danger-500/20" },
};
function PriceBadge({ position }: { position: PricePosition }) {
  const { label, cls } = PRICE_BADGE[position];
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[var(--text-xs)] font-bold ${cls}`}>{label}</span>
  );
}

/* ── Performance bars ────────────────────────────────────────────────────── */
const METRIC_COLOR: Record<PerfMetric, string> = {
  views:       "bg-brand-500",
  leads:       "bg-success-500",
  appearances: "bg-purple-500",
};

function PerfBars({ data, metric }: { data: typeof MOCK_PERF_TIMELINE; metric: PerfMetric }) {
  const vals = data.map((d) => d[metric]);
  const max  = Math.max(...vals, 1);
  return (
    <div>
      <div className="flex h-28 items-end gap-[2px]">
        {data.map((d, i) => {
          const pct = Math.max((d[metric] / max) * 100, 1);
          return (
            <div key={i} className="group relative flex flex-1 cursor-default flex-col justify-end">
              <div
                className={`${METRIC_COLOR[metric]} min-h-[2px] rounded-t-[2px] opacity-75 transition-opacity group-hover:opacity-100`}
                style={{ height: `${pct}%` }}
              />
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-sm)] bg-ink-900 px-2 py-1 text-[10px] leading-tight text-white shadow group-hover:block">
                <span className="font-semibold">{d[metric].toLocaleString()}</span>
                <span className="ml-1 text-ink-400">{d.label}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center">
            {(i === 0 || i % 7 === 0 || i === data.length - 1) && (
              <span className="block truncate text-[9px] text-ink-400">{d.label}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── KPI card ────────────────────────────────────────────────────────────── */
function KPICard({
  label, value, sub, href, warn = false, suffix,
}: {
  label: string; value: string | number; sub?: string; href: string; warn?: boolean; suffix?: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex flex-col rounded-[var(--radius-xl)] border bg-white px-5 py-5 shadow-[var(--shadow-xs)] transition-all hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 ${
        warn ? "border-warning-600/30 bg-warning-tint/30" : "border-border"
      }`}
    >
      <span className={`font-display text-[var(--text-2xl)] font-extrabold leading-none ${warn ? "text-warning-600" : "text-ink-900"}`}>
        {value}{suffix}
      </span>
      <span className="mt-1.5 text-[var(--text-xs)] font-semibold text-ink-500">{label}</span>
      {sub && (
        <span className="mt-0.5 text-[var(--text-2xs)] text-ink-400">{sub}</span>
      )}
    </Link>
  );
}

/* ── Score card ──────────────────────────────────────────────────────────── */
function ScoreCard({
  score, issues, href,
}: { score: number; issues: number; href: string }) {
  const color = score >= 80 ? "text-success-600" : score >= 60 ? "text-warning-600" : "text-danger-600";
  const barColor = score >= 80 ? "bg-success-500" : score >= 60 ? "bg-amber-500" : "bg-danger-500";
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-[var(--radius-xl)] border border-border bg-white px-5 py-5 shadow-[var(--shadow-xs)] transition-all hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5"
    >
      <span className={`font-display text-[var(--text-2xl)] font-extrabold leading-none ${color}`}>
        {score}<span className="text-[var(--text-base)] font-semibold">%</span>
      </span>
      <div className="my-2 h-1.5 w-full rounded-full bg-surface-2">
        <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-[var(--text-xs)] font-semibold text-ink-500">Quality score</span>
      <span className="mt-0.5 text-[var(--text-2xs)] text-ink-400">{issues} issue{issues !== 1 ? "s" : ""} to fix</span>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Dashboard
   ═══════════════════════════════════════════════════════════════════════════ */
export default function DealerDashboardPage() {
  const { isDealer, isSwissVans, isAdmin, isLoggedIn, persona } = useRole();
  const router = useRouter();

  const [leads, setLeads]         = useState<DashLead[]>(MOCK_DASH_LEADS);
  const [boosts, setBoosts]       = useState<BoostItem[]>(MOCK_BOOST_LISTINGS);
  const [tokens, setTokens]       = useState(MOCK_DASH_STOCK.boostTokens);
  const [perfMetric, setPerfMetric] = useState<PerfMetric>("views");
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg]   = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) router.replace("/dealer-portal/login");
    else if (!isDealer && !isSwissVans && !isAdmin) router.replace(persona.accountHref);
  }, [isLoggedIn, isDealer, isSwissVans, isAdmin, persona, router]);

  if (!isLoggedIn || (!isDealer && !isSwissVans && !isAdmin)) return null;

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }
  function replyToLead(id: string) {
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, read: true, status: "replied" as LeadStatus } : l));
    setReplyingId(null);
    showToast("Reply sent — lead marked as replied");
  }
  function boostListing(id: string) {
    if (!isSwissVans && tokens < 20) { showToast("Not enough tokens — top up to boost"); return; }
    setBoosts((prev) => prev.map((b) => b.id === id ? { ...b, boosted: true, boostedUntil: "25 Jun" } : b));
    if (!isSwissVans) setTokens((t) => t - 20);
    showToast(isSwissVans ? "Listing boosted (free owner boost)" : "Listing boosted — 20 tokens spent");
  }

  const s             = MOCK_DASH_STOCK;
  const newLeadCount  = leads.filter((l) => !l.read).length;
  const totalIssues   = MOCK_QUALITY_ISSUES.reduce((a, i) => a + i.count, 0);
  const perfTotal     = MOCK_PERF_TIMELINE.reduce((sum, d) => sum + d[perfMetric], 0);

  return (
    <div className="min-h-screen p-5 sm:p-7">

      {/* ── Toast ──────────────────────────────────────────────────────── */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-[var(--radius-lg)] bg-ink-900 px-5 py-3 text-[var(--text-sm)] font-semibold text-white shadow-[var(--shadow-lg)]">
          {toastMsg}
        </div>
      )}

      {/* ── 1. Page header ─────────────────────────────────────────────── */}
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-[var(--text-2xl)] font-extrabold text-ink-900">
              {persona.displayName}
            </h1>
            {isSwissVans && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[var(--text-xs)] font-semibold text-amber-700">
                Owner
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[var(--text-sm)] text-ink-500">
            Dealer dashboard · June 2026
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link
            href="/dealer-portal/listings"
            className="rounded-[var(--radius-md)] border border-border bg-white px-4 py-2.5 text-[var(--text-sm)] font-semibold text-ink-700 shadow-[var(--shadow-xs)] transition-all hover:border-brand-300 hover:shadow-[var(--shadow-sm)]"
          >
            Manage listings
          </Link>
          <Link
            href="/dealer-portal/add-van"
            className="rounded-[var(--radius-md)] px-4 py-2.5 text-[var(--text-sm)] font-bold text-white shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-md)]"
            style={{ background: "linear-gradient(135deg, #f47c1e 0%, #d96410 100%)" }}
          >
            + Add van
          </Link>
        </div>
      </div>

      {/* ── 2. KPI cards ───────────────────────────────────────────────── */}
      <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KPICard
          label="Total stock"
          value={s.total}
          sub={`${s.advertised} advertised`}
          href="/dealer-portal/listings"
        />
        <KPICard
          label="Advertised"
          value={s.advertised}
          sub={`${s.total - s.advertised} unadvertised`}
          href="/dealer-portal/listings?status=live"
          warn={s.total - s.advertised > 0}
        />
        <KPICard
          label="Sold this month"
          value={s.soldThisMonth}
          sub="June 2026"
          href="/dealer-portal/analytics"
        />
        <KPICard
          label="Avg days to sell"
          value={s.avgDaysToSell}
          sub="last 3 months"
          href="/dealer-portal/analytics"
          suffix="d"
        />
        <ScoreCard
          score={s.qualityScore}
          issues={totalIssues}
          href="#listing-quality"
        />
      </div>

      {/* ── 3. Performance chart ───────────────────────────────────────── */}
      <section className="mb-7 rounded-[var(--radius-xl)] border border-border bg-white p-6 shadow-[var(--shadow-xs)]">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-[var(--text-lg)] font-bold text-ink-900">Advert performance</h2>
            <p className="text-[var(--text-xs)] text-ink-500">Last 30 days</p>
          </div>
          {/* Metric selector — pill tabs */}
          <div className="flex rounded-[var(--radius-lg)] border border-border bg-surface-1 p-1 gap-1">
            {(["views", "leads", "appearances"] as PerfMetric[]).map((m) => (
              <button
                key={m}
                onClick={() => setPerfMetric(m)}
                className={`rounded-[var(--radius-md)] px-3 py-1.5 text-[var(--text-xs)] font-semibold capitalize transition-all ${
                  perfMetric === m
                    ? "bg-white text-ink-900 shadow-[var(--shadow-xs)]"
                    : "text-ink-500 hover:text-ink-700"
                }`}
              >
                {m === "appearances" ? "Appearances" : m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Metric totals */}
        <div className="mb-5 flex gap-7">
          {(["views", "leads", "appearances"] as PerfMetric[]).map((m) => {
            const total = MOCK_PERF_TIMELINE.reduce((s, d) => s + d[m], 0);
            const active = m === perfMetric;
            const col = m === "views" ? "text-brand-600" : m === "leads" ? "text-success-600" : "text-purple-700";
            return (
              <button
                key={m}
                onClick={() => setPerfMetric(m)}
                className={`text-left transition-opacity ${active ? "opacity-100" : "opacity-35 hover:opacity-60"}`}
              >
                <div className={`font-display text-[var(--text-xl)] font-extrabold ${active ? col : "text-ink-900"}`}>
                  {total.toLocaleString()}
                </div>
                <div className="text-[var(--text-xs)] text-ink-500 capitalize">
                  {m === "appearances" ? "Search appearances" : m}
                </div>
              </button>
            );
          })}
        </div>

        <PerfBars data={MOCK_PERF_TIMELINE} metric={perfMetric} />

        {/* Per-listing table */}
        <div className="mt-6 overflow-x-auto">
          <p className="mb-2.5 text-[var(--text-2xs)] font-bold uppercase tracking-[var(--tracking-eyebrow)] text-ink-400">
            Per-listing breakdown
          </p>
          <table className="w-full text-[var(--text-xs)]">
            <thead>
              <tr className="border-b border-border text-left">
                {["Listing", "Views", "Leads", "Appearances", "Days listed"].map((h, i) => (
                  <th key={h} className={`pb-2 font-semibold text-ink-400 ${i > 0 ? "pr-4 text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_LISTING_PERF.map((p) => (
                <tr key={p.id} className={`hover:bg-surface-1 ${p.aged ? "bg-warning-tint/40" : ""}`}>
                  <td className="py-2.5">
                    <span className="font-medium text-ink-800">{p.van}</span>
                    {p.aged && (
                      <span className="ml-2 rounded-full bg-amber-100 px-1.5 py-0.5 text-[var(--text-2xs)] font-semibold text-amber-700">
                        Aged
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4 text-right text-ink-600">{p.views.toLocaleString()}</td>
                  <td className="py-2.5 pr-4 text-right">
                    <span className={p.leads > 0 ? "font-bold text-success-600" : "text-ink-400"}>{p.leads}</span>
                  </td>
                  <td className="py-2.5 pr-4 text-right text-ink-500">{p.appearances.toLocaleString()}</td>
                  <td className="py-2.5 text-right">
                    <span className={p.aged ? "font-semibold text-warning-600" : "text-ink-500"}>{p.daysListed}d</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end">
          <Link href="/dealer-portal/analytics" className="text-[var(--text-xs)] font-semibold text-brand-600 hover:underline">
            Full analytics →
          </Link>
        </div>
      </section>

      {/* ── 4. Leads + Sidebar ─────────────────────────────────────────── */}
      <div className="mb-7 grid gap-6 lg:grid-cols-3">

        {/* Leads feed */}
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-[var(--text-lg)] font-bold text-ink-900">
              Recent leads
              {newLeadCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-brand-500 px-2.5 py-0.5 text-[var(--text-xs)] font-bold text-white">
                  {newLeadCount} new
                </span>
              )}
            </h2>
            <Link href="/dealer-portal/leads" className="text-[var(--text-xs)] font-semibold text-brand-600 hover:underline">
              View all →
            </Link>
          </div>

          <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-white shadow-[var(--shadow-xs)]">
            <ul className="divide-y divide-border">
              {leads.map((lead) => (
                <li
                  key={lead.id}
                  className={`flex items-start gap-3 px-4 py-3.5 ${!lead.read ? "bg-brand-50/70" : ""}`}
                >
                  <div className={`mt-2 size-2 shrink-0 rounded-full ${!lead.read ? "bg-brand-500" : "bg-transparent"}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <ChannelTag channel={lead.channel} />
                      <LeadStatusBadge status={lead.status} />
                    </div>
                    <p className="mt-1 truncate text-[var(--text-sm)] font-semibold text-ink-900">{lead.buyer}</p>
                    <p className="truncate text-[var(--text-xs)] text-ink-500">{lead.van} · {lead.time}</p>
                  </div>
                  {lead.status !== "closed" && (
                    <div className="shrink-0">
                      {replyingId === lead.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => replyToLead(lead.id)}
                            className="rounded-[var(--radius-sm)] bg-brand-500 px-2.5 py-1 text-[var(--text-2xs)] font-bold text-white hover:bg-brand-600"
                          >
                            Send ↵
                          </button>
                          <button
                            onClick={() => setReplyingId(null)}
                            className="rounded-[var(--radius-sm)] border border-border px-2 py-1 text-[var(--text-2xs)] text-ink-500 hover:border-ink-400"
                            aria-label="Cancel reply"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyingId(lead.id)}
                          className="rounded-[var(--radius-sm)] border border-border px-3 py-1.5 text-[var(--text-2xs)] font-semibold text-ink-600 transition-colors hover:border-brand-400 hover:text-brand-700"
                        >
                          {lead.status === "replied" ? "Follow up" : "Reply"}
                        </button>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {!isSwissVans && (
            <div className="mt-4 flex items-center justify-between rounded-[var(--radius-xl)] border border-brand-200 bg-brand-tint px-5 py-4">
              <div>
                <p className="text-[var(--text-sm)] font-bold text-brand-700">Unlock instant WhatsApp leads</p>
                <p className="text-[var(--text-xs)] text-brand-600/80">
                  Dealski Pro routes enquiries straight to your WhatsApp.
                </p>
              </div>
              <Link
                href="/dealer-portal/account"
                className="shrink-0 rounded-[var(--radius-md)] px-4 py-2 text-[var(--text-xs)] font-bold text-white"
                style={{ background: "linear-gradient(135deg, #1b5aa8 0%, #0d2d5a 100%)" }}
              >
                Upgrade →
              </Link>
            </div>
          )}
        </section>

        {/* Sidebar: Quality + Boost */}
        <div className="space-y-5">

          {/* Listing quality */}
          <section id="listing-quality" className="rounded-[var(--radius-xl)] border border-border bg-white p-5 shadow-[var(--shadow-xs)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-[var(--text-base)] font-bold text-ink-900">Listing quality</h2>
              {totalIssues > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[var(--text-2xs)] font-bold text-amber-700">
                  {totalIssues} to fix
                </span>
              )}
            </div>
            <ul className="space-y-2">
              {MOCK_QUALITY_ISSUES.map((issue) => (
                <li key={issue.type}>
                  <Link
                    href={issue.href}
                    className={`flex items-center justify-between rounded-[var(--radius-lg)] border px-3 py-2.5 text-[var(--text-xs)] transition-shadow hover:shadow-[var(--shadow-xs)] ${
                      issue.severity === "error"
                        ? "border-danger-500/20 bg-danger-tint/60"
                        : "border-amber-200 bg-amber-50"
                    }`}
                  >
                    <div>
                      <p className={`font-semibold ${issue.severity === "error" ? "text-danger-700" : "text-amber-800"}`}>
                        {issue.label}
                      </p>
                      <p className="text-[var(--text-2xs)] text-ink-500">{issue.detail}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[var(--text-2xs)] font-bold ${
                      issue.severity === "error" ? "bg-danger-tint text-danger-700" : "bg-amber-200 text-amber-800"
                    }`}>
                      {issue.count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/dealer-portal/listings?filter=issues"
              className="mt-3 block text-center text-[var(--text-xs)] font-semibold text-brand-600 hover:underline"
            >
              Fix all issues →
            </Link>
          </section>

          {/* Boost listings */}
          <section className="rounded-[var(--radius-xl)] border border-border bg-white p-5 shadow-[var(--shadow-xs)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-[var(--text-base)] font-bold text-ink-900">Boost listings</h2>
              <div className="text-right">
                <p className="font-display text-[var(--text-lg)] font-extrabold text-ink-900">{tokens}</p>
                <p className="text-[var(--text-2xs)] text-ink-500">{isSwissVans ? "free (owner)" : "tokens"}</p>
              </div>
            </div>

            {isSwissVans && (
              <p className="mb-3 rounded-[var(--radius-md)] bg-amber-50 px-3 py-2 text-[var(--text-2xs)] font-semibold text-amber-700">
                Owner perk: unlimited free boosts
              </p>
            )}

            <ul className="space-y-2">
              {boosts.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2 rounded-[var(--radius-lg)] border border-border px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-[var(--text-xs)] font-semibold text-ink-800">{item.van}</p>
                    {item.boosted && item.boostedUntil && (
                      <p className="text-[var(--text-2xs)] text-success-600">Boosted until {item.boostedUntil}</p>
                    )}
                  </div>
                  {item.boosted ? (
                    <span className="shrink-0 rounded-full bg-success-tint px-2 py-0.5 text-[var(--text-2xs)] font-bold text-success-700">
                      Live ✓
                    </span>
                  ) : (
                    <button
                      onClick={() => boostListing(item.id)}
                      className="shrink-0 rounded-[var(--radius-sm)] bg-brand-500 px-2.5 py-1 text-[var(--text-2xs)] font-bold text-white hover:bg-brand-600 disabled:opacity-40"
                      disabled={!isSwissVans && tokens < item.tokenCost}
                    >
                      {isSwissVans ? "Boost free" : `Boost (${item.tokenCost})`}
                    </button>
                  )}
                </li>
              ))}
            </ul>

            {!isSwissVans && tokens < 20 && (
              <Link
                href="/dealer-portal/account"
                className="mt-3 block rounded-[var(--radius-md)] border border-brand-200 bg-brand-tint px-3 py-2 text-center text-[var(--text-xs)] font-semibold text-brand-600 hover:border-brand-400"
              >
                Top up tokens →
              </Link>
            )}
          </section>

          {/* Upgrade prompt */}
          {!isSwissVans && (
            <section className="rounded-[var(--radius-xl)] border border-brand-200 bg-brand-tint px-5 py-4">
              <p className="mb-2 text-[var(--text-xs)] font-bold uppercase tracking-[var(--tracking-eyebrow)] text-brand-600">
                Upgrade to Dealski
              </p>
              <ul className="space-y-1.5">
                {["Live stock feed sync", "Finance application routing", "Part-exchange valuations", "Priority listing placement"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[var(--text-xs)] text-ink-700">
                    <span className="text-success-600 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/dealer-portal/account"
                className="mt-4 block rounded-[var(--radius-md)] py-2 text-center text-[var(--text-xs)] font-bold text-white"
                style={{ background: "linear-gradient(135deg, #1b5aa8 0%, #0d2d5a 100%)" }}
              >
                Get Dealski Pro →
              </Link>
            </section>
          )}
        </div>
      </div>

      {/* ── 5. Price position ──────────────────────────────────────────── */}
      <section className="mb-7">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-[var(--text-lg)] font-bold text-ink-900">Price position</h2>
            <p className="text-[var(--text-xs)] text-ink-500">How your prices compare to the market</p>
          </div>
          <Link href="/dealer-portal/listings" className="text-[var(--text-xs)] font-semibold text-brand-600 hover:underline">
            Edit prices →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_PRICE_INDICATORS.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-2.5 rounded-[var(--radius-xl)] border border-border bg-white px-5 py-4 shadow-[var(--shadow-xs)]"
            >
              <p className="truncate text-[var(--text-sm)] font-semibold text-ink-800">{p.van}</p>
              <div className="flex items-center justify-between">
                <PriceBadge position={p.position} />
                <span className="font-display text-[var(--text-base)] font-bold text-ink-900">
                  £{p.price.toLocaleString()}
                </span>
              </div>
              <p className="text-[var(--text-2xs)] text-ink-500">
                Market avg: £{p.marketPrice.toLocaleString()} ·{" "}
                {p.delta < 0 ? (
                  <span className="font-semibold text-success-600">{Math.abs(p.delta)}% below</span>
                ) : (
                  <span className={`font-semibold ${p.delta > 10 ? "text-danger-600" : "text-warning-600"}`}>
                    {p.delta}% above
                  </span>
                )}
              </p>
              {p.position === "high" && (
                <Link
                  href="/dealer-portal/listings"
                  className="rounded-[var(--radius-sm)] border border-danger-500/20 bg-danger-tint px-3 py-1.5 text-center text-[var(--text-2xs)] font-semibold text-danger-700 hover:bg-danger-tint/80"
                >
                  Review price →
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Upgrade banner (non-Swiss-Vans) ─────────────────────────── */}
      {!isSwissVans && (
        <section
          className="overflow-hidden rounded-[var(--radius-2xl)] px-8 py-8 text-white shadow-[var(--shadow-md)]"
          style={{ background: "linear-gradient(135deg, #0d2d5a 0%, #1b5aa8 100%)" }}
        >
          <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-1 text-[var(--text-xs)] font-bold uppercase tracking-[var(--tracking-eyebrow)] text-white/50">
                Dealski Pro
              </p>
              <h3 className="font-display text-[var(--text-2xl)] font-extrabold">
                Supercharge your dealership
              </h3>
              <p className="mt-2 max-w-md text-[var(--text-sm)] text-white/75">
                Sync your stock automatically, route finance applications from listing pages, and get
                your vans in front of more buyers with priority placement.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/dealer-portal/account"
                  className="rounded-[var(--radius-md)] bg-white px-5 py-2.5 text-[var(--text-sm)] font-bold text-brand-700 hover:bg-brand-50"
                >
                  See Dealski plans →
                </Link>
                <a
                  href="https://dealski.co.uk"
                  className="rounded-[var(--radius-md)] border border-white/25 px-5 py-2.5 text-[var(--text-sm)] font-semibold text-white/90 hover:border-white/50"
                >
                  Learn more
                </a>
              </div>
            </div>
            <ul className="grid grid-cols-2 gap-3">
              {[
                { icon: "⚡", label: "Instant stock sync",  desc: "Push from Dealski in seconds" },
                { icon: "💬", label: "WhatsApp leads",      desc: "Enquiries to your phone" },
                { icon: "£",  label: "Finance on listing",  desc: "HP/PCP quotes inline" },
                { icon: "⇄",  label: "PX valuations",       desc: "Offer part-exchange online" },
              ].map((f) => (
                <div key={f.label} className="flex items-start gap-2.5 rounded-[var(--radius-lg)] bg-white/10 px-3 py-3">
                  <span className="text-lg leading-none">{f.icon}</span>
                  <div>
                    <p className="text-[var(--text-xs)] font-bold text-white">{f.label}</p>
                    <p className="text-[var(--text-2xs)] text-white/55">{f.desc}</p>
                  </div>
                </div>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
