"use client";

import { useAuth } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Download,
  ExternalLink,
  FileSpreadsheet,
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
  Upload,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { adminFetch, downloadAdminExport, getFastAdminToken } from "../../../lib/admin-api";
import { optimizeCloudinaryUrl } from "../../../lib/cloudinary";
import { getApiUrl } from "../../../lib/api";
import { AdminEmpty, AdminPageHeader } from "../ui";
import { AdminEventScopeBar, EventScopeItem } from "../admin-event-scope";
import { useAdminEventScope } from "../admin-event-context";

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
  "DTDC",
  "India Post (Speed Post)",
  "BlueDart",
  "Shadowfax",
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
  const { getToken, isSignedIn } = useAuth();
  const {
    events,
    selectedEventId,
    setSelectedEventId,
    selectedEvent,
    isCancer,
    isAirForce,
    isCombined,
  } = useAdminEventScope();
  const [items, setItems] = useState<DispatchItem[]>([]);
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
  const [statusTab, setStatusTab] = useState<string>("ALL"); // Default to ALL so dispatched medals with tracking are visible immediately
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [proofFilter, setProofFilter] = useState<string>("ALL");

  // Selected item for drawer
  const [activeItem, setActiveItem] = useState<DispatchItem | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Drawer update state
  const [editCourier, setEditCourier] = useState("");
  const [editTrackingNumber, setEditTrackingNumber] = useState("");
  const [editTrackingUrl, setEditTrackingUrl] = useState("");
  const [editStatus, setEditStatus] = useState<string>("DISPATCHED");

  // Main data load
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getFastAdminToken(getToken, isSignedIn);
      const params = new URLSearchParams({ pageSize: "500" });
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
      const token = await getFastAdminToken(getToken, isSignedIn);
      const params = new URLSearchParams();
      if (statusTab && statusTab !== "ALL") params.set("status", statusTab);
      if (selectedEventId) params.set("eventId", selectedEventId);
      if (proofFilter && proofFilter !== "ALL") params.set("proofStatus", proofFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const query = params.toString() ? `?${params.toString()}` : "";
      await downloadAdminExport(
        `/api/admin/medals/export.csv${query}`,
        `runnerup-medal-dispatch-${new Date().toISOString().split("T")[0]}.csv`,
        token,
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "CSV export failed");
    } finally {
      setExporting(false);
    }
  }

  // Import Courier Sheet state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<{
    totalRows: number;
    updatedCount: number;
    delhiveryCount: number;
    dtdcCount: number;
    pendingCount: number;
    unmatchedCount: number;
  } | null>(null);

  function handleFileSelect(file: File) {
    setImportFile(file);
    setImportError(null);
    setImportSuccess(null);
  }

  async function handleExecuteImport() {
    if (!importFile) return;
    setImporting(true);
    setImportError(null);
    setImportSuccess(null);

    try {
      const token = await getFastAdminToken(getToken, isSignedIn);
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const dataUrl = (e.target?.result as string) || "";
          const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;

          const res = await adminFetch<{
            success: boolean;
            totalRows: number;
            updatedCount: number;
            delhiveryCount: number;
            dtdcCount: number;
            pendingCount: number;
            unmatchedCount: number;
            error?: string;
          }>("/api/admin/medals/import-tracking", token, {
            method: "POST",
            body: JSON.stringify({
              fileBase64: base64,
              filename: importFile.name,
              eventId: selectedEventId || undefined,
            }),
          });

          if (res.error) {
            throw new Error(res.error);
          }

          setImportSuccess({
            totalRows: res.totalRows,
            updatedCount: res.updatedCount,
            delhiveryCount: res.delhiveryCount,
            dtdcCount: res.dtdcCount,
            pendingCount: res.pendingCount,
            unmatchedCount: res.unmatchedCount,
          });

          // Refresh dispatch data
          await loadData();
        } catch (err) {
          setImportError(err instanceof Error ? err.message : "Failed to import tracking data");
        } finally {
          setImporting(false);
        }
      };

      reader.onerror = () => {
        setImportError("Failed to read file. Please retry.");
        setImporting(false);
      };

      reader.readAsDataURL(importFile);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Authentication error");
      setImporting(false);
    }
  }

  function handleCourierSelect(newCourier: string) {
    setEditCourier(newCourier);
    if (editTrackingNumber.trim()) {
      if (newCourier.toLowerCase().includes("dtdc")) {
        setEditTrackingUrl(`https://track.dtdc.com/ctrack/track?awb=${encodeURIComponent(editTrackingNumber.trim())}`);
      } else if (newCourier.toLowerCase().includes("delhivery")) {
        setEditTrackingUrl(`https://www.delhivery.com/track/package/${encodeURIComponent(editTrackingNumber.trim())}`);
      }
    }
  }

  function handleTrackingNumberInput(rawVal: string) {
    setEditTrackingNumber(rawVal);
    const val = rawVal.trim();
    if (val) {
      if (/^7D/i.test(val) || /[A-Za-z]/.test(val)) {
        setEditCourier("DTDC");
        setEditTrackingUrl(`https://track.dtdc.com/ctrack/track?awb=${encodeURIComponent(val)}`);
      } else if (/^\d{10,16}$/.test(val)) {
        setEditCourier("Delhivery");
        setEditTrackingUrl(`https://www.delhivery.com/track/package/${encodeURIComponent(val)}`);
      }
    }
  }

  const [copiedAwb, setCopiedAwb] = useState<string | null>(null);

  function handleCopyAwb(e: React.MouseEvent, awb: string, id: string) {
    e.stopPropagation();
    if (!awb) return;
    navigator.clipboard.writeText(awb).then(() => {
      setCopiedAwb(id);
      setTimeout(() => setCopiedAwb(null), 2000);
    });
  }

  function getLiveTrackingUrl(
    courier?: string | null,
    awb?: string | null,
    explicitUrl?: string | null,
  ): string {
    if (explicitUrl && explicitUrl.startsWith("http")) return explicitUrl;
    const cleanAwb = String(awb || "").trim();
    if (!cleanAwb) return "";

    const c = String(courier || "").toLowerCase();
    if (c.includes("dtdc") || /^7D/i.test(cleanAwb)) {
      return `https://track.dtdc.com/ctrack/track?awb=${encodeURIComponent(cleanAwb)}`;
    }
    if (c.includes("post") || c.includes("speed")) {
      return "https://www.indiapost.gov.in/_layouts/15/dpt.cept.tracking/trackconsignment.aspx";
    }
    // Default: Delhivery
    return `https://www.delhivery.com/track/package/${encodeURIComponent(cleanAwb)}`;
  }

  // Save dispatch updates
  async function handleSaveDispatch(e: React.FormEvent) {
    e.preventDefault();
    if (!activeItem) return;
    setUpdating(true);
    try {
      const token = await getFastAdminToken(getToken, isSignedIn);
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

      {/* ── Event Scope Switcher & Challenge Dates ── */}
      <AdminEventScopeBar
        events={events}
        selectedEventId={selectedEventId}
        onSelectEvent={(id) => setSelectedEventId(id === "all" ? "" : id)}
        sectionName="Medal Logistics"
        totalCount={stats.readyCount + stats.dispatchedCount + stats.deliveredCount}
        paidCount={stats.approvedCount}
      />

      {/* ── KPI Stats Cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div
          onClick={() => setStatusTab("DISPATCHED")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${statusTab === "DISPATCHED"
              ? "border-sky-500 bg-sky-500/15 shadow-sm ring-1 ring-sky-500/50"
              : "border-(--line) bg-(--panel) hover:border-(--line-strong)"
            }`}
        >
          <div className="flex items-center justify-between text-(--muted)">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">In Transit (Dispatched)</span>
            <Truck className="h-4 w-4 text-sky-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-sky-400 sm:text-3xl">
            {stats.dispatchedCount}
          </p>
          <p className="mt-0.5 text-[0.7rem] text-(--muted-soft)">Dispatched with live courier tracking</p>
        </div>

        <div
          onClick={() => setStatusTab("ALL")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${statusTab === "ALL"
              ? "border-amber-500 bg-amber-500/15 shadow-sm ring-1 ring-amber-500/50"
              : "border-(--line) bg-(--panel) hover:border-(--line-strong)"
            }`}
        >
          <div className="flex items-center justify-between text-(--muted)">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Total Qualifiers</span>
            <Medal className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-(--foreground) sm:text-3xl">
            {stats.approvedCount}
          </p>
          <p className="mt-0.5 text-[0.7rem] text-(--muted-soft)">All confirmed finishers</p>
        </div>

        <div
          onClick={() => setStatusTab("PENDING")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${statusTab === "PENDING"
              ? "border-amber-500 bg-amber-500/10 shadow-sm ring-1 ring-amber-500/40"
              : "border-(--line) bg-(--panel) hover:border-(--line-strong)"
            }`}
        >
          <div className="flex items-center justify-between text-(--muted)">
            <span className="text-xs font-bold uppercase tracking-wider">Awaiting Dispatch</span>
            <Package className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-(--foreground) sm:text-3xl">
            {stats.readyCount}
          </p>
          <p className="mt-0.5 text-[0.7rem] text-(--muted-soft)">No AWB assigned yet</p>
        </div>

        <div
          onClick={() => setStatusTab("DELIVERED")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${statusTab === "DELIVERED"
              ? "border-emerald-500 bg-emerald-500/10 shadow-sm ring-1 ring-emerald-500/40"
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
          <p className="mt-0.5 text-[0.7rem] text-(--muted-soft)">Successfully received by runners</p>
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

          {/* 📥 Import Courier Tracking Sheet Button */}
          <button
            type="button"
            onClick={() => {
              setImportModalOpen(true);
              setImportFile(null);
              setImportError(null);
              setImportSuccess(null);
            }}
            className="flex items-center gap-2 rounded-xl border border-sky-500/40 bg-sky-500/15 hover:bg-sky-500/25 px-4 py-2 text-xs font-bold text-sky-300 shadow-sm transition sm:text-sm cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            Import Courier Tracking (Excel / CSV)
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
            { id: "ALL", label: `All Finishers (${stats.approvedCount})` },
            { id: "DISPATCHED", label: `In Transit (${stats.dispatchedCount})` },
            { id: "PENDING", label: `Awaiting Dispatch (${stats.readyCount})` },
            { id: "DELIVERED", label: `Delivered (${stats.deliveredCount})` },
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
              <option value="ALL">All Participants ({stats.approvedCount})</option>
              <option value="APPROVED">Approved Proofs Only</option>
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
                  <th className="px-3 py-3.5">Delivery Partner & AWB</th>
                  <th className="px-3 py-3.5">Status & Live Tracking</th>
                  <th className="py-3.5 pr-4 pl-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--line)">
                {items.map((row) => {
                  const mStatus = row.medalDelivery?.status || "PENDING";
                  const trackingNum = row.medalDelivery?.trackingNumber?.trim();
                  const courierName = row.medalDelivery?.courier?.trim() || (trackingNum ? (/^7D/i.test(trackingNum) ? "DTDC" : "Delhivery") : null);
                  const isDtdc = (courierName || "").toLowerCase().includes("dtdc") || (trackingNum ? /^7D/i.test(trackingNum) : false);
                  const liveTrackingUrl = trackingNum ? getLiveTrackingUrl(courierName, trackingNum, row.medalDelivery?.trackingUrl) : "";

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

                      {/* Delivery Partner & Tracking ID (AWB) */}
                      <td className="px-3 py-3.5">
                        {trackingNum ? (
                          <div className="space-y-1.5">
                            {/* Courier Partner Badge */}
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[0.65rem] font-black uppercase tracking-wider shadow-xs ${
                                  isDtdc
                                    ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                                    : "bg-red-500/15 text-red-400 border border-red-500/30"
                                }`}
                              >
                                <Truck className="h-3 w-3" />
                                {courierName || "Delhivery"}
                              </span>
                            </div>

                            {/* AWB Number + Copy Button */}
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-bold text-(--foreground) tracking-tight select-all">
                                {trackingNum}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleCopyAwb(e, trackingNum, row.id)}
                                className="inline-flex items-center gap-1 rounded-md border border-(--line) bg-(--panel-soft) hover:bg-(--line) px-1.5 py-0.5 text-[0.65rem] font-bold text-(--muted) hover:text-(--foreground) transition-all cursor-pointer"
                                title="Copy Tracking ID (AWB)"
                              >
                                {copiedAwb === row.id ? (
                                  <>
                                    <Check className="h-2.5 w-2.5 text-emerald-400" />
                                    <span className="text-emerald-400 font-bold">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-2.5 w-2.5" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[0.7rem] text-(--muted-soft)">
                            <span className="inline-flex items-center gap-1 text-amber-500/90 font-semibold">
                              <Clock className="h-3 w-3" />
                              No AWB Assigned
                            </span>
                            <p className="text-[0.62rem] text-(--muted-soft) mt-0.5">Pending courier dispatch</p>
                          </div>
                        )}
                      </td>

                      {/* Status & Live Tracking */}
                      <td className="px-3 py-3.5">
                        <div className="space-y-1.5">
                          {/* Fulfillment Status Badge */}
                          <div>
                            {mStatus === "PENDING" && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-amber-500">
                                <Clock className="h-3 w-3" />
                                Ready to Ship
                              </span>
                            )}
                            {mStatus === "DISPATCHED" && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-sky-400">
                                <Truck className="h-3 w-3" />
                                In Transit
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
                          </div>

                          {/* Live Tracking Link Button */}
                          {trackingNum && liveTrackingUrl ? (
                            <div>
                              <a
                                href={liveTrackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-500/15 hover:bg-sky-500/30 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-sky-300 transition-all shadow-xs group/btn cursor-pointer active:scale-95"
                                title={`Open live tracking on ${courierName || "courier"} website`}
                              >
                                <Truck className="h-3 w-3 text-sky-400 group-hover/btn:scale-110 transition-transform" />
                                <span>Live Track</span>
                                <ExternalLink className="h-3 w-3 text-sky-400" />
                              </a>
                            </div>
                          ) : null}
                        </div>
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
                {/* 🚚 Courier & Live Tracking Status Card */}
                {(() => {
                  const dTracking = activeItem.medalDelivery?.trackingNumber?.trim();
                  const dCourier = activeItem.medalDelivery?.courier?.trim() || (dTracking ? (/^7D/i.test(dTracking) ? "DTDC" : "Delhivery") : null);
                  const isDtdc = (dCourier || "").toLowerCase().includes("dtdc") || (dTracking ? /^7D/i.test(dTracking) : false);
                  const dLiveUrl = dTracking ? getLiveTrackingUrl(dCourier, dTracking, activeItem.medalDelivery?.trackingUrl) : "";

                  return (
                    <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[0.7rem] font-black uppercase tracking-wider ${
                              isDtdc
                                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                                : "bg-red-500/20 text-red-300 border border-red-500/40"
                            }`}
                          >
                            <Truck className="h-3.5 w-3.5" />
                            {dCourier || "Delivery Partner"}
                          </span>
                          <span className="rounded-full bg-sky-500/20 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-sky-300">
                            {activeItem.medalDelivery?.status || "PENDING"}
                          </span>
                        </div>
                        {dTracking && (
                          <button
                            type="button"
                            onClick={(e) => handleCopyAwb(e, dTracking, "drawer-top")}
                            className="flex items-center gap-1 rounded-lg border border-sky-500/30 bg-sky-500/15 hover:bg-sky-500/25 px-2.5 py-1 text-xs font-bold text-sky-300 transition-all cursor-pointer"
                          >
                            {copiedAwb === "drawer-top" ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-400" />
                                <span className="text-emerald-400 font-bold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                Copy AWB
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {dTracking ? (
                        <div className="space-y-2.5 pt-1">
                          <div>
                            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
                              Official AWB / Tracking ID:
                            </p>
                            <p className="font-mono text-base font-black text-white tracking-wider select-all">
                              {dTracking}
                            </p>
                          </div>

                          {/* 🚀 Big Live Tracking Button */}
                          <a
                            href={dLiveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 py-3 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg transition-all active:scale-98 cursor-pointer"
                          >
                            <Truck className="h-4 w-4" />
                            <span>Open Live Tracking on {dCourier || "Partner"}</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">
                          No AWB assigned yet. Use the form below to enter Delhivery or DTDC tracking number.
                        </p>
                      )}
                    </div>
                  );
                })()}

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
                      <p className="text-[0.65rem] text-(--muted)">Challenge Distance</p>
                      <p className="font-bold text-(--foreground)">
                        {activeItem.distance}
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
                        src={optimizeCloudinaryUrl(activeItem.proofUpload.activityImageUrl, 600)}
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
                      onChange={(e) => handleCourierSelect(e.target.value)}
                      placeholder="e.g. Delhivery or DTDC"
                      className="w-full rounded-xl border border-(--line) bg-(--panel) px-3 py-2 text-xs text-(--foreground)"
                    />
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {COURIER_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleCourierSelect(preset)}
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
                      onChange={(e) => handleTrackingNumberInput(e.target.value)}
                      placeholder="e.g. 44465010284126 (Delhivery) or 7D141523514 (DTDC)"
                      className="w-full rounded-xl border border-(--line) bg-(--panel) px-3 py-2 font-mono text-xs text-(--foreground)"
                    />
                  </div>

                  {/* Tracking URL */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[0.7rem] font-bold uppercase tracking-wider text-(--muted)">
                        Tracking URL
                      </label>
                      {editTrackingUrl ? (
                        <a
                          href={editTrackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[0.65rem] font-bold text-sky-400 hover:underline"
                        >
                          <span>Test Link</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      ) : null}
                    </div>
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

      {/* ── Import Courier Tracking Sheet Modal ── */}
      <AnimatePresence>
        {importModalOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl border border-(--line) bg-(--panel) p-6 shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="absolute top-4 right-4 text-(--muted) hover:text-(--foreground)"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-(--foreground)">
                    Import Courier Tracking Sheet
                  </h3>
                  <p className="text-xs text-(--muted)">
                    Upload Delhivery or DTDC dispatch Excel (.xlsx) or CSV
                  </p>
                </div>
              </div>

              {/* Info Box */}
              <div className="rounded-xl border border-(--line) bg-(--panel-soft) p-3 text-xs text-(--muted) space-y-1.5 mb-4">
                <p className="font-semibold text-(--foreground) flex items-center gap-1.5">
                  <FileSpreadsheet className="h-4 w-4 text-sky-400" />
                  Supported Courier Sheet Columns:
                </p>
                <p>
                  • <strong className="text-(--foreground)">OID / AWB</strong>: Tracking number (e.g. 14-digit Delhivery or 7D... DTDC)
                </p>
                <p>
                  • <strong className="text-(--foreground)">Contact Phone / Phone</strong>: 10-digit mobile number for 100% accurate runner match
                </p>
                <p>
                  • <strong className="text-(--foreground)">Participant Name & PIN Code</strong>: Secondary fallback matching
                </p>
              </div>

              {/* Dropzone */}
              <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-(--line) hover:border-sky-500/50 bg-(--panel-soft)/50 p-6 text-center cursor-pointer transition">
                <Upload className="h-8 w-8 text-sky-400" />
                <div>
                  <p className="text-xs font-bold text-(--foreground)">
                    {importFile ? importFile.name : "Click to browse or drag & drop file"}
                  </p>
                  <p className="text-[0.7rem] text-(--muted-soft) mt-0.5">
                    Supports .xlsx, .xls, .csv from Delhivery or DTDC
                  </p>
                </div>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />
              </label>

              {importError && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {importSuccess && (
                <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs space-y-1.5">
                  <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Tracking Sheet Integrated Successfully!
                  </p>
                  <p className="text-(--foreground)">
                    • <strong className="text-emerald-300">{importSuccess.updatedCount}</strong> shipments updated to <strong className="text-sky-300">DISPATCHED</strong>
                  </p>
                  <p className="text-(--muted)">
                    • Delhivery: <strong className="text-(--foreground)">{importSuccess.delhiveryCount}</strong> | DTDC: <strong className="text-(--foreground)">{importSuccess.dtdcCount}</strong>
                  </p>
                  {importSuccess.pendingCount > 0 && (
                    <p className="text-amber-400">
                      • {importSuccess.pendingCount} rows had no AWB yet (marked Pending)
                    </p>
                  )}
                  {importSuccess.unmatchedCount > 0 && (
                    <p className="text-red-400">
                      • {importSuccess.unmatchedCount} rows could not be matched
                    </p>
                  )}
                </div>
              )}

              {/* Modal Actions */}
              <div className="mt-5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="rounded-xl border border-(--line) px-4 py-2 text-xs font-bold text-(--muted) hover:text-(--foreground) cursor-pointer"
                >
                  {importSuccess ? "Close" : "Cancel"}
                </button>
                {!importSuccess && (
                  <button
                    type="button"
                    disabled={!importFile || importing}
                    onClick={() => void handleExecuteImport()}
                    className="flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 px-5 py-2 text-xs font-black uppercase tracking-wider text-slate-950 transition disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing Sheet...
                      </>
                    ) : (
                      <>
                        <Truck className="h-4 w-4" />
                        Apply Tracking & Dispatch
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
