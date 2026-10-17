"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { adminFetch, formatDateTime, formatInrFromPaise } from "../../../../lib/admin-api";
import { optimizeCloudinaryUrl } from "../../../../lib/cloudinary";
import { AdminBackLink, AdminPageHeader, AdminPanel } from "../../ui";

type RegistrationDetail = {
  id: string;
  bibNumber: string;
  distance: string;
  status: string;
  proofStatus: string;
  finishTimeSeconds: number | null;
  adminNote: string | null;
  registeredAt: string;
  shippingName: string;
  shippingPhone: string;
  shippingLine1: string;
  shippingLine2: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  user: { id: string; name: string; email: string; phone: string | null; role: string };
  event: { id: string; title: string; slug: string; priceInPaise: number };
  payment?: {
    id: string;
    status: string;
    amountInPaise: number;
    razorpayOrderId: string;
    razorpayPaymentId: string | null;
    paidAt: string | null;
  } | null;
  proofUpload?: {
    activityImageUrl: string;
    sourceApp: string;
    status: string;
    reviewerNote: string | null;
  } | null;
  certificate?: { id: string; certificateNumber: string; status: string } | null;
  medalDelivery?: {
    id: string;
    status: string;
    courier: string | null;
    trackingNumber: string | null;
  } | null;
};

export default function AdminRegistrationDetailPage() {
  const params = useParams<{ id: string }>();
  const { getToken } = useAuth();
  const [data, setData] = useState<RegistrationDetail | null>(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const token = await getToken().catch(() => null);
      const json = await adminFetch<{ data: RegistrationDetail }>(
        `/api/admin/registrations/${params.id}`,
        token,
      );
      setData(json.data);
      setNote(json.data.adminNote ?? "");
      setStatus(json.data.status);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [getToken, params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    if (!data) return;
    try {
      const token = await getToken().catch(() => null);
      await adminFetch(`/api/admin/registrations/${data.id}`, token, {
        method: "PATCH",
        body: JSON.stringify({ status, adminNote: note }),
      });
      setMessage("Saved.");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function markPaid() {
    if (!data) return;
    try {
      const token = await getToken().catch(() => null);
      await adminFetch(`/api/admin/registrations/${data.id}/mark-paid`, token, {
        method: "POST",
        body: JSON.stringify({ note: "Marked paid by admin" }),
      });
      setMessage("Marked as paid.");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Mark paid failed");
    }
  }

  if (error) {
    return <p className="text-sm text-[var(--danger)]">{error}</p>;
  }
  if (!data) {
    return <p className="text-sm text-[var(--muted)]">Loading…</p>;
  }

  return (
    <div className="admin-stack">
      <div>
        <AdminBackLink href="/admin/registrations" label="Registrations" />
      </div>
      <AdminPageHeader
        kicker="Registration"
        title={data.bibNumber}
        description={`${data.user.name} · ${data.event.title} · ${data.distance}`}
        actions={
          <>
            {data.status === "PENDING_PAYMENT" ? (
              <button className="btn btn-primary" onClick={() => void markPaid()} type="button">
                Mark paid
              </button>
            ) : null}
            <Link className="btn btn-secondary" href={`/admin/users/${data.user.id}`}>
              View user
            </Link>
          </>
        }
      />

      {message ? <p className="admin-muted">{message}</p> : null}

      <div className="admin-layout-split is-equal">
        <AdminPanel title="Runner & shipping">
          <div className="space-y-2 text-sm admin-muted">
            <p>
              {data.user.email}
              {data.user.phone ? ` · ${data.user.phone}` : ""}
            </p>
            <p style={{ color: "var(--foreground)" }}>
              {data.shippingName}
              <br />
              {data.shippingLine1}
              {data.shippingLine2 ? (
                <>
                  <br />
                  {data.shippingLine2}
                </>
              ) : null}
              <br />
              {data.shippingCity}, {data.shippingState} {data.shippingPincode}
              <br />
              {data.shippingPhone}
            </p>
            <p className="text-xs">Registered {formatDateTime(data.registeredAt)}</p>
          </div>
        </AdminPanel>

        <AdminPanel title="Payment">
          {data.payment ? (
            <div className="space-y-2 text-sm admin-muted">
              <p style={{ color: "var(--foreground)" }}>
                {data.payment.status} · {formatInrFromPaise(data.payment.amountInPaise)}
              </p>
              <p className="font-mono text-xs">order: {data.payment.razorpayOrderId}</p>
              {data.payment.razorpayPaymentId ? (
                <p className="font-mono text-xs">payment: {data.payment.razorpayPaymentId}</p>
              ) : null}
              <p className="text-xs">Paid at {formatDateTime(data.payment.paidAt)}</p>
            </div>
          ) : (
            <p className="text-sm admin-muted">No payment record.</p>
          )}
        </AdminPanel>

        <AdminPanel title="Proof">
          <div className="space-y-2 text-sm">
            <p>
              Status: <span className="badge">{data.proofStatus}</span>
            </p>
            {data.finishTimeSeconds != null ? (
              <p className="admin-muted">Finish seconds: {data.finishTimeSeconds}</p>
            ) : null}
            {data.proofUpload ? (
              <>
                <p className="admin-muted">Source: {data.proofUpload.sourceApp}</p>
                <a
                  className="mt-1 block overflow-hidden rounded-xl border border-[var(--line)]"
                  href={data.proofUpload.activityImageUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="GPS proof screenshot"
                    className="h-44 w-full object-cover"
                    src={optimizeCloudinaryUrl(data.proofUpload.activityImageUrl, 600)}
                  />
                </a>
                {data.proofUpload.reviewerNote ? (
                  <p className="admin-muted mt-2">Note: {data.proofUpload.reviewerNote}</p>
                ) : null}
              </>
            ) : (
              <p className="admin-muted">No proof uploaded.</p>
            )}
            {data.proofStatus === "SUBMITTED" ? (
              <div style={{ marginTop: "0.75rem" }}>
                <Link className="btn btn-secondary" href="/admin/proofs">
                  Open proof queue
                </Link>
              </div>
            ) : null}
          </div>
        </AdminPanel>

        <AdminPanel title="Fulfillment">
          <div className="space-y-2 text-sm admin-muted">
            <p>
              Certificate:{" "}
              {data.certificate
                ? `${data.certificate.certificateNumber} (${data.certificate.status})`
                : "—"}
            </p>
            <p>
              Medal:{" "}
              {data.medalDelivery
                ? `${data.medalDelivery.status}${
                    data.medalDelivery.trackingNumber
                      ? ` · ${data.medalDelivery.trackingNumber}`
                      : ""
                  }`
                : "—"}
            </p>
          </div>
        </AdminPanel>

        <AdminPanel className="span-2" title="Admin controls">
          <div className="space-y-3">
            <label className="block max-w-xs text-sm">
              <span className="field-label">Status</span>
              <select className="input" onChange={(e) => setStatus(e.target.value)} value={status}>
                {["PENDING_PAYMENT", "CONFIRMED", "CANCELLED", "COMPLETED"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="field-label">Internal note</span>
              <textarea
                className="input min-h-24 py-2"
                onChange={(e) => setNote(e.target.value)}
                value={note}
              />
            </label>
            <button className="btn btn-primary" onClick={() => void save()} type="button">
              Save changes
            </button>
          </div>
        </AdminPanel>
      </div>
    </div>
  );
}
