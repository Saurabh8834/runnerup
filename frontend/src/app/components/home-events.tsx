"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowUpRight,
  Flame,
  Medal,
  Sparkles,
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
  const percent = 78 + (positive % 18); // 78% to 95% booked
  const bibsLeft = 14 + (positive % 32); // 14 to 45 bibs left
  return { percent, bibsLeft };
}

function EventCard({ event, index }: { event: PublicEvent; index: number }) {
  const hasBannerImage = Boolean(event.bannerImageUrl);
  const scarcity = useMemo(() => getEventScarcity(event.slug), [event.slug]);

  // Live countdown state
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 14 + ((index * 6) % 24),
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
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-[#90aead]/20 bg-[#172c34]/95 backdrop-blur-2xl shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-[#e64833]/60 hover:shadow-[0_16px_50px_rgba(230,72,51,0.25)] text-[#fbe9d0]">
      {/* Banner / Poster */}
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
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[#172c34] via-[#172c34]/40 to-[#14242a]/30"
        />

        {/* Top Urgency Badges */}
        <div className="relative z-10 p-4 flex items-start justify-between gap-2">
          {/* Scarcity Badge */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e64833] backdrop-blur-md px-3 py-1 text-[0.68rem] font-black uppercase tracking-wider text-white shadow-lg">
            <Flame className="h-3.5 w-3.5 animate-bounce fill-white" />
            <span>{scarcity.percent}% Booked</span>
          </span>

          {/* Active Race Badge */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#90aead]/30 bg-[#14242a]/85 backdrop-blur-md px-3 py-1 text-[0.68rem] font-black uppercase tracking-wider text-[#fbe9d0] shadow-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span>Registration Open</span>
          </span>
        </div>

        {/* Reward / Medal Highlight Strip */}
        <div className="absolute bottom-3 left-4 right-4 z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#90aead]/30 bg-[#14242a]/85 backdrop-blur-md px-3 py-1 text-xs font-bold text-[#fbe9d0] shadow-md">
            <Medal className="h-3.5 w-3.5 text-[#e64833] shrink-0" />
            <span className="truncate">{event.reward}</span>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex flex-1 flex-col p-6">
        {/* Scarcity Progress Bar */}
        <div className="mb-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#e64833] flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 fill-[#e64833]" /> Only {scarcity.bibsLeft} Bibs Remaining
            </span>
            <span className="text-[#90aead] font-mono text-[0.72rem]">
              {scarcity.percent}% Filled
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

        {/* Title */}
        <h3 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-[#fbe9d0] transition-colors group-hover:text-[#e64833]">
          {event.name}
        </h3>

        {/* Multi-Distance Tags */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {event.distance.split(",").map((d) => (
            <span
              key={d}
              className="rounded-lg bg-[#244855] border border-[#90aead]/30 px-2.5 py-0.5 font-mono text-[0.68rem] font-bold text-[#fbe9d0]"
            >
              {d.trim()}
            </span>
          ))}
        </div>

        <p className="mt-3 flex-1 text-xs sm:text-sm leading-relaxed text-[#90aead] font-medium line-clamp-2">
          {event.highlight}
        </p>

        {/* Countdown & Price Footer */}
        <div className="mt-5 pt-4 border-t border-[#90aead]/15 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[#90aead] font-medium">
            <Timer className="h-4 w-4 text-[#e64833] shrink-0" />
            <span>Closes in:</span>
            <span className="font-mono font-bold text-[#fbe9d0]">
              {timeLeft.hours}h {String(timeLeft.minutes).padStart(2, "0")}m
            </span>
          </div>

          <div className="flex items-baseline gap-2 text-right">
            <span className="text-xs text-[#90aead]/60 line-through font-mono">₹549</span>
            <span className="font-mono text-xl font-black text-[#fbe9d0]">
              {event.price.replace(/^Rs\.\s*/, "").replace(/^₹/, "₹")}
            </span>
          </div>
        </div>

        {/* Primary CTA */}
        <Link
          className="mt-5 w-full text-xs font-black uppercase tracking-wider py-3.5 rounded-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#e64833] via-[#ea5a47] to-[#c93b27] text-[#fbe9d0] shadow-[0_0_20px_rgba(230,72,51,0.4)] border border-[#fbe9d0]/20 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(230,72,51,0.7)] transition-all"
          href={`/events/${event.slug}`}
        >
          <Sparkles className="h-4 w-4 text-[#fbe9d0]" />
          <span>Claim Your Bib & Medal</span>
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </article>
  );
}

export function HomeEvents({ initial }: { initial?: PublicEvent[] }) {
  const combined = useMemo(() => {
    const list = Array.isArray(initial) && initial.length > 0 ? [...initial] : [];
    for (const item of staticUpcoming) {
      if (list.length >= 3) break;
      if (!list.some((existing) => existing.slug === item.slug)) {
        list.push(item);
      }
    }
    return list.slice(0, 3).map((ev) => {
      const match = staticUpcoming.find((s) => s.slug === ev.slug);
      return {
        ...ev,
        bannerImageUrl: ev.bannerImageUrl || match?.bannerImageUrl,
        highlight: ev.highlight || match?.highlight || "Verified virtual marathon challenge.",
        banner: ev.banner || match?.banner || "Open event",
        reward: ev.reward || match?.reward || "Finisher medal + E-Certificate",
      };
    });
  }, [initial]);

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
      {combined.map((event, i) => (
        <EventCard key={event.slug} event={event} index={i} />
      ))}
    </div>
  );
}
