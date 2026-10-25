"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { getEventMedalImage, type PublicEvent } from "../../data/events";
import { Medal3DViewer } from "./medal";
import { trackFbEvent } from "../../../lib/meta-pixel";

export function EventHero({ event, isPast }: { event: PublicEvent; isPast: boolean }) {
  // Extract available distances
  const rawDistances = event.distance.split(" / ").map((d) => d.trim()).filter(Boolean);
  const distances =
    rawDistances.length > 0
      ? rawDistances
      : ["1.6 km", "3.2 km", "5 km", "10 km", "21 km"];

  // Default selected distance (prefer 5 km)
  const defaultDist =
    distances.find((d) => d.toLowerCase().includes("5")) ?? distances[0];
  const [selectedDistance, setSelectedDistance] = useState(defaultDist);

  // Price parsing
  const isFree = event.price.toLowerCase().includes("free");
  const cleanPrice = event.price.replace(/^Rs\.\s*/i, "").trim();
  const numericPrice = parseInt(cleanPrice.replace(/[^\d]/g, ""), 10) || 499;
  const priceDisplay = isFree ? "Free" : `₹${numericPrice}`;

  // Strikethrough compare-at price & savings
  const compareAtNumeric = event.compareAtPrice
    ? parseInt(event.compareAtPrice.replace(/[^\d]/g, ""), 10)
    : numericPrice > 0
    ? numericPrice === 499
      ? 549
      : numericPrice >= 300
      ? numericPrice + 100
      : numericPrice + 50
    : 549;
  const savings =
    compareAtNumeric > numericPrice ? compareAtNumeric - numericPrice : 50;

  // Urgency Countdown (Price goes up in 2d 23h 59m)
  const [urgencyTime, setUrgencyTime] = useState({ days: 2, hours: 23, minutes: 59 });

  useEffect(() => {
    function calculate() {
      if (event.endsAt) {
        const target = new Date(event.endsAt).getTime();
        const diff = Math.max(0, target - Date.now());
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        setUrgencyTime({
          days: Math.max(0, days),
          hours: Math.max(0, hours),
          minutes: Math.max(0, minutes),
        });
      } else {
        const now = new Date();
        const hours = 23 - (now.getHours() % 24);
        const minutes = 59 - (now.getMinutes() % 60);
        setUrgencyTime({ days: 2, hours, minutes });
      }
    }
    calculate();
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);
  }, [event.endsAt]);

  useEffect(() => {
    trackFbEvent("ViewContent", {
      content_name: event.name,
      content_category: event.distance,
      value: numericPrice,
      currency: "INR",
    });
  }, [event.name, event.distance, numericPrice]);

  const registerHref = `/register?event=${encodeURIComponent(
    event.slug
  )}&distance=${encodeURIComponent(selectedDistance)}`;

  // Determine if this is the Air Force Day event
  const isAirForce =
    event.slug.includes("air-force") ||
    event.name.toLowerCase().includes("air force") ||
    event.slug === "indian-air-force-day-2026" ||
    event.slug === "indian-air-force-day-virtual-challenge";

  // Date eyebrow text
  const eyebrowDate = isAirForce
    ? "25-30 OCTOBER 2026"
    : event.date
    ? event.date.toUpperCase()
    : "25-30 OCTOBER 2026";

  // Medal image source - dynamically matches each event's authentic physical finisher medal
  const medalImageSrc = event.medalImageUrl || getEventMedalImage(event.slug);

  return (
    <section className="relative w-full overflow-hidden bg-black text-white isolate min-h-[92dvh] flex flex-col justify-center pt-24 pb-14 sm:pt-28 sm:pb-16 lg:pt-24 lg:pb-14 border-b border-white/10">
      {/* ─── Ambient Atmospheric Lighting ─── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        {/* Soft golden spotlight directly centered on the medal on right */}
        <div className="absolute top-1/2 right-[10%] lg:right-[15%] -translate-y-1/2 -z-10 h-[380px] w-[380px] sm:h-[500px] sm:w-[500px] rounded-full bg-gradient-to-tr from-[#f59e0b]/20 via-[#b45309]/10 to-transparent blur-[100px]" />
        {/* Top-left subtle ambient tone */}
        <div className="absolute top-1/4 left-1/4 -z-10 h-[300px] w-[300px] sm:h-[450px] sm:w-[450px] -translate-x-1/2 rounded-full bg-[#f59e0b]/5 blur-[120px]" />
      </div>

      <div className="container-page relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-14 items-center">
          
          {/* ══════════════════════════════════════════════════════
              LEFT COLUMN: HERO CONTENT & REGISTER ENGINE (7 cols)
             ══════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            
            {/* Top Pill Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#12161a]/90 px-3.5 sm:px-4 py-1.5 text-xs font-semibold backdrop-blur-md mb-4 sm:mb-6 shadow-sm"
            >
              <span className="text-[#f59e0b] font-bold tracking-wider">
                {eyebrowDate}
              </span>
              <span className="text-zinc-500">·</span>
              <span className="text-zinc-300 font-bold uppercase tracking-wider text-[0.7rem] sm:text-xs">
                RUN, WALK OR CYCLE
              </span>
            </motion.div>

            {/* Giant Stacked Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display font-black text-4xl xs:text-5xl sm:text-6xl md:text-[4.2rem] lg:text-[4.6rem] xl:text-[5.4rem] tracking-tight uppercase leading-[0.93] drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]"
            >
              {isAirForce ? (
                <>
                  <span className="block text-white">INDIAN AIR</span>
                  <span className="block text-white">FORCE DAY</span>
                  <span className="block text-[#f59e0b]">VIRTUAL</span>
                  <span className="block text-[#f59e0b]">CHALLENGE</span>
                </>
              ) : (
                <>
                  <span className="block text-white">{event.name.split(" ")[0] || event.name}</span>
                  {event.name.split(" ").length > 1 && (
                    <span className="block text-white">
                      {event.name.split(" ").slice(1, 3).join(" ")}
                    </span>
                  )}
                  <span className="block text-[#f59e0b]">VIRTUAL</span>
                  <span className="block text-[#f59e0b]">CHALLENGE</span>
                </>
              )}
            </motion.h1>

            {/* Subtitle / Event Description */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 sm:mt-5 max-w-xl text-sm sm:text-base lg:text-[1.05rem] text-zinc-300 font-medium leading-relaxed space-y-2.5"
            >
              {isAirForce ? (
                <>
                  <p className="text-zinc-200 font-semibold leading-relaxed">
                    Run with courage, rise with pride, and salute the heroes who guard our skies. Every kilometre is a tribute to their bravery and dedication.
                  </p>
                  <p className="text-[#f59e0b] font-black tracking-wide text-sm sm:text-base">
                    Run for Glory. Run for India. Jai Hind! 🇮🇳
                  </p>
                </>
              ) : (
                <p className="text-zinc-400 font-normal">
                  {event.description ||
                    "Pick a distance, finish it on your schedule anywhere in India, and an authentic heavy metal finisher medal reaches your door."}
                </p>
              )}
            </motion.div>

            {/* ── MOBILE-FIRST 3D MEDAL FLIP SHOWCASE ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.22 }}
              className="lg:hidden my-5 w-full flex flex-col items-center justify-center relative"
            >
              <Medal3DViewer slug={event.slug} eventName={event.name} size="mobile" isPast={isPast} />

              {/* Live Mobile Social Proof Counter */}
              <div className="mt-2.5 inline-flex items-center gap-1.5 text-[0.72rem] text-zinc-400 font-semibold">
                <span className="text-amber-400 font-bold">🔥 1,420+ Runners Joined</span>
                <span>·</span>
                <span className="text-emerald-400 font-bold">98% 5-Star Rating ⭐</span>
              </div>
            </motion.div>

            {/* Distance Selector */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mt-4 sm:mt-6 w-full flex flex-col items-center lg:items-start"
            >
              <div className="flex items-center justify-between w-full max-w-md lg:max-w-none mb-2 px-1">
                <span className="text-[0.68rem] sm:text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                  CHOOSE YOUR DISTANCE
                </span>
                <span className="text-[0.65rem] text-amber-400/90 font-semibold">
                  Tap to switch
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-2.5 w-full">
                {distances.map((dist) => {
                  const isSelected = selectedDistance === dist;
                  const isPopular = dist.includes("5");
                  return (
                    <button
                      key={dist}
                      type="button"
                      onClick={() => setSelectedDistance(dist)}
                      className={`relative px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/30 scale-[1.03] border border-amber-300"
                          : "bg-[#12161a] hover:bg-[#1b2127] text-zinc-300 hover:text-white border border-white/10 hover:border-zinc-500 active:scale-95"
                      }`}
                    >
                      <span>{dist}</span>
                      {isPopular && (
                        <span className={`text-[0.55rem] px-1.5 py-0.2 rounded-full font-black uppercase ${
                          isSelected ? "bg-black/25 text-black" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}>
                          Popular
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Pricing Callout Block */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6 flex flex-col items-center lg:items-start w-full"
            >
              <div className="flex items-baseline justify-center lg:justify-start gap-3 w-full">
                <span className="font-display font-black text-3xl sm:text-4xl lg:text-[2.6rem] text-white tracking-tight">
                  {priceDisplay}
                </span>
                {compareAtNumeric && (
                  <span className="text-base sm:text-lg text-zinc-500 line-through font-semibold">
                    ₹{compareAtNumeric}
                  </span>
                )}
                {savings && (
                  <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-xs font-black text-amber-300">
                    Save ₹{savings} (Early Bird)
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs sm:text-sm text-zinc-400 font-normal text-center lg:text-left">
                Solid Metal Medal, Digital Race Bib, QR Certificate & delivery across India included.
              </p>
            </motion.div>

            {/* CTA & Urgency Row */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mt-6 w-full flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5"
            >
              {!isPast ? (
                <>
                  <Link
                    href={registerHref}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#e64833] via-[#ff5e3a] to-[#d63b25] hover:brightness-110 text-white font-black text-sm sm:text-base px-8 py-3.5 sm:py-4 shadow-[0_0_30px_rgba(230,72,51,0.6)] active:scale-95 transition-all duration-200 cursor-pointer border border-amber-300/40"
                  >
                    <span>Register for {priceDisplay} · Claim Your Kit</span>
                    <ArrowRight className="h-4 w-4 stroke-[3]" />
                  </Link>

                  <div className="inline-flex items-center gap-2 text-xs sm:text-sm bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 backdrop-blur-md">
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                    <span className="text-zinc-400 font-medium">Price goes up in</span>
                    <span className="text-white font-bold tracking-tight">
                      {urgencyTime.days}d {urgencyTime.hours}h {urgencyTime.minutes}m
                    </span>
                  </div>
                </>
              ) : (
                <Link
                  href="/leaderboard"
                  className="rounded-full bg-[#f59e0b] hover:bg-[#d97706] text-black font-extrabold text-sm sm:text-base px-8 py-3.5 shadow-md"
                >
                  View Final Results & Leaderboard
                </Link>
              )}
            </motion.div>

            {/* Shortcut Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-3 text-xs sm:text-sm text-zinc-400"
            >
              <span>Already registered? </span>
              <Link
                href="/dashboard"
                className="font-bold text-[#f59e0b] hover:text-amber-300 underline underline-offset-4 transition-colors"
              >
                Upload your GPS proof on Dashboard →
              </Link>
            </motion.div>

            {/* Trust Checklist */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="mt-6 pt-5 border-t border-white/10 w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-semibold text-zinc-300"
            >
              <div className="flex items-center justify-center lg:justify-start gap-1.5 bg-white/5 rounded-xl py-2 px-2.5 border border-white/5">
                <Check className="h-3.5 w-3.5 text-amber-400 shrink-0 stroke-[2.5]" />
                <span className="text-[0.7rem] sm:text-xs">100% Solid Metal Medal</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-1.5 bg-white/5 rounded-xl py-2 px-2.5 border border-white/5">
                <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0 stroke-[2.5]" />
                <span className="text-[0.7rem] sm:text-xs">Digital Race Bib</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-1.5 bg-white/5 rounded-xl py-2 px-2.5 border border-white/5">
                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 stroke-[2.5]" />
                <span className="text-[0.7rem] sm:text-xs">Free Pan-India Delivery</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-1.5 bg-white/5 rounded-xl py-2 px-2.5 border border-white/5">
                <Check className="h-3.5 w-3.5 text-sky-400 shrink-0 stroke-[2.5]" />
                <span className="text-[0.7rem] sm:text-xs">Strava, NRC, Garmin</span>
              </div>
            </motion.div>

          </div>

          {/* ══════════════════════════════════════════════════════
              RIGHT COLUMN: INTERACTIVE 3D MEDAL PREVIEW (Desktop)
             ══════════════════════════════════════════════════════ */}
          <div className="hidden lg:flex lg:col-span-5 w-full items-center justify-center">
            <Medal3DViewer slug={event.slug} eventName={event.name} size="desktop" isPast={isPast} />
          </div>

        </div>
      </div>
    </section>
  );
}
