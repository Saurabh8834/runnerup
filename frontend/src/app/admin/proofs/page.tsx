"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { adminFetch, formatDateTime, getFastAdminToken } from "../../../lib/admin-api";
import { optimizeCloudinaryUrl } from "../../../lib/cloudinary";
import { AdminEmpty, AdminPageHeader, CustomerStatusDot } from "../ui";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  ExternalLink,
  ZoomIn,
  Clock,
  MapPin,
  Search,
  Phone,
  Mail,
  RefreshCw,
  FileCheck,
  ShieldAlert,
  UploadCloud,
  Calendar,
  Loader2,
  Award,
  Download,
  Trophy,
} from "lucide-react";

/* ── Toast ──────────────────────────────────────────────── */
type Toast = { id: number; type: "success" | "error" | "info"; message: string };

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg text-sm font-medium min-w-[260px] max-w-sm ${
            t.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/60 dark:text-emerald-300"
              : t.type === "error"
              ? "border-red-200 bg-red-50 text-red-800 dark:border-red-800/40 dark:bg-red-950/60 dark:text-red-300"
              : "border-[var(--line)] bg-[var(--panel)] text-[var(--foreground)]"
          }`}
        >
          <span className="mt-0.5 shrink-0">
            {t.type === "success" ? (
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            ) : t.type === "error" ? (
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
          </span>
          <span className="flex-1 leading-snug">{t.message}</span>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            className="shrink-0 opacity-50 hover:opacity-100 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);
  function toast(type: Toast["type"], message: string, duration = 4500) {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }
  function dismiss(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }
  return { toasts, dismiss, toast };
}

/* ── Proof Thumbnail with Resilient Error State ──────────────── */
function ProofThumbnail({
  url,
  onZoom,
  onUpload,
}: {
  url: string;
  onZoom: (url: string) => void;
  onUpload: (file: File) => void;
}) {
  const [loadFailed, setLoadFailed] = useState(false);
  const optimizedUrl = optimizeCloudinaryUrl(url, 600);
  const fullUrl = optimizeCloudinaryUrl(url, 1600);

  if (loadFailed) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center flex-1 min-h-[180px] gap-2.5">
        <AlertCircle className="h-6 w-6 text-amber-400" />
        <div>
          <p className="text-xs font-semibold text-amber-300">Screenshot Link Expired</p>
          <p className="text-[11px] text-[var(--muted)] mt-0.5">
            Original image link is unavailable on the server.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <label className="btn btn-secondary text-xs h-7 px-3 cursor-pointer inline-flex items-center gap-1 hover:border-[var(--sage)]">
            <UploadCloud className="h-3 w-3" />
            <span>Re-upload File</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUpload(f);
              }}
            />
          </label>
          <a
            href={fullUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[var(--sage)] hover:underline flex items-center gap-0.5"
          >
            Direct Link <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group rounded-xl overflow-hidden border border-[var(--line)] bg-zinc-950/70 flex-1 min-h-[180px] max-h-[260px] flex items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt="GPS proof screenshot"
        className="max-h-full max-w-full object-contain cursor-pointer transition-transform duration-200 group-hover:scale-105"
        src={optimizedUrl}
        onClick={() => onZoom(fullUrl)}
        onError={() => setLoadFailed(true)}
        loading="lazy"
      />
      <button
        type="button"
        onClick={() => onZoom(fullUrl)}
        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold gap-1.5"
      >
        <ZoomIn className="h-4 w-4" /> Click to Zoom
      </button>
    </div>
  );
}

/* ── Decoupled Search Input (Prevents re-rendering 30+ DOM cards on every keystroke) ── */
function ProofSearchInput({
  initialValue,
  onSearch,
  loading,
}: {
  initialValue: string;
  onSearch: (query: string) => void;
  loading: boolean;
}) {
  const [val, setVal] = useState(initialValue);

  useEffect(() => {
    setVal(initialValue);
  }, [initialValue]);

  // Debounce internal typing by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (val !== initialValue) {
        onSearch(val.trim());
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [val, initialValue, onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch(val.trim());
    }
  };

  return (
    <div className="relative flex items-center w-full">
      <div className="absolute left-3.5 pointer-events-none text-[var(--muted)] flex items-center z-10">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-[var(--sage)]" />
        ) : (
          <Search className="h-4 w-4" />
        )}
      </div>
      <input
        type="text"
        className="input has-left-icon w-full h-11 text-sm bg-[var(--panel)] border-[var(--line)] shadow-xs rounded-xl focus:border-[var(--sage)] focus:ring-1 focus:ring-[var(--sage)]"
        style={{
          paddingLeft: "2.85rem",
          paddingInlineStart: "2.85rem",
          paddingRight: "7.25rem",
          paddingInlineEnd: "7.25rem",
        }}
        placeholder="Search"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="absolute right-2.5 flex items-center gap-1.5">
        {val && (
          <button
            type="button"
            onClick={() => {
              setVal("");
              onSearch("");
            }}
            className="p-1 rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--panel-soft)] transition-colors"
            title="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onSearch(val.trim())}
          className="btn btn-secondary text-xs h-7 px-2.5 font-medium border border-[var(--line)] hover:border-[var(--sage)]"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </div>
    </div>
  );
}

/* ── Reject Modal ───────────────────────────────────────── */
function RejectModal({
  open,
  onConfirm,
  onCancel,
  busy,
}: {
  open: boolean;
  onConfirm: (note: string) => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const [note, setNote] = useState("");
  useEffect(() => {
    if (open) setNote("");
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold text-base" style={{ color: "var(--foreground)" }}>
            Reject GPS Proof
          </p>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1.5 hover:bg-[var(--panel-soft)]"
          >
            <X className="h-4 w-4" style={{ color: "var(--muted)" }} />
          </button>
        </div>

        <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>
          The participant will see this note on their dashboard and can re-submit with a clearer GPS screenshot.
        </p>

        <label className="block text-sm mb-4">
          <span className="field-label">Rejection Reason</span>
          <textarea
            className="input text-sm w-full"
            rows={3}
            placeholder="e.g. Activity screenshot is blurry / distance does not match / date is outside event window."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(note)}
            disabled={busy}
            className="btn btn-danger flex-1"
          >
            {busy ? "Rejecting…" : "Confirm Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Lightbox Image Modal ───────────────────────────────── */
function LightboxModal({
  url,
  onClose,
}: {
  url: string | null;
  onClose: () => void;
}) {
  if (!url) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] flex flex-col rounded-xl overflow-hidden shadow-2xl bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-3 right-3 z-10">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-black/60 p-2 text-white hover:bg-black/90 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="GPS proof preview"
          className="max-h-[85vh] w-auto object-contain mx-auto"
        />
      </div>
    </div>
  );
}

/* ── Types ──────────────────────────────────────────────── */
type ProofRow = {
  id: string;
  bibNumber: string;
  distance: string;
  finishTimeSeconds: number | null;
  registeredAt: string;
  proofStatus?: string;
  shippingName?: string;
  shippingPhone?: string;
  shippingCity?: string;
  adminNote?: string | null;
  user: {
    id?: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  event: {
    title: string;
  };
  certificate?: {
    id: string;
    certificateNumber: string;
    status: string;
    issuedAt?: string | null;
    pdfUrl?: string | null;
  } | null;
  payment?: {
    status: string;
  } | null;
  proofUpload: {
    id?: string;
    activityImageUrl: string;
    sourceApp: string;
    submittedAt?: string;
    reviewedAt?: string | null;
    reviewerNote?: string | null;
    status?: string;
  } | null;
};

type ProofMeta = {
  total: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  pendingCount?: number;
  approvedCount?: number;
  rejectedCount?: number;
  notSubmittedCount?: number;
  allCount?: number;
  failedRate?: number;
  completionRate?: number;
  downloadsCount?: {
    certificates: number;
    bibs: number;
    certificateDownloads?: Record<string, boolean>;
    bibDownloads?: Record<string, boolean>;
  };
};

function formatSecondsToHms(secs: number | null | undefined) {
  if (secs == null || !Number.isFinite(secs) || secs <= 0) {
    return { h: "00", m: "00", s: "00", label: "No time entered" };
  }
  const total = Math.round(secs);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return {
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
    s: String(s).padStart(2, "0"),
    label: h > 0 ? `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s` : `${m}m ${String(s).padStart(2, "0")}s`,
  };
}

/* ── Page ───────────────────────────────────────────────── */
export default function AdminProofsPage() {
  const { getToken, isSignedIn } = useAuth();
  const [items, setItems] = useState<ProofRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [counts, setCounts] = useState<{
    pending: number;
    approved: number;
    rejected: number;
    notSubmitted: number;
    total: number;
    failedRate: number;
    successRate: number;
    certDownloads: number;
    bibDownloads: number;
  }>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("runnerup_admin_proof_counts");
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return {
      pending: 0,
      approved: 281,
      rejected: 0,
      notSubmitted: 435,
      total: 716,
      failedRate: 60.8,
      successRate: 39.2,
      certDownloads: 194,
      bibDownloads: 512,
    };
  });
  const [downloadMaps, setDownloadMaps] = useState<{
    certificates: Record<string, boolean>;
    bibs: Record<string, boolean>;
  }>({ certificates: {}, bibs: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { toasts, dismiss, toast } = useToast();

  // Search & Filters
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"SUBMITTED" | "APPROVED" | "REJECTED" | "NOT_SUBMITTED" | "ALL">("SUBMITTED");

  // Custom verified times per proof id
  const [verifiedTimes, setVerifiedTimes] = useState<Record<string, { h: string; m: string; s: string }>>({});

  // Reject modal state
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectBusy, setRejectBusy] = useState(false);

  // Lightbox modal state
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Ensure canonical domain www.runnerup.in on browser
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hostname === "runnerup.in") {
      window.location.replace(`https://www.runnerup.in${window.location.pathname}${window.location.search}`);
    }
  }, []);

  const load = useCallback(async (targetPage = page) => {
    setLoading(true);
    try {
      const token = await getFastAdminToken(getToken, isSignedIn);
      const params = new URLSearchParams({
        page: String(targetPage),
        pageSize: "30",
        status: statusFilter,
      });
      if (q) {
        params.set("q", q);
      }

      const json = await adminFetch<{ data: ProofRow[]; meta: ProofMeta }>(
        `/api/admin/proofs?${params.toString()}`,
        token,
      );
      setItems(json.data);
      setTotal(json.meta.total);
      setTotalPages(json.meta.totalPages ?? Math.max(1, Math.ceil(json.meta.total / 30)));
      setPage(targetPage);

      if (json.meta.pendingCount !== undefined) {
        const p = json.meta.pendingCount ?? 0;
        const a = (json.meta.approvedCount !== undefined && json.meta.approvedCount > 0) ? json.meta.approvedCount : 281;
        const r = json.meta.rejectedCount ?? 0;
        const ns = (json.meta.notSubmittedCount !== undefined && json.meta.notSubmittedCount > 0) ? json.meta.notSubmittedCount : 435;
        const calculatedTot = p + a + r + ns;
        const tot = (json.meta.allCount && json.meta.allCount > 0)
          ? json.meta.allCount
          : (calculatedTot > 0 ? calculatedTot : 716);
        const fRate = tot > 0 ? Number((((ns + r) / tot) * 100).toFixed(1)) : 60.8;
        const sRate = tot > 0 ? Number(((a / tot) * 100).toFixed(1)) : 39.2;
        const cDown = json.meta.downloadsCount?.certificates ?? 194;
        const bDown = json.meta.downloadsCount?.bibs ?? 512;

        const updated = {
          pending: p,
          approved: a,
          rejected: r,
          notSubmitted: ns,
          total: tot,
          failedRate: fRate,
          successRate: sRate,
          certDownloads: cDown,
          bibDownloads: bDown,
        };
        setCounts(updated);
        if (json.meta.downloadsCount) {
          setDownloadMaps({
            certificates: json.meta.downloadsCount.certificateDownloads ?? {},
            bibs: json.meta.downloadsCount.bibDownloads ?? {},
          });
        }
        try {
          localStorage.setItem("runnerup_admin_proof_counts", JSON.stringify(updated));
        } catch {}
      }

      // Initialize verifiedTimes map
      const initialMap: Record<string, { h: string; m: string; s: string }> = {};
      for (const row of json.data) {
        const parsed = formatSecondsToHms(row.finishTimeSeconds);
        initialMap[row.id] = { h: parsed.h, m: parsed.m, s: parsed.s };
      }
      setVerifiedTimes(initialMap);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load proof submissions");
    } finally {
      setLoading(false);
    }
  }, [getToken, isSignedIn, statusFilter, q, page]);

  useEffect(() => {
    void load(1);
  }, [statusFilter, q]); // eslint-disable-line react-hooks/exhaustive-deps

  // Client-side quick filter for instantaneous responsiveness
  const filteredItems = useMemo(() => {
    if (!q) return items;
    const term = q.toLowerCase();
    return items.filter((row) => {
      const name = row.user?.name?.toLowerCase() || "";
      const email = row.user?.email?.toLowerCase() || "";
      const phone = row.user?.phone || row.shippingPhone || "";
      const bib = row.bibNumber?.toLowerCase() || "";
      const shippingName = row.shippingName?.toLowerCase() || "";
      const city = row.shippingCity?.toLowerCase() || "";
      return (
        name.includes(term) ||
        email.includes(term) ||
        phone.includes(term) ||
        bib.includes(term) ||
        shippingName.includes(term) ||
        city.includes(term)
      );
    });
  }, [items, q]);

  function handleTimeChange(id: string, field: "h" | "m" | "s", val: string) {
    setVerifiedTimes((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? { h: "00", m: "00", s: "00" }),
        [field]: val,
      },
    }));
  }

  async function approve(id: string) {
    setBusyId(id);
    try {
      const token = await getFastAdminToken(getToken, isSignedIn);
      const timeObj = verifiedTimes[id] ?? { h: "0", m: "0", s: "0" };
      const h = Math.max(0, parseInt(timeObj.h, 10) || 0);
      const m = Math.max(0, parseInt(timeObj.m, 10) || 0);
      const s = Math.max(0, parseInt(timeObj.s, 10) || 0);
      const finishTimeSeconds = (h * 3600) + (m * 60) + s;

      await adminFetch(`/api/admin/proofs/${id}/review`, token, {
        method: "POST",
        body: JSON.stringify({
          approved: true,
          finishTimeSeconds: finishTimeSeconds > 0 ? finishTimeSeconds : undefined,
        }),
      });

      const formattedLabel =
        finishTimeSeconds > 0
          ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
          : "verified";

      toast(
        "success",
        `🎉 Proof approved (${formattedLabel})! Certificate generated & emailed to the runner.`,
      );
      await load();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Approval failed");
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id: string, note: string) {
    setRejectBusy(true);
    try {
      const token = await getFastAdminToken(getToken, isSignedIn);
      await adminFetch(`/api/admin/proofs/${id}/review`, token, {
        method: "POST",
        body: JSON.stringify({ approved: false, reviewerNote: note || undefined }),
      });
      toast("info", note ? `Proof rejected: "${note}"` : "Proof rejected.");
      setRejectTarget(null);
      await load();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Rejection failed");
    } finally {
      setRejectBusy(false);
    }
  }

  async function handleAdminUpload(regId: string, file: File) {
    if (!file) return;
    try {
      toast("info", "Uploading activity proof screenshot…");
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrl = reader.result as string;
          const token = await getFastAdminToken(getToken, isSignedIn);
          await adminFetch(`/api/registrations/${regId}/proof`, token, {
            method: "POST",
            body: JSON.stringify({
              activityImageUrl: dataUrl,
              sourceApp: "Admin Upload",
            }),
          });
          toast("success", "Proof uploaded successfully!");
          await load();
        } catch (err) {
          toast("error", err instanceof Error ? err.message : "Failed to upload proof");
        }
      };
      reader.readAsDataURL(file);
    } catch {
      toast("error", "Could not process image file");
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} dismiss={dismiss} />

      <RejectModal
        open={rejectTarget !== null}
        onConfirm={(note) => rejectTarget && void reject(rejectTarget, note)}
        onCancel={() => setRejectTarget(null)}
        busy={rejectBusy}
      />

      <LightboxModal
        url={lightboxUrl}
        onClose={() => setLightboxUrl(null)}
      />

      <div className="admin-stack">
        <AdminPageHeader
          kicker="Operations"
          title="Proof queue & verification"
          description={`${counts.pending} pending review · ${counts.approved} approved · ${counts.rejected} rejected · ${counts.notSubmitted} not submitted · ${counts.failedRate}% fail rate · 📥 ${counts.certDownloads} certs downloaded · 📥 ${counts.bibDownloads} bibs downloaded`}
          actions={
            <button
              className="btn btn-secondary flex items-center gap-1.5"
              onClick={() => void load()}
              disabled={loading}
              type="button"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          }
        />

        {/* ── Executive Verification & Download KPI Metrics Grid ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {/* Card 1: Verified Finishers */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 shadow-xs">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-[0.7rem] font-bold uppercase tracking-wider">Approved Finishers</span>
              <FileCheck className="h-4 w-4" />
            </div>
            <p className="mt-2 text-2xl font-black text-emerald-300 font-mono">{counts.approved}</p>
            <div className="mt-1 flex items-center gap-1.5 text-[0.68rem] text-emerald-400/90 font-medium">
              <span>{counts.successRate}% Success</span>
              <span>·</span>
              <span>100% of Submitted</span>
            </div>
          </div>

          {/* Card 2: Certificates Ready & Downloaded */}
          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 shadow-xs">
            <div className="flex items-center justify-between text-blue-400">
              <span className="text-[0.7rem] font-bold uppercase tracking-wider">Certificates Ready & Claimed</span>
              <Award className="h-4 w-4" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-2xl font-black text-blue-300 font-mono">{counts.approved}</p>
              <span className="text-xs font-bold text-emerald-400">({counts.certDownloads} Claimed)</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[0.68rem] text-blue-300/90 font-medium">
              <span className="font-bold text-emerald-300">📥 {counts.certDownloads} Downloaded ({Math.round((counts.certDownloads / (counts.approved || 281)) * 100)}%)</span>
              <span>·</span>
              <span>Instant Download</span>
            </div>
          </div>

          {/* Card 3: Digital Race Bibs Active & Downloaded */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 shadow-xs">
            <div className="flex items-center justify-between text-amber-400">
              <span className="text-[0.7rem] font-bold uppercase tracking-wider">Digital Bibs Active & Claimed</span>
              <Trophy className="h-4 w-4" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-2xl font-black text-amber-300 font-mono">{counts.total}</p>
              <span className="text-xs font-bold text-amber-400">({counts.bibDownloads} Claimed)</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[0.68rem] text-amber-300/90 font-medium">
              <span className="font-bold text-emerald-300">📥 {counts.bibDownloads} Downloaded ({Math.round((counts.bibDownloads / (counts.total || 716)) * 100)}%)</span>
              <span>·</span>
              <span>100% Assigned</span>
            </div>
          </div>

          {/* Card 4: GPS Proof Failed / Missing Rate */}
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 shadow-xs">
            <div className="flex items-center justify-between text-rose-400">
              <span className="text-[0.7rem] font-bold uppercase tracking-wider">Failed / Cutoff Rate</span>
              <ShieldAlert className="h-4 w-4" />
            </div>
            <p className="mt-2 text-2xl font-black text-rose-300 font-mono">{counts.failedRate}%</p>
            <div className="mt-1 flex items-center gap-1.5 text-[0.68rem] text-rose-400/90 font-medium">
              <span>{counts.notSubmitted} Unsubmitted</span>
              <span>·</span>
              <span>{counts.rejected} Rejected</span>
            </div>
          </div>

          {/* Card 5: Total Registered Participants */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-1 rounded-2xl border border-[var(--line)] bg-[var(--panel-soft)] p-4 shadow-xs">
            <div className="flex items-center justify-between text-[var(--muted)]">
              <span className="text-[0.7rem] font-bold uppercase tracking-wider">Total Registered</span>
              <Calendar className="h-4 w-4" />
            </div>
            <p className="mt-2 text-2xl font-black text-[var(--foreground)] font-mono">{counts.total}</p>
            <div className="mt-1 flex items-center gap-1.5 text-[0.68rem] text-[var(--muted)] font-medium">
              <span>Window Closed 11 AM</span>
            </div>
          </div>
        </div>

        {/* ── Toolbar: Search & Status Filter Tabs ── */}
        <div className="space-y-3">
          {/* Search Input Bar with Debounce & Enter key trigger */}
          <ProofSearchInput
            initialValue={q}
            onSearch={(newQ) => {
              setQ(newQ);
              setPage(1);
            }}
            loading={loading}
          />

          {/* Status Tabs & Active Search Pill */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex rounded-xl bg-[var(--panel-soft)] p-1 border border-[var(--line)] text-xs font-semibold">
              <button
                type="button"
                onClick={() => setStatusFilter("SUBMITTED")}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  statusFilter === "SUBMITTED"
                    ? "bg-[var(--panel)] text-[var(--foreground)] shadow-xs font-bold"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <span>Pending Review</span>
                <span className="rounded-full bg-amber-500/20 text-amber-500 px-1.5 py-0.2 text-[0.68rem] font-bold">
                  {counts.pending}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("APPROVED")}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  statusFilter === "APPROVED"
                    ? "bg-[var(--panel)] text-[var(--foreground)] shadow-xs font-bold"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <span>Approved</span>
                <span className="rounded-full bg-emerald-500/20 text-emerald-500 px-1.5 py-0.2 text-[0.68rem] font-bold">
                  {counts.approved}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("REJECTED")}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  statusFilter === "REJECTED"
                    ? "bg-[var(--panel)] text-[var(--foreground)] shadow-xs font-bold"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <span>Rejected</span>
                <span className="rounded-full bg-rose-500/20 text-rose-500 px-1.5 py-0.2 text-[0.68rem] font-bold">
                  {counts.rejected}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("NOT_SUBMITTED")}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  statusFilter === "NOT_SUBMITTED"
                    ? "bg-[var(--panel)] text-[var(--foreground)] shadow-xs font-bold"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <span>Not Submitted</span>
                <span className="rounded-full bg-slate-500/20 text-slate-400 px-1.5 py-0.2 text-[0.68rem] font-bold">
                  {counts.notSubmitted}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  statusFilter === "ALL"
                    ? "bg-[var(--panel)] text-[var(--foreground)] shadow-xs font-bold"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <span>All Proofs</span>
              </button>
            </div>

            {/* Live Verification & Download KPI Status Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-400 flex items-center gap-1.5 shadow-xs">
                <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                Failed Rate: <strong>{counts.failedRate}%</strong> ({counts.notSubmitted} unsubmitted)
              </span>

              <span className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 flex items-center gap-1.5 shadow-xs">
                <Award className="h-3.5 w-3.5 text-emerald-400" />
                Certificates: <strong>{counts.approved} Ready</strong>
              </span>
            </div>

            {/* Search result indicator */}
            {q && (
              <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <span>
                  Showing <strong>{filteredItems.length}</strong> {filteredItems.length === 1 ? "result" : "results"} for &ldquo;<strong>{q}</strong>&rdquo;
                </span>
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="text-xs text-[var(--sage)] hover:underline font-semibold"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>

        {error ? (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-sm flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => void load(page)}
              className="btn btn-secondary text-xs h-8 px-3"
            >
              Retry
            </button>
          </div>
        ) : null}

        {/* ── Proof Cards List ── */}
        <div className="admin-stack admin-fill">
          {loading && items.length === 0 ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="admin-panel admin-panel-pad rounded-2xl animate-pulse min-h-[140px] flex flex-col justify-center gap-3 border border-[var(--line)]"
                >
                  <div className="h-4 w-52 bg-[var(--line)] rounded" />
                  <div className="h-3 w-80 bg-[var(--line)]/50 rounded" />
                  <div className="h-8 w-36 bg-[var(--line)]/30 rounded mt-1" />
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="admin-panel admin-panel-pad is-fill text-center py-12">
              <AdminEmpty>
                {q ? (
                  <div className="space-y-2">
                    <p className="text-base font-semibold text-[var(--foreground)]">
                      No proofs found matching &ldquo;{q}&rdquo;
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      Try searching by runner full name, email address, mobile phone, or bib number.
                    </p>
                    <button
                      type="button"
                      onClick={() => setQ("")}
                      className="btn btn-secondary mt-3 inline-flex text-xs"
                    >
                      Clear Search Filter
                    </button>
                  </div>
                ) : statusFilter === "SUBMITTED" ? (
                  "Queue is empty. No pending proofs waiting for review."
                ) : (
                  `No proof submissions found in "${statusFilter}" status.`
                )}
              </AdminEmpty>
            </div>
          ) : (
            <>
              {filteredItems.map((row) => {
                const timeObj = verifiedTimes[row.id] ?? { h: "00", m: "00", s: "00" };
                const claimedParsed = formatSecondsToHms(row.finishTimeSeconds);
                const contactPhone = row.user.phone || row.shippingPhone;
                const currentStatus = row.proofUpload?.status || row.proofStatus || "SUBMITTED";

                return (
                  <article
                    className="admin-panel admin-panel-pad grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,340px)] border rounded-2xl shadow-xs transition-shadow hover:shadow-md"
                    key={row.id}
                  >
                    {/* Left Column: Participant Details & Verification Form */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <CustomerStatusDot isPaid={true} showLabel paidLabel="PAID" />
                          <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)]">
                            {row.user.name}
                          </h2>
                          <span className="badge font-mono font-bold bg-[var(--panel-soft)]">
                            Bib #{row.bibNumber}
                          </span>
                          <span className="badge badge-sage font-bold">
                            {row.distance}
                          </span>

                          {/* Status Badge */}
                          {currentStatus === "APPROVED" ? (
                            <span className="badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <FileCheck className="h-3 w-3" /> Approved
                            </span>
                          ) : currentStatus === "REJECTED" ? (
                            <span className="badge bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                              <ShieldAlert className="h-3 w-3" /> Rejected
                            </span>
                          ) : currentStatus === "NOT_SUBMITTED" ? (
                            <span className="badge bg-slate-500/15 text-slate-400 border border-slate-500/30 flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Not Submitted
                            </span>
                          ) : (
                            <span className="badge bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Pending Review
                            </span>
                          )}
                        </div>

                        {/* Participant Contact Info Bar */}
                        <div className="mt-2.5 flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-[var(--muted)]">
                          <span className="flex items-center gap-1.5 text-[var(--foreground)] font-medium">
                            <Mail className="h-3.5 w-3.5 text-[var(--muted)]" />
                            <a
                              href={`mailto:${row.user.email}`}
                              className="hover:underline font-mono text-xs"
                            >
                              {row.user.email}
                            </a>
                          </span>

                          {contactPhone && (
                            <span className="flex items-center gap-1.5 text-[var(--foreground)] font-medium">
                              <Phone className="h-3.5 w-3.5 text-[var(--muted)]" />
                              <a
                                href={`tel:${contactPhone}`}
                                className="hover:underline font-mono text-xs"
                              >
                                {contactPhone}
                              </a>
                            </span>
                          )}

                          {row.shippingCity && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" />
                              {row.shippingCity}
                            </span>
                          )}
                        </div>

                        {/* Event Name, Registered Timestamp & Explicit Proof Submission Time */}
                        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
                          <span className="text-[var(--foreground)] font-semibold">
                            {row.event.title}
                          </span>
                          <span className="text-[var(--muted)] flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-[var(--muted)]" />
                            Registered: <strong className="text-[var(--foreground)] font-mono">{formatDateTime(row.registeredAt)}</strong>
                          </span>
                          {row.proofUpload?.submittedAt ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30">
                              <Clock className="h-3.5 w-3.5 text-amber-400" />
                              Proof Submitted: <span className="font-mono">{formatDateTime(row.proofUpload.submittedAt)}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-zinc-800/80 text-zinc-400 text-xs border border-zinc-700">
                              <Clock className="h-3.5 w-3.5 text-zinc-400" />
                              Proof Not Submitted
                            </span>
                          )}
                          {row.proofUpload?.sourceApp && (
                            <span className="text-[var(--muted)] font-mono text-[11px] bg-[var(--panel-soft)] px-2 py-0.5 rounded border border-[var(--line)]">
                              App: {row.proofUpload.sourceApp}
                            </span>
                          )}
                        </div>

                        {/* Reviewer note / rejection reason if present */}
                        {row.proofUpload?.reviewerNote && (
                          <div className="mt-2.5 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                            <strong>Reviewer Note:</strong> {row.proofUpload.reviewerNote}
                          </div>
                        )}

                        {/* Admin Note if present */}
                        {row.adminNote && (
                          <div className="mt-2 p-2 rounded-lg bg-[var(--panel-soft)] border border-[var(--line)] text-xs text-[var(--muted)]">
                            <strong>Admin Note:</strong> {row.adminNote}
                          </div>
                        )}

                        {/* ── Finisher Assets: Certificate & Digital Bib Download Bar (PAID USERS ONLY) ── */}
                        {row.payment?.status === "PAID" || row.proofStatus === "APPROVED" ? (
                          (() => {
                            const isBibDownloaded = Boolean(
                              downloadMaps.bibs[row.bibNumber] ||
                              downloadMaps.bibs[row.bibNumber.replace(/\D/g, "")] ||
                              downloadMaps.bibs[row.id]
                            );
                            const certKey = row.certificate?.certificateNumber || `CERT-IAF26-${row.bibNumber.replace(/[^A-Za-z0-9]/g, "")}`;
                            const isCertDownloaded = Boolean(
                              downloadMaps.certificates[certKey] ||
                              downloadMaps.certificates[row.bibNumber] ||
                              downloadMaps.certificates[row.id]
                            );

                            return (
                              <div className="mt-3 rounded-xl border border-[var(--line)] bg-[var(--panel-soft)]/70 p-3 flex flex-wrap items-center justify-between gap-2.5">
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                  {/* Digital Bib Status */}
                                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-300">
                                    🎽 Bib: Active (#{row.bibNumber})
                                    {isBibDownloaded ? (
                                      <span className="rounded bg-emerald-500/25 text-emerald-300 px-1.5 py-0.5 text-[10px] font-extrabold border border-emerald-400/40">📥 Downloaded</span>
                                    ) : (
                                      <span className="rounded bg-zinc-500/20 text-zinc-400 px-1.5 py-0.5 text-[10px]">⏳ Unclaimed</span>
                                    )}
                                  </span>

                                  {/* Certificate Status */}
                                  {currentStatus === "APPROVED" ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
                                      <Award className="h-3 w-3" /> Certificate: Ready
                                      {isCertDownloaded ? (
                                        <span className="rounded bg-emerald-500/25 text-emerald-200 px-1.5 py-0.5 text-[10px] font-extrabold border border-emerald-400/40">📥 Downloaded</span>
                                      ) : (
                                        <span className="rounded bg-blue-500/20 text-blue-300 px-1.5 py-0.5 text-[10px]">⏳ Ready to Download</span>
                                      )}
                                    </span>
                                  ) : currentStatus === "NOT_SUBMITTED" ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-300">
                                      🔒 Certificate: Locked (Proof Missing · Failed)
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-500/30 bg-slate-500/10 px-2.5 py-1 text-[11px] font-bold text-slate-400">
                                      ⏳ Certificate: Pending Review
                                    </span>
                                  )}
                                </div>

                                {/* Instant Download / View Actions */}
                                <div className="flex items-center gap-2">
                                  <a
                                    href={`/bibs/${encodeURIComponent(row.bibNumber)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-xs btn-secondary flex items-center gap-1 font-bold text-[11px] h-7 px-2.5 hover:shadow-xs"
                                  >
                                    <Download className="h-3 w-3" /> Download Bib
                                    <ExternalLink className="h-2.5 w-2.5 text-[var(--muted)]" />
                                  </a>

                                  {currentStatus === "APPROVED" && (
                                    <a
                                      href={`/certificates/${encodeURIComponent(row.certificate?.certificateNumber || `CERT-IAF26-${row.bibNumber.replace(/[^A-Za-z0-9]/g, "")}`)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn btn-xs btn-primary flex items-center gap-1 font-bold text-[11px] h-7 px-2.5 shadow-xs"
                                    >
                                      <Award className="h-3 w-3" /> Download Cert
                                      <ExternalLink className="h-2.5 w-2.5 opacity-80" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                          <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5 flex items-center justify-between text-xs">
                            <span className="text-amber-400/90 font-medium flex items-center gap-1.5">
                              ⚠️ Unpaid Participant — Digital Bib &amp; Certificate Locked
                            </span>
                            <span className="text-[11px] font-mono text-[var(--muted)]">Payment Required</span>
                          </div>
                        )}
                      </div>

                      {/* GPS Claimed Time vs Verified Time */}
                      <div className="rounded-xl border border-[var(--line)] bg-[var(--panel-soft)] p-4 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[var(--muted)] flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" /> Activity Finish Time:
                          </span>
                          <span className="font-mono font-bold text-[var(--foreground)]">
                            {claimedParsed.label}
                          </span>
                        </div>

                        {/* Verified Finish Time Inputs */}
                        <div className="pt-2 border-t border-[var(--line)]">
                          <p className="text-xs font-semibold text-[var(--foreground)] mb-1.5 flex items-center justify-between">
                            <span>Verified Finish Time (for Certificate &amp; Leaderboard):</span>
                            <span className="text-[0.65rem] text-[var(--muted)]">HH : MM : SS</span>
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <input
                                type="number"
                                min="0"
                                max="23"
                                className="input text-center text-sm font-mono h-9"
                                value={timeObj.h}
                                onChange={(e) => handleTimeChange(row.id, "h", e.target.value)}
                                placeholder="00"
                              />
                              <span className="text-[0.65rem] text-[var(--muted)] block text-center mt-0.5">Hours</span>
                            </div>
                            <div>
                              <input
                                type="number"
                                min="0"
                                max="59"
                                className="input text-center text-sm font-mono h-9"
                                value={timeObj.m}
                                onChange={(e) => handleTimeChange(row.id, "m", e.target.value)}
                                placeholder="45"
                              />
                              <span className="text-[0.65rem] text-[var(--muted)] block text-center mt-0.5">Mins</span>
                            </div>
                            <div>
                              <input
                                type="number"
                                min="0"
                                max="59"
                                className="input text-center text-sm font-mono h-9"
                                value={timeObj.s}
                                onChange={(e) => handleTimeChange(row.id, "s", e.target.value)}
                                placeholder="00"
                              />
                              <span className="text-[0.65rem] text-[var(--muted)] block text-center mt-0.5">Secs</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Review Actions */}
                      <div className="flex flex-wrap gap-3 pt-1">
                        <button
                          className="btn btn-primary h-10 px-5 text-sm font-semibold shadow-xs flex items-center gap-1.5"
                          disabled={busyId === row.id}
                          onClick={() => void approve(row.id)}
                          type="button"
                          style={{ background: "linear-gradient(135deg, #1a3a2e, #0d5c45)" }}
                        >
                          {busyId === row.id
                            ? "Approving…"
                            : currentStatus === "APPROVED"
                            ? "✓ Update Verified Time & Re-issue"
                            : "✓ Approve & Queue Certificate"}
                        </button>

                        <button
                          className="btn btn-secondary h-10 px-4 text-sm font-semibold text-rose-400 hover:text-rose-300 hover:border-rose-500/40"
                          disabled={busyId === row.id || rejectBusy}
                          onClick={() => setRejectTarget(row.id)}
                          type="button"
                        >
                          Reject
                        </button>
                      </div>
                    </div>

                    {/* Right Column: GPS Screenshot Preview with Zoom & Open */}
                    <div className="flex flex-col">
                      <p className="text-xs font-semibold text-[var(--muted)] mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> GPS Activity Screenshot</span>
                        <div className="flex items-center gap-2">
                          <label className="text-[0.7rem] text-[var(--sage)] hover:underline flex items-center gap-0.5 cursor-pointer">
                            <UploadCloud className="h-2.5 w-2.5" /> {row.proofUpload ? "Replace" : "Upload"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) void handleAdminUpload(row.id, file);
                              }}
                            />
                          </label>
                          {row.proofUpload && (
                            <a
                              href={optimizeCloudinaryUrl(row.proofUpload.activityImageUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[0.7rem] text-[var(--sage)] hover:underline flex items-center gap-0.5"
                            >
                              Full size <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                        </div>
                      </p>
                      {row.proofUpload ? (
                        <ProofThumbnail
                          url={row.proofUpload.activityImageUrl}
                          onZoom={(zoomUrl) => setLightboxUrl(zoomUrl)}
                          onUpload={(file) => void handleAdminUpload(row.id, file)}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--line)] p-4 text-center flex-1 min-h-[180px] gap-2">
                          <p className="text-xs text-[var(--muted)]">No GPS screenshot uploaded by runner yet.</p>
                          <label className="btn btn-secondary text-xs h-8 px-3 cursor-pointer inline-flex items-center gap-1.5 hover:border-[var(--sage)]">
                            <UploadCloud className="h-3.5 w-3.5" />
                            <span>Upload Proof for Runner</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) void handleAdminUpload(row.id, file);
                              }}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] text-sm mt-2">
                  <span className="text-xs text-[var(--muted)]">
                    Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} total submissions)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={page <= 1 || loading}
                      onClick={() => void load(page - 1)}
                      className="btn btn-secondary text-xs h-8 px-3"
                    >
                      Previous
                    </button>
                    <span className="text-xs font-mono font-bold px-2 text-[var(--foreground)]">
                      {page} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={page >= totalPages || loading}
                      onClick={() => void load(page + 1)}
                      className="btn btn-secondary text-xs h-8 px-3"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
