"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { adminFetch, formatDateTime } from "../../../lib/admin-api";
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
  user: { name: string; email: string };
  event: { title: string };
  proofUpload: {
    activityImageUrl: string;
    sourceApp: string;
    submittedAt?: string;
  } | null;
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
  const { getToken } = useAuth();
  const [items, setItems] = useState<ProofRow[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { toasts, dismiss, toast } = useToast();

  // Custom verified times per proof id
  const [verifiedTimes, setVerifiedTimes] = useState<Record<string, { h: string; m: string; s: string }>>({});

  // Reject modal state
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectBusy, setRejectBusy] = useState(false);

  // Lightbox modal state
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const token = await getToken().catch(() => null);
      const json = await adminFetch<{ data: ProofRow[]; meta: { total: number } }>(
        "/api/admin/proofs?status=SUBMITTED&pageSize=50",
        token,
      );
      setItems(json.data);
      setTotal(json.meta.total);

      // Initialize verifiedTimes map
      const initialMap: Record<string, { h: string; m: string; s: string }> = {};
      for (const row of json.data) {
        const parsed = formatSecondsToHms(row.finishTimeSeconds);
        initialMap[row.id] = { h: parsed.h, m: parsed.m, s: parsed.s };
      }
      setVerifiedTimes(initialMap);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [getToken]);

  useEffect(() => {
    void load();
  }, [load]);

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
      const token = await getToken().catch(() => null);
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
      const token = await getToken().catch(() => null);
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
          title="Proof queue"
          description={`${total} submission${total === 1 ? "" : "s"} waiting for review.`}
          actions={
            <button className="btn btn-secondary" onClick={() => void load()} type="button">
              Refresh
            </button>
          }
        />

        {error ? (
          <p className="admin-muted" style={{ color: "var(--danger)" }}>{error}</p>
        ) : null}

        <div className="admin-stack admin-fill">
          {items.length === 0 ? (
            <div className="admin-panel admin-panel-pad is-fill">
              <AdminEmpty>Queue is empty.</AdminEmpty>
            </div>
          ) : (
            items.map((row) => {
              const timeObj = verifiedTimes[row.id] ?? { h: "00", m: "00", s: "00" };
              const claimedParsed = formatSecondsToHms(row.finishTimeSeconds);

              return (
                <article
                  className="admin-panel admin-panel-pad grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(240px,320px)] border rounded-2xl shadow-xs"
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
                        <span className="badge font-mono font-bold">Bib #{row.bibNumber}</span>
                        <span className="badge badge-sage font-semibold">{row.distance}</span>
                      </div>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {row.event.title} · <span className="font-mono text-xs">{row.user.email}</span>
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted-soft)]">
                        Registered {formatDateTime(row.registeredAt)}
                        {row.proofUpload ? ` · App: ${row.proofUpload.sourceApp}` : ""}
                      </p>
                    </div>

                    {/* GPS Claimed Time vs Verified Time */}
                    <div className="rounded-xl border border-[var(--line)] bg-[var(--panel-soft)] p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[var(--muted)] flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" /> Claimed Finish Time:
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
                        className="btn btn-primary h-10 px-5 text-sm font-semibold shadow-xs"
                        disabled={busyId === row.id}
                        onClick={() => void approve(row.id)}
                        type="button"
                        style={{ background: "linear-gradient(135deg, #1a3a2e, #0d5c45)" }}
                      >
                        {busyId === row.id ? "Approving…" : "✓ Approve & Queue Certificate"}
                      </button>
                      <button
                        className="btn btn-secondary h-10 px-4 text-sm font-semibold"
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
                      {row.proofUpload && (
                        <a
                          href={row.proofUpload.activityImageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[0.7rem] text-[var(--sage)] hover:underline flex items-center gap-0.5"
                        >
                          Full size <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </p>
                    {row.proofUpload ? (
                      <div className="relative group rounded-xl overflow-hidden border border-[var(--line)] bg-black/5 flex-1 min-h-[160px] max-h-[220px]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          alt="GPS proof screenshot"
                          className="h-full w-full object-contain cursor-pointer transition-transform duration-200 group-hover:scale-105"
                          src={row.proofUpload.activityImageUrl}
                          onClick={() => setLightboxUrl(row.proofUpload?.activityImageUrl ?? null)}
                        />
                        <button
                          type="button"
                          onClick={() => setLightboxUrl(row.proofUpload?.activityImageUrl ?? null)}
                          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold gap-1.5"
                        >
                          <ZoomIn className="h-4 w-4" /> Click to Zoom
                        </button>
                      </div>
                    ) : (
                      <div className="grid place-items-center rounded-xl border border-dashed border-[var(--line)] text-sm text-[var(--muted)] flex-1 min-h-[160px]">
                        No image uploaded
                      </div>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
