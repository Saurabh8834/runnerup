"use client";

import { useAuth } from "@clerk/nextjs";
import { AlertTriangle, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  const router = useRouter();
  const { getToken } = useAuth();
  const [data, setData] = useState<RegistrationDetail | null>(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Double-Confirmation Delete States (Ask Twice)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [confirmInput, setConfirmInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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

  async function executeDelete() {
    if (!data) return;
    setIsDeleting(true);
    setError(null);
    try {
      const token = await getToken().catch(() => null);
      await adminFetch(`/api/admin/registrations/${data.id}`, token, {
        method: "DELETE",
      });
      router.push("/admin/registrations");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete registration");
      setIsDeleting(false);
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
          <div className="flex items-center gap-2">
            {data.status === "PENDING_PAYMENT" ? (
              <button className="btn btn-primary text-xs" onClick={() => void markPaid()} type="button">
                Mark paid
              </button>
            ) : null}
            <Link className="btn btn-secondary text-xs" href={`/admin/users/${data.user.id}`}>
              View user
            </Link>
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(true);
                setDeleteStep(1);
                setConfirmInput("");
              }}
              className="btn btn-secondary text-rose-400 border-rose-500/30 hover:border-rose-500/60 hover:bg-rose-500/10 flex items-center gap-1.5 text-xs"
              title="Delete this demo registration"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Reg</span>
            </button>
          </div>
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
            <div className="flex items-center gap-3">
              <button className="btn btn-primary" onClick={() => void save()} type="button">
                Save changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(true);
                  setDeleteStep(1);
                  setConfirmInput("");
                }}
                className="btn btn-secondary text-rose-400 border-rose-500/30 hover:bg-rose-500/10 text-xs flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete this fake registration</span>
              </button>
            </div>
          </div>
        </AdminPanel>
      </div>

      {/* ── Double-Confirmation Delete Registration Modal (Ask Twice Safety) ── */}
      {showDeleteModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-[#0f171c] border border-rose-500/30 p-6 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => {
                if (!isDeleting) setShowDeleteModal(false);
              }}
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
                    <h3 className="text-lg font-bold text-white">Delete Demo Registration?</h3>
                    <p className="text-xs text-rose-300/80">Step 1 of 2: Preliminary Warning</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1.5 text-xs text-white/80">
                  <p><strong className="text-white">Bib Number:</strong> <span className="font-mono text-amber-300 font-semibold">{data.bibNumber}</span></p>
                  <p><strong className="text-white">Customer:</strong> {data.user.name} ({data.user.email})</p>
                  <p><strong className="text-white">Event:</strong> {data.event.title} · {data.distance}</p>
                  <p><strong className="text-white">Status:</strong> {data.status}</p>
                </div>

                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 leading-relaxed">
                  ⚠️ <strong>Caution:</strong> This will delete this specific registration, its GPS proof, certificate, medal delivery, and payment entry. This action <strong>cannot be undone</strong>.
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
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
                  {data.bibNumber}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-white/70">Type bib number or DELETE to confirm:</label>
                  <input
                    type="text"
                    className="input w-full font-mono text-xs"
                    placeholder={`Type ${data.bibNumber} or DELETE`}
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
                      (confirmInput.trim().toUpperCase() !== data.bibNumber.toUpperCase() &&
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
