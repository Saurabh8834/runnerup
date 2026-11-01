"use client";

import { Award, CheckCircle2, FileBadge, Gift, Medal, Package, Shirt, Sparkles, Trophy, Truck } from "lucide-react";
import Link from "next/link";

export function HomeRewards() {
  return (
    <section className="relative py-16 sm:py-24 bg-[#080c10] text-[#f8fafc] overflow-hidden border-t border-white/10">
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[450px] w-[800px] rounded-full bg-[#ff4b26]/5 blur-[160px]" />

      <div className="container-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ff4b26]/40 bg-[#ff4b26]/10 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-[#ff4b26] shadow-sm">
            <Sparkles className="h-3.5 w-3.5 fill-[#ff4b26]" />
            FINISHER REWARDS PACKAGE
          </span>
          <h2 className="mt-4 font-display font-black text-2xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-white leading-tight">
            REWARDS THAT MAKE THE <span className="text-[#ff4b26] italic">FINISH REAL</span>
          </h2>
          <p className="mt-2.5 sm:mt-4 text-xs sm:text-base text-slate-400 font-medium max-w-xl leading-relaxed">
            Every finisher receives tangible proof of triumph. Earn heavy die-cast metal medals, downloadable official bibs, technical apparel, and verifiable certificates delivered across India.
          </p>
        </div>

        {/* ─── Redesigned Finisher Vault Bento Showcase (Different & High-Impact) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
          
          {/* 1. Large Feature Card: The 3D Finisher Metal Trophy (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#111822] via-[#0d141d] to-[#080c10] p-6 sm:p-8 shadow-2xl relative group hover:border-[#ff4b26]/50 transition-all duration-300">
            {/* Luminous Top Accent Bar */}
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-[#ff4b26] via-[#ff7844] to-[#facc15]" />

            <div>
              {/* Badge & Category */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ff4b26]/40 bg-[#ff4b26]/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-orange-300">
                  <Award className="h-3.5 w-3.5 text-[#ff4b26]" />
                  <span>The Crown Jewel</span>
                </span>
                <span className="text-xs font-mono text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                  100% Solid Metal
                </span>
              </div>

              <h3 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white leading-tight">
                Handcrafted Solid Metal Finisher Medal
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl font-medium">
                Not a plastic token or cheap badge. Every RUNNERUP finisher medal is an authentic, custom-crafted die-cast solid metal keepsake featuring deep sculpted high-relief and official woven neck ribbon.
              </p>

              {/* 4 Professional Craftsmanship Hallmarks */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center">
                  <span className="block font-mono text-base sm:text-lg font-black text-white">Die-Cast</span>
                  <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">Solid Metal Alloy</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center">
                  <span className="block font-mono text-base sm:text-lg font-black text-white">High-Relief</span>
                  <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">Sculpted Detailing</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center">
                  <span className="block font-mono text-base sm:text-lg font-black text-white">Woven Satin</span>
                  <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">Official Neck Ribbon</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center">
                  <span className="block font-mono text-base sm:text-lg font-black text-emerald-400">Free Express</span>
                  <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">Doorstep Delivery</span>
                </div>
              </div>
            </div>

            {/* Bottom Verification Guarantee */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Truck className="h-4 w-4 text-[#ff4b26]" />
                <span>Express courier dispatch with live SMS tracking</span>
              </span>
              <span className="text-[#ff4b26] font-bold">19,000+ Pincodes</span>
            </div>
          </div>

          {/* 2. Companion Stack: 3 Complementary Rewards (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4 justify-between">
            
            {/* Card 1: Downloadable Bib & QR E-Certificate */}
            <div className="group rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0d141d]/95 p-5 shadow-xl transition-all duration-200 hover:border-sky-500/50 hover:bg-[#111822]">
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-2xl border border-sky-500/30 bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(56,189,248,0.25)]">
                  <FileBadge className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded-full bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-sky-300">
                      Unlocked on Approval
                    </span>
                  </div>
                  <h4 className="font-display font-black text-base text-white uppercase tracking-tight group-hover:text-sky-300 transition-colors">
                    Official Downloadable Bib &amp; E-Certificate
                  </h4>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed font-medium">
                    Verified timing splits, pace analysis, and permanent QR code validation for your records.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: DRI-FIT Performance Apparel */}
            <div className="group rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0d141d]/95 p-5 shadow-xl transition-all duration-200 hover:border-[#ff4b26]/50 hover:bg-[#111822]">
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-2xl border border-[#ff4b26]/30 bg-[#ff4b26]/10 text-[#ff4b26] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,75,38,0.25)]">
                  <Shirt className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded-full bg-[#ff4b26]/15 border border-[#ff4b26]/30 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-orange-300">
                      Athletic Grade
                    </span>
                  </div>
                  <h4 className="font-display font-black text-base text-white uppercase tracking-tight group-hover:text-orange-300 transition-colors">
                    DRI-FIT Technical Apparel
                  </h4>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed font-medium">
                    High-performance moisture-wicking technical running t-shirt included in premier event packages.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Expanded Finisher Swag & Rewards */}
            <div className="group rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0d141d]/95 p-5 shadow-xl transition-all duration-200 hover:border-amber-500/50 hover:bg-[#111822]">
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(251,191,36,0.25)]">
                  <Gift className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-300">
                      Finisher Swag Pack
                    </span>
                  </div>
                  <h4 className="font-display font-black text-base text-white uppercase tracking-tight group-hover:text-amber-300 transition-colors">
                    Exclusive Swag &amp; Partner Perks
                  </h4>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed font-medium">
                    Commemorative finish-line decals, nutrition vouchers, and national leaderboard badge.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
