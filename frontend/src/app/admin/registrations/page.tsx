"use client";

import { useAuth } from "@clerk/nextjs";
import { Download, FileSpreadsheet } from "lucide-react";
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

      {error ? <p className="admin-muted" style={{ color: "var(--danger)" }}>{error}</p> : null}

      <div className="table-wrap table-scroll admin-fill">
        <table className="table-clean min-w-[840px]">
          <thead>
            <tr>
              {["Bib", "Customer / Runner", "Event", "Distance", "Status", "Proof", "Payment", "Registered", ""].map(
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
                    <Link
                      className="text-sm font-medium underline-offset-2 hover:underline text-amber-500 hover:text-amber-400"
                      href={`/admin/registrations/${row.id}`}
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
