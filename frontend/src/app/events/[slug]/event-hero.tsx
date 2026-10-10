"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Flame,
  Layers,
  MapPin,
  Medal,
  Route,
  Sparkles,
  Star,
  Trophy,
  Truck,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { PublicEvent } from "../../data/events";
import { RegisterCta } from "../../components/register-cta";
import { EventCountdown } from "./countdown";

export function EventHero({ event, isPast }: { event: PublicEvent; isPast: boolean }) {
  const [heroImg, setHeroImg] = useState(
    event.bannerImageUrl ?? "/images/mountain-run-hero.svg"
  );
  const [viewMode, setViewMode] = useState<"dual" | "medal" | "poster">("dual");

  useEffect(() => {
    setHeroImg(event.bannerImageUrl ?? "/images/mountain-run-hero.svg");
  }, [event.bannerImageUrl]);

  // Extract available distances
  const rawDistances = event.distance.split(" / ").map((d) => d.trim()).filter(Boolean);
  const distances = rawDistances.length > 0 ? rawDistances : ["1.5 km", "3 km", "5 km", "10 km", "21 km"];

  // Default selected distance (prefer 5 km if available)
  const defaultDist = distances.find((d) => d.toLowerCase().includes("5")) ?? distances[0];
  const [selectedDistance, setSelectedDistance] = useState(defaultDist);

  // Price parsing
  const isFree = event.price.toLowerCase().includes("free");
  const cleanPrice = event.price.replace(/^Rs\.\s*/i, "").trim();
  const numericPrice = parseInt(cleanPrice.replace(/[^\d]/g, ""), 10) || 99;
  const priceDisplay = isFree ? "Free" : `₹${numericPrice}`;

  // Strikethrough price & savings
  const compareAtNumeric = event.compareAtPrice
    ? parseInt(event.compareAtPrice.replace(/[^\d]/g, ""), 10)
    : numericPrice > 0
    ? numericPrice >= 300
      ? numericPrice + 100
      : numericPrice + 50
    : 199;
  const savings = compareAtNumeric > numericPrice ? compareAtNumeric - numericPrice : null;

  const priceLabel = isFree ? "Register for Free" : `Register for ${priceDisplay}`;

  // Separate title into main and highlight
  const titleParts = event.name.replace(/🍁|🇮🇳|🏆|✨/g, "").trim().split(" ");
  const mainTitle = titleParts.slice(0, Math.max(1, titleParts.length - 1)).join(" ");
  const highlightWord = titleParts.length > 1 ? titleParts[titleParts.length - 1] : "CHALLENGE";

  return (
    <section className="relative w-full overflow-hidden bg-[#101d22] text-[#fbe9d0] isolate min-h-[92dvh] flex flex-col justify-center pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-20 lg:pb-12 border-b border-white/10">
      {/* ─── Ambient Atmospheric Background Glows ─── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/3 -z-10 h-[280px] w-[350px] sm:h-[450px] sm:w-[650px] -translate-x-1/2 rounded-full bg-[#e64833]/15 blur-[90px] sm:blur-[140px]" />
        <div className="absolute top-1/3 right-10 -z-10 h-[260px] w-[260px] sm:h-[400px] sm:w-[400px] rounded-full bg-[#f59e0b]/10 blur-[80px] sm:blur-[120px]" />
        <div className="absolute bottom-10 left-10 -z-10 h-[200px] w-[200px] sm:h-[300px] sm:w-[300px] rounded-full bg-[#244855]/30 blur-[70px] sm:blur-[90px]" />
      </div>

      <div className="container-page relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center">
          
          {/* ══════════════════════════════════════════════════════
              LEFT COLUMN: CONVERSION ENGINE & DETAILS (7 cols)
             ══════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            
            {/* Eyebrow Pill */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-[#172c34]/90 px-3.5 sm:px-4 py-1.5 text-[0.65rem] sm:text-xs font-black uppercase tracking-wider text-[#fbe9d0] shadow-md mb-3"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e64833] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#e64833]" />
              </span>
              <span>{event.date || "OCTOBER 2026"}</span>
              <span className="text-[#90aead]">·</span>
              <span className="text-amber-400">RUN, WALK OR CYCLE</span>
              <span className="text-[#90aead]">·</span>
              <span className="text-emerald-400">PAN-INDIA</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display font-black text-[2.1rem] xs:text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-[3.8rem] tracking-tight uppercase leading-[1.04] drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]"
            >
              <span className="block text-white">{mainTitle || event.name}</span>
              <span className="block bg-gradient-to-r from-[#e64833] via-[#f59e0b] to-[#ea5a47] bg-clip-text text-transparent italic drop-shadow-[0_0_35px_rgba(230,72,51,0.5)]">
                {highlightWord} CHALLENGE
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-3 max-w-xl text-xs sm:text-sm lg:text-base text-[#fbe9d0]/85 font-medium leading-relaxed"
            >
              Pick a distance, finish it on your schedule anywhere in India using Strava, Garmin, Apple Watch or NRC, and an authentic heavy metal finisher medal reaches your door.
            </motion.p>

            {/* ─── Interactive Distance Selector ("CHOOSE YOUR DISTANCE") ─── */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mt-5 w-full flex flex-col items-center lg:items-start"
            >
              <div className="flex items-center gap-2 mb-2">
                <Route className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-[0.68rem] sm:text-xs font-black uppercase tracking-widest text-[#90aead]">
                  CHOOSE YOUR DISTANCE
                </span>
                <span className="text-[0.6rem] font-bold text-[#fbe9d0]/60">
                  (Selected: <span className="text-amber-400 font-black">{selectedDistance}</span>)
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-2.5">
                {distances.map((dist) => {
                  const isSelected = selectedDistance === dist;
                  return (
                    <button
                      key={dist}
                      type="button"
                      onClick={() => setSelectedDistance(dist)}
                      className={`relative px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-gradient-to-r from-[#e64833] to-[#ea5a47] text-white shadow-[0_0_20px_rgba(230,72,51,0.6)] border border-amber-300/60 scale-105 z-10"
                          : "bg-[#172c34]/90 text-[#fbe9d0]/80 border border-white/10 hover:border-amber-400/50 hover:text-white hover:bg-[#1f3a45]"
                      }`}
                    >
                      {dist}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* ─── Pricing Callout Block ─── */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-5 flex flex-col items-center lg:items-start"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
                  {priceDisplay}
                </span>
                {compareAtNumeric && (
                  <span className="text-base sm:text-lg text-slate-400 line-through font-semibold">
                    ₹{compareAtNumeric}
                  </span>
                )}
                {savings && (
                  <span className="rounded-full bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-400/40 px-2.5 py-0.5 text-[0.68rem] font-black uppercase tracking-wider text-amber-300">
                    Save ₹{savings}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[0.7rem] sm:text-xs text-[#90aead] font-medium">
                Physical medal, e-certificate, and tracked courier — all included. No hidden charges.
              </p>
            </motion.div>

            {/* ─── High-Converting Action Row ─── */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mt-5 w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3"
            >
              {!isPast ? (
                <>
                  <RegisterCta
                    className="w-full sm:w-auto px-7 py-3.5 text-sm font-black uppercase tracking-wider shadow-[0_0_30px_rgba(230,72,51,0.55)] border border-amber-300/40"
                    signedInLabel={`Register for ${selectedDistance} →`}
                    signedOutLabel={`${priceLabel} →`}
                    slug={event.slug}
                    distance={selectedDistance}
                  />

                  {event.endsAt && (
                    <div className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-500/30 bg-[#172c34]/95 px-4 py-2.5 text-xs font-bold text-[#fbe9d0] shadow-md">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
                      </span>
                      <span className="text-amber-400 font-bold uppercase text-[0.68rem]">Closes in:</span>
                      <EventCountdown targetDate={event.endsAt} compact />
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href="/leaderboard"
                  className="btn btn-gold w-full sm:w-auto text-sm font-black uppercase tracking-wider"
                >
                  View Final Results & Leaderboard
                </Link>
              )}
            </motion.div>

            {/* Dashboard Proof Upload Shortcut */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-3.5 text-xs text-[#fbe9d0]/75"
            >
              <span>Already registered? </span>
              <Link
                href="/dashboard"
                className="font-bold text-amber-400 underline underline-offset-4 hover:text-amber-300 transition-colors"
              >
                Upload your GPS proof on Dashboard →
              </Link>
            </motion.div>

            {/* ─── Trust Checklist ─── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="mt-4 pt-4 border-t border-white/10 w-full flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-xs font-semibold text-[#fbe9d0]/90"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Free doorstep delivery across India</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0" />
                <span>Works with Strava, Garmin, Apple & NRC</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                <span>100% Solid Metal Finisher Medal</span>
              </div>
            </motion.div>

          </div>

          {/* ══════════════════════════════════════════════════════
              RIGHT COLUMN: UNIQUE IMAGE & MEDAL 3D SHOWCASE (5 cols)
             ══════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full mx-auto max-w-lg lg:max-w-none"
            >
              {/* Outer Glow Halo */}
              <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-tr from-[#e64833]/40 via-amber-500/20 to-[#244855]/40 blur-xl opacity-75 pointer-events-none" />

              {/* Showcase Container Box */}
              <div className="relative rounded-[2rem] overflow-hidden border-2 border-white/20 bg-[#0d171c]/95 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(230,72,51,0.25)] p-3 sm:p-4 backdrop-blur-2xl">
                
                {/* ─── Interactive View Switcher Tabs ─── */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#14242a] border border-white/10 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setViewMode("dual")}
                      className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.65rem] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        viewMode === "dual"
                          ? "bg-gradient-to-r from-[#e64833] to-[#ea5a47] text-white shadow-md"
                          : "text-[#fbe9d0]/70 hover:text-white"
                      }`}
                    >
                      <Layers className="h-3 w-3" />
                      <span>3D Dual View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("medal")}
                      className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.65rem] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        viewMode === "medal"
                          ? "bg-gradient-to-r from-amber-500 to-[#e64833] text-white shadow-md"
                          : "text-[#fbe9d0]/70 hover:text-white"
                      }`}
                    >
                      <Medal className="h-3 w-3" />
                      <span>Physical Medal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("poster")}
                      className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.65rem] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        viewMode === "poster"
                          ? "bg-gradient-to-r from-[#244855] to-[#172c34] text-white shadow-md"
                          : "text-[#fbe9d0]/70 hover:text-white"
                      }`}
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Event Poster</span>
                    </button>
                  </div>
                </div>

                {/* ─── Display Stage ─── */}
                <div className="relative aspect-[4/4.8] sm:aspect-[4/4.6] lg:aspect-[4/5] w-full rounded-2xl overflow-hidden bg-[#091014] border border-white/10">
                  
                  <AnimatePresence mode="wait">
                    {/* ── VIEW 1: DUAL LAYERED VIEW (MEDAL IN RELIEF OVER POSTER) ── */}
                    {viewMode === "dual" && (
                      <motion.div
                        key="dual"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative h-full w-full flex items-center justify-center overflow-hidden"
                      >
                        {/* Layer 1: Ambient Poster Backdrop */}
                        <div className="absolute inset-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={heroImg}
                            alt={`${event.name} artwork`}
                            className="h-full w-full object-cover object-center filter brightness-[0.45] blur-[1.5px] scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0d171c] via-[#0d171c]/40 to-transparent" />
                          <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#0d171c]/60 to-[#0d171c]/90" />
                        </div>

                        {/* Layer 2: Floating Physical Finisher Medal in Foreground */}
                        <div className="relative z-10 w-[68%] sm:w-[64%] lg:w-[70%] max-w-[280px] drop-shadow-[0_25px_35px_rgba(0,0,0,0.95)] hover:scale-105 transition-transform duration-500 ease-out">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/images/event-medal.png"
                            alt="RunnerUp Official Physical Finisher Medal"
                            className="w-full h-auto object-contain filter contrast-[1.08] brightness-[1.02]"
                          />

                          {/* Metallic Light Sheen Sweep Effect */}
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700" />
                        </div>

                        {/* Top-Left Telemetry Chip */}
                        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-full bg-[#101d22]/90 border border-amber-400/30 px-2.5 py-1 backdrop-blur-md shadow-lg">
                          <Trophy className="h-3 w-3 text-amber-400" />
                          <span className="text-[0.6rem] font-black uppercase tracking-wider text-[#fbe9d0]">
                            100% Solid Metal
                          </span>
                        </div>

                        {/* Top-Right Telemetry Chip */}
                        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 rounded-full bg-[#101d22]/90 border border-emerald-400/30 px-2.5 py-1 backdrop-blur-md shadow-lg">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          <span className="text-[0.6rem] font-black uppercase tracking-wider text-emerald-300">
                            Verified Finish
                          </span>
                        </div>

                        {/* Bottom Feature Banner */}
                        <div className="absolute bottom-3 inset-x-3 z-20 flex items-center justify-between rounded-xl bg-[#14242a]/95 border border-white/20 px-3 py-2 backdrop-blur-xl shadow-2xl">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-[#e64833]" />
                            <div>
                              <p className="text-[0.65rem] font-black text-white uppercase tracking-wider">
                                Doorstep Delivery Anywhere in India
                              </p>
                              <p className="text-[0.58rem] text-[#90aead]">
                                Shipped with tracking after GPS approval
                              </p>
                            </div>
                          </div>
                          <span className="text-[0.6rem] font-black uppercase text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full shrink-0">
                            Free
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {/* ── VIEW 2: EXCLUSIVE PHYSICAL MEDAL FOCUS ── */}
                    {viewMode === "medal" && (
                      <motion.div
                        key="medal"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.3 }}
                        className="relative h-full w-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#14242a] to-[#091014]"
                      >
                        {/* Radial Gold Backlight */}
                        <div className="absolute inset-0 bg-radial-at-c from-amber-500/20 via-transparent to-transparent pointer-events-none" />

                        {/* Big Centered Medal Photo */}
                        <div className="relative z-10 w-[78%] sm:w-[72%] max-w-[310px] drop-shadow-[0_30px_45px_rgba(0,0,0,0.9)] hover:scale-105 transition-transform duration-500">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/images/event-medal.png"
                            alt="RunnerUp Official Physical Finisher Medal"
                            className="w-full h-auto object-contain"
                          />
                        </div>

                        {/* Bottom Specs Chip */}
                        <div className="absolute bottom-3 inset-x-3 z-20 text-center rounded-xl bg-[#172c34]/90 border border-white/15 py-1.5 px-3">
                          <p className="text-[0.65rem] font-bold text-[#fbe9d0]">
                            Heavy Die-Cast Antique Finish · Woven Neck Ribbon · RUNNERUP Authenticity Seal
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* ── VIEW 3: FULL EVENT POSTER / ARTWORK ── */}
                    {viewMode === "poster" && (
                      <motion.div
                        key="poster"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.3 }}
                        className="relative h-full w-full"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={heroImg}
                          alt={`${event.name} official artwork`}
                          className="h-full w-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#091014] via-transparent to-black/20" />

                        <div className="absolute bottom-3 inset-x-3 z-20 flex items-center justify-between rounded-xl bg-[#14242a]/95 border border-white/15 px-3 py-2 backdrop-blur-md">
                          <div>
                            <p className="text-[0.7rem] font-black text-white uppercase tracking-wider">
                              {event.name}
                            </p>
                            <p className="text-[0.6rem] text-[#90aead]">
                              Official Pan-India Virtual Race
                            </p>
                          </div>
                          <span className="text-[0.62rem] font-black text-amber-400">
                            {event.date}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>

                {/* Subtext below showcase */}
                <div className="mt-2.5 px-1 flex items-center justify-between text-[0.65rem] font-medium text-[#90aead]">
                  <span>✨ Tap tabs above to inspect medal & artwork</span>
                  <span className="text-amber-400 font-bold">100% Physical Finisher Kit</span>
                </div>

              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
