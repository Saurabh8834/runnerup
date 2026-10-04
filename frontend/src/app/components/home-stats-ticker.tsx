"use client";

import { Award, Flame, ShieldCheck, Star, Trophy, Truck, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  {
    icon: Users,
    value: "35,000+",
    label: "Registered Runners",
    subtext: "Across all Indian states",
    color: "text-[#90aead]",
    glow: "rgba(144,174,173,0.35)",
  },
  {
    icon: Award,
    value: "14,800+",
    label: "Metal Medals Shipped",
    subtext: "100% Free Doorstep Delivery",
    color: "text-[#e64833]",
    glow: "rgba(230,72,51,0.35)",
  },
  {
    icon: ShieldCheck,
    value: "99.2%",
    label: "GPS Verification Rate",
    subtext: "Strava, Garmin, Apple & NRC",
    color: "text-[#90aead]",
    glow: "rgba(144,174,173,0.35)",
  },
  {
    icon: Star,
    value: "4.9 / 5.0",
    label: "Runner Satisfaction",
    subtext: "From 2,800+ Verified Reviews",
    color: "text-[#fbe9d0] fill-[#fbe9d0]",
    glow: "rgba(251,233,208,0.35)",
  },
];

export function HomeStatsTicker() {
  return (
    <section className="relative z-20 pt-10 sm:pt-16 mb-8 sm:mb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="rounded-3xl border border-[#90aead]/20 bg-[#172c34]/95 backdrop-blur-2xl p-4 sm:p-7 shadow-[0_20px_50px_rgba(20,36,42,0.85)] grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[#90aead]/15">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`flex flex-col items-center text-center p-2.5 sm:p-4 ${
                i > 1 ? "pt-3.5 sm:pt-4" : ""
              }`}
            >
              <div
                className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl border border-[#90aead]/20 bg-[#244855]/50 mb-2 sm:mb-3 shadow-inner"
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
