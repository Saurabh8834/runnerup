"use client";

import { useAuth } from "@clerk/nextjs";
import { FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { authHeaders, getApiUrl } from "../../../lib/api";
import { adminFetch, formatDateTime } from "../../../lib/admin-api";
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
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const token = await getToken().catch(() => null);
      const params = new URLSearchParams({ pageSize: "50" });
      if (q.trim()) params.set("q", q.trim());
      if (role) params.set("role", role);
      const json = await adminFetch<{ data: UserRow[]; meta: { total: number } }>(
        `/api/admin/users?${params}`,
        token,
      );
      setItems(json.data);
      setTotal(json.meta?.total ?? json.data.length);
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
    try {
      const token = await getToken().catch(() => null);
      const response = await fetch(getApiUrl("/api/admin/users/export.csv"), {
        headers: authHeaders(token),
      });
      if (!response.ok) {
        setError("Excel export failed");
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `RunnerUp-Users-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Excel export failed");
    } finally {
      setExporting(false);
    }
  }

  const paidUsersCount = items.filter((u) => u.hasPaid).length;

  return (
    <div className="admin-stack">
      <AdminPageHeader
        kicker="People"
        title="Users"
        description={`${total} total · ${paidUsersCount} Paid (🟢) · ${items.length - paidUsersCount} Unpaid (🔴)`}
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

      {error ? <p className="admin-muted" style={{ color: "var(--danger)" }}>{error}</p> : null}

      <div className="table-wrap table-scroll admin-fill">
        <table className="table-clean min-w-[800px]">
          <thead>
            <tr>
              {["Customer / User", "Payment Status", "Role", "Phone", "Registrations", "Joined", ""].map((h) => (
                <th key={h || "a"}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((user) => {
              const isPaid = Boolean(user.hasPaid);

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
                    <Link
                      className="text-sm font-medium underline-offset-2 hover:underline text-amber-500 hover:text-amber-400"
                      href={`/admin/users/${user.id}`}
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
