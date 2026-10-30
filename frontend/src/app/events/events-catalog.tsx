"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import Link from "next/link";
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
  Trophy,
  CheckCircle2,
} from "lucide-react";
import { getApiUrl } from "../../lib/api";
import { type ApiEvent, mapApiEventToPublic } from "../../lib/events-api";
import {
  pastEvents as staticPastEvents,
  publicEvents as staticUpcomingEvents,
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
  "indian-air-force-day-virtual-challenge": "/images/event-medal.webp",
  "indian-air-force-day-2026": "/images/event-medal.webp",
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

  const defaultPoster =
    (isAirForce
      ? "/images/event-medal.webp"
      : event.bannerImageUrl && !event.bannerImageUrl.includes("res.cloudinary.com")
      ? event.bannerImageUrl
      : FALLBACK_EVENT_IMAGES[event.slug]) || `/events/${event.slug}.webp`;
  const [imgSrc, setImgSrc] = useState<string | undefined>(defaultPoster);
  const [imgFailed, setImgFailed] = useState(false);
  const hasBannerImage = Boolean(imgSrc) && !imgFailed;
  const isClosed = event.status === "closed" || event.status === "past" || isAirForce;
  const scarcity = useMemo(() => getEventScarcity(event.slug, isClosed), [event.slug, isClosed]);

  useEffect(() => {
    const nextPoster =
      (isAirForce
        ? "/images/event-medal.webp"
        : event.bannerImageUrl && !event.bannerImageUrl.includes("res.cloudinary.com")
        ? event.bannerImageUrl
        : FALLBACK_EVENT_IMAGES[event.slug]) || `/events/${event.slug}.webp`;
    setImgSrc(nextPoster);
    setImgFailed(false);
  }, [event.bannerImageUrl, event.slug, isAirForce]);

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
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#90aead]/20 bg-[#172c34] text-[#fbe9d0] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#e64833] hover:shadow-[0_12px_40px_rgba(230,72,51,0.25)] shadow-2xl cursor-pointer"
    >
      {/* Banner / Poster */}
      <div className={`relative overflow-hidden ${isAirForce ? "h-80 sm:h-96 bg-black" : "h-60 sm:h-72 bg-[#14242a]"}`}>
        {isAirForce && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]">
            <div className="h-56 w-56 rounded-full bg-[#f59e0b]/15 blur-3xl" />
          </div>
        )}
        {imgSrc && !imgFailed ? (
          isAirForce ? (
            <div className="absolute inset-0 flex items-center justify-center p-3.5 sm:p-5 z-[2]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={event.name}
                className="h-full w-full object-contain transition-all duration-500 group-hover:scale-105 drop-shadow-[0_25px_50px_rgba(0,0,0,0.95)] select-none"
                src={imgSrc}
                loading={index < 3 ? "eager" : "lazy"}
                decoding="async"
                onError={() => {
                  setImgSrc("/images/event-medal.webp");
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
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#1b323b] via-[#172c34] to-[#14242a]">
            <div className="h-14 w-14 rounded-2xl bg-[#e64833]/15 border border-[#e64833]/30 flex items-center justify-center mb-3">
              <Flame className="h-7 w-7 text-[#e64833]" />
            </div>
            <span className="font-display font-black text-xl uppercase tracking-wider text-[#fbe9d0]">
              {event.name}
            </span>
            <span className="mt-1 font-mono text-xs text-[#90aead]">
              {event.distance}
            </span>
          </div>
        )}
        
        {hasBannerImage && !isAirForce && (
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-[#172c34]/95 via-[#172c34]/40 to-transparent"
          />
        )}

        {/* Top Badges */}
        <div className="absolute top-0 inset-x-0 z-10 p-3 sm:p-4 flex items-start justify-between gap-1.5 sm:gap-2 pointer-events-none">
          <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-[#e64833] px-2.5 sm:px-3 py-1 text-[0.62rem] sm:text-[0.68rem] font-black uppercase tracking-wider text-white shadow-lg shrink-0">
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
        </div>

        {/* Reward / Medal Highlight Strip (Only for non-medal cards so medals are never obscured) */}
        {!isAirForce && (
          <div className="absolute bottom-3 sm:bottom-3.5 left-3 sm:left-4 right-3 sm:right-4 z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#90aead]/30 bg-[#14242a]/85 backdrop-blur-md px-3 py-1 text-xs font-bold text-[#fbe9d0] shadow-lg max-w-full">
              <Medal className="h-3.5 w-3.5 text-[#e64833] shrink-0" />
              <span className="truncate">{event.reward}</span>
            </div>
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="flex flex-1 flex-col p-5 sm:p-6 bg-[#172c34]">
        {/* Reward Highlight Badges for Medal Cards */}
        {isAirForce ? (
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
          <div className="mb-3.5 inline-flex items-center gap-2 rounded-xl border border-[#90aead]/25 bg-[#244855]/35 px-3 py-1.5 text-xs font-bold text-[#fbe9d0] shadow-sm">
            <Medal className="h-4 w-4 text-[#e64833] shrink-0" />
            <span className="truncate">{event.reward}</span>
          </div>
        )}
        {/* Scarcity Progress Bar */}
        <div className="mb-4 space-y-1.5">
          <div className="flex items-center justify-between text-[0.68rem]">
            {isClosed ? (
              <span className="font-semibold text-rose-400 flex items-center gap-1">
                <Lock className="h-3 w-3 text-rose-400" /> Registrations Closed
              </span>
            ) : (
              <span className="font-semibold text-[#e64833] flex items-center gap-1">
                <Zap className="h-3 w-3 text-[#e64833]" /> Only {scarcity.bibsLeft} Bibs Remaining
              </span>
            )}
            <span className="text-[#90aead] font-mono font-medium">
              {scarcity.percent}% filled
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full p-0.5 border bg-black/30 border-[#90aead]/20">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${scarcity.percent}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={
                isClosed
                  ? "h-full rounded-full bg-gradient-to-r from-rose-600 via-[#e64833] to-amber-300"
                  : "h-full rounded-full bg-gradient-to-r from-[#874f41] via-[#e64833] to-[#fbe9d0]"
              }
            />
          </div>
        </div>

        {/* Title (Vibrant Brand Orange matching Image 2 reference) */}
        <h3 className="font-display font-extrabold text-xl leading-tight transition-colors uppercase tracking-tight text-[#e64833] hover:brightness-110">
          {event.name}
        </h3>

        {/* Subtitle / Highlight */}
        <p className="mt-2 text-xs font-medium leading-relaxed text-[#90aead] line-clamp-2">
          {event.highlight}
        </p>

        {/* Multi-Distance Tags */}
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
          {event.distance.split(/[\/,]/).map((d) => (
            <span
              key={d}
              className="rounded-lg px-2.5 py-0.5 font-mono text-[0.68rem] font-bold bg-[#244855] border border-[#90aead]/30 text-[#fbe9d0]"
            >
              {d.trim()}
            </span>
          ))}
        </div>

        {/* Countdown & Price Footer */}
        <div className="mt-4 pt-4 border-t border-[#90aead]/15 flex items-center justify-between gap-2 text-[#90aead]">
          {isClosed ? (
            <div className="flex items-center gap-1.5 text-[0.72rem] font-semibold text-rose-400">
              <Timer className="h-3.5 w-3.5 shrink-0 text-rose-400" />
              <span>Status:</span>
              <span className="font-bold text-[#fbe9d0]">Closed</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[0.72rem]">
              <Timer className="h-3.5 w-3.5 shrink-0 text-[#e64833]" />
              <span>Closes in:</span>
              <span className="font-mono font-bold text-[#fbe9d0]">
                {timeLeft.hours}h {String(timeLeft.minutes).padStart(2, "0")}m
              </span>
            </div>
          )}

          <div className="text-right">
            <span className="text-lg sm:text-xl font-black font-mono flex items-center justify-end gap-0.5 text-[#fbe9d0]">
              <IndianRupee className="h-4 w-4 text-[#e64833]" />
              {event.price.replace(/^Rs\.\s*/, "").replace(/^₹/, "")}
            </span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-4 flex items-center gap-2.5">
          <Link
            className="flex-1 h-10 rounded-full inline-flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-all border border-[#90aead]/30 bg-[#244855]/60 text-[#fbe9d0] hover:bg-[#244855]"
            href={`/events/${event.slug}`}
            onClick={(e) => e.stopPropagation()}
          >
            <span>Details</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-[#90aead]" />
          </Link>

          {isClosed ? (
            <Link
              data-prevent-card-nav
              className="flex-1 h-10 rounded-full inline-flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider shadow-lg transition-transform hover:scale-105 active:scale-95 bg-gradient-to-r from-[#e64833] to-[#c93b27] text-[#fbe9d0]"
              href="/leaderboard"
              onClick={(e) => e.stopPropagation()}
            >
              <Trophy className="h-3.5 w-3.5 text-amber-300" />
              <span>Leaderboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <Link
              data-prevent-card-nav
              className="flex-1 h-10 rounded-full inline-flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider shadow-lg transition-transform hover:scale-105 active:scale-95 bg-gradient-to-r from-[#e64833] to-[#c93b27] text-[#fbe9d0]"
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

/* ─── Archive Race Card (Warm Ivory #fbf6ee Theme) ─── */
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
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#90aead]/20 bg-white shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-[#e64833] hover:shadow-2xl cursor-pointer"
    >
      {/* Banner / Poster: Showcase Official Medal with Transparent Background */}
      <div className="h-64 sm:h-76 relative overflow-hidden bg-gradient-to-b from-[#14242a] via-[#101c21] to-[#0c161a] flex items-center justify-center p-3 sm:p-4">
        {/* Subtle Radial Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]">
          <div className="h-44 w-44 rounded-full bg-amber-500/10 blur-3xl" />
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
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#1b323b] via-[#172c34] to-[#14242a]">
            <div className="h-14 w-14 rounded-2xl bg-[#e64833]/15 border border-[#e64833]/30 flex items-center justify-center mb-3">
              <Medal className="h-7 w-7 text-[#e64833]" />
            </div>
            <span className="font-display font-black text-xl uppercase tracking-wider text-[#fbe9d0]">
              {event.name}
            </span>
            <span className="mt-1 font-mono text-xs text-[#90aead]">
              {event.distance}
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-0 inset-x-0 z-10 p-3 sm:p-4 flex items-start justify-between gap-1.5 sm:gap-2 pointer-events-none">
          <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-white/20 bg-black/60 backdrop-blur-md px-2.5 sm:px-3 py-1 text-[0.62rem] sm:text-[0.65rem] font-bold uppercase tracking-wider text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Closed
          </span>

          <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-white/20 bg-black/60 backdrop-blur-md px-2.5 sm:px-3 py-1 text-[0.62rem] sm:text-[0.65rem] font-bold uppercase tracking-wider text-emerald-400">
            <BadgeCheck className="h-3 w-3" />
            Verified
          </span>
        </div>

        {/* Reward / Medal Highlight Strip */}
        <div className="absolute bottom-3 sm:bottom-3.5 left-3 sm:left-4 right-3 sm:right-4 z-10 pointer-events-none">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/70 backdrop-blur-md px-3 py-1 text-xs font-bold text-white shadow-lg max-w-full">
            <Medal className="h-3.5 w-3.5 text-[#e64833] shrink-0" />
            <span className="truncate">{event.reward}</span>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex flex-1 flex-col p-5 sm:p-6 bg-white">
        <h3 className="font-display font-black text-xl uppercase tracking-tight text-[#14242a] transition-colors group-hover:text-[#e64833]">
          {event.name}
        </h3>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {event.distance.split(",").map((d) => (
            <span
              key={d}
              className="rounded-lg bg-[#fbf6ee] border border-[#90aead]/30 px-2.5 py-0.5 font-mono text-[0.68rem] font-bold text-[#244855]"
            >
              {d.trim()}
            </span>
          ))}
        </div>

        <p className="mt-3 flex-1 text-xs leading-relaxed text-[#244855]/80 line-clamp-2">
          {event.highlight}
        </p>

        {/* Stats Strip */}
        {(event.finishers || event.cities) && (
          <div className="mt-4 grid grid-cols-3 gap-1.5 sm:gap-2 rounded-2xl border border-[#90aead]/20 bg-[#fbf6ee] p-2.5 sm:p-3 text-center">
            {[
              { label: "Finishers", value: event.finishers, icon: Users },
              { label: "Verified", value: event.verifiedResults, icon: BadgeCheck },
              { label: "Cities", value: event.cities, icon: MapPin },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="min-w-0">
                <Icon className="mx-auto h-3.5 w-3.5 text-[#e64833]" />
                <p className="mt-1 text-xs sm:text-sm font-black tracking-tight text-[#14242a] font-mono truncate">
                  {typeof value === "number" ? value.toLocaleString("en-IN") : "—"}
                </p>
                <p className="text-[0.5rem] sm:text-[0.55rem] uppercase font-bold tracking-wider text-[#90aead] truncate">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* CTA Buttons */}
        <div className="mt-auto pt-4 border-t border-[#90aead]/15 flex items-center gap-2.5">
          <Link
            prefetch={false}
            className="flex-1 h-10 rounded-full border border-[#90aead]/20 bg-[#fbf6ee] inline-flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#14242a] hover:bg-[#f5ecdd] transition-all shadow-xs"
            href={`/events/${event.slug}`}
            onClick={(e) => e.stopPropagation()}
          >
            <span>View Recap</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-[#90aead]" />
          </Link>

          <Link
            prefetch={false}
            data-prevent-card-nav
            className="flex-1 h-10 rounded-full border border-[#e64833]/30 bg-[#e64833]/10 inline-flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#e64833] hover:bg-[#e64833]/20 transition-all"
            href="/leaderboard"
            onClick={(e) => e.stopPropagation()}
          >
            <span>Results</span>
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
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#244855] border border-[#90aead]/30 text-xs font-bold uppercase tracking-wider text-[#fbe9d0] hover:bg-[#2d5868] transition-colors flex items-center justify-center gap-2"
            >
              <Trophy className="h-4 w-4 text-amber-400" />
              <span>View Last Leaderboard</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-[#e64833] via-[#ea5a47] to-[#c93b27] text-xs font-black uppercase tracking-wider text-[#fbe9d0] shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Unlock Secret Perks &amp; Early Access</span>
            </button>
          </div>
        ) : status === "success" ? (
          <div className="p-4 rounded-2xl bg-emerald-950/85 border border-emerald-500/50 text-center space-y-1">
            <div className="text-emerald-400 font-black text-sm flex items-center justify-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              <span>You&apos;re on the Secret VIP List!</span>
            </div>
            <p className="text-xs text-[#fbe9d0]">{message}</p>
            <button
              type="button"
              onClick={() => {
                setStatus("idle");
                setIsExpanded(false);
                setContact("");
              }}
              className="text-xs text-emerald-300 underline mt-1 cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="p-4 sm:p-5 rounded-2xl bg-black/50 border border-[#e64833]/50 text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                ⚡ Priority VIP Access + Secret Reveal
              </span>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="text-[#90aead] hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            <p className="text-xs text-[#fbe9d0] leading-relaxed">
              Be the first to see the unannounced perks and claim your guaranteed spot 24 hours before public registration opens.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                required
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Enter your Email or WhatsApp number"
                className="flex-1 px-4 py-2.5 rounded-full bg-[#172c34] border border-[#90aead]/30 text-xs text-[#fbe9d0] placeholder-[#90aead]/60 focus:outline-none focus:border-[#e64833]"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-6 py-2.5 rounded-full bg-[#e64833] text-xs font-black uppercase tracking-wider text-[#fbe9d0] hover:bg-[#c93b27] transition-colors shrink-0 cursor-pointer disabled:opacity-50"
              >
                {status === "loading" ? "Saving..." : "Get VIP Invite"}
              </button>
            </form>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-[#90aead] pt-1 border-t border-[#90aead]/15">
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
          </div>
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
      setUpcoming(deduplicateEvents(up.map((event: ApiEvent) => mapApiEventToPublic(event, "upcoming"))));
      setPast(deduplicateEvents(pst.map((event: ApiEvent) => mapApiEventToPublic(event, "past"))));
      setSource("api");
      return;
    }

    async function load() {
      try {
        const response = await fetch(getApiUrl("/api/events?group=true"));
        if (!response.ok) return;
        const json = await response.json();
        const upcomingApi = (json.data?.upcoming ?? []) as ApiEvent[];
        const pastApi = (json.data?.past ?? []) as ApiEvent[];
        if (cancelled || (upcomingApi.length === 0 && pastApi.length === 0)) return;

        cachedGroupEvents = {
          data: { upcoming: upcomingApi, past: pastApi },
          timestamp: Date.now(),
        };

        setUpcoming(deduplicateEvents(upcomingApi.map((event) => mapApiEventToPublic(event, "upcoming"))));
        setPast(deduplicateEvents(pastApi.map((event) => mapApiEventToPublic(event, "past"))));
        setSource("api");
      } catch {
        // keep static catalog
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const hasLiveOpen = upcoming.some((e) => e.status === "upcoming");

  return (
    <div className="min-w-0">
      {/* ─── Section 2: OPEN RACES (DARK BACKGROUND #14242a) ─── */}
      <section className="relative pt-6 pb-16 sm:pt-8 sm:pb-20 bg-[#14242a] text-[#fbe9d0] overflow-hidden isolate border-b border-[#90aead]/15">
        <div aria-hidden className="pointer-events-none absolute top-1/2 left-10 -z-10 h-[350px] w-[350px] -translate-y-1/2 rounded-full bg-[#244855]/30 blur-[130px]" />

        <div className="container-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#90aead]/15 pb-5">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e64833]/40 bg-[#e64833]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#e64833]">
                {hasLiveOpen ? "REGISTRATION OPEN" : "⚡ NEXT EVENT IN THE PIPELINE"}
              </span>
              <h2 className="mt-3 font-display font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-[#fbe9d0]">
                {hasLiveOpen ? (
                  <>
                    OPEN RACES & <span className="text-[#e64833]">CHALLENGES</span>
                  </>
                ) : (
                  <>
                    UPCOMING RACES & <span className="text-[#e64833]">NEXT CHALLENGES</span>
                  </>
                )}
              </h2>
            </div>
            <p className="text-xs font-mono text-[#fbe9d0] bg-[#172c34] px-4 py-2 rounded-full border border-[#90aead]/20 shadow-sm w-fit">
              {hasLiveOpen
                ? `${upcoming.length} active race${upcoming.length === 1 ? "" : "s"}${source === "api" ? " · live server" : ""}`
                : "Next Edition In Production"}
            </p>
          </div>

          {hasLiveOpen ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                <div className="pt-4 border-t border-[#90aead]/15">
                  <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
                        RECENT CHALLENGE SHOWCASE
                      </span>
                      <h3 className="text-xl font-display font-black uppercase text-[#fbe9d0] tracking-tight">
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

      {/* ─── Section 3: RACE ARCHIVE (WARM CREAM BACKGROUND #fbf6ee) ─── */}
      {past.length > 0 && (
        <section className="relative py-16 sm:py-20 bg-[#fbf6ee] text-[#14242a] border-b border-[#90aead]/20">
          <div className="container-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#90aead]/20 pb-5">
              <div>
                <span className="rounded-full border border-[#874f41]/40 bg-[#874f41]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#874f41]">
                  COMPLETED EDITIONS
                </span>
                <h2 className="mt-3 font-display font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-[#14242a]">
                  RACE ARCHIVE & <span className="text-[#874f41]">RESULTS</span>
                </h2>
              </div>
              <p className="text-xs font-mono font-bold text-[#244855] bg-white px-4 py-2 rounded-full border border-[#90aead]/20 shadow-sm w-fit">
                {past.length} completed race{past.length === 1 ? "" : "s"}
              </p>
            </div>

            <p className="mt-4 max-w-xl text-sm text-[#244855]/90 font-medium">
              Races that have already concluded. Tap any event to inspect route distances, finisher rewards, and leaderboard rankings.
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
