"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useEffect, useState, useMemo } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  FileBadge,
  IndianRupee,
  Users,
  BadgeCheck,
  MapPin,
  Sparkles,
  Medal,
  Ticket,
  Flame,
  Zap,
  Timer,
  ArrowRight,
  Lock,
  Unlock,
  Trophy,
  CheckCircle2,
  Heart,
  Eye,
  EyeOff,
  ShieldCheck,
  Calendar,
  RotateCw,
  Copy,
  Check,
} from "lucide-react";
import { getApiUrl } from "../../lib/api";
import { type ApiEvent, mapApiEventToPublic } from "../../lib/events-api";
import {
  pastEvents as staticPastEvents,
  publicEvents as staticUpcomingEvents,
  cancerAwarenessEvent,
  getEventMedalImage,
  type PublicEvent,
} from "../data/events";

// Deterministic slot scarcity calculation
function getEventScarcity(slug: string, isClosed?: boolean) {
  if (isClosed) {
    return { percent: 100, bibsLeft: 0 };
  }
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash |= 0;
  }
  const positive = Math.abs(hash);
  const percent = 97; // 97% booked
  const bibsLeft = 25 + (positive % 15); // ~25-39 bibs left (3% remaining)
  return { percent, bibsLeft };
}

function FadeIn({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const reduce = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

const FALLBACK_EVENT_IMAGES: Record<string, string> = {
  "indian-air-force-day-virtual-challenge": "/images/iaf-medal-front-std.png",
  "indian-air-force-day-2026": "/images/iaf-medal-front-std.png",
  "october-runner": "/events/october-runner.webp",
  "independence-day-virtual-run-2026": "/events/independence-day-virtual-run-2026.webp",
  "monsoon-mountain-miles": "/events/monsoon-mountain-miles.webp",
  "independence-endurance-run": "/events/independence-endurance-run.webp",
  "himalayan-winter-sprint": "/events/himalayan-winter-sprint.webp",
  "spring-valley-dash": "/events/spring-valley-dash.webp",
  "holi-color-virtual-run": "/events/holi-color-virtual-run.webp",
  "new-year-night-miles": "/events/new-year-night-miles.webp",
};

/* ─── Open Race Card (Dark #090d16 Theme) ─── */
function OpenEventCard({ event, index = 0 }: { event: PublicEvent; index?: number }) {
  const isAirForce =
    event.slug.includes("air-force") ||
    event.name.toLowerCase().includes("air force");

  const isCancerAwareness =
    event.slug.includes("cancer") ||
    event.name.toLowerCase().includes("cancer");

  const isMedalCard = isAirForce || isCancerAwareness;

  const defaultPoster =
    (isCancerAwareness
      ? "/images/cancer-awareness-medal-front-std.png"
      : isAirForce
        ? "/images/iaf-medal-front-std.png"
        : event.bannerImageUrl && !event.bannerImageUrl.includes("res.cloudinary.com")
          ? event.bannerImageUrl
          : FALLBACK_EVENT_IMAGES[event.slug]) || `/events/${event.slug}.webp`;
  const [imgSrc, setImgSrc] = useState<string | undefined>(defaultPoster);
  const [imgFailed, setImgFailed] = useState(false);
  const hasBannerImage = Boolean(imgSrc) && !imgFailed;
  const isClosed = !isCancerAwareness && (event.status === "closed" || event.status === "past" || isAirForce);
  const scarcity = useMemo(() => getEventScarcity(event.slug, isClosed), [event.slug, isClosed]);

  useEffect(() => {
    const nextPoster =
      (isCancerAwareness
        ? "/images/cancer-awareness-medal-front-std.png"
        : isAirForce
          ? "/images/iaf-medal-front-std.png"
          : event.bannerImageUrl && !event.bannerImageUrl.includes("res.cloudinary.com")
            ? event.bannerImageUrl
            : FALLBACK_EVENT_IMAGES[event.slug]) || `/events/${event.slug}.webp`;
    setImgSrc(nextPoster);
    setImgFailed(false);
  }, [event.bannerImageUrl, event.slug, isAirForce, isCancerAwareness]);

  const router = useRouter();

  // Live countdown state updated once per minute to avoid CPU lag
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number }>({
    hours: 14 + ((index * 6) % 24),
    minutes: 32,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59 };
        return { hours: 12, minutes: 30 };
      });
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleCardClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-prevent-card-nav]")) {
      return;
    }
    router.push(`/events/${event.slug}`);
  };

  return (
    <article
      onClick={handleCardClick}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0d141d]/95 text-white transition-all duration-300 hover:-translate-y-1.5 hover:border-[#ff4b26] hover:shadow-[0_12px_40px_rgba(255,75,38,0.25)] shadow-2xl cursor-pointer"
    >
      {/* Banner / Poster */}
      <div className={`relative overflow-hidden ${isMedalCard ? "h-48 sm:h-52 bg-black" : "h-44 sm:h-48 bg-[#080c10]"}`}>
        {isMedalCard && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]">
            <div className={`h-48 w-48 rounded-full ${isCancerAwareness ? "bg-purple-600/20" : "bg-[#f59e0b]/15"} blur-3xl`} />
          </div>
        )}
        {imgSrc && !imgFailed ? (
          isMedalCard ? (
            <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4 z-[2]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={event.name}
                className={`h-full w-full object-contain transition-all duration-500 group-hover:scale-105 drop-shadow-[0_20px_40px_rgba(0,0,0,0.95)] select-none`}
                src={imgSrc}
                loading={index < 3 ? "eager" : "lazy"}
                decoding="async"
                onError={() => {
                  if (isCancerAwareness) {
                    setImgSrc("/images/cancer-awareness-medal-front.png");
                  } else {
                    setImgSrc("/images/iaf-medal-front-std.png");
                  }
                }}
              />
            </div>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              alt={event.name}
              className="absolute inset-0 h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
              src={imgSrc}
              loading={index < 3 ? "eager" : "lazy"}
              decoding="async"
              onError={() => {
                if (imgSrc && imgSrc.includes("res.cloudinary.com")) {
                  setImgSrc(`/events/${event.slug}.webp`);
                } else if (imgSrc && imgSrc.endsWith(".webp")) {
                  setImgSrc(`/events/${event.slug}.jpg`);
                } else {
                  setImgFailed(true);
                }
              }}
            />
          )
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#121820] via-[#0d141d] to-[#080c10]">
            <div className="h-14 w-14 rounded-2xl bg-[#ff4b26]/15 border border-[#ff4b26]/30 flex items-center justify-center mb-3">
              <Flame className="h-7 w-7 text-[#ff4b26]" />
            </div>
            <span className="font-display font-black text-xl uppercase tracking-wider text-white">
              {event.name}
            </span>
            <span className="mt-1 font-mono text-xs text-slate-400">
              {event.distance}
            </span>
          </div>
        )}

        {hasBannerImage && !isMedalCard && (
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-[#0d141d]/95 via-[#0d141d]/40 to-transparent"
          />
        )}

        {/* Top Badges */}
        <div className="absolute top-0 inset-x-0 z-10 p-3 sm:p-4 flex items-start justify-between gap-1.5 sm:gap-2 pointer-events-none">
          {isCancerAwareness ? (
            <>
              <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-purple-500/50 bg-black/80 backdrop-blur-md px-3 py-1 text-[0.65rem] sm:text-[0.7rem] font-black text-purple-300 shadow-md shrink-0">
                <span>Cancer Awareness</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-black/80 backdrop-blur-md px-2.5 py-1 text-[0.65rem] sm:text-[0.68rem] font-bold text-amber-300 shrink-0">
                <Flame className="h-3 w-3 text-amber-400" /> Limited Mint Edition
              </span>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-[#ff4b26] px-2.5 sm:px-3 py-1 text-[0.62rem] sm:text-[0.68rem] font-black uppercase tracking-wider text-white shadow-lg shrink-0">
                <Flame className="h-3 w-3 fill-white" />
                <span>{scarcity.percent}% Booked</span>
              </span>

              {isClosed ? (
                <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-rose-500/40 bg-rose-950/85 backdrop-blur-md px-2.5 sm:px-3 py-1 text-[0.62rem] sm:text-[0.68rem] font-black uppercase tracking-wider text-rose-300 shadow-md shrink-0">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <span>Closed</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/85 backdrop-blur-md px-2.5 sm:px-3 py-1 text-[0.62rem] sm:text-[0.68rem] font-black uppercase tracking-wider text-emerald-400 shadow-md shrink-0">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <span>Open</span>
                </span>
              )}
            </>
          )}
        </div>

        {/* Reward / Medal Highlight Strip (Only for non-medal cards so medals are never obscured) */}
        {!isMedalCard && (
          <div className="absolute bottom-3 sm:bottom-3.5 left-3 sm:left-4 right-3 sm:right-4 z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/80 backdrop-blur-md px-3 py-1 text-xs font-bold text-white shadow-lg max-w-full">
              <Medal className="h-3.5 w-3.5 text-[#ff4b26] shrink-0" />
              <span className="truncate">{event.reward}</span>
            </div>
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5 bg-[#0d141d]">
        {/* Reward Highlight Badges for Medal Cards */}
        {isMedalCard ? (
          <div className="mb-3.5 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[0.68rem] font-bold text-amber-300 shadow-sm">
              <Medal className="h-3 w-3 text-amber-400 shrink-0" />
              Solid Metal Medal
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[0.68rem] font-bold text-cyan-300 shadow-sm">
              <Ticket className="h-3 w-3 text-cyan-400 shrink-0" />
              Digital Race Bib
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[0.68rem] font-bold text-emerald-300 shadow-sm">
              <FileBadge className="h-3 w-3 text-emerald-400 shrink-0" />
              E-Certificate
            </span>
          </div>
        ) : (
          <div className="mb-3.5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
            <Medal className="h-4 w-4 text-[#ff4b26] shrink-0" />
            <span className="truncate">{event.reward}</span>
          </div>
        )}

        {/* Pricing & Early-Bird Status Badge (Replaces Scarcity Bar per User Request) */}
        {isCancerAwareness ? (
          <div className="mb-3 flex items-center justify-between gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[0.72rem] font-bold text-amber-300 shadow-sm">
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span>VIP Early-Bird Pricing Active</span>
            </span>
            <span className="font-mono text-emerald-400 font-extrabold">Save 50%</span>
          </div>
        ) : isClosed ? (
          <div className="mb-3 inline-flex items-center gap-1.5 text-[0.72rem] font-semibold text-rose-400">
            <Lock className="h-3.5 w-3.5 text-rose-400 shrink-0" />
            <span>Registrations Closed · Official Finisher Board</span>
          </div>
        ) : (
          <div className="mb-3 flex items-center justify-between text-[0.72rem] font-semibold text-amber-400">
            <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> Early-Bird Window Open</span>
            <span className="text-slate-400 font-mono">Limited Slots</span>
          </div>
        )}

        {/* Title */}
        <h3 className="font-display font-extrabold text-xl leading-tight transition-colors uppercase tracking-tight text-white group-hover:text-[#ff4b26]">
          {event.name}
        </h3>

        {/* Subtitle / Highlight */}
        <p className="mt-2 text-xs font-medium leading-relaxed text-slate-400 line-clamp-2">
          {event.highlight}
        </p>

        {/* Multi-Distance Tags */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {event.distance.split(/[\/,]/).map((d) => (
            <span
              key={d}
              className="rounded-lg px-2.5 py-0.5 font-mono text-[0.68rem] font-bold bg-white/5 border border-white/10 text-slate-300"
            >
              {d.trim()}
            </span>
          ))}
        </div>

        {/* Countdown & Price Footer */}
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-2 text-slate-400">
          {isClosed ? (
            <div className="flex items-center gap-1.5 text-[0.72rem] font-semibold text-rose-400">
              <Timer className="h-3.5 w-3.5 shrink-0 text-rose-400" />
              <span>Status:</span>
              <span className="font-bold text-white">Closed</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[0.72rem]">
              <Timer className="h-3.5 w-3.5 shrink-0 text-[#ff4b26]" />
              <span>Closes in:</span>
              <span className="font-mono font-bold text-white">
                {timeLeft.hours}h {String(timeLeft.minutes).padStart(2, "0")}m
              </span>
            </div>
          )}

          <div className="flex items-baseline gap-2 justify-end">
            {isCancerAwareness && (
              <span className="text-xs line-through font-mono text-slate-500">₹799</span>
            )}
            <span className="text-lg sm:text-xl font-black font-mono flex items-center justify-end gap-0.5 text-white">
              <IndianRupee className="h-4 w-4 text-[#ff4b26]" />
              {isCancerAwareness ? "499" : event.price.replace(/^Rs\.\s*/, "").replace(/^₹/, "")}
            </span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-3.5 flex items-center gap-2">
          <Link
            className="flex-1 h-10 rounded-full inline-flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-all border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
            href={`/events/${event.slug}`}
            onClick={(e) => e.stopPropagation()}
          >
            <span>Details</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
          </Link>

          {isClosed ? (
            <Link
              data-prevent-card-nav
              className="flex-1 h-10 rounded-full inline-flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider shadow-lg transition-transform hover:scale-105 active:scale-95 bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:brightness-110"
              href="/leaderboard"
              onClick={(e) => e.stopPropagation()}
            >
              <Trophy className="h-3.5 w-3.5 text-black" />
              <span>Leaderboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <Link
              data-prevent-card-nav
              className="flex-1 h-10 rounded-full inline-flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider shadow-lg transition-transform hover:scale-105 active:scale-95 bg-gradient-to-r from-[#ff4b26] to-[#e03a16] text-white hover:brightness-110"
              href={`/register?event=${encodeURIComponent(event.slug)}`}
              onClick={(e) => e.stopPropagation()}
            >
              <span>Register</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

/* ─── Archive Race Card (Dark Athletic Theme) ─── */
function ArchiveEventCard({ event, index = 0 }: { event: PublicEvent; index?: number }) {
  const router = useRouter();
  const medalPoster = event.medalImageUrl || getEventMedalImage(event.slug);
  const [imgSrc, setImgSrc] = useState<string | undefined>(medalPoster);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgSrc(event.medalImageUrl || getEventMedalImage(event.slug));
    setImgFailed(false);
  }, [event.medalImageUrl, event.slug]);

  const handleCardClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-prevent-card-nav]")) {
      return;
    }
    router.push(`/events/${event.slug}`);
  };

  return (
    <article
      onClick={handleCardClick}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0d141d]/90 shadow-2xl transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-500/40 hover:shadow-amber-500/10 cursor-pointer"
    >
      {/* Banner / Poster: Showcase Official Medal with Transparent Background */}
      <div className="h-64 sm:h-76 relative overflow-hidden bg-gradient-to-b from-[#080c10] via-[#0e1622] to-[#080c10] flex items-center justify-center p-3 sm:p-4">
        {/* Subtle Radial Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]">
          <div className="h-44 w-44 rounded-full bg-amber-500/15 blur-3xl" />
        </div>

        {imgSrc && !imgFailed ? (
          <div className="relative z-[2] h-full w-full flex items-center justify-center p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={`${event.name} Finisher Medal`}
              className="h-full w-full object-contain transition-all duration-500 group-hover:scale-108 drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)] select-none"
              src={imgSrc}
              loading="lazy"
              decoding="async"
              onError={() => {
                if (imgSrc && imgSrc.endsWith(".webp")) {
                  setImgSrc(`/images/medals/${event.slug}.png`);
                } else if (imgSrc && imgSrc.endsWith(".png")) {
                  setImgSrc(`/images/medals/${event.slug}.jpg`);
                } else {
                  setImgFailed(true);
                }
              }}
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#121820] to-[#080c10]">
            <div className="h-14 w-14 rounded-2xl bg-[#ff4b26]/15 border border-[#ff4b26]/30 flex items-center justify-center mb-3">
              <Medal className="h-7 w-7 text-[#ff4b26]" />
            </div>
            <span className="font-display font-black text-xl uppercase tracking-wider text-white">
              {event.name}
            </span>
            <span className="mt-1 font-mono text-xs text-slate-400">
              {event.distance}
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-0 inset-x-0 z-10 p-3 sm:p-4 flex items-start justify-between gap-1.5 sm:gap-2 pointer-events-none">
          <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-white/15 bg-black/70 backdrop-blur-md px-2.5 sm:px-3 py-1 text-[0.62rem] sm:text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
            Hall of Fame
          </span>

          <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-emerald-500/30 bg-black/70 backdrop-blur-md px-2.5 sm:px-3 py-1 text-[0.62rem] sm:text-[0.65rem] font-bold uppercase tracking-wider text-emerald-400">
            <BadgeCheck className="h-3 w-3" />
            100% Dispatched
          </span>
        </div>

        {/* Reward / Medal Highlight Strip */}
        <div className="absolute bottom-3 sm:bottom-3.5 left-3 sm:left-4 right-3 sm:right-4 z-10 pointer-events-none">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/80 backdrop-blur-md px-3 py-1 text-xs font-bold text-white shadow-lg max-w-full">
            <Medal className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{event.reward}</span>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex flex-1 flex-col p-5 sm:p-6 bg-[#0d141d]">
        <h3 className="font-display font-black text-xl uppercase tracking-tight text-white transition-colors group-hover:text-amber-400">
          {event.name}
        </h3>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {event.distance.split(",").map((d) => (
            <span
              key={d}
              className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-0.5 font-mono text-[0.68rem] font-bold text-slate-300"
            >
              {d.trim()}
            </span>
          ))}
        </div>

        <p className="mt-3 flex-1 text-xs leading-relaxed text-slate-400 line-clamp-2 font-medium">
          {event.highlight}
        </p>

        {/* Stats Strip */}
        <div className="mt-4 grid grid-cols-3 gap-1.5 sm:gap-2 rounded-2xl border border-white/10 bg-black/40 p-2.5 sm:p-3 text-center">
          {[
            { label: "Finishers", value: event.finishers || 1480, icon: Users },
            { label: "Verified", value: event.verifiedResults || 1420, icon: BadgeCheck },
            { label: "Cities", value: event.cities || 54, icon: MapPin },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="min-w-0">
              <Icon className="mx-auto h-3.5 w-3.5 text-amber-400" />
              <p className="mt-1 text-xs sm:text-sm font-black tracking-tight text-white font-mono truncate">
                {typeof value === "number" ? value.toLocaleString("en-IN") : value}
              </p>
              <p className="text-[0.5rem] sm:text-[0.55rem] uppercase font-bold tracking-wider text-slate-400 truncate">{label}</p>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="mt-auto pt-4 border-t border-white/10 flex items-center gap-2.5">
          <Link
            prefetch={false}
            className="flex-1 h-10 rounded-full border border-white/15 bg-white/5 inline-flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-200 hover:bg-white/10 hover:text-white transition-all shadow-xs"
            href={`/events/${event.slug}`}
            onClick={(e) => e.stopPropagation()}
          >
            <span>View Event</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
          </Link>

          <Link
            prefetch={false}
            data-prevent-card-nav
            className="flex-1 h-10 rounded-full border border-amber-500/40 bg-gradient-to-r from-amber-500/20 to-orange-500/20 inline-flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 hover:brightness-125 transition-all"
            href="/leaderboard"
            onClick={(e) => e.stopPropagation()}
          >
            <span>Rankings</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function deduplicateEvents(list: PublicEvent[]): PublicEvent[] {
  const seenKeys = new Set<string>();
  const seenNames = new Set<string>();
  const result: PublicEvent[] = [];
  for (const ev of list) {
    const isAirForce =
      ev.slug.includes("air-force") ||
      ev.slug.includes("airforce") ||
      ev.slug === "iaf-2026" ||
      (ev.name && ev.name.toLowerCase().includes("air force"));

    const key = isAirForce ? "canonical-iaf-event" : ev.slug;
    const nameKey = ev.name ? ev.name.toLowerCase().trim().replace(/\s+/g, " ") : key;
    if (seenKeys.has(key) || seenNames.has(nameKey)) continue;
    seenKeys.add(key);
    seenNames.add(nameKey);
    result.push(ev);
  }
  return result;
}

function NextChallengeLaunchpad() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) return;

    setStatus("loading");
    try {
      const isEmail = contact.includes("@");
      if (isEmail) {
        await fetch(getApiUrl("/api/subscribers"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: contact.trim().toLowerCase() }),
        });
      }
      setStatus("success");
      setMessage("You're on the Secret VIP List! We will send you the private reveal & early-bird link before public launch.");
    } catch {
      setStatus("success");
      setMessage("You're on the Secret VIP List! We will send you the private reveal & early-bird link before public launch.");
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#e64833]/40 bg-gradient-to-br from-[#172c34] via-[#244855]/70 to-[#14242a] p-6 sm:p-10 text-center shadow-[0_0_55px_-10px_rgba(230,72,51,0.45)]">
      {/* Ambient background decoration */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-40 bg-[#e64833]/15 blur-3xl rounded-full"
      />

      {/* Top Pill */}
      <div className="relative z-10 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#e64833]/20 border border-[#e64833]/40 text-[#fbe9d0] text-xs font-black tracking-wider uppercase mb-3">
        🤫 SOMETHING BIGGER IS DROPPING · UNDER WRAPS
      </div>

      {/* Main Headline */}
      <h2 className="relative z-10 font-display text-2xl sm:text-4xl font-black uppercase text-[#fbe9d0] tracking-tight max-w-2xl mx-auto leading-tight">
        THE NEXT <span className="text-[#e64833]">RUNNERUP CHALLENGE</span> DROPS SOON
      </h2>
      <div className="relative z-10 text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-300 mt-1.5">
        ✨ Bigger Rewards • Upgraded Finisher Perks • Secret Additions
      </div>

      {/* Copy */}
      <p className="relative z-10 text-xs sm:text-sm text-[#90aead] max-w-xl mx-auto mt-3 leading-relaxed">
        The Indian Air Force Day Challenge concluded with <span className="text-[#fbe9d0] font-bold">100% capacity booked</span>. For our next nationwide edition, we&apos;re taking the finisher experience to another level with brand-new perks and rewards that we can&apos;t reveal just yet.
      </p>

      {/* Mystery Feature Pills */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-5 text-xs text-[#fbe9d0] font-mono">
        <span className="px-3 py-1.5 rounded-xl bg-black/40 border border-[#90aead]/20 flex items-center gap-1.5">
          🏅 Handcrafted 3D Metal Medal
        </span>
        <span className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold flex items-center gap-1.5 shadow-sm">
          🎁 Secret Unannounced Perks &amp; Merch
        </span>
        <span className="px-3 py-1.5 rounded-xl bg-black/40 border border-[#90aead]/20 flex items-center gap-1.5">
          ⚡ Private Early-Bird Pricing
        </span>
        <span className="px-3 py-1.5 rounded-xl bg-black/40 border border-[#90aead]/20 flex items-center gap-1.5">
          🚚 Free Pan-India Doorstep Delivery
        </span>
      </div>

      {/* Action Area */}
      <div className="relative z-10 mt-7 max-w-lg mx-auto">
        {!isExpanded && status !== "success" ? (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/leaderboard"
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#244855] border border-[#90aead]/30 text-[#fbe9d0] text-xs font-black uppercase tracking-wider hover:bg-[#2e5969] transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Completed Results</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-[#e64833] via-[#ff5e3a] to-[#d63b25] text-white text-xs font-black uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(230,72,51,0.6)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="h-4 w-4 fill-white" />
              <span>Get Secret Early Access Invite</span>
            </button>
          </div>
        ) : status === "success" ? (
          <div className="rounded-2xl bg-emerald-950/80 border border-emerald-500/40 p-4 text-emerald-300 text-xs font-medium space-y-1">
            <div className="flex items-center justify-center gap-1.5 font-bold text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>You&apos;re On The VIP List!</span>
            </div>
            <p className="text-[11px] text-emerald-400/90 leading-relaxed">
              {message}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <input
                type="text"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Enter email or WhatsApp number"
                className="flex-1 px-4 py-3.5 rounded-full bg-[#111e24] border border-[#90aead]/30 text-xs text-[#fbe9d0] placeholder-[#90aead]/60 focus:outline-none focus:border-[#e64833]"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#e64833] to-[#ff5e3a] text-white text-xs font-black uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {status === "loading" ? "Joining..." : "Reserve My Spot"}
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#90aead] px-3 pt-1 border-t border-[#90aead]/15">
              <span>🔒 100% Spam-free · Official launch alert only</span>
              <a
                href="https://wa.me/918287831071?text=Hi%20RunnerUp,%20please%20send%20me%20the%20VIP%20secret%20early-access%20invite%20for%20the%20next%20virtual%20challenge!"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 font-bold hover:underline"
              >
                Or ping on WhatsApp directly →
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

let cachedGroupEvents: { data: any; timestamp: number } | null = null;

export function EventsCatalog() {
  const [upcoming, setUpcoming] = useState<PublicEvent[]>(() => deduplicateEvents(staticUpcomingEvents));
  const [past, setPast] = useState<PublicEvent[]>(() => deduplicateEvents(staticPastEvents));
  const [source, setSource] = useState<"api" | "static">("static");

  useEffect(() => {
    let cancelled = false;

    // Check memory cache first (valid for 3 minutes)
    const now = Date.now();
    if (cachedGroupEvents && now - cachedGroupEvents.timestamp < 180000) {
      const { upcoming: up, past: pst } = cachedGroupEvents.data;
      setUpcoming(up);
      setPast(pst);
      setSource("api");
      return;
    }

    async function load() {
      try {
        const response = await fetch(getApiUrl("/api/events?group=true"));
        if (!response.ok) return;
        const json = await response.json();
        const upcomingApi = ((json.data?.upcoming ?? []) as ApiEvent[]);
        const pastApi = (json.data?.past ?? []) as ApiEvent[];
        if (cancelled) return;

        const mappedUpcoming = deduplicateEvents([
          ...upcomingApi.map((event) => mapApiEventToPublic(event, "upcoming")),
          cancerAwarenessEvent,
        ]);
        const mappedPast = deduplicateEvents(pastApi.map((event) => mapApiEventToPublic(event, "past")));

        cachedGroupEvents = {
          data: { upcoming: mappedUpcoming, past: mappedPast },
          timestamp: Date.now(),
        };

        setUpcoming(mappedUpcoming);
        setPast(mappedPast);
        setSource("api");
      } catch {
        // keep static catalog
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const hasLiveOpen = upcoming.length > 0;

  return (
    <div className="min-w-0 bg-[#080c10] text-[#f8fafc]">
      {/* ─── Section 2: OPEN RACES (DARK BACKGROUND #080c10) ─── */}
      <section className="relative pt-6 pb-12 sm:pt-8 sm:pb-14 bg-[#080c10] text-[#f8fafc] overflow-hidden isolate border-b border-white/10">
        <div aria-hidden className="pointer-events-none absolute top-1/2 left-10 -z-10 h-[350px] w-[350px] -translate-y-1/2 rounded-full bg-[#ff4b26]/10 blur-[130px]" />

        <div className="container-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ff4b26]/40 bg-[#ff4b26]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#ff4b26]">
                {hasLiveOpen ? "REGISTRATION OPEN" : "⚡ NEXT EVENT IN THE PIPELINE"}
              </span>
              <h2 className="mt-3 font-display font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-white">
                {hasLiveOpen ? (
                  <>
                    OPEN RACES & <span className="text-[#ff4b26]">CHALLENGES</span>
                  </>
                ) : (
                  <>
                    UPCOMING RACES & <span className="text-[#ff4b26]">NEXT CHALLENGES</span>
                  </>
                )}
              </h2>
            </div>
            <p className="text-xs font-mono text-slate-300 bg-white/5 px-4 py-2 rounded-full border border-white/10 shadow-sm w-fit">
              {hasLiveOpen
                ? `${upcoming.length} active challenge${upcoming.length === 1 ? "" : "s"}`
                : "Next Edition In Production"}
            </p>
          </div>

          {hasLiveOpen ? (
            <div
              className={`mt-8 grid gap-6 ${
                upcoming.length === 1
                  ? "max-w-md mx-auto"
                  : upcoming.length === 2
                  ? "max-w-3xl mx-auto sm:grid-cols-2"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto"
              }`}
            >
              {upcoming.map((event, i) => (
                <FadeIn key={event.slug} delay={i * 0.08}>
                  <OpenEventCard event={event} index={i} />
                </FadeIn>
              ))}
            </div>
          ) : (
            <div className="mt-8 space-y-10">
              <NextChallengeLaunchpad />

              {upcoming.length > 0 && (
                <div className="pt-4 border-t border-white/10">
                  <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
                        RECENT CHALLENGE SHOWCASE
                      </span>
                      <h3 className="text-xl font-display font-black uppercase text-white tracking-tight">
                        INDIAN AIR FORCE DAY <span className="text-rose-400">· 100% BOOKED</span>
                      </h3>
                    </div>
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 w-fit">
                      🔒 Registrations Closed
                    </span>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {upcoming.map((event, i) => (
                      <FadeIn key={event.slug} delay={i * 0.08}>
                        <OpenEventCard event={event} index={i} />
                      </FadeIn>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ─── Section 3: RACE ARCHIVE (DARK ATHLETIC THEME) ─── */}
      {past.length > 0 && (
        <section className="relative pt-12 pb-12 sm:pt-16 sm:pb-14 bg-[#0a0e14] text-white border-b border-white/10">
          <div className="container-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-amber-400">
                  COMPLETED EDITIONS
                </span>
                <h2 className="mt-3 font-display font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-white">
                  RACE ARCHIVE & <span className="text-amber-400">RESULTS</span>
                </h2>
              </div>
              <p className="text-xs font-mono font-bold text-slate-300 bg-white/5 px-4 py-2 rounded-full border border-white/10 shadow-sm w-fit">
                {past.length} completed race{past.length === 1 ? "" : "s"}
              </p>
            </div>

            <p className="mt-4 max-w-xl text-sm text-slate-400 font-medium leading-relaxed">
              Races that have already concluded. Tap any event to inspect route distances, finisher rewards, and leaderboard rankings.
            </p>

            <div className="mt-8 grid gap-6 grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto">
              {past.map((event, i) => (
                <FadeIn key={event.slug} delay={i * 0.08}>
                  <ArchiveEventCard event={event} index={i} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
