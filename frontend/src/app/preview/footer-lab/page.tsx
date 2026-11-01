"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronRight,
  Compass,
  Eye,
  Flame,
  Layout,
  Radio,
  ShieldCheck,
  Sparkles,
  Trophy,
  Zap,
  Activity,
  MapPin,
} from "lucide-react";

export default function FooterLabPage() {
  const [selectedOption, setSelectedOption] = useState<"all" | "option1" | "option2" | "option3" | "option4">("all");

  return (
    <div className="min-h-screen bg-[#060a0f] text-[#f8fafc] font-sans pb-24">
      {/* ─── Top Control Header ─── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080c10]/95 backdrop-blur-xl px-4 py-3 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/10 transition-all"
            >
              <span>← Back to Home</span>
            </Link>
            <div>
              <h1 className="text-sm sm:text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#ff4b26]" />
                <span>Pre-Footer Design Comparison Lab</span>
              </h1>
              <p className="text-[11px] text-slate-400">
                Compare 4 world-class directions to replace the old footer graphic.
              </p>
            </div>
          </div>

          {/* Quick Filter Switcher */}
          <div className="flex items-center gap-1.5 rounded-2xl bg-[#0d141d] border border-white/10 p-1">
            {[
              { id: "all", label: "View All (4)" },
              { id: "option1", label: "Option 1 (CTA)" },
              { id: "option2", label: "Option 2 (Track)" },
              { id: "option3", label: "Option 3 (Live Pulse)" },
              { id: "option4", label: "Option 4 (Minimal)" },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedOption(id as typeof selectedOption)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedOption === id
                    ? "bg-[#ff4b26] text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ─── Main Content Canvas ─── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-14">

        {/* ══════════════════════════════════════════════════════════════
            OPTION 1: THE ELITE PRE-FOOTER CONVERSION BANNER (#1 REC)
        ══════════════════════════════════════════════════════════════ */}
        {(selectedOption === "all" || selectedOption === "option1") && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#ff4b26]/20 border border-[#ff4b26]/40 text-xs font-black text-[#ff4b26]">
                  1
                </span>
                <h2 className="text-lg font-black uppercase text-white tracking-tight">
                  Option 1: The Elite Athlete Pre-Footer Conversion Banner
                </h2>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                  ⭐ #1 Top Recommended
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                Nike / Apple Fitness+ / On Running Standard
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Eliminates decorative filler. Turns the transition space into a high-voltage conversion powerhouse that urges runners to sign up right before the footer.
            </p>

            {/* In-Context Card Frame */}
            <div className="rounded-3xl border border-white/10 bg-[#080c10] overflow-hidden shadow-2xl">
              {/* Fake FAQ Bottom Edge Preview */}
              <div className="bg-[#0b1017] px-6 py-4 border-b border-white/5 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>↑ FAQ SECTION ENDS HERE</span>
                <span className="text-emerald-400">✓ Seamless Transition</span>
              </div>

              {/* The Actual Option 1 Component */}
              <div className="relative py-14 sm:py-20 px-6 sm:px-12 text-center overflow-hidden bg-gradient-to-b from-[#0e1622] via-[#080c10] to-[#080c10] border-t border-white/10">
                {/* Ambient Stadium Dusk Flare */}
                <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-44 w-3/4 max-w-4xl rounded-full bg-gradient-to-b from-[#ff4b26]/25 via-[#ff4b26]/5 to-transparent blur-[80px]" />

                <div className="relative z-10 max-w-3xl mx-auto space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#ff4b26]/40 bg-[#ff4b26]/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#ff4b26]">
                    <Flame className="h-3.5 w-3.5 fill-[#ff4b26]" />
                    <span>EVERY FINISHER COUNTS • PAN-INDIA RACE SERIES</span>
                  </div>

                  <h3 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white leading-tight">
                    STOP SCROLLING. <span className="text-[#ff4b26] italic">START RUNNING.</span>
                  </h3>

                  <p className="text-xs sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed font-medium">
                    Pick your distance, sync with Strava or Garmin, and earn an authentic die-cast 3D metal finisher medal delivered free to your doorstep.
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                    <Link
                      href="/events"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff4b26] to-[#e03a16] px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-[0_10px_30px_rgba(255,75,38,0.4)] hover:brightness-110 active:scale-95 transition-all"
                    >
                      <span>Explore Open Challenges</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    <Link
                      href="/about"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-all"
                    >
                      <span>How Verification Works</span>
                    </Link>
                  </div>

                  {/* Trust Micro-Row */}
                  <div className="pt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Zero Delivery Charges</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Strava / Garmin / NRC Sync</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Official Verifiable E-Cert</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Fake Footer Top Edge Preview */}
              <div className="bg-[#05080c] px-6 py-4 border-t border-white/10 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>↓ RUNNERUP MAIN FOOTER LINKS FLOW DIRECTLY BELOW</span>
                <span className="text-slate-400">Copyright © 2026 RunnerUp</span>
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════
            OPTION 2: 3D OLYMPIC RACING TRACK HORIZON (CURRENT LOCAL)
        ══════════════════════════════════════════════════════════════ */}
        {(selectedOption === "all" || selectedOption === "option2") && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-500/20 border border-sky-500/40 text-xs font-black text-sky-400">
                  2
                </span>
                <h2 className="text-lg font-black uppercase text-white tracking-tight">
                  Option 2: 3D Olympic Championship Racing Track Horizon
                </h2>
                <span className="rounded-full bg-sky-500/20 border border-sky-500/40 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-sky-400">
                  Currently Active on Local
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                First-Person Track Perspective
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Puts the runner at the starting line looking straight down 6 perspective Olympic lanes into glowing dusk stadium floodlights, with 5K/10K/21K split arcs.
            </p>

            {/* In-Context Card Frame */}
            <div className="rounded-3xl border border-white/10 bg-[#080c10] overflow-hidden shadow-2xl">
              <div className="relative border-t border-white/10 bg-[#080c10] overflow-hidden select-none">
                {/* Stadium Dusk Fog */}
                <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-44 w-3/4 max-w-5xl rounded-full bg-gradient-to-b from-[#ff4b26]/25 via-[#ff4b26]/8 to-transparent blur-[70px]" />

                <svg viewBox="0 0 1440 280" fill="none" preserveAspectRatio="none" className="relative z-10 block w-full h-44 sm:h-56 md:h-64">
                  <defs>
                    <linearGradient id="prev_trackBed" x1="50%" y1="0%" x2="50%" y2="100%">
                      <stop offset="0%" stopColor="#080c10" />
                      <stop offset="25%" stopColor="#0d141f" />
                      <stop offset="60%" stopColor="#141f2d" />
                      <stop offset="90%" stopColor="#0d141e" />
                      <stop offset="100%" stopColor="#080c10" />
                    </linearGradient>
                    <linearGradient id="prev_floodLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.22" />
                      <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.03" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="prev_floodRight" x1="100%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ff4b26" stopOpacity="0.25" />
                      <stop offset="60%" stopColor="#ff4b26" stopOpacity="0.03" />
                      <stop offset="100%" stopColor="#ff4b26" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="prev_centerFlare" x1="50%" y1="0%" x2="50%" y2="100%">
                      <stop offset="0%" stopColor="#facc15" stopOpacity="0.8" />
                      <stop offset="40%" stopColor="#ff4b26" stopOpacity="1" />
                      <stop offset="85%" stopColor="#e03a16" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#ff4b26" stopOpacity="0.2" />
                    </linearGradient>
                    <linearGradient id="prev_finishThreshold" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ff4b26" stopOpacity="0" />
                      <stop offset="20%" stopColor="#ff4b26" stopOpacity="0.7" />
                      <stop offset="40%" stopColor="#facc15" stopOpacity="1" />
                      <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                      <stop offset="60%" stopColor="#facc15" stopOpacity="1" />
                      <stop offset="80%" stopColor="#ff4b26" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#ff4b26" stopOpacity="0" />
                    </linearGradient>
                    <pattern id="prev_kerb" width="16" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                      <rect width="8" height="8" fill="#ff4b26" />
                      <rect x="8" width="8" height="8" fill="#ffffff" />
                    </pattern>
                  </defs>

                  <rect width="1440" height="280" fill="url(#prev_trackBed)" />
                  <polygon points="120,0 0,280 480,280" fill="url(#prev_floodLeft)" />
                  <polygon points="1320,0 960,280 1440,280" fill="url(#prev_floodRight)" />

                  <path d="M 640 25 L -80 280 L -60 280 L 645 25 Z" fill="url(#prev_kerb)" opacity="0.35" />
                  <path d="M 800 25 L 1520 280 L 1500 280 L 795 25 Z" fill="url(#prev_kerb)" opacity="0.35" />

                  <line x1="670" y1="28" x2="100" y2="280" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" strokeDasharray="12 8" />
                  <line x1="690" y1="28" x2="310" y2="280" stroke="rgba(255,255,255,0.32)" strokeWidth="1.75" strokeDasharray="16 10" />
                  <line x1="710" y1="28" x2="520" y2="280" stroke="rgba(255,255,255,0.45)" strokeWidth="2" />
                  
                  <line x1="720" y1="28" x2="720" y2="280" stroke="url(#prev_centerFlare)" strokeWidth="3" />

                  <line x1="730" y1="28" x2="920" y2="280" stroke="rgba(255,255,255,0.45)" strokeWidth="2" />
                  <line x1="750" y1="28" x2="1130" y2="280" stroke="rgba(255,255,255,0.32)" strokeWidth="1.75" strokeDasharray="16 10" />
                  <line x1="770" y1="28" x2="1340" y2="280" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" strokeDasharray="12 8" />

                  <path d="M 540 75 Q 720 64 900 75" stroke="rgba(56,189,248,0.5)" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
                  <circle cx="720" cy="70" r="3" fill="#38bdf8" />

                  <path d="M 400 125 Q 720 110 1040 125" stroke="rgba(255,255,255,0.25)" strokeWidth="1.75" fill="none" />
                  <text x="720" y="115" fill="#38bdf8" fontSize="9" fontFamily="monospace" fontWeight="900" textAnchor="middle" letterSpacing="3">
                    5K SPRINT SPLIT
                  </text>

                  <path d="M 270 180 Q 720 160 1170 180" stroke="rgba(255,75,38,0.6)" strokeWidth="2" fill="none" />
                  <circle cx="720" cy="170" r="4" fill="#ff4b26" />
                  <text x="720" y="165" fill="#ff4b26" fontSize="11" fontFamily="monospace" fontWeight="900" textAnchor="middle" letterSpacing="4">
                    10K SPEED CHECKPOINT
                  </text>

                  <path d="M 120 235 Q 720 208 1320 235" stroke="url(#prev_finishThreshold)" strokeWidth="3" fill="none" />
                  <text x="720" y="226" fill="#facc15" fontSize="11" fontFamily="monospace" fontWeight="900" textAnchor="middle" letterSpacing="5">
                    🏁 21.1 KM NATIONAL FINISH LINE 🏁
                  </text>

                  <g fill="rgba(255,255,255,0.18)" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="30" textAnchor="middle" fontStyle="italic">
                    <text x="210" y="260" transform="rotate(-15 210 260)">1</text>
                    <text x="420" y="260" transform="rotate(-8 420 260)">2</text>
                    <text x="620" y="260" transform="rotate(-3 620 260)">3</text>
                    <text x="820" y="260" transform="rotate(3 820 260)">4</text>
                    <text x="1020" y="260" transform="rotate(8 1020 260)">5</text>
                    <text x="1230" y="260" transform="rotate(15 1230 260)">6</text>
                  </g>

                  <g transform="translate(0, 245)">
                    <rect x="0" y="0" width="1440" height="35" fill="#080c10" />
                    <line x1="0" y1="0" x2="1440" y2="0" stroke="url(#prev_finishThreshold)" strokeWidth="1.5" />
                  </g>
                </svg>

                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3 rounded-full border border-[#ff4b26]/40 bg-[#0d141d]/85 px-4 sm:px-5 py-1.5 backdrop-blur-xl shadow-lg">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <span className="font-display text-[10px] sm:text-xs font-black uppercase tracking-widest text-white">
                    RUNNERUP OFFICIAL RACING TRACK
                  </span>
                  <span className="hidden sm:inline-block text-[10px] text-white/30">|</span>
                  <span className="hidden sm:inline-block font-mono text-[10px] font-bold text-[#ff4b26] tracking-wider">
                    LANE 1 TO 6 • PAN-INDIA TIMING
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════
            OPTION 3: LIVE PAN-INDIA GPS ACTIVITY PULSE
        ══════════════════════════════════════════════════════════════ */}
        {(selectedOption === "all" || selectedOption === "option3") && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-xs font-black text-emerald-400">
                  3
                </span>
                <h2 className="text-lg font-black uppercase text-white tracking-tight">
                  Option 3: Live Pan-India GPS Activity Pulse
                </h2>
                <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300">
                  Social Proof Ticker
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                Real-Time Pan-India Pulse
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Provides genuine live-event energy with stream of real runners finishing, verifying, and claiming medals across Indian cities.
            </p>

            {/* In-Context Card Frame */}
            <div className="rounded-3xl border border-white/10 bg-[#080c10] overflow-hidden shadow-2xl">
              <div className="p-6 sm:p-8 bg-gradient-to-b from-[#0b1018] via-[#080c10] to-[#080c10] border-t border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      LIVE PAN-INDIA RUNNER STREAM
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <Activity className="h-3.5 w-3.5 text-[#ff4b26]" />
                    <span>STRAVA & GARMIN TELEMETRY</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="rounded-2xl border border-white/10 bg-[#0d141d]/80 p-4 backdrop-blur-md flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>Rajesh V.</span>
                        <span className="text-xs text-sky-400 font-medium">(Bengaluru)</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">21.1K Half Marathon Verified</div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      4m ago
                    </span>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#0d141d]/80 p-4 backdrop-blur-md flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>Sneha D.</span>
                        <span className="text-xs text-[#ff4b26] font-medium">(Pune)</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">10K Metal Medal Dispatched</div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      12m ago
                    </span>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#0d141d]/80 p-4 backdrop-blur-md flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>Harpreet S.</span>
                        <span className="text-xs text-purple-400 font-medium">(Chandigarh)</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">10K QR-Certificate Unlocked</div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      28m ago
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════
            OPTION 4: PURE MINIMALIST LUMINOUS HORIZON
        ══════════════════════════════════════════════════════════════ */}
        {(selectedOption === "all" || selectedOption === "option4") && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-700/50 border border-white/20 text-xs font-black text-slate-300">
                  4
                </span>
                <h2 className="text-lg font-black uppercase text-white tracking-tight">
                  Option 4: Pure Minimalist Luminous Horizon
                </h2>
                <span className="rounded-full bg-slate-700/50 border border-white/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-300">
                  Zero Clutter
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                Tesla / Linear Architecture Style
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Zero decorative drawings or cards. Just a surgical luminous neon line (`#ff4b26`) that lets the page end with total elegance.
            </p>

            {/* In-Context Card Frame */}
            <div className="rounded-3xl border border-white/10 bg-[#080c10] overflow-hidden shadow-2xl">
              <div className="py-12 px-6 text-center bg-[#080c10] relative">
                {/* Luminous Neon Velocity Razor Line */}
                <div className="h-[1.5px] w-full max-w-2xl mx-auto bg-gradient-to-r from-transparent via-[#ff4b26] to-transparent shadow-[0_0_16px_#ff4b26]" />
                
                <div className="mt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-[11px] font-mono uppercase tracking-widest text-slate-400">
                  <span>Official Race Standards</span>
                  <span>•</span>
                  <span>100% Solid Metal</span>
                  <span>•</span>
                  <span>Pan-India Doorstep Dispatch</span>
                </div>
              </div>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

