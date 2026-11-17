"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  FileBadge,
  Flame,
  Lock,
  Medal,
  Sparkles,
  Ticket,
  Timer,
  Trophy,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { PublicEvent } from "../data/events";
import { publicEvents as staticUpcoming, cancerAwarenessEvent, kineticRunEvent } from "../data/events";

// Deterministic realistic slot scarcity calculation based on event slug & date
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

function EventCard({ event, index }: { event: PublicEvent; index: number }) {
  const slug = (event.slug || "").toLowerCase();
  const name = ((event.name || (event as any).title || "") as string).toLowerCase();

  const isKineticRun =
    slug.includes("kinetic") ||
    name.includes("kinetic") ||
    slug.includes("krun");

  const isAirForce =
    slug.includes("air-force") ||
    slug.includes("airforce") ||
    slug.includes("iaf") ||
    name.includes("air force");

  const isCancerAwareness =
    slug.includes("cancer") ||
    name.includes("cancer") ||
    slug.includes("ncad");

  const isMedalCard = true; // Every RunnerUp challenge awards a handcrafted die-cast metal medal

  const resolvePoster = (slug: string, bannerUrl?: string) => {
    if (isKineticRun) return "/images/kinetic-run-medal-card.webp";
    if (isCancerAwareness) return "/images/cancer-awareness-medal-front.webp";
    if (isAirForce) return "/images/iaf-medal-front-card.webp";
    if (bannerUrl && !bannerUrl.includes("res.cloudinary.com") && !bannerUrl.endsWith("-4k.png")) return bannerUrl;
    return `/events/${slug}.webp`;
  };

  const initialImage = resolvePoster(event.slug, event.bannerImageUrl);

  const [imgSrc, setImgSrc] = useState(initialImage);
  const [imgFailed, setImgFailed] = useState(false);
  const isClosed = !isKineticRun && (isCancerAwareness || event.status === "closed" || event.status === "past" || isAirForce);
  const scarcity = useMemo(() => getEventScarcity(event.slug, isClosed), [event.slug, isClosed]);

  useEffect(() => {
    setImgSrc(resolvePoster(event.slug, event.bannerImageUrl));
    setImgFailed(false);
  }, [event.bannerImageUrl, event.slug, isAirForce, isCancerAwareness, isKineticRun]);

  const router = useRouter();

  // Live countdown state updated once per minute to prevent CPU thrashing
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
      className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0d141d]/95 text-[#f8fafc] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#ff4b26]/60 hover:shadow-[0_16px_50px_rgba(255,75,38,0.25)] shadow-2xl cursor-pointer"
    >
      {/* Banner / Poster - Generous Height with 100% Unclipped Medal Display */}
      <div className="relative overflow-hidden h-72 sm:h-80 bg-gradient-to-b from-[#141d29]/80 via-[#0d141d] to-[#080c10]">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]">
          <div className={`h-56 w-56 rounded-full ${isCancerAwareness ? "bg-purple-600/25" : isKineticRun ? "bg-orange-500/20" : "bg-amber-500/15"} blur-3xl`} />
        </div>

        {imgSrc && !imgFailed ? (
          <div className="absolute inset-0 flex items-center justify-center p-2.5 sm:p-4 z-[2]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={event.name}
              className={`h-full w-auto max-h-full max-w-full object-contain transition-all duration-500 group-hover:scale-105 drop-shadow-[0_25px_50px_rgba(0,0,0,0.95)] select-none ${isKineticRun ? "scale-105 sm:scale-100" : ""}`}
              src={imgSrc}
              loading={index < 3 ? "eager" : "lazy"}
              decoding="async"
              onError={() => {
                if (isKineticRun) {
                  setImgSrc("/images/kinetic-run-medal-card.png");
                } else if (isCancerAwareness) {
                  setImgSrc("/images/cancer-awareness-medal-front.png");
                } else {
                  setImgSrc("/images/iaf-medal-front.png");
                }
              }}
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#141d29] to-[#080c10]">
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

        {/* Top Badges */}
        <div className="absolute top-0 inset-x-0 z-10 p-3 sm:p-4 flex items-start justify-between gap-1.5 sm:gap-2 pointer-events-none">
          {isKineticRun ? (
            <>
              <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-amber-500/50 bg-[#1e1308]/90 backdrop-blur-md px-3 py-1 text-[0.65rem] sm:text-[0.7rem] font-black text-amber-300 shadow-md shrink-0">
                <span>⚡ Kinetic Run</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/50 bg-emerald-950/85 backdrop-blur-md px-2.5 py-1 text-[0.65rem] sm:text-[0.68rem] font-bold text-emerald-300 shadow-md shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live &amp; Open
              </span>
            </>
          ) : isCancerAwareness ? (
            <>
              <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-purple-500/50 bg-[#14242a]/90 backdrop-blur-md px-3 py-1 text-[0.65rem] sm:text-[0.7rem] font-black text-purple-300 shadow-md shrink-0">
                <span>🎗️ Cancer Awareness</span>
              </span>
              <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-rose-500/40 bg-rose-950/85 backdrop-blur-md px-2.5 sm:px-3 py-1 text-[0.62rem] sm:text-[0.68rem] font-black uppercase tracking-wider text-rose-300 shadow-md shrink-0">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span>Closed</span>
              </span>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-white/20 bg-black/80 backdrop-blur-md px-3 py-1 text-[0.65rem] sm:text-[0.7rem] font-black text-slate-300 shadow-md shrink-0">
                <span>Indian Air Force Day</span>
              </span>
              <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-rose-500/40 bg-rose-950/85 backdrop-blur-md px-2.5 sm:px-3 py-1 text-[0.62rem] sm:text-[0.68rem] font-black uppercase tracking-wider text-rose-300 shadow-md shrink-0">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span>Closed</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="flex flex-1 flex-col p-6">
        {/* Reward Highlight Badges for Medal Cards */}
        {isMedalCard ? (
          <div className="mb-3.5 grid grid-cols-3 gap-1.5">
            <span className="inline-flex items-center justify-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-1.5 py-1 text-[0.65rem] sm:text-[0.68rem] font-bold text-amber-300 shadow-sm truncate">
              <Medal className="h-3 w-3 text-amber-400 shrink-0" />
              <span className="truncate">Solid Medal</span>
            </span>
            <span className="inline-flex items-center justify-center gap-1 rounded-lg border border-sky-500/30 bg-sky-500/10 px-1.5 py-1 text-[0.65rem] sm:text-[0.68rem] font-bold text-sky-300 shadow-sm truncate">
              <Ticket className="h-3 w-3 text-sky-400 shrink-0" />
              <span className="truncate">Digital Bib</span>
            </span>
            <span className="inline-flex items-center justify-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-1 text-[0.65rem] sm:text-[0.68rem] font-bold text-emerald-300 shadow-sm truncate">
              <FileBadge className="h-3 w-3 text-emerald-400 shrink-0" />
              <span className="truncate">E-Certificate</span>
            </span>
          </div>
        ) : (
          <div className="mb-3.5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
            <Medal className="h-4 w-4 text-[#ff4b26] shrink-0" />
            <span className="truncate">{event.reward}</span>
          </div>
        )}
        {/* Scarcity / Official Status Bar (Seats Fill Bar Removed for Kinetic Run per User Request) */}
        {isKineticRun ? (
          <div className="mb-3 flex items-center justify-between gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[0.72rem] font-bold text-amber-300 shadow-sm">
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span>Official 3D Metal Finisher Trophy</span>
            </span>
            <span className="font-mono text-emerald-400 font-extrabold">Open Challenge</span>
          </div>
        ) : (
          <div className="mb-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#ff4b26] flex items-center gap-1">
                {isClosed ? (
                  <>
                    <Lock className="h-3.5 w-3.5 text-[#ff4b26]" /> Registrations Closed
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5 fill-[#ff4b26]" /> Only {scarcity.bibsLeft} Bibs Remaining
                  </>
                )}
              </span>
              <span className="text-slate-400 font-mono text-[0.72rem]">
                {scarcity.percent}% filled
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full p-0.5 border bg-black/40 border-white/10">
              <div
                style={{ width: `${scarcity.percent}%` }}
                className="h-full rounded-full bg-gradient-to-r from-orange-600 to-[#ff4b26] transition-all duration-500"
              />
            </div>
          </div>
        )}

        {/* Title */}
        <h3 className="font-display font-extrabold text-xl sm:text-2xl leading-tight transition-colors uppercase tracking-tight text-white group-hover:text-[#ff4b26] min-h-[3.6rem] sm:min-h-[4.2rem] flex items-center">
          {event.name}
        </h3>

        {/* Subtitle / Highlight */}
        <p className="mt-2 text-xs sm:text-sm font-medium leading-relaxed text-slate-400 min-h-[2.6rem] line-clamp-2">
          {event.highlight}
        </p>

        {/* Multi-Distance Tags */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {event.distance.split(/[\/,]/).map((d) => (
            <span
              key={d}
              className="rounded-lg px-2.5 py-0.5 font-mono text-[0.68rem] font-bold bg-white/[0.06] border border-white/10 text-white"
            >
              {d.trim()}
            </span>
          ))}
        </div>

        {/* Countdown & Price Footer */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-2 text-slate-400">
          {isClosed ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
              <Timer className="h-4 w-4 shrink-0 text-rose-400" />
              <span>Status:</span>
              <span className="font-bold text-white">
                Closed
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Timer className="h-4 w-4 shrink-0 text-[#ff4b26]" />
              <span>Closes in:</span>
              <span className="font-mono font-bold text-white">
                {timeLeft.hours}h {String(timeLeft.minutes).padStart(2, "0")}m
              </span>
            </div>
          )}

          <div className="flex items-baseline gap-2 text-right">
            <span className="text-xs line-through font-mono text-slate-500">
              {isCancerAwareness ? "₹799" : "₹549"}
            </span>
            <span className="font-mono text-xl font-black text-white">
              {isCancerAwareness
                ? "₹499"
                : event.price.startsWith("₹")
                ? event.price
                : `₹${event.price.replace(/^Rs\.\s*/, "")}`}
            </span>
          </div>
        </div>

        {/* Primary CTA */}
        {isClosed ? (
          <Link
            prefetch={false}
            data-prevent-card-nav
            className="mt-auto pt-4 w-full"
            href="/leaderboard"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full text-xs font-black uppercase tracking-wider py-3.5 rounded-full flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-[#ff4b26] to-[#ff6a38] text-white shadow-[0_0_20px_rgba(255,75,38,0.35)] border border-white/20 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,75,38,0.65)]">
              <Trophy className="h-4 w-4 text-amber-300" />
              <span>View Leaderboard</span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>
        ) : (
          <Link
            prefetch={false}
            data-prevent-card-nav
            className="mt-auto pt-4 w-full"
            href={isCancerAwareness ? `/events/${event.slug}` : `/events/${event.slug}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full text-xs font-black uppercase tracking-wider py-3.5 rounded-full flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-[#ff4b26] to-[#ff6a38] text-white shadow-[0_0_20px_rgba(255,75,38,0.35)] border border-white/20 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,75,38,0.65)]">
              <Sparkles className="h-4 w-4" />
              <span>Claim Your Slot</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>
        )}
      </div>
    </article>
  );
}

export function HomeEvents({ initial }: { initial?: PublicEvent[] }) {
  const combined = useMemo(() => {
    const list = Array.isArray(initial) && initial.length > 0 ? [...initial] : [];

    // Ensure Kinetic Run is present as the active live event
    if (!list.some((ev) => ev.slug.includes("kinetic"))) {
      list.unshift(kineticRunEvent);
    }

    // Ensure Cancer Awareness is present as a concluded challenge
    if (!list.some((ev) => ev.slug.includes("cancer"))) {
      list.push(cancerAwarenessEvent);
    }

    // Always include the IAF challenge in the card list
    if (!list.some((ev) => ev.slug.includes("air-force"))) {
      const iaf = staticUpcoming.find((s) => s.slug.includes("air-force"));
      if (iaf) list.push(iaf);
    }

    // Deduplicate permanently by slug, canonical event key, and normalized name
    const seenKeys = new Set<string>();
    const seenNames = new Set<string>();
    const deduplicated: PublicEvent[] = [];

    for (const ev of list) {
      const isKinetic =
        ev.slug.includes("kinetic") ||
        (ev.name && ev.name.toLowerCase().includes("kinetic"));

      const isAirForce =
        ev.slug.includes("air-force") ||
        ev.slug.includes("airforce") ||
        ev.slug === "iaf-2026" ||
        (ev.name && ev.name.toLowerCase().includes("air force"));

      const isCancer =
        ev.slug.includes("cancer") ||
        (ev.name && ev.name.toLowerCase().includes("cancer"));

      const key = isKinetic
        ? "canonical-kinetic-event"
        : isAirForce
        ? "canonical-iaf-event"
        : isCancer
        ? "canonical-cancer-event"
        : ev.slug;
      const nameKey = ev.name ? ev.name.toLowerCase().trim().replace(/\s+/g, " ") : key;
      if (seenKeys.has(key) || seenNames.has(nameKey)) continue;
      seenKeys.add(key);
      seenNames.add(nameKey);

      const match =
        staticUpcoming.find((s) => s.slug === ev.slug) ||
        (isKinetic ? kineticRunEvent : undefined) ||
        (isAirForce ? staticUpcoming.find((s) => s.slug.includes("air-force")) : undefined) ||
        (isCancer ? cancerAwarenessEvent : undefined);

      deduplicated.push({
        ...ev,
        bannerImageUrl: ev.bannerImageUrl || match?.bannerImageUrl,
        highlight: ev.highlight || match?.highlight || "Verified virtual marathon challenge.",
        banner: ev.banner || match?.banner || "Open event",
        reward: ev.reward || match?.reward || "Finisher medal + E-Certificate",
      });
    }

    return deduplicated;
  }, [initial]);

  return (
    <div
      className={`mt-8 grid gap-6 sm:mt-10 ${
        combined.length === 1
          ? "max-w-md mx-auto"
          : combined.length === 2
          ? "max-w-3xl mx-auto sm:grid-cols-2"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      }`}
    >
      {combined.map((event, i) => (
        <EventCard key={event.slug} event={event} index={i} />
      ))}
    </div>
  );
}
