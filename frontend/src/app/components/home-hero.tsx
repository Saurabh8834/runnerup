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
    <section className="relative w-full overflow-hidden bg-[#14242a] text-[#fbe9d0] isolate pt-24 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24">
      {/* ─── Ambient Atmospheric Background Glows ─── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/2 -z-10 h-[300px] w-[320px] sm:h-[450px] sm:w-[650px] -translate-x-1/2 rounded-full bg-[#244855]/40 blur-[100px] sm:blur-[140px]" />
        <div className="absolute top-1/3 right-4 -z-10 h-[220px] w-[220px] sm:h-[350px] sm:w-[350px] rounded-full bg-[#e64833]/20 blur-[90px] sm:blur-[120px]" />
        <div className="absolute bottom-10 left-10 -z-10 h-[180px] w-[180px] sm:h-[280px] sm:w-[280px] rounded-full bg-[#244855]/30 blur-[80px]" />
      </div>

      <div className="container-page relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ─── Responsive Grid: Stacked on Mobile, 2-Column on Desktop ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ─── Text Content Column (lg: 7 cols) ─── */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            
            {/* Eyebrow Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-[#e64833]/50 bg-[#172c34]/90 px-3.5 sm:px-4 py-1.5 text-[0.68rem] sm:text-xs font-black uppercase tracking-wider text-[#fbe9d0] backdrop-blur-xl shadow-lg shadow-black/40 mb-4 sm:mb-6"
            >
              <Zap className="h-3.5 w-3.5 fill-[#e64833] text-[#e64833] shrink-0" />
              <span>INDIA&apos;S #1 VIRTUAL RUNNING PLATFORM</span>
            </motion.div>

            {/* Main Slogan Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display font-black text-3xl sm:text-5xl md:text-6xl xl:text-[4.2rem] tracking-tight uppercase leading-[1.08] sm:leading-[1] drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]"
            >
              <span className="block text-[#fbe9d0]">Push Your Limits,</span>
              <span className="block text-[#e64833] italic font-black drop-shadow-[0_0_30px_rgba(230,72,51,0.55)] mt-1">
                Chase Your Goals,
              </span>
              <span className="block text-white mt-1">
                Own Your Journey
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 sm:mt-6 max-w-xl text-xs sm:text-base md:text-lg text-[#fbe9d0]/85 font-medium leading-relaxed"
            >
              Every mile tells a story. Pick your route, record with Strava, Garmin or Apple Watch, and earn official heavy-metal finisher medals delivered straight to your door across India.
            </motion.p>

            {/* ─── Mobile Hero Image Card (visible ONLY on < lg screens) ─── */}
            <div className="w-full mt-6 mb-2 block lg:hidden">
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

            {/* ─── High-Impact CTAs ─── */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 w-full sm:w-auto"
            >
              <Link
                href="/events"
                className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-[#e64833] via-[#ea5a47] to-[#c93b27] px-7 py-3.5 sm:px-8 sm:py-4 text-xs sm:text-sm font-black uppercase tracking-wider text-[#fbe9d0] shadow-[0_0_30px_rgba(230,72,51,0.5),0_10px_20px_rgba(0,0,0,0.4)] border border-[#fbe9d0]/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(230,72,51,0.8)] active:scale-95"
              >
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                <span className="relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Explore Challenges</span>
                <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <Link
                href="/register"
                className="group inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-full border border-[#90aead]/30 bg-[#1b323b]/85 px-6 py-3.5 sm:px-7 sm:py-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#fbe9d0] backdrop-blur-xl transition-all duration-300 hover:border-[#e64833]/60 hover:bg-[#244855]/90 hover:shadow-[0_0_20px_rgba(230,72,51,0.25)] active:scale-95"
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
              className="mt-6 sm:mt-9 flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-2.5 text-xs max-w-xl"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#90aead]/25 bg-[#172c34]/85 backdrop-blur-md px-3 py-1.5 text-[0.68rem] sm:text-xs font-bold text-[#fbe9d0]/90 shadow-sm">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Strava, Garmin & Apple Watch</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#90aead]/25 bg-[#172c34]/85 backdrop-blur-md px-3 py-1.5 text-[0.68rem] sm:text-xs font-bold text-[#fbe9d0]/90 shadow-sm">
                <MapPin className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                <span>Run Anywhere in India</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#90aead]/25 bg-[#172c34]/85 backdrop-blur-md px-3 py-1.5 text-[0.68rem] sm:text-xs font-bold text-[#fbe9d0]/90 shadow-sm">
                <Award className="h-3.5 w-3.5 text-[#e64833] shrink-0" />
                <span>Free Doorstep Medal Courier</span>
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
              <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_40px_rgba(230,72,51,0.25)] bg-[#101e23] group">
                <div className="relative aspect-[4/5] w-full overflow-hidden">
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
                  <div className="absolute top-4 left-4 flex items-center gap-2 rounded-2xl bg-[#14242a]/90 border border-white/20 px-3.5 py-2 backdrop-blur-xl shadow-xl">
                    <div className="h-8 w-8 rounded-xl bg-[#e64833]/20 flex items-center justify-center border border-[#e64833]/40">
                      <Flame className="h-4 w-4 text-[#e64833] fill-[#e64833]" />
                    </div>
                    <div>
                      <p className="text-[0.62rem] font-bold text-slate-300 uppercase tracking-wider">Active Community</p>
                      <p className="text-xs font-black text-white">12,400+ Runners</p>
                    </div>
                  </div>

                  {/* Floating Telemetry Widget 2: GPS Verified */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 rounded-2xl bg-[#14242a]/90 border border-white/20 px-3 py-2 backdrop-blur-xl shadow-xl">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[0.68rem] font-black uppercase tracking-wider text-emerald-300">Live GPS</span>
                  </div>

                  {/* Floating Bottom Card: Finisher Kit Showcase */}
                  <div className="absolute bottom-5 inset-x-5 rounded-2xl bg-[#172c34]/95 border border-[#90aead]/30 p-4 backdrop-blur-2xl shadow-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#e64833] to-[#ea5a47] flex items-center justify-center text-white shadow-lg shadow-[#e64833]/40">
                          <Trophy className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-white uppercase tracking-wider">Finisher Medal & Kit</p>
                          <p className="text-[0.7rem] text-[#fbe9d0]/80 font-medium">Delivered to door anywhere in India</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-500/25 border border-emerald-400/40 px-2.5 py-1 text-[0.62rem] font-black uppercase tracking-wider text-emerald-300">
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
