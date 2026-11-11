"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useTransition } from "react";
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
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  const [passcode, setPasscode] = useState("");
  const [showPasscodeField, setShowPasscodeField] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // If already signed into Clerk with an admin account, navigate straight to /admin
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const userEmails = [
        user?.primaryEmailAddress?.emailAddress,
        ...(user?.emailAddresses?.map((e) => e.emailAddress) || []),
      ]
        .filter(Boolean)
        .map((e) => e!.toLowerCase());

      const isAdminEmail = userEmails.some(
        (e) =>
          e === "sourav06556@gmail.com" ||
          e === "realblack009@gmail.com" ||
          e.includes("sourav"),
      );

      if (isAdminEmail) {
        router.replace(redirectUrl);
      }
    }
  }, [isLoaded, isSignedIn, user, redirectUrl, router]);

  async function handlePasscodeSubmit(e: React.FormEvent) {
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

        <h1>Admin Console Login</h1>
        <p>Restricted to authorized administrators. Unlock with the master passcode or sign in.</p>

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

        {/* ── Primary Action: Sign in with Google / Email ── */}
        <div style={{ width: "100%", marginTop: "1rem", marginBottom: "0.75rem" }}>
          <Link
            className="btn btn-primary"
            href={`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`}
            style={{
              width: "100%",
              height: "3rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.6rem",
              fontWeight: 700,
              fontSize: "0.95rem",
              textDecoration: "none",
              borderRadius: "0.85rem",
              background: "#ff4b26",
              color: "#ffffff",
              boxShadow: "0 4px 14px rgba(255, 75, 38, 0.35)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Sign in with Google / Email</span>
          </Link>
        </div>

        {/* ── Emergency Passcode Access (Collapsible Fallback) ── */}
        <div style={{ width: "100%", marginTop: "0.75rem", textAlign: "center" }}>
          {!showPasscodeField ? (
            <button
              type="button"
              onClick={() => setShowPasscodeField(true)}
              style={{
                background: "none",
                border: "none",
                color: "var(--muted)",
                fontSize: "0.76rem",
                cursor: "pointer",
                padding: "0.4rem",
                textDecoration: "underline",
              }}
            >
              Emergency offline access (passcode)
            </button>
          ) : (
            <motion.form
              onSubmit={handlePasscodeSubmit}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              style={{ width: "100%", marginTop: "0.5rem", padding: "0.85rem", background: "rgba(255,255,255,0.03)", borderRadius: "0.75rem", border: "1px solid var(--line)" }}
            >
              <div style={{ position: "relative", marginBottom: "0.75rem" }}>
                <input
                  type="password"
                  placeholder="Master Passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  disabled={loading || isPending}
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "0.65rem 1rem",
                    borderRadius: "0.6rem",
                    border: "1px solid var(--line)",
                    background: "var(--panel-soft)",
                    color: "var(--foreground)",
                    fontSize: "0.88rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="submit"
                  className="btn btn-secondary"
                  disabled={loading || isPending}
                  style={{ flex: 1, height: "2.4rem", fontWeight: 600, fontSize: "0.85rem" }}
                >
                  {loading || isPending ? "Verifying…" : "Unlock with Passcode"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasscodeField(false)}
                  className="btn btn-ghost"
                  style={{ height: "2.4rem", fontSize: "0.8rem", color: "var(--muted)" }}
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </div>

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
