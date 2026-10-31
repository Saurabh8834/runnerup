"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Medal,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCw,
  Heart,
  Eye,
  CheckCircle2,
  Flame,
  Share2,
} from "lucide-react";

export default function CancerAwarenessPreviewPage() {
  const [activeSide, setActiveSide] = useState<"front" | "back">("front");
  const [isFlipped, setIsFlipped] = useState(false);

  const frontUrl = "https://res.cloudinary.com/gpy6aiwy/image/upload/v1793473406/runnerup/events/cancer-awareness/cancer_awareness_medal_front_2026.png";
  const backUrl = "https://res.cloudinary.com/gpy6aiwy/image/upload/v1793473407/runnerup/events/cancer-awareness/cancer_awareness_medal_back_2026.png";

  return (
    <div className="min-h-screen bg-[#0f1d24] text-[#fbe9d0] selection:bg-[#e64833] selection:text-white">
      {/* ── TOP CONFIDENTIAL DRAFT BANNER ── */}
      <div className="sticky top-0 z-50 border-b border-amber-500/40 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 px-4 py-2.5 text-center shadow-lg backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="uppercase tracking-widest text-[0.65rem] sm:text-xs">
              🔒 Private Test Preview · DRAFT Status (Hidden from Public)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/events"
              className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-[0.7rem] font-bold text-amber-300 hover:bg-amber-500/30 transition-colors"
            >
              ← Admin Events
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12 space-y-12">
        {/* ── HEADER / INTRO ── */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-950/60 px-4 py-1.5 text-xs font-black tracking-wider text-purple-300 shadow-md">
            <Heart className="h-3.5 w-3.5 text-pink-400 fill-pink-400" />
            <span>NATIONAL CANCER AWARENESS DAY 2026</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Event Card & Medal Preview
          </h1>
          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-[#90aead]">
            Previewing the exact public event card layout and medal inspection system before taking this challenge live.
          </p>
        </div>

        {/* ── EVENT CARD SHOWCASE ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: THE EXACT EVENT CARD (How it will appear on /events) */}
          <div className="lg:col-span-6 xl:col-span-5 mx-auto w-full max-w-md">
            <div className="mb-2 flex items-center justify-between text-xs font-bold text-[#90aead]">
              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-[#e64833]" /> Live Event Card Simulation
              </span>
              <span className="text-[0.68rem] text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                Interactive Flip Active
              </span>
            </div>

            {/* THE CARD */}
            <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#90aead]/30 bg-[#172c34] text-[#fbe9d0] shadow-2xl transition-all duration-300 hover:border-[#e64833] hover:shadow-[0_16px_50px_rgba(230,72,51,0.25)]">
              {/* Card Image Area with Flip Control */}
              <div className="relative h-88 sm:h-96 w-full bg-gradient-to-b from-[#14242a] via-[#101c21] to-[#0c161a] overflow-hidden flex items-center justify-center p-4">
                {/* Ambient Radial Glow */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]">
                  <div className="h-52 w-52 rounded-full bg-purple-600/15 blur-3xl animate-pulse" />
                </div>

                {/* Top Event Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/50 bg-[#14242a]/90 backdrop-blur-md px-3 py-1 text-[0.7rem] font-black text-purple-300 shadow-md">
                    <Heart className="h-3 w-3 text-pink-400 fill-pink-400" />
                    <span>Cancer Awareness Day</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-black/70 backdrop-blur-md px-2.5 py-1 text-[0.68rem] font-bold text-amber-300">
                    <Flame className="h-3 w-3 text-amber-400" /> Limited 500 Slots
                  </span>
                </div>

                {/* The Medal Image (Front / Back based on toggle) */}
                <div className="relative z-10 w-full h-full flex items-center justify-center transition-all duration-500 transform hover:scale-105">
                  <Image
                    src={activeSide === "front" ? frontUrl : backUrl}
                    alt={activeSide === "front" ? "Cancer Awareness Medal Front" : "Cancer Awareness Medal Back"}
                    fill
                    className="object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
                    priority
                    sizes="(max-width: 768px) 100vw, 420px"
                  />
                </div>

                {/* INTERACTIVE TOGGLE PILLS ON THE CARD */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 rounded-full border border-[#90aead]/40 bg-black/85 backdrop-blur-md p-1 shadow-xl">
                  <button
                    type="button"
                    onClick={() => setActiveSide("front")}
                    className={`rounded-full px-3 py-1 text-[0.7rem] font-black transition-all ${
                      activeSide === "front"
                        ? "bg-[#e64833] text-white shadow-md"
                        : "text-[#90aead] hover:text-white"
                    }`}
                  >
                    🔘 Front View
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSide("back")}
                    className={`rounded-full px-3 py-1 text-[0.7rem] font-black transition-all ${
                      activeSide === "back"
                        ? "bg-purple-600 text-white shadow-md"
                        : "text-[#90aead] hover:text-white"
                    }`}
                  >
                    🔄 Back View
                  </button>
                </div>
              </div>

              {/* Card Content Area */}
              <div className="flex flex-1 flex-col p-5 sm:p-6 space-y-4">
                {/* Distances Chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {["1.5 KM", "3 KM", "5 KM", "10 KM", "21 KM"].map((dist) => (
                    <span
                      key={dist}
                      className="rounded-lg border border-[#90aead]/25 bg-[#14242a] px-2.5 py-0.5 text-[0.7rem] font-bold text-[#fbe9d0]"
                    >
                      {dist}
                    </span>
                  ))}
                  <span className="rounded-lg border border-purple-500/30 bg-purple-950/40 px-2 py-0.5 text-[0.7rem] font-bold text-purple-300">
                    🏃 🚶 🚴
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors">
                    National Cancer Awareness Day Virtual Challenge 2026
                  </h3>
                  <p className="mt-1 text-xs text-[#90aead] line-clamp-2 leading-relaxed">
                    Honoring the brave fighters, celebrating the survivors, and remembering our loved ones. Run, walk, or cycle to bring hope across India.
                  </p>
                </div>

                {/* Event Schedule Info */}
                <div className="grid grid-cols-2 gap-2 border-y border-[#90aead]/15 py-2.5 text-[0.75rem]">
                  <div className="flex items-center gap-2 text-[#90aead]">
                    <Calendar className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span>7 – 15 Nov 2026</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#90aead]">
                    <MapPin className="h-3.5 w-3.5 text-[#e64833] shrink-0" />
                    <span>Pan-India Virtual</span>
                  </div>
                </div>

                {/* Perks Included */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[0.75rem]">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span>Heavy 3D Medal + Royal Purple Ribbon Included</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-300 font-semibold text-[0.75rem]">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span>Verified Finisher E-Cert & Digital Bib</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-300 font-semibold text-[0.75rem]">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span>Free Doorstep Courier Delivery Across India</span>
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#90aead]/15">
                  <div>
                    <span className="text-[0.68rem] text-[#90aead] block uppercase tracking-wider font-bold">
                      All-Inclusive Fee
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl sm:text-2xl font-black text-white">₹449</span>
                      <span className="text-xs text-[#90aead] line-through">₹799</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="flex-1 max-w-[180px] h-10 rounded-full bg-[#e64833] hover:bg-[#c93b27] text-[#fbe9d0] font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Register Now</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </article>
          </div>

          {/* RIGHT: DETAILED MEDAL ARTWORK & STORY INSPECTION */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-6">
            <div className="rounded-3xl border border-[#90aead]/20 bg-[#172c34] p-6 sm:p-8 space-y-6 shadow-xl">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-purple-400">
                  Official Finisher Keepsake
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  Side-by-Side Medal Craftsmanship
                </h2>
                <p className="text-xs sm:text-sm text-[#90aead] mt-1">
                  Every participant who completes their chosen distance receives this heavy antique-bronze finisher medal.
                </p>
              </div>

              {/* SIDE-BY-SIDE IMAGES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* FRONT CARD */}
                <div className="rounded-2xl border border-amber-500/30 bg-[#14242a] p-4 text-center space-y-3">
                  <div className="relative h-64 w-full">
                    <Image
                      src={frontUrl}
                      alt="Front of Cancer Awareness Medal"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="rounded-full bg-amber-500/20 text-amber-300 px-3 py-0.5 text-xs font-bold inline-block">
                      FRONT SIDE
                    </span>
                    <p className="text-xs font-bold text-white">Heart Ribbon & Angel Wing</p>
                    <p className="text-[0.72rem] text-[#90aead] leading-relaxed">
                      Features high-relief Tree of Life with butterflies, rising sun silhouette, and the motto: <em>&quot;Every Step Brings Hope&quot;</em>.
                    </p>
                  </div>
                </div>

                {/* BACK CARD */}
                <div className="rounded-2xl border border-purple-500/30 bg-[#14242a] p-4 text-center space-y-3">
                  <div className="relative h-64 w-full">
                    <Image
                      src={backUrl}
                      alt="Back of Cancer Awareness Medal"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="rounded-full bg-purple-500/20 text-purple-300 px-3 py-0.5 text-xs font-bold inline-block">
                      BACK SIDE
                    </span>
                    <p className="text-xs font-bold text-white">The Fighter&apos;s Creed</p>
                    <p className="text-[0.72rem] text-[#90aead] leading-relaxed">
                      Deep engraved quote: <em>&quot;You don&apos;t have to be strong to fight cancer. You just have to keep going.&quot;</em> with <strong>HOPE · COURAGE · STRENGTH</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* MEDAL SPECIFICATIONS */}
              <div className="rounded-2xl border border-[#90aead]/15 bg-[#0f1d24] p-4 space-y-3 text-xs">
                <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[0.7rem]">
                  Medal Specifications & Logistics
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[#90aead] block text-[0.68rem]">Material</span>
                    <strong className="text-white">Heavy Zinc Alloy (Antique Bronze)</strong>
                  </div>
                  <div>
                    <span className="text-[#90aead] block text-[0.68rem]">Diameter / Thickness</span>
                    <strong className="text-white">70 mm × 4.5 mm (3D High Relief)</strong>
                  </div>
                  <div>
                    <span className="text-[#90aead] block text-[0.68rem]">Lanyard / Ribbon</span>
                    <strong className="text-purple-300">Sublimated Satin Purple Ribbon</strong>
                  </div>
                  <div>
                    <span className="text-[#90aead] block text-[0.68rem]">Activities Supported</span>
                    <strong className="text-white">Run, Walk, or Cycle (Any GPS App)</strong>
                  </div>
                  <div>
                    <span className="text-[#90aead] block text-[0.68rem]">Packaging</span>
                    <strong className="text-white">Sealed Foam Pouch + Doorstep Tracking</strong>
                  </div>
                  <div>
                    <span className="text-[#90aead] block text-[0.68rem]">Launch Readiness</span>
                    <strong className="text-amber-400">Ready to Publish (1-Click)</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS FOR ADMIN */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/30 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5 text-center sm:text-left">
                <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5 justify-center sm:justify-start">
                  <ShieldCheck className="h-4 w-4" /> Ready for Launch Whenever You Decide
                </p>
                <p className="text-[0.72rem] text-[#90aead]">
                  This event is currently in DRAFT mode. When you&apos;re ready to open registrations to the public, simply change its status to OPEN in Admin Events.
                </p>
              </div>
              <Link
                href="/admin/events"
                className="btn btn-primary h-9 px-4 text-xs font-bold shrink-0 whitespace-nowrap"
              >
                Go to Admin Events →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
