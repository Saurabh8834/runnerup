"use client";

import { SignedIn, SignedOut, useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  LayoutDashboard,
  Settings,
  LogOut,
  CalendarDays,
  Trophy,
  Calendar,
  Award,
  User,
  Zap,
  Sparkles,
  X,
  ArrowRight,
  ChevronRight,
  Flame,
  MessageCircle,
  Route,
  ShieldCheck,
} from "lucide-react";
import { BrandText } from "./brand-text";
import { ThemeToggle } from "./theme-toggle";

/* ─── Nav items with icons ─── */
const publicNav = [
  { label: "Home", href: "/", icon: Calendar },
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { label: "Medals", href: "/gallery", icon: Award },
  { label: "About", href: "/about", icon: Sparkles },
] as const;

/* ─── Animated hamburger button ─── */
function Hamburger({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      onClick={onClick}
      className="relative flex h-8.5 w-8.5 cursor-pointer items-center justify-center rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white transition-all active:scale-90"
    >
      <span className="flex w-4.5 flex-col gap-[4.5px]">
        <motion.span
          animate={open ? { rotate: 45, y: 6.5, width: 18 } : { rotate: 0, y: 0, width: 18 }}
          className="block h-[2px] origin-center rounded-full bg-current"
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.span
          animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
          className="block h-[2px] origin-center rounded-full bg-current"
          transition={{ duration: 0.2 }}
        />
        <motion.span
          animate={open ? { rotate: -45, y: -6.5, width: 18 } : { rotate: 0, y: 0, width: 18 }}
          className="block h-[2px] origin-center rounded-full bg-current"
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        />
      </span>
    </button>
  );
}

/* ─── Avatar with gradient ring ─── */
function AvatarButton({ onClick }: { onClick: () => void }) {
  const { user } = useUser();
  if (!user) return null;
  const name = user.fullName ?? user.firstName ?? "Account";
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const avatarUrl = user.imageUrl;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open profile menu"
      className="group relative cursor-pointer rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--sage)/40"
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="h-8 w-8 rounded-full object-cover ring-2 ring-(--line) transition-all duration-300 group-hover:ring-(--sage)/50 group-hover:scale-105 sm:h-9 sm:w-9"
        />
      ) : (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-indigo-500 text-[0.6rem] font-bold text-white ring-2 ring-(--line) transition-all duration-300 group-hover:ring-(--sage)/50 group-hover:scale-105 sm:h-9 sm:w-9">
          {initials}
        </span>
      )}
      {/* Online indicator */}
      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-(--panel) bg-emerald-500" />
    </button>
  );
}

/* ─── Profile dropdown trigger as Dashboard Pill ─── */
function DashboardProfileDropdown({ isMobile = false }: { isMobile?: boolean }) {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isActive = pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  if (!user) return null;
  const name = user.fullName ?? user.firstName ?? "Account";
  const role = user.publicMetadata?.role as string | undefined;
  const email = user.primaryEmailAddress?.emailAddress?.toLowerCase();
  const isAdmin =
    role === "admin" ||
    role === "super_admin" ||
    email === "sourav06556@gmail.com" ||
    email === "realblack009@gmail.com";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open dashboard and profile menu"
        aria-expanded={open}
        className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full border border-white/15 bg-[#090d14]/90 backdrop-blur-xl transition-all duration-200 hover:border-white/30 hover:bg-[#121926] hover:text-white shadow-xl cursor-pointer active:scale-95 ${
          isMobile
            ? "h-8 w-8 sm:h-9 sm:w-auto p-1.5 sm:px-3.5 sm:py-2 text-[0.72rem] font-bold uppercase tracking-wider text-white"
            : "px-4 py-1.5 sm:px-4.5 sm:py-2 text-xs font-bold uppercase tracking-wider text-white"
        } ${
          isActive
            ? "border-[#ff4b26]/60 bg-[#ff4b26]/20 text-white shadow-[0_0_15px_rgba(255,75,38,0.25)]"
            : ""
        }`}
      >
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={name}
            className="h-5 w-5 rounded-full object-cover ring-1 ring-white/30 shrink-0"
          />
        ) : (
          <User className="h-3.5 w-3.5 text-white/90 shrink-0" />
        )}
        <span className="hidden sm:inline">Dashboard</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="hidden sm:inline text-white/60 text-[0.65rem] leading-none"
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 max-w-[calc(100vw-2rem)] origin-top-right overflow-hidden rounded-2xl border border-white/15 bg-[#090d14]/98 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_20px_rgba(255,75,38,0.15)]"
          >
            <div className="h-[2px] w-full bg-gradient-to-r from-[#ff4b26] via-[#ff7844] to-[#facc15]" />
            
            {/* Athlete Header */}
            <div className="border-b border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <p className="truncate text-xs font-black uppercase tracking-wider text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{name}</p>
                <span className="rounded-full bg-[#ff4b26]/20 border border-[#ff4b26]/50 px-1.5 py-0.5 text-[0.55rem] font-black uppercase tracking-wider text-orange-200">
                  {isAdmin ? "Admin 🛡️" : "Athlete ⚡"}
                </span>
              </div>
              <p className="truncate text-[0.65rem] text-slate-300 font-medium mt-0.5">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>

            <div className="p-2 space-y-1">
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl border border-amber-400/40 bg-amber-500/20 px-3 py-2 text-xs font-black uppercase tracking-wider text-amber-200 transition-all duration-200 hover:bg-amber-500/30 hover:border-amber-400/60 hover:text-white"
                >
                  <Award className="h-4 w-4 text-amber-400" />
                  Admin Console 🛡️
                </Link>
              )}

              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl border border-transparent bg-white/[0.04] px-3 py-2 text-xs font-bold text-white transition-all duration-200 hover:bg-white/10 hover:border-white/15 hover:text-[#fbe9d0]"
              >
                <LayoutDashboard className="h-4 w-4 text-[#ff4b26]" />
                Athlete Dashboard
              </Link>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  openUserProfile();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl border border-transparent px-3 py-2 text-xs font-medium text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <Settings className="h-3.5 w-3.5 text-slate-400" />
                Account Settings
              </button>

              <div className="my-1 border-t border-white/10" />

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  void signOut(() => router.push("/"));
                }}
                className="flex w-full items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/15 px-3 py-2 text-xs font-black uppercase tracking-wider text-rose-200 transition-all duration-200 hover:bg-rose-500/25 hover:border-rose-400/60 hover:text-white cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5 text-rose-300" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



function NavLink({
  href,
  label,
  active,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs sm:text-[13px] transition-all duration-200 whitespace-nowrap shrink-0 ${
        active
          ? "text-white font-bold"
          : "text-slate-300 hover:text-white hover:bg-white/[0.08] font-medium"
      }`}
    >
      <span className="relative z-10 whitespace-nowrap shrink-0 flex items-center gap-1.5">
        {label}
        {label === "Leaderboard" && (
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(250,204,21,0.8)]" />
        )}
      </span>
      {active && (
        <motion.span
          layoutId="nav-header-active-pill"
          className="absolute inset-0 rounded-full bg-white/15 border border-white/20 shadow-xs"
          transition={{ type: "spring", stiffness: 450, damping: 35 }}
        />
      )}
    </Link>
  );
}


/* ─── Main header ─── */
export function AppHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();

  const role = user?.publicMetadata?.role as string | undefined;
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  const isAdmin =
    role === "admin" ||
    role === "super_admin" ||
    email === "sourav06556@gmail.com" ||
    email === "realblack009@gmail.com";

  const isActive = (href: string) => {
    return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
  };

  const handleNavClick = (href: string, e?: React.MouseEvent) => {
    if (href.startsWith("/#") && pathname === "/") {
      e?.preventDefault();
      const id = href.replace("/#", "");
      const elem = document.getElementById(id);
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", href);
      }
    }
  };

  const handleMobileNavClick = (href: string, e?: React.MouseEvent) => {
    setOpen(false);
    if (href.startsWith("/#") && pathname === "/") {
      e?.preventDefault();
      const id = href.replace("/#", "");
      setTimeout(() => {
        const elem = document.getElementById(id);
        if (elem) {
          elem.scrollIntoView({ behavior: "smooth" });
          window.history.pushState(null, "", href);
        }
      }, 300);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock background scrolling completely on mobile and desktop when menu is open
  useEffect(() => {
    if (!open) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.touchAction = prevBodyTouchAction;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 pointer-events-none transition-all duration-300 pt-2.5 sm:pt-3.5 px-3 sm:px-6 lg:px-8">
        <header
          className={`pointer-events-auto w-full max-w-7xl mx-auto rounded-full transition-all duration-300 flex items-center justify-between ${
            scrolled
              ? "bg-[#090d14]/95 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.85)] py-2 pl-3.5 pr-2 sm:px-6"
              : "bg-[#090d14]/85 backdrop-blur-xl border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.65)] py-2 sm:py-3 pl-3.5 pr-2 sm:px-6"
          }`}
        >
          {/* Left — Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/"
              aria-label="RUNNERUP home"
              className="group relative flex min-w-0 shrink-0 items-center transition-transform hover:scale-[1.02]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/runnerup-logo.png"
                alt="RUNNERUP"
                width={170}
                height={38}
                className="h-7.5 xs:h-8 sm:h-8.5 lg:h-9 w-auto object-contain drop-shadow-[0_2px_12px_rgba(255,75,38,0.35)] transition-transform duration-200 group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Center — Clean Desktop Nav (Floating Pill Bar) */}
          <div className="hidden lg:flex items-center shrink-0">
            <nav className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] p-1 rounded-full shadow-inner" aria-label="Main navigation">
              {publicNav.map(({ label, href }) => {
                const active = isActive(href);
                return (
                  <NavLink
                    key={href}
                    active={active}
                    href={href}
                    label={label}
                    onClick={(e) => handleNavClick(href, e)}
                  />
                );
              })}
            </nav>
          </div>

          {/* Right — Actions & Radiant CTA (Always visible on all screen sizes) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Desktop / Tablet Actions (md and up) */}
            <div className="hidden md:flex items-center gap-2 sm:gap-2.5 shrink-0">
              {(!isLoaded || !isSignedIn) ? (
                <>
                  <Link
                    className="inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 sm:px-4 text-xs font-bold text-slate-200 transition-all hover:text-white hover:bg-white/10 hover:border-white/30 whitespace-nowrap border border-white/15 bg-white/[0.04]"
                    href="/sign-in"
                  >
                    <User className="h-3.5 w-3.5 text-slate-300" />
                    <span>Login</span>
                  </Link>
                  <Link
                    className="group relative inline-flex h-9 sm:h-9.5 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#ff4b26] to-[#ff6a38] border-t border-white/25 px-4.5 sm:px-5.5 text-xs sm:text-[13px] font-black uppercase tracking-wider text-white shadow-md shadow-orange-950/40 transition-all duration-150 hover:brightness-110 hover:scale-[1.025] active:scale-[0.98] whitespace-nowrap overflow-hidden shrink-0"
                    href="/events"
                  >
                    <span>Join Now</span>
                    <ArrowRight className="h-3.5 w-3.5 text-white stroke-[2.5] transition-transform duration-150 group-hover:translate-x-1" />
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <Link
                    className="group relative inline-flex h-9 sm:h-9.5 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#ff4b26] to-[#ff6a38] border-t border-white/25 px-4 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-orange-950/40 transition-all duration-150 hover:brightness-110 hover:scale-[1.025] active:scale-[0.98] whitespace-nowrap overflow-hidden"
                    href="/events"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                    <span>Next Challenge</span>
                    <ArrowRight className="h-3.5 w-3.5 text-white stroke-[2.5]" />
                  </Link>
                  <DashboardProfileDropdown />
                </div>
              )}
            </div>

            {/* Mobile Actions (< md): Always show compact Login + Join Now + Hamburger */}
            <div className="flex md:hidden items-center gap-1.5 xs:gap-2 shrink-0">
              {(!isLoaded || !isSignedIn) ? (
                <>
                  <Link
                    className="hidden xs:inline-flex h-8 items-center justify-center rounded-full px-2.5 text-[11px] font-bold text-slate-200 border border-white/15 bg-white/[0.04] hover:text-white"
                    href="/sign-in"
                  >
                    Login
                  </Link>
                  <Link
                    className="group relative inline-flex h-8 items-center justify-center gap-1 rounded-full bg-gradient-to-r from-[#ff4b26] to-[#ff6a38] border-t border-white/25 px-3 text-[11px] font-black uppercase tracking-wider text-white shadow-sm shadow-orange-950/40 whitespace-nowrap overflow-hidden active:scale-95 transition-all duration-150"
                    href="/events"
                  >
                    <span>JOIN</span>
                    <ArrowRight className="h-3 w-3 text-white stroke-[2.5]" />
                  </Link>
                </>
              ) : (
                <DashboardProfileDropdown isMobile />
              )}
              <Hamburger open={open} onClick={() => setOpen((v) => !v)} />
            </div>
          </div>
        </header>
      </div>

      {/* ─── Production-Grade Slide-Over Mobile Drawer Sheet (Portaled to document.body) ─── */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {open && (
            <div className="fixed inset-0 z-[99999] lg:hidden pointer-events-auto">
              {/* Backdrop Overlay with Blur */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="fixed inset-0 bg-black/90 backdrop-blur-md"
                onClick={() => setOpen(false)}
                onTouchMove={(e) => e.preventDefault()}
              />

              {/* Slide-Over Drawer Sheet (100% Solid Dark Athletic Shell - ZERO Ghost Bleed) */}
              <motion.nav
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                className="fixed inset-y-0 right-0 z-10 flex h-full h-[100dvh] w-[86%] max-w-[340px] flex-col overflow-hidden rounded-l-[28px] border-l border-white/10 bg-[#080c10] shadow-[-30px_0_70px_rgba(0,0,0,0.95)] text-white"
                role="dialog"
                aria-modal="true"
                aria-label="Mobile Navigation"
              >
                {/* Top Subtle Brand Accent Line */}
                <div className="h-0.5 w-full bg-gradient-to-r from-[#ff4b26] via-[#ff6a38] to-[#ff4b26] shrink-0" />

                {/* Drawer Header: Brand Logo + Close Pill */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 shrink-0">
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 shrink-0"
                  >
                    <img
                      src="/runnerup-logo.png"
                      alt="RUNNERUP"
                      style={{ height: "26px", width: "auto" }}
                      className="h-6.5 max-h-[28px] w-auto object-contain shrink-0 drop-shadow-[0_2px_8px_rgba(255,75,38,0.35)]"
                    />
                  </Link>

                  {/* Circular Glass Close Button */}
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                    className="flex h-7.5 w-7.5 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-slate-300 transition-all duration-200 hover:border-white/30 hover:bg-white/15 hover:text-white active:scale-90 shadow-sm cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Body - Compact Fit (Zero Scroll on Standard Devices) */}
                <div
                  className="flex-1 overflow-y-auto overscroll-contain no-scrollbar px-3.5 py-3 flex flex-col justify-start gap-2.5"
                  style={{ touchAction: "pan-y", WebkitOverflowScrolling: "touch" }}
                >
                  {/* Athlete Profile (when signed in) */}
                  {isLoaded && isSignedIn && user ? (
                    <div className="flex items-center gap-2.5 rounded-xl border border-[#ff4b26]/30 bg-[#ff4b26]/10 px-3 py-2 shrink-0">
                      {user?.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt={user?.fullName ?? "Athlete"}
                          className="h-8 w-8 rounded-full object-cover ring-2 ring-[#ff4b26]/60 shrink-0"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff4b26] text-[11px] font-black text-white shrink-0">
                          {(user?.fullName ?? user?.firstName ?? "A").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-black uppercase text-white leading-tight">
                          {user?.fullName ?? user?.firstName ?? "Athlete"}
                        </p>
                        <p className="truncate text-[10px] text-slate-400 font-medium leading-tight">
                          {user?.primaryEmailAddress?.emailAddress}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#ff4b26]/25 border border-[#ff4b26]/40 px-1.5 py-0.2 text-[9px] font-black uppercase text-orange-200 shrink-0">
                        PRO ⚡
                      </span>
                    </div>
                  ) : null}

                  {/* Primary Next Challenge Top Pill Banner */}
                  <Link
                    href="/events/national-cancer-awareness-day-virtual-run-2026"
                    onClick={() => setOpen(false)}
                    className="group flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#ff4b26]/20 via-[#ff4b26]/10 to-transparent border border-[#ff4b26]/40 p-3 text-white transition-all hover:border-[#ff4b26] active:scale-[0.98] shrink-0"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ff4b26] text-white shrink-0 shadow-md">
                        <Sparkles className="h-4 w-4 text-white" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-wide text-white truncate leading-tight">
                          Cancer Awareness 2026
                        </p>
                        <p className="text-[11px] text-amber-300 font-semibold truncate leading-tight mt-0.5">
                          Active Challenge · 7–15 Nov
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-amber-400 shrink-0 transition-transform group-hover:translate-x-1" />
                  </Link>

                  {/* Clean Unified Navigation Links - Single Professional Color Combination */}
                  <div className="space-y-1.5 pt-0.5">
                    {/* 1. Home */}
                    <Link
                      href="/"
                      onClick={(e) => handleMobileNavClick("/", e)}
                      className={`group flex items-center gap-3 rounded-xl px-3.5 py-2 sm:py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-150 active:scale-[0.98] ${
                        pathname === "/"
                          ? "border border-[#ff4b26]/60 bg-[#ff4b26]/15 text-white shadow-md shadow-[#ff4b26]/10 font-black"
                          : "border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] hover:text-white"
                      }`}
                    >
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        pathname === "/" ? "bg-[#ff4b26]/30 text-[#ff4b26]" : "text-slate-400 group-hover:text-white"
                      }`}>
                        <Calendar className="h-4 w-4" strokeWidth={2.2} />
                      </div>
                      <span className="flex-1 font-black">Home</span>
                      <ChevronRight className={`h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 ${
                        pathname === "/" ? "text-[#ff4b26]" : "text-slate-500"
                      }`} />
                    </Link>

                    {/* 2. Events */}
                    <Link
                      href="/events"
                      onClick={(e) => handleMobileNavClick("/events", e)}
                      className={`group flex items-center gap-3 rounded-xl px-3.5 py-2 sm:py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-150 active:scale-[0.98] ${
                        isActive("/events")
                          ? "border border-[#ff4b26]/60 bg-[#ff4b26]/15 text-white shadow-md shadow-[#ff4b26]/10 font-black"
                          : "border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] hover:text-white"
                      }`}
                    >
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        isActive("/events") ? "bg-[#ff4b26]/30 text-[#ff4b26]" : "text-slate-400 group-hover:text-white"
                      }`}>
                        <Calendar className="h-4 w-4" strokeWidth={2.2} />
                      </div>
                      <span className="flex-1 font-black">Events</span>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold font-mono uppercase tracking-wider ${
                        isActive("/events")
                          ? "bg-[#ff4b26]/20 border border-[#ff4b26]/40 text-[#ff4b26]"
                          : "border border-white/10 bg-white/5 text-slate-400"
                      }`}>
                        Active
                      </span>
                      <ChevronRight className={`h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 ${
                        isActive("/events") ? "text-[#ff4b26]" : "text-slate-500"
                      }`} />
                    </Link>

                    {/* 3. Leaderboard */}
                    <Link
                      href="/leaderboard"
                      onClick={(e) => handleMobileNavClick("/leaderboard", e)}
                      className={`group flex items-center gap-3 rounded-xl px-3.5 py-2 sm:py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-150 active:scale-[0.98] ${
                        isActive("/leaderboard")
                          ? "border border-[#ff4b26]/60 bg-[#ff4b26]/15 text-white shadow-md shadow-[#ff4b26]/10 font-black"
                          : "border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] hover:text-white"
                      }`}
                    >
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        isActive("/leaderboard") ? "bg-[#ff4b26]/30 text-[#ff4b26]" : "text-slate-400 group-hover:text-white"
                      }`}>
                        <Trophy className="h-4 w-4" strokeWidth={2.2} />
                      </div>
                      <span className="flex-1 font-black">Leaderboard</span>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold font-mono uppercase tracking-wider ${
                        isActive("/leaderboard")
                          ? "bg-[#ff4b26]/20 border border-[#ff4b26]/40 text-[#ff4b26]"
                          : "border border-white/10 bg-white/5 text-slate-400"
                      }`}>
                        Live GPS
                      </span>
                      <ChevronRight className={`h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 ${
                        isActive("/leaderboard") ? "text-[#ff4b26]" : "text-slate-500"
                      }`} />
                    </Link>

                    {/* 4. Medals */}
                    <Link
                      href="/gallery"
                      onClick={(e) => handleMobileNavClick("/gallery", e)}
                      className={`group flex items-center gap-3 rounded-xl px-3.5 py-2 sm:py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-150 active:scale-[0.98] ${
                        isActive("/gallery")
                          ? "border border-[#ff4b26]/60 bg-[#ff4b26]/15 text-white shadow-md shadow-[#ff4b26]/10 font-black"
                          : "border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] hover:text-white"
                      }`}
                    >
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        isActive("/gallery") ? "bg-[#ff4b26]/30 text-[#ff4b26]" : "text-slate-400 group-hover:text-white"
                      }`}>
                        <Award className="h-4 w-4" strokeWidth={2.2} />
                      </div>
                      <span className="flex-1 font-black">Medals</span>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-mono font-bold text-slate-300">
                        3D Cast
                      </span>
                      <ChevronRight className={`h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 ${
                        isActive("/gallery") ? "text-[#ff4b26]" : "text-slate-500"
                      }`} />
                    </Link>

                    {/* 5. How It Works */}
                    <Link
                      href="/#how-it-works"
                      onClick={(e) => handleMobileNavClick("/#how-it-works", e)}
                      className="group flex items-center gap-3 rounded-xl px-3.5 py-2 sm:py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-150 active:scale-[0.98] border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] hover:text-white"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 group-hover:text-white">
                        <Route className="h-4 w-4" strokeWidth={2.2} />
                      </div>
                      <span className="flex-1 font-black">How It Works</span>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-mono font-bold text-slate-300">
                        3 Steps
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-500 transition-transform group-hover:translate-x-0.5" />
                    </Link>

                    {/* 6. Real Runners, Real Medals */}
                    <Link
                      href="/#real-runners"
                      onClick={(e) => handleMobileNavClick("/#real-runners", e)}
                      className="group flex items-center gap-3 rounded-xl px-3.5 py-2 sm:py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-150 active:scale-[0.98] border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] hover:text-white"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 group-hover:text-white">
                        <ShieldCheck className="h-4 w-4" strokeWidth={2.2} />
                      </div>
                      <span className="flex-1 font-black">Real Runners & Medals</span>
                      <span className="rounded-full border border-white/10 bg-white/5 text-slate-300 px-2 py-0.5 text-[9px] font-bold font-mono uppercase tracking-wider">
                        Verified
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-500 transition-transform group-hover:translate-x-0.5" />
                    </Link>

                    {/* 7. About */}
                    <Link
                      href="/about"
                      onClick={(e) => handleMobileNavClick("/about", e)}
                      className={`group flex items-center gap-3 rounded-xl px-3.5 py-2 sm:py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-150 active:scale-[0.98] ${
                        isActive("/about")
                          ? "border border-[#ff4b26]/60 bg-[#ff4b26]/15 text-white shadow-md shadow-[#ff4b26]/10 font-black"
                          : "border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] hover:text-white"
                      }`}
                    >
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        isActive("/about") ? "bg-[#ff4b26]/30 text-[#ff4b26]" : "text-slate-400 group-hover:text-white"
                      }`}>
                        <Sparkles className="h-4 w-4" strokeWidth={2.2} />
                      </div>
                      <span className="flex-1 font-black">About</span>
                      <ChevronRight className={`h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 ${
                        isActive("/about") ? "text-[#ff4b26]" : "text-slate-500"
                      }`} />
                    </Link>

                    {/* Dashboard (if signed in) */}
                    {isLoaded && isSignedIn && (
                      <Link
                        href="/dashboard"
                        onClick={() => setOpen(false)}
                        className={`group flex items-center gap-3 rounded-xl px-3.5 py-2 sm:py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-150 active:scale-[0.98] ${
                          isActive("/dashboard")
                            ? "border border-[#ff4b26]/60 bg-[#ff4b26]/15 text-white shadow-md shadow-[#ff4b26]/10 font-black"
                            : "border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] hover:text-white"
                        }`}
                      >
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                          isActive("/dashboard") ? "bg-[#ff4b26]/30 text-[#ff4b26]" : "text-slate-400 group-hover:text-white"
                        }`}>
                          <LayoutDashboard className="h-4 w-4" strokeWidth={2.2} />
                        </div>
                        <span className="flex-1 font-black">Dashboard</span>
                        <ChevronRight className={`h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 ${
                          isActive("/dashboard") ? "text-[#ff4b26]" : "text-slate-500"
                        }`} />
                      </Link>
                    )}

                    {/* Admin Console (if owner) */}
                    {isLoaded && isSignedIn && isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setOpen(false)}
                        className="group flex items-center gap-3 rounded-xl px-3.5 py-2 sm:py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-150 active:scale-[0.98] border border-amber-400/40 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/30 text-amber-400">
                          <Award className="h-4 w-4" strokeWidth={2.2} />
                        </div>
                        <span className="flex-1 font-black">Admin Console</span>
                        <span className="rounded-full bg-amber-500/30 border border-amber-400/50 px-1.5 py-0.2 text-[8px] font-black uppercase text-amber-300">
                          🛡️ Owner
                        </span>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Drawer Footer Actions - Compact (Chat with Director REMOVED) */}
                <div className="p-3 border-t border-white/10 bg-[#060a0f] shrink-0 space-y-2">
                  {isLoaded && isSignedIn ? (
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        void signOut(() => router.push("/"));
                      }}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-rose-300 transition-all duration-150 hover:bg-rose-500/20 active:scale-[0.98] cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5 text-rose-300" />
                      <span>Sign Out</span>
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <Link
                        href="/sign-in"
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.05] px-3 py-2.5 text-xs font-black uppercase tracking-wider text-white transition-all hover:bg-white/10 active:scale-95"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/events"
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-[#ff4b26] to-[#ff6a38] px-3 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-sm active:scale-95 transition-all"
                      >
                        <span>Join Event</span>
                        <ArrowRight className="h-3.5 w-3.5 text-white stroke-[2.5]" />
                      </Link>
                    </div>
                  )}

                  <p className="text-center text-[9.5px] text-slate-500 font-semibold tracking-wide">
                    RUNNERUP © 2026 • Virtual Marathon Platform
                  </p>
                </div>
              </motion.nav>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )}
  </>
  );
}
