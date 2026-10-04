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
  X,
  ArrowRight,
} from "lucide-react";
import { BrandText } from "./brand-text";
import { ThemeToggle } from "./theme-toggle";

/* ─── Nav items with icons ─── */
const publicNav = [
  { label: "Events", href: "/events", icon: Calendar },
  { label: "How It Works", href: "/#how-it-works", icon: Zap },
  { label: "Gallery", href: "/gallery", icon: Camera },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
] as const;

/* ─── Animated hamburger button ─── */
function Hamburger({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      onClick={onClick}
      className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-white/20 bg-slate-900/80 text-white backdrop-blur-xl shadow-lg transition-all duration-200 hover:border-sky-400/50 hover:bg-slate-800/90 hover:shadow-[0_0_15px_rgba(56,189,248,0.25)] active:scale-90"
    >
      <span className="flex w-5 flex-col gap-[5px]">
        <motion.span
          animate={open ? { rotate: 45, y: 7, width: 20 } : { rotate: 0, y: 0, width: 20 }}
          className="block h-[2px] origin-center rounded-full bg-current"
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.span
          animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
          className="block h-[2px] origin-center rounded-full bg-current"
          transition={{ duration: 0.2 }}
        />
        <motion.span
          animate={open ? { rotate: -45, y: -7, width: 20 } : { rotate: 0, y: 0, width: 20 }}
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
  const isAdmin =
    role === "admin" ||
    role === "super_admin" ||
    user.primaryEmailAddress?.emailAddress === "realblack009@gmail.com";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open dashboard and profile menu"
        aria-expanded={open}
        className={`inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#090d16]/85 backdrop-blur-xl transition-all duration-200 hover:border-white/30 hover:bg-[#090d16] hover:text-white shadow-xl cursor-pointer active:scale-95 ${
          isMobile
            ? "px-3 py-1.5 text-[0.72rem] font-bold uppercase tracking-wider text-white"
            : "px-4 py-1.5 sm:px-4.5 sm:py-2 text-xs font-bold uppercase tracking-wider text-white"
        } ${
          isActive
            ? "border-sky-400/50 bg-sky-500/20 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.25)]"
            : ""
        }`}
      >
        <User className="h-3.5 w-3.5 text-white/90" />
        <span>Dashboard</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-white/60 text-[0.65rem] leading-none"
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
            className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 origin-top-right overflow-hidden rounded-2xl border border-white/20 bg-slate-950/60 backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_20px_50px_rgba(0,0,0,0.7),0_0_20px_rgba(56,189,248,0.15)]"
          >
            <div className="h-[2px] w-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500" />
            
            {/* Athlete Header */}
            <div className="border-b border-white/10 bg-white/[0.06] p-3.5 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <p className="truncate text-xs font-black uppercase tracking-wider text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{name}</p>
                <span className="rounded-full bg-sky-500/25 border border-sky-400/40 px-1.5 py-0.5 text-[0.55rem] font-black uppercase tracking-wider text-sky-300">
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
                className="flex items-center gap-2.5 rounded-xl border border-transparent bg-white/[0.04] px-3 py-2 text-xs font-bold text-white transition-all duration-200 hover:bg-white/10 hover:border-white/15 hover:text-sky-300"
              >
                <LayoutDashboard className="h-4 w-4 text-sky-400" />
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
      onClick={onClick}
      className={`relative inline-flex items-center rounded-full px-3.5 sm:px-4 py-1.5 text-xs sm:text-[13px] font-medium transition-all duration-200 whitespace-nowrap shrink-0 ${
        active
          ? "text-[#fbe9d0] font-semibold"
          : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
      }`}
    >
      {active && (
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#e64833] shadow-[0_0_8px_#e64833] mr-1.5 shrink-0" />
      )}
      <span className="whitespace-nowrap shrink-0">{label}</span>
      {active && (
        <motion.span
          layoutId="nav-capsule-active"
          className="absolute inset-0 -z-10 rounded-full bg-[#e64833]/15 border border-[#e64833]/40 shadow-[0_0_14px_rgba(230,72,51,0.25)]"
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
  const isAdmin =
    role === "admin" ||
    role === "super_admin" ||
    user?.primaryEmailAddress?.emailAddress === "realblack009@gmail.com";

  const isActive = (href: string) => {
    if (href === "/#how-it-works") return false;
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
      <header
        className={`fixed inset-x-0 top-3 sm:top-4 z-50 flex justify-center px-4 sm:px-6 pointer-events-none transition-all duration-300 ${
          scrolled ? "top-2 sm:top-3" : "top-3 sm:top-4"
        }`}
      >
        <div
          className={`pointer-events-auto relative w-full max-w-6xl rounded-2xl sm:rounded-full bg-[#16272e]/94 backdrop-blur-2xl border border-[#90aead]/20 shadow-[0_16px_40px_rgba(0,0,0,0.65)] px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between transition-all duration-300 ${
            scrolled ? "bg-[#112026]/98 border-[#90aead]/25 shadow-[0_20px_48px_rgba(0,0,0,0.85)]" : ""
          }`}
        >
          {/* Subtle top edge luminous highlight line */}
          <div className="pointer-events-none absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#fbe9d0]/25 to-transparent" />

          {/* Left — Brand Logo */}
          <div className="flex items-center shrink-0">
            <Link
              href="/"
              aria-label="RUNNERUP home"
              className="group relative flex min-w-0 shrink-0 items-center transition-transform hover:scale-[1.02]"
            >
              <motion.img
                src="/runnerup-logo.png"
                alt="RUNNERUP"
                width={180}
                height={40}
                animate={{ y: [0, -1.5, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                whileHover={{ scale: 1.04 }}
                className="h-8 sm:h-9 lg:h-9.5 w-auto object-contain drop-shadow-[0_2px_14px_rgba(230,72,51,0.35)]"
              />
            </Link>
          </div>

          {/* Center — Distinct Nav Capsule Pill */}
          <div className="hidden lg:flex items-center shrink-0 rounded-full bg-[#1f3741]/95 border border-[#90aead]/20 px-2.5 lg:px-3.5 py-1 lg:py-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_4px_16px_rgba(0,0,0,0.35)]">
            <nav className="flex items-center gap-0.5 sm:gap-1" aria-label="Main navigation">
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

          {/* Right — Actions & High-contrast CTA */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Desktop Actions (lg and up) */}
            <div className="hidden lg:flex items-center gap-2.5 xl:gap-3 shrink-0">
              {isLoaded && !isSignedIn && (
                <>
                  <Link
                    className="inline-flex h-9 items-center rounded-full px-3.5 text-xs font-semibold text-[#fbe9d0] transition-colors hover:text-white hover:bg-white/[0.06] whitespace-nowrap"
                    href="/sign-in"
                  >
                    Sign in
                  </Link>
                  <Link
                    className="group inline-flex h-9 lg:h-10 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#e64833] via-[#ea5a47] to-[#c93b27] px-5 lg:px-6 text-xs lg:text-[13px] font-black uppercase tracking-wider text-white shadow-[0_0_20px_rgba(230,72,51,0.4),0_4px_16px_rgba(0,0,0,0.4)] transition-all duration-300 hover:shadow-[0_0_32px_rgba(230,72,51,0.7),0_6px_20px_rgba(0,0,0,0.5)] hover:scale-105 active:scale-95 whitespace-nowrap overflow-hidden relative shrink-0"
                    href="/events"
                  >
                    <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    <span className="relative z-10 text-[#fbe9d0]">Browse events</span>
                    <ArrowRight className="relative z-10 h-3.5 w-3.5 text-[#fbe9d0] transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </>
              )}
              {isLoaded && isSignedIn && (
                <div className="flex items-center gap-2.5">
                  <Link
                    className="group inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#e64833] via-[#ea5a47] to-[#c93b27] px-4 text-xs font-black uppercase tracking-wider text-[#fbe9d0] shadow-sm hover:shadow-[0_0_20px_rgba(230,72,51,0.5)] transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                    href="/events"
                  >
                    <span>Browse events</span>
                    <ArrowRight className="h-3 w-3 text-[#fbe9d0]" />
                  </Link>
                  <DashboardProfileDropdown />
                </div>
              )}
            </div>

            {/* Mobile Controls (below lg) - Browse Events is hidden from the top bar and housed in the hamburger menu */}
            <div className="flex lg:hidden items-center gap-2">
              {isLoaded && isSignedIn && (
                <DashboardProfileDropdown isMobile />
              )}
              <Hamburger open={open} onClick={() => setOpen((v) => !v)} />
            </div>
          </div>
        </div>
      </header>

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
                className="fixed inset-0 bg-black/75 backdrop-blur-md"
                onClick={() => setOpen(false)}
                onTouchMove={(e) => e.preventDefault()}
              />

              {/* Glowing Accent Orb behind drawer */}
              <div className="pointer-events-none fixed right-0 top-1/3 -z-10 h-80 w-80 rounded-full bg-sky-500/20 blur-[120px]" />

              {/* Slide-Over Drawer Sheet */}
              <motion.nav
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                className="fixed inset-y-0 right-0 z-10 flex h-full h-[100dvh] w-[85%] max-w-[340px] flex-col overflow-hidden rounded-l-[32px] border-l border-white/20 bg-slate-950/98 backdrop-blur-3xl shadow-[-25px_0_60px_rgba(0,0,0,0.85)] text-white"
                role="dialog"
                aria-modal="true"
                aria-label="Mobile Navigation"
              >
                {/* Top Neon Accent Line */}
                <div className="h-1 w-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 shrink-0" />

                {/* Drawer Header: Brand Logo + Close Pill */}
                <div className="flex items-center justify-between px-5 pt-4 pb-3.5 border-b border-white/10 shrink-0">
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 shrink-0"
                  >
                    <img
                      src="/runnerup-logo.png"
                      alt="RUNNERUP"
                      style={{ height: "28px", width: "auto" }}
                      className="h-7 max-h-[30px] w-auto object-contain shrink-0 drop-shadow-[0_2px_8px_rgba(56,189,248,0.35)]"
                    />
                  </Link>

                {/* Circular Glass Close Button */}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/[0.08] text-slate-300 transition-all duration-200 hover:border-white/40 hover:bg-white/20 hover:text-white active:scale-90 shadow-md cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div
                className="flex-1 overflow-y-auto overscroll-contain no-scrollbar p-5 space-y-4"
                style={{ touchAction: "pan-y", WebkitOverflowScrolling: "touch" }}
              >
                {/* Athlete Profile (only shown when signed in) */}
                {isLoaded && isSignedIn && user ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-sky-400/30 bg-sky-500/[0.08] p-3.5 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                    {user?.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={user?.fullName ?? "Athlete"}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-sky-400/60 shadow-lg shrink-0"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-sky-500 to-blue-700 text-xs font-black text-white ring-2 ring-sky-400/60 shadow-lg shrink-0">
                        {(user?.fullName ?? user?.firstName ?? "A").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-xs font-black uppercase tracking-wider text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                          {user?.fullName ?? user?.firstName ?? "Athlete"}
                        </p>
                        <span className="rounded-full bg-sky-500/25 border border-sky-400/50 px-1.5 py-0.2 text-[0.52rem] font-black uppercase tracking-wider text-sky-300">
                          PRO ⚡
                        </span>
                      </div>
                      <p className="truncate text-[0.68rem] text-slate-300 font-medium mt-0.5">
                        {user?.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Featured Primary CTA: Browse Events */}
                <Link
                  href="/events"
                  onClick={() => setOpen(false)}
                  className="group relative flex items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 p-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-sky-500/25 transition-all hover:scale-[1.02] active:scale-95 border border-white/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                      <Calendar className="h-4.5 w-4.5 text-white" />
                    </div>
                    <div>
                      <span className="block text-xs font-black uppercase tracking-wider">Browse Events</span>
                      <span className="block text-[0.65rem] font-medium text-sky-100 normal-case">Explore 1.5K, 5K, 10K & 21K Races</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                {/* Section Header */}
                <div className="px-1 pt-1">
                  <span className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400">
                    Menu Navigation
                  </span>
                </div>

                {/* Navigation Links */}
                <div className="space-y-2">
                  {publicNav.map(({ label, href, icon: Icon }) => {
                    const active = isActive(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={(e) => handleMobileNavClick(href, e)}
                        className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-[0.98] ${
                          active
                            ? "bg-gradient-to-r from-sky-500/30 via-blue-600/25 to-sky-500/15 border border-sky-400/60 text-white shadow-[0_0_16px_rgba(56,189,248,0.25)] backdrop-blur-xl"
                            : "border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.1] hover:text-white hover:border-white/20 backdrop-blur-xl"
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                            active
                              ? "bg-gradient-to-tr from-sky-400 to-blue-600 text-white shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                              : "bg-white/[0.08] text-sky-400 border border-white/10 group-hover:bg-white/15 group-hover:text-white"
                          }`}
                        >
                          <Icon className="h-4 w-4" strokeWidth={2.2} />
                        </span>
                        <div className="flex-1 flex items-center justify-between">
                          <span>{label}</span>
                          {href === "/events" && (
                            <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 text-[0.55rem] font-black uppercase tracking-wider text-emerald-300">
                              Active Races
                            </span>
                          )}
                        </div>
                        <svg
                          className={`h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1 ${
                            active ? "text-sky-400" : "text-slate-500 group-hover:text-white"
                          }`}
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m6 4 4 4-4 4" />
                        </svg>
                      </Link>
                    );
                  })}

                  {/* Dashboard Link (if signed in) */}
                  {isLoaded && isSignedIn && (
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-[0.98] ${
                        isActive("/dashboard")
                          ? "bg-gradient-to-r from-sky-500/30 via-blue-600/25 to-sky-500/15 border border-sky-400/60 text-white shadow-[0_0_16px_rgba(56,189,248,0.25)] backdrop-blur-xl"
                          : "border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.1] hover:text-white hover:border-white/20 backdrop-blur-xl"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                          isActive("/dashboard")
                            ? "bg-gradient-to-tr from-sky-400 to-blue-600 text-white shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                            : "bg-white/[0.08] text-sky-400 border border-white/10 group-hover:bg-white/15 group-hover:text-white"
                        }`}
                      >
                        <LayoutDashboard className="h-4 w-4" strokeWidth={2.2} />
                      </span>
                      <span className="flex-1">Athlete Dashboard</span>
                      <svg
                        className="h-3.5 w-3.5 text-slate-500 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-white"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 4 4 4-4 4" />
                      </svg>
                    </Link>
                  )}

                  {/* Admin Console Link (if admin) */}
                  {isLoaded && isSignedIn && isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setOpen(false)}
                      className="group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-[0.98] border border-amber-400/40 bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 hover:text-white backdrop-blur-xl"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/30 text-amber-400 border border-amber-400/50">
                        <Award className="h-4 w-4" strokeWidth={2.2} />
                      </span>
                      <span className="flex-1">Admin Console</span>
                      <span className="rounded-full bg-amber-500/30 border border-amber-400/50 px-1.5 py-0.5 text-[0.55rem] font-black uppercase tracking-wider text-amber-300">
                        🛡️ Owner
                      </span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Drawer Footer Actions - Sleek & Production Grade */}
              <div className="p-5 border-t border-white/10 bg-slate-950/80 backdrop-blur-xl shrink-0 space-y-2.5">
                {isLoaded && isSignedIn ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      void signOut(() => router.push("/"));
                    }}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-rose-300 backdrop-blur-xl transition-all duration-200 hover:bg-rose-500/20 hover:border-rose-400/50 hover:text-white active:scale-[0.98] cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5 text-rose-300 transition-transform group-hover:-translate-x-0.5" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5 w-full">
                    <Link
                      href="/sign-in"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-200 backdrop-blur-md transition-all hover:bg-white/12 hover:border-white/25 hover:text-white active:scale-95"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setOpen(false)}
                      className="group relative inline-flex items-center justify-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-3.5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-md shadow-sky-500/25 active:scale-95 transition-all hover:from-sky-400 hover:to-blue-500"
                    >
                      <span>Register</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                )}
                
                <p className="text-center text-[0.62rem] text-slate-500 font-medium pt-0.5">
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
