"use client";

import { Award, CheckCircle2, ChevronRight, FileBadge, Gift, MapPinned, Smartphone, Trophy, Upload, Zap } from "lucide-react";

const steps = [
  {
    step: "01",
    badge: "Challenge Registration",
    title: "Choose Distance & Reserve Entry",
    description:
      "Select your challenge distance (1.5K, 3K, 5K, 10K, or 21K Half Marathon). Secure your confirmed race slot with instant official bib number reservation.",
    tags: ["1.5K • 3K • 5K • 10K • 21K", "Official Bib Reserved", "All Fitness Levels"],
    icon: MapPinned,
    accent: "text-[#ff4b26]",
    glow: "rgba(255,75,38,0.35)",
    borderGlow: "hover:border-[#ff4b26]/60",
    pillStyle: "border-[#ff4b26]/30 bg-[#ff4b26]/10 text-orange-300",
  },
  {
    step: "02",
    badge: "Universal GPS Tracking",
    title: "Run Anywhere & Upload Activity",
    description:
      "Run outdoors on roads, trails, or indoors on a treadmill. Track with Strava, Garmin, Apple Watch, or Nike Run Club and upload your activity screenshot in 30 seconds.",
    tags: ["Strava & Garmin Synced", "Apple Watch & Nike NRC", "Treadmill Friendly"],
    icon: Smartphone,
    accent: "text-sky-400",
    glow: "rgba(56,189,248,0.3)",
    borderGlow: "hover:border-sky-500/50",
    pillStyle: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  },
  {
    step: "03",
    badge: "Complete Finisher Trophy Kit",
    title: "Unbox 3D Medal & Finisher Pack",
    description:
      "GPS approval immediately unlocks your downloadable official race bib & verifiable QR E-Certificate. Your handcrafted 3D solid metal medal and exclusive finisher rewards pack are dispatched to your door.",
    tags: ["Solid 3D Metal Trophy", "Downloadable Bib & E-Cert", "Finisher Swag & Rewards", "Free Tracked Delivery"],
    icon: Trophy,
    accent: "text-amber-400",
    glow: "rgba(251,191,36,0.35)",
    borderGlow: "hover:border-amber-500/50",
    pillStyle: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  },
];

export function HomeSteps() {
  return (
    <section id="how-it-works" className="relative py-12 sm:py-20 bg-[#080c10] text-[#f8fafc] border-t border-white/10 overflow-hidden scroll-mt-24">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[350px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff4b26]/5 blur-[140px]" />

      <div className="container-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-9 sm:mb-14">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ff4b26]/40 bg-[#ff4b26]/10 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-[#ff4b26] shadow-sm">
            <Zap className="h-3.5 w-3.5 fill-[#ff4b26]" />
            HOW RUNNERUP WORKS
          </span>
          <h2 className="mt-3.5 font-display font-black text-2xl xs:text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-white leading-tight">
            THREE STEPS TO YOUR <span className="text-[#ff4b26] italic">FINISHER KIT</span>
          </h2>
          <p className="mt-2.5 sm:mt-3 text-xs sm:text-base text-slate-400 font-medium max-w-xl leading-relaxed">
            Zero friction from race sign-up to delivery. Run anywhere across India on your own schedule.
          </p>
        </div>

        {/* ─── MOBILE VIEW (< md): Connected Vertical Energy Rail ─── */}
        <div className="relative block md:hidden max-w-lg mx-auto">
          {/* Vertical Glowing Connector Line */}
          <div className="absolute left-5 top-8 bottom-8 w-[2px] bg-gradient-to-b from-[#ff4b26] via-sky-400 to-amber-400 opacity-60 z-0" />

          <div className="space-y-5 relative z-10">
            {steps.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="flex items-start gap-3.5 group">
                  {/* Glowing Node on Rail */}
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-[#0d141d] font-mono text-xs font-black text-white shadow-lg transition-transform group-hover:scale-105"
                    style={{ boxShadow: `0 0 14px ${item.glow}` }}
                  >
                    <span className={item.accent}>{item.step}</span>
                  </div>

                  {/* Card Content */}
                  <div className={`flex-1 rounded-2xl border border-white/10 bg-[#0d141d]/90 backdrop-blur-xl p-4 shadow-xl transition-all ${item.borderGlow}`}>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${item.pillStyle}`}>
                        {item.badge}
                      </span>
                      <Icon className={`h-4 w-4 ${item.accent}`} />
                    </div>

                    <h3 className="font-display font-black text-sm text-white uppercase tracking-tight leading-snug">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-400 leading-relaxed font-medium">
                      {item.description}
                    </p>

                    {/* Tags */}
                    <div className="mt-3 flex flex-wrap gap-1.5 pt-2.5 border-t border-white/10">
                      {item.tags.map((tag) => (
                        <span key={tag} className="rounded-md bg-white/[0.04] border border-white/5 px-2 py-0.5 text-[9.5px] font-medium text-slate-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── DESKTOP VIEW (>= md): 3 Optimized Connected Cards (Zero-Lag Pure CSS) ─── */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#0d141d]/90 backdrop-blur-xl p-6 lg:p-7 shadow-2xl transition-all duration-300 ${item.borderGlow} hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.7)]`}
              >
                {/* Micro Ambient Glow */}
                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
                  style={{ backgroundColor: item.glow }}
                />

                <div>
                  {/* Step Top: Icon + Number Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-inner transition-transform group-hover:scale-105"
                      style={{ boxShadow: `0 0 20px ${item.glow}` }}
                    >
                      <Icon className={`h-6 w-6 ${item.accent}`} strokeWidth={2.2} />
                    </div>
                    <span className="font-mono font-black text-2xl lg:text-3xl text-white/20 group-hover:text-white/45 transition-colors">
                      {item.step}
                    </span>
                  </div>

                  {/* Micro Pill Badge */}
                  <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-2 ${item.pillStyle}`}>
                    {item.badge}
                  </span>

                  {/* Title */}
                  <h3 className="font-display font-black text-lg lg:text-xl uppercase tracking-tight text-white transition-colors group-hover:text-white leading-snug">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-400 font-medium">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Tags */}
                <div className="mt-5 pt-3.5 border-t border-white/10 flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span key={tag} className="rounded-md bg-white/[0.04] border border-white/5 px-2 py-0.5 text-[9.5px] lg:text-[10px] font-medium text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Kinetic bottom accent line */}
                <div className="mt-3.5 h-[2px] w-12 rounded-full bg-white/10 group-hover:w-full group-hover:bg-[#ff4b26] transition-all duration-500" />
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
