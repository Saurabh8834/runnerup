"use client";

import Link from "next/link";
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
  Star,
} from "lucide-react";

export function HomeHero() {
  return (
    <section className="relative w-full overflow-hidden bg-[#14242a] text-[#fbe9d0] isolate min-h-[92dvh] lg:min-h-[100dvh] flex flex-col justify-between pt-20 pb-4 sm:pt-24 sm:pb-6 lg:pt-24 lg:pb-0">
      {/* ─── 1. Cinematic Background with Runner & Mountain Sunrise ─── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Full-opacity, bright, warm sunrise runner image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-runner-sunrise.jpg"
          alt="Runner chasing mountain sunrise"
          className="absolute inset-0 h-full w-full object-cover object-[68%_12%] xs:object-[66%_16%] sm:object-[62%_25%] lg:object-[60%_center] opacity-100 brightness-[1.05] contrast-[1.06]"
        />

        {/* Focused left-side dark gradient overlay for crystal clear text readability */}
        <div className="absolute inset-y-0 left-0 w-[65%] xs:w-[62%] sm:w-[56%] lg:w-[50%] xl:w-[46%] bg-gradient-to-r from-[#14242a] via-[#14242a]/80 to-transparent pointer-events-none" />

        {/* Subtle top header blend so navbar logo & icons remain sharp */}
        <div className="absolute inset-x-0 top-0 h-20 sm:h-28 bg-gradient-to-b from-[#14242a]/80 via-[#14242a]/40 to-transparent" />

        {/* Smooth bottom blend into badges & content */}
        <div className="absolute inset-x-0 bottom-0 h-32 sm:h-44 bg-gradient-to-t from-[#14242a] via-[#14242a]/80 to-transparent" />
      </div>

      {/* ─── 2. Main Hero Content Area ─── */}
      <div className="container-page relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full my-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-4">

        {/* ══════════════════════════════════════════════════════
            LEFT COLUMN: HEADLINE, CTA & BADGES
           ══════════════════════════════════════════════════════ */}
        <div className="w-full max-w-xl xl:max-w-2xl flex flex-col items-start text-left shrink-0 z-10 pt-2 sm:pt-0">
          {/* Eyebrow: INDIA'S PREMIER ───── */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2.5 mb-2 sm:mb-3.5"
          >
            <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.22em] text-[#fbe9d0] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              INDIA&apos;S PREMIER
            </span>
            <span className="h-[2px] w-10 sm:w-16 bg-[#e64833] rounded-full shadow-[0_0_10px_#e64833]" />
          </motion.div>

          {/* Giant Title: VIRTUAL RUNNING RACES */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display font-black text-[2.75rem] xs:text-[3.25rem] sm:text-6xl md:text-7xl lg:text-[4.75rem] xl:text-[5.5rem] tracking-tight leading-[0.92] uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]"
          >
            <span className="block text-white">VIRTUAL</span>
            {/* Exact dry-brush RUNNING artwork matching attached reference */}
            <span className="block my-1 sm:my-2 w-fit">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/running-brush-word.webp"
                alt="RUNNING"
                className="h-12 xs:h-14 sm:h-18 md:h-22 lg:h-24 xl:h-28 w-auto object-contain select-none filter drop-shadow-[0_0_25px_rgba(0,223,196,0.8)]"
              />
            </span>
            <span className="block text-white">RACES</span>
          </motion.h1>

          {/* Subtitle with Location Pin */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-3 sm:mt-4 flex items-center gap-2.5 text-white/95 text-sm sm:text-base lg:text-lg font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
          >
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-[#e64833]/20 border border-[#e64833]/60 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(230,72,51,0.3)]">
              <MapPin className="h-3.5 w-3.5 text-[#e64833]" />
            </div>
            <span>Run Anywhere. Earn Real Medals.</span>
          </motion.div>

          {/* Primary Glowing Pill CTA Button (Orange Brand Accent) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-4 sm:mt-6"
          >
            <Link
              href="/events"
              className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#e64833] via-[#ea5a47] to-[#c93b27] hover:brightness-110 text-white font-extrabold text-sm sm:text-base px-8 sm:px-10 py-3.5 sm:py-4 shadow-[0_0_25px_rgba(230,72,51,0.55)] hover:shadow-[0_0_45px_rgba(230,72,51,0.85)] hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <span>JOIN NOW</span>
              <ArrowRight className="h-5 w-5 stroke-[2.5]" />
            </Link>
          </motion.div>

          {/* Feature Badges Bar (Desktop & Tablet) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-7 sm:mt-9 pt-6 border-t border-white/10 w-full hidden sm:grid grid-cols-2 xl:grid-cols-4 gap-3.5 xl:gap-5 max-w-xl xl:max-w-2xl"
          >
            {/* Badge 1: GPS Verified */}
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full border border-[#e64833]/40 bg-[#e64833]/15 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(230,72,51,0.25)]">
                <MapPin className="h-4 w-4 text-[#e64833]" />
              </div>
              <div>
                <p className="font-display font-black text-xs text-white uppercase tracking-wider">GPS VERIFIED</p>
                <p className="text-[0.68rem] text-[#90aead] font-medium leading-tight">Real runs. Real miles.</p>
              </div>
            </div>

            {/* Badge 2: Track Anywhere */}
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full border border-[#e64833]/40 bg-[#e64833]/15 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(230,72,51,0.25)]">
                <Activity className="h-4 w-4 text-[#e64833]" />
              </div>
              <div>
                <p className="font-display font-black text-xs text-white uppercase tracking-wider">TRACK ANYWHERE</p>
                <p className="text-[0.68rem] text-[#90aead] font-medium leading-tight">Strava / Garmin / Apple Watch</p>
              </div>
            </div>

            {/* Badge 3: Earn Medals */}
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full border border-[#e64833]/40 bg-[#e64833]/15 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(230,72,51,0.25)]">
                <Award className="h-4 w-4 text-[#e64833]" />
              </div>
              <div>
                <p className="font-display font-black text-xs text-white uppercase tracking-wider">EARN MEDALS</p>
                <p className="text-[0.68rem] text-[#90aead] font-medium leading-tight">Delivered across India</p>
              </div>
            </div>

            {/* Badge 4: Pan India Delivery */}
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full border border-[#e64833]/40 bg-[#e64833]/15 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(230,72,51,0.25)]">
                <Truck className="h-4 w-4 text-[#e64833]" />
              </div>
              <div>
                <p className="font-display font-black text-xs text-white uppercase tracking-wider">PAN INDIA DELIVERY</p>
                <p className="text-[0.68rem] text-[#90aead] font-medium leading-tight">Your medal. Our promise.</p>
              </div>
            </div>
          </motion.div>

          {/* Mobile-only 3-badge Row */}
          <div className="mt-5 pt-4 border-t border-white/10 w-full grid grid-cols-3 gap-2 sm:hidden">
            <div className="flex flex-col items-center text-center gap-1.5">
              <div className="h-8 w-8 rounded-full border border-[#e64833]/40 bg-[#e64833]/15 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(230,72,51,0.2)]">
                <MapPin className="h-3.5 w-3.5 text-[#e64833]" />
              </div>
              <div>
                <p className="font-display font-black text-[0.65rem] text-white uppercase tracking-wider">GPS VERIFIED</p>
                <p className="text-[0.56rem] text-[#90aead] leading-tight">Real runs.</p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-1.5">
              <div className="h-8 w-8 rounded-full border border-[#e64833]/40 bg-[#e64833]/15 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(230,72,51,0.2)]">
                <Activity className="h-3.5 w-3.5 text-[#e64833]" />
              </div>
              <div>
                <p className="font-display font-black text-[0.65rem] text-white uppercase tracking-wider">TRACK</p>
                <p className="text-[0.56rem] text-[#90aead] leading-tight">Anywhere</p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-1.5">
              <div className="h-8 w-8 rounded-full border border-[#e64833]/40 bg-[#e64833]/15 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(230,72,51,0.2)]">
                <Award className="h-3.5 w-3.5 text-[#e64833]" />
              </div>
              <div>
                <p className="font-display font-black text-[0.65rem] text-white uppercase tracking-wider">MEDALS</p>
                <p className="text-[0.56rem] text-[#90aead] leading-tight">Pan India</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ─── 3. BOTTOM SECTION: HOW IT WORKS (Desktop) / RUN • EARN • BE PROUD (Mobile) ─── */}
      <div id="how-it-works" className="relative z-10 w-full mt-3 lg:mt-6">
        {/* Desktop "HOW IT WORKS" 4-Step Bar */}
        <div className="hidden lg:block w-full border-t border-white/10 bg-[#172c34]/95 backdrop-blur-md rounded-t-3xl py-4">
          <div className="container-page mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-8">
              {/* Left Title */}
              <div className="shrink-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#e64833]">
                    HOW IT WORKS
                  </span>
                  <span className="h-[1.5px] w-8 bg-[#e64833] rounded-full shadow-[0_0_8px_#e64833]" />
                </div>
                <h4 className="font-display font-black text-sm text-white tracking-tight uppercase">
                  SIMPLE STEPS. REAL REWARDS.
                </h4>
              </div>

              {/* 4 Steps with Connected Lines */}
              <div className="flex items-center justify-between flex-1 max-w-3xl">
                {/* Step 1 */}
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#e64833]/50 bg-[#e64833]/15 font-mono text-[0.68rem] font-bold text-[#fbe9d0] shadow-[0_0_8px_rgba(230,72,51,0.3)]">
                    1
                  </span>
                  <Smartphone className="h-4 w-4 text-[#e64833] shrink-0" />
                  <div>
                    <p className="font-display font-black text-xs text-white uppercase tracking-wider">REGISTER</p>
                    <p className="text-[0.65rem] text-[#90aead] leading-tight">Join your chosen event</p>
                  </div>
                </div>

                <div className="h-[1px] w-6 bg-white/20 shrink-0" />

                {/* Step 2 */}
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#e64833]/50 bg-[#e64833]/15 font-mono text-[0.68rem] font-bold text-[#fbe9d0] shadow-[0_0_8px_rgba(230,72,51,0.3)]">
                    2
                  </span>
                  <Activity className="h-4 w-4 text-[#e64833] shrink-0" />
                  <div>
                    <p className="font-display font-black text-xs text-white uppercase tracking-wider">RUN</p>
                    <p className="text-[0.65rem] text-[#90aead] leading-tight">Anywhere, anytime</p>
                  </div>
                </div>

                <div className="h-[1px] w-6 bg-white/20 shrink-0" />

                {/* Step 3 */}
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#e64833]/50 bg-[#e64833]/15 font-mono text-[0.68rem] font-bold text-[#fbe9d0] shadow-[0_0_8px_rgba(230,72,51,0.3)]">
                    3
                  </span>
                  <Cloud className="h-4 w-4 text-[#e64833] shrink-0" />
                  <div>
                    <p className="font-display font-black text-xs text-white uppercase tracking-wider">SYNC</p>
                    <p className="text-[0.65rem] text-[#90aead] leading-tight">With Strava / Garmin / Apple Watch</p>
                  </div>
                </div>

                <div className="h-[1px] w-6 bg-white/20 shrink-0" />

                {/* Step 4 */}
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#e64833]/50 bg-[#e64833]/15 font-mono text-[0.68rem] font-bold text-[#fbe9d0] shadow-[0_0_8px_rgba(230,72,51,0.3)]">
                    4
                  </span>
                  <Trophy className="h-4 w-4 text-[#e64833] shrink-0" />
                  <div>
                    <p className="font-display font-black text-xs text-white uppercase tracking-wider">EARN &amp; RECEIVE</p>
                    <p className="text-[0.65rem] text-[#90aead] leading-tight">Your finisher medal at home</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Ticker: RUN • EARN • BE PROUD */}
        <div className="block lg:hidden w-full py-2">
          <div className="flex items-center justify-center gap-3 text-center">
            <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#e64833]/50" />
            <span className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.25em] text-[#e64833]">
              RUN &nbsp;•&nbsp; EARN &nbsp;•&nbsp; BE PROUD
            </span>
            <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#e64833]/50" />
          </div>
        </div>
      </div>
    </section>
  );
}
