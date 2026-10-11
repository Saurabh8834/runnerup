"use client";

import { Award, Flame, ShieldCheck, Star, Trophy, Truck, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  {
    icon: Users,
    value: "35,000+",
    label: "Registered Runners",
    subtext: "Across all Indian states",
    color: "text-[#00dfc4]",
    glow: "rgba(0,223,196,0.35)",
  },
  {
    icon: Award,
    value: "14,800+",
    label: "Metal Medals Shipped",
    subtext: "100% Free Doorstep Delivery",
    color: "text-[#00dfc4]",
    glow: "rgba(0,223,196,0.35)",
  },
  {
    icon: ShieldCheck,
    value: "99.2%",
    label: "GPS Verification Rate",
    subtext: "Strava, Garmin, Apple & NRC",
    color: "text-[#00dfc4]",
    glow: "rgba(0,223,196,0.35)",
  },
  {
    icon: Star,
    value: "4.9 / 5.0",
    label: "Runner Satisfaction",
    subtext: "From 2,800+ Verified Reviews",
    color: "text-amber-400 fill-amber-400",
    glow: "rgba(251,191,36,0.35)",
  },
];

export function HomeStatsTicker() {
  return (
    <section className="relative z-20 pt-8 sm:pt-16 mb-8 sm:mb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="rounded-3xl border border-[#00dfc4]/20 bg-[#071922]/95 backdrop-blur-xl p-3 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.85)] grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6 sm:divide-x divide-white/10">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl bg-white/[0.02] sm:bg-transparent border border-white/5 sm:border-0"
            >
              <div
                className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl border border-[#00dfc4]/30 bg-[#00dfc4]/10 mb-2 sm:mb-3 shadow-inner"
                style={{ boxShadow: `0 0 20px ${stat.glow}` }}
              >
                <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
              </div>
              <span className="font-display font-black text-xl sm:text-3xl lg:text-4xl text-[#fbe9d0] tracking-tight">
                {stat.value}
              </span>
              <span className="mt-1 text-[11px] sm:text-sm font-bold uppercase tracking-wider text-[#fbe9d0]/90">
                {stat.label}
              </span>
              <span className="mt-0.5 text-[0.65rem] sm:text-xs text-[#90aead] font-medium">
                {stat.subtext}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
