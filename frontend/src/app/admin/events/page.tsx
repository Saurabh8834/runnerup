"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  adminFetch,
  formatDateTime,
  formatInrFromPaise,
  toDatetimeLocalValue,
} from "../../../lib/admin-api";
import { authHeaders, getApiUrl } from "../../../lib/api";
import { AdminEmpty, AdminPageHeader } from "../ui";
import { validateMinLength } from "../../../lib/validation";
import {
  Star,
  StarOff,
  Globe,
  GlobeLock,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  ExternalLink,
  Users,
} from "lucide-react";

/* ── Toast ─────────────────────────────────────────────── */
type Toast = { id: number; type: "success" | "error" | "info"; message: string };

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg text-sm font-medium min-w-[260px] max-w-sm ${t.type === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/60 dark:text-emerald-300"
            : t.type === "error"
              ? "border-red-200 bg-red-50 text-red-800 dark:border-red-800/40 dark:bg-red-950/60 dark:text-red-300"
              : "border-[var(--line)] bg-[var(--panel)] text-[var(--foreground)]"
            }`}
        >
          <span className="mt-0.5 shrink-0">
            {t.type === "success" ? <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> :
              t.type === "error" ? <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" /> :
                <AlertCircle className="h-4 w-4" />}
          </span>
          <span className="flex-1 leading-snug">{t.message}</span>
          <button type="button" onClick={() => dismiss(t.id)} className="shrink-0 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
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
  function toast(type: Toast["type"], message: string, duration = 3500) {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }
  function dismiss(id: number) { setToasts((prev) => prev.filter((t) => t.id !== id)); }
  return { toasts, dismiss, toast };
}

/* ── Confirm modal ─────────────────────────────────────── */
function ConfirmModal({ title, message, confirmLabel = "Confirm", danger = false, onConfirm, onCancel }: {
  title: string; message: string; confirmLabel?: string; danger?: boolean;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-2xl">
        <h3 className="text-base font-bold text-[var(--foreground)]">{title}</h3>
        <p className="mt-2 text-sm text-[var(--muted)]">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="btn btn-secondary h-9">Cancel</button>
          <button type="button" onClick={onConfirm}
            className={`btn h-9 ${danger ? "bg-red-600 text-white hover:bg-red-500" : "btn-primary"}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Types ─────────────────────────────────────────────── */
type EventRow = {
  id: string; title: string; slug: string; status: string;
  startsAt: string; endsAt: string; distances: string[];
  priceInPaise: number; paymentRequired: boolean;
  medalIncluded: boolean; featured: boolean;
  maxCapacity: number | null; city: string | null;
  couponCode?: string | null; showCouponOnCard?: boolean;
  activityTypes?: string[];
  benefits?: string[];
  finishers?: number | null;
  verifiedResults?: number | null;
  cities?: number | null;
  resultNote?: string | null;
  bannerImageUrl?: string | null;
  _count?: { registrations: number };
};

const emptyForm = {
  title: "", slug: "", description: "", startsAt: "", endsAt: "",
  proofClosesAt: "", distances: "5 km, 10 km", priceInr: "499",
  paymentRequired: true, medalIncluded: true, featured: false,
  maxCapacity: "", city: "Virtual", couponCode: "", showCouponOnCard: false,
  activityTypes: ["running", "cycling", "walking"], benefits: "",
  finishers: "", verifiedResults: "", cities: "", resultNote: "",
  bannerImageUrl: "",
  status: "DRAFT",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft", OPEN: "Open", CLOSED: "Closed",
  COMPLETED: "Completed", CANCELLED: "Cancelled",
};

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "badge",
  OPEN: "badge badge-sage",
  CLOSED: "badge",
  COMPLETED: "badge badge-solid",
  CANCELLED: "badge badge-danger",
};

/* ── Page ───────────────────────────────────────────────── */
export default function AdminEventsPage() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<EventRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EventRow | null>(null);
  const { toasts, dismiss, toast } = useToast();

  const load = useCallback(async () => {
    try {
      const token = await getToken().catch(() => null);
      const json = await adminFetch<{ data: EventRow[] }>("/api/admin/events?pageSize=100", token);
      setItems(json.data);
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Failed to load events");
    }
  }, [getToken]);// eslint-disable-line

  useEffect(() => { void load(); }, [load]);

  function slugify(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
  }

  function startEdit(event: EventRow) {
    setEditingId(event.id);
    setForm({
      title: event.title, slug: event.slug, description: "",
      bannerImageUrl: "",
      startsAt: toDatetimeLocalValue(event.startsAt),
      endsAt: toDatetimeLocalValue(event.endsAt),
      proofClosesAt: "",
      distances: event.distances.join(", "),
      priceInr: String(Math.round(event.priceInPaise / 100)),
      paymentRequired: event.paymentRequired, medalIncluded: event.medalIncluded,
      featured: event.featured,
      couponCode: event.couponCode ?? "",
      showCouponOnCard: event.showCouponOnCard ?? false,
      activityTypes: event.activityTypes ?? ["running"],
      benefits: (event.benefits ?? []).join("\n"),
      finishers: event.finishers != null ? String(event.finishers) : "",
      verifiedResults: event.verifiedResults != null ? String(event.verifiedResults) : "",
      cities: event.cities != null ? String(event.cities) : "",
      resultNote: event.resultNote ?? "",
      maxCapacity: event.maxCapacity != null ? String(event.maxCapacity) : "",
      city: event.city ?? "Virtual", status: event.status,
    });
    void (async () => {
      const token = await getToken().catch(() => null);
      const json = await adminFetch<{ data: EventRow & { description: string; proofClosesAt: string; bannerImageUrl: string | null } }>(
        `/api/admin/events/${event.id}`, token);
      setForm((prev) => ({
        ...prev,
        description: json.data.description,
        proofClosesAt: toDatetimeLocalValue(json.data.proofClosesAt),
        bannerImageUrl: json.data.bannerImageUrl ?? "",
      }));
    })();
    // Scroll form into view on mobile
    setTimeout(() => document.getElementById("event-form")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }

  function cancelEdit() { setEditingId(null); setForm(emptyForm); }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const titleErr = validateMinLength(form.title, 3, "Event title");
    const distanceList = form.distances.split(",").map((d) => d.trim()).filter(Boolean);
    if (titleErr) { toast("error", titleErr); return; }
    if (distanceList.length === 0) { toast("error", "Add at least one distance (e.g. 5 km, 10 km)."); return; }
    if (!form.startsAt || !form.endsAt) { toast("error", "Start and end dates are required."); return; }
    if (form.priceInr && (Number.isNaN(Number(form.priceInr)) || Number(form.priceInr) < 0)) {
      toast("error", "Enter a valid price.");
      return;
    }
    setSaving(true);
    try {
      const token = await getToken().catch(() => null);
      const priceInPaise = Math.round(Number(form.priceInr || 0) * 100);
      const body = {
        title: form.title.trim(),
        slug: form.slug.trim() || slugify(form.title),
        description: form.description.trim() || `${form.title} virtual running event.`,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
        proofClosesAt: new Date(form.proofClosesAt || form.endsAt).toISOString(),
        distances: form.distances.split(",").map((d) => d.trim()).filter(Boolean),
        priceInPaise,
        paymentRequired: form.paymentRequired && priceInPaise > 0,
        couponCode: form.couponCode.trim() || null,
        showCouponOnCard: form.showCouponOnCard,
        activityTypes: form.activityTypes,
        benefits: form.benefits.split("\n").map((s: string) => s.trim()).filter(Boolean),
        finishers: form.finishers !== "" && form.finishers !== null && form.finishers !== undefined ? Number(form.finishers) : null,
        verifiedResults: form.verifiedResults !== "" && form.verifiedResults !== null && form.verifiedResults !== undefined ? Number(form.verifiedResults) : null,
        cities: form.cities !== "" && form.cities !== null && form.cities !== undefined ? Number(form.cities) : null,
        resultNote: form.resultNote || null,
        bannerImageUrl: form.bannerImageUrl ? form.bannerImageUrl.trim() : null,
        medalIncluded: form.medalIncluded, featured: form.featured,
        maxCapacity: form.maxCapacity ? Number(form.maxCapacity) : null,
        city: form.city || "Virtual", status: form.status,
      };
      if (editingId) {
        await adminFetch(`/api/admin/events/${editingId}`, token, { method: "PUT", body: JSON.stringify(body) });
        toast("success", `"${form.title}" updated.`);
      } else {
        await adminFetch("/api/admin/events", token, { method: "POST", body: JSON.stringify(body) });
        toast("success", `"${form.title}" created.`);
      }
      cancelEdit();
      await load();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function patchEvent(id: string, patch: Partial<EventRow>) {
    try {
      const token = await getToken().catch(() => null);
      await adminFetch(`/api/admin/events/${id}`, token, { method: "PUT", body: JSON.stringify(patch) });
      await load();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Update failed");
    }
  }

  async function toggleFeatured(event: EventRow) {
    await patchEvent(event.id, { featured: !event.featured });
    toast("info", event.featured ? `"${event.title}" removed from homepage.` : `"${event.title}" featured on homepage.`);
  }

  async function setStatus(id: string, status: string) {
    await patchEvent(id, { status });
    toast("success", `Status updated to ${STATUS_LABELS[status] ?? status}.`);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      const token = await getToken().catch(() => null);
      await adminFetch(`/api/admin/events/${deleteTarget.id}`, token, { method: "DELETE" });
      toast("success", `"${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Delete failed");
      setDeleteTarget(null);
    }
  }

  // Split into active (DRAFT/OPEN/CLOSED) and past (COMPLETED/CANCELLED)
  const activeEvents = items.filter((e) => !["COMPLETED", "CANCELLED"].includes(e.status));
  const pastEvents = items.filter((e) => ["COMPLETED", "CANCELLED"].includes(e.status));

  return (
    <>
      <ToastContainer toasts={toasts} dismiss={dismiss} />

      {deleteTarget && (
        <ConfirmModal
          title="Delete event"
          message={`Delete "${deleteTarget.title}"? This only works if the event has zero registrations.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => void confirmDelete()}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="admin-stack">
        <AdminPageHeader
          kicker="Operations"
          title="Events"
          description="Create events, set prices, toggle open/closed, and feature them on the homepage."
          actions={
            editingId ? (
              <button className="btn btn-secondary" onClick={cancelEdit} type="button">
                Cancel edit
              </button>
            ) : null
          }
        />

        <div className="admin-layout-split is-form-list admin-fill">
          {/* ── Form ── */}
          <form id="event-form" className="admin-panel admin-panel-pad space-y-4" onSubmit={onSubmit} noValidate>
            <h2 className="admin-panel-title">{editingId ? "✏️ Edit event" : "New event"}</h2>

            <label className="block text-sm">
              <span className="field-label">Event title *</span>
              <input className="input" placeholder="e.g. Monsoon Mountain Miles"
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value, slug: slugify(e.target.value) }))}
                required value={form.title} />
            </label>

            <label className="block text-sm">
              <span className="field-label">Description</span>
              <textarea className="input min-h-20 py-2 resize-none" placeholder="Brief description for runners…"
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                value={form.description} />
            </label>

            <div className="space-y-1.5">
              <span className="field-label text-sm">Banner image</span>
              <div className="flex items-start gap-3">
                <input
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  className="input cursor-pointer py-2 file:mr-3 file:rounded-full file:border-0 file:bg-(--sage) file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white block w-full"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (!file.type.startsWith("image/")) {
                      toast("error", "Only image files are allowed (PNG, JPEG, WebP, AVIF).");
                      return;
                    }
                    if (file.size > 10 * 1024 * 1024) {
                      toast("error", "Image must be under 10 MB.");
                      return;
                    }
                    try {
                      const token = await getToken();
                      const reader = new FileReader();
                      reader.onload = async () => {
                        const base64 = reader.result as string;
                        const res = await fetch(getApiUrl("/api/uploads/image"), {
                          method: "POST",
                          headers: authHeaders(token),
                          body: JSON.stringify({ file: base64, folder: "runnerup/admin" }),
                        });
                        if (!res.ok) { toast("error", "Upload failed. Try again."); return; }
                        const json = await res.json();
                        setForm((f) => ({ ...f, bannerImageUrl: json.data.url }));
                      };
                      reader.readAsDataURL(file);
                    } catch { toast("error", "Upload failed. Check connection."); }
                  }}
                  type="file"
                />
                {form.bannerImageUrl && (
                  <button
                    className="btn btn-secondary h-9 w-9 shrink-0 flex items-center justify-center p-0 text-sm"
                    onClick={() => setForm((f) => ({ ...f, bannerImageUrl: "" }))}
                    title="Remove banner"
                    type="button"
                  >
                    ✕
                  </button>
                )}
              </div>
              <p className="text-[0.65rem] text-[var(--muted)]">PNG, JPEG, WebP or AVIF · max 10 MB · or paste a URL below.</p>
              <input className="input" placeholder="https://… or /images/… or leave blank for default"
                onChange={(e) => setForm((f) => ({ ...f, bannerImageUrl: e.target.value }))}
                value={form.bannerImageUrl} />
              {form.bannerImageUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img alt="Banner preview" src={form.bannerImageUrl} className="mt-1 h-12 w-auto max-w-full rounded-lg object-cover" />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="field-label">Starts *</span>
                <input className="input" type="datetime-local"
                  onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                  required value={form.startsAt} />
              </label>
              <label className="block text-sm">
                <span className="field-label">Ends *</span>
                <input className="input" type="datetime-local"
                  onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                  required value={form.endsAt} />
              </label>
            </div>

            <label className="block text-sm">
              <span className="field-label">Distances * (comma-separated)</span>
              <input className="input"
                onChange={(e) => setForm((f) => ({ ...f, distances: e.target.value }))}
                placeholder="5 km, 10 km, 21 km" required value={form.distances} />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="field-label">Entry fee (₹)</span>
                <input className="input" inputMode="numeric" placeholder="499"
                  onChange={(e) => setForm((f) => ({ ...f, priceInr: e.target.value }))}
                  value={form.priceInr} />
              </label>
              <label className="block text-sm">
                <span className="field-label">Status</span>
                <select className="input"
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  value={form.status}>
                  {[["DRAFT", "Draft (not visible)"], ["OPEN", "Open (accepting registrations)"],
                  ["CLOSED", "Closed"], ["COMPLETED", "Completed"], ["CANCELLED", "Cancelled"],
                  ].map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                </select>
              </label>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Activity types</p>
              <div className="flex flex-wrap gap-2">
                {["running", "cycling", "walking"].map((type) => {
                  const checked = form.activityTypes.includes(type);
                  return (
                    <label key={type} className="flex items-center gap-1.5 cursor-pointer rounded-lg border border-[var(--line)] bg-[var(--panel)] px-2.5 py-1.5 text-xs font-medium has-[:checked]:border-(--sage) has-[:checked]:bg-(--sage-soft) has-[:checked]:text-(--sage) transition-colors">
                      <input type="checkbox" className="sr-only"
                        checked={checked}
                        onChange={() => {
                          setForm((f) => ({
                            ...f,
                            activityTypes: checked
                              ? f.activityTypes.filter((t: string) => t !== type)
                              : [...f.activityTypes, type],
                          }));
                        }} />
                      <span className="capitalize">{type}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <span className="field-label">Benefits (one per line)</span>
              <textarea className="input min-h-16 py-2 resize-none" placeholder="Verified race entry&#10;GPS proof verification&#10;Finisher medal delivery"
                onChange={(e) => setForm((f) => ({ ...f, benefits: e.target.value }))}
                value={form.benefits as string} />
            </div>

            <div className="space-y-1">
              <span className="field-label">Coupon code</span>
              <div className="flex items-center gap-2">
                <input className="input flex-1" placeholder="e.g. WELCOME10"
                  onChange={(e) => setForm((f) => ({ ...f, couponCode: e.target.value.toUpperCase() }))}
                  value={form.couponCode} />
                <label className="flex items-center gap-1.5 text-xs whitespace-nowrap cursor-pointer">
                  <input type="checkbox"
                    checked={form.showCouponOnCard}
                    onChange={(e) => setForm((f) => ({ ...f, showCouponOnCard: e.target.checked }))} />
                  Show on card
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <span className="field-label">Past-event stats</span>
              <p className="text-[0.65rem] text-[var(--muted)]">Only for Completed / Cancelled events.</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  ["finishers", "Finishers"],
                  ["verifiedResults", "Verified"],
                  ["cities", "Cities"],
                ] as const).map(([field, label]) => (
                  <label key={field} className="block text-xs">
                    <span className="field-label">{label}</span>
                    <input className="input" inputMode="numeric" placeholder="0"
                      onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                      value={form[field] ?? ""} />
                  </label>
                ))}
              </div>
              <input className="input mt-1" placeholder="Result note (optional)"
                onChange={(e) => setForm((f) => ({ ...f, resultNote: e.target.value }))}
                value={form.resultNote as string} />
            </div>

            <button className="btn btn-primary btn-full" disabled={saving} type="submit">
              {saving ? "Saving…" : editingId ? "Update event" : "Create event"}
            </button>

            {form.slug ? (
              <p className="text-xs text-[var(--muted)]">
                Slug: <code className="rounded bg-[var(--panel-soft)] px-1 text-[0.68rem]">{form.slug}</code>
              </p>
            ) : null}
          </form>

          {/* ── Event list ── */}
          <div className="admin-stack">
            {/* Active events */}
            <div>
              <p className="admin-kicker mb-2">Active events ({activeEvents.length})</p>
              <div className="admin-stack">
                {activeEvents.length === 0 ? (
                  <div className="admin-panel admin-panel-pad">
                    <AdminEmpty>No active events. Create one on the left.</AdminEmpty>
                  </div>
                ) : activeEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={() => startEdit(event)}
                    onDelete={() => setDeleteTarget(event)}
                    onToggleFeatured={() => void toggleFeatured(event)}
                    onSetStatus={(s) => void setStatus(event.id, s)}
                  />
                ))}
              </div>
            </div>

            {/* Past events */}
            {pastEvents.length > 0 && (
              <div>
                <p className="admin-kicker mb-2 mt-2">Past events ({pastEvents.length})</p>
                <div className="admin-stack">
                  {pastEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onEdit={() => startEdit(event)}
                      onDelete={() => setDeleteTarget(event)}
                      onToggleFeatured={() => void toggleFeatured(event)}
                      onSetStatus={(s) => void setStatus(event.id, s)}
                      isPast
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Event card ─────────────────────────────────────────── */
function EventCard({ event, onEdit, onDelete, onToggleFeatured, onSetStatus, isPast = false }: {
  event: EventRow;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFeatured: () => void;
  onSetStatus: (status: string) => void;
  isPast?: boolean;
}) {
  return (
    <article className="admin-panel admin-panel-pad">
      <div className="flex flex-wrap items-start justify-between gap-3">
        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold tracking-tight text-[var(--foreground)]">{event.title}</h2>
            <span className={STATUS_BADGE[event.status] ?? "badge"}>{STATUS_LABELS[event.status] ?? event.status}</span>
            {event.featured && <span className="badge badge-sage">⭐ Featured</span>}
            {(!event.paymentRequired || event.priceInPaise === 0) && <span className="badge badge-sage">Free</span>}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[var(--muted)]">
            <span>{event.distances.join(" · ")}</span>
            <span>{formatInrFromPaise(event.priceInPaise)}</span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {event._count?.registrations ?? 0} regs
            </span>
          </div>
          <p className="mt-1 text-xs text-[var(--muted-soft)]">
            {formatDateTime(event.startsAt)} → {formatDateTime(event.endsAt)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Featured toggle */}
          <button
            type="button"
            onClick={onToggleFeatured}
            title={event.featured ? "Remove from homepage" : "Feature on homepage"}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors cursor-pointer ${event.featured
              ? "border-amber-300 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-400"
              : "border-[var(--line)] bg-[var(--panel)] text-[var(--muted)] hover:text-amber-500 hover:border-amber-300"
              }`}
          >
            {event.featured ? <Star className="h-3.5 w-3.5 fill-current" /> : <StarOff className="h-3.5 w-3.5" />}
          </button>

          {/* Open/Close quick toggle */}
          {event.status === "OPEN" ? (
            <button type="button" onClick={() => onSetStatus("CLOSED")}
              title="Close registrations"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] px-2.5 text-xs font-medium text-[var(--muted)] hover:border-red-300 hover:text-red-600 transition-colors cursor-pointer">
              <GlobeLock className="h-3.5 w-3.5" /> Close
            </button>
          ) : event.status === "DRAFT" || event.status === "CLOSED" ? (
            <button type="button" onClick={() => onSetStatus("OPEN")}
              title="Open registrations"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] px-2.5 text-xs font-medium text-[var(--muted)] hover:border-emerald-400 hover:text-emerald-600 transition-colors cursor-pointer">
              <Globe className="h-3.5 w-3.5" /> Open
            </button>
          ) : isPast ? (
            <button type="button" onClick={() => onSetStatus("OPEN")}
              title="Reopen this event"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] px-2.5 text-xs font-medium text-[var(--muted)] hover:border-emerald-400 hover:text-emerald-600 transition-colors cursor-pointer">
              <Globe className="h-3.5 w-3.5" /> Reopen
            </button>
          ) : null}

          <button type="button" onClick={onEdit}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer">
            <Pencil className="h-3.5 w-3.5" />
          </button>

          <Link href={`/events/${event.slug}`} target="_blank"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          <button type="button" onClick={onDelete}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--muted)] hover:border-red-300 hover:text-red-500 transition-colors cursor-pointer">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
