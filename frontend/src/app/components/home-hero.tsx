"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Award,
  Zap,
  MapPin,
  Flame,
  Sparkles,
  CheckCircle2,
  Activity,
  Trophy,
  Truck,
  Watch,
  Smartphone,
  ChevronRight,
} from "lucide-react";

const mobileDistances = [
  { distance: "5K", label: "Fun Run", badge: "Beginner Pick", slug: "indian-air-force-day-virtual-challenge" },
  { distance: "10K", label: "Challenge", badge: "Most Popular", slug: "indian-air-force-day-virtual-challenge" },
  { distance: "21K", label: "Half Marathon", badge: "Pro Finisher", slug: "indian-air-force-day-virtual-challenge" },
  { distance: "25K", label: "Virtual Ride", badge: "Cycling", slug: "indian-air-force-day-virtual-challenge" },
  { distance: "3K", label: "Starter Walk", badge: "Family & Kids", slug: "indian-air-force-day-virtual-challenge" },
];

export function HomeHero() {
  const [mobileTab, setMobileTab] = useState<"medal" | "race">("medal");

  return (
    <section className="relative w-full overflow-hidden bg-[#14242a] text-[#fbe9d0] isolate min-h-[92dvh] lg:h-[100dvh] flex flex-col justify-start lg:justify-center pt-20 pb-12 sm:pt-28 sm:pb-14 lg:pt-14 lg:pb-6">
      {/* ─── Ambient Atmospheric Background Glows ─── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/2 -z-10 h-[220px] w-[260px] sm:h-[400px] sm:w-[600px] -translate-x-1/2 rounded-full bg-[#244855]/40 blur-[70px] sm:blur-[130px]" />
        <div className="absolute top-1/3 right-4 -z-10 h-[180px] w-[180px] sm:h-[300px] sm:w-[300px] rounded-full bg-[#e64833]/20 blur-[60px] sm:blur-[110px]" />
        <div className="absolute bottom-6 left-10 -z-10 h-[140px] w-[140px] sm:h-[240px] sm:w-[240px] rounded-full bg-[#244855]/30 blur-[50px] sm:blur-[70px]" />
      </div>

      <div className="container-page relative z-10 mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 w-full lg:my-auto">
        {/* ─── Responsive Grid: Stacked on Mobile, 2-Column on Desktop ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 xl:gap-12 items-center">
          
          {/* ─── Text Content Column (lg: 7 cols) ─── */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            
            {/* Eyebrow Badge with Live Pulsing Beacon */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-[#e64833]/50 bg-[#172c34]/95 px-3.5 sm:px-4 py-1 sm:py-1.5 text-[0.65rem] sm:text-xs font-black uppercase tracking-wider text-[#fbe9d0] shadow-lg shadow-black/40 mb-2 sm:mb-3"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e64833] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e64833]" />
              </span>
              <span>INDIA&apos;S #1 VIRTUAL RUNNING PLATFORM</span>
            </motion.div>

            {/* Main Slogan Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display font-black text-[1.85rem] xs:text-[2.1rem] sm:text-4xl md:text-[2.75rem] lg:text-[2.5rem] xl:text-[3.25rem] 2xl:text-[3.8rem] tracking-tight uppercase leading-[1.04] drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]"
            >
              <span className="block text-[#fbe9d0]">Push Your Limits,</span>
              <span className="block text-[#e64833] italic font-black drop-shadow-[0_0_24px_rgba(230,72,51,0.55)]">
                Chase Your Goals,
              </span>
              <span className="block text-white">
                Own Your Journey
              </span>
              <span className="sr-only"> — India&apos;s Premier Virtual Running Events &amp; Marathons</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-2.5 sm:mt-3.5 max-w-lg text-xs sm:text-sm lg:text-base text-[#fbe9d0]/85 font-medium leading-relaxed"
            >
              India&apos;s premier GPS-verified virtual running races. Track your run anywhere with Strava, Garmin, or Apple Watch and earn authentic metal finisher medals delivered across India.
            </motion.p>

            {/* ─── UNIQUE MOBILE INTERACTIVE SHOWCASE CARD (visible ONLY on < lg screens) ─── */}
            <div className="w-full mt-3.5 mb-2 block lg:hidden">
              {/* Interactive Switcher Tabs on Mobile */}
              <div className="flex items-center justify-center p-1 rounded-full bg-[#112026]/90 border border-white/15 mb-2.5 mx-auto max-w-[290px] shadow-lg backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setMobileTab("medal")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-[0.66rem] font-black uppercase tracking-wider transition-all duration-300 ${
                    mobileTab === "medal"
                      ? "bg-gradient-to-r from-[#e64833] to-[#ea5a47] text-[#fbe9d0] shadow-md shadow-[#e64833]/40"
                      : "text-[#90aead] hover:text-[#fbe9d0]"
                  }`}
                >
                  <Award className="h-3.5 w-3.5 shrink-0" />
                  <span>Finisher Medal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileTab("race")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-[0.66rem] font-black uppercase tracking-wider transition-all duration-300 ${
                    mobileTab === "race"
                      ? "bg-gradient-to-r from-[#e64833] to-[#ea5a47] text-[#fbe9d0] shadow-md shadow-[#e64833]/40"
                      : "text-[#90aead] hover:text-[#fbe9d0]"
                  }`}
                >
                  <Activity className="h-3.5 w-3.5 shrink-0" />
                  <span>Live Race</span>
                </button>
              </div>

              {/* Main Showcase Screen on Mobile */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="relative w-full rounded-2xl overflow-hidden border border-white/20 shadow-[0_20px_45px_rgba(0,0,0,0.85),0_0_30px_rgba(230,72,51,0.22)] bg-[#0e191e]"
              >
                <AnimatePresence mode="wait">
                  {mobileTab === "medal" ? (
                    /* ─── Mode 1: 3D Finisher Medal Showcase ─── */
                    <motion.div
                      key="medal"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.25 }}
                      className="relative min-h-[340px] sm:min-h-[380px] w-full overflow-hidden flex items-center justify-center bg-black p-3"
                    >
                      {/* Ambient Radial Spotlight Glow */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(230,72,51,0.25)_0%,rgba(251,233,208,0.12)_35%,transparent_70%)] pointer-events-none" />

                      {/* Medal Image with Drop Shadow & Sheen — 100% Uncropped */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/images/event-medal.webp"
                        alt="Authentic 3D Solid Metal Finisher Medal"
                        loading="eager"
                        decoding="async"
                        className="relative z-10 h-auto w-auto max-h-[295px] sm:max-h-[340px] max-w-[88%] object-contain select-none drop-shadow-[0_20px_45px_rgba(0,0,0,0.95)] transition-transform duration-500 hover:scale-105 will-change-transform"
                      />

                      {/* Top-Left Chip: 100% Solid Metal */}
                      <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 rounded-full bg-[#14242a]/95 border border-[#e64833]/40 px-2.5 py-1 backdrop-blur-md shadow-lg">
                        <Award className="h-3 w-3 text-[#e64833] shrink-0" />
                        <span className="text-[0.62rem] font-black uppercase tracking-wider text-[#fbe9d0]">100% Solid Metal</span>
                      </div>

                      {/* Top-Right Chip: Free Courier */}
                      <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 rounded-full bg-[#14242a]/95 border border-white/20 px-2.5 py-1 backdrop-blur-md shadow-lg">
                        <Truck className="h-3 w-3 text-emerald-400 shrink-0" />
                        <span className="text-[0.62rem] font-black uppercase tracking-wider text-emerald-200">Free Courier</span>
                      </div>

                      {/* Bottom Banner Strip */}
                      <div className="absolute bottom-2 inset-x-2.5 z-20 flex items-center justify-between rounded-xl bg-[#14242a]/95 border border-[#90aead]/30 px-3 py-1 backdrop-blur-md shadow-lg">
                        <div className="flex items-center gap-1.5 text-[0.62rem] font-bold text-[#fbe9d0] truncate">
                          <Trophy className="h-3 w-3 text-[#e64833] shrink-0" />
                          <span className="truncate">Finisher Kit with Ribbon &amp; Cert</span>
                        </div>
                        <span className="text-[0.55rem] font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
                          Dispatched in 48h
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    /* ─── Mode 2: Live Race Action ─── */
                    <motion.div
                      key="race"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.25 }}
                      className="relative min-h-[340px] sm:min-h-[380px] w-full overflow-hidden"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/runner-mobile.webp"
                        alt="Runners sprinting in marathon"
                        loading="eager"
                        decoding="async"
                        className="h-full w-full object-cover object-center brightness-[0.98] contrast-[1.05]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#14242a]/85 via-transparent to-[#14242a]/30 pointer-events-none" />

                      {/* Top-Left Live Badge */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-[#14242a]/90 border border-white/20 px-2.5 py-1 backdrop-blur-md shadow-md">
                        <Flame className="h-3 w-3 text-[#e64833] fill-[#e64833]" />
                        <span className="text-[0.62rem] font-black uppercase tracking-wider text-white">12,400+ Active</span>
                      </div>

                      {/* Top-Right Badge */}
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 rounded-full bg-[#14242a]/90 border border-white/20 px-2.5 py-1 backdrop-blur-md shadow-md">
                        <MapPin className="h-3 w-3 text-sky-400" />
                        <span className="text-[0.62rem] font-black uppercase tracking-wider text-sky-200">Pan India</span>
                      </div>

                      {/* Bottom Strip Badge */}
                      <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between rounded-xl bg-[#14242a]/90 border border-[#90aead]/30 px-3 py-1.5 backdrop-blur-md shadow-lg">
                        <div className="flex items-center gap-1.5 text-[0.65rem] font-bold text-[#fbe9d0]">
                          <Activity className="h-3.5 w-3.5 text-[#e64833]" />
                          <span>Strava · Garmin · NRC</span>
                        </div>
                        <span className="text-[0.6rem] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          GPS Verified
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* ─── Mobile Interactive Quick Distance Strip ─── */}
            <div className="w-full mt-1 mb-2.5 block lg:hidden">
              <div className="flex items-center justify-between px-1 mb-1.5">
                <span className="text-[0.62rem] font-black uppercase tracking-wider text-[#90aead] flex items-center gap-1">
                  <Zap className="h-3 w-3 text-[#e64833] fill-[#e64833]" />
                  <span>Choose Your Target Distance</span>
                </span>
                <Link href="/events" className="text-[0.62rem] font-bold text-[#e64833] hover:underline flex items-center gap-0.5">
                  <span>View All</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Horizontal Scrollable Distance Chips */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1 -mx-2">
                {mobileDistances.map((item) => (
                  <Link
                    key={item.distance}
                    href={`/events/${item.slug}`}
                    className="shrink-0 flex items-center gap-2 rounded-xl bg-[#172c34]/95 hover:bg-[#244855] border border-[#90aead]/25 hover:border-[#e64833]/60 px-3 py-2 text-left transition-all active:scale-95 shadow-md"
                  >
                    <span className="font-display font-black text-sm text-[#fbe9d0] leading-none">{item.distance}</span>
                    <div className="flex flex-col">
                      <span className="text-[0.6rem] font-bold text-white leading-none">{item.label}</span>
                      <span className="text-[0.52rem] font-black uppercase text-[#e64833] tracking-wider mt-0.5 leading-none">{item.badge}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* ─── High-Impact CTAs ─── */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-2.5 sm:mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-2.5 sm:gap-3 w-full sm:w-auto"
            >
              <Link
                href="/events"
                className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#e64833] via-[#ea5a47] to-[#c93b27] px-6 py-3.5 sm:px-7 text-xs sm:text-sm font-black uppercase tracking-wider text-[#fbe9d0] shadow-[0_0_25px_rgba(230,72,51,0.5),0_8px_16px_rgba(0,0,0,0.4)] border border-[#fbe9d0]/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_35px_rgba(230,72,51,0.8)] active:scale-95"
              >
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                <span className="relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Explore Challenges</span>
                <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <Link
                href="/register"
                className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-[#90aead]/30 bg-[#1b323b]/85 px-5 py-3.5 sm:px-6 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#fbe9d0] backdrop-blur-xl transition-all duration-300 hover:border-[#e64833]/60 hover:bg-[#244855]/90 hover:shadow-[0_0_20px_rgba(230,72,51,0.25)] active:scale-95"
              >
                <ShieldCheck className="h-4 w-4 text-[#90aead] transition-transform duration-300 group-hover:scale-110" />
                <span className="text-[#fbe9d0]/90 group-hover:text-white transition-colors">GPS Verified Races</span>
              </Link>
            </motion.div>

            {/* ─── Mobile 2x2 Value Advantage Cards (Instant Trust & Unique Mobile Feel) ─── */}
            <div className="grid grid-cols-2 gap-2 mt-3.5 sm:hidden w-full max-w-md">
              <div className="rounded-xl border border-[#90aead]/20 bg-[#172c34]/85 p-2.5 backdrop-blur-md flex flex-col items-start text-left gap-1 shadow-sm">
                <div className="h-7 w-7 rounded-lg bg-[#e64833]/15 border border-[#e64833]/30 flex items-center justify-center text-[#e64833]">
                  <Award className="h-4 w-4" />
                </div>
                <span className="text-[0.68rem] font-black uppercase tracking-wider text-[#fbe9d0]">Solid Metal Medal</span>
                <span className="text-[0.58rem] text-[#90aead] leading-tight">Heavy 3D finisher medal to your doorstep</span>
              </div>

              <div className="rounded-xl border border-[#90aead]/20 bg-[#172c34]/85 p-2.5 backdrop-blur-md flex flex-col items-start text-left gap-1 shadow-sm">
                <div className="h-7 w-7 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Smartphone className="h-4 w-4" />
                </div>
                <span className="text-[0.68rem] font-black uppercase tracking-wider text-[#fbe9d0]">Any Fitness App</span>
                <span className="text-[0.58rem] text-[#90aead] leading-tight">Strava, Garmin, Apple Watch, Nike &amp; Treadmill</span>
              </div>

              <div className="rounded-xl border border-[#90aead]/20 bg-[#172c34]/85 p-2.5 backdrop-blur-md flex flex-col items-start text-left gap-1 shadow-sm">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="text-[0.68rem] font-black uppercase tracking-wider text-[#fbe9d0]">QR E-Certificate</span>
                <span className="text-[0.58rem] text-[#90aead] leading-tight">Official verifiable digital finisher certificate</span>
              </div>

              <div className="rounded-xl border border-[#90aead]/20 bg-[#172c34]/85 p-2.5 backdrop-blur-md flex flex-col items-start text-left gap-1 shadow-sm">
                <div className="h-7 w-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <span className="text-[0.68rem] font-black uppercase tracking-wider text-[#fbe9d0]">Free Pan-India Delivery</span>
                <span className="text-[0.58rem] text-[#90aead] leading-tight">100% free courier to 19,000+ pincodes</span>
              </div>
            </div>

            {/* ─── Compact Responsive Trust Chips (Visible on Tablet & Desktop) ─── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-3.5 sm:mt-4.5 hidden sm:flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs max-w-xl"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#90aead]/25 bg-[#172c34]/85 backdrop-blur-md px-3 py-1 text-[0.65rem] sm:text-xs font-bold text-[#fbe9d0]/90 shadow-sm">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Strava, Garmin &amp; Apple Watch</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#90aead]/25 bg-[#172c34]/85 backdrop-blur-md px-3 py-1 text-[0.65rem] sm:text-xs font-bold text-[#fbe9d0]/90 shadow-sm">
                <MapPin className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                <span>Run Anywhere in India</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#90aead]/25 bg-[#172c34]/85 backdrop-blur-md px-3 py-1 text-[0.65rem] sm:text-xs font-bold text-[#fbe9d0]/90 shadow-sm">
                <Award className="h-3.5 w-3.5 text-[#e64833] shrink-0" />
                <span>Free Doorstep Medal Delivery</span>
              </span>
            </motion.div>

          </div>

          {/* ─── Desktop Visual Showcase Column (lg: 5 cols, hidden on mobile) ─── */}
          <div className="lg:col-span-5 hidden lg:block">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full"
            >
              {/* Outer decorative ambient frame */}
              <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_35px_rgba(230,72,51,0.22)] bg-[#101e23] group">
                <div className="relative aspect-[4/4.4] xl:aspect-[4/5] max-h-[380px] xl:max-h-[460px] 2xl:max-h-[520px] w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/runner-hd.webp"
                    alt="Marathon runners pushing their limits"
                    loading="eager"
                    decoding="async"
                    className="h-full w-full object-cover object-center brightness-[0.98] contrast-[1.05] transition-transform duration-700 ease-out group-hover:scale-105 will-change-transform"
                  />
                  {/* Cinematic gradient shading */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14242a] via-[#14242a]/20 to-transparent pointer-events-none" />

                  {/* Floating Telemetry Widget 1: Top Active Runners */}
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-2 rounded-2xl bg-[#14242a]/90 border border-white/20 px-3 py-1.5 backdrop-blur-xl shadow-xl">
                    <div className="h-7 w-7 rounded-xl bg-[#e64833]/20 flex items-center justify-center border border-[#e64833]/40">
                      <Flame className="h-3.5 w-3.5 text-[#e64833] fill-[#e64833]" />
                    </div>
                    <div>
                      <p className="text-[0.58rem] font-bold text-slate-300 uppercase tracking-wider">Active Community</p>
                      <p className="text-[0.72rem] font-black text-white">12,400+ Runners</p>
                    </div>
                  </div>

                  {/* Floating Telemetry Widget 2: GPS Verified */}
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 rounded-2xl bg-[#14242a]/90 border border-white/20 px-2.5 py-1.5 backdrop-blur-xl shadow-xl">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[0.62rem] font-black uppercase tracking-wider text-emerald-300">Live GPS</span>
                  </div>

                  {/* Floating Bottom Card: Finisher Kit Showcase */}
                  <div className="absolute bottom-3.5 inset-x-3.5 rounded-2xl bg-[#172c34]/95 border border-[#90aead]/30 p-3 backdrop-blur-2xl shadow-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#e64833] to-[#ea5a47] flex items-center justify-center text-white shadow-lg shadow-[#e64833]/40">
                          <Trophy className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[0.7rem] font-black text-white uppercase tracking-wider">Finisher Medal &amp; Kit</p>
                          <p className="text-[0.62rem] text-[#fbe9d0]/80 font-medium">Delivered to door anywhere in India</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-500/25 border border-emerald-400/40 px-2 py-0.5 text-[0.58rem] font-black uppercase tracking-wider text-emerald-300">
                        100% Free
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
