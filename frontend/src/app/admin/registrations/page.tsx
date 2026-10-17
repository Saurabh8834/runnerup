"use client";

import { useAuth } from "@clerk/nextjs";
import { AlertTriangle, CheckCircle2, FileSpreadsheet, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { adminFetch, downloadAdminExport, formatDateTime, formatInrFromPaise } from "../../../lib/admin-api";
import { AdminPageHeader, CustomerStatusDot } from "../ui";

type Row = {
  id: string;
  bibNumber: string;
  distance: string;
  status: string;
  proofStatus: string;
  registeredAt: string;
  user: { name: string; email: string };
  event: { title: string };
  payment?: { status: string; amountInPaise: number } | null;
};

export default function AdminRegistrationsPage() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Double-Confirmation Delete States (Ask Twice)
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [confirmInput, setConfirmInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const token = await getToken().catch(() => null);
      const params = new URLSearchParams({ pageSize: "50" });
      if (q.trim()) params.set("q", q.trim());
      if (status) params.set("status", status);
      const json = await adminFetch<{ data: Row[]; meta: { total: number } }>(
        `/api/admin/registrations?${params}`,
        token,
      );
      setItems(json.data);
      setTotal(json.meta.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [getToken, q, status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function exportExcel() {
    setExporting(true);
    setError(null);
    try {
      const token = await getToken().catch(() => null);
      await downloadAdminExport(
        "/api/admin/registrations/export.csv",
        `RunnerUp-Registrations-${new Date().toISOString().slice(0, 10)}.csv`,
        token,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Excel export failed");
    } finally {
      setExporting(false);
    }
  }

  function startDelete(row: Row) {
    setDeleteTarget(row);
    setDeleteStep(1);
    setConfirmInput("");
    setError(null);
  }

  function closeDeleteModal() {
    if (isDeleting) return;
    setDeleteTarget(null);
    setDeleteStep(1);
    setConfirmInput("");
  }

  async function executeDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    try {
      const token = await getToken().catch(() => null);
      await adminFetch(`/api/admin/registrations/${deleteTarget.id}`, token, {
        method: "DELETE",
      });
      setSuccessMsg(`Registration ${deleteTarget.bibNumber} (${deleteTarget.user.name}) deleted successfully.`);
      closeDeleteModal();
      await load();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete registration");
    } finally {
      setIsDeleting(false);
    }
  }

  const paidCount = items.filter(
    (r) => r.payment?.status === "PAID" || r.status === "CONFIRMED" || r.status === "COMPLETED",
  ).length;

  return (
    <div className="admin-stack">
      <AdminPageHeader
        kicker="Operations"
        title="Registrations"
        description={`${total} total · ${paidCount} Paid (🟢) · ${items.length - paidCount} Unpaid (🔴)`}
        actions={
          <button
            className="btn btn-secondary flex items-center gap-2 text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60"
            disabled={exporting}
            onClick={() => void exportExcel()}
            type="button"
            title="Download registrations in an Excel-compatible spreadsheet"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>{exporting ? "Generating Sheet..." : "Download Excel Sheet"}</span>
          </button>
        }
      />

      <div className="admin-toolbar">
        <input
          className="input"
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, bib, phone"
          value={q}
        />
        <select className="input" onChange={(e) => setStatus(e.target.value)} value={status}>
          <option value="">All statuses</option>
          {["PENDING_PAYMENT", "CONFIRMED", "CANCELLED", "COMPLETED"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={() => void load()} type="button">
          Refresh
        </button>
      </div>

      {successMsg ? (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      ) : null}

      {error ? (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="table-wrap table-scroll admin-fill">
        <table className="table-clean min-w-[840px]">
          <thead>
            <tr>
              {["Bib", "Customer / Runner", "Event", "Distance", "Status", "Proof", "Payment", "Registered", "Actions"].map(
                (h) => (
                  <th key={h || "actions"}>{h}</th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((row) => {
              const isPaid =
                row.payment?.status === "PAID" ||
                row.status === "CONFIRMED" ||
                row.status === "COMPLETED";

              return (
                <tr key={row.id}>
                  <td className="font-mono text-xs">{row.bibNumber}</td>
                  <td className="strong">
                    <div className="flex items-center gap-2">
                      <CustomerStatusDot isPaid={isPaid} />
                      <span className="font-semibold">{row.user.name}</span>
                    </div>
                    <div className="text-xs font-normal text-[var(--muted)] pl-4.5">{row.user.email}</div>
                  </td>
                  <td>{row.event.title}</td>
                  <td>{row.distance}</td>
                  <td>
                    <span className="badge">{row.status}</span>
                  </td>
                  <td>
                    <span className="badge">{row.proofStatus}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <CustomerStatusDot isPaid={isPaid} showLabel paidLabel="PAID" unpaidLabel="UNPAID" />
                      {row.payment ? (
                        <span className="text-xs font-mono font-medium text-[var(--muted)]">
                          {formatInrFromPaise(row.payment.amountInPaise)}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="text-xs">{formatDateTime(row.registeredAt)}</td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Link
                        className="text-xs font-semibold px-2 py-1 rounded bg-[var(--panel-soft)] text-amber-400 hover:text-amber-300 hover:bg-[var(--border)] transition-colors"
                        href={`/admin/registrations/${row.id}`}
                      >
                        Open
                      </Link>
                      <button
                        type="button"
                        onClick={() => startDelete(row)}
                        className="text-xs flex items-center gap-1 text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/15 px-2 py-1 rounded transition-colors"
                        title="Delete fake / test registration"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Double-Confirmation Delete Registration Modal (Ask Twice Safety) ── */}
      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-[#0f171c] border border-rose-500/30 p-6 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={closeDeleteModal}
              disabled={isDeleting}
              className="absolute top-4 right-4 text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>

            {/* STEP 1: First Warning */}
            {deleteStep === 1 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <Trash2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Delete Fake / Demo Registration?</h3>
                    <p className="text-xs text-rose-300/80">Step 1 of 2: Preliminary Warning</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1.5 text-xs text-white/80">
                  <p><strong className="text-white">Bib Number:</strong> <span className="font-mono text-amber-300">{deleteTarget.bibNumber}</span></p>
                  <p><strong className="text-white">Customer:</strong> {deleteTarget.user.name} ({deleteTarget.user.email})</p>
                  <p><strong className="text-white">Event:</strong> {deleteTarget.event.title} · {deleteTarget.distance}</p>
                  <p><strong className="text-white">Status:</strong> {deleteTarget.status}</p>
                </div>

                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 leading-relaxed">
                  ⚠️ <strong>Caution:</strong> This will delete this specific registration, its GPS proof, certificate, medal delivery, and payment entry. This action <strong>cannot be undone</strong>.
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeDeleteModal}
                    className="btn btn-secondary px-4 py-2 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteStep(2)}
                    className="btn px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-all"
                  >
                    Proceed to Final Confirmation &rarr;
                  </button>
                </div>
              </div>
            ) : null}

            {/* STEP 2: Second Ask (Requires Typing Bib Number or DELETE) */}
            {deleteStep === 2 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-rose-600/20 border border-rose-500/50 flex items-center justify-center text-rose-400">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-rose-400">Final Confirmation (Step 2 of 2)</h3>
                    <p className="text-xs text-white/60">Confirm you are not accidentally deleting a real customer</p>
                  </div>
                </div>

                <p className="text-xs text-white/80 leading-relaxed">
                  To confirm you want to permanently delete this registration, please type the bib number or <strong className="text-rose-300 font-mono">DELETE</strong> below:
                </p>

                <div className="p-2.5 rounded-lg bg-black/60 border border-rose-500/30 text-center font-mono text-sm text-amber-300 font-semibold select-all">
                  {deleteTarget.bibNumber}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-white/70">Type bib number or DELETE to confirm:</label>
                  <input
                    type="text"
                    className="input w-full font-mono text-xs"
                    placeholder={`Type ${deleteTarget.bibNumber} or DELETE`}
                    value={confirmInput}
                    onChange={(e) => setConfirmInput(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteStep(1)}
                    disabled={isDeleting}
                    className="btn btn-secondary px-3 py-1.5 text-xs text-white/70"
                  >
                    &larr; Back to Step 1
                  </button>
                  <button
                    type="button"
                    onClick={() => void executeDelete()}
                    disabled={
                      isDeleting ||
                      (confirmInput.trim().toUpperCase() !== deleteTarget.bibNumber.toUpperCase() &&
                        confirmInput.trim().toUpperCase() !== "DELETE")
                    }
                    className="btn px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:pointer-events-none text-white rounded-lg shadow-lg shadow-rose-950/50 transition-all flex items-center gap-2"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{isDeleting ? "Deleting..." : "Permanently Delete Registration"}</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
