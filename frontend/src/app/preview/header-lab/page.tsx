"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  User,
  Zap,
  Flame,
  Award,
  Trophy,
  Calendar,
  Layers,
  Palette,
  Eye,
} from "lucide-react";

export default function HeaderLabPage() {
  const [theme, setTheme] = useState<"electric" | "royal" | "aurora">("electric");
  const [style, setStyle] = useState<"floating" | "full">("floating");
  const [activeTab, setActiveTab] = useState("Home");

  const themeConfig = {
    electric: {
      name: "Electric Velocity",
      tagline: "High-adrenaline cyber athletic energy (Nike / Strava style)",
      accentText: "#ff4b26",
      btnGradient: "from-[#ff4b26] to-[#ff7844]",
      glowColor: "rgba(255, 75, 38, 0.4)",
      headlineGradient: "from-[#ff4b26] via-[#ff7844] to-[#facc15]",
      badgeBg: "bg-orange-950/60 border-orange-500/40 text-orange-300",
      activeNavBg: "bg-white/15 text-white shadow-xs",
    },
    royal: {
      name: "Royal Tricolor Prestige",
      tagline: "Imperial navy & radiant saffron glow with medal gold accents",
      accentText: "#ff6b35",
      btnGradient: "from-[#ff6b35] via-[#ff8e3c] to-[#facc15]",
      glowColor: "rgba(255, 107, 53, 0.4)",
      headlineGradient: "from-[#ff6b35] via-[#facc15] to-[#10b981]",
      badgeBg: "bg-amber-950/60 border-amber-500/40 text-amber-300",
      activeNavBg: "bg-amber-500/20 text-amber-200 border border-amber-500/30",
    },
    aurora: {
      name: "Titanium Aurora",
      tagline: "Smoked glass with sunset coral-to-violet gradient (Apple Fitness+ style)",
      accentText: "#ec4899",
      btnGradient: "from-[#ec4899] to-[#8b5cf6]",
      glowColor: "rgba(236, 72, 153, 0.4)",
      headlineGradient: "from-[#ec4899] via-[#8b5cf6] to-[#38bdf8]",
      badgeBg: "bg-purple-950/60 border-purple-500/40 text-purple-300",
      activeNavBg: "bg-pink-500/20 text-pink-200 border border-pink-500/30",
    },
  };

  const current = themeConfig[theme];

  return (
    <div className="min-h-screen bg-[#070b0e] text-[#f1f5f9] p-4 sm:p-8 space-y-8">
      {/* ── TOP LOCAL BADGE ── */}
      <div className="mx-auto max-w-5xl flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs">
        <div className="flex items-center gap-2 text-amber-300 font-bold">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span>LOCAL DESIGN LAB · Strictly Private Preview (Not Pushed to Public)</span>
        </div>
        <Link href="/" className="text-slate-400 hover:text-white underline">
          ← View Current Live Website
        </Link>
      </div>

      <div className="mx-auto max-w-5xl space-y-6">
        {/* ── DESIGN CONTROLS ── */}
        <div className="rounded-3xl border border-white/10 bg-[#0f171e]/90 p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-orange-400">Header Revamp</span>
              <h1 className="text-2xl font-black text-white">Audience-Magnetic Header Lab</h1>
            </div>

            {/* Layout Toggle */}
            <div className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => setStyle("floating")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  style === "floating"
                    ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🏝️ Floating Capsule
              </button>
              <button
                type="button"
                onClick={() => setStyle("full")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  style === "full"
                    ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                📏 Full-Width Glass
              </button>
            </div>
          </div>

          {/* Color Palettes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(["electric", "royal", "aurora"] as const).map((key) => {
              const item = themeConfig[key];
              const isSelected = theme === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTheme(key)}
                  className={`text-left p-3.5 rounded-2xl border transition-all ${
                    isSelected
                      ? "border-orange-500 bg-orange-950/30 shadow-lg scale-[1.02]"
                      : "border-white/10 bg-[#131b24]/50 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className={isSelected ? "text-orange-400 font-black" : "text-slate-400"}>
                      {item.name}
                    </span>
                    {isSelected && <span className="text-[10px] text-emerald-400">● ACTIVE</span>}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{item.tagline}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── LIVE HEADER PREVIEW AREA ── */}
        <div className="rounded-3xl border border-white/15 bg-gradient-to-b from-[#0b1218] via-[#080d12] to-[#04070a] p-4 sm:p-6 min-h-[380px] flex flex-col justify-between shadow-2xl relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-64 w-80 rounded-full bg-orange-600/15 blur-[90px] pointer-events-none" />

          {/* Header wrapper */}
          <div className="relative z-20 w-full pt-1">
            <header
              className={`w-full mx-auto transition-all duration-300 flex items-center justify-between ${
                style === "floating"
                  ? "max-w-4xl rounded-full border border-white/20 bg-[#0a0e14]/90 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.7)] py-2.5 px-4 sm:px-6"
                  : "rounded-2xl border-b border-white/15 bg-[#0a0e14]/95 backdrop-blur-2xl py-3 px-4 sm:px-6"
              }`}
            >
              {/* Brand Logo */}
              <div className="flex items-center gap-3 shrink-0">
                <Link href="/" className="flex items-center gap-2 group">
                  <svg
                    className="h-7 w-7 text-white drop-shadow-[0_0_10px_rgba(255,75,38,0.7)] group-hover:scale-105 transition-transform"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.8-1.6 8.1-4.9-.9-.4 2 6.5 1.2z" />
                  </svg>
                  <span className="text-lg font-black tracking-wider italic text-white">
                    RUNNER<span style={{ color: current.accentText }}>UP</span>
                  </span>
                </Link>

                {/* Micro Ticker */}
                <span className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[11px] font-bold text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>312 Medals Dispatching</span>
                </span>
              </div>

              {/* Navigation Items */}
              <nav className="hidden md:flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] p-1 rounded-full">
                {["Home", "Events", "Leaderboard", "Medals", "About"].map((label) => {
                  const isActive = activeTab === label;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setActiveTab(label)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? current.activeNavBg
                          : "text-slate-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </nav>

              {/* Right: Login & Radiant Shimmer CTA */}
              <div className="flex items-center gap-2.5 shrink-0">
                <Link
                  href="/sign-in"
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 rounded-full border border-white/15 hover:border-white/30 hover:bg-white/10 transition-all"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Login</span>
                </Link>

                <Link
                  href="/events"
                  className={`relative overflow-hidden inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r ${current.btnGradient} px-5 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg hover:scale-105 active:scale-95 transition-all`}
                  style={{ boxShadow: `0 0 20px ${current.glowColor}` }}
                >
                  <span>Join Now</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </header>
          </div>

          {/* Hero Simulation */}
          <div className="my-auto py-10 text-center space-y-3 relative z-10">
            <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold border ${current.badgeBg}`}>
              ⚡ India&apos;s #1 Virtual Running Experience
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-xl mx-auto leading-tight">
              PUSH YOUR LIMITS. <br />
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${current.headlineGradient}`}>
                EARN TRUE MEDALS.
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Real metal finisher medals shipped directly to your door when you complete your goal.
            </p>
          </div>

          <div className="border-t border-white/10 pt-3 flex items-center justify-between text-xs text-slate-400 relative z-10">
            <span>Palette: <strong className="text-white">{current.name}</strong></span>
            <span>Style: <strong className="text-white">{style === "floating" ? "Floating Island" : "Full Glass"}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

