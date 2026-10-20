import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
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

export type AdminPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
  itemName?: string;
  pageSizeOptions?: number[];
  loading?: boolean;
};

/**
 * Reusable, high-performance Admin Pagination Toolbar
 * Supports min 50 items per page, page jumping, custom page sizes, and full toggle controls.
 */
export function AdminPagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  itemName = "records",
  pageSizeOptions = [50, 100, 200, 500, 1000],
  loading = false,
}: AdminPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const startRecord = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endRecord = Math.min(safePage * pageSize, total);

  // Compute page number pills (with smart windowing & ellipsis)
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [1];
    const leftBound = Math.max(2, safePage - 1);
    const rightBound = Math.min(totalPages - 1, safePage + 1);

    if (leftBound > 2) {
      pages.push("ellipsis-start");
    }

    for (let p = leftBound; p <= rightBound; p++) {
      pages.push(p);
    }

    if (rightBound < totalPages - 1) {
      pages.push("ellipsis-end");
    }

    pages.push(totalPages);
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-3.5 px-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] text-xs text-[var(--muted)] shadow-xs">
      {/* ── Left: Summary & Per-Page Selector ── */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-medium text-[var(--foreground)]">
          Showing <span className="font-bold text-amber-400 font-mono">{startRecord}</span>–
          <span className="font-bold text-amber-400 font-mono">{endRecord}</span> of{" "}
          <span className="font-bold text-[var(--foreground)] font-mono">{total}</span> {itemName}
        </span>

        <div className="flex items-center gap-1.5 pl-2 border-l border-[var(--line)]">
          <span className="text-[11px] text-[var(--muted-soft)] uppercase font-semibold tracking-wider">
            Per page:
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              const val = Number(e.target.value);
              onPageSizeChange(val);
            }}
            disabled={loading}
            className="input h-7 px-2 py-0 text-xs font-semibold bg-[var(--panel-soft)] border-[var(--line)] text-[var(--foreground)] rounded-lg cursor-pointer hover:border-amber-400/50 transition-colors"
          >
            {pageSizeOptions.map((sz) => (
              <option key={sz} value={sz}>
                {sz >= 1000 ? "All (1000)" : `${sz} per page`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Right: Page Navigation Buttons ── */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={safePage <= 1 || loading}
          className="btn btn-secondary h-7 px-2 text-[11px] flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          title="First Page"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
          <span className="hidden md:inline">First</span>
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1 || loading}
          className="btn btn-secondary h-7 px-2 text-[11px] flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          title="Previous Page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Prev</span>
        </button>

        {/* Page Pills */}
        <div className="flex items-center gap-1 px-1">
          {pages.map((p, idx) => {
            if (typeof p === "string") {
              return (
                <span key={`${p}-${idx}`} className="px-1 text-[var(--muted-soft)] font-mono select-none">
                  •••
                </span>
              );
            }
            const isActive = p === safePage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                disabled={loading}
                className={`h-7 min-w-7 px-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-amber-500 text-black shadow-sm shadow-amber-500/30 scale-105"
                    : "bg-[var(--panel-soft)] text-[var(--foreground)] border border-[var(--line)] hover:border-amber-400/50 hover:bg-[var(--line)]"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages || loading}
          className="btn btn-secondary h-7 px-2 text-[11px] flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          title="Next Page"
        >
          <span>Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={safePage >= totalPages || loading}
          className="btn btn-secondary h-7 px-2 text-[11px] flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          title="Last Page"
        >
          <span className="hidden md:inline">Last</span>
          <ChevronsRight className="h-3.5 w-3.5" />
        </button>

        {/* Direct Page Jump Selector if > 3 pages */}
        {totalPages > 3 && (
          <div className="ml-2 pl-2 border-l border-[var(--line)] flex items-center gap-1.5">
            <span className="text-[11px] text-[var(--muted-soft)]">Go:</span>
            <select
              value={safePage}
              onChange={(e) => onPageChange(Number(e.target.value))}
              disabled={loading}
              className="input h-7 px-1.5 py-0 text-xs font-mono font-semibold bg-[var(--panel-soft)] border-[var(--line)] text-[var(--foreground)] rounded-lg cursor-pointer"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pn) => (
                <option key={pn} value={pn}>
                  p.{pn}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}


