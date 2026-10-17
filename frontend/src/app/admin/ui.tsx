import { motion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";

export function AdminPageHeader({
  kicker = "Admin",
  title,
  description,
  actions,
}: {
  kicker?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="admin-page-header">
      <div>
        <p className="admin-kicker">{kicker}</p>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="admin-actions">{actions}</div> : null}
    </header>
  );
}

export function AdminPanel({
  title,
  subtitle,
  action,
  children,
  className = "",
  fill = false,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  fill?: boolean;
}) {
  return (
    <section
      className={`admin-panel admin-panel-pad ${fill ? "is-fill" : ""} ${className}`.trim()}
    >
      {title ? (
        <div className="admin-section-label">
          <div>
            <h2 className="admin-panel-title">{title}</h2>
            {subtitle ? <p className="admin-panel-sub">{subtitle}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      <div className={fill ? "admin-fill" : undefined}>{children}</div>
    </section>
  );
}

export function AdminStat({
  label,
  value,
  hint,
  trend,
  trendDir,
}: {
  label: string;
  value: string;
  hint?: string;
  trend?: string;
  trendDir?: "up" | "down";
}) {
  return (
    <div className="admin-stat">
      <div className="label">{label}</div>
      <motion.div
        className="value"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {value}
      </motion.div>
      {hint ? <div className="hint">{hint}</div> : null}
      {trend ? (
        <div className={`trend ${trendDir ?? ""}`}>
          {trendDir === "up" ? "↑" : trendDir === "down" ? "↓" : ""} {trend}
        </div>
      ) : null}
    </div>
  );
}

export function AdminEmpty({ children }: { children: ReactNode }) {
  return <div className="admin-empty">{children}</div>;
}

export function AdminBackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link className="admin-link admin-muted" href={href}>
      ← {label}
    </Link>
  );
}

/**
 * Green or Red status dot for customers/runners.
 * Green = Paid / Confirmed
 * Red = Unpaid / Pending Payment / Failed
 */
export function CustomerStatusDot({
  isPaid,
  showLabel = false,
  paidLabel = "Paid",
  unpaidLabel = "Unpaid",
  className = "",
}: {
  isPaid: boolean;
  showLabel?: boolean;
  paidLabel?: string;
  unpaidLabel?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 align-middle ${className}`}
      title={isPaid ? "Payment Verified (Paid)" : "Payment Pending (Unpaid)"}
    >
      <span className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center">
        {isPaid ? (
          <>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.85)]" />
          </>
        ) : (
          <>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.85)]" />
          </>
        )}
      </span>
      {showLabel && (
        <span
          className={`text-[0.65rem] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
            isPaid
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
          }`}
        >
          {isPaid ? paidLabel : unpaidLabel}
        </span>
      )}
    </span>
  );
}

