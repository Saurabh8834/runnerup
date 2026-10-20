"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { BrandText } from "../../components/brand-text";
import { getApiUrl } from "../../../lib/api";
import { setEmergencyAdminSession } from "../../../lib/admin-api";
import { AdminThemeProvider, AdminThemeToggle } from "../admin-theme";
import "../admin.css";

function LockIcon() {
  return (
    <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24" width="24">
      <rect height="11" rx="2" width="18" x="3" y="11" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/admin";

  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!passcode.trim()) {
      setError("Please enter the admin passcode.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(getApiUrl("/api/admin/emergency-login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Invalid admin passcode.");
      }

      const token = json.data?.token;
      if (!token) {
        throw new Error("No token returned by server.");
      }

      setEmergencyAdminSession(token);

      startTransition(() => {
        router.push(redirectUrl);
        router.refresh();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to authenticate.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-app admin-gate" data-admin-theme="dark">
      <div style={{ position: "absolute", top: "1.5rem", right: "1.5rem" }}>
        <AdminThemeToggle className="is-icon-only" />
      </div>

      <motion.div
        className="admin-gate-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{ maxWidth: 440, width: "100%" }}
      >
        <div className="admin-gate-logo">
          <div className="admin-gate-logo-icon">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="RunnerUp" height={22} src="/logo-mark.svg" width={22} />
          </div>
          <span className="admin-gate-logo-text">
            <BrandText />
          </span>
        </div>

        <div className="admin-gate-lock">
          <LockIcon />
        </div>

        <h1>Admin Access</h1>
        <p>Enter the master admin passcode to unlock the operations console.</p>

        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#f87171",
              padding: "0.75rem 1rem",
              borderRadius: "0.75rem",
              fontSize: "0.85rem",
              marginBottom: "1rem",
              textAlign: "left",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ width: "100%", marginTop: "0.5rem" }}>
          <div style={{ position: "relative", marginBottom: "1rem" }}>
            <input
              type={showPasscode ? "text" : "password"}
              placeholder="Admin Master Passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              disabled={loading || isPending}
              autoFocus
              style={{
                width: "100%",
                padding: "0.75rem 3rem 0.75rem 1rem",
                borderRadius: "0.75rem",
                border: "1px solid var(--line)",
                background: "var(--panel-soft)",
                color: "var(--foreground)",
                fontSize: "0.95rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPasscode((s) => !s)}
              style={{
                position: "absolute",
                right: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--muted)",
                cursor: "pointer",
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              {showPasscode ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || isPending}
            style={{ width: "100%", height: "2.75rem", fontWeight: 600, fontSize: "0.95rem" }}
          >
            {loading || isPending ? "Unlocking Console…" : "Unlock Admin Console"}
          </button>
        </form>

        <div className="admin-gate-actions" style={{ marginTop: "1.25rem" }}>
          <Link className="btn btn-ghost" href="/">
            ← Back to main site
          </Link>
        </div>

        <div className="admin-gate-divider">
          RunnerUp Operations · Protected Area
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <AdminThemeProvider>
      <Suspense fallback={null}>
        <AdminLoginForm />
      </Suspense>
    </AdminThemeProvider>
  );
}
