"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  MapPin,
  Activity,
  Award,
  Truck,
  Smartphone,
  Cloud,
  Trophy,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { type PublicEvent, getEventMedalImages } from "../data/events";

type HomeHeroProps = {
  featuredEvent?: PublicEvent | null;
};

export function HomeHero({ featuredEvent }: HomeHeroProps) {
  const router = useRouter();
  const [vaultTab, setVaultTab] = useState<"current" | "kinetic" | "hallOfFame">("current");
  const [cancerMedalSide, setCancerMedalSide] = useState<"front" | "back">("front");
  const [kineticMedalSide, setKineticMedalSide] = useState<"front" | "back">("front");
  const [iafMedalSide, setIafMedalSide] = useState<"front" | "back">("front");

  // Tab 1: Current Live Challenge (Cancer Awareness, live till 17 Nov)
  const cancerTitle = "National Cancer Awareness Day Virtual Challenge 2026";
  const cancerSlug = "national-cancer-awareness-day-virtual-run-2026";
  const cancerDistances = "1.5K • 3K • 5K • 10K • 21K Half Marathon";
  const cancerImages = getEventMedalImages(cancerSlug);

  // Tab 2: Next Upcoming Challenge (Kinetic Run, 10–15 Dec)
  const kineticTitle = "Kinetic Run Virtual Challenge 2026";
  const kineticSlug = "kinetic-run-virtual-challenge-2026";
  const kineticDistances = "1.5K • 3K • 5K • 10K • 21K Half Marathon";
  const kineticImages = getEventMedalImages(kineticSlug);

  const handleTrophyCardClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-prevent-card-nav]") || target.closest("button") || target.closest("a")) {
      return;
    }
    if (vaultTab === "current") {
      router.push(`/events/${cancerSlug}`);
    } else if (vaultTab === "kinetic") {
      router.push(`/events/${kineticSlug}`);
    } else {
      router.push("/leaderboard");
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#080c10] via-[#090d14] to-[#080c10] text-[#f8fafc] isolate min-h-0 lg:min-h-[92dvh] flex flex-col justify-center pt-20 pb-8 sm:pt-28 sm:pb-10 lg:pt-28 lg:pb-8">

      {/* ─── 1. Lightweight Ambient Pedestal Glow (Zero-Lag CSS, No Heavy Bitmaps) ─── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 h-96 w-96 rounded-full bg-orange-600/10 blur-[130px]" />
        <div className="absolute -top-24 left-1/3 h-80 w-80 rounded-full bg-[#ff4b26]/10 blur-[120px]" />
      </div>

      {/* ─── 2. Main Hero Content Area ─── */}
      <div className="container-page relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full my-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-6">

        {/* ══════════════════════════════════════════════════════
            LEFT COLUMN: HEADLINE, CTA & BADGES
           ══════════════════════════════════════════════════════ */}
        <div className="w-full max-w-xl xl:max-w-2xl flex flex-col items-start text-left shrink-0 z-10 pt-2 sm:pt-0">

          {/* Eyebrow: INDIA'S PREMIER ───── */}
          <div className="flex items-center gap-2.5 mb-2 sm:mb-3">
            <span className="inline-flex items-center gap-2 font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
              <span className="inline-flex flex-col w-4 h-2.5 rounded-[2px] overflow-hidden shrink-0 border border-white/20 shadow-xs" aria-hidden="true">
                <span className="h-1/3 bg-[#FF9933] w-full" />
                <span className="h-1/3 bg-white w-full flex items-center justify-center">
                  <span className="h-0.5 w-0.5 rounded-full bg-[#000080]" />
                </span>
                <span className="h-1/3 bg-[#138808] w-full" />
              </span>
              INDIA&apos;S PREMIER
            </span>
            <span className="h-[2px] w-10 sm:w-16 bg-[#ff4b26] rounded-full shadow-[0_0_8px_#ff4b26]" />
          </div>

          {/* Giant Title: RUN ANYWHERE. EARN 3D MEDALS. (Instant zero-delay paint) */}
          <h1 className="font-display font-black text-[2.15rem] xs:text-[2.65rem] sm:text-6xl md:text-7xl lg:text-[4.25rem] xl:text-[5rem] tracking-tight leading-[0.94] uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]">
            <span className="block text-white">RUN ANYWHERE.</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#ff4b26] via-[#ff7844] to-[#facc15]">
              EARN 3D MEDALS.
            </span>
          </h1>

          {/* Subtitle with Location Pin */}
          <div className="mt-3.5 sm:mt-4 flex items-center gap-2.5 text-slate-300 text-sm sm:text-base lg:text-lg font-medium">
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-[#ff4b26]/20 border border-[#ff4b26]/60 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(255,75,38,0.3)]">
              <MapPin className="h-3.5 w-3.5 text-[#ff4b26]" />
            </div>
            <span>Official Virtual Marathon &amp; GPS Challenges Across India</span>
          </div>

          {/* High-Performance Zero-Lag CTA Buttons */}
          <div className="mt-5 sm:mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/events"
              className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#ff4b26] to-[#ff6a38] border-t border-white/25 px-8 sm:px-10 py-3.5 sm:py-4 text-sm sm:text-base font-black uppercase tracking-wider text-white shadow-md shadow-orange-950/40 hover:brightness-110 hover:scale-[1.025] active:scale-[0.98] transition-all duration-150"
            >
              <span>EXPLORE CHALLENGES</span>
              <ArrowRight className="h-5 w-5 stroke-[2.5]" />
            </Link>

            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 sm:px-7 py-3.5 sm:py-4 text-sm font-bold text-slate-200 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all duration-150"
            >
              <span>HOW IT WORKS</span>
            </a>
          </div>

          {/* Feature Badges Bar (Desktop & Tablet) */}
          <div className="mt-7 sm:mt-9 pt-6 border-t border-white/10 w-full hidden sm:grid grid-cols-2 xl:grid-cols-4 gap-3.5 xl:gap-5 max-w-xl xl:max-w-2xl">
            {/* Badge 1: GPS Verified */}
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full border border-[#ff4b26]/40 bg-[#ff4b26]/15 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(255,75,38,0.25)]">
                <MapPin className="h-4 w-4 text-[#ff4b26]" />
              </div>
              <div>
                <p className="font-display font-black text-xs text-white uppercase tracking-wider">GPS VERIFIED</p>
                <p className="text-[0.68rem] text-slate-400 font-medium leading-tight">Strava &amp; Garmin sync</p>
              </div>
            </div>

            {/* Badge 2: Heavy 3D Alloy */}
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full border border-[#ff4b26]/40 bg-[#ff4b26]/15 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(255,75,38,0.25)]">
                <Award className="h-4 w-4 text-[#ff4b26]" />
              </div>
              <div>
                <p className="font-display font-black text-xs text-white uppercase tracking-wider">SOLID DIE-CAST ALLOY</p>
                <p className="text-[0.68rem] text-slate-400 font-medium leading-tight">Handcrafted 3D medal</p>
              </div>
            </div>

            {/* Badge 3: Track Anywhere */}
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full border border-[#ff4b26]/40 bg-[#ff4b26]/15 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(255,75,38,0.25)]">
                <Activity className="h-4 w-4 text-[#ff4b26]" />
              </div>
              <div>
                <p className="font-display font-black text-xs text-white uppercase tracking-wider">TRACK ANYWHERE</p>
                <p className="text-[0.68rem] text-slate-400 font-medium leading-tight">Run, walk, or cycle</p>
              </div>
            </div>

            {/* Badge 4: Pan India Delivery */}
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full border border-[#ff4b26]/40 bg-[#ff4b26]/15 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(255,75,38,0.25)]">
                <Truck className="h-4 w-4 text-[#ff4b26]" />
              </div>
              <div>
                <p className="font-display font-black text-xs text-white uppercase tracking-wider">FREE DELIVERY</p>
                <p className="text-[0.68rem] text-slate-400 font-medium leading-tight">Across 28,000+ pin codes</p>
              </div>
            </div>
          </div>

          {/* Mobile-only 3-badge Row */}
          <div className="mt-4 pt-3.5 border-t border-white/10 w-full grid grid-cols-3 gap-2 sm:hidden">
            <div className="flex flex-col items-center text-center gap-1">
              <div className="h-7.5 w-7.5 rounded-full border border-[#ff4b26]/40 bg-[#ff4b26]/15 flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(255,75,38,0.2)]">
                <MapPin className="h-3.5 w-3.5 text-[#ff4b26]" />
              </div>
              <div>
                <p className="font-display font-black text-[0.68rem] text-white uppercase tracking-wider">GPS VERIFIED</p>
                <p className="text-[0.6rem] text-slate-400 leading-tight">Real runs</p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-1">
              <div className="h-7.5 w-7.5 rounded-full border border-[#ff4b26]/40 bg-[#ff4b26]/15 flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(255,75,38,0.2)]">
                <Activity className="h-3.5 w-3.5 text-[#ff4b26]" />
              </div>
              <div>
                <p className="font-display font-black text-[0.68rem] text-white uppercase tracking-wider">TRACK</p>
                <p className="text-[0.6rem] text-slate-400 leading-tight">Anywhere</p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-1">
              <div className="h-7.5 w-7.5 rounded-full border border-[#ff4b26]/40 bg-[#ff4b26]/15 flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(255,75,38,0.2)]">
                <Award className="h-3.5 w-3.5 text-[#ff4b26]" />
              </div>
              <div>
                <p className="font-display font-black text-[0.68rem] text-white uppercase tracking-wider">3D MEDALS</p>
                <p className="text-[0.6rem] text-slate-400 leading-tight">Pan-India</p>
              </div>
            </div>
          </div>

        </div>

        {/* ══════════════════════════════════════════════════════
            RIGHT COLUMN: DYNAMIC 3D TROPHY VAULT SHOWCASE PEDESTAL
           ══════════════════════════════════════════════════════ */}
        <div className="w-full lg:max-w-md xl:max-w-lg flex justify-center lg:justify-end shrink-0 z-10">
          <div
            onClick={handleTrophyCardClick}
            className="relative group rounded-3xl border border-white/15 hover:border-[#ff4b26]/50 bg-gradient-to-b from-[#111822] to-[#080d14] p-5 backdrop-blur-xl shadow-2xl max-w-sm sm:max-w-md w-full text-center transition-all duration-300 hover:scale-[1.01] min-h-[470px] flex flex-col justify-between cursor-pointer"
          >

            <div>
              {/* Interactive Vault Switcher (Dynamic Active Challenge vs Concluded Hall of Fame Proof) */}
              <div data-prevent-card-nav className="flex items-center gap-1.5 p-1 rounded-xl bg-black/50 border border-white/10 mb-3">
                <button
                  type="button"
                  onClick={() => setVaultTab("current")}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[10.5px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                    vaultTab === "current"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>🎗️ Live Event</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVaultTab("kinetic")}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[10.5px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                    vaultTab === "kinetic"
                      ? "bg-gradient-to-r from-[#ff4b26] to-[#ff7844] text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span>⚡ Next Trophy</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVaultTab("hallOfFame")}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[10.5px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                    vaultTab === "hallOfFame"
                      ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Trophy className="h-3 w-3 text-amber-400" />
                  <span>Hall of Fame</span>
                </button>
              </div>

              {/* TAB 1: CURRENT LIVE CHALLENGE (CANCER AWARENESS - RUNNING TILL 17 NOV) */}
              {vaultTab === "current" ? (
                <>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2.5 h-6">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Live Event · Till 17 Nov</span>
                    </span>
                    <span className="text-purple-400 font-mono text-[11px] bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
                      100% Solid Metal
                    </span>
                  </div>

                  <div className="relative overflow-hidden rounded-2xl bg-black/60 p-4 pb-12 border border-white/10 flex items-center justify-center h-[310px]">
                    {/* Subtle Purple Glow */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]">
                      <div className="h-52 w-52 rounded-full bg-purple-600/25 blur-3xl transition-colors duration-500" />
                    </div>

                    {/* 3D Flip Container */}
                    <div
                      style={{ perspective: "1000px" }}
                      className="relative z-10 w-full h-68 flex items-center justify-center select-none"
                    >
                      <div
                        style={{
                          transformStyle: "preserve-3d",
                          transform: cancerMedalSide === "back" ? "rotateY(180deg)" : "rotateY(0deg)",
                          transition: "transform 0.65s cubic-bezier(0.4, 0.2, 0.2, 1)",
                        }}
                        className="relative w-full h-full flex items-center justify-center"
                      >
                        {/* Front Face */}
                        <div
                          style={{ backfaceVisibility: "hidden" }}
                          className="absolute inset-0 flex items-center justify-center p-1"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={cancerImages.front}
                            alt="Cancer Awareness Finisher Medal - Front"
                            fetchPriority="high"
                            loading="eager"
                            decoding="async"
                            className="h-full w-auto max-h-[265px] object-contain drop-shadow-[0_20px_45px_rgba(168,85,247,0.45)] select-none scale-[1.04] transition-transform duration-300"
                          />
                        </div>

                        {/* Back Face */}
                        <div
                          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                          className="absolute inset-0 flex items-center justify-center p-1"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={cancerImages.back}
                            alt="Cancer Awareness Finisher Medal - Back"
                            loading="lazy"
                            decoding="async"
                            className="h-full w-auto max-h-[265px] object-contain drop-shadow-[0_20px_45px_rgba(168,85,247,0.45)] select-none scale-[1.04] transition-transform duration-300"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Floating Toggle */}
                    <div data-prevent-card-nav className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 rounded-full border border-white/20 bg-black/85 backdrop-blur-md p-1 shadow-xl whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setCancerMedalSide("front")}
                        className={`rounded-full px-4 py-1 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                          cancerMedalSide === "front"
                            ? "bg-purple-600 text-white shadow-md"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Front
                      </button>
                      <button
                        type="button"
                        onClick={() => setCancerMedalSide("back")}
                        className={`rounded-full px-4 py-1 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                          cancerMedalSide === "back"
                            ? "bg-indigo-600 text-white shadow-md"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Back
                      </button>
                    </div>
                  </div>

                  <div className="mt-3.5 space-y-1 h-12 flex flex-col justify-center">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-black text-white truncate">{cancerTitle}</h4>
                      <span className="text-xs font-black text-amber-400 shrink-0">₹499</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="truncate">{cancerDistances}</span>
                      <span className="text-[10px] font-bold text-emerald-400 shrink-0">Open till 17 Nov</span>
                    </div>
                  </div>
                </>
              ) : vaultTab === "kinetic" ? (
                /* TAB 2: NEXT CHALLENGE PREVIEW (KINETIC RUN 2026 - 10-15 DEC) */
                <>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2.5 h-6">
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                      <span>Next Trophy · 10–15 Dec</span>
                    </span>
                    <span className="text-orange-400 font-mono text-[11px] bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-full">
                      3D Sculpted Wings
                    </span>
                  </div>

                  <div className="relative overflow-hidden rounded-2xl bg-black/60 p-4 pb-12 border border-white/10 flex items-center justify-center h-[310px]">
                    {/* Fiery Athletic Glow */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]">
                      <div className="h-52 w-52 rounded-full bg-orange-600/25 blur-3xl transition-colors duration-500" />
                    </div>

                    {/* 3D Flip Container */}
                    <div
                      style={{ perspective: "1000px" }}
                      className="relative z-10 w-full h-68 flex items-center justify-center select-none"
                    >
                      <div
                        style={{
                          transformStyle: "preserve-3d",
                          transform: kineticMedalSide === "back" ? "rotateY(180deg)" : "rotateY(0deg)",
                          transition: "transform 0.65s cubic-bezier(0.4, 0.2, 0.2, 1)",
                        }}
                        className="relative w-full h-full flex items-center justify-center"
                      >
                        {/* Front Face */}
                        <div
                          style={{ backfaceVisibility: "hidden" }}
                          className="absolute inset-0 flex items-center justify-center p-1"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={kineticImages.front}
                            alt="Kinetic Run Finisher Medal - Front"
                            fetchPriority="high"
                            loading="eager"
                            decoding="async"
                            className="h-full w-auto max-h-[265px] object-contain drop-shadow-[0_20px_45px_rgba(255,100,50,0.45)] select-none scale-[1.04] transition-transform duration-300"
                          />
                        </div>

                        {/* Back Face */}
                        <div
                          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                          className="absolute inset-0 flex items-center justify-center p-1"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={kineticImages.back}
                            alt="Kinetic Run Finisher Medal - Back"
                            loading="lazy"
                            decoding="async"
                            className="h-full w-auto max-h-[265px] object-contain drop-shadow-[0_20px_45px_rgba(255,100,50,0.45)] select-none scale-[1.04] transition-transform duration-300"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Floating Toggle */}
                    <div data-prevent-card-nav className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 rounded-full border border-white/20 bg-black/85 backdrop-blur-md p-1 shadow-xl whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setKineticMedalSide("front")}
                        className={`rounded-full px-4 py-1 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                          kineticMedalSide === "front"
                            ? "bg-[#ff4b26] text-white shadow-md"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Front
                      </button>
                      <button
                        type="button"
                        onClick={() => setKineticMedalSide("back")}
                        className={`rounded-full px-4 py-1 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                          kineticMedalSide === "back"
                            ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Back
                      </button>
                    </div>
                  </div>

                  <div className="mt-3.5 space-y-1 h-12 flex flex-col justify-center">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-black text-white truncate">{kineticTitle}</h4>
                      <span className="text-xs font-black text-amber-400 shrink-0">₹499</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="truncate">{kineticDistances}</span>
                      <span className="text-[10px] font-bold text-amber-400 shrink-0">Early Bird Open</span>
                    </div>
                  </div>
                </>
              ) : (
                /* TAB 3: HALL OF FAME / DELIVERED FINISHER PROOF (IAF DAY 2026) */
                <>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2.5 h-6">
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                      <span>GPS Verified Finishers</span>
                    </span>
                    <span className="text-amber-400 font-mono text-[11px] bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                      Concluded Edition
                    </span>
                  </div>

                  <div className="relative overflow-hidden rounded-2xl bg-black/60 p-4 pb-12 border border-white/10 flex items-center justify-center h-[310px]">
                    {/* Subtle Amber Glow */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]">
                      <div className="h-52 w-52 rounded-full bg-amber-500/20 blur-3xl transition-colors duration-500" />
                    </div>

                    {/* 3D Flip Container */}
                    <div
                      style={{ perspective: "1000px" }}
                      className="relative z-10 w-full h-80 sm:h-84 flex items-center justify-center select-none"
                    >
                      <div
                        style={{
                          transformStyle: "preserve-3d",
                          transform: iafMedalSide === "back" ? "rotateY(180deg)" : "rotateY(0deg)",
                          transition: "transform 0.65s cubic-bezier(0.4, 0.2, 0.2, 1)",
                        }}
                        className="relative w-full h-full flex items-center justify-center"
                      >
                        {/* Front Face (Ultra-Fast 60fps WebP) */}
                        <div
                          style={{ backfaceVisibility: "hidden" }}
                          className="absolute inset-0 flex items-center justify-center p-1"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/images/iaf-medal-front.webp"
                            alt="Indian Air Force Day Finisher Medal - Front"
                            loading="eager"
                            decoding="async"
                            className="h-full w-auto max-h-[305px] object-contain drop-shadow-[0_20px_45px_rgba(250,204,21,0.45)] select-none scale-[1.08] transition-transform duration-300"
                          />
                        </div>

                        {/* Back Face (Ultra-Fast 60fps WebP) */}
                        <div
                          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                          className="absolute inset-0 flex items-center justify-center p-1"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/images/iaf-medal-back.webp"
                            alt="Indian Air Force Day Finisher Medal - Back"
                            loading="eager"
                            decoding="async"
                            className="h-full w-auto max-h-[305px] object-contain drop-shadow-[0_20px_45px_rgba(250,204,21,0.45)] select-none scale-[1.08] transition-transform duration-300"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Clean Floating Centered Pill Toggle */}
                    <div data-prevent-card-nav className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 rounded-full border border-white/20 bg-black/85 backdrop-blur-md p-1 shadow-xl whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setIafMedalSide("front")}
                        className={`rounded-full px-4 py-1 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                          iafMedalSide === "front"
                            ? "bg-[#ff4b26] text-white shadow-md"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Front
                      </button>
                      <button
                        type="button"
                        onClick={() => setIafMedalSide("back")}
                        className={`rounded-full px-4 py-1 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                          iafMedalSide === "back"
                            ? "bg-amber-500 text-black font-black shadow-md"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Back
                      </button>
                    </div>
                  </div>

                  <div className="mt-3.5 space-y-1 h-12 flex flex-col justify-center">
                    <h4 className="text-sm font-black text-white truncate">Indian Air Force Day Challenge 2026</h4>
                    <p className="text-xs text-slate-400 truncate">100% Verified Medal Dispatch Across India</p>
                  </div>
                </>
              )}
            </div>

            {/* Bottom Link (Uniform Height & Alignment) */}
            {vaultTab === "current" ? (
              <Link
                href={`/events/${cancerSlug}`}
                className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs h-9 group/link"
              >
                <span className="text-slate-400">Guaranteed Pan-India Finisher Kit</span>
                <span className="text-purple-400 font-bold group-hover/link:translate-x-0.5 transition-transform flex items-center gap-1">
                  <span>Register for Live Challenge</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ) : vaultTab === "kinetic" ? (
              <Link
                href={`/events/${kineticSlug}`}
                className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs h-9 group/link"
              >
                <span className="text-slate-400">Limited Edition 3D Metal Medal</span>
                <span className="text-[#ff4b26] font-bold group-hover/link:translate-x-0.5 transition-transform flex items-center gap-1">
                  <span>View Kinetic Challenge</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ) : (
              <Link
                href="/leaderboard"
                className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs h-9 group/link"
              >
                <span className="text-slate-400">Official Nationwide Rankings</span>
                <span className="text-amber-400 font-bold group-hover/link:translate-x-0.5 transition-transform flex items-center gap-1">
                  <span>View Finisher Board</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            )}

          </div>
        </div>

      </div>
    </section>
  );
}
