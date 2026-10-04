"use client";

import { useAuth } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronRight,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Filter,
  Loader2,
  MapPin,
  Medal,
  Package,
  Phone,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Truck,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { adminFetch } from "../../../lib/admin-api";
import { getApiUrl } from "../../../lib/api";
import { AdminEmpty, AdminPageHeader } from "../ui";

type DispatchItem = {
  id: string; // registration id
  bibNumber: string;
  distance: string;
  activityType: string;
  finishTimeSeconds: number | null;
  registeredAt: string;
  status: "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  proofStatus: "NOT_SUBMITTED" | "SUBMITTED" | "APPROVED" | "REJECTED";
  shippingName: string;
  shippingPhone: string;
  shippingLine1: string;
  shippingLine2: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  user: { id: string; name: string; email: string; phone: string | null };
  event: { id: string; title: string; slug: string };
  proofUpload?: {
    id: string;
    activityImageUrl: string;
    sourceApp: string;
    submittedAt: string;
    reviewedAt: string | null;
    reviewerNote: string | null;
  } | null;
  certificate?: {
    id: string;
    certificateNumber: string;
    status: string;
    pdfUrl: string | null;
  } | null;
  medalDelivery?: {
    id: string;
    status: "PENDING" | "DISPATCHED" | "DELIVERED" | "RETURNED" | "NOT_ELIGIBLE";
    courier: string | null;
    trackingNumber: string | null;
    trackingUrl: string | null;
    dispatchedAt: string | null;
    deliveredAt: string | null;
  } | null;
};

type EventOption = {
  id: string;
  title: string;
  slug: string;
};

type DispatchStats = {
  readyCount: number;
  dispatchedCount: number;
  deliveredCount: number;
  approvedCount: number;
};

const COURIER_PRESETS = [
  "Delhivery",
  "Shiprocket",
  "India Post (Speed Post)",
  "DTDC",
  "BlueDart",
  "Shadowfax",
  "Xpressbees",
  "Other",
];

function formatTime(seconds: number | null | undefined): string {
  if (seconds == null || seconds <= 0) return "--:--:--";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function AdminMedalDispatchPage() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<DispatchItem[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [stats, setStats] = useState<DispatchStats>({
    readyCount: 0,
    dispatchedCount: 0,
    deliveredCount: 0,
    approvedCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusTab, setStatusTab] = useState<string>("PENDING"); // PENDING | DISPATCHED | DELIVERED | ALL
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [proofFilter, setProofFilter] = useState<string>("APPROVED");

  // Selected item for drawer
  const [activeItem, setActiveItem] = useState<DispatchItem | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Drawer update state
  const [editCourier, setEditCourier] = useState("");
  const [editTrackingNumber, setEditTrackingNumber] = useState("");
  const [editTrackingUrl, setEditTrackingUrl] = useState("");
  const [editStatus, setEditStatus] = useState<string>("DISPATCHED");

  // Load events for dropdown
  useEffect(() => {
    async function loadEvents() {
      try {
        const token = await getToken().catch(() => null);
        const res = await adminFetch<{ data: EventOption[] }>("/api/admin/events?pageSize=100", token);
        setEvents(res.data || []);
      } catch {
        // ignore
      }
    }
    void loadEvents();
  }, [getToken]);

  // Main data load
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken().catch(() => null);
      const params = new URLSearchParams({ pageSize: "100" });
      if (statusTab && statusTab !== "ALL") params.set("status", statusTab);
      if (selectedEventId) params.set("eventId", selectedEventId);
      if (proofFilter && proofFilter !== "ALL") params.set("proofStatus", proofFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const json = await adminFetch<{
        data: DispatchItem[];
        meta: { stats?: DispatchStats; total: number };
      }>(`/api/admin/medals?${params.toString()}`, token);

      setItems(json.data || []);
      if (json.meta?.stats) {
        setStats(json.meta.stats);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dispatch records");
    } finally {
      setLoading(false);
    }
  }, [getToken, statusTab, selectedEventId, proofFilter, searchQuery]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadData();
    }, 250);
    return () => clearTimeout(timeout);
  }, [loadData]);

  // When drawer item opens, initialize edit form
  useEffect(() => {
    if (activeItem) {
      setEditCourier(activeItem.medalDelivery?.courier || "India Post (Speed Post)");
      setEditTrackingNumber(activeItem.medalDelivery?.trackingNumber || "");
      setEditTrackingUrl(activeItem.medalDelivery?.trackingUrl || "");
      setEditStatus(activeItem.medalDelivery?.status || "DISPATCHED");
      setCopiedAddress(false);
    }
  }, [activeItem]);

  // 1-Click CSV Export
  async function handleExportCsv() {
    setExporting(true);
    try {
      const token = await getToken().catch(() => null);
      const params = new URLSearchParams();
      if (statusTab && statusTab !== "ALL") params.set("status", statusTab);
      if (selectedEventId) params.set("eventId", selectedEventId);
      if (proofFilter && proofFilter !== "ALL") params.set("proofStatus", proofFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const url = getApiUrl(`/api/admin/medals/export.csv?${params.toString()}`);
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error("CSV export failed");
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `runnerup-medal-dispatch-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      alert(err instanceof Error ? err.message : "CSV export failed");
    } finally {
      setExporting(false);
    }
  }

  // Save dispatch updates
  async function handleSaveDispatch(e: React.FormEvent) {
    e.preventDefault();
    if (!activeItem) return;
    setUpdating(true);
    try {
      const token = await getToken().catch(() => null);
      await adminFetch(`/api/admin/medals/${activeItem.id}`, token, {
        method: "PATCH",
        body: JSON.stringify({
          status: editStatus,
          courier: editCourier.trim() || null,
          trackingNumber: editTrackingNumber.trim() || null,
          trackingUrl: editTrackingUrl.trim() || null,
        }),
      });

      // Reload list and update active item
      await loadData();
      setActiveItem((prev) =>
        prev
          ? {
            ...prev,
            medalDelivery: {
              id: prev.medalDelivery?.id || `new-${Date.now()}`,
              status: editStatus as NonNullable<DispatchItem["medalDelivery"]>["status"],
              courier: editCourier.trim() || null,
              trackingNumber: editTrackingNumber.trim() || null,
              trackingUrl: editTrackingUrl.trim() || null,
              dispatchedAt: editStatus === "DISPATCHED" ? new Date().toISOString() : prev.medalDelivery?.dispatchedAt || null,
              deliveredAt: editStatus === "DELIVERED" ? new Date().toISOString() : prev.medalDelivery?.deliveredAt || null,
            },
          }
          : null,
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update dispatch status");
    } finally {
      setUpdating(false);
    }
  }

  // Copy full address
  function handleCopyAddress() {
    if (!activeItem) return;
    const text = [
      `Recipient: ${activeItem.shippingName || activeItem.user.name}`,
      `Phone: ${activeItem.shippingPhone || activeItem.user.phone || "N/A"}`,
      `Address: ${activeItem.shippingLine1}`,
      activeItem.shippingLine2 ? activeItem.shippingLine2 : null,
      `${activeItem.shippingCity}, ${activeItem.shippingState} - ${activeItem.shippingPincode}`,
      `BIB: ${activeItem.bibNumber} | Event: ${activeItem.event.title} (${activeItem.distance})`,
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2500);
    });
  }

  const activeMedalStatus = activeItem?.medalDelivery?.status || "PENDING";

  return (
    <div className="admin-stack pb-12">
      {/* ── Top Header ── */}
      <AdminPageHeader
        kicker="Fulfillment & Logistics"
        title="Medal Dispatch Hub"
        description="Filter verified finishers, export 1-click shipping CSVs, and manage tracking IDs."
      />

      {/* ── KPI Stats Cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div
          onClick={() => setStatusTab("PENDING")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${statusTab === "PENDING"
              ? "border-(--sage) bg-(--sage)/10 shadow-sm"
              : "border-(--line) bg-(--panel) hover:border-(--line-strong)"
            }`}
        >
          <div className="flex items-center justify-between text-(--muted)">
            <span className="text-xs font-bold uppercase tracking-wider">Ready To Ship</span>
            <Package className="h-4 w-4 text-(--sage)" />
          </div>
          <p className="mt-2 text-2xl font-black text-(--foreground) sm:text-3xl">
            {stats.readyCount}
          </p>
          <p className="mt-0.5 text-[0.7rem] text-(--muted-soft)">Approved & pending dispatch</p>
        </div>

        <div
          onClick={() => setStatusTab("DISPATCHED")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${statusTab === "DISPATCHED"
              ? "border-sky-500 bg-sky-500/10 shadow-sm"
              : "border-(--line) bg-(--panel) hover:border-(--line-strong)"
            }`}
        >
          <div className="flex items-center justify-between text-(--muted)">
            <span className="text-xs font-bold uppercase tracking-wider">In Transit</span>
            <Truck className="h-4 w-4 text-sky-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-(--foreground) sm:text-3xl">
            {stats.dispatchedCount}
          </p>
          <p className="mt-0.5 text-[0.7rem] text-(--muted-soft)">Dispatched with tracking</p>
        </div>

        <div
          onClick={() => setStatusTab("DELIVERED")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${statusTab === "DELIVERED"
              ? "border-emerald-500 bg-emerald-500/10 shadow-sm"
              : "border-(--line) bg-(--panel) hover:border-(--line-strong)"
            }`}
        >
          <div className="flex items-center justify-between text-(--muted)">
            <span className="text-xs font-bold uppercase tracking-wider">Delivered</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-(--foreground) sm:text-3xl">
            {stats.deliveredCount}
          </p>
          <p className="mt-0.5 text-[0.7rem] text-(--muted-soft)">Successfully received</p>
        </div>

        <div
          onClick={() => {
            setStatusTab("ALL");
            setProofFilter("APPROVED");
          }}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${statusTab === "ALL"
              ? "border-amber-500 bg-amber-500/10 shadow-sm"
              : "border-(--line) bg-(--panel) hover:border-(--line-strong)"
            }`}
        >
          <div className="flex items-center justify-between text-(--muted)">
            <span className="text-xs font-bold uppercase tracking-wider">Total Approved</span>
            <Medal className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-(--foreground) sm:text-3xl">
            {stats.approvedCount}
          </p>
          <p className="mt-0.5 text-[0.7rem] text-(--muted-soft)">Total medal qualifiers</p>
        </div>
      </div>

      {/* ── Filter Bar & Actions ── */}
      <div className="flex flex-col gap-3 rounded-2xl border border-(--line) bg-(--panel) p-3 sm:p-4">
        {/* Row 1: Search & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-(--muted-soft)" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by BIB, Name, Phone, City, Pincode..."
              className="w-full rounded-xl border border-(--line) bg-(--panel-soft) py-2 pr-3 pl-9 text-xs text-(--foreground) outline-none transition focus:border-(--sage) sm:text-sm"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-xs text-(--muted)"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          {/* Event Filter */}
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="rounded-xl border border-(--line) bg-(--panel-soft) px-3 py-2 text-xs text-(--foreground) outline-none transition focus:border-(--sage) sm:text-sm"
          >
            <option value="">All Events</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>

          {/* Refresh button */}
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-(--line) bg-(--panel-soft) px-3 py-2 text-xs font-semibold text-(--foreground) transition hover:bg-(--line) disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          {/* 1-Click CSV Export Button */}
          <button
            type="button"
            onClick={() => void handleExportCsv()}
            disabled={exporting || items.length === 0}
            className="flex items-center gap-2 rounded-xl bg-(--sage) px-4 py-2 text-xs font-bold text-(--on-accent) shadow-sm transition hover:opacity-90 disabled:opacity-50 sm:text-sm"
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export Shipping CSV ({items.length})
              </>
            )}
          </button>
        </div>

        {/* Row 2: Status Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-t border-(--line) pt-2">
          {[
            { id: "PENDING", label: `Ready to Ship (${stats.readyCount})` },
            { id: "DISPATCHED", label: `In Transit (${stats.dispatchedCount})` },
            { id: "DELIVERED", label: `Delivered (${stats.deliveredCount})` },
            { id: "ALL", label: "All Records" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusTab(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${statusTab === tab.id
                  ? "bg-(--foreground) text-(--background)"
                  : "text-(--muted) hover:bg-(--line) hover:text-(--foreground)"
                }`}
            >
              {tab.label}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <span className="text-[0.7rem] text-(--muted-soft)">Proof:</span>
            <select
              value={proofFilter}
              onChange={(e) => setProofFilter(e.target.value)}
              className="rounded-lg border border-(--line) bg-(--panel-soft) px-2 py-1 text-[0.75rem] text-(--foreground)"
            >
              <option value="APPROVED">Approved Only</option>
              <option value="ALL">All Proofs</option>
            </select>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-semibold text-red-500">
          {error}
        </div>
      ) : null}

      {/* ── Table / Grid List ── */}
      <div className="overflow-hidden rounded-2xl border border-(--line) bg-(--panel)">
        {loading && items.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-(--muted)">
            <Loader2 className="h-6 w-6 animate-spin text-(--sage)" />
            <p className="text-xs">Loading dispatch records...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <AdminEmpty>No finishers found matching your active filters.</AdminEmpty>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-(--line) bg-(--panel-soft) text-[0.7rem] font-bold uppercase tracking-wider text-(--muted)">
                <tr>
                  <th className="py-3.5 pr-3 pl-4">BIB & Runner</th>
                  <th className="px-3 py-3.5">Shipping Address</th>
                  <th className="px-3 py-3.5">Event & Dist</th>
                  <th className="px-3 py-3.5">Finish Time</th>
                  <th className="px-3 py-3.5">Dispatch Status</th>
                  <th className="py-3.5 pr-4 pl-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--line)">
                {items.map((row) => {
                  const mStatus = row.medalDelivery?.status || "PENDING";
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setActiveItem(row)}
                      className="group cursor-pointer transition hover:bg-(--panel-soft)"
                    >
                      {/* BIB & Runner */}
                      <td className="py-3.5 pr-3 pl-4">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-(--sage)/15 text-xs font-bold text-(--sage)">
                            {row.shippingName?.[0] || row.user.name?.[0] || "R"}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-(--foreground) group-hover:text-(--sage)">
                              {row.shippingName || row.user.name}
                            </p>
                            <p className="text-[0.7rem] font-mono text-(--muted)">
                              {row.bibNumber} · {row.shippingPhone || row.user.phone || row.user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Shipping Address */}
                      <td className="px-3 py-3.5 text-xs">
                        <p className="max-w-[200px] truncate text-(--foreground)">
                          {row.shippingLine1}
                        </p>
                        <p className="text-[0.7rem] text-(--muted)">
                          {row.shippingCity}, {row.shippingState} - <span className="font-bold font-mono text-(--foreground)">{row.shippingPincode}</span>
                        </p>
                      </td>

                      {/* Event & Distance */}
                      <td className="px-3 py-3.5 text-xs">
                        <p className="font-medium text-(--foreground)">{row.event.title}</p>
                        <span className="inline-block rounded-full bg-(--panel-soft) px-2 py-0.5 text-[0.65rem] font-bold uppercase text-(--sage)">
                          {row.distance}
                        </span>
                      </td>

                      {/* Finish Time */}
                      <td className="px-3 py-3.5 font-mono text-xs font-semibold text-(--foreground)">
                        {formatTime(row.finishTimeSeconds)}
                      </td>

                      {/* Dispatch Status */}
                      <td className="px-3 py-3.5">
                        {mStatus === "PENDING" && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-amber-500">
                            <Clock className="h-3 w-3" />
                            Ready to Ship
                          </span>
                        )}
                        {mStatus === "DISPATCHED" && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-sky-400">
                            <Truck className="h-3 w-3" />
                            Dispatched
                          </span>
                        )}
                        {mStatus === "DELIVERED" && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-emerald-400">
                            <Check className="h-3 w-3" />
                            Delivered
                          </span>
                        )}
                        {mStatus === "RETURNED" && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-red-400">
                            Returned
                          </span>
                        )}
                        {row.medalDelivery?.trackingNumber ? (
                          <p className="mt-1 text-[0.65rem] font-mono text-(--muted-soft)">
                            {row.medalDelivery.courier}: {row.medalDelivery.trackingNumber}
                          </p>
                        ) : null}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 pr-4 pl-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveItem(row);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-(--line) bg-(--panel-soft) px-3 py-1.5 text-xs font-semibold text-(--foreground) transition hover:border-(--sage) hover:bg-(--sage)/10 hover:text-(--sage)"
                        >
                          View & Ship
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Slide-over Detail Console Drawer ── */}
      <AnimatePresence>
        {activeItem ? (
          <motion.div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setActiveItem(null)}
            />

            {/* Slide Sheet */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative z-10 flex h-full w-full max-w-lg flex-col overflow-hidden border-l border-(--line) bg-(--panel) shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-(--line) px-5 py-4">
                <div>
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-(--sage)">
                    Medal Dispatch Console
                  </span>
                  <h2 className="text-lg font-bold text-(--foreground)">
                    {activeItem.shippingName || activeItem.user.name}
                  </h2>
                  <p className="text-xs font-mono text-(--muted)">
                    BIB: {activeItem.bibNumber} · {activeItem.distance}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  className="grid h-8 w-8 place-items-center rounded-full text-(--muted) hover:bg-(--line) hover:text-(--foreground)"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Drawer Body Scroll */}
              <div className="flex-1 space-y-5 overflow-y-auto p-5 text-xs sm:text-sm">
                {/* 📍 Shipping Address Box */}
                <div className="rounded-xl border border-(--line) bg-(--panel-soft) p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-(--foreground)">
                      <MapPin className="h-4 w-4 text-(--sage)" />
                      Delivery Address
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyAddress}
                      className="flex items-center gap-1 rounded-lg bg-(--panel) px-2.5 py-1 text-xs font-semibold text-(--foreground) shadow-xs transition hover:bg-(--line)"
                    >
                      {copiedAddress ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 text-(--muted)" />
                          Copy Label Address
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-(--foreground)">
                    <p className="font-semibold">{activeItem.shippingName || activeItem.user.name}</p>
                    <p className="flex items-center gap-1 text-(--muted)">
                      <Phone className="h-3 w-3" />
                      {activeItem.shippingPhone || activeItem.user.phone || "No phone provided"}
                    </p>
                    <p className="mt-1 leading-5">
                      {activeItem.shippingLine1}
                      {activeItem.shippingLine2 ? `, ${activeItem.shippingLine2}` : ""}
                    </p>
                    <p className="font-bold">
                      {activeItem.shippingCity}, {activeItem.shippingState} -{" "}
                      <span className="font-mono text-sm text-(--sage)">
                        {activeItem.shippingPincode}
                      </span>
                    </p>
                  </div>
                </div>

                {/* 📸 Verified GPS Proof */}
                <div className="rounded-xl border border-(--line) bg-(--panel-soft) p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-(--foreground)">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      GPS Proof Verification
                    </span>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-400">
                      APPROVED
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-[0.65rem] text-(--muted)">Finish Time</p>
                      <p className="font-mono font-bold text-(--foreground)">
                        {formatTime(activeItem.finishTimeSeconds)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.65rem] text-(--muted)">Source App</p>
                      <p className="font-semibold text-(--foreground)">
                        {activeItem.proofUpload?.sourceApp || "GPS Screenshot"}
                      </p>
                    </div>
                  </div>

                  {activeItem.proofUpload?.activityImageUrl ? (
                    <div className="mt-3 overflow-hidden rounded-lg border border-(--line)">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={activeItem.proofUpload.activityImageUrl}
                        alt="GPS Proof screenshot"
                        className="max-h-48 w-full object-contain bg-black"
                      />
                    </div>
                  ) : (
                    <p className="mt-2 text-[0.7rem] text-(--muted-soft)">
                      No screenshot attached (Manually approved)
                    </p>
                  )}

                  {activeItem.proofUpload?.reviewerNote ? (
                    <p className="mt-2 text-[0.7rem] text-(--muted)">
                      Note: {activeItem.proofUpload.reviewerNote}
                    </p>
                  ) : null}
                </div>

                {/* 🚚 Update Tracking & Dispatch Form */}
                <form
                  onSubmit={handleSaveDispatch}
                  className="rounded-xl border border-(--line) bg-(--panel-soft) p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-(--foreground)">
                      <Truck className="h-4 w-4 text-sky-400" />
                      Update Dispatch & Tracking
                    </span>
                  </div>

                  {/* Status Selection */}
                  <div>
                    <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-(--muted)">
                      Fulfillment Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full rounded-xl border border-(--line) bg-(--panel) px-3 py-2 text-xs font-semibold text-(--foreground)"
                    >
                      <option value="PENDING">PENDING (Ready to ship)</option>
                      <option value="DISPATCHED">DISPATCHED (In Transit)</option>
                      <option value="DELIVERED">DELIVERED (Completed)</option>
                      <option value="RETURNED">RETURNED (Failed delivery)</option>
                      <option value="NOT_ELIGIBLE">NOT_ELIGIBLE</option>
                    </select>
                  </div>

                  {/* Courier Name & Presets */}
                  <div>
                    <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-(--muted)">
                      Courier Partner
                    </label>
                    <input
                      type="text"
                      value={editCourier}
                      onChange={(e) => setEditCourier(e.target.value)}
                      placeholder="e.g. Delhivery / India Post"
                      className="w-full rounded-xl border border-(--line) bg-(--panel) px-3 py-2 text-xs text-(--foreground)"
                    />
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {COURIER_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setEditCourier(preset)}
                          className={`rounded-md px-2 py-0.5 text-[0.65rem] font-semibold transition ${editCourier === preset
                              ? "bg-(--sage) text-(--on-accent)"
                              : "bg-(--line) text-(--muted) hover:text-(--foreground)"
                            }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tracking Number */}
                  <div>
                    <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-(--muted)">
                      Tracking Number / AWB
                    </label>
                    <input
                      type="text"
                      value={editTrackingNumber}
                      onChange={(e) => setEditTrackingNumber(e.target.value)}
                      placeholder="e.g. DL123456789IN"
                      className="w-full rounded-xl border border-(--line) bg-(--panel) px-3 py-2 font-mono text-xs text-(--foreground)"
                    />
                  </div>

                  {/* Tracking URL */}
                  <div>
                    <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-(--muted)">
                      Tracking URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={editTrackingUrl}
                      onChange={(e) => setEditTrackingUrl(e.target.value)}
                      placeholder="https://www.delhivery.com/track/package/..."
                      className="w-full rounded-xl border border-(--line) bg-(--panel) px-3 py-2 text-xs text-(--foreground)"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-(--sage) px-4 py-2.5 text-xs font-bold text-(--on-accent) shadow-sm transition hover:opacity-90 disabled:opacity-50"
                  >
                    {updating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Save Dispatch Details
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
