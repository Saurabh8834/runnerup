"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { motion, useReducedMotion } from "framer-motion";
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
import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiUrl } from "../../lib/api";
import { publicEvents } from "../data/events";

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

// ── 3D Stepped Podium Component (Authentic Isometric Pillars & Avatar Crowns) ──
function Podium3D({
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
    <div className="relative mx-auto w-full max-w-xl px-2 py-4">
      {/* Radiant Glow behind Podium */}
      <div className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 h-56 w-72 rounded-full bg-[#fbe9d0]/15 blur-[80px]" />
      <div className="pointer-events-none absolute left-1/2 bottom-0 -translate-x-1/2 h-20 w-80 rounded-full bg-[#e64833]/20 blur-[60px]" />

      {/* 3D Pillars Grid: 2nd (Left), 1st (Center), 3rd (Right) */}
      <div className="relative z-10 flex items-end justify-center gap-1.5 sm:gap-4 pt-12 pb-2">
        
        {/* ═══ 2nd Place Pillar (Left) ═══ */}
        {topThree.second ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-1 min-w-0 flex-col items-center max-w-[100px] sm:max-w-[170px]"
          >
            {/* Avatar */}
            <div className="relative mb-1.5 sm:mb-2">
              <div className="flex h-11 w-11 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-tr from-slate-200 via-slate-400 to-slate-200 text-slate-950 font-black text-xs sm:text-base ring-2 sm:ring-3 ring-slate-300 shadow-[0_0_15px_rgba(203,213,225,0.4)]">
                {getInitials(topThree.second.runnerName)}
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-slate-300 text-[0.55rem] sm:text-xs font-black text-slate-950 shadow">
                2
              </span>
            </div>

            {/* Runner Name */}
            <p className="w-full truncate text-center text-[11px] sm:text-sm font-bold text-slate-200">
              {topThree.second.runnerName}
            </p>

            {/* Time / Pace Badge */}
            <div className="mt-1 mb-2 inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2 sm:px-2.5 py-0.5 text-[0.55rem] sm:text-[0.68rem] font-bold text-slate-300 backdrop-blur-md shadow-sm whitespace-nowrap">
              <span>{formatTime(topThree.second.finishTimeSeconds)}</span>
              <Flame className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-orange-400 fill-orange-400" />
            </div>

            {/* 3D Pillar Box #2 */}
            <div className="relative w-full">
              {/* 3D Top Bevel Face */}
              <div className="h-4 sm:h-6 w-full rounded-t-xl bg-gradient-to-r from-slate-400/50 via-slate-300/40 to-slate-500/50 border-t border-x border-white/30 shadow-inner" />
              {/* Front Face */}
              <div className="relative flex h-24 sm:h-36 md:h-40 w-full items-center justify-center rounded-b-2xl bg-gradient-to-b from-slate-700/80 via-slate-800/95 to-[#0b101c] border-x border-b border-white/15 shadow-[0_15px_30px_rgba(0,0,0,0.6)]">
                <span className="font-display font-black text-3xl sm:text-6xl text-slate-400/60 select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  2
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 min-w-0 max-w-[100px] sm:max-w-[170px]" />
        )}

        {/* ═══ 1st Place Pillar (Center - Tallest) ═══ */}
        {topThree.first && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-1 min-w-0 flex-col items-center max-w-[115px] sm:max-w-[190px] -mt-5 sm:-mt-6"
          >
            {/* Floating Crown / Trophy on Top */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="mb-1 flex items-center justify-center"
            >
              <span className="text-xl sm:text-3xl drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]">
                🏆
              </span>
            </motion.div>

            {/* Avatar */}
            <div className="relative mb-1.5 sm:mb-2">
              <div className="flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-tr from-amber-300 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm sm:text-xl ring-3 sm:ring-4 ring-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.7)]">
                {getInitials(topThree.first.runnerName)}
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-[0.65rem] sm:text-sm font-black text-slate-950 shadow-md">
                1
              </span>
            </div>

            {/* Runner Name */}
            <p className="w-full truncate text-center text-xs sm:text-sm font-black uppercase tracking-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              {topThree.first.runnerName}
            </p>

            {/* Time / Pace Badge */}
            <div className="mt-1 mb-2 inline-flex items-center gap-1 rounded-full border border-amber-400/50 bg-amber-500/20 px-2 sm:px-3 py-0.5 text-[0.6rem] sm:text-xs font-black text-amber-300 backdrop-blur-md shadow-[0_0_10px_rgba(251,191,36,0.3)] whitespace-nowrap">
              <span>{formatTime(topThree.first.finishTimeSeconds)}</span>
              <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-400 fill-amber-400" />
            </div>

            {/* 3D Pillar Box #1 */}
            <div className="relative w-full">
              {/* 3D Top Bevel Face */}
              <div className="h-5 sm:h-7 w-full rounded-t-xl bg-gradient-to-r from-amber-300/60 via-yellow-200/50 to-amber-400/60 border-t border-x border-amber-300/60 shadow-inner" />
              {/* Front Face */}
              <div className="relative flex h-32 sm:h-48 md:h-52 w-full items-center justify-center rounded-b-2xl bg-gradient-to-b from-slate-600/90 via-slate-800 to-[#14242a] border-x border-b border-amber-400/40 shadow-[0_20px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(251,191,36,0.2)]">
                <span className="font-display font-black text-4xl sm:text-7xl text-white/90 select-none drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">
                  1
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ 3rd Place Pillar (Right) ═══ */}
        {topThree.third ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-1 min-w-0 flex-col items-center max-w-[100px] sm:max-w-[170px]"
          >
            {/* Avatar */}
            <div className="relative mb-1.5 sm:mb-2">
              <div className="flex h-11 w-11 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-tr from-[#874f41] via-[#a36152] to-[#874f41] text-[#fbe9d0] font-black text-xs sm:text-base ring-2 sm:ring-3 ring-[#874f41] shadow-[0_0_15px_rgba(135,79,65,0.4)]">
                {getInitials(topThree.third.runnerName)}
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-[#874f41] text-[0.55rem] sm:text-xs font-black text-[#fbe9d0] shadow">
                3
              </span>
            </div>

            {/* Runner Name */}
            <p className="w-full truncate text-center text-[11px] sm:text-sm font-bold text-[#fbe9d0]">
              {topThree.third.runnerName}
            </p>

            {/* Time / Pace Badge */}
            <div className="mt-1 mb-2 inline-flex items-center gap-1 rounded-full border border-[#874f41]/40 bg-[#874f41]/20 px-2 sm:px-2.5 py-0.5 text-[0.55rem] sm:text-[0.68rem] font-bold text-[#fbe9d0] backdrop-blur-md shadow-sm whitespace-nowrap">
              <span>{formatTime(topThree.third.finishTimeSeconds)}</span>
              <Flame className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#e64833] fill-[#e64833]" />
            </div>

            {/* 3D Pillar Box #3 */}
            <div className="relative w-full">
              {/* 3D Top Bevel Face */}
              <div className="h-4 sm:h-6 w-full rounded-t-xl bg-gradient-to-r from-[#874f41]/60 via-[#a36152]/50 to-[#874f41]/60 border-t border-x border-[#874f41]/40 shadow-inner" />
              {/* Front Face */}
              <div className="relative flex h-20 sm:h-28 md:h-32 w-full items-center justify-center rounded-b-2xl bg-gradient-to-b from-slate-800/80 via-slate-900/95 to-[#14242a] border-x border-b border-[#874f41]/30 shadow-[0_15px_30px_rgba(0,0,0,0.6)]">
                <span className="font-display font-black text-2xl sm:text-5xl text-[#874f41] select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  3
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 min-w-0 max-w-[100px] sm:max-w-[170px]" />
        )}
      </div>

      {/* Base Podium Shadow */}
      <div className="mx-auto h-3 w-4/5 rounded-full bg-black/60 blur-md -mt-1" />
    </div>
  );
}

export function LeaderboardClient() {
  const searchParams = useSearchParams();
  const initialEventParam = searchParams.get("event") || "";
  const initialDistanceParam = searchParams.get("distance") || "";

  const reduce = useReducedMotion();
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

  // Load leaderboard & participants data for the selected event & distance
  const loadLeaderboard = useCallback(async () => {
    if (!selectedSlug) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const distQuery = selectedDistance ? `?distance=${encodeURIComponent(selectedDistance)}` : "";
      const response = await fetch(
        getApiUrl(`/api/registrations/leaderboard/${encodeURIComponent(selectedSlug)}${distQuery}`),
      );

      if (!response.ok) {
        throw new Error("Could not load leaderboard data");
      }

      const json = await response.json();
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

      {/* ── SECTION 1: HERO & CONTROLS (WARM IVORY #fbf6ee) ──────────── */}
      <section className="relative overflow-hidden border-b border-[#90aead]/20 pt-24 pb-12 sm:pt-28 sm:pb-16 isolate text-[#14242a] bg-[#fbf6ee]">
        <div aria-hidden className="pointer-events-none absolute top-1/3 left-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-[#90aead]/25 blur-[140px]" />
        <div aria-hidden className="pointer-events-none absolute bottom-0 right-10 -z-10 h-[250px] w-[250px] rounded-full bg-[#e64833]/15 blur-[100px]" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e64833]/40 bg-[#e64833]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#e64833] mb-4 shadow-sm">
              <Trophy className="h-3.5 w-3.5" />
              OFFICIAL NATIONAL LEADERBOARD
            </span>
            <h1 className="font-display font-black text-4xl sm:text-6xl uppercase tracking-tight text-[#14242a]">
              THE FINISHERS&apos;{" "}
              <span className="text-[#e64833]">
                BOARD
              </span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-[#244855]/90 max-w-xl mx-auto font-medium leading-relaxed">
              Explore real-time rankings across all distance categories. Every finish is verified with Strava & Garmin GPS tracking.
            </p>
          </motion.div>

          {/* Filter Bar Box */}
          <div className="mt-10 rounded-3xl border border-[#90aead]/20 bg-white p-5 sm:p-7 shadow-xl space-y-5">
            {/* Event Selector & Search Input */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              {/* Event Select */}
              <div className="lg:col-span-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#244855] mb-2">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-[#e64833]" /> Select Event
                  </span>
                </label>
                <div className="relative">
                  <select
                    className="w-full rounded-2xl border border-[#90aead]/20 bg-[#fbf6ee] px-4 py-3 text-sm font-bold text-[#14242a] outline-none transition focus:border-[#e64833] focus:ring-2 focus:ring-[#e64833]/20 cursor-pointer"
                    value={selectedSlug}
                    onChange={(e) => {
                      setSelectedSlug(e.target.value);
                      setSearchQuery("");
                    }}
                  >
                    {events.map((ev) => (
                      <option key={ev.slug} value={ev.slug} className="bg-white text-[#14242a]">
                        {ev.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Instant Search Bar */}
              <div className="lg:col-span-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#244855] mb-2">
                  <span className="flex items-center gap-1.5">
                    <Search className="h-4 w-4 text-[#e64833]" /> Search Runner, City or Bib #
                  </span>
                </label>
                <div className="relative flex items-center">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#90aead]"
                  />
                  <input
                    type="text"
                    placeholder="Search runner name, city, or bib (e.g. MR-5K-101)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-2xl border border-[#90aead]/20 bg-[#fbf6ee] pl-11 pr-10 py-3 text-sm text-[#14242a] placeholder-[#90aead]/60 outline-none transition focus:border-[#e64833] focus:ring-2 focus:ring-[#e64833]/20"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#90aead] hover:bg-slate-200 hover:text-[#14242a] cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Distance Category Pills */}
            <div className="pt-2 border-t border-[#90aead]/15">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#90aead]">
                Choose Distance Category:
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
                      className={`group relative flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer select-none ${
                        isSelected
                          ? "bg-gradient-to-r from-[#e64833] to-[#c93b27] text-[#fbe9d0] shadow-lg shadow-[#e64833]/30 border border-[#e64833]"
                          : "border border-[#90aead]/20 bg-[#fbf6ee] text-[#244855] hover:border-[#90aead]/40 hover:bg-[#f5ecdd]"
                      }`}
                    >
                      <Ruler className={`h-3.5 w-3.5 ${isSelected ? "text-[#fbe9d0]" : "text-[#90aead] group-hover:text-[#e64833]"}`} />
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
          </div>
        </div>
      </section>

      {/* ── SECTION 2: PODIUM & RANKINGS TABLE (DARK #14242a) ────────── */}
      <section className="relative py-16 sm:py-20 bg-[#14242a] text-[#fbe9d0] border-b border-[#90aead]/15 overflow-hidden isolate">
        <div aria-hidden className="pointer-events-none absolute top-1/2 left-10 -z-10 h-[350px] w-[350px] -translate-y-1/2 rounded-full bg-[#244855]/30 blur-[130px]" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">

          {/* Dual Tab Switcher & GPS Badge */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[#90aead]/15 pb-5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("verified")}
                className={`flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "verified"
                    ? "bg-[#e64833] text-white shadow-md shadow-[#e64833]/20 border border-[#e64833]"
                    : "border border-[#90aead]/20 bg-[#172c34] text-[#fbe9d0]/80 hover:border-[#90aead]/40"
                }`}
              >
                <Trophy className="h-4 w-4 shrink-0" />
                <span>Verified Leaderboard</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("participants")}
                className={`flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "participants"
                    ? "bg-[#e64833] text-white shadow-md shadow-[#e64833]/20 border border-[#e64833]"
                    : "border border-[#90aead]/20 bg-[#172c34] text-[#fbe9d0]/80 hover:border-[#90aead]/40"
                }`}
              >
                <Users className="h-4 w-4 shrink-0" />
                <span>Event Roster</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 bg-white/[0.06] px-3.5 py-1.5 rounded-full border border-white/10 shadow-xs w-fit">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>GPS Timestamp Verified</span>
            </div>
          </div>

          {/* User's Personal Recognition Banner */}
          {isLoaded && isSignedIn && !loading && (
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

                      <Podium3D
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
                        {filteredEntries.length} verified runner{filteredEntries.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    {/* 📱 MOBILE CARD VIEW (Under 640px) */}
                    <div className="block sm:hidden divide-y divide-white/5 p-3 space-y-2.5">
                      {filteredEntries.map((row, idx) => {
                        const isYou =
                          Boolean(currentClerkId && row.clerkId === currentClerkId) ||
                          Boolean(user?.fullName && row.runnerName.toLowerCase() === user.fullName.toLowerCase());

                        return (
                          <motion.div
                            key={`mob-${row.rank}-${row.bibNumber || row.runnerName}`}
                            initial={reduce ? false : { opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.25) }}
                            className={`rounded-2xl border p-3.5 transition-all ${
                              isYou
                                ? "bg-[#e64833]/15 border-[#e64833]/50 shadow-md shadow-[#e64833]/10"
                                : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              {/* Rank & Runner Details */}
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <span
                                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                                    row.rank === 1
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
                          </motion.div>
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
                          {filteredEntries.map((row, idx) => {
                            const isYou =
                              Boolean(currentClerkId && row.clerkId === currentClerkId) ||
                              Boolean(user?.fullName && row.runnerName.toLowerCase() === user.fullName.toLowerCase());

                            return (
                              <motion.tr
                                key={`${row.rank}-${row.bibNumber || row.runnerName}`}
                                initial={reduce ? false : { opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.3) }}
                                className={`transition-colors hover:bg-white/[0.04] ${
                                  isYou ? "bg-[#e64833]/15 font-semibold" : ""
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
                              </motion.tr>
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
                        {filteredParticipants.length} runner{filteredParticipants.length === 1 ? "" : "s"}
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
                            className={`rounded-2xl border p-3 transition-all ${
                              isYou
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
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider border shrink-0 ${
                                  p.status === "Verified Finisher"
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
                                className={`transition-colors hover:bg-white/[0.04] ${
                                  isYou ? "bg-[#e64833]/15 font-semibold" : ""
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
                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider border ${
                                      p.status === "Verified Finisher"
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
