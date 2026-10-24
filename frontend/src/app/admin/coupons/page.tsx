"use client";

import { useAuth } from "@clerk/nextjs";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { adminFetch, formatDateTime, formatInrFromPaise, getFastAdminToken } from "../../../lib/admin-api";
import { AdminEmpty, AdminPageHeader, AdminPanel } from "../ui";
import { validateAdminCouponForm } from "../../../lib/validation";

type Coupon = {
  id: string;
  code: string;
  discountPaise: number;
  maxRedemptions: number | null;
  redeemedCount: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
};

export default function AdminCouponsPage() {
  const { getToken, isSignedIn } = useAuth();
  const [items, setItems] = useState<Coupon[]>([]);
  const [code, setCode] = useState("");
  const [discountInr, setDiscountInr] = useState("100");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const token = await getFastAdminToken(getToken, isSignedIn);
      const json = await adminFetch<{ data: Coupon[] }>("/api/admin/coupons", token);
      setItems(json.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [getToken, isSignedIn]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    const errors = validateAdminCouponForm(code, discountInr);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      const token = await getFastAdminToken(getToken, isSignedIn);
      await adminFetch("/api/admin/coupons", token, {
        method: "POST",
        body: JSON.stringify({
          code,
          discountPaise: Math.round(Number(discountInr) * 100),
          maxRedemptions: maxRedemptions ? Number(maxRedemptions) : null,
          active: true,
        }),
      });
      setCode("");
      setDiscountInr("100");
      setMaxRedemptions("");
      setMessage("Coupon created.");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Create failed");
    }
  }

  async function toggleActive(coupon: Coupon) {
    try {
      const token = await getFastAdminToken(getToken, isSignedIn);
      await adminFetch(`/api/admin/coupons/${coupon.id}`, token, {
        method: "PATCH",
        body: JSON.stringify({ active: !coupon.active }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      const token = await getFastAdminToken(getToken, isSignedIn);
      await adminFetch(`/api/admin/coupons/${id}`, token, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="admin-stack">
      <AdminPageHeader
        kicker="Growth"
        title="Coupons"
        description="Create and manage discount codes for checkout."
      />

      {error ? <p className="admin-muted" style={{ color: "var(--danger)" }}>{error}</p> : null}
      {message ? <p className="admin-muted">{message}</p> : null}

      <div className="admin-layout-split is-form-list admin-fill">
        <form className="admin-panel admin-panel-pad admin-form-grid is-2" onSubmit={onCreate} noValidate>
          <h2 className="admin-panel-title span-2">New coupon</h2>
          <label className="block text-sm span-2">
            <span className="field-label">Code</span>
            <input
              className={fieldErrors.code ? "input !border-red-400" : "input"}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setFieldErrors((f) => ({ ...f, code: "" })); }}
              placeholder="MONSOON100"
              required
              value={code}
            />
            {fieldErrors.code ? <p className="mt-1 text-xs text-red-500">{fieldErrors.code}</p> : null}
          </label>
          <label className="block text-sm">
            <span className="field-label">Discount (INR)</span>
            <input
              className={fieldErrors.discountInr ? "input !border-red-400" : "input"}
              inputMode="numeric"
              onChange={(e) => { setDiscountInr(e.target.value); setFieldErrors((f) => ({ ...f, discountInr: "" })); }}
              required
              value={discountInr}
            />
            {fieldErrors.discountInr ? <p className="mt-1 text-xs text-red-500">{fieldErrors.discountInr}</p> : null}
          </label>
          <label className="block text-sm">
            <span className="field-label">Max redemptions</span>
            <input
              className="input"
              inputMode="numeric"
              onChange={(e) => setMaxRedemptions(e.target.value)}
              placeholder="Unlimited"
              value={maxRedemptions}
            />
          </label>
          <button className="btn btn-primary span-2" type="submit">
            Create coupon
          </button>
        </form>

        <div className="admin-stack">
          {items.map((coupon) => (
            <article
              className="admin-panel admin-panel-pad flex flex-wrap items-center justify-between gap-3"
              key={coupon.id}
            >
              <div>
                <p className="font-mono text-sm font-semibold">{coupon.code}</p>
                <p className="mt-1 text-sm admin-muted">
                  {formatInrFromPaise(coupon.discountPaise)} off · used {coupon.redeemedCount}
                  {coupon.maxRedemptions != null ? ` / ${coupon.maxRedemptions}` : ""}
                  {coupon.expiresAt ? ` · expires ${formatDateTime(coupon.expiresAt)}` : ""}
                </p>
                <span className="badge mt-2">{coupon.active ? "ACTIVE" : "OFF"}</span>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn btn-secondary"
                  onClick={() => void toggleActive(coupon)}
                  type="button"
                >
                  {coupon.active ? "Disable" : "Enable"}
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => void remove(coupon.id)}
                  style={{ color: "var(--danger)" }}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
          {items.length === 0 ? (
            <div className="admin-panel admin-panel-pad is-fill">
              <AdminEmpty>No coupons yet. Create one on the left.</AdminEmpty>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
