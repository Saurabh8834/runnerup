"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { getApiUrl } from "../../../lib/api";
import { adminFetch, formatDateTime } from "../../../lib/admin-api";
import { AdminEmpty, AdminPageHeader } from "../ui";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Mail,
  FileCheck,
  Send,
  ExternalLink,
  RefreshCw,
  Info,
  RotateCcw,
  Eye,
  Search,
} from "lucide-react";

/* ── Toast ─────────────────────────────────────────────── */
type Toast = { id: number; type: "success" | "error" | "info"; message: string };

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg text-sm font-medium min-w-[260px] max-w-sm ${
            t.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/60 dark:text-emerald-300"
            : t.type === "error" ? "border-red-200 bg-red-50 text-red-800 dark:border-red-800/40 dark:bg-red-950/60 dark:text-red-300"
            : "border-[var(--line)] bg-[var(--panel)] text-[var(--foreground)]"
          }`}>
          <span className="mt-0.5 shrink-0">
            {t.type === "success" ? <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            : t.type === "error" ? <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            : <AlertCircle className="h-4 w-4" />}
          </span>
          <span className="flex-1 leading-snug">{t.message}</span>
          <button type="button" onClick={() => dismiss(t.id)} className="shrink-0 opacity-50 hover:opacity-100 cursor-pointer">
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
  function dismiss(id: number) { setToasts((prev) => prev.filter((t) => t.id !== id)); }
  return { toasts, dismiss, toast };
}

/* ── Email Preview Modal ─────────────────────────────────── */
function EmailPreviewModal({
  certId,
  runnerName,
  onClose,
  getToken,
}: {
  certId: string;
  runnerName: string;
  onClose: () => void;
  getToken: () => Promise<string | null>;
}) {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPreview() {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken().catch(() => null);
        const res = await fetch(getApiUrl(`/api/admin/certificates/${certId}/email-preview`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Could not load preview");
        const text = await res.text();
        setHtml(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Preview failed");
      } finally {
        setLoading(false);
      }
    }
    void fetchPreview();
  }, [certId, getToken]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "var(--line)" }}
        >
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-[var(--sage)]" />
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                Email Preview
              </p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                Certificate email for {runnerName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-[var(--panel-soft)] transition-colors"
          >
            <X className="h-4 w-4" style={{ color: "var(--muted)" }} />
          </button>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-auto bg-[#f0ede5] p-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="h-8 w-8 rounded-full border-2 border-[var(--sage)] border-t-transparent animate-spin" />
              <p className="text-sm text-[var(--muted)]">Loading preview…</p>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <XCircle className="h-8 w-8 text-red-500" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {html && !loading && (
            <iframe
              srcDoc={html}
              className="w-full rounded-xl border border-[var(--line)] bg-white"
              style={{ minHeight: "540px", height: "540px" }}
              title={`Email preview for ${runnerName}`}
              sandbox="allow-same-origin"
            />
          )}
        </div>

        {/* Footer note */}
        <div
          className="px-5 py-3 border-t text-xs flex items-center gap-1.5"
          style={{ borderColor: "var(--line)", color: "var(--muted)" }}
        >
          <Info className="h-3.5 w-3.5 shrink-0" />
          This is exactly how the email will appear in the runner&apos;s inbox.
        </div>
      </div>
    </div>
  );
}

/* ── Resend All Confirm Modal ───────────────────────────── */
function ResendAllModal({
  totalCount,
  onConfirm,
  onClose,
  busy,
}: {
  totalCount: number;
  onConfirm: () => void;
  onClose: () => void;
  busy: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Saffron-White-Green top strip */}
        <div className="flex h-1.5">
          <div className="flex-1 bg-[#FF9933]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#138808]" />
        </div>

        <div className="px-6 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center border border-amber-200 dark:border-amber-800/40">
              <RotateCcw className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-semibold" style={{ color: "var(--foreground)" }}>
                Resend All Certificates
              </p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                {totalCount} participant{totalCount === 1 ? "" : "s"} will receive the new email
              </p>
            </div>
          </div>

          <div
            className="rounded-xl border p-4 mb-5 text-sm space-y-2"
            style={{
              background: "var(--panel-soft)",
              borderColor: "var(--line)",
              color: "var(--foreground)",
            }}
          >
            <p>
              This will send the <strong>new premium certificate email</strong> to all{" "}
              <strong>{totalCount}</strong> participants who have confirmed certificates — including
              those who already received the old email.
            </p>
            <p style={{ color: "var(--muted)" }}>
              ✅ Each runner will get a fresh, beautifully designed certificate in their inbox.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="btn btn-secondary flex-1 disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className="btn btn-primary flex-1 gap-2 disabled:opacity-40"
              style={{
                background: busy ? undefined : "linear-gradient(135deg, #172c34, #244855)",
                border: "1px solid #e64833",
              }}
            >
              {busy ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4" />
                  Yes, Resend All
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Types ─────────────────────────────────────────────── */
type CertRow = {
  id: string;
  certificateNumber: string;
  status: string;
  pdfUrl: string | null;
  issuedAt?: string | null;
  registration: {
    bibNumber: string;
    user: { name: string; email: string };
    event: { title: string };
  };
};

const STATUS_INFO: Record<string, { label: string; color: string; hint: string }> = {
  QUEUED:    { label: "Pending",   color: "badge",           hint: "Runner hasn't received anything yet" },
  GENERATED: { label: "Ready",     color: "badge badge-sage", hint: "Verify link ready — email not sent yet" },
  SENT:      { label: "Emailed",   color: "badge badge-solid", hint: "Runner received the certificate email" },
};

/* ── Page ───────────────────────────────────────────────── */
export default function AdminCertificatesPage() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<CertRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [resendAllBusy, setResendAllBusy] = useState(false);
  const { toasts, dismiss, toast } = useToast();

  /* Preview modal state */
  const [previewCert, setPreviewCert] = useState<{ id: string; name: string } | null>(null);
  /* Resend-all confirm modal */
  const [showResendModal, setShowResendModal] = useState(false);

  const [counts, setCounts] = useState<{ QUEUED: number; GENERATED: number; SENT: number; total: number }>({
    QUEUED: 0,
    GENERATED: 0,
    SENT: 0,
    total: 0,
  });

  const load = useCallback(async () => {
    try {
      const token = await getToken().catch(() => null);
      const params = new URLSearchParams({ pageSize: "1000" });
      if (statusFilter) params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());
      const json = await adminFetch<{
        data: CertRow[];
        meta?: {
          total: number;
          statusCounts?: { QUEUED: number; GENERATED: number; SENT: number; total: number };
        };
      }>(`/api/admin/certificates?${params}`, token);
      setItems(json.data);
      if (json.meta?.statusCounts) {
        setCounts(json.meta.statusCounts);
      }
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Failed to load certificates");
    }
  }, [getToken, statusFilter, search]); // eslint-disable-line

  useEffect(() => { void load(); }, [load]);

  /* Per-row actions */
  async function runAction(id: string, path: string, successMsg: string) {
    setBusyId(id);
    try {
      const token = await getToken().catch(() => null);
      const json = await adminFetch<{ data: CertRow; meta?: { email?: { sent?: boolean; error?: string } } }>(
        path, token, { method: "POST" });
      const emailMeta = json.meta?.email;
      if (emailMeta?.sent === false) {
        toast("error", `${successMsg} — but email failed: ${emailMeta.error ?? "check RESEND_API_KEY in Railway"}`);
      } else {
        toast("success", successMsg);
      }
      await load();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  /* Bulk actions */
  async function runBulk(path: string, successLabel: string) {
    setBulkBusy(true);
    try {
      const token = await getToken().catch(() => null);
      const json = await adminFetch<{ meta?: { count?: number; sent?: number } }>(path, token, { method: "POST" });
      const count = json.meta?.count ?? 0;
      const sent = json.meta?.sent;
      if (count === 0) {
        toast("info", `${successLabel}: nothing to process.`);
      } else if (sent != null) {
        toast("success", `${successLabel}: ${sent} of ${count} emails sent.`);
      } else {
        toast("success", `${successLabel}: ${count} certificate${count === 1 ? "" : "s"} processed.`);
      }
      await load();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Bulk action failed");
    } finally {
      setBulkBusy(false);
    }
  }

  /* Resend All */
  async function handleResendAll() {
    setResendAllBusy(true);
    try {
      const token = await getToken().catch(() => null);
      const json = await adminFetch<{ meta?: { count?: number; sent?: number } }>(
        "/api/admin/certificates/bulk-resend-all",
        token,
        { method: "POST" },
      );
      const count = json.meta?.count ?? 0;
      const sent = json.meta?.sent ?? 0;
      setShowResendModal(false);
      if (count === 0) {
        toast("info", "No certificates to resend.");
      } else {
        toast("success", `🎉 Resent ${sent} of ${count} certificate emails successfully!`);
      }
      await load();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Resend all failed");
    } finally {
      setResendAllBusy(false);
    }
  }

  const queued    = counts.QUEUED;
  const generated = counts.GENERATED;
  const sent      = counts.SENT;
  const totalWithCert = counts.total || (items.length);

  return (
    <>
      <ToastContainer toasts={toasts} dismiss={dismiss} />

      {/* Email preview modal */}
      {previewCert && (
        <EmailPreviewModal
          certId={previewCert.id}
          runnerName={previewCert.name}
          onClose={() => setPreviewCert(null)}
          getToken={() => getToken().catch(() => null)}
        />
      )}

      {/* Resend all confirm modal */}
      {showResendModal && (
        <ResendAllModal
          totalCount={totalWithCert}
          onConfirm={() => void handleResendAll()}
          onClose={() => !resendAllBusy && setShowResendModal(false)}
          busy={resendAllBusy}
        />
      )}

      <div className="admin-stack">
        <AdminPageHeader
          kicker="Fulfillment"
          title="Certificates"
          description="Send finisher certificates to runners. Certificates are created automatically when you approve a GPS proof."
        />

        {/* ── How it works banner ── */}
        <div className="rounded-xl border border-[var(--sage-soft)] bg-[var(--sage-soft)] px-4 py-3">
          <div className="flex items-start gap-2.5">
            <Info className="h-4 w-4 mt-0.5 shrink-0 text-[var(--sage)]" />
            <div className="text-xs text-[var(--foreground)] space-y-0.5">
              <p><strong className="text-[var(--foreground)]">How certificates work:</strong></p>
              <p><strong>Pending</strong> → Proof approved, certificate number assigned, runner has nothing yet.</p>
              <p><strong>Ready</strong> → Verify link generated, certificate is viewable online, but email not sent.</p>
              <p><strong>Emailed</strong> → Runner received the certificate in their inbox. ✓ Done.</p>
              <p className="pt-1 text-[var(--muted)]">Use <em>&quot;Preview Email&quot;</em> (👁️) to see exactly how the email looks before sending.</p>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="admin-stat-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0,1fr))" }}>
          <div className="admin-stat">
            <div className="label">Pending</div>
            <div className="value">{queued}</div>
            <div className="hint">Awaiting action</div>
          </div>
          <div className="admin-stat">
            <div className="label">Ready to send</div>
            <div className="value">{generated}</div>
            <div className="hint">Link ready, not emailed</div>
          </div>
          <div className="admin-stat">
            <div className="label">Emailed</div>
            <div className="value">{sent}</div>
            <div className="hint">Runner received it</div>
          </div>
        </div>

        {/* ── Bulk action bar ── */}
        <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">Bulk actions</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={bulkBusy || queued === 0}
              onClick={() => void runBulk("/api/admin/certificates/bulk-generate?limit=50", "Generate pending")}
              className="btn btn-secondary h-9 gap-2 text-sm disabled:opacity-40"
            >
              <FileCheck className="h-4 w-4" />
              Generate pending ({queued})
              <span className="text-xs text-[var(--muted)]">— creates verify links</span>
            </button>

            <button
              type="button"
              disabled={bulkBusy || (generated === 0 && queued === 0)}
              onClick={() => void runBulk("/api/admin/certificates/bulk-send?limit=50", "Email all ready")}
              className="btn btn-primary h-9 gap-2 text-sm disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
              Email all ready ({generated})
              <span className="text-xs text-white/70">— sends to runners</span>
            </button>

            {/* ── RESEND ALL BUTTON ── */}
            <button
              type="button"
              disabled={bulkBusy || resendAllBusy || totalWithCert === 0}
              onClick={() => setShowResendModal(true)}
              className="btn h-9 gap-2 text-sm disabled:opacity-40 font-semibold"
              style={{
                background: "linear-gradient(135deg, #172c34, #244855)",
                color: "#fbe9d0",
                border: "1.5px solid #e64833",
                borderRadius: "var(--radius-sm)",
                boxShadow: "0 2px 8px rgba(36,72,85,0.25)",
              }}
              title="Resend the new premium certificate email to ALL participants"
            >
              <RotateCcw className="h-4 w-4" />
              🏅 Resend All ({totalWithCert})
              <span className="text-xs text-white/70">— new template</span>
            </button>

            <button
              type="button"
              disabled={bulkBusy}
              onClick={() => void load()}
              className="btn btn-ghost h-9"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Search & Filter Toolbar ── */}
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-[var(--line)] bg-[var(--panel)]">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)] pointer-events-none" />
            <input
              type="text"
              className="input pl-9 pr-8 w-full text-sm h-10"
              placeholder="Search runner name, email, bib #, cert #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--muted)] hover:text-[var(--foreground)]"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Status Dropdown Filter */}
          <div className="w-48">
            <select
              className="input text-sm h-10 w-full"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All statuses ({totalWithCert})</option>
              <option value="QUEUED">Pending ({queued})</option>
              <option value="GENERATED">Ready to email ({generated})</option>
              <option value="SENT">Emailed ({sent})</option>
            </select>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="table-wrap table-scroll admin-fill">
          {items.length === 0 ? (
            <div className="admin-panel-pad">
              <AdminEmpty>
                {statusFilter
                  ? `No certificates with status "${statusFilter}".`
                  : "No certificates yet — approve a GPS proof to create one."}
              </AdminEmpty>
            </div>
          ) : (
            <table className="table-clean min-w-[920px]">
              <thead>
                <tr>
                  <th>Runner</th>
                  <th>Event</th>
                  <th>Cert #</th>
                  <th>Status</th>
                  <th>Issued</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => {
                  const busy = busyId === row.id;
                  const statusInfo = STATUS_INFO[row.status] ?? { label: row.status, color: "badge", hint: "" };
                  return (
                    <tr key={row.id}>
                      <td>
                        <div className="strong">{row.registration.user.name}</div>
                        <div className="admin-muted text-xs">{row.registration.user.email}</div>
                      </td>
                      <td>
                        <div className="text-sm">{row.registration.event.title}</div>
                        <div className="admin-muted text-xs">Bib {row.registration.bibNumber}</div>
                      </td>
                      <td className="font-mono text-xs strong">{row.certificateNumber}</td>
                      <td>
                        <span className={statusInfo.color} title={statusInfo.hint}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="text-xs text-[var(--muted)]">
                        {row.issuedAt ? formatDateTime(row.issuedAt) : "—"}
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {/* Preview email button — always visible */}
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => setPreviewCert({ id: row.id, name: row.registration.user.name })}
                            className="btn btn-ghost h-8 w-8 items-center justify-center p-0"
                            title="Preview certificate email"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          {/* Only show Generate if not yet generated */}
                          {row.status === "QUEUED" && (
                            <button type="button" disabled={busy}
                              onClick={() => void runAction(row.id, `/api/admin/certificates/${row.id}/generate`, `Verify link created for ${row.registration.user.name}`)}
                              className="btn btn-secondary h-8 px-2.5 text-xs gap-1 disabled:opacity-40"
                            >
                              <FileCheck className="h-3.5 w-3.5" /> Generate link
                            </button>
                          )}

                          {/* Send email — available for GENERATED and QUEUED */}
                          {row.status !== "SENT" && (
                            <button type="button" disabled={busy}
                              onClick={() => void runAction(row.id, `/api/admin/certificates/${row.id}/send`, `Certificate emailed to ${row.registration.user.email}`)}
                              className="btn btn-primary h-8 px-2.5 text-xs gap-1 disabled:opacity-40"
                            >
                              <Mail className="h-3.5 w-3.5" /> Send email
                            </button>
                          )}

                          {/* Re-send if already sent */}
                          {row.status === "SENT" && (
                            <button type="button" disabled={busy}
                              onClick={() => void runAction(row.id, `/api/admin/certificates/${row.id}/send`, `Re-sent certificate to ${row.registration.user.email}`)}
                              className="btn btn-secondary h-8 px-2.5 text-xs gap-1 disabled:opacity-40"
                            >
                              <RotateCcw className="h-3.5 w-3.5" /> Re-send
                            </button>
                          )}

                          {/* View certificate */}
                          <Link href={`/certificates/${row.certificateNumber}`} target="_blank"
                            className="btn btn-ghost h-8 w-8 items-center justify-center p-0"
                            title="View certificate">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
