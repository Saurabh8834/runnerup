"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Flame, Sparkles, Timer, Zap } from "lucide-react";
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

    // Do NOT fire heavy DB query on pages where CTA is never shown anyway
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
      // 1. Instant check from sessionStorage to avoid redundant network & DB calls
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
            r.payment?.status === "PAID"
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
  }, [isSignedIn, getToken]);

  // Flash Sale Timer: Counts down to tonight 12:00 AM Midnight (25 Oct 2026, 23:59:59 IST)
  // When tonight 12 passes, the timer closes completely.
  const [timeState, setTimeState] = useState<{ display: string; isClosed: boolean }>({
    display: "02:20:00",
    isClosed: false,
  });

  useEffect(() => {
    // Tonight 12:00 AM Midnight IST (25 Oct 2026 23:59:59 IST)
    const deadline = new Date("2026-10-25T23:59:59+05:30").getTime();

    function tick() {
      const remaining = Math.max(0, deadline - Date.now());
      if (remaining <= 0) {
        setTimeState({ display: "00:00", isClosed: true });
        return;
      }

      const totalSec = Math.floor(remaining / 1000);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;

      const formatted =
        h > 0
          ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
          : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

      setTimeState({
        display: formatted,
        isClosed: false,
      });
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Hide on athlete profile / dashboard, checkout, admin, certificates, event detail pages, already paid customers, or when sale has closed
  const shouldHide =
    pathname === "/register" ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/profile") ||
    pathname?.startsWith("/certificates") ||
    (pathname?.startsWith("/events/") && pathname !== "/events") ||
    isPaidCustomer ||
    timeState.isClosed;

  if (shouldHide) {
    return null;
  }

  // Check if user is on a specific event page (e.g. /events/october-runner)
  const isEventDetail =
    pathname?.startsWith("/events/") &&
    pathname !== "/events" &&
    pathname.length > 8;

  // Extract slug if on an event page to pre-fill registration
  const eventSlug = isEventDetail ? pathname.replace("/events/", "") : null;
  const targetHref = eventSlug
    ? `/register?event=${encodeURIComponent(eventSlug)}&coupon=RUN50`
    : "/register?coupon=RUN50";

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. MOBILE VIEW (< md): Fixed Bottom Sticky Bar with Urgency Strip
          ───────────────────────────────────────────────────────────── */}
      {!isEventDetail && (
        <aside
          aria-label="Quick registration"
          className="fixed inset-x-0 bottom-0 z-40 bg-[#122329]/98 backdrop-blur-xl border-t border-amber-500/40 shadow-[0_-12px_36px_rgba(0,0,0,0.8)] px-3 py-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] md:hidden"
        >
          {/* Top Urgency Strip */}
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10 text-[10.5px]">
            <div className="flex items-center gap-1.5 font-bold text-amber-300 min-w-0">
              <Flame className="h-3 w-3 text-amber-400 fill-amber-400 animate-pulse shrink-0" />
              <span className="truncate">
                Extra 10% OFF with code <strong className="font-mono bg-amber-500/20 px-1 py-0.2 rounded border border-amber-500/40 text-amber-200">RUN50</strong>
              </span>
            </div>
            <div className="flex items-center gap-1 font-mono font-black text-amber-300 bg-black/50 px-2 py-0.5 rounded-full border border-amber-500/40 shrink-0 ml-1.5">
              <Timer className="h-2.5 w-2.5 text-amber-400" />
              <span>{timeState.display}</span>
            </div>
          </div>

          <div className="mx-auto flex max-w-lg items-center justify-between gap-2">
            {/* Live Indicator + Description */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <div className="min-w-0 flex flex-col justify-center">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#fcf8f2] truncate">
                  Virtual Run 2026
                </span>
                <p className="text-[9px] font-medium text-[#90aead] truncate">
                  Medals · Race Bib · Verified
                </p>
              </div>
            </div>

            {/* Glowing CTA Button */}
            <Link
              href={targetHref}
              className="group relative inline-flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-[#e64833] via-[#ea5a47] to-[#c93b27] px-3 py-1.5 text-xs font-black uppercase tracking-wider text-[#fbe9d0] shadow-[0_0_16px_rgba(230,72,51,0.5)] active:scale-95 transition-all shrink-0 border border-white/20 whitespace-nowrap"
            >
              <Zap className="h-3 w-3 text-[#fbe9d0] fill-[#fbe9d0]" />
              <span>Claim ₹50 OFF</span>
              <ArrowRight className="h-3 w-3 text-[#fbe9d0] transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </aside>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. DESKTOP VIEW (>= md): Floating Action Pill with Live Timer
          ───────────────────────────────────────────────────────────── */}
      <aside
        aria-label="Quick registration"
        className="fixed bottom-6 right-6 z-40 hidden md:flex items-center"
      >
        <Link
          href={targetHref}
          className="group relative flex items-center gap-3 rounded-full border border-amber-500/40 bg-gradient-to-r from-[#172c34]/98 via-[#1b343e]/98 to-[#14242a]/98 pl-3.5 pr-2 py-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-2xl transition-all duration-300 hover:scale-[1.03] hover:border-amber-400/80 hover:shadow-[0_12px_36px_rgba(245,158,11,0.35)]"
        >
          {/* Ambient Glow */}
          <div className="pointer-events-none absolute -inset-0.5 rounded-full bg-gradient-to-r from-amber-500/30 via-[#e64833]/25 to-transparent blur-md opacity-80 group-hover:opacity-100 transition-opacity" />

          {/* Code Badge & Countdown Timer */}
          <div className="relative z-10 flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 px-2.5 py-1 text-[11px] font-black text-amber-300 shadow-sm">
              <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400 animate-pulse" />
              <span>RUN50</span>
              <span className="text-[10px] text-amber-200/90 font-bold bg-amber-500/25 px-1 rounded">10% OFF</span>
            </span>

            <div className="flex items-center gap-1 font-mono text-xs font-black text-[#fbe9d0] bg-[#14242a]/80 px-2.5 py-1 rounded-full border border-white/10">
              <Timer className="h-3.5 w-3.5 text-amber-400" />
              <span>{timeState.display}</span>
            </div>
          </div>

          {/* Vermilion Button Pill */}
          <span className="relative z-10 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#e64833] via-[#ea5a47] to-[#c93b27] px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-[0_0_15px_rgba(230,72,51,0.5)] group-hover:shadow-[0_0_24px_rgba(230,72,51,0.85)] transition-all">
            <Sparkles className="h-3 w-3 text-[#fbe9d0]" />
            <span>Register · ₹50 OFF</span>
            <ArrowRight className="h-3 w-3 text-[#fbe9d0] transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </Link>
      </aside>
    </>
  );
}
