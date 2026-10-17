"use client";

import { useAuth } from "@clerk/nextjs";
import { AlertTriangle, CheckCircle2, FileSpreadsheet, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { adminFetch, downloadAdminExport, formatDateTime } from "../../../lib/admin-api";
import { AdminPageHeader, CustomerStatusDot } from "../ui";

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  clerkId: string | null;
  createdAt: string;
  _count?: { registrations: number };
  hasPaid?: boolean;
  paidCount?: number;
  totalPaidInr?: number;
};

export default function AdminUsersPage() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<UserRow[]>([]);
  const [meta, setMeta] = useState({ total: 0, totalPaidUsers: 0, totalUnpaidUsers: 0 });
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Double-Confirmation Delete States
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [confirmEmailInput, setConfirmEmailInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const token = await getToken().catch(() => null);
      const params = new URLSearchParams({ pageSize: "50" });
      if (q.trim()) params.set("q", q.trim());
      if (role) params.set("role", role);
      const json = await adminFetch<{
        data: UserRow[];
        meta: { total: number; totalPaidUsers?: number; totalUnpaidUsers?: number };
      }>(`/api/admin/users?${params}`, token);
      let userList = json.data;
      let totalPaid = json.meta?.totalPaidUsers;
      let totalUnpaid = json.meta?.totalUnpaidUsers;

      // Bulletproof fallback: If backend response doesn't include hasPaid, cross-reference with registrations
      if (totalPaid === undefined || userList.some((u) => u.hasPaid === undefined)) {
        try {
          const regJson = await adminFetch<{
            data: Array<{
              status: string;
              user: { email: string };
              payment?: { status: string } | null;
            }>;
          }>("/api/admin/registrations?pageSize=1000", token);

          const paidEmails = new Set(
            (regJson.data || [])
              .filter(
                (r) =>
                  r.payment?.status === "PAID" ||
                  r.status === "CONFIRMED" ||
                  r.status === "COMPLETED",
              )
              .map((r) => r.user?.email?.toLowerCase().trim())
              .filter(Boolean),
          );

          userList = userList.map((u) => ({
            ...u,
            hasPaid: u.hasPaid ?? paidEmails.has(u.email.toLowerCase().trim()),
          }));

          const calculatedPaid = userList.filter((u) => u.hasPaid).length;
          totalPaid = totalPaid ?? calculatedPaid;
          totalUnpaid = totalUnpaid ?? Math.max(0, (json.meta?.total ?? userList.length) - calculatedPaid);
        } catch {
          // If fallback fails, keep original
        }
      }

      setItems(userList);

      const paidInPage = userList.filter((u) => {
        return Boolean(u.hasPaid ?? ((u.paidCount && u.paidCount > 0) || (u.totalPaidInr && u.totalPaidInr > 0)));
      }).length;

      setMeta({
        total: json.meta?.total ?? userList.length,
        totalPaidUsers: totalPaid ?? paidInPage,
        totalUnpaidUsers: totalUnpaid ?? Math.max(0, (json.meta?.total ?? userList.length) - paidInPage),
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [getToken, q, role]);

  useEffect(() => {
    void load();
  }, [load]);

  async function exportExcel() {
    setExporting(true);
    setError(null);
    try {
      const token = await getToken().catch(() => null);
      await downloadAdminExport(
        "/api/admin/users/export.csv",
        `RunnerUp-Users-${new Date().toISOString().slice(0, 10)}.csv`,
        token,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Excel export failed");
    } finally {
      setExporting(false);
    }
  }

  function startDelete(user: UserRow) {
    const emailLower = user.email.toLowerCase().trim();
    if (emailLower === "sourav06556@gmail.com" || emailLower === "realblack009@gmail.com") {
      setError("Cannot delete protected admin account.");
      return;
    }
    setDeleteTarget(user);
    setDeleteStep(1);
    setConfirmEmailInput("");
    setDeleteError(null);
    setError(null);
  }

  function closeDeleteModal() {
    if (isDeleting) return;
    setDeleteTarget(null);
    setDeleteStep(1);
    setConfirmEmailInput("");
    setDeleteError(null);
  }

  async function executeDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    setError(null);
    try {
      const token = await getToken().catch(() => null);
      await adminFetch(`/api/admin/users/${deleteTarget.id}`, token, {
        method: "DELETE",
      });
      const targetName = deleteTarget.name;
      const targetEmail = deleteTarget.email;
      const targetId = deleteTarget.id;
      setItems((prev) => prev.filter((u) => u.id !== targetId));
      setMeta((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }));
      setSuccessMsg(`User ${targetName} (${targetEmail}) and all test data were permanently deleted.`);
      closeDeleteModal();
      await load();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete user";
      setDeleteError(msg);
      setError(msg);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="admin-stack">
      <AdminPageHeader
        kicker="People"
        title="Users"
        description={`${meta.total} total · ${meta.totalPaidUsers} Paid (🟢) · ${meta.totalUnpaidUsers} Unpaid (🔴)`}
        actions={
          <button
            className="btn btn-secondary flex items-center gap-2 text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60"
            disabled={exporting}
            onClick={() => void exportExcel()}
            type="button"
            title="Download users directory in an Excel-compatible spreadsheet"
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
          placeholder="Name, email, phone, clerk id"
          value={q}
        />
        <select className="input" onChange={(e) => setRole(e.target.value)} value={role}>
          <option value="">All roles</option>
          {["RUNNER", "ADMIN", "SUPER_ADMIN"].map((r) => (
            <option key={r} value={r}>
              {r}
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
        <table className="table-clean min-w-[800px]">
          <thead>
            <tr>
              {["Customer / User", "Payment Status", "Role", "Phone", "Registrations", "Joined", "Actions"].map((h) => (
                <th key={h || "a"}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((user) => {
              const isPaid = Boolean(user.hasPaid ?? ((user.paidCount && user.paidCount > 0) || (user.totalPaidInr && user.totalPaidInr > 0)));
              const isProtected = user.email.toLowerCase() === "sourav06556@gmail.com" || user.email.toLowerCase() === "realblack009@gmail.com";

              return (
                <tr key={user.id}>
                  <td className="strong">
                    <div className="flex items-center gap-2">
                      <CustomerStatusDot isPaid={isPaid} />
                      <span className="font-semibold">{user.name}</span>
                    </div>
                    <div className="text-xs font-normal text-[var(--muted)] pl-4.5">{user.email}</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <CustomerStatusDot
                        isPaid={isPaid}
                        showLabel
                        paidLabel="PAID"
                        unpaidLabel="UNPAID"
                      />
                      {isPaid && user.totalPaidInr ? (
                        <span className="text-xs font-mono font-medium text-emerald-400">
                          ₹{user.totalPaidInr}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <span className="badge">{user.role}</span>
                  </td>
                  <td>{user.phone ?? "—"}</td>
                  <td>
                    <span className="text-xs font-mono font-medium">
                      {user._count?.registrations ?? 0} {user._count?.registrations === 1 ? "reg" : "regs"}
                    </span>
                  </td>
                  <td className="text-xs">{formatDateTime(user.createdAt)}</td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Link
                        className="text-xs font-semibold px-2 py-1 rounded bg-[var(--panel-soft)] text-amber-400 hover:text-amber-300 hover:bg-[var(--border)] transition-colors"
                        href={`/admin/users/${user.id}`}
                      >
                        Open
                      </Link>
                      {!isProtected ? (
                        <button
                          type="button"
                          onClick={() => startDelete(user)}
                          className="text-xs flex items-center gap-1 text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/15 px-2 py-1 rounded transition-colors"
                          title="Delete user and fake/test data"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Double-Confirmation Delete Modal (Ask Twice Safety) ── */}
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
                    <h3 className="text-lg font-bold text-white">Delete User & Test Data?</h3>
                    <p className="text-xs text-rose-300/80">Step 1 of 2: Preliminary Warning</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1.5 text-xs text-white/80">
                  <p><strong className="text-white">Customer:</strong> {deleteTarget.name}</p>
                  <p><strong className="text-white">Email:</strong> {deleteTarget.email}</p>
                  <p><strong className="text-white">Registrations:</strong> {deleteTarget._count?.registrations ?? 0} entry(s)</p>
                </div>

                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 leading-relaxed">
                  ⚠️ <strong>Caution:</strong> This will permanently delete this runner, their registration entries, payments, and proofs from the database. This action <strong>cannot be undone</strong>.
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

            {/* STEP 2: Second Ask (Requires Typing User Email) */}
            {deleteStep === 2 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-rose-600/20 border border-rose-500/50 flex items-center justify-center text-rose-400">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-rose-400">Final Confirmation (Step 2 of 2)</h3>
                    <p className="text-xs text-white/60">Confirm you are not accidentally deleting a real user</p>
                  </div>
                </div>

                <p className="text-xs text-white/80 leading-relaxed">
                  To confirm you want to permanently delete this user and their fake registrations, please type their email address below:
                </p>

                <div
                  onClick={() => setConfirmEmailInput(deleteTarget.email)}
                  title="Click to copy into input box"
                  className="p-2.5 rounded-lg bg-black/60 border border-rose-500/30 text-center font-mono text-xs text-amber-300 font-semibold select-all cursor-pointer hover:border-amber-400/50 hover:bg-black/80 transition-all flex items-center justify-center gap-2"
                >
                  <span>{deleteTarget.email}</span>
                  <span className="text-[10px] text-white/40 font-sans font-normal">(click to fill)</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-white/70">Type email to confirm (or type DELETE):</label>
                  <input
                    type="text"
                    className="input w-full font-mono text-xs"
                    placeholder={`Type ${deleteTarget.email} or DELETE`}
                    value={confirmEmailInput}
                    onChange={(e) => setConfirmEmailInput(e.target.value)}
                    autoFocus
                  />
                </div>

                {deleteError ? (
                  <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <span>{deleteError}</span>
                  </div>
                ) : null}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteStep(1);
                      setDeleteError(null);
                    }}
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
                      (confirmEmailInput.trim().toLowerCase() !== deleteTarget.email.toLowerCase() &&
                        confirmEmailInput.trim().toUpperCase() !== "DELETE")
                    }
                    className="btn px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:pointer-events-none text-white rounded-lg shadow-lg shadow-rose-950/50 transition-all flex items-center gap-2"
                  >
                    <Trash2 className={`h-3.5 w-3.5 ${isDeleting ? "animate-spin" : ""}`} />
                    <span>{isDeleting ? "Deleting from Database & Clerk..." : "Permanently Delete User"}</span>
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
