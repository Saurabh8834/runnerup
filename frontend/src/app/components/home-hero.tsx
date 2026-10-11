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
    <section className="relative w-full overflow-hidden bg-[#071419] text-[#fbe9d0] isolate min-h-[92dvh] lg:min-h-[100dvh] flex flex-col justify-between pt-24 pb-6 sm:pt-28 sm:pb-8 lg:pt-28 lg:pb-0">
      {/* ─── 1. Cinematic Background with Runner & Mountain Sunrise (Matches Mockup) ─── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-runner-sunrise.jpg"
          alt="Runner chasing mountain sunrise"
          className="absolute inset-0 h-full w-full object-cover object-[72%_center] sm:object-[78%_center] lg:object-[82%_center] opacity-80 brightness-[0.92] contrast-[1.08]"
        />
        {/* Left-side dark gradient overlay for crystal clear text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#071419] via-[#071419]/90 to-transparent w-full lg:w-[62%]" />
        {/* Top header blend */}
        <div className="absolute inset-x-0 top-0 h-28 sm:h-36 bg-gradient-to-b from-[#071419] to-transparent" />
        {/* Bottom footer/section blend */}
        <div className="absolute inset-x-0 bottom-0 h-36 sm:h-44 bg-gradient-to-t from-[#071419] via-[#071419]/80 to-transparent" />
      </div>

      {/* ─── 2. Main Hero Content Area ─── */}
      <div className="container-page relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">

          {/* ══════════════════════════════════════════════════════
              LEFT COLUMN: HEADLINE, CTA & BADGES (lg: 7 cols)
             ══════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Eyebrow: INDIA'S PREMIER ───── */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2.5 mb-2.5 sm:mb-4"
            >
              <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.22em] text-white">
                INDIA&apos;S PREMIER
              </span>
              <span className="h-[2px] w-10 sm:w-16 bg-[#00dfc4] rounded-full shadow-[0_0_10px_#00dfc4]" />
            </motion.div>

            {/* Giant Title: VIRTUAL RUNNING RACES (Matches UI Mockup) */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display font-black text-[2.75rem] xs:text-[3.25rem] sm:text-6xl md:text-7xl lg:text-[4.75rem] xl:text-[5.5rem] tracking-tight leading-[0.92] uppercase"
            >
              <span className="block text-white">VIRTUAL</span>
              <span className="block text-[#00dfc4] italic tracking-normal drop-shadow-[0_0_30px_rgba(0,223,196,0.55)] my-1 sm:my-1.5">
                RUNNING
              </span>
              <span className="block text-white">RACES</span>
            </motion.h1>

            {/* Subtitle with Location Pin */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-3.5 sm:mt-5 flex items-center gap-2.5 text-white/95 text-sm sm:text-base lg:text-lg font-semibold"
            >
              <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-[#00dfc4]/20 border border-[#00dfc4]/60 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,223,196,0.3)]">
                <MapPin className="h-3.5 w-3.5 text-[#00dfc4]" />
              </div>
              <span>Run Anywhere. Earn Real Medals.</span>
            </motion.div>

            {/* Primary Glowing Pill CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mt-5 sm:mt-7"
            >
              <Link
                href="/events"
                className="inline-flex items-center gap-2.5 rounded-full bg-[#00dfc4] hover:bg-[#00c9b0] text-black font-extrabold text-sm sm:text-base px-8 sm:px-10 py-3.5 sm:py-4 shadow-[0_0_30px_rgba(0,223,196,0.6)] hover:shadow-[0_0_45px_rgba(0,223,196,0.9)] hover:scale-105 active:scale-95 transition-all duration-300"
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
              className="mt-8 sm:mt-10 pt-6 border-t border-white/10 w-full hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6"
            >
              {/* Badge 1: GPS Verified */}
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full border border-[#00dfc4]/40 bg-[#00dfc4]/10 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,223,196,0.2)]">
                  <MapPin className="h-4 w-4 text-[#00dfc4]" />
                </div>
                <div>
                  <p className="font-display font-black text-xs text-white uppercase tracking-wider">GPS VERIFIED</p>
                  <p className="text-[0.68rem] text-[#90aead] font-medium leading-tight">Real runs. Real miles.</p>
                </div>
              </div>

              {/* Badge 2: Track Anywhere */}
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full border border-[#00dfc4]/40 bg-[#00dfc4]/10 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,223,196,0.2)]">
                  <Activity className="h-4 w-4 text-[#00dfc4]" />
                </div>
                <div>
                  <p className="font-display font-black text-xs text-white uppercase tracking-wider">TRACK ANYWHERE</p>
                  <p className="text-[0.68rem] text-[#90aead] font-medium leading-tight">Strava / Garmin / Apple Watch</p>
                </div>
              </div>

              {/* Badge 3: Earn Medals */}
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full border border-[#00dfc4]/40 bg-[#00dfc4]/10 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,223,196,0.2)]">
                  <Award className="h-4 w-4 text-[#00dfc4]" />
                </div>
                <div>
                  <p className="font-display font-black text-xs text-white uppercase tracking-wider">EARN MEDALS</p>
                  <p className="text-[0.68rem] text-[#90aead] font-medium leading-tight">Delivered across India</p>
                </div>
              </div>

              {/* Badge 4: Pan India Delivery */}
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full border border-[#00dfc4]/40 bg-[#00dfc4]/10 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,223,196,0.2)]">
                  <Truck className="h-4 w-4 text-[#00dfc4]" />
                </div>
                <div>
                  <p className="font-display font-black text-xs text-white uppercase tracking-wider">PAN INDIA DELIVERY</p>
                  <p className="text-[0.68rem] text-[#90aead] font-medium leading-tight">Your medal. Our promise.</p>
                </div>
              </div>
            </motion.div>

            {/* Mobile-only 3-badge Row (Matches Image 1) */}
            <div className="mt-6 pt-5 border-t border-white/10 w-full grid grid-cols-3 gap-2 sm:hidden">
              <div className="flex flex-col items-center text-center gap-1.5">
                <div className="h-8 w-8 rounded-full border border-[#00dfc4]/40 bg-[#00dfc4]/10 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,223,196,0.2)]">
                  <MapPin className="h-3.5 w-3.5 text-[#00dfc4]" />
                </div>
                <div>
                  <p className="font-display font-black text-[0.65rem] text-white uppercase tracking-wider">GPS VERIFIED</p>
                  <p className="text-[0.58rem] text-[#90aead] leading-tight">Real runs.</p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center gap-1.5">
                <div className="h-8 w-8 rounded-full border border-[#00dfc4]/40 bg-[#00dfc4]/10 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,223,196,0.2)]">
                  <Activity className="h-3.5 w-3.5 text-[#00dfc4]" />
                </div>
                <div>
                  <p className="font-display font-black text-[0.65rem] text-white uppercase tracking-wider">TRACK</p>
                  <p className="text-[0.58rem] text-[#90aead] leading-tight">Anywhere</p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center gap-1.5">
                <div className="h-8 w-8 rounded-full border border-[#00dfc4]/40 bg-[#00dfc4]/10 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,223,196,0.2)]">
                  <Award className="h-3.5 w-3.5 text-[#00dfc4]" />
                </div>
                <div>
                  <p className="font-display font-black text-[0.65rem] text-white uppercase tracking-wider">EARN MEDALS</p>
                  <p className="text-[0.58rem] text-[#90aead] leading-tight">Doorstep</p>
                </div>
              </div>
            </div>

          </div>

          {/* ══════════════════════════════════════════════════════
              RIGHT COLUMN ON DESKTOP: THE AUTHENTIC MEDAL (5 cols)
              (Exact match with Image 2)
             ══════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 hidden lg:flex items-center justify-center relative">
            {/* Warm Golden / Cyan Spotlight Aura */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-[440px] w-[440px] xl:h-[500px] xl:w-[500px] rounded-full bg-gradient-to-tr from-[#f59e0b]/25 via-[#00dfc4]/15 to-transparent blur-[100px]" />
            </div>

            {/* Authentic Indian Air Force Day 2026 Solid Metal Finisher Medal (100% uncropped as in Image 3) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-full flex items-center justify-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/event-medal.webp"
                alt="Authentic Indian Air Force Day 2026 Solid Metal Finisher Medal"
                className="w-auto h-auto max-h-[500px] xl:max-h-[560px] object-contain select-none drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)] transition-transform duration-500 hover:scale-105 will-change-transform"
              />
            </motion.div>
          </div>

        </div>

        {/* ══════════════════════════════════════════════════════
            MOBILE FEATURED RACE CARD (Matches Image 1)
            (Visible on screens < lg)
           ══════════════════════════════════════════════════════ */}
        <div className="mt-7 w-full block lg:hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative rounded-3xl border border-[#00dfc4]/30 bg-[#0a181f]/95 backdrop-blur-xl p-4 xs:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden"
          >
            {/* Subtle Tricolor Ambient Glow inside the card */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#f59e0b]/20 via-[#00dfc4]/10 to-transparent blur-3xl pointer-events-none" />

            <div className="grid grid-cols-12 gap-3 xs:gap-4 items-center relative z-10">
              {/* Card Left: Event Info */}
              <div className="col-span-7 flex flex-col items-start text-left">
                {/* Badge: ⭐ FEATURED RACE */}
                <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-2.5 py-0.5 text-[0.62rem] font-black uppercase tracking-wider text-amber-300 shadow-sm">
                  <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                  <span>FEATURED RACE</span>
                </div>

                {/* Title */}
                <h3 className="mt-2 font-display font-black text-base xs:text-lg text-white uppercase tracking-tight leading-tight">
                  INDIAN AIRFORCE DAY
                </h3>
                <p className="text-[0.62rem] font-mono font-bold tracking-[0.2em] text-[#90aead] uppercase mt-0.5">
                  VIRTUAL RUN
                </p>

                {/* Cyan Accent Line */}
                <div className="h-[1.5px] w-8 bg-[#00dfc4] rounded-full my-2" />

                {/* Tagline */}
                <p className="text-[0.7rem] text-[#fbe9d0]/85 font-medium leading-snug">
                  Salute the Guardians of our Skies.
                </p>

                {/* Distance Chip */}
                <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-[#00dfc4]/40 bg-[#00dfc4]/10 px-2.5 py-0.5 text-[0.68rem] font-bold text-[#00dfc4]">
                  <Activity className="h-3 w-3" />
                  <span>5K – 21K</span>
                </div>

                {/* Button: RUN NOW → */}
                <Link
                  href="/events/indian-air-force-day-virtual-challenge"
                  className="mt-3.5 inline-flex items-center gap-1.5 rounded-full border-2 border-[#00dfc4] bg-transparent hover:bg-[#00dfc4] text-[#00dfc4] hover:text-black font-black text-[0.68rem] uppercase tracking-wider px-4 py-1.5 transition-all duration-300 shadow-[0_0_15px_rgba(0,223,196,0.3)]"
                >
                  <span>RUN NOW</span>
                  <ArrowRight className="h-3 w-3 stroke-[2.5]" />
                </Link>
              </div>

              {/* Card Right: Authentic Medal Display */}
              <div className="col-span-5 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/event-medal.webp"
                  alt="Indian Air Force Day Virtual Challenge Medal"
                  className="h-auto max-h-[190px] xs:max-h-[220px] w-full object-contain select-none drop-shadow-[0_15px_35px_rgba(0,0,0,0.95)] transition-transform duration-300 hover:scale-105"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── 3. BOTTOM SECTION: HOW IT WORKS (Desktop) / RUN • EARN • BE PROUD (Mobile) ─── */}
      <div id="how-it-works" className="relative z-10 w-full mt-6 lg:mt-8">
        {/* Desktop "HOW IT WORKS" 4-Step Bar (Image 2) */}
        <div className="hidden lg:block w-full border-t border-white/10 bg-[#061217]/95 backdrop-blur-md py-4">
          <div className="container-page mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-8">
              {/* Left Title */}
              <div className="shrink-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#00dfc4]">
                    HOW IT WORKS
                  </span>
                  <span className="h-[1.5px] w-8 bg-[#00dfc4] rounded-full" />
                </div>
                <h4 className="font-display font-black text-sm text-white tracking-tight uppercase">
                  SIMPLE STEPS. REAL REWARDS.
                </h4>
              </div>

              {/* 4 Steps */}
              <div className="flex items-center justify-between flex-1 max-w-3xl">
                {/* Step 1 */}
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#00dfc4]/50 bg-[#00dfc4]/10 font-mono text-[0.68rem] font-bold text-[#00dfc4]">
                    1
                  </span>
                  <Smartphone className="h-4 w-4 text-[#00dfc4] shrink-0" />
                  <div>
                    <p className="font-display font-black text-xs text-white uppercase tracking-wider">REGISTER</p>
                    <p className="text-[0.65rem] text-[#90aead] leading-tight">Join your chosen event</p>
                  </div>
                </div>

                <div className="h-[1px] w-6 bg-white/20 shrink-0" />

                {/* Step 2 */}
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#00dfc4]/50 bg-[#00dfc4]/10 font-mono text-[0.68rem] font-bold text-[#00dfc4]">
                    2
                  </span>
                  <Activity className="h-4 w-4 text-[#00dfc4] shrink-0" />
                  <div>
                    <p className="font-display font-black text-xs text-white uppercase tracking-wider">RUN</p>
                    <p className="text-[0.65rem] text-[#90aead] leading-tight">Anywhere, anytime</p>
                  </div>
                </div>

                <div className="h-[1px] w-6 bg-white/20 shrink-0" />

                {/* Step 3 */}
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#00dfc4]/50 bg-[#00dfc4]/10 font-mono text-[0.68rem] font-bold text-[#00dfc4]">
                    3
                  </span>
                  <Cloud className="h-4 w-4 text-[#00dfc4] shrink-0" />
                  <div>
                    <p className="font-display font-black text-xs text-white uppercase tracking-wider">SYNC</p>
                    <p className="text-[0.65rem] text-[#90aead] leading-tight">With Strava / Garmin / Apple Watch</p>
                  </div>
                </div>

                <div className="h-[1px] w-6 bg-white/20 shrink-0" />

                {/* Step 4 */}
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#00dfc4]/50 bg-[#00dfc4]/10 font-mono text-[0.68rem] font-bold text-[#00dfc4]">
                    4
                  </span>
                  <Trophy className="h-4 w-4 text-[#00dfc4] shrink-0" />
                  <div>
                    <p className="font-display font-black text-xs text-white uppercase tracking-wider">EARN &amp; RECEIVE</p>
                    <p className="text-[0.65rem] text-[#90aead] leading-tight">Your finisher medal at home</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Ticker: RUN • EARN • BE PROUD (Image 1) */}
        <div className="block lg:hidden w-full py-2">
          <div className="flex items-center justify-center gap-3 text-center">
            <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#00dfc4]/50" />
            <span className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.25em] text-[#00dfc4]">
              RUN &nbsp;•&nbsp; EARN &nbsp;•&nbsp; BE PROUD
            </span>
            <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#00dfc4]/50" />
          </div>
        </div>
      </div>
    </section>
  );
}
