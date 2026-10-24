"use client";

import { useAuth } from "@clerk/nextjs";
import { AlertTriangle, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { adminFetch, formatDateTime, formatInrFromPaise, getFastAdminToken } from "../../../../lib/admin-api";
import { AdminBackLink, AdminEmpty, AdminPageHeader, AdminPanel } from "../../ui";

type UserDetail = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  clerkId: string | null;
  createdAt: string;
  registrations: Array<{
    id: string;
    bibNumber: string;
    distance: string;
    status: string;
    proofStatus: string;
    registeredAt: string;
    event: { title: string };
    payment?: { status: string; amountInPaise: number } | null;
  }>;
};

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();
  const [data, setData] = useState<UserDetail | null>(null);
  const [role, setRole] = useState("RUNNER");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Double-Confirmation Delete States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [confirmEmailInput, setConfirmEmailInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const token = await getFastAdminToken(getToken, isSignedIn);
      const json = await adminFetch<{ data: UserDetail }>(`/api/admin/users/${params.id}`, token);
      setData(json.data);
      setRole(json.data.role);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [getToken, isSignedIn, params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveRole() {
    try {
      const token = await getFastAdminToken(getToken, isSignedIn);
      await adminFetch(`/api/admin/users/${params.id}/role`, token, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      setMessage("Role updated.");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Update failed");
    }
  }

  const isProtectedAdmin =
    data?.email.toLowerCase() === "sourav06556@gmail.com" ||
    data?.email.toLowerCase() === "realblack009@gmail.com";

  async function executeDelete() {
    if (!data || isProtectedAdmin) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const token = await getFastAdminToken(getToken, isSignedIn);
      await adminFetch(`/api/admin/users/${data.id}`, token, {
        method: "DELETE",
      });
      router.push("/admin/users");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete user");
      setIsDeleting(false);
    }
  }

  if (error) return <p className="text-sm text-[var(--danger)]">{error}</p>;
  if (!data) return <p className="text-sm text-[var(--muted)]">Loading…</p>;

  return (
    <div className="admin-stack">
      <div>
        <AdminBackLink href="/admin/users" label="Users" />
      </div>
      <AdminPageHeader
        kicker="People"
        title={data.name}
        description={`${data.email}${data.phone ? ` · ${data.phone}` : ""} · joined ${formatDateTime(data.createdAt)}`}
        actions={
          !isProtectedAdmin ? (
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(true);
                setDeleteStep(1);
                setConfirmEmailInput("");
              }}
              className="btn btn-secondary text-rose-400 border-rose-500/30 hover:border-rose-500/60 hover:bg-rose-500/10 flex items-center gap-2 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete User & Fake Data</span>
            </button>
          ) : undefined
        }
      />

      {message ? <p className="admin-muted">{message}</p> : null}

      <div className="admin-layout-split is-aside-main admin-fill">
        <AdminPanel fill title="Role">
          <div className="space-y-3">
            <select className="input" onChange={(e) => setRole(e.target.value)} value={role}>
              {["RUNNER", "ADMIN", "SUPER_ADMIN"].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <button className="btn btn-primary" onClick={() => void saveRole()} type="button">
              Save role
            </button>
            {data.clerkId ? (
              <p className="text-xs admin-muted font-mono">clerk {data.clerkId}</p>
            ) : null}
          </div>
        </AdminPanel>

        <AdminPanel fill title="Registrations" subtitle={`${data.registrations.length} total`}>
          {data.registrations.length === 0 ? (
            <AdminEmpty>No registrations.</AdminEmpty>
          ) : (
            <div className="admin-list is-stretch">
              {data.registrations.map((reg) => (
                <Link className="admin-list-item" href={`/admin/registrations/${reg.id}`} key={reg.id}>
                  <div>
                    <div className="title">
                      {reg.event.title} · {reg.distance}
                    </div>
                    <div className="sub">
                      {reg.bibNumber} · {reg.status} · proof {reg.proofStatus}
                    </div>
                  </div>
                  <div className="right sub">
                    {reg.payment
                      ? `${reg.payment.status} · ${formatInrFromPaise(reg.payment.amountInPaise)}`
                      : "No payment"}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </AdminPanel>
      </div>

      {/* ── Double-Confirmation Delete Modal (Ask Twice Safety) ── */}
      {showDeleteModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-[#0f171c] border border-rose-500/30 p-6 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => !isDeleting && setShowDeleteModal(false)}
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
                  <p><strong className="text-white">Customer:</strong> {data.name}</p>
                  <p><strong className="text-white">Email:</strong> {data.email}</p>
                  <p><strong className="text-white">Registrations:</strong> {data.registrations.length} entry(s)</p>
                </div>

                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 leading-relaxed">
                  ⚠️ <strong>Caution:</strong> This will permanently delete this runner, their {data.registrations.length} registration(s), payments, and proofs from the database. This action <strong>cannot be undone</strong>.
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
                  onClick={() => setConfirmEmailInput(data.email)}
                  title="Click to copy into input box"
                  className="p-2.5 rounded-lg bg-black/60 border border-rose-500/30 text-center font-mono text-xs text-amber-300 font-semibold select-all cursor-pointer hover:border-amber-400/50 hover:bg-black/80 transition-all flex items-center justify-center gap-2"
                >
                  <span>{data.email}</span>
                  <span className="text-[10px] text-white/40 font-sans font-normal">(click to fill)</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-white/70">Type email to confirm (or type DELETE):</label>
                  <input
                    type="text"
                    className="input w-full font-mono text-xs"
                    placeholder={`Type ${data.email} or DELETE`}
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
                      (confirmEmailInput.trim().toLowerCase() !== data.email.toLowerCase() &&
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
