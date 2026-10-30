"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { authHeaders, getApiUrl } from "../../lib/api";

export function PersistentRegisterCta() {
  const pathname = usePathname();
  const { isSignedIn, getToken } = useAuth();
  const [isPaidCustomer, setIsPaidCustomer] = useState(false);

  // Always call all React hooks unconditionally to obey React Rules of Hooks
  useEffect(() => {
    if (!isSignedIn) {
      setIsPaidCustomer(false);
      return;
    }

    // Do NOT fire DB query on pages where CTA is never shown anyway
    const isExcludedPage =
      pathname === "/register" ||
      pathname?.startsWith("/admin") ||
      pathname?.startsWith("/dashboard") ||
      pathname?.startsWith("/profile") ||
      pathname?.startsWith("/certificates") ||
      (pathname?.startsWith("/events/") && pathname !== "/events");

    if (isExcludedPage) {
      return;
    }

    // Check cached session state to eliminate repeated API queries across page navigations
    if (typeof window !== "undefined") {
      try {
        if (sessionStorage.getItem("ru_user_has_paid") === "1") {
          setIsPaidCustomer(true);
          return;
        }
      } catch {
        // ignore
      }
    }

    let isMounted = true;
    async function checkPaidStatus() {
      try {
        const token = await getToken();
        if (!token || !isMounted) return;
        const res = await fetch(getApiUrl("/api/users/me"), {
          headers: authHeaders(token),
        });
        if (!res.ok) return;
        const json = await res.json();
        const registrations = json.data?.registrations ?? [];
        const hasPaid = registrations.some(
          (r: any) =>
            r.status === "CONFIRMED" ||
            r.status === "COMPLETED" ||
            r.payment?.status === "PAID",
        );
        if (isMounted && hasPaid) {
          setIsPaidCustomer(true);
          if (typeof window !== "undefined") {
            try {
              sessionStorage.setItem("ru_user_has_paid", "1");
            } catch {
              // ignore
            }
          }
        }
      } catch {
        // Silently keep default on network errors
      }
    }

    void checkPaidStatus();
    return () => {
      isMounted = false;
    };
  }, [isSignedIn, getToken, pathname]);

  // Hide on athlete profile / dashboard, admin, certificates
  const shouldHide =
    pathname === "/register" ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/profile") ||
    pathname?.startsWith("/certificates");

  if (shouldHide) {
    return null;
  }

  const targetHref = "/events#next-challenge";

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. MOBILE VIEW (< md): Fixed Bottom Sticky Bar
          ───────────────────────────────────────────────────────────── */}
      <aside
        aria-label="Next challenge early access"
        className="fixed inset-x-0 bottom-0 z-40 bg-[#122329]/98 backdrop-blur-xl border-t border-white/10 shadow-[0_-12px_36px_rgba(0,0,0,0.8)] px-3 py-2.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] md:hidden"
      >
        <div className="mx-auto flex max-w-lg items-center justify-between gap-2">
          {/* Live Indicator + Description */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
            <div className="min-w-0 flex flex-col justify-center">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#fcf8f2] truncate">
                Next Challenge
              </span>
              <p className="text-[9px] font-medium text-amber-300 truncate">
                Secret Perks · Dropping Soon
              </p>
            </div>
          </div>

          {/* Glowing CTA Button */}
          <Link
            href={targetHref}
            className="group relative inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#e64833] via-[#ea5a47] to-[#c93b27] px-4 py-2 text-xs font-black uppercase tracking-wider text-[#fbe9d0] shadow-[0_0_16px_rgba(230,72,51,0.5)] active:scale-95 transition-all shrink-0 border border-white/20 whitespace-nowrap"
          >
            <Zap className="h-3.5 w-3.5 text-[#fbe9d0] fill-[#fbe9d0]" />
            <span>VIP Early Access</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#fbe9d0] transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          2. DESKTOP VIEW (>= md): Floating Action Pill
          ───────────────────────────────────────────────────────────── */}
      <aside
        aria-label="Next challenge early access"
        className="fixed bottom-6 right-6 z-40 hidden md:flex items-center"
      >
        <Link
          href={targetHref}
          className="group relative flex items-center gap-3 rounded-full border border-white/15 bg-gradient-to-r from-[#172c34]/98 via-[#1b343e]/98 to-[#14242a]/98 pl-4 pr-2 py-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-2xl transition-all duration-300 hover:scale-[1.03] hover:border-[#e64833]/60 hover:shadow-[0_12px_36px_rgba(230,72,51,0.25)]"
        >
          {/* Ambient Glow */}
          <div className="pointer-events-none absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#e64833]/25 via-amber-500/15 to-transparent blur-md opacity-80 group-hover:opacity-100 transition-opacity" />

          {/* Live Indicator & Description */}
          <div className="relative z-10 flex items-center gap-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span className="text-xs font-bold text-[#fbe9d0] tracking-wide">
              Next Challenge
            </span>
            <span className="text-[10px] text-amber-300 font-medium hidden lg:inline">
              · Secret Perks Dropping Soon
            </span>
          </div>

          {/* Vermilion Button Pill */}
          <span className="relative z-10 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#e64833] via-[#ea5a47] to-[#c93b27] px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-[0_0_15px_rgba(230,72,51,0.5)] group-hover:shadow-[0_0_24px_rgba(230,72,51,0.85)] transition-all">
            <Sparkles className="h-3 w-3 text-[#fbe9d0]" />
            <span>VIP Early Access</span>
            <ArrowRight className="h-3 w-3 text-[#fbe9d0] transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </Link>
      </aside>
    </>
  );
}
