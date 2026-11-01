import Link from "next/link";
import { ShieldCheck, Lock } from "lucide-react";
import { AppFooter } from "./app-footer";
import { AppHeader } from "./app-header";

export function CheckoutFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#080d13] pt-4 pb-20 lg:pb-4 px-4 text-xs text-slate-400 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>RunnerUp • Official Verified Checkout</span>
        </div>
        <div className="flex items-center gap-3 text-[11.5px] text-slate-400 flex-wrap justify-center">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <span>•</span>
          <Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link>
          <span>•</span>
          <a href="https://wa.me/918287831071" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Support Helpline</a>
        </div>
        <div className="flex items-center gap-2 text-[10.5px] text-slate-400">
          <Lock className="h-3 w-3 text-emerald-400 shrink-0" />
          <span>256-Bit SSL Encrypted</span>
        </div>
      </div>
    </footer>
  );
}

export function PageShell({
  children,
  checkoutFooter = false,
  hideFooter = false,
}: {
  children: React.ReactNode;
  checkoutFooter?: boolean;
  hideFooter?: boolean;
}) {
  return (
    <div className="page-shell flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1 pt-0">{children}</main>
      {!hideFooter && (checkoutFooter ? <CheckoutFooter /> : <AppFooter />)}
    </div>
  );
}

export { AppFooter } from "./app-footer";

export function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="field-label">
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-0.5 text-[var(--danger)]">
            *
          </span>
        ) : null}
      </span>
      {children}
    </label>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:gap-6 md:flex-row md:items-end">
      <div className="min-w-0 max-w-2xl">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className={`display ${eyebrow ? "mt-3 sm:mt-4" : ""}`}>{title}</h1>
        {description ? <p className="lede mt-3 max-w-xl sm:mt-4">{description}</p> : null}
      </div>
      {action ? <div className="w-full shrink-0 sm:w-auto">{action}</div> : null}
    </div>
  );
}

export const inputClass = "input";
export const primaryLinkClass = "btn btn-primary";
export const secondaryLinkClass = "btn btn-secondary";
