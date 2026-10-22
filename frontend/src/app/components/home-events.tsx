"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  FileBadge,
  Flame,
  Medal,
  Sparkles,
  Ticket,
  Timer,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { PublicEvent } from "../data/events";
import { publicEvents as staticUpcoming } from "../data/events";

// Deterministic realistic slot scarcity calculation based on event slug & date
function getEventScarcity(slug: string) {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash |= 0;
  }
  const positive = Math.abs(hash);
  const percent = 70; // 70% booked
  const bibsLeft = 280 + (positive % 30); // ~280-309 bibs left
  return { percent, bibsLeft };
}

function EventCard({ event, index }: { event: PublicEvent; index: number }) {
  const isAirForce =
    event.slug.includes("air-force") ||
    event.name.toLowerCase().includes("air force");

  const resolvePoster = (slug: string, bannerUrl?: string) => {
    if (isAirForce) return "/images/event-medal.webp";
    if (bannerUrl && !bannerUrl.includes("res.cloudinary.com")) return bannerUrl;
    return `/events/${slug}.webp`;
  };

  const initialImage = resolvePoster(event.slug, event.bannerImageUrl);

  const [imgSrc, setImgSrc] = useState(initialImage);
  const [imgFailed, setImgFailed] = useState(false);
  const hasBannerImage = Boolean(imgSrc) && !imgFailed;
  const scarcity = useMemo(() => getEventScarcity(event.slug), [event.slug]);

  useEffect(() => {
    setImgSrc(resolvePoster(event.slug, event.bannerImageUrl));
    setImgFailed(false);
  }, [event.bannerImageUrl, event.slug, isAirForce]);

  const router = useRouter();

  // Live countdown state updated once per minute to prevent unnecessary 1s CPU thrashing
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
      className="group flex flex-col overflow-hidden rounded-3xl border border-[#90aead]/20 bg-[#172c34]/95 text-[#fbe9d0] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#e64833]/60 hover:shadow-[0_16px_50px_rgba(230,72,51,0.25)] shadow-2xl cursor-pointer"
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
                  setImgSrc("/images/event-medal.png");
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
        {!isAirForce && (
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-[#172c34] via-[#172c34]/40 to-[#14242a]/30"
          />
        )}

        {/* Top Badges */}
        <div className="absolute top-0 inset-x-0 z-10 p-3 sm:p-4 flex items-start justify-between gap-1.5 sm:gap-2 pointer-events-none">
          <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-[#e64833] px-2.5 sm:px-3 py-1 text-[0.62rem] sm:text-[0.68rem] font-black uppercase tracking-wider text-white shadow-lg shrink-0">
            <Flame className="h-3 w-3 fill-white" />
            <span>{scarcity.percent}% Booked</span>
          </span>

          <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/85 backdrop-blur-md px-2.5 sm:px-3 py-1 text-[0.62rem] sm:text-[0.68rem] font-black uppercase tracking-wider text-emerald-400 shadow-md shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span>Open</span>
          </span>
        </div>

        {/* Reward / Medal Highlight Strip (Only for non-medal cards so medals are never obscured) */}
        {!isAirForce && (
          <div className="absolute bottom-3 left-4 right-4 z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#90aead]/30 bg-[#14242a]/85 backdrop-blur-md px-3 py-1 text-xs font-bold text-[#fbe9d0] shadow-md max-w-full">
              <Medal className="h-3.5 w-3.5 text-[#e64833] shrink-0" />
              <span className="truncate">{event.reward}</span>
            </div>
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="flex flex-1 flex-col p-6">
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
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#e64833] flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 fill-[#e64833]" /> Only {scarcity.bibsLeft} Bibs Remaining
            </span>
            <span className="text-[#90aead] font-mono text-[0.72rem]">
              {scarcity.percent}% filled
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full p-0.5 border bg-black/30 border-[#90aead]/20">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${scarcity.percent}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-[#874f41] via-[#e64833] to-[#fbe9d0]"
            />
          </div>
        </div>

        {/* Title (Vibrant Brand Orange matching Image 2 reference) */}
        <h3 className="font-display font-extrabold text-xl sm:text-2xl leading-tight transition-colors uppercase tracking-tight text-[#e64833] hover:brightness-110">
          {event.name}
        </h3>

        {/* Subtitle / Highlight */}
        <p className="mt-2 text-xs sm:text-sm font-medium leading-relaxed text-[#90aead] line-clamp-2">
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
        <div className="mt-5 pt-4 border-t border-[#90aead]/15 flex items-center justify-between gap-2 text-[#90aead]">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <Timer className="h-4 w-4 shrink-0 text-[#e64833]" />
            <span>Closes in:</span>
            <span className="font-mono font-bold text-[#fbe9d0]">
              {timeLeft.hours}h {String(timeLeft.minutes).padStart(2, "0")}m
            </span>
          </div>

          <div className="flex items-baseline gap-2 text-right">
            <span className="text-xs line-through font-mono text-[#90aead]/60">
              ₹549
            </span>
            <span className="font-mono text-xl font-black text-[#fbe9d0]">
              {event.price.replace(/^Rs\.\s*/, "").replace(/^₹/, "₹")}
            </span>
          </div>
        </div>

        {/* Primary CTA */}
        <Link
          prefetch={false}
          className="mt-5 w-full text-xs font-black uppercase tracking-wider py-3.5 rounded-full flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-[#e64833] via-[#ea5a47] to-[#c93b27] text-[#fbe9d0] shadow-[0_0_20px_rgba(230,72,51,0.4)] border border-[#fbe9d0]/20 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(230,72,51,0.7)]"
          href={`/events/${event.slug}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Sparkles className="h-4 w-4" />
          <span>Claim Your Kit</span>
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </article>
  );
}

export function HomeEvents({ initial }: { initial?: PublicEvent[] }) {
  const combined = useMemo(() => {
    const list = Array.isArray(initial) && initial.length > 0 ? [...initial] : [...staticUpcoming];
    const upcomingList = list.filter((ev) => ev.status === "upcoming");

    // Deduplicate permanently by slug, canonical IAF event key, and normalized name
    const seenKeys = new Set<string>();
    const seenNames = new Set<string>();
    const deduplicated: PublicEvent[] = [];

    for (const ev of upcomingList) {
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

      const match =
        staticUpcoming.find((s) => s.slug === ev.slug) ||
        (isAirForce ? staticUpcoming.find((s) => s.slug.includes("air-force")) : undefined);
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
    <div className="mt-8 grid grid-cols-1 gap-6 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
      {combined.map((event, i) => (
        <EventCard key={event.slug} event={event} index={i} />
      ))}
    </div>
  );
}
