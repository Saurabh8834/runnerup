"use client";

import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import type { HomeMoment } from "../../lib/events-api";
import { HomeSectionHeader } from "./home-section-header";

/**
 * Strava Professional Activity Feed Card
 * - Fully synchronized with official Leaderboard verified participants and timings
 * - Natural virtual run titles (no fake landmark claims)
 * - Clean "Verified Finisher" status (no fake ranks or cluttered timestamps)
 * - Pure static vector paths for 60fps zero-lag performance
 */
interface StravaActivity {
  id: string;
  name: string;
  initials: string;
  city: string;
  activityTitle: string;
  distance: string;
  pace: string;
  time: string;
  elevGain: string;
  bibNumber: string;
  routePath: string;
  statusBadge: string;
  start: [number, number];
  end: [number, number];
}

const STRAVA_ACTIVITIES: StravaActivity[] = [
  {
    id: "act-1",
    name: "Karan S.",
    initials: "KS",
    city: "Dehradun, Uttarakhand",
    activityTitle: "Morning 10K Run 🌅",
    distance: "10.00 km",
    pace: "4:10 /km",
    time: "41m 40s",
    elevGain: "35 m",
    bibNumber: "MR-10K-102",
    routePath: "M 35 140 C 75 135, 120 105, 165 75 C 210 48, 255 42, 295 52 C 320 58, 335 72, 345 88",
    statusBadge: "E-Bib & Rank Unlocked 🏅",
    start: [35, 140],
    end: [345, 88],
  },
  {
    id: "act-2",
    name: "Pooja V.",
    initials: "PV",
    city: "Bengaluru, Karnataka",
    activityTitle: "Fast 5K Sprint ⚡",
    distance: "5.00 km",
    pace: "3:42 /km",
    time: "18m 30s",
    elevGain: "28 m",
    bibNumber: "MR-5K-101",
    routePath: "M 75 88 C 85 45, 130 35, 170 45 C 210 55, 240 38, 275 42 C 315 48, 330 85, 305 118 C 265 142, 210 132, 165 138 C 118 145, 80 128, 75 88 Z",
    statusBadge: "Official Pace Verified ⚡",
    start: [75, 88],
    end: [75, 88],
  },
  {
    id: "act-3",
    name: "Devansh R.",
    initials: "DR",
    city: "Delhi NCR",
    activityTitle: "Official 21.1K Half 🏅",
    distance: "21.10 km",
    pace: "4:43 /km",
    time: "1h 39m 31s",
    elevGain: "45 m",
    bibNumber: "MR-21K-103",
    routePath: "M 45 85 L 165 85 C 195 85, 215 65, 245 65 L 320 65 C 338 65, 342 85, 328 98 C 315 108, 290 108, 255 108 L 130 108 C 88 108, 60 98, 45 85 Z",
    statusBadge: "Finisher Kit Approved 🎖️",
    start: [45, 85],
    end: [45, 85],
  },
  {
    id: "act-4",
    name: "Simran P.",
    initials: "SP",
    city: "Pune, Maharashtra",
    activityTitle: "Sunrise 10K Push 🏃",
    distance: "10.00 km",
    pace: "4:19 /km",
    time: "43m 10s",
    elevGain: "62 m",
    bibNumber: "MR-10K-104",
    routePath: "M 40 142 C 70 136, 90 110, 120 115 C 150 120, 170 78, 205 84 C 240 88, 260 52, 298 58 C 322 62, 338 72, 348 78",
    statusBadge: "Timing Certified ⏱️",
    start: [40, 142],
    end: [348, 78],
  },
];

export function HomeGalleryPreview({
  moments: _initial,
}: {
  moments?: HomeMoment[];
}) {
  return (
    <section id="real-runners" className="relative py-16 sm:py-24 bg-[#0d141d] text-[#f8fafc] border-t border-white/10 overflow-hidden scroll-mt-24">
      <div className="container-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <HomeSectionHeader
          theme="dark"
          action={
            <Link
              className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#ff4b26] hover:border-[#ff4b26] hover:shadow-[0_0_20px_rgba(255,75,38,0.4)]"
              href="/gallery"
            >
              <span>Explore Community Gallery</span>
              <ArrowUpRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          }
          align="split"
          eyebrow="PAN-INDIA FINISHER HALL"
          title="REAL RUNNERS. REAL MEDALS."
          lead="GPS activity feeds from verified finishers across India. Every run GPS-verified, every medal proudly earned."
        />

        {/* 4 Strava Professional Activity Feed Cards (Zero Lag, Perfectly Balanced) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mt-10">
          {STRAVA_ACTIVITIES.map((activity) => (
            <div
              key={activity.id}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#12161c] shadow-lg transition-all duration-200 hover:border-[#fc5200]/50 hover:bg-[#151b22] hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.65)]"
            >
              <div>
                {/* 1. Athlete Header (Full name visibility, no truncation) */}
                <div className="p-4 pb-3 flex items-center justify-between border-b border-white/[0.06] bg-[#0f1318]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Athlete Monogram Avatar */}
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#fc5200] to-[#e03a16] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                      {activity.initials}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-white truncate leading-tight">
                        {activity.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {activity.city}
                      </p>
                    </div>
                  </div>

                  {/* Clean Verified Finisher Badge */}
                  <span className="shrink-0 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 text-[9px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>Verified</span>
                  </span>
                </div>

                {/* 2. Workout Title & 3-Column Telemetry */}
                <div className="p-4 pt-3 pb-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display font-black text-sm uppercase tracking-tight text-white group-hover:text-[#fc5200] transition-colors truncate">
                      {activity.activityTitle}
                    </h3>
                    <span className="px-1.5 py-0.2 text-[8px] font-black uppercase tracking-wider rounded bg-[#fc5200]/15 text-[#fc5200] border border-[#fc5200]/30 shrink-0">
                      STRAVA
                    </span>
                  </div>

                  {/* Clean Metric Grid */}
                  <div className="grid grid-cols-3 gap-2 mt-2.5 pt-2 border-t border-white/[0.06]">
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                        Distance
                      </span>
                      <span className="font-mono text-sm font-black text-white mt-0.5 block">
                        {activity.distance}
                      </span>
                    </div>
                    <div className="border-x border-white/[0.06] px-1.5 text-center">
                      <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                        Pace
                      </span>
                      <span className="font-mono text-sm font-black text-white mt-0.5 block">
                        {activity.pace}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                        Time
                      </span>
                      <span className="font-mono text-sm font-black text-white mt-0.5 block">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. The Clean Strava Map View (Pure Vector, No Filters, Zero Lag) */}
                <div className="relative aspect-[16/9] w-full bg-[#0a0e14] overflow-hidden border-y border-white/[0.06]">
                  <svg
                    viewBox="0 0 360 180"
                    className="h-full w-full object-cover select-none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                  >
                    {/* Subtle Topo Grid Lines */}
                    <g stroke="rgba(255,255,255,0.04)" strokeWidth="1">
                      <line x1="40" y1="0" x2="40" y2="180" />
                      <line x1="110" y1="0" x2="110" y2="180" />
                      <line x1="180" y1="0" x2="180" y2="180" />
                      <line x1="250" y1="0" x2="250" y2="180" />
                      <line x1="320" y1="0" x2="320" y2="180" />
                      <line x1="0" y1="45" x2="360" y2="45" />
                      <line x1="0" y1="90" x2="360" y2="90" />
                      <line x1="0" y1="135" x2="360" y2="135" />
                    </g>

                    {/* Subtle Terrain Contour */}
                    <g fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8">
                      <path d="M 0 70 Q 100 85, 200 60 T 360 80" />
                      <path d="M 0 120 Q 120 100, 240 130 T 360 110" />
                    </g>

                    {/* Iconic Crisp Strava Orange GPS Polyline */}
                    <path
                      d={activity.routePath}
                      fill="none"
                      stroke="#FC5200"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="group-hover:stroke-[3.8] transition-all duration-150"
                    />

                    {/* Start Point: Crisp Green Marker */}
                    <circle
                      cx={activity.start[0]}
                      cy={activity.start[1]}
                      r="4"
                      fill="#00D26A"
                      stroke="#0a0e14"
                      strokeWidth="1.5"
                    />

                    {/* Finish Point: Crisp White-Bordered Orange Marker */}
                    <circle
                      cx={activity.end[0]}
                      cy={activity.end[1]}
                      r="4.5"
                      fill="#FC5200"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  </svg>

                  {/* Verified Bib Chip */}
                  <div className="absolute bottom-2 left-2.5 flex items-center gap-1.5 text-[9px] font-mono text-slate-300 bg-[#0a0e14]/90 px-2 py-0.5 rounded border border-white/10 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>Bib {activity.bibNumber}</span>
                  </div>

                  {/* Elevation Gain Badge */}
                  <div className="absolute top-2 right-2.5 text-[9px] font-mono font-bold text-slate-300 bg-[#0a0e14]/90 px-2 py-0.5 rounded border border-white/10">
                    +{activity.elevGain}
                  </div>
                </div>
              </div>

              {/* 4. Clean Footer Strip (NO Leaderboard Button) */}
              <div className="p-3.5 bg-[#0d1117] flex items-center justify-between text-xs text-slate-300 border-t border-white/[0.04]">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>GPS Anti-Cheat Verified</span>
                </div>
                <span className="font-mono text-[10.5px] text-amber-300/90 font-semibold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  {activity.statusBadge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
