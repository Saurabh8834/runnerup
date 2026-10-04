"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useRef, useEffect, useState, useMemo } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  IndianRupee,
  Users,
  BadgeCheck,
  MapPin,
  Sparkles,
  Medal,
  Flame,
  Zap,
  Timer,
  ArrowRight,
} from "lucide-react";
import { getApiUrl } from "../../lib/api";
import { type ApiEvent, mapApiEventToPublic } from "../../lib/events-api";
import {
  pastEvents as staticPastEvents,
  publicEvents as staticUpcomingEvents,
  type PublicEvent,
} from "../data/events";

// Deterministic slot scarcity calculation
function getEventScarcity(slug: string) {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash |= 0;
  }
  const positive = Math.abs(hash);
  const percent = 78 + (positive % 18); // 78% to 95% booked
  const bibsLeft = 14 + (positive % 32); // 14 to 45 bibs left
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

/* ─── Open Race Card (Dark #090d16 Theme) ─── */
function OpenEventCard({ event, index = 0 }: { event: PublicEvent; index?: number }) {
  const hasBannerImage = Boolean(event.bannerImageUrl);
  const scarcity = useMemo(() => getEventScarcity(event.slug), [event.slug]);

  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 14 + (index * 6) % 24,
    minutes: 32,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 30, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#90aead]/20 bg-[#172c34] shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-[#e64833] hover:shadow-[0_12px_40px_rgba(230,72,51,0.25)]">
      {/* Banner / Poster — 65% Height */}
      <div
        className={`relative overflow-hidden ${
          hasBannerImage ? "h-64 sm:h-72 bg-[#14242a]" : "h-64 sm:h-72 bg-gradient-to-br from-[#244855] via-[#1b323b] to-[#14242a]"
        }`}
      >
        {event.bannerImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={`${event.name} banner`}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            src={event.bannerImageUrl}
          />
        ) : null}
        
        {hasBannerImage && (
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-[#172c34]/95 via-[#172c34]/40 to-transparent"
          />
        )}

        {/* Top Badges */}
        <div className="relative z-10 p-4 flex items-start justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e64833] px-3 py-1 text-[0.65rem] font-black uppercase tracking-wider text-white shadow-lg">
            <Flame className="h-3 w-3 animate-bounce fill-white" />
            <span>{scarcity.percent}% Booked</span>
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#90aead]/30 bg-[#14242a]/90 backdrop-blur-md px-3 py-1 text-[0.65rem] font-black uppercase tracking-wider text-[#fbe9d0] shadow-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span>Active Race</span>
          </span>
        </div>

        {/* Reward / Medal Highlight Strip */}
        <div className="absolute bottom-3.5 left-4 right-4 z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#90aead]/30 bg-[#14242a]/80 backdrop-blur-md px-3 py-1 text-xs font-bold text-[#fbe9d0] shadow-lg max-w-full">
            <Medal className="h-3.5 w-3.5 text-[#e64833] shrink-0" />
            <span className="truncate">{event.reward}</span>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex flex-1 flex-col p-5 sm:p-6 bg-[#172c34]">
        {/* Scarcity Progress Bar */}
        <div className="mb-4 space-y-1.5">
          <div className="flex items-center justify-between text-[0.68rem]">
            <span className="font-semibold text-[#e64833] flex items-center gap-1">
              <Zap className="h-3 w-3 text-[#e64833]" /> Only {scarcity.bibsLeft} Bibs Remaining
            </span>
            <span className="text-[#90aead] font-mono font-medium">
              {scarcity.percent}% filled
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-black/30 p-0.5 border border-[#90aead]/20">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${scarcity.percent}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-[#874f41] via-[#e64833] to-[#fbe9d0]"
            />
          </div>
        </div>

        {/* Title & Distance */}
        <h3 className="font-display font-black text-xl uppercase tracking-tight text-[#fbe9d0] transition-colors group-hover:text-[#e64833]">
          {event.name}
        </h3>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {event.distance.split(",").map((d) => (
            <span
              key={d}
              className="rounded-lg bg-[#244855] border border-[#90aead]/30 px-2.5 py-0.5 font-mono text-[0.68rem] font-bold text-[#fbe9d0]"
            >
              {d.trim()}
            </span>
          ))}
        </div>

        <p className="mt-3 flex-1 text-xs leading-relaxed text-[#90aead] line-clamp-2">
          {event.highlight}
        </p>

        {/* Countdown & Price Footer */}
        <div className="mt-4 pt-4 border-t border-[#90aead]/15 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[0.72rem] text-[#90aead]">
            <Timer className="h-3.5 w-3.5 text-[#e64833] shrink-0" />
            <span>Closes in:</span>
            <span className="font-mono font-bold text-[#fbe9d0]">
              {timeLeft.hours}h {String(timeLeft.minutes).padStart(2, "0")}m
            </span>
          </div>

          <div className="text-right">
            <span className="text-lg sm:text-xl font-black font-mono text-[#fbe9d0] flex items-center justify-end gap-0.5">
              <IndianRupee className="h-4 w-4 text-[#e64833]" />
              {event.price.replace(/^Rs\.\s*/, "").replace(/^₹/, "")}
            </span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-4 flex items-center gap-2.5">
          <Link
            className="flex-1 h-10 rounded-full border border-[#90aead]/30 bg-[#244855]/60 inline-flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#fbe9d0] backdrop-blur-md hover:bg-[#244855] transition-all"
            href={`/events/${event.slug}`}
          >
            <span>Details</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-[#90aead]" />
          </Link>

          <Link
            className="flex-1 h-10 rounded-full bg-gradient-to-r from-[#e64833] to-[#c93b27] inline-flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#fbe9d0] shadow-lg transition-transform hover:scale-105 active:scale-95 hover:brightness-110"
            href={`/register?event=${encodeURIComponent(event.slug)}`}
          >
            <span>Register</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ─── Archive Race Card (Warm Ivory #fbf6ee Theme) ─── */
function ArchiveEventCard({ event, index = 0 }: { event: PublicEvent; index?: number }) {
  const hasBannerImage = Boolean(event.bannerImageUrl);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#90aead]/20 bg-white shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-[#e64833] hover:shadow-2xl">
      {/* Banner / Poster — 65% Height */}
      <div className="h-64 sm:h-72 relative overflow-hidden bg-[#14242a]">
        {event.bannerImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={`${event.name} banner`}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            src={event.bannerImageUrl}
          />
        ) : null}
        
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
        />

        {/* Top Badges */}
        <div className="relative z-10 p-4 flex items-start justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 backdrop-blur-md px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Closed
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 backdrop-blur-md px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-emerald-400">
            <BadgeCheck className="h-3 w-3" />
            Verified
          </span>
        </div>

        {/* Reward / Medal Highlight Strip */}
        <div className="absolute bottom-3.5 left-4 right-4 z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-bold text-white shadow-lg max-w-full">
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
          <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-[#90aead]/20 bg-[#fbf6ee] p-3 text-center">
            {[
              { label: "Finishers", value: event.finishers, icon: Users },
              { label: "Verified", value: event.verifiedResults, icon: BadgeCheck },
              { label: "Cities", value: event.cities, icon: MapPin },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label}>
                <Icon className="mx-auto h-3.5 w-3.5 text-[#e64833]" />
                <p className="mt-1 text-sm font-black tracking-tight text-[#14242a] font-mono">
                  {typeof value === "number" ? value.toLocaleString("en-IN") : "—"}
                </p>
                <p className="text-[0.55rem] uppercase font-bold tracking-wider text-[#90aead]">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-[#90aead]/15 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[0.72rem] text-[#90aead]">
            <CalendarDays className="h-3.5 w-3.5 text-[#90aead] shrink-0" />
            <span>{event.date}</span>
          </div>

          <div className="text-right">
            <span className="text-lg sm:text-xl font-black font-mono text-[#14242a] flex items-center justify-end gap-0.5">
              <IndianRupee className="h-4 w-4 text-[#e64833]" />
              {event.price.replace(/^Rs\.\s*/, "").replace(/^₹/, "")}
            </span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-4 flex items-center gap-2.5">
          <Link
            className="flex-1 h-10 rounded-full border border-[#90aead]/20 bg-[#fbf6ee] inline-flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#14242a] hover:bg-[#f5ecdd] transition-all"
            href={`/events/${event.slug}`}
          >
            <span>View Recap</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-[#90aead]" />
          </Link>

          <Link
            className="flex-1 h-10 rounded-full border border-[#e64833]/30 bg-[#e64833]/10 inline-flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#e64833] hover:bg-[#e64833]/20 transition-all"
            href="/leaderboard"
          >
            <span>Results</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function EventsCatalog() {
  const [upcoming, setUpcoming] = useState<PublicEvent[]>(staticUpcomingEvents);
  const [past, setPast] = useState<PublicEvent[]>(staticPastEvents);
  const [source, setSource] = useState<"api" | "static">("static");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch(getApiUrl("/api/events?group=true"));
        if (!response.ok) return;
        const json = await response.json();
        const upcomingApi = (json.data?.upcoming ?? []) as ApiEvent[];
        const pastApi = (json.data?.past ?? []) as ApiEvent[];
        if (cancelled || (upcomingApi.length === 0 && pastApi.length === 0)) return;
        setUpcoming(upcomingApi.map((event) => mapApiEventToPublic(event, "upcoming")));
        setPast(pastApi.map((event) => mapApiEventToPublic(event, "past")));
        setSource("api");
      } catch {
        // keep static catalog
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-w-0">
      {/* ─── Section 2: OPEN RACES (DARK BACKGROUND #14242a) ─── */}
      <section className="relative pt-6 pb-16 sm:pt-8 sm:pb-20 bg-[#14242a] text-[#fbe9d0] overflow-hidden isolate border-b border-[#90aead]/15">
        <div aria-hidden className="pointer-events-none absolute top-1/2 left-10 -z-10 h-[350px] w-[350px] -translate-y-1/2 rounded-full bg-[#244855]/30 blur-[130px]" />

        <div className="container-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#90aead]/15 pb-5">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e64833]/40 bg-[#e64833]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#e64833]">
                REGISTRATION OPEN
              </span>
              <h2 className="mt-3 font-display font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-[#fbe9d0]">
                OPEN RACES & <span className="text-[#e64833]">CHALLENGES</span>
              </h2>
            </div>
            <p className="text-xs font-mono text-[#fbe9d0] bg-[#172c34] px-4 py-2 rounded-full border border-[#90aead]/20 shadow-sm w-fit">
              {upcoming.length} active race{upcoming.length === 1 ? "" : "s"}
              {source === "api" ? " · live server" : ""}
            </p>
          </div>

          {upcoming.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((event, i) => (
                <FadeIn key={event.slug} delay={i * 0.08}>
                  <OpenEventCard event={event} index={i} />
                </FadeIn>
              ))}
            </div>
          ) : (
            <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border border-[#90aead]/20 bg-[#172c34] px-6 py-14 text-center shadow-2xl">
              <Sparkles className="h-8 w-8 text-[#e64833]" />
              <p className="mt-3 text-base font-bold text-[#fbe9d0]">No open events right now</p>
              <p className="mt-1 text-xs text-[#90aead]">Check back soon for new race releases.</p>
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
