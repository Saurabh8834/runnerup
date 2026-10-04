"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Flame,
  Gauge,
  Timer,
  TrendingUp,
  ShieldCheck,
  Award,
  Activity,
  Zap,
  MapPin,
  Truck,
  Sparkles,
} from "lucide-react";

const brandLogos = [
  { name: "Nike", label: "NIKE" },
  { name: "Puma", label: "PUMA" },
  { name: "Adidas", label: "ADIDAS" },
  { name: "Reebok", label: "REEBOK" },
];

const activityHistory = [
  { date: "4 May", dist: "10 KM", time: "26 min", cal: "247 cal" },
  { date: "3 May", dist: "12 KM", time: "30 min", cal: "290 cal" },
  { date: "2 May", dist: "6 KM", time: "22 min", cal: "200 cal" },
  { date: "1 May", dist: "15 KM", time: "40 min", cal: "350 cal" },
];

export function HomeHero() {
  return (
    <section className="relative min-h-[85vh] sm:min-h-[92vh] w-full overflow-hidden bg-[#14242a] text-[#fbe9d0] isolate flex flex-col justify-center items-center pt-28 pb-16 sm:pt-36 sm:pb-24">
      {/* ─── Animated Ken Burns Background Image ─── */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        {/* Mobile Full-Height Vertical 9:16 Image */}
        <motion.img
          src="/runner-mobile.webp"
          alt="Runner Up Marathon"
          initial={{ scale: 1, y: 0 }}
          animate={{
            scale: [1, 1.05, 1],
            y: [0, -6, 0],
          }}
          transition={{
            duration: 14,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          className="h-full w-full object-cover object-[center_30%] brightness-[0.95] contrast-[1.05] block sm:hidden will-change-transform"
        />
        {/* Desktop Widescreen 16:9 Image */}
        <motion.img
          src="/runner-hd.webp"
          alt="Runner Up Marathon"
          initial={{ scale: 1, x: 0, y: 0 }}
          animate={{
            scale: [1, 1.07, 1],
            x: [0, -12, 0],
            y: [0, -6, 0],
          }}
          transition={{
            duration: 16,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          className="h-full w-full object-cover object-center brightness-[0.92] contrast-[1.05] hidden sm:block will-change-transform"
        />

        {/* Contrast Overlay with Palette Deep Teal */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#14242a]/90 via-[#14242a]/60 to-[#14242a] block sm:hidden" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#14242a]/60 via-[#14242a]/40 to-[#14242a] hidden sm:block" />
      </div>

      {/* Radiant Spruce & Vermilion Accent Orbs */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -z-10 h-[280px] w-[320px] sm:h-[450px] sm:w-[650px] -translate-x-1/2 rounded-full bg-[#244855]/45 blur-[90px] sm:blur-[140px]" />
      <div className="pointer-events-none absolute bottom-10 right-10 -z-10 h-[180px] w-[180px] sm:h-[300px] sm:w-[300px] rounded-full bg-[#e64833]/25 blur-[80px] sm:blur-[110px]" />

      {/* ─── Hero Content ─── */}
      <div className="container-page relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        <div className="flex flex-col items-center w-full transition-all duration-500">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-[#e64833]/40 bg-[#172c34]/85 px-3 sm:px-4.5 py-1 sm:py-1.5 text-[0.68rem] sm:text-xs font-black uppercase tracking-wider text-[#fbe9d0] backdrop-blur-md mb-3 sm:mb-6 shadow-xl shadow-black/50 max-w-full">
            <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-[#e64833] text-[#e64833] shrink-0" />
            <span className="truncate">INDIA&apos;S #1 VIRTUAL RUNNING PLATFORM</span>
          </div>

          {/* Main Slogan Headline */}
          <h1 className="font-display font-black text-2xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5rem] tracking-tight sm:tracking-tighter uppercase leading-[1.1] sm:leading-[0.98] drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
            <span className="block text-[#fbe9d0]">Push Your Limits,</span>
            <span className="block text-[#e64833] italic font-black drop-shadow-[0_0_28px_rgba(230,72,51,0.65)] mt-0.5 sm:mt-1">
              Chase Your Goals,
            </span>
            <span className="block text-white mt-0.5 sm:mt-1">
              Own Your Journey
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-3 sm:mt-6 max-w-md sm:max-w-2xl text-xs sm:text-xl text-[#fbe9d0]/90 font-medium leading-relaxed px-2 sm:px-0 drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
            Every mile tells a story. Pick your route, record with Strava or Garmin, and earn official heavy-metal finisher medals delivered straight to your door across India.
          </p>

          {/* ─── High-Impact Unified Responsive CTAs ─── */}
          <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 w-full sm:w-auto max-w-xs sm:max-w-none">
            <Link
              href="/events"
              className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-2.5 sm:gap-3 overflow-hidden rounded-full bg-gradient-to-r from-[#e64833] via-[#ea5a47] to-[#c93b27] px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-black uppercase tracking-wider text-[#fbe9d0] shadow-[0_0_30px_rgba(230,72,51,0.5),0_10px_20px_rgba(0,0,0,0.4)] border border-[#fbe9d0]/30 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(230,72,51,0.8),0_12px_28px_rgba(135,79,65,0.6)] active:scale-95"
            >
              <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
              <span className="relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Explore Challenges</span>
              <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
            </Link>

            <Link
              href="/register"
              className="group inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-full border border-[#90aead]/30 bg-[#1b323b]/85 px-6 sm:px-7 py-3.5 sm:py-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#fbe9d0] backdrop-blur-xl transition-all duration-300 hover:border-[#e64833]/60 hover:bg-[#244855]/90 hover:shadow-[0_0_20px_rgba(230,72,51,0.25)] active:scale-95"
            >
              <ShieldCheck className="h-4 w-4 text-[#90aead] transition-transform duration-300 group-hover:scale-110" />
              <span className="text-[#fbe9d0]/90 group-hover:text-white transition-colors">GPS Verified Races</span>
            </Link>
          </div>

          {/* ─── Trust Badges Row ─── */}
          <div className="mt-6 sm:mt-11 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs max-w-3xl">
            <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-[#90aead]/20 bg-[#16272e]/85 backdrop-blur-md px-3 sm:px-4 py-1.5 text-[0.68rem] sm:text-xs font-bold uppercase tracking-wider text-[#fbe9d0]/90 shadow-md">
              <ShieldCheck className="h-3.5 w-3.5 text-[#90aead] shrink-0" />
              <span>GPS Verified (Strava • Garmin • Nike • Apple)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-[#90aead]/20 bg-[#16272e]/85 backdrop-blur-md px-3 sm:px-4 py-1.5 text-[0.68rem] sm:text-xs font-bold uppercase tracking-wider text-[#fbe9d0]/90 shadow-md">
              <MapPin className="h-3.5 w-3.5 text-[#90aead] shrink-0" />
              <span>Run Anywhere Across India</span>
            </span>
            <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-[#90aead]/20 bg-[#16272e]/85 backdrop-blur-md px-3 sm:px-4 py-1.5 text-[0.68rem] sm:text-xs font-bold uppercase tracking-wider text-[#fbe9d0]/90 shadow-md">
              <Award className="h-3.5 w-3.5 text-[#e64833] shrink-0" />
              <span>Heavy Metal Medals & Free Express Shipping</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}




