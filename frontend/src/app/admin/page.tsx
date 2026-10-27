"use client";

import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  IndianRupee,
  Medal,
  RefreshCw,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { adminFetch, formatDateTime, formatInrFromPaise, getFastAdminToken } from "../../lib/admin-api";
import { AdminEmpty, AdminPageHeader, AdminPanel, AdminStat, CustomerStatusDot } from "./ui";

type EventBreakdown = {
  eventId: string;
  slug: string;
  title: string;
  status: string;
  priceInPaise: number;
  totalRegistrations: number;
  paidCount: number;
  pendingCount: number;
  revenueInPaise: number;
  revenueInr: number;
  conversionRate: number;
  sharePercent: number;
};

type DailyTrend = {
  date: string;
  label: string;
  revenuePaise: number;
  revenueInr: number;
  regsCount: number;
  paidCount: number;
};

type Overview = {
  timeRange: "today" | "3d" | "7d" | "30d" | "all";
  eventId: string | null;
  stats: {
    revenueInPaise: number;
    revenueInr: number;
    registrations: number;
    confirmedRegs: number;
    pendingPayment: number;
    paidCount: number;
    avgOrderValueInr: number;
    conversionRate: number;
    events: number;
    openEvents: number;
    pendingProofs: number;
    certificates: number;
    medalsPending: number;
    users: number;
  };
  eventBreakdown: EventBreakdown[];
  dailyTrend: DailyTrend[];
  allEvents: Array<{ id: string; slug: string; title: string; status: string }>;
  recentRegistrations: Array<{
    id: string;
    bibNumber: string;
    distance: string;
    status: string;
    registeredAt: string;
    user: { name: string; email: string };
    event: { title: string; slug: string };
    payment?: { status: string; amountInPaise: number } | null;
  }>;
  recentPayments: Array<{
    id: string;
    status: string;
    amountInPaise: number;
    createdAt: string;
    registration: {
      bibNumber: string;
      user: { name: string };
      event: { title: string };
    };
  }>;
};

const TIME_RANGES = [
  { key: "today", label: "Today" },
  { key: "3d", label: "Past 3 Days" },
  { key: "7d", label: "Past 7 Days" },
  { key: "30d", label: "This Month (30d)" },
  { key: "all", label: "All Time" },
] as const;

let cachedOverviewData: Overview | null = null;

export default function AdminOverviewPage() {
  const { getToken, isSignedIn } = useAuth();
  const [data, setData] = useState<Overview | null>(() => cachedOverviewData);
  const [loading, setLoading] = useState(!cachedOverviewData);
  const [error, setError] = useState<string | null>(null);

  // Default to 30d (This Month) so all active revenue, registrations, and metrics show immediately
  const [selectedRange, setSelectedRange] = useState<"today" | "3d" | "7d" | "30d" | "all">("30d");
  const [selectedEventId, setSelectedEventId] = useState<string>("all");

  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!cachedOverviewData) {
      setLoading(true);
    }
    try {
      const token = await getFastAdminToken(getToken, isSignedIn);
      const queryParams = new URLSearchParams();
      queryParams.set("range", selectedRange);
      if (selectedEventId && selectedEventId !== "all") {
        queryParams.set("eventId", selectedEventId);
      }

      const json = await adminFetch<{ data: Overview }>(`/api/admin/overview?${queryParams.toString()}`, token);
      cachedOverviewData = json.data;
      setData(json.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin metrics");
    } finally {
      setLoading(false);
    }
  }, [getToken, isSignedIn, selectedEventId, selectedRange]);

  async function handleSyncRazorpay() {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const token = await getFastAdminToken(getToken, isSignedIn);
      const json = await adminFetch<{
        data: { synced: number; totalPaid: number; totalRevenue: number; message: string };
      }>("/api/admin/payments/sync", token, { method: "POST" });
      setSyncMessage(json.data.message);
      await load();
      setTimeout(() => setSyncMessage(null), 6000);
    } catch (err) {
      setSyncMessage(err instanceof Error ? err.message : "Sync failed");
      setTimeout(() => setSyncMessage(null), 6000);
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    void load();
  }, [load]);

  if (error) {
    return (
      <div>
        <AdminPageHeader title="Executive Overview" description="Could not load live metrics." />
        <div className="admin-panel admin-panel-pad">
          <p className="admin-danger" style={{ margin: 0 }}>
            {error}
          </p>
          <button className="btn btn-secondary" onClick={() => void load()} style={{ marginTop: "0.85rem" }} type="button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const maxDailyRev = data ? Math.max(...data.dailyTrend.map((d) => d.revenueInr), 100) : 100;

  return (
    <div className="admin-stack pb-12">
      {/* ── TOP HEADER WITH CONTROLS ──────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-(--line) pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500 font-bold text-xs">
              <Sparkles className="h-4 w-4" />
            </span>
            <p className="admin-kicker mb-0">Executive Analytics</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1 text-(--foreground)">
            Revenue & Performance
          </h1>
          <p className="text-xs sm:text-sm text-(--muted) mt-0.5">
            Real-time breakdown of event revenue, conversions, and fulfillment pipeline.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => void handleSyncRazorpay()}
            disabled={syncing}
            className="btn btn-secondary h-9 px-3 text-xs flex items-center gap-1.5 cursor-pointer text-amber-500 hover:text-amber-400 border-amber-500/30"
            title="Reconcile captured payments from Razorpay and sync user accounts"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Syncing..." : "Sync Users & Payments"}</span>
          </button>
          <button
            onClick={() => void load()}
            disabled={loading}
            className="btn btn-secondary h-9 px-3 text-xs flex items-center gap-1.5 cursor-pointer"
            type="button"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link className="btn btn-secondary h-9 px-3 text-xs" href="/admin/proofs">
            Review Proofs ({data?.stats.pendingProofs ?? 0})
          </Link>
          <Link className="btn btn-primary h-9 px-3 text-xs" href="/admin/events">
            + New Event
          </Link>
        </div>
      </div>

      {syncMessage && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-medium text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* ── FILTER TOOLBAR (Time Range & Event Filter) ───────── */}
      <div className="rounded-2xl border border-(--line) bg-(--panel) p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Time Range Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-(--muted) mr-1 flex items-center gap-1 shrink-0">
              <Clock className="h-3 w-3 text-(--sage)" /> Range:
            </span>
            {TIME_RANGES.map((t) => {
              const active = selectedRange === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setSelectedRange(t.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    active
                      ? "bg-(--sage) text-(--on-accent) shadow-sm"
                      : "border border-(--line) bg-(--panel-soft) text-(--muted) hover:border-(--sage)/30 hover:text-(--foreground)"
                  }`}
                  type="button"
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Event Filter Dropdown */}
          <div className="flex items-center gap-2 min-w-0 sm:min-w-64">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-(--muted) flex items-center gap-1 shrink-0">
              <Filter className="h-3 w-3 text-(--sage)" /> Event:
            </span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="input text-xs font-medium h-9 w-full"
            >
              <option value="all">All Events (Combined)</option>
              {data?.allEvents.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.status})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── KPI METRICS CARDS ─────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Revenue
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600">
              <IndianRupee className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black tabular-nums text-(--foreground)">
              {formatInrFromPaise(data?.stats.revenueInPaise ?? 0)}
            </div>
            <p className="text-[0.65rem] text-(--muted) mt-0.5">
              Avg ₹{data?.stats.avgOrderValueInr ?? 0} / order
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-(--line) bg-(--panel) p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-(--muted)">
              Registrations
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-(--panel-soft) text-(--sage)">
              <Users className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black tabular-nums text-(--foreground)">
              {data?.stats.registrations ?? 0}
            </div>
            <p className="text-[0.65rem] text-(--muted) mt-0.5">
              {data?.stats.confirmedRegs ?? 0} paid · {data?.stats.pendingPayment ?? 0} pending
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-(--line) bg-(--panel) p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-(--muted)">
              Conversion
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-(--panel-soft) text-emerald-500">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black tabular-nums text-emerald-600 dark:text-emerald-400">
              {data?.stats.conversionRate ?? 0}%
            </div>
            <p className="text-[0.65rem] text-(--muted) mt-0.5">Paid vs Total</p>
          </div>
        </div>

        <div className="rounded-2xl border border-(--line) bg-(--panel) p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-(--muted)">
              Proof Queue
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-(--panel-soft) text-amber-500">
              <Clock className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black tabular-nums text-(--foreground)">
              {data?.stats.pendingProofs ?? 0}
            </div>
            <p className="text-[0.65rem] text-(--muted) mt-0.5">
              <Link href="/admin/proofs" className="text-(--sage) hover:underline">
                Review queue →
              </Link>
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-(--line) bg-(--panel) p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-(--muted)">
              Medals Out
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-(--panel-soft) text-(--sage)">
              <Medal className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black tabular-nums text-(--foreground)">
              {data?.stats.medalsPending ?? 0}
            </div>
            <p className="text-[0.65rem] text-(--muted) mt-0.5">
              <Link href="/admin/medals" className="text-(--sage) hover:underline">
                Ready to ship →
              </Link>
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-(--line) bg-(--panel) p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-(--muted)">
              Certificates
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-(--panel-soft) text-(--sage)">
              <Trophy className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black tabular-nums text-(--foreground)">
              {data?.stats.certificates ?? 0}
            </div>
            <p className="text-[0.65rem] text-(--muted) mt-0.5">Generated</p>
          </div>
        </div>
      </div>

      {/* ── 7-DAY REVENUE TRAJECTORY (Visual Chart) ────────────── */}
      {data?.dailyTrend && data.dailyTrend.length > 0 && (
        <div className="rounded-2xl border border-(--line) bg-(--panel) p-4 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-(--foreground) flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-(--sage)" /> 7-Day Revenue & Daily Order Activity
              </h2>
              <p className="text-xs text-(--muted) mt-0.5">Daily paid collections across active events</p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-500">
              Total {TIME_RANGES.find((t) => t.key === selectedRange)?.label}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-36 pt-6 pb-2 border-b border-(--line)">
            {data.dailyTrend.map((day) => {
              const heightPercent = Math.max(8, Math.min(100, Math.round((day.revenueInr / maxDailyRev) * 100)));
              return (
                <div key={day.date} className="flex flex-col items-center gap-1.5 h-full justify-end group relative">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 pointer-events-none group-hover:opacity-100 absolute -top-10 bg-slate-900 text-white text-[0.65rem] font-bold py-1 px-2 rounded-lg shadow-lg transition-opacity whitespace-nowrap z-20">
                    ₹{day.revenueInr.toLocaleString("en-IN")} · {day.paidCount} orders
                  </div>

                  <div className="text-[0.6rem] sm:text-xs font-mono font-bold text-(--foreground) opacity-75">
                    {day.revenueInr > 0 ? `₹${day.revenueInr >= 1000 ? `${(day.revenueInr / 1000).toFixed(1)}k` : day.revenueInr}` : "—"}
                  </div>

                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-10 rounded-t-lg transition-all duration-300 ${
                      day.revenueInr > 0
                        ? "bg-gradient-to-t from-amber-500 to-yellow-400 group-hover:brightness-110 shadow-xs"
                        : "bg-(--panel-soft) border border-dashed border-(--line)"
                    }`}
                  />
                  <span className="text-[0.6rem] sm:text-xs font-semibold text-(--muted) tracking-tight">
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── PER-EVENT REVENUE & PERFORMANCE BREAKDOWN ─────────── */}
      <div className="rounded-2xl border border-(--line) bg-(--panel) overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-(--line) bg-(--panel-soft)/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-(--foreground)">
              Event-Wise Revenue Breakdown ({TIME_RANGES.find((t) => t.key === selectedRange)?.label})
            </h2>
            <p className="text-xs text-(--muted) mt-0.5">
              Individual revenue, participant count, and paid conversion for every event.
            </p>
          </div>
          <Link href="/admin/events" className="btn btn-secondary h-8 px-3 text-xs w-fit">
            Manage All Events <ArrowUpRight className="h-3 w-3 ml-1" />
          </Link>
        </div>

        <div className="overflow-x-auto touch-pan-x" style={{ WebkitOverflowScrolling: "touch" }}>
          <table className="w-full min-w-140 sm:min-w-160 text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-(--line) bg-(--panel-soft)/70 text-[0.65rem] font-bold uppercase tracking-wider text-(--muted)">
                <th className="px-4 py-3">Event Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Revenue (₹)</th>
                <th className="px-4 py-3">Registrations</th>
                <th className="px-4 py-3">Paid / Unpaid</th>
                <th className="px-4 py-3">Conversion</th>
                <th className="px-4 py-3">Revenue Share</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.eventBreakdown.map((ev) => (
                <tr key={ev.eventId} className="border-b border-(--line) last:border-b-0 hover:bg-(--panel-soft)/60 transition-colors">
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-(--foreground)">{ev.title}</p>
                    <p className="text-[0.65rem] text-(--muted) font-mono">/{ev.slug}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider ${
                        ev.status === "OPEN"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-slate-500/10 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {ev.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-bold font-mono text-amber-600 dark:text-amber-400 text-sm">
                      {formatInrFromPaise(ev.revenueInPaise)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-bold font-mono text-(--foreground)">
                    {ev.totalRegistrations}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-(--muted)">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{ev.paidCount} Paid</span>
                    {" · "}
                    <span className="text-amber-500">{ev.pendingCount} Pending</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-(--line) overflow-hidden">
                        <div
                          style={{ width: `${ev.conversionRate}%` }}
                          className="h-full bg-emerald-500 rounded-full"
                        />
                      </div>
                      <span className="font-mono text-xs font-bold">{ev.conversionRate}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-(--muted)">
                    {ev.sharePercent}%
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Link
                      href={`/admin/events/${ev.eventId}`}
                      className="text-xs font-bold text-(--sage) hover:underline inline-flex items-center gap-1"
                    >
                      Manage <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── RECENT REGISTRATIONS & RECENT PAYMENTS SPLIT ───────── */}
      <div className="admin-split">
        <AdminPanel
          fill
          action={
            <Link className="admin-link" href="/admin/registrations">
              View all
            </Link>
          }
          title="Recent registrations"
          subtitle="Latest runners who joined"
        >
          {data?.recentRegistrations.length === 0 ? (
            <AdminEmpty>No registrations in this time window.</AdminEmpty>
          ) : (
            <div className="admin-list is-stretch">
              {data?.recentRegistrations.map((row) => (
                <Link className="admin-list-item" href={`/admin/registrations/${row.id}`} key={row.id}>
                  <div>
                    <div className="title flex items-center gap-2">
                      <CustomerStatusDot
                        isPaid={
                          row.payment?.status === "PAID" ||
                          row.status === "CONFIRMED" ||
                          row.status === "COMPLETED"
                        }
                      />
                      <span>{row.user.name}</span>
                    </div>
                    <div className="sub pl-4.5">
                      {row.event.title} · {row.distance} · {row.bibNumber}
                    </div>
                  </div>
                  <div className="right">
                    <span className="badge">{row.status}</span>
                    <div className="sub" style={{ marginTop: "0.35rem" }}>
                      {formatDateTime(row.registeredAt)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </AdminPanel>

        <AdminPanel
          fill
          action={
            <Link className="admin-link" href="/admin/payments">
              View all
            </Link>
          }
          title="Recent payments"
          subtitle="Latest successful transactions"
        >
          {data?.recentPayments.length === 0 ? (
            <AdminEmpty>No payments in this time window.</AdminEmpty>
          ) : (
            <div className="admin-list is-stretch">
              {data?.recentPayments.map((row) => (
                <div className="admin-list-item" key={row.id}>
                  <div>
                    <div className="title flex items-center gap-2">
                      <CustomerStatusDot isPaid={row.status === "PAID"} />
                      <span>{row.registration.user.name}</span>
                    </div>
                    <div className="sub pl-4.5">
                      {row.registration.event.title} · {row.registration.bibNumber}
                    </div>
                  </div>
                  <div className="right">
                    <div className="title font-bold text-emerald-600 dark:text-emerald-400">
                      {formatInrFromPaise(row.amountInPaise)}
                    </div>
                    <div style={{ marginTop: "0.35rem" }}>
                      <span className="badge">{row.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminPanel>
      </div>
    </div>
  );
}
