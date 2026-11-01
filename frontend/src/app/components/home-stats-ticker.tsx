"use client";

import { Award, ShieldCheck, Star, Users } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "18,500+",
    label: "Registered Runners",
    subtext: "Across 28+ Indian states & UTs",
    accent: "text-sky-400",
    glow: "rgba(56,189,248,0.35)",
    topBorder: "bg-sky-400 shadow-[0_0_12px_#38bdf8]",
    cardBorder: "border-sky-500/20 hover:border-sky-500/50",
  },
  {
    icon: Award,
    value: "14,200+",
    label: "Metal Medals Shipped",
    subtext: "100% Free Doorstep Delivery",
    accent: "text-[#ff4b26]",
    glow: "rgba(255,75,38,0.45)",
    topBorder: "bg-[#ff4b26] shadow-[0_0_12px_#ff4b26]",
    cardBorder: "border-[#ff4b26]/30 hover:border-[#ff4b26]/60",
  },
  {
    icon: ShieldCheck,
    value: "99.2%",
    label: "GPS Verification Rate",
    subtext: "Strava, Garmin, Apple & NRC",
    accent: "text-emerald-400",
    glow: "rgba(34,197,94,0.35)",
    topBorder: "bg-emerald-400 shadow-[0_0_12px_#22c55e]",
    cardBorder: "border-emerald-500/20 hover:border-emerald-500/50",
  },
  {
    icon: Star,
    value: "4.9 / 5.0",
    label: "Runner Satisfaction",
    subtext: "From 2,800+ Verified Reviews",
    accent: "text-amber-400 fill-amber-400",
    glow: "rgba(251,191,36,0.35)",
    topBorder: "bg-amber-400 shadow-[0_0_12px_#facc15]",
    cardBorder: "border-amber-500/20 hover:border-amber-500/50",
  },
];

export function HomeStatsTicker() {
  return (
    <section className="relative z-20 pt-6 sm:pt-14 mb-8 sm:mb-14 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* 4 Elevated Athletic Performance Metric Tiles (Zero-Lag Pure CSS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border bg-[#0d141d]/90 backdrop-blur-xl p-4 sm:p-6 shadow-[0_16px_40px_rgba(0,0,0,0.65)] transition-all duration-300 hover:-translate-y-1 ${stat.cardBorder}`}
            >
              {/* Luminous Top Accent Bar */}
              <div className={`absolute top-0 inset-x-0 h-[2.5px] ${stat.topBorder}`} />

              <div className="flex flex-col items-center text-center">
                {/* Icon Circle */}
                <div
                  className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 mb-2.5 sm:mb-3 shadow-inner transition-transform group-hover:scale-105"
                  style={{ boxShadow: `0 0 16px ${stat.glow}` }}
                >
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.accent}`} />
                </div>

                {/* Giant Value */}
                <span className="font-display font-black text-2xl xs:text-3xl sm:text-4xl lg:text-4xl text-white tracking-tight leading-none drop-shadow-sm">
                  {stat.value}
                </span>

                {/* Metric Label */}
                <span className="mt-2 text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#f8fafc]">
                  {stat.label}
                </span>

                {/* Subtext */}
                <span className="mt-1 text-[10px] sm:text-xs text-slate-400 font-medium leading-tight">
                  {stat.subtext}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
