"use client";

import { useAuth } from "@clerk/nextjs";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { adminFetch, formatDateTime, getFastAdminToken } from "../../../lib/admin-api";
import { AdminEmpty, AdminPageHeader, AdminPanel } from "../ui";
import { validateNewsletterForm } from "../../../lib/validation";

type Subscriber = {
  id: string;
  email: string;
  subscribed: boolean;
  createdAt: string;
};

type SendResult = {
  sent: number;
  total: number;
  message: string;
  errors?: string[];
};

export default function AdminNewsletterPage() {
  const { getToken, isSignedIn } = useAuth();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const token = await getFastAdminToken(getToken, isSignedIn);
      const json = await adminFetch<{ data: Subscriber[]; meta: { total: number } }>("/api/admin/subscribers", token);
      setSubscribers(json.data);
      setTotal(json.meta.total);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [getToken, isSignedIn]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSend(e: FormEvent) {
    e.preventDefault();
    const errors = validateNewsletterForm(subject, body);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSending(true);
    setResult(null);
    setSendError(null);
    try {
      const token = await getFastAdminToken(getToken, isSignedIn);
      const json = await adminFetch<{ data: SendResult }>(
        "/api/admin/newsletter/send",
        token,
        {
          method: "POST",
          body: JSON.stringify({ subject, body }),
        },
      );
      setResult(json.data);
      if (json.data.sent > 0) {
        setSubject("");
        setBody("");
      }
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="admin-stack">
      <AdminPageHeader
        kicker="Growth"
        title="Newsletter"
        description="View subscribers and send broadcast emails."
      />

      {sendError ? <p className="admin-muted" style={{ color: "var(--danger)" }}>{sendError}</p> : null}

      <div className="admin-layout-split is-form-list admin-fill" style={{ alignItems: "start" }}>
        {/* Compose */}
        <form className="admin-panel admin-panel-pad admin-form-grid" onSubmit={onSend} noValidate>
          <h2 className="admin-panel-title span-2">Compose newsletter</h2>

          <label className="block text-sm span-2">
            <span className="field-label">Subject</span>
            <input
              className={fieldErrors.subject ? "input !border-red-400" : "input"}
              onChange={(e) => { setSubject(e.target.value); setFieldErrors((f) => ({ ...f, subject: "" })); }}
              placeholder="New event announcement"
              required
              value={subject}
              maxLength={200}
            />
            {fieldErrors.subject ? <p className="mt-1 text-xs text-red-500">{fieldErrors.subject}</p> : null}
          </label>

          <label className="block text-sm span-2">
            <span className="field-label">Body</span>
            <p className="text-xs text-(--muted-soft) mb-1">Accepts both HTML and plain text. Example: <code className="text-(--sage)">&lt;h2&gt;Hello!&lt;/h2&gt;</code> or just type <code className="text-(--sage)">Hello runners!</code></p>
            <textarea
              className={fieldErrors.body ? "input !border-red-400" : "input"}
              onChange={(e) => { setBody(e.target.value); setFieldErrors((f) => ({ ...f, body: "" })); }}
              placeholder="Hello runners!&#10;&#10;New event is now live..."
              required
              value={body}
              rows={12}
              maxLength={10000}
            />
            {fieldErrors.body ? <p className="mt-1 text-xs text-red-500">{fieldErrors.body}</p> : null}
          </label>

          <div className="span-2 flex flex-wrap items-center gap-3">
            <button className="btn btn-primary" disabled={sending || total === 0} type="submit">
              {sending ? "Sending…" : `Send to ${total} subscriber${total !== 1 ? "s" : ""}`}
            </button>
            {total === 0 ? <span className="text-xs text-(--muted)">No active subscribers</span> : null}
          </div>

          {result ? (
            <div className="span-2 space-y-2">
              <p className={`text-sm ${result.sent === result.total ? "text-(--sage)" : "text-(--warn)"}`}>
                {result.message}
              </p>
              {result.errors && result.errors.length > 0 ? (
                <details className="text-xs text-(--danger) bg-(--danger-soft) rounded-lg p-3">
                  <summary className="cursor-pointer font-medium">Failed: {result.errors.length} email{result.errors.length !== 1 ? "s" : ""}</summary>
                  <ul className="mt-2 space-y-1 list-disc pl-4">
                    {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </details>
              ) : null}
            </div>
          ) : null}
        </form>

        {/* Subscriber list */}
        <div className="admin-stack">
          <AdminPanel title={`${total} active subscriber${total !== 1 ? "s" : ""}`}>
            {subscribers.length === 0 ? (
              <AdminEmpty>No subscribers yet.</AdminEmpty>
            ) : (
              <div className="table-wrap table-scroll">
                <table className="table-clean min-w-[500px]" style={{ tableLayout: "fixed", width: "100%" }}>
                  <thead>
                    <tr>
                      <th style={{ width: "65%" }}>Email</th>
                      <th style={{ width: "35%" }}>Subscribed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((sub) => (
                      <tr key={sub.id}>
                        <td className="font-mono text-sm" style={{ wordBreak: "break-word", overflowWrap: "break-word", paddingRight: "0.75rem" }}>{sub.email}</td>
                        <td className="text-xs text-(--muted)" style={{ whiteSpace: "nowrap" }}>{formatDateTime(sub.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AdminPanel>
        </div>
      </div>
    </div>
  );
}
