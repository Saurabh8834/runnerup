"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

export function PersistentRegisterCta() {
  const pathname = usePathname();

  // Hide on registration page itself (user is already on the payment checkout form)
  // and inside the admin portal
  if (pathname === "/register" || pathname?.startsWith("/admin")) {
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
    ? `/register?event=${encodeURIComponent(eventSlug)}`
    : "/register";

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. MOBILE VIEW (< md): Fixed Bottom Sticky Bar
          Note: If user is on an event detail page, the event-specific
          EventStickyCta renders with exact pricing, so suppress this one
          on /events/[slug] to avoid collision. On all other pages (Home,
          /events, /gallery, /leaderboard, etc.), this bar is ALWAYS shown.
          ───────────────────────────────────────────────────────────── */}
      {!isEventDetail && (
        <aside
          aria-label="Quick registration"
          className="fixed inset-x-0 bottom-0 z-40 bg-[#122329]/95 backdrop-blur-xl border-t border-[#90aead]/25 shadow-[0_-12px_36px_rgba(0,0,0,0.7)] px-3.5 py-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] md:hidden"
        >
          {/* Subtle neon glowing accent line */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#e64833] to-transparent animate-pulse" />

          <div className="mx-auto flex max-w-lg items-center justify-between gap-2.5">
            {/* Live Indicator + Description */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <div className="min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#fcf8f2] truncate">
                    Virtual Run 2026
                  </span>
                  <span className="hidden xs:inline-block rounded bg-[#e64833]/20 px-1 py-0.2 text-[8px] font-bold text-[#fbe9d0] border border-[#e64833]/30">
                    OPEN
                  </span>
                </div>
                <p className="text-[9.5px] font-medium text-[#90aead] truncate">
                  Medals · DRI-FIT Bib · Official Kits
                </p>
              </div>
            </div>

            {/* Glowing CTA Button */}
            <Link
              href={targetHref}
              className="group relative inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#e64833] via-[#ea5a47] to-[#c93b27] px-3.5 sm:px-4 py-2 text-xs font-black uppercase tracking-wider text-[#fbe9d0] shadow-[0_0_16px_rgba(230,72,51,0.5)] active:scale-95 transition-all shrink-0 border border-white/20 whitespace-nowrap"
            >
              <Zap className="h-3.5 w-3.5 text-[#fbe9d0] fill-[#fbe9d0]" />
              <span>Register Now</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#fbe9d0] transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </aside>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. DESKTOP VIEW (>= md): Floating Action Pill
          Always pinned at bottom-right of the screen across every page
          with a live pulse beacon and instant checkout link.
          ───────────────────────────────────────────────────────────── */}
      <aside
        aria-label="Quick registration"
        className="fixed bottom-6 right-6 z-40 hidden md:flex items-center"
      >
        <Link
          href={targetHref}
          className="group relative flex items-center gap-3 rounded-full border border-white/15 bg-gradient-to-r from-[#172c34]/95 via-[#1b343e]/95 to-[#14242a]/95 pl-4 pr-2 py-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.65)] backdrop-blur-2xl transition-all duration-300 hover:scale-[1.03] hover:border-[#e64833]/60 hover:shadow-[0_12px_36px_rgba(230,72,51,0.35)]"
        >
          {/* Ambient Glow */}
          <div className="pointer-events-none absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#e64833]/25 to-transparent blur-md opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Live Beacon & Status */}
          <div className="relative z-10 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#fbe9d0]">
                Registrations Open
              </span>
              <span className="text-[9px] font-semibold text-[#90aead]">
                Instant Entry · Limited Slots
              </span>
            </div>
          </div>

          {/* Vermilion Button Pill */}
          <span className="relative z-10 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#e64833] via-[#ea5a47] to-[#c93b27] px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-[0_0_15px_rgba(230,72,51,0.5)] group-hover:shadow-[0_0_24px_rgba(230,72,51,0.85)] transition-all">
            <Sparkles className="h-3 w-3 text-[#fbe9d0]" />
            <span>Register Now</span>
            <ArrowRight className="h-3 w-3 text-[#fbe9d0] transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </Link>
      </aside>
    </>
  );
}
