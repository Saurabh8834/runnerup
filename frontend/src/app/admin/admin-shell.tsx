"use client";

import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { adminFetch, AdminApiError } from "../../lib/admin-api";
import { AdminThemeProvider, AdminThemeToggle, useAdminTheme } from "./admin-theme";
import { BrandText } from "../components/brand-text";
import "./admin.css";

type NavItem = { label: string; href: string; icon: string };
type NavGroup = { label: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    label: "Workspace",
    items: [{ label: "Overview", href: "/admin", icon: "grid" }],
  },
  {
    label: "Operations",
    items: [
      { label: "Events",        href: "/admin/events",        icon: "flag" },
      { label: "Registrations", href: "/admin/registrations", icon: "list" },
      { label: "Proofs",        href: "/admin/proofs",        icon: "check" },
    ],
  },
  {
    label: "Finance",
    items: [{ label: "Payments", href: "/admin/payments", icon: "card" }],
  },
  {
    label: "People",
    items: [{ label: "Users", href: "/admin/users", icon: "users" }],
  },
  {
    label: "Fulfillment",
    items: [
      { label: "Medal Dispatch", href: "/admin/medals",       icon: "medal" },
      { label: "Certificates",   href: "/admin/certificates", icon: "doc" },
    ],
  },
  {
    label: "Growth",
    items: [
      { label: "Coupons",    href: "/admin/coupons",    icon: "tag" },
      { label: "Newsletter", href: "/admin/newsletter", icon: "mail" },
    ],
  },
  {
    label: "Website",
    items: [{ label: "Homepage & gallery", href: "/admin/content", icon: "doc" }],
  },
];

type AdminMe = {
  role?: string;
  name?: string;
  email?: string;
  mode?: string;
};

/* ── Icon component ─────────────────────────────────────── */
function NavIcon({ name }: { name: string }) {
  const common = {
    className: "admin-nav-icon",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    viewBox: "0 0 24 24",
  } as const;

  switch (name) {
    case "grid":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "flag":
      return (
        <svg {...common}>
          <path d="M5 21V4h9l-1.2 3.5L16 11H5" />
        </svg>
      );
    case "list":
      return (
        <svg {...common}>
          <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4.5 4.5L19 7" />
        </svg>
      );
    case "card":
      return (
        <svg {...common}>
          <rect height="14" rx="2" width="18" x="3" y="5" />
          <path d="M3 10h18" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="9.5" cy="7" r="3.5" />
          <path d="M20 21v-2a3.5 3.5 0 0 0-2.5-3.35" />
          <path d="M16 3.6a3.5 3.5 0 0 1 0 6.8" />
        </svg>
      );
    case "medal":
      return (
        <svg {...common}>
          <circle cx="12" cy="14" r="5" />
          <path d="M9 9 8 3h8l-1 6" />
        </svg>
      );
    case "doc":
      return (
        <svg {...common}>
          <path d="M7 3h7l4 4v14H7V3Z" />
          <path d="M14 3v4h4M10 12h5M10 16h5" />
        </svg>
      );
    case "tag":
      return (
        <svg {...common}>
          <path d="M20 12 12 4H5v7l8 8 7-7Z" />
          <circle cx="8.5" cy="8.5" r="1" />
        </svg>
      );
    default:
      return <span className="admin-nav-icon" />;
  }
}

/* ── Lock icon for gate ─────────────────────────────────── */
function LockIcon() {
  return (
    <svg fill="none" height="22" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} viewBox="0 0 24 24" width="22">
      <rect height="11" rx="2" width="18" x="3" y="11" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg fill="none" height="22" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} viewBox="0 0 24 24" width="22">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

/* ── Brand logo mark (shared across gate + sidebar) ─────── */
function BrandMark({ size = 28 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt="RunnerUp" height={size} src="/logo-mark.svg" width={size} />
  );
}

/* ── Loading spinner dots ───────────────────────────────── */
function Spinner() {
  return (
    <div className="admin-spinner">
      <span /><span /><span />
    </div>
  );
}

function AdminThemed({
  children,
  className = "admin-app",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { theme } = useAdminTheme();
  return (
    <div className={className} data-admin-theme={theme}>
      {children}
    </div>
  );
}

/* ── Gate: not signed in ────────────────────────────────── */
function GateSignIn() {
  return (
    <AdminThemed className="admin-app admin-gate">
      <motion.div
        className="admin-gate-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="admin-gate-logo">
          <div className="admin-gate-logo-icon">
            <BrandMark size={22} />
          </div>
          <span className="admin-gate-logo-text">
            <BrandText />
          </span>
        </div>

        <div className="admin-gate-lock">
          <LockIcon />
        </div>

        <h1>Admin Console</h1>
        <p>Restricted to authorised admins only. Sign in with your admin account to continue.</p>

        <div className="admin-gate-actions">
          <Link className="btn btn-primary" href="/sign-in?redirect_url=/admin">
            Sign in to Admin
          </Link>
          <Link className="btn btn-ghost" href="/">
            Back to site
          </Link>
        </div>

        <div className="admin-gate-divider">
          <BrandText /> · Operations Console
        </div>
      </motion.div>
    </AdminThemed>
  );
}

/* ── Fade-in wrapper for gate pages ────────────────────── */

/* ── Gate: signed in but not admin ─────────────────────── */
function GateRestricted({
  email,
  error,
  onRetry,
}: {
  email?: string;
  error: string | null;
  onRetry: () => void;
}) {
  const { signOut } = useClerk();

  function handleSwitchAccount() {
    void signOut({ redirectUrl: "/sign-in?redirect_url=/admin" });
  }
  return (
    <AdminThemed className="admin-app admin-gate">
      <motion.div
        className="admin-gate-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="admin-gate-logo">
          <div className="admin-gate-logo-icon">
            <BrandMark size={22} />
          </div>
          <span className="admin-gate-logo-text">
            <BrandText />
          </span>
        </div>

        <div className="admin-gate-lock" style={{ color: "var(--danger)" }}>
          <ShieldIcon />
        </div>

        <h1>Access Restricted</h1>
        <p>{error ?? "Your account does not have admin privileges."}</p>

        {email ? (
          <div className="admin-gate-restricted" style={{ marginTop: "1rem" }}>
            <div className="admin-gate-restricted-email">
              <span>Signed in as</span>
              <strong>{email}</strong>
            </div>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--muted)" }}>
              This account is not authorised. Contact the system owner to grant admin access,
              or sign out and use a different account.
            </p>
          </div>
        ) : null}

        <div className="admin-gate-actions">
          <button
            className="btn btn-primary"
            onClick={handleSwitchAccount}
            type="button"
          >
            Switch account
          </button>
          <button className="btn btn-secondary" onClick={onRetry} type="button">
            Retry
          </button>
          <Link className="btn btn-ghost" href="/">
            Back to site
          </Link>
        </div>

        <div className="admin-gate-divider">
          Need access? Ask the admin to add your email to <code style={{ background: "var(--panel-soft)", color: "var(--sage)", padding: "0.1rem 0.3rem", borderRadius: 4, fontSize: "0.7rem" }}>ADMIN_EMAILS</code>
        </div>
      </motion.div>
    </AdminThemed>
  );
}

/* ── Gate: server / network / tunnel offline (530, 502, 500, etc.) ── */
function GateServerError({
  email,
  error,
  status,
  onRetry,
}: {
  email?: string;
  error: string | null;
  status?: number | null;
  onRetry: () => void;
}) {
  return (
    <AdminThemed className="admin-app admin-gate">
      <motion.div
        className="admin-gate-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="admin-gate-logo">
          <div className="admin-gate-logo-icon">
            <BrandMark size={22} />
          </div>
          <span className="admin-gate-logo-text">
            <BrandText />
          </span>
        </div>

        <div className="admin-gate-lock" style={{ color: "#f59e0b" }}>
          <svg
            fill="none"
            height="26"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            viewBox="0 0 24 24"
            width="26"
          >
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
            <path d="m2 2 20 20" />
          </svg>
        </div>

        <h1>Backend Server Offline</h1>
        <p>{error ?? (status ? `Request failed (${status})` : "Unable to reach backend server")}</p>

        <div
          className="admin-gate-restricted"
          style={{
            marginTop: "1rem",
            borderColor: "rgba(245, 158, 11, 0.3)",
            background: "rgba(245, 158, 11, 0.08)",
          }}
        >
          {email ? (
            <div className="admin-gate-restricted-email" style={{ marginBottom: "0.5rem" }}>
              <span>Signed in as</span>
              <strong>{email}</strong>
            </div>
          ) : null}
          <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--foreground)", lineHeight: 1.5 }}>
            {status === 530 ? (
              <>
                <strong>Cloudflare Tunnel Error 1033 (530):</strong> The tunnel for <code>api.runnerup.in</code> is offline.
                Your account is an admin, but the backend server or Cloudflare tunnel on your machine is not running.
              </>
            ) : (
              <>
                Your account has admin credentials, but the frontend could not connect to the backend server.
                Please ensure the backend API (port 4000) is running.
              </>
            )}
          </p>
        </div>

        <div className="admin-gate-actions">
          <button className="btn btn-primary" onClick={onRetry} type="button">
            Retry connection
          </button>
          <Link className="btn btn-ghost" href="/">
            Back to site
          </Link>
        </div>

        <div className="admin-gate-divider">
          Tip: Run <code style={{ background: "var(--panel-soft)", color: "var(--sage)", padding: "0.1rem 0.3rem", borderRadius: 4, fontSize: "0.7rem" }}>start-live.bat</code> to launch backend & tunnel
        </div>
      </motion.div>
    </AdminThemed>
  );
}

/* ── Gate: loading ──────────────────────────────────────── */
function GateLoading() {
  return (
    <AdminThemed className="admin-app admin-gate">
      <motion.div
        className="admin-gate-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="admin-gate-logo">
          <div className="admin-gate-logo-icon">
            <BrandMark size={22} />
          </div>
          <span className="admin-gate-logo-text">
            <BrandText />
          </span>
        </div>
        <Spinner />
        <p style={{ marginTop: "0.75rem", fontSize: "0.84rem", color: "var(--muted)" }}>
          Verifying admin session…
        </p>
      </motion.div>
    </AdminThemed>
  );
}

/* ── Sidebar nav body ───────────────────────────────────── */
function SidebarNav({
  me,
  displayName,
  initial,
  isActive,
  onNavClick,
}: {
  me: AdminMe;
  displayName: string;
  initial: string;
  isActive: (href: string) => boolean;
  onNavClick?: () => void;
}) {
  return (
    <>
      <Link href="/" className="admin-sidebar-brand" aria-label="Go to RunnerUp homepage">
        <div className="admin-sidebar-brand-icon">
          <BrandMark size={20} />
        </div>
        <div className="admin-sidebar-brand-text">
          <strong>
            <BrandText />
          </strong>
          <span>Operations</span>
        </div>
      </Link>

      <nav aria-label="Admin" className="admin-nav">
        {navGroups.map((group) => (
          <div className="admin-nav-group" key={group.label}>
            <div className="admin-nav-group-label">{group.label}</div>
            {group.items.map((item) => (
              <Link
                className={`admin-nav-link ${isActive(item.href) ? "is-active" : ""}`}
                href={item.href}
                key={item.href}
                onClick={onNavClick}
              >
                <NavIcon name={item.icon} />
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="admin-sidebar-foot">
        <div className="admin-sidebar-foot-top">
          <div className="admin-user-chip">
            <div className="avatar">{initial}</div>
            <div className="meta">
              <strong>{displayName}</strong>
              <span>
                {me.role ?? "ADMIN"}
                {me.mode === "dev-bypass" ? " · dev" : ""}
              </span>
            </div>
          </div>
          <AdminThemeToggle className="is-icon-only" />
        </div>
        <div className="admin-sidebar-links">
          <Link href="/" className="admin-sidebar-site-btn">
            ← View site
          </Link>
          <Link href="/dashboard">My dashboard</Link>
        </div>
      </div>
    </>
  );
}

/* ── Inner shell (must sit under AdminThemeProvider) ────── */
function AdminShellInner({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const pathname = usePathname();
  const [me, setMe] = useState<AdminMe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const loadMe = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorStatus(null);
    try {
      let token: string | null = null;
      for (let attempt = 0; attempt < 6; attempt += 1) {
        token = await getToken().catch(() => null);
        if (token || !isSignedIn) break;
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      const json = await adminFetch<{ data: AdminMe }>("/api/admin/me", token);
      setMe(json.data);
    } catch (err) {
      setMe(null);
      if (err instanceof AdminApiError) {
        setErrorStatus(err.status);
        setError(err.message);
      } else {
        setErrorStatus(null);
        setError(err instanceof Error ? err.message : "Admin access denied");
      }
    } finally {
      setLoading(false);
    }
  }, [getToken, isSignedIn]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setLoading(false);
      setMe(null);
      setError(null);
      setErrorStatus(null);
      return;
    }
    void loadMe();
  }, [isLoaded, isSignedIn, loadMe]);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  /* ── Gates ─────────────────────────────────────────────── */
  if (!isLoaded || (isSignedIn && loading)) {
    return <GateLoading />;
  }

  if (!isSignedIn) {
    return <GateSignIn />;
  }

  const isServerOrNetworkError =
    errorStatus === 530 ||
    errorStatus === 0 ||
    (errorStatus !== null && errorStatus >= 500) ||
    Boolean(error?.includes("530")) ||
    Boolean(error?.includes("Failed to connect")) ||
    Boolean(error?.includes("Failed to fetch"));

  if (isServerOrNetworkError) {
    return (
      <GateServerError
        email={user?.primaryEmailAddress?.emailAddress}
        error={error}
        status={errorStatus}
        onRetry={() => void loadMe()}
      />
    );
  }

  if (error || !me) {
    return (
      <GateRestricted
        email={user?.primaryEmailAddress?.emailAddress}
        error={error}
        onRetry={() => void loadMe()}
      />
    );
  }

  /* ── Authenticated admin shell ──────────────────────────── */
  const displayName = me.name ?? user?.fullName ?? me.email ?? "Admin";
  const initial = displayName.slice(0, 1).toUpperCase();

  const navProps = {
    me,
    displayName,
    initial,
    isActive,
  };

  return (
    <AdminThemed>
      {/* Mobile top bar */}
      <div className="admin-mobile-bar">
        <Link href="/" className="admin-mobile-bar-brand">
          <BrandMark size={22} />
          <strong>
            <BrandText />
          </strong>
        </Link>
        <div className="admin-mobile-bar-actions">
          <Link
            href="/"
            className="admin-mobile-bar-site-link"
            aria-label="Go to main site"
          >
            ← Site
          </Link>
          <AdminThemeToggle className="is-icon-only" />
          <button
            className="btn btn-secondary"
            onClick={() => setMobileOpen((v) => !v)}
            type="button"
          >
            {mobileOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            className="admin-mobile-drawer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <SidebarNav
              {...navProps}
              onNavClick={() => setMobileOpen(false)}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Desktop shell */}
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <SidebarNav {...navProps} />
        </aside>
        <main className="admin-main">
          <motion.div
            className="admin-page"
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </AdminThemed>
  );
}

/* ── Main AdminShell ────────────────────────────────────── */
export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminThemeProvider>
      <AdminShellInner>{children}</AdminShellInner>
    </AdminThemeProvider>
  );
}
