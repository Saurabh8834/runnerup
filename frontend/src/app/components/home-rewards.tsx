"use client";

import { FileBadge, Medal, Shirt, Trophy, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

const rewards: { title: string; text: string; icon: LucideIcon; badge: string }[] = [
  {
    title: "Heavy Metal Finisher Medal",
    text: "Custom-engraved physical 3D metal medal delivered straight to your home after activity verification.",
    icon: Medal,
    badge: "Die-Cast Metal",
  },
  {
    title: "Official E-Certificate",
    text: "Instant high-resolution digital certificate with your official timing, splits, and QR verification.",
    icon: FileBadge,
    badge: "Verifiable QR",
  },
  {
    title: "DRI-FIT Performance Shirt",
    text: "Breathable technical running tee included in premium event registration packages.",
    icon: Shirt,
    badge: "Athletic Grade",
  },
  {
    title: "Leaderboard & Stats",
    text: "Official ranking on national leaderboards with Strava activity sync and shareable social cards.",
    icon: Trophy,
    badge: "All-India Rank",
  },
];

export function HomeRewards() {
  return (
    <section className="relative py-20 sm:py-24 bg-[#172c34] text-[#fbe9d0] overflow-hidden border-t border-[#90aead]/15">
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute bottom-0 right-1/4 -z-10 h-[350px] w-[500px] rounded-full bg-[#244855]/40 blur-[130px]" />

      <div className="container-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e64833]/40 bg-[#e64833]/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#e64833] shadow-sm">
            <Sparkles className="h-3.5 w-3.5 fill-[#e64833]" />
            FINISHER REWARDS PACKAGE
          </span>
          <h2 className="mt-4 font-display font-black text-2xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-[#fbe9d0] leading-tight">
            REWARDS THAT MAKE THE <span className="text-[#e64833] italic">FINISH REAL</span>
          </h2>
          <p className="mt-2.5 sm:mt-4 text-xs sm:text-base text-[#90aead] font-medium max-w-xl leading-relaxed">
            Every finisher deserves tangible proof of victory. Earn authentic metal medals, tech apparel, and verified timing certificates delivered across India.
          </p>
        </div>

        {/* 4 Reward Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {rewards.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.1 }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#90aead]/20 bg-[#1b323b]/90 backdrop-blur-xl p-7 shadow-2xl transition-all duration-300 hover:border-[#e64833]/50 hover:shadow-[0_12px_35px_rgba(230,72,51,0.2)] hover:-translate-y-1.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#90aead]/30 bg-[#244855] text-[#fbe9d0] shadow-md group-hover:scale-110 group-hover:bg-[#e64833] group-hover:text-white transition-all duration-300">
                      <Icon className="h-7 w-7" strokeWidth={2.2} />
                    </div>
                    <span className="rounded-full border border-[#874f41]/40 bg-[#874f41]/20 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-[#fbe9d0]">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="font-display font-black text-xl uppercase tracking-tight text-[#fbe9d0] transition-colors group-hover:text-[#e64833]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[#fbe9d0]/80 font-medium">
                    {item.text}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#90aead]/15 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#90aead] group-hover:text-[#fbe9d0] transition-colors">
                  <span>Guaranteed Quality</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
