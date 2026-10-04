"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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
} from "lucide-react";

export function HomeHero() {
  return (
    <section className="relative w-full overflow-hidden bg-[#14242a] text-[#fbe9d0] isolate pt-18 pb-8 sm:pt-22 sm:pb-10 lg:pt-20 lg:pb-8 xl:pt-24 xl:pb-12">
      {/* ─── Ambient Atmospheric Background Glows ─── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/2 -z-10 h-[260px] w-[300px] sm:h-[400px] sm:w-[600px] -translate-x-1/2 rounded-full bg-[#244855]/40 blur-[90px] sm:blur-[130px]" />
        <div className="absolute top-1/3 right-4 -z-10 h-[200px] w-[200px] sm:h-[300px] sm:w-[300px] rounded-full bg-[#e64833]/20 blur-[80px] sm:blur-[110px]" />
        <div className="absolute bottom-6 left-10 -z-10 h-[150px] w-[150px] sm:h-[240px] sm:w-[240px] rounded-full bg-[#244855]/30 blur-[70px]" />
      </div>

      <div className="container-page relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ─── Responsive Grid: Stacked on Mobile, 2-Column on Desktop ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-12 items-center">
          
          {/* ─── Text Content Column (lg: 7 cols) ─── */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            
            {/* Eyebrow Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-[#e64833]/50 bg-[#172c34]/90 px-3.5 sm:px-4 py-1 sm:py-1.5 text-[0.65rem] sm:text-xs font-black uppercase tracking-wider text-[#fbe9d0] backdrop-blur-xl shadow-lg shadow-black/40 mb-2.5 sm:mb-3.5"
            >
              <Zap className="h-3.5 w-3.5 fill-[#e64833] text-[#e64833] shrink-0" />
              <span>INDIA&apos;S #1 VIRTUAL RUNNING PLATFORM</span>
            </motion.div>

            {/* Main Slogan Headline — Scaled for Laptops */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display font-black text-2xl sm:text-4xl md:text-[2.75rem] lg:text-[2.5rem] xl:text-[3.25rem] 2xl:text-[3.8rem] tracking-tight uppercase leading-[1.04] drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]"
            >
              <span className="block text-[#fbe9d0]">Push Your Limits,</span>
              <span className="block text-[#e64833] italic font-black drop-shadow-[0_0_24px_rgba(230,72,51,0.55)]">
                Chase Your Goals,
              </span>
              <span className="block text-white">
                Own Your Journey
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-2.5 sm:mt-3.5 max-w-lg text-xs sm:text-sm lg:text-base text-[#fbe9d0]/85 font-medium leading-relaxed"
            >
              Track your run with Strava, Garmin, or Apple Watch and earn your finisher medal.
            </motion.p>

            {/* ─── Mobile Hero Image Card (visible ONLY on < lg screens) ─── */}
            <div className="w-full mt-4 mb-2 block lg:hidden">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="relative w-full rounded-2xl overflow-hidden border border-white/20 shadow-[0_20px_45px_rgba(0,0,0,0.8),0_0_30px_rgba(230,72,51,0.25)] bg-[#112026]"
              >
                {/* 16:10 Aspect Ratio Container for Full Image Visibility */}
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <motion.img
                    src="/runner-mobile.webp"
                    alt="Runners sprinting in marathon"
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
                    className="h-full w-full object-cover object-center brightness-[0.98] contrast-[1.05]"
                  />
                  {/* Subtle edge vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14242a]/85 via-transparent to-[#14242a]/30 pointer-events-none" />

                  {/* Top-Left Live Badge */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-[#14242a]/90 border border-white/20 px-2.5 py-1 backdrop-blur-md shadow-md">
                    <Flame className="h-3 w-3 text-[#e64833] fill-[#e64833] animate-pulse" />
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
                      <Award className="h-3.5 w-3.5 text-[#e64833]" />
                      <span>Physical Medal Included</span>
                    </div>
                    <span className="text-[0.6rem] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Verified GPS
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ─── High-Impact CTAs — Positioned Above Fold on Laptops ─── */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-4 sm:mt-5 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 w-full sm:w-auto"
            >
              <Link
                href="/events"
                className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#e64833] via-[#ea5a47] to-[#c93b27] px-6 py-3 sm:px-7 sm:py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider text-[#fbe9d0] shadow-[0_0_25px_rgba(230,72,51,0.5),0_8px_16px_rgba(0,0,0,0.4)] border border-[#fbe9d0]/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_35px_rgba(230,72,51,0.8)] active:scale-95"
              >
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                <span className="relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Explore Challenges</span>
                <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <Link
                href="/register"
                className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-[#90aead]/30 bg-[#1b323b]/85 px-5 py-3 sm:px-6 sm:py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#fbe9d0] backdrop-blur-xl transition-all duration-300 hover:border-[#e64833]/60 hover:bg-[#244855]/90 hover:shadow-[0_0_20px_rgba(230,72,51,0.25)] active:scale-95"
              >
                <ShieldCheck className="h-4 w-4 text-[#90aead] transition-transform duration-300 group-hover:scale-110" />
                <span className="text-[#fbe9d0]/90 group-hover:text-white transition-colors">GPS Verified Races</span>
              </Link>
            </motion.div>

            {/* ─── Compact Responsive Trust Chips ─── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-3.5 sm:mt-4.5 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs max-w-xl"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#90aead]/25 bg-[#172c34]/85 backdrop-blur-md px-3 py-1 text-[0.65rem] sm:text-xs font-bold text-[#fbe9d0]/90 shadow-sm">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Strava, Garmin & Apple Watch</span>
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
                  <motion.img
                    src="/runner-hd.webp"
                    alt="Marathon runners pushing their limits"
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                    className="h-full w-full object-cover object-center brightness-[0.98] contrast-[1.05]"
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
                          <p className="text-[0.7rem] font-black text-white uppercase tracking-wider">Finisher Medal & Kit</p>
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
