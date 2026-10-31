"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Crown,
  Flame,
  MapPin,
  Ruler,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  X,
  ArrowRight,
  ArrowUpRight,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getApiUrl } from "../../lib/api";
import { publicEvents } from "../data/events";
import { LeaderboardCountdown, LEADERBOARD_REVEAL_TIMESTAMP } from "./leaderboard-countdown";

export type LeaderboardEntry = {
  rank: number;
  runnerName: string;
  city?: string;
  state?: string;
  distance: string;
  finishTimeSeconds: number | null;
  bibNumber?: string;
  userId?: string;
  clerkId?: string | null;
  status: string;
  isPadded?: boolean;
};

export type ParticipantEntry = {
  rosterNumber: number;
  runnerName: string;
  city?: string;
  state?: string;
  distance: string;
  bibNumber: string;
  status: string;
  proofStatus: string;
  registrationStatus: string;
  registeredAt?: string;
  finishTimeSeconds?: number | null;
  userId?: string;
  clerkId?: string | null;
};

type UserReg = {
  id: string;
  distance: string;
  bibNumber: string;
  proofStatus: string;
  status: string;
  finishTimeSeconds: number | null;
};

type EventOption = {
  id?: string;
  slug: string;
  name: string;
  distances?: string[];
};

function parseKm(distStr: string): number {
  if (!distStr) return 5;
  const lower = distStr.toLowerCase().trim();
  if (lower.includes("half") || lower.includes("21.1")) return 21.0975;
  if (lower.includes("full") || (lower.includes("marathon") && !lower.includes("half"))) return 42.195;
  const match = distStr.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (match && match[1]) {
    const val = parseFloat(match[1]);
    if (!Number.isNaN(val) && val > 0) return val;
  }
  return 5;
}

function formatTime(seconds: number | null | undefined): string {
  if (seconds == null || Number.isNaN(seconds) || seconds <= 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}h ${m}m ${String(s).padStart(2, "0")}s`;
  }
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

function formatPace(seconds: number | null | undefined, distanceStr: string): string {
  if (seconds == null || Number.isNaN(seconds) || seconds <= 0) return "—";
  const km = parseKm(distanceStr);
  if (km <= 0) return "—";
  const paceSec = Math.round(seconds / km);
  const m = Math.floor(paceSec / 60);
  const s = Math.floor(paceSec % 60);
  return `${m}m ${String(s).padStart(2, "0")}s /km`;
}

function getInitials(name: string): string {
  if (!name) return "MR";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// ── Concept 1: Olympic Gold Glass Cards (Modern Floating Podium for Top 3 Champions) ──
function PodiumOlympicGold({
  topThree,
  activeDistance,
}: {
  topThree: {
    first?: LeaderboardEntry;
    second?: LeaderboardEntry;
    third?: LeaderboardEntry;
  };
  activeDistance: string;
}) {
  if (!topThree.first) return null;

  return (
    <div className="relative mx-auto w-full max-w-4xl px-3 py-6">
      {/* Radiant Background Glows */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-96 rounded-full bg-[#f6d58e]/10 blur-[100px]" />
      <div className="pointer-events-none absolute left-1/2 bottom-0 -translate-x-1/2 h-28 w-80 rounded-full bg-[#e64833]/15 blur-[80px]" />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-end">

        {/* ═══ 2nd Place: Silver Runner-Up (Left on desktop, order-2 on mobile) ═══ */}
        {topThree.second ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="order-2 md:order-1 rounded-2xl border border-slate-300/30 bg-gradient-to-b from-[#162730]/90 to-[#0c161a]/95 p-5 sm:p-6 text-center backdrop-blur-xl shadow-[0_12px_35px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-transform"
          >
            {/* Metallic Silver Badge */}
            <div className="relative mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-slate-200 via-slate-400 to-slate-100 text-slate-950 font-black text-2xl ring-4 ring-slate-300/60 shadow-[0_0_20px_rgba(203,213,225,0.4)]">
              🥈
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-400 border-2 border-[#0c161a] text-xs font-black text-slate-950 shadow">
                2
              </span>
            </div>

            {/* Runner Name in Bold Caps */}
            <h3 className="truncate font-display font-black text-base sm:text-lg uppercase tracking-wide text-white drop-shadow-sm">
              {topThree.second.runnerName}
            </h3>

            {/* Category / Rank Meta */}
            <p className="mt-0.5 text-xs font-semibold text-slate-300 font-mono">
              Rank #2 · Verified Finisher
            </p>

            {/* Time Pill */}
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-slate-300/30 bg-slate-900/60 px-3.5 py-1 text-xs font-mono font-bold text-slate-200 shadow-inner">
              <Clock className="h-3.5 w-3.5 text-slate-300" />
              <span>{formatTime(topThree.second.finishTimeSeconds)}</span>
            </div>

            {/* Pace Chip */}
            <p className="mt-2 text-[11px] font-medium text-[#90aead]">
              Pace: <span className="font-mono text-slate-200">{formatPace(topThree.second.finishTimeSeconds, activeDistance)}</span>
            </p>
          </motion.div>
        ) : (
          <div className="order-2 md:order-1 hidden md:block" />
        )}

        {/* ═══ 1st Place: Gold Champion (Center, Elevated & Crowned) ═══ */}
        {topThree.first && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="order-1 md:order-2 relative rounded-3xl border-2 border-[#f6d58e] bg-gradient-to-b from-[#1f3a46]/95 via-[#13262e]/98 to-[#0b1418] p-6 sm:p-7 text-center backdrop-blur-2xl shadow-[0_20px_50px_rgba(246,213,142,0.22),0_0_35px_rgba(230,72,51,0.18)] hover:-translate-y-1.5 transition-transform -mt-2 md:-mt-6"
          >
            {/* Floating Crown */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center justify-center filter drop-shadow-[0_4px_12px_rgba(246,213,142,0.7)] animate-bounce motion-reduce:animate-none">
              <span className="text-3xl sm:text-4xl">👑</span>
            </div>

            {/* Metallic Gold Badge */}
            <div className="relative mx-auto mt-2 mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-amber-300 via-yellow-400 to-amber-500 text-slate-950 font-black text-3xl ring-4 ring-[#f6d58e] shadow-[0_0_30px_rgba(246,213,142,0.7)]">
              🥇
              <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 border-2 border-[#0b1418] text-xs font-black text-slate-950 shadow">
                1
              </span>
            </div>

            {/* Runner Name in ALL CAPS Gold */}
            <h3 className="truncate font-display font-black text-lg sm:text-xl uppercase tracking-wider text-[#f6d58e] drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              {topThree.first.runnerName}
            </h3>

            {/* National Champion Badge */}
            <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FF9933]/20 via-white/10 to-[#138808]/20 border border-[#f6d58e]/40 px-3 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#f6d58e]">
              <Trophy className="h-3 w-3 text-amber-400" />
              <span>National Champion · {activeDistance}</span>
            </div>

            {/* Golden Time Pill */}
            <div className="mt-3.5 inline-flex items-center gap-2 rounded-full border border-[#f6d58e]/60 bg-gradient-to-r from-amber-500/25 to-yellow-500/20 px-5 py-1.5 text-sm font-mono font-black text-[#f6d58e] shadow-[0_0_15px_rgba(246,213,142,0.3)]">
              <Flame className="h-4 w-4 text-orange-400 fill-orange-400" />
              <span>{formatTime(topThree.first.finishTimeSeconds)}</span>
              <span className="text-[10px] font-sans uppercase font-extrabold text-amber-200">GOLD</span>
            </div>

            {/* Pace Chip */}
            <p className="mt-2.5 text-xs font-semibold text-amber-200/90">
              Pace: <span className="font-mono text-white font-bold">{formatPace(topThree.first.finishTimeSeconds, activeDistance)}</span> 🔥 (Speed Leader)
            </p>
          </motion.div>
        )}

        {/* ═══ 3rd Place: Bronze Runner-Up (Right on desktop, order-3 on mobile) ═══ */}
        {topThree.third ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="order-3 rounded-2xl border border-amber-600/30 bg-gradient-to-b from-[#162730]/90 to-[#0c161a]/95 p-5 sm:p-6 text-center backdrop-blur-xl shadow-[0_12px_35px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-transform"
          >
            {/* Metallic Bronze Badge */}
            <div className="relative mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-[#874f41] via-[#d97757] to-[#874f41] text-[#fbe9d0] font-black text-2xl ring-4 ring-amber-600/50 shadow-[0_0_20px_rgba(217,119,87,0.35)]">
              🥉
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-700 border-2 border-[#0c161a] text-xs font-black text-[#fbe9d0] shadow">
                3
              </span>
            </div>

            {/* Runner Name in Bold Caps */}
            <h3 className="truncate font-display font-black text-base sm:text-lg uppercase tracking-wide text-white drop-shadow-sm">
              {topThree.third.runnerName}
            </h3>

            {/* Category / Rank Meta */}
            <p className="mt-0.5 text-xs font-semibold text-slate-300 font-mono">
              Rank #3 · Verified Finisher
            </p>

            {/* Time Pill */}
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-700/40 bg-slate-900/60 px-3.5 py-1 text-xs font-mono font-bold text-amber-200 shadow-inner">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              <span>{formatTime(topThree.third.finishTimeSeconds)}</span>
            </div>

            {/* Pace Chip */}
            <p className="mt-2 text-[11px] font-medium text-[#90aead]">
              Pace: <span className="font-mono text-slate-200">{formatPace(topThree.third.finishTimeSeconds, activeDistance)}</span>
            </p>
          </motion.div>
        ) : (
          <div className="order-3 hidden md:block" />
        )}

      </div>
    </div>
  );
}

export function LeaderboardClient() {
  const searchParams = useSearchParams();
  const initialEventParam = searchParams.get("event") || "";
  const initialDistanceParam = searchParams.get("distance") || "";

  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const currentClerkId = user?.id ?? null;

  const [events, setEvents] = useState<EventOption[]>(
    publicEvents.map((e) => ({
      slug: e.slug,
      name: e.name,
      distances: e.distance
        ? e.distance.split("/").map((d) => d.trim()).filter(Boolean)
        : ["1.5 km", "1.6 km", "3 km", "5 km", "10 km", "21 km"],
    })),
  );

  const [selectedSlug, setSelectedSlug] = useState<string>(
    initialEventParam || publicEvents[0]?.slug || "monsoon-mountain-miles",
  );
  const [selectedDistance, setSelectedDistance] = useState<string>(
    initialDistanceParam || "5 km",
  );
  const [activeTab, setActiveTab] = useState<"verified" | "participants">("verified");
  const [searchQuery, setSearchQuery] = useState("");

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [participants, setParticipants] = useState<ParticipantEntry[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<UserReg[]>([]);
  const [availableDistances, setAvailableDistances] = useState<string[]>([
    "1.5 km",
    "1.6 km",
    "3 km",
    "5 km",
    "10 km",
    "21 km",
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Leaderboard disclosure countdown status (Reveals 31 Oct, 12:00 PM IST)
  const [isRevealed, setIsRevealed] = useState(() => Date.now() >= LEADERBOARD_REVEAL_TIMESTAMP);

  useEffect(() => {
    if (Date.now() >= LEADERBOARD_REVEAL_TIMESTAMP) {
      setIsRevealed(true);
      return;
    }
    const checkTimer = setInterval(() => {
      if (Date.now() >= LEADERBOARD_REVEAL_TIMESTAMP) {
        setIsRevealed(true);
        clearInterval(checkTimer);
      }
    }, 1000);
    return () => clearInterval(checkTimer);
  }, []);

  // Sync available distances when event changes
  const distanceOptions = useMemo(() => {
    if (availableDistances.length > 0) return availableDistances;
    const currentEv = events.find((e) => e.slug === selectedSlug);
    if (currentEv?.distances?.length) return currentEv.distances;
    return ["1.5 km", "1.6 km", "3 km", "5 km", "10 km", "21 km"];
  }, [availableDistances, events, selectedSlug]);

  // Load list of events from backend
  const loadEvents = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl("/api/events"));
      if (!response.ok) return;
      const json = await response.json();
      const list = (json.data ?? []) as Array<{
        id: string;
        slug: string;
        title: string;
        distances: string[];
      }>;
      if (list.length > 0) {
        const mapped = list.map((e) => ({
          id: e.id,
          slug: e.slug,
          name: e.title,
          distances: e.distances?.length
            ? e.distances
            : ["1.5 km", "1.6 km", "3 km", "5 km", "10 km", "21 km"],
        }));
        setEvents(mapped);
        if (initialEventParam && mapped.some((e) => e.slug === initialEventParam)) {
          setSelectedSlug(initialEventParam);
        }
      }
    } catch {
      // Keep static fallback
    }
  }, [initialEventParam]);

  // Cache to prevent hammering the server when users flip between distances
  const cacheRef = useRef<Map<string, { json: any; timestamp: number }>>(new Map());

  // Load leaderboard & participants data for the selected event & distance
  const loadLeaderboard = useCallback(async () => {
    if (!selectedSlug) {
      setLoading(false);
      return;
    }

    const distQuery = selectedDistance ? `?distance=${encodeURIComponent(selectedDistance)}` : "";
    const cacheKey = `${selectedSlug}${distQuery}`;
    const cached = cacheRef.current.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < 120000) {
      const json = cached.json;
      setEntries((json.data ?? []) as LeaderboardEntry[]);
      setParticipants((json.participants ?? []) as ParticipantEntry[]);
      setUserRegistrations((json.userRegistrations ?? []) as UserReg[]);
      if (json.meta?.availableDistances?.length) {
        setAvailableDistances(json.meta.availableDistances as string[]);
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        getApiUrl(`/api/registrations/leaderboard/${encodeURIComponent(selectedSlug)}${distQuery}`),
      );

      if (!response.ok) {
        throw new Error("Could not load leaderboard data");
      }

      const json = await response.json();
      cacheRef.current.set(cacheKey, { json, timestamp: Date.now() });

      const rankedData = (json.data ?? []) as LeaderboardEntry[];
      const rosterData = (json.participants ?? []) as ParticipantEntry[];
      const userRegs = (json.userRegistrations ?? []) as UserReg[];
      const distList = (json.meta?.availableDistances ?? []) as string[];

      setEntries(rankedData);
      setParticipants(rosterData);
      setUserRegistrations(userRegs);
      if (distList.length > 0) {
        setAvailableDistances(distList);
      }
    } catch {
      setError("Unable to load live leaderboard. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [selectedDistance, selectedSlug]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadEvents();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadEvents]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadLeaderboard();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadLeaderboard]);

  // Filtered entries based on search
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase().trim();
    return entries.filter(
      (e) =>
        e.runnerName.toLowerCase().includes(q) ||
        (e.bibNumber && e.bibNumber.toLowerCase().includes(q)) ||
        (e.city && e.city.toLowerCase().includes(q)),
    );
  }, [entries, searchQuery]);

  const filteredParticipants = useMemo(() => {
    if (!searchQuery.trim()) return participants;
    const q = searchQuery.toLowerCase().trim();
    return participants.filter(
      (p) =>
        p.runnerName.toLowerCase().includes(q) ||
        (p.bibNumber && p.bibNumber.toLowerCase().includes(q)) ||
        (p.city && p.city.toLowerCase().includes(q)),
    );
  }, [participants, searchQuery]);

  // Top 3 Podium Runners
  const topThree = useMemo(() => {
    return {
      first: entries[0] || null,
      second: entries[1] || null,
      third: entries[2] || null,
    };
  }, [entries]);

  // User's own entry / standing on the board
  const userStanding = useMemo(() => {
    if (!isSignedIn) return null;
    const matchingRank = entries.find(
      (e) =>
        (currentClerkId && e.clerkId === currentClerkId) ||
        (user?.fullName && e.runnerName.toLowerCase() === user.fullName.toLowerCase()),
    );
    const userRegForEvent = userRegistrations.find(
      (r) => r.distance.toLowerCase().trim() === selectedDistance.toLowerCase().trim(),
    );
    const otherDistanceReg = userRegistrations.find(
      (r) => r.distance.toLowerCase().trim() !== selectedDistance.toLowerCase().trim(),
    );

    return {
      rankedEntry: matchingRank || null,
      currentDistanceReg: userRegForEvent || null,
      otherDistanceReg: otherDistanceReg || null,
    };
  }, [currentClerkId, entries, isSignedIn, selectedDistance, user, userRegistrations]);

  return (
    <div className="min-w-0">

      {/* ── UNIFIED LEADERBOARD: CATEGORY SELECTION DIRECTLY ON TOP ──── */}
      <section className="relative overflow-hidden pt-20 pb-16 sm:pt-24 sm:pb-20 isolate text-[#fbe9d0] bg-[#0c161a] border-b border-[#90aead]/15">
        {/* Glow Effects */}
        <div aria-hidden className="pointer-events-none absolute top-10 left-1/2 -z-10 h-[380px] w-[650px] -translate-x-1/2 rounded-full bg-[#f6d58e]/10 blur-[130px]" />
        <div aria-hidden className="pointer-events-none absolute top-1/2 right-10 -z-10 h-[300px] w-[300px] rounded-full bg-[#e64833]/15 blur-[120px]" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">

          {/* Header Title Banner */}
          <div className="mx-auto max-w-3xl text-center mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 mb-3 shadow-sm">
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              OFFICIAL NATIONAL LEADERBOARD · LIVE REVEAL
            </span>
            <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white">
              THE FINISHERS&apos; <span className="text-[#e64833]">BOARD</span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#90aead] max-w-lg mx-auto font-medium">
              Chip-verified results &amp; standings across all distance categories · Indian Air Force Day Challenge
            </p>
          </div>

          {/* ═══ REQUIREMENT: CATEGORY SELECTION DIRECTLY ABOVE LEADERBOARD ═══ */}
          <div className="mb-8 rounded-2xl border border-white/10 bg-[#12232a]/90 p-4 sm:p-5 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              {/* Category Selection Pills */}
              <div className="flex-1">
                <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-[#90aead] flex items-center gap-1.5">
                  <Ruler className="h-3.5 w-3.5 text-[#e64833]" /> Choose Distance Category:
                </p>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {distanceOptions.map((dist) => {
                    const isSelected = selectedDistance.toLowerCase().trim() === dist.toLowerCase().trim();
                    return (
                      <button
                        key={dist}
                        type="button"
                        onClick={() => {
                          setSelectedDistance(dist);
                          setSearchQuery("");
                        }}
                        className={`group relative flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer select-none ${
                          isSelected
                            ? "bg-gradient-to-r from-[#e64833] to-[#c93b27] text-white shadow-lg shadow-[#e64833]/30 border border-[#e64833]"
                            : "border border-white/10 bg-white/[0.05] text-slate-200 hover:border-white/20 hover:bg-white/[0.08]"
                        }`}
                      >
                        <span>{dist}</span>
                        {isSelected && (
                          <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[0.6rem] font-mono font-bold">
                            Active
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Event Select & Instant Search Input */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0 lg:border-l lg:border-white/10 lg:pl-5">
                {/* Event Select */}
                <div className="relative min-w-[160px] sm:min-w-[190px]">
                  <select
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs font-bold text-slate-200 outline-none transition focus:border-[#e64833] cursor-pointer"
                    value={selectedSlug}
                    onChange={(e) => {
                      setSelectedSlug(e.target.value);
                      setSearchQuery("");
                    }}
                  >
                    {events.map((ev) => (
                      <option key={ev.slug} value={ev.slug} className="bg-[#12232a] text-white">
                        {ev.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Runner */}
                <div className="relative flex-1 min-w-[200px] sm:min-w-[240px]">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#90aead]"
                  />
                  <input
                    type="text"
                    placeholder="Search runner or bib..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-black/40 pl-9 pr-8 py-2 text-xs text-white placeholder-[#90aead]/70 outline-none transition focus:border-[#e64833]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#90aead] hover:text-white cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Dual Tab Switcher & GPS Badge */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 border-b border-[#90aead]/15 pb-5">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab("verified")}
                className={`flex shrink-0 items-center justify-center gap-1.5 sm:gap-2 rounded-full px-3.5 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === "verified"
                    ? "bg-[#e64833] text-white shadow-md shadow-[#e64833]/20 border border-[#e64833]"
                    : "border border-[#90aead]/20 bg-[#172c34] text-[#fbe9d0]/80 hover:border-[#90aead]/40"
                  }`}
              >
                <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span>Verified Leaderboard</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("participants")}
                className={`flex shrink-0 items-center justify-center gap-1.5 sm:gap-2 rounded-full px-3.5 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === "participants"
                    ? "bg-[#e64833] text-white shadow-md shadow-[#e64833]/20 border border-[#e64833]"
                    : "border border-[#90aead]/20 bg-[#172c34] text-[#fbe9d0]/80 hover:border-[#90aead]/40"
                  }`}
              >
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span>Event Roster</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-slate-300 bg-white/[0.06] px-3 sm:px-3.5 py-1.5 rounded-full border border-white/10 shadow-xs w-fit shrink-0">
              <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400 shrink-0" />
              <span>GPS Timestamp Verified</span>
            </div>
          </div>

          {/* User's Personal Recognition Banner (Shown after reveal) */}
          {isLoaded && isSignedIn && !loading && isRevealed && (
            <div className="mt-6">
              {userStanding?.rankedEntry ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-4 rounded-3xl border border-amber-500/40 bg-amber-500/10 p-5 sm:flex-row sm:items-center sm:justify-between shadow-2xl"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e64833] text-white font-black shadow text-lg">
                      #{userStanding.rankedEntry.rank}
                    </span>
                    <div>
                      <p className="font-display font-black text-base text-white uppercase tracking-tight">
                        You are ranked <span className="text-[#e64833]">#{userStanding.rankedEntry.rank}</span> in {selectedDistance}!
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-slate-300">
                        Time: <span className="font-mono font-bold text-white">{formatTime(userStanding.rankedEntry.finishTimeSeconds)}</span>
                        {" · "}
                        Pace: <span className="font-mono font-bold text-[#e64833]">{formatPace(userStanding.rankedEntry.finishTimeSeconds, selectedDistance)}</span>
                        {userStanding.rankedEntry.bibNumber && ` · Bib: ${userStanding.rankedEntry.bibNumber}`}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    className="neon-btn-blue text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-full text-center shrink-0 shadow-md text-white"
                  >
                    View in Dashboard
                  </Link>
                </motion.div>
              ) : userStanding?.otherDistanceReg ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-3 rounded-3xl border border-[#90aead]/20 bg-[#172c34] p-5 sm:flex-row sm:items-center sm:justify-between shadow-xl"
                >
                  <p className="text-xs sm:text-sm font-medium text-slate-300">
                    You are registered for <span className="font-bold text-white">{userStanding.otherDistanceReg.distance}</span> in this event.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedDistance(userStanding.otherDistanceReg!.distance)}
                    className="text-xs font-bold uppercase tracking-wider text-[#e64833] hover:underline w-fit cursor-pointer"
                  >
                    Switch to {userStanding.otherDistanceReg.distance} Leaderboard →
                  </button>
                </motion.div>
              ) : null}
            </div>
          )}

          {/* Loading / Error States */}
          {loading ? (
            <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-[#90aead]/20 bg-[#172c34] py-16 shadow-2xl">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-white/10 border-t-[#e64833]" />
              <p className="mt-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400">
                Loading {selectedDistance} rankings...
              </p>
            </div>
          ) : error ? (
            <div className="mt-8 rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-center text-sm font-bold text-rose-300 shadow-sm">
              {error}
            </div>
          ) : (
            <>
              {/* ── TAB 1: VERIFIED LEADERBOARD ─────────────────────── */}
              {activeTab === "verified" && (
                <div className="mt-8 space-y-10">
                  {!isRevealed ? (
                    <div className="space-y-8">
                      <LeaderboardCountdown
                        userReg={userStanding?.currentDistanceReg || userStanding?.otherDistanceReg}
                        onTimerComplete={() => setIsRevealed(true)}
                      />

                      <div className="rounded-3xl border border-[#90aead]/20 bg-[#172c34] p-8 sm:p-12 text-center shadow-xl">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-4 shadow">
                          <Trophy className="h-7 w-7" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                          Leaderboard Standings Under Seal
                        </h3>
                        <p className="mt-2 text-xs sm:text-sm text-[#90aead] max-w-lg mx-auto leading-relaxed">
                          All activity proofs uploaded before tonight&apos;s 11:59 PM cutoff are undergoing strict arbiter audit. The verified podium standings, official rankings, and finisher badges will unlock tomorrow at 12:00 PM IST!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Top 3 3D Stepped Podium */}
                      {!searchQuery && entries.length >= 3 && (
                        <div>
                          <div className="mb-4 text-center">
                            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-amber-400">
                              PODIUM FINISHERS
                            </span>
                            <h2 className="mt-3 font-display font-black text-2xl sm:text-4xl uppercase tracking-tight text-white">
                              TOP 3 CHAMPIONS · <span className="text-[#e64833]">{selectedDistance}</span>
                            </h2>
                          </div>

                          <PodiumOlympicGold
                            topThree={topThree}
                            activeDistance={selectedDistance}
                          />
                        </div>
                      )}

                      {/* Full Rankings: Mobile Card List + Desktop Table */}
                      <div className="overflow-hidden rounded-3xl border border-[#90aead]/20 bg-[#172c34] shadow-2xl">
                        <div className="border-b border-white/10 bg-white/[0.04] px-5 sm:px-6 py-4 flex items-center justify-between">
                          <h3 className="font-display font-black text-sm sm:text-base uppercase tracking-tight text-white">
                            All Verified Finishers · {selectedDistance}
                          </h3>
                          <span className="text-xs font-mono font-bold text-[#90aead]">
                            Official Verified Standings
                          </span>
                        </div>

                        {/* 📱 MOBILE CARD VIEW (Under 640px) */}
                        <div className="block sm:hidden divide-y divide-white/5 p-3 space-y-2.5">
                          {filteredEntries.map((row) => {
                            const isYou =
                              Boolean(currentClerkId && row.clerkId === currentClerkId) ||
                              Boolean(user?.fullName && row.runnerName.toLowerCase() === user.fullName.toLowerCase());

                            return (
                              <div
                                key={`mob-${row.rank}-${row.bibNumber || row.runnerName}`}
                                className={`rounded-2xl border p-3.5 transition-all ${isYou
                                    ? "bg-[#e64833]/15 border-[#e64833]/50 shadow-md shadow-[#e64833]/10"
                                    : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06]"
                                  }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  {/* Rank & Runner Details */}
                                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    <span
                                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${row.rank === 1
                                          ? "bg-amber-500/20 text-amber-400 border border-amber-400/40 text-sm"
                                          : row.rank === 2
                                            ? "bg-slate-400/20 text-slate-200 border border-slate-400/40 text-sm"
                                            : row.rank === 3
                                              ? "bg-amber-800/20 text-amber-300 border border-amber-700/40 text-sm"
                                              : "bg-white/[0.08] text-slate-300 border border-white/10"
                                        }`}
                                    >
                                      {row.rank === 1 ? "🥇" : row.rank === 2 ? "🥈" : row.rank === 3 ? "🥉" : `#${row.rank}`}
                                    </span>

                                    <div className="min-w-0 flex-1">
                                      <p className="truncate font-bold text-xs text-white flex items-center gap-1.5">
                                        {row.runnerName}
                                        {isYou && (
                                          <span className="rounded-full bg-[#e64833] px-1.5 py-0.2 text-[0.55rem] font-bold uppercase tracking-wider text-white">
                                            You
                                          </span>
                                        )}
                                      </p>
                                      <p className="text-[0.65rem] text-[#90aead] font-mono mt-0.5 truncate">
                                        {row.bibNumber || `MR-${parseKm(selectedDistance)}K-${100 + row.rank}`}
                                        {row.city && ` · ${row.city}`}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Timing & Verified Badge */}
                                  <div className="text-right shrink-0">
                                    <p className="font-mono text-sm font-black text-white">
                                      {formatTime(row.finishTimeSeconds)}
                                    </p>
                                    <p className="font-mono text-[0.65rem] font-bold text-[#fbe9d0]">
                                      {formatPace(row.finishTimeSeconds, selectedDistance)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* 💻 DESKTOP DATA TABLE (640px and above) */}
                        <div className="hidden sm:block overflow-x-auto">
                          <table className="w-full text-left text-xs sm:text-sm">
                            <thead>
                              <tr className="border-b border-white/10 bg-white/[0.02] text-[0.65rem] font-black uppercase tracking-wider text-slate-400">
                                <th className="px-4 py-3.5">Rank</th>
                                <th className="px-4 py-3.5">Runner</th>
                                <th className="px-4 py-3.5">Bib #</th>
                                <th className="px-4 py-3.5">City</th>
                                <th className="px-4 py-3.5">Distance</th>
                                <th className="px-4 py-3.5">Avg Pace</th>
                                <th className="px-4 py-3.5">Finish Time</th>
                                <th className="px-4 py-3.5">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {filteredEntries.map((row) => {
                                const isYou =
                                  Boolean(currentClerkId && row.clerkId === currentClerkId) ||
                                  Boolean(user?.fullName && row.runnerName.toLowerCase() === user.fullName.toLowerCase());

                                return (
                                  <tr
                                    key={`${row.rank}-${row.bibNumber || row.runnerName}`}
                                    className={`transition-colors hover:bg-white/[0.04] ${isYou ? "bg-[#e64833]/15 font-semibold" : ""
                                      }`}
                                  >
                                    {/* Rank */}
                                    <td className="px-4 py-3.5">
                                      <div className="flex items-center gap-1 font-mono text-xs font-black">
                                        {row.rank === 1 ? (
                                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 text-sm">
                                            🥇
                                          </span>
                                        ) : row.rank === 2 ? (
                                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-400/20 text-slate-300 text-sm">
                                            🥈
                                          </span>
                                        ) : row.rank === 3 ? (
                                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-800/20 text-amber-400 text-sm">
                                            🥉
                                          </span>
                                        ) : (
                                          <span className="w-6 text-center text-slate-400 font-bold">
                                            #{row.rank}
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    {/* Runner Avatar & Name */}
                                    <td className="px-4 py-3.5">
                                      <div className="flex items-center gap-2.5">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-xs font-bold text-white border border-white/10">
                                          {getInitials(row.runnerName)}
                                        </div>
                                        <div>
                                          <p className="font-bold text-white flex items-center gap-1.5 text-xs sm:text-sm">
                                            {row.runnerName}
                                            {isYou && (
                                              <span className="rounded-full bg-[#e64833] px-2 py-0.2 text-[0.6rem] font-bold uppercase tracking-wider text-white">
                                                You
                                              </span>
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                    </td>

                                    {/* Bib */}
                                    <td className="px-4 py-3.5 font-mono text-xs text-slate-400 font-semibold">
                                      {row.bibNumber || `MR-${parseKm(selectedDistance)}K-${100 + row.rank}`}
                                    </td>

                                    {/* City */}
                                    <td className="px-4 py-3.5 text-xs text-slate-300 font-medium">
                                      {row.city || "India"}
                                    </td>

                                    {/* Distance */}
                                    <td className="px-4 py-3.5 font-bold text-white text-xs">
                                      {row.distance || selectedDistance}
                                    </td>

                                    {/* Pace */}
                                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-[#fbe9d0]">
                                      {formatPace(row.finishTimeSeconds, selectedDistance)}
                                    </td>

                                    {/* Time */}
                                    <td className="px-4 py-3.5 font-mono text-xs font-black text-white">
                                      {formatTime(row.finishTimeSeconds)}
                                    </td>

                                    {/* Status */}
                                    <td className="px-4 py-3.5">
                                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-emerald-400">
                                        <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Verified
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {filteredEntries.length === 0 && (
                          <div className="py-12 text-center text-sm font-medium text-slate-400">
                            No runners match &ldquo;{searchQuery}&rdquo;. Try another name or bib number.
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── TAB 2: PARTICIPANTS ROSTER ─────────────────────── */}
              {activeTab === "participants" && (
                <div className="mt-8 space-y-6">
                  <div className="overflow-hidden rounded-3xl border border-[#90aead]/20 bg-[#172c34] shadow-2xl">
                    <div className="border-b border-white/10 bg-white/[0.04] px-5 sm:px-6 py-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-display font-black text-sm sm:text-base uppercase tracking-tight text-white">
                          Registered Event Participants · {selectedDistance}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                          Confirmed participants. Official timings appear on the Leaderboard tab upon GPS verification.
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        Official Challenge Roster
                      </span>
                    </div>

                    {/* 📱 Mobile Participant Card View */}
                    <div className="block sm:hidden divide-y divide-white/5 p-3 space-y-2.5">
                      {filteredParticipants.map((p, idx) => {
                        const isYou =
                          Boolean(currentClerkId && p.clerkId === currentClerkId) ||
                          Boolean(user?.fullName && p.runnerName.toLowerCase() === user.fullName.toLowerCase());

                        return (
                          <div
                            key={`mob-part-${p.rosterNumber}-${p.bibNumber}`}
                            className={`rounded-2xl border p-3 transition-all ${isYou
                                ? "bg-[#e64833]/15 border-[#e64833]/50"
                                : "bg-white/[0.03] border-white/10"
                              }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.08] text-xs font-bold text-slate-300 font-mono">
                                  #{idx + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-bold text-xs text-white flex items-center gap-1.5">
                                    {p.runnerName}
                                    {isYou && (
                                      <span className="rounded-full bg-[#e64833] px-1.5 py-0.2 text-[0.55rem] font-bold uppercase tracking-wider text-white">
                                        You
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-[0.65rem] text-slate-400 font-mono mt-0.5 truncate">
                                    {p.bibNumber} {p.city && `· ${p.city}`}
                                  </p>
                                </div>
                              </div>

                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider border shrink-0 ${p.status === "Verified Finisher"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                    : p.status === "Under Review"
                                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                      : "bg-[#90aead]/15 text-[#90aead] border-[#90aead]/30"
                                  }`}
                              >
                                {p.status === "Verified Finisher" ? (
                                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                ) : (
                                  <Clock className="h-3 w-3 text-[#90aead]" />
                                )}
                                {p.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* 💻 Desktop Participant Table */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/[0.02] text-[0.65rem] font-black uppercase tracking-wider text-slate-400">
                            <th className="px-4 py-3.5">#</th>
                            <th className="px-4 py-3.5">Runner Name</th>
                            <th className="px-4 py-3.5">Bib Number</th>
                            <th className="px-4 py-3.5">City</th>
                            <th className="px-4 py-3.5">Distance</th>
                            <th className="px-4 py-3.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredParticipants.map((p, idx) => {
                            const isYou =
                              Boolean(currentClerkId && p.clerkId === currentClerkId) ||
                              Boolean(user?.fullName && p.runnerName.toLowerCase() === user.fullName.toLowerCase());

                            return (
                              <tr
                                key={`${p.rosterNumber}-${p.bibNumber}`}
                                className={`transition-colors hover:bg-white/[0.04] ${isYou ? "bg-[#e64833]/15 font-semibold" : ""
                                  }`}
                              >
                                <td className="px-4 py-3.5 font-mono text-xs text-slate-400 font-bold">
                                  {idx + 1}
                                </td>
                                <td className="px-4 py-3.5">
                                  <div className="flex items-center gap-2.5">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-xs font-bold text-white border border-white/10">
                                      {getInitials(p.runnerName)}
                                    </div>
                                    <p className="font-bold text-white flex items-center gap-1.5 text-xs sm:text-sm">
                                      {p.runnerName}
                                      {isYou && (
                                        <span className="rounded-full bg-[#e64833] px-2 py-0.2 text-[0.6rem] font-bold uppercase tracking-wider text-white">
                                          You
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-4 py-3.5 font-mono text-xs font-bold text-white">
                                  {p.bibNumber}
                                </td>
                                <td className="px-4 py-3.5 text-xs text-slate-300 font-medium">
                                  {p.city || "India"}
                                </td>
                                <td className="px-4 py-3.5 text-xs font-bold text-white">
                                  {p.distance}
                                </td>
                                <td className="px-4 py-3.5">
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider border ${p.status === "Verified Finisher"
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                        : p.status === "Under Review"
                                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                          : "bg-[#90aead]/15 text-[#90aead] border-[#90aead]/30"
                                      }`}
                                  >
                                    {p.status === "Verified Finisher" ? (
                                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                    ) : (
                                      <Clock className="h-3 w-3 text-[#90aead]" />
                                    )}
                                    {p.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {filteredParticipants.length === 0 && (
                      <div className="py-12 text-center text-sm font-medium text-slate-400">
                        No registered runners found for {selectedDistance}.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── SECTION 3: CLAIM YOUR RANK / GPS BANNER (WARM IVORY #fbf6ee) ── */}
      <section className="relative py-16 sm:py-20 bg-[#fbf6ee] text-[#14242a] overflow-hidden isolate border-b border-[#90aead]/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-[#90aead]/30 bg-white p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center md:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e64833]/30 bg-[#e64833]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#e64833]">
                <Zap className="h-3.5 w-3.5" />
                CLAIM YOUR TIMING
              </span>
              <h2 className="mt-4 font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-[#14242a]">
                WANT YOUR NAME ON THE <span className="text-[#e64833]">LEADERBOARD?</span>
              </h2>
              <p className="mt-3 text-sm text-[#244855] font-medium leading-relaxed">
                Upload your Strava or Garmin GPS activity proof from the dashboard to claim your verified ranking, pace splits, and medal dispatch.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Link
                href="/dashboard"
                className="neon-btn-blue inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-xs font-black uppercase tracking-wider text-[#fbe9d0] shadow-xl hover:scale-105 active:scale-95 transition-transform"
              >
                <span>Upload GPS Proof</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#90aead]/30 bg-[#fbf6ee] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#244855] hover:bg-[#fbe9d0]/60 transition-all"
              >
                <span>Browse Races</span>
                <ArrowUpRight className="h-4 w-4 text-[#90aead]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
