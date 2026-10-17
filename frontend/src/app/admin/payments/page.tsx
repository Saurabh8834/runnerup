"use client";

import { useAuth } from "@clerk/nextjs";
import { Check, Copy, FileSpreadsheet, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { adminFetch, downloadAdminExport, formatDateTime, formatInrFromPaise } from "../../../lib/admin-api";
import { AdminPageHeader, CustomerStatusDot } from "../ui";

type PaymentRow = {
  id: string;
  status: string;
  amountInPaise: number;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  createdAt: string;
  paidAt: string | null;
  registration: {
    bibNumber: string;
    shippingPhone?: string | null;
    user: { name: string; email: string; phone?: string | null };
    event: { title: string };
  };
};

export default function AdminPaymentsPage() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<PaymentRow[]>([]);
  const [meta, setMeta] = useState({ paidCount: 0, paidRevenueInPaise: 0, total: 0 });
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

  const copyPhone = async (id: string, phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopiedPhoneId(id);
      setTimeout(() => {
        setCopiedPhoneId((curr) => (curr === id ? null : curr));
      }, 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = phone;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedPhoneId(id);
      setTimeout(() => {
        setCopiedPhoneId((curr) => (curr === id ? null : curr));
      }, 2000);
    }
  };

  const load = useCallback(async () => {
    try {
      const token = await getToken().catch(() => null);
      const params = new URLSearchParams({ pageSize: "50" });
      if (status) params.set("status", status);
      if (q.trim()) params.set("q", q.trim());
      const json = await adminFetch<{
        data: PaymentRow[];
        meta: { paidCount: number; paidRevenueInPaise: number; total: number };
      }>(`/api/admin/payments?${params}`, token);
      setItems(json.data);
      setMeta(json.meta);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [getToken, q, status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setPaymentStatus(id: string, next: string) {
    try {
      const token = await getToken().catch(() => null);
      await adminFetch(`/api/admin/payments/${id}`, token, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function syncPayments() {
    setSyncing(true);
    setSyncResult(null);
    setError(null);
    try {
      const token = await getToken().catch(() => null);
      const json = await adminFetch<{
        data: { synced: number; totalPaid: number; totalRevenue: number; message: string; errors?: Array<{ id: string; orderId: string; error: string }> };
      }>("/api/admin/payments/sync", token, { method: "POST" });
      setSyncResult(json.data.message);
      if (json.data.errors?.length) {
        setError(`${json.data.errors.length} error(s). Check server logs.`);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  async function exportExcel() {
    setExporting(true);
    setError(null);
    try {
      const token = await getToken().catch(() => null);
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (status) params.set("status", status);
      const query = params.toString() ? `?${params.toString()}` : "";
      await downloadAdminExport(
        `/api/admin/payments/export.csv${query}`,
        `RunnerUp-Payments-${new Date().toISOString().slice(0, 10)}.csv`,
        token,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Excel export failed");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="admin-stack">
      <AdminPageHeader
        kicker="Finance"
        title="Payments"
        description={`Paid ${meta.paidCount} (🟢) · Total Revenue ${formatInrFromPaise(meta.paidRevenueInPaise)}`}
        actions={
          <div className="flex items-center gap-2">
            <button
              className="btn btn-secondary flex items-center gap-1.5 text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60"
              disabled={exporting}
              onClick={() => void exportExcel()}
              type="button"
              title="Download payment records in an Excel-compatible spreadsheet"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>{exporting ? "Generating Sheet..." : "Download Excel Sheet"}</span>
            </button>
            <button
              className="btn btn-secondary flex items-center gap-1.5 text-amber-500 border-amber-500/30"
              disabled={syncing}
              onClick={() => void syncPayments()}
              type="button"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
              <span>{syncing ? "Syncing..." : "Sync Razorpay"}</span>
            </button>
          </div>
        }
      />

      <div className="admin-toolbar">
        <input
          className="input"
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search order id, email, bib"
          value={q}
        />
        <select className="input" onChange={(e) => setStatus(e.target.value)} value={status}>
          <option value="">All</option>
          {["CREATED", "PAID", "FAILED", "REFUNDED"].map((s) => (
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
      {syncResult ? <p className="admin-muted" style={{ color: "var(--sage)" }}>{syncResult}</p> : null}

      <div className="table-wrap table-scroll admin-fill">
        <table className="table-clean min-w-[880px]">
          <thead>
            <tr>
              {["Amount", "Payment Status", "Customer / Runner", "Event", "Bib", "Razorpay Order ID", "When", "Actions"].map(
                (h) => (
                  <th key={h}>{h}</th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((row) => {
              const isPaid = row.status === "PAID";
              const contactPhone = row.registration.user?.phone || row.registration.shippingPhone;

              return (
                <tr key={row.id}>
                  <td className="strong text-sm">
                    <span className={isPaid ? "text-emerald-400 font-bold" : "text-(--muted)"}>
                      {formatInrFromPaise(row.amountInPaise)}
                    </span>
                  </td>
                  <td>
                    <CustomerStatusDot
                      isPaid={isPaid}
                      showLabel
                      paidLabel="PAID"
                      unpaidLabel={row.status}
                    />
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <CustomerStatusDot isPaid={isPaid} />
                      <span className="font-semibold">{row.registration.user.name}</span>
                    </div>
                    <div className="text-xs text-[var(--muted)] pl-4.5">
                      {row.registration.user.email}
                    </div>
                    {contactPhone ? (
                      <div className="mt-1 flex items-center gap-1.5 pl-4.5 text-xs">
                        <span className="font-mono text-zinc-300">{contactPhone}</span>
                        <button
                          type="button"
                          onClick={() => void copyPhone(row.id, contactPhone)}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all border border-emerald-500/20 cursor-pointer"
                          title="Click to copy contact number in 1 click"
                        >
                          {copiedPhoneId === row.id ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span className="font-semibold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 text-emerald-400" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="mt-0.5 text-[11px] text-[var(--muted)] pl-4.5 italic">
                        No phone
                      </div>
                    )}
                  </td>
                  <td>{row.registration.event.title}</td>
                  <td className="font-mono text-xs">{row.registration.bibNumber}</td>
                  <td className="max-w-[12rem] truncate font-mono text-xs text-[var(--muted)]" title={row.razorpayOrderId}>
                    {row.razorpayOrderId}
                  </td>
                  <td className="text-xs">{formatDateTime(row.paidAt ?? row.createdAt)}</td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {row.status !== "PAID" ? (
                        <button
                          className="btn btn-secondary h-8 px-2 text-xs"
                          onClick={() => void setPaymentStatus(row.id, "PAID")}
                          type="button"
                        >
                          Mark paid
                        </button>
                      ) : null}
                      {row.status === "PAID" ? (
                        <button
                          className="btn btn-ghost h-8 px-2 text-xs"
                          onClick={() => void setPaymentStatus(row.id, "REFUNDED")}
                          type="button"
                        >
                          Refund
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
    </div>
  );
}
