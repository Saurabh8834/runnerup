"use client";

import { Award, MapPinned, Upload, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

const steps: { step: string; title: string; text: string; icon: LucideIcon }[] = [
  {
    step: "01",
    title: "Choose Your Race",
    text: "Select your target distance (1.5K, 5K, 10K, or 21K Half Marathon). Instant bib allocation & race kit reservation.",
    icon: MapPinned,
  },
  {
    step: "02",
    title: "Run & Upload Proof",
    text: "Run anywhere, outdoors or on a treadmill. Track with Strava, Garmin, Nike, or Apple Watch and upload your activity.",
    icon: Upload,
  },
  {
    step: "03",
    title: "Earn Finisher Medals",
    text: "Fast GPS verification unlocks your official QR E-Certificate. Real 3D heavy metal finisher medal delivered to your doorstep.",
    icon: Award,
  },
];

export function HomeSteps() {
  return (
    <section id="how-it-works" className="relative py-18 sm:py-24 bg-[#14242a] text-[#fbe9d0] border-t border-[#90aead]/15 overflow-hidden scroll-mt-28">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#244855]/30 blur-[140px]" />

      <div className="container-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e64833]/40 bg-[#e64833]/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#e64833] shadow-sm">
            <Zap className="h-3.5 w-3.5 fill-[#e64833]" />
            HOW RUNNERUP WORKS
          </span>
          <h2 className="mt-4 font-display font-black text-2xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-[#fbe9d0] leading-tight">
            THREE STEPS TO YOUR <span className="text-[#e64833] italic">FINISHER MEDAL</span>
          </h2>
          <p className="mt-2.5 sm:mt-3 text-xs sm:text-base text-[#90aead] font-medium max-w-xl leading-relaxed">
            Zero friction from race sign-up to delivery. Run anywhere across India on your own schedule.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="group relative overflow-hidden rounded-3xl border border-[#90aead]/20 bg-[#172c34]/90 backdrop-blur-xl p-8 shadow-2xl transition-all duration-300 hover:border-[#e64833]/50 hover:shadow-[0_12px_40px_rgba(230,72,51,0.2)] hover:-translate-y-1.5"
              >
                {/* Step badge top right */}
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#90aead]/30 bg-[#244855] text-[#90aead] shadow-md group-hover:bg-[#e64833] group-hover:text-white transition-all duration-300">
                    <Icon className="h-7 w-7" strokeWidth={2.2} />
                  </div>
                  <span className="font-display font-black text-5xl text-[#90aead]/20 group-hover:text-[#e64833]/30 transition-colors">
                    {item.step}
                  </span>
                </div>

                <h3 className="mt-6 font-display font-black text-2xl uppercase tracking-tight text-[#fbe9d0] transition-colors group-hover:text-[#e64833]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#fbe9d0]/80 font-medium">
                  {item.text}
                </p>

                {/* Bottom kinetic neon accent line */}
                <div className="mt-6 h-1 w-12 rounded-full bg-[#90aead]/20 group-hover:w-full group-hover:bg-gradient-to-r group-hover:from-[#e64833] group-hover:to-[#874f41] transition-all duration-500" />
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
