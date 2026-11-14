"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Trophy,
  ArrowRight,
  Gift,
  RotateCcw,
  Zap,
  CheckCircle2,
  Lock,
  Unlock,
  ShieldCheck,
  Disc,
  Play,
  Share2,
} from "lucide-react";
import { PageShell } from "../../components/app-shell";
import { ScratchRevealCard } from "../../components/scratch-reveal-card";

function PostPaymentRevealLabContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") as "scratch" | "vault" | "wheel" | "laser" | null;
  const initialVault = searchParams.get("vault");
  const initialRevealed = searchParams.get("revealed") === "true";

  const [activeTab, setActiveTab] = useState<"scratch" | "vault" | "wheel" | "laser">(initialTab || "scratch");
  const [runnerName, setRunnerName] = useState("SOURAV SHARMA");
  const [eventChoice, setEventChoice] = useState<"kinetic" | "cancer">("kinetic");
  const [distance, setDistance] = useState("10 KM");
  const [resetKey, setResetKey] = useState(0);

  // Dynamic Bib based on event
  const bibNumber = eventChoice === "kinetic" ? "KRUN-1042" : "NCAD-1042";
  const eventTitle =
    eventChoice === "kinetic"
      ? "Kinetic Run Virtual Challenge 2026"
      : "National Cancer Awareness Day Virtual Challenge 2026";

  // Vault unboxing state
  const [vaultState, setVaultState] = useState<"locked" | "unlocking" | "opened">(
    initialVault === "opened" ? "opened" : "locked",
  );

  useEffect(() => {
    if (initialTab && ["scratch", "vault", "wheel", "laser"].includes(initialTab)) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Spin wheel state
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<string | null>(null);

  // Laser engraving state
  const [laserProgress, setLaserProgress] = useState(0);
  const [laserActive, setLaserActive] = useState(false);

  const resetAll = () => {
    setResetKey((prev) => prev + 1);
    setVaultState("locked");
    setWonPrize(null);
    setLaserProgress(0);
    setLaserActive(false);
  };

  // Wheel Prizes
  const wheelPrizes = [
    { label: "₹100 Voucher", color: "#f59e0b", perk: "₹100 Off on Next Virtual Marathon Entry!" },
    { label: "VIP Flame", color: "#ea580c", perk: "VIP Leaderboard Flame Badge Next to Your Name!" },
    { label: "Story Feature", color: "#8b5cf6", perk: "Guaranteed Feature on Official RunnerUp Instagram Story!" },
    { label: "Speedster Seed", color: "#06b6d4", perk: "Wave 1 Priority Leaderboard Slot!" },
    { label: "Free Band", color: "#10b981", perk: "Free RunnerUp DRI-FIT Sports Wristband Included in Kit!" },
    { label: "Gold Pass", color: "#eab308", perk: "Exclusive 2026 Season All-Access Gold Pass Discount!" },
  ];

  const handleSpinWheel = () => {
    if (wheelSpinning) return;
    setWheelSpinning(true);
    setWonPrize(null);

    // Pick a random prize between index 0 and 5
    const prizeIndex = Math.floor(Math.random() * wheelPrizes.length);
    const prize = wheelPrizes[prizeIndex];

    // 5 full rotations (1800 deg) + angle for the prize
    const anglePerSlice = 360 / wheelPrizes.length;
    const targetAngle = 1800 + (360 - (prizeIndex * anglePerSlice + anglePerSlice / 2));

    setWheelRotation(targetAngle);

    setTimeout(() => {
      setWheelSpinning(false);
      setWonPrize(prize.perk);
    }, 4000);
  };

  // Laser Engraver Simulation
  const handleStartLaser = () => {
    setLaserActive(true);
    setLaserProgress(0);
    const interval = setInterval(() => {
      setLaserProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setLaserActive(false);
          return 100;
        }
        return prev + 5;
      });
    }, 120);
  };

  return (
    <PageShell>
      <div className="min-h-screen bg-[#070b10] text-[#f8fafc] py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Interactive Post-Payment Gamification Lab</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              Post-Payment Reveal Experiences
            </h1>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              Instead of a boring static receipt, give runners an unforgettable dopamine moment
              when they complete payment. Test all 4 interactive concepts below!
            </p>
          </div>

          {/* Controls Bar */}
          <div className="rounded-2xl border border-white/10 bg-[#0d141d] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block uppercase">Athlete Name</label>
                <input
                  type="text"
                  value={runnerName}
                  onChange={(e) => setRunnerName(e.target.value.toUpperCase())}
                  className="bg-black/50 border border-white/20 rounded-lg px-3 py-1.5 text-xs font-bold text-white max-w-[170px]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block uppercase">Challenge</label>
                <select
                  value={eventChoice}
                  onChange={(e) => setEventChoice(e.target.value as "kinetic" | "cancer")}
                  className="bg-black/50 border border-white/20 rounded-lg px-3 py-1.5 text-xs font-bold text-white"
                >
                  <option value="kinetic">⚡ Kinetic Run (10–15 Dec)</option>
                  <option value="cancer">🎗️ Cancer Awareness (7–17 Nov)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block uppercase">Distance</label>
                <select
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="bg-black/50 border border-white/20 rounded-lg px-3 py-1.5 text-xs font-bold text-white"
                >
                  <option value="5 KM">5 KM</option>
                  <option value="10 KM">10 KM</option>
                  <option value="21 KM">21 KM Half Marathon</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={resetAll}
              className="px-4 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-bold hover:bg-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Reveal State</span>
            </button>
          </div>

          {/* Reveal Concept Switcher Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("scratch")}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                activeTab === "scratch"
                  ? "border-amber-500 bg-amber-500/15 text-white shadow-lg shadow-amber-500/10"
                  : "border-white/10 bg-[#0d141d] text-slate-400 hover:text-white"
              }`}
            >
              <span className="text-xl block mb-1">🪙</span>
              <span className="text-xs font-black block">Idea 1: Scratch to Reveal</span>
              <span className="text-[10px] text-slate-400 block">Gold foil canvas scratch</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("vault")}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                activeTab === "vault"
                  ? "border-[#ff4b26] bg-[#ff4b26]/15 text-white shadow-lg shadow-[#ff4b26]/10"
                  : "border-white/10 bg-[#0d141d] text-slate-400 hover:text-white"
              }`}
            >
              <span className="text-xl block mb-1">🎁</span>
              <span className="text-xs font-black block">Idea 2: 3D Vault Unbox</span>
              <span className="text-[10px] text-slate-400 block">Crack athletic safe &amp; loot</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("wheel")}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                activeTab === "wheel"
                  ? "border-purple-500 bg-purple-500/15 text-white shadow-lg shadow-purple-500/10"
                  : "border-white/10 bg-[#0d141d] text-slate-400 hover:text-white"
              }`}
            >
              <span className="text-xl block mb-1">🎡</span>
              <span className="text-xs font-black block">Idea 3: Finisher Wheel</span>
              <span className="text-[10px] text-slate-400 block">100% win rate lucky spin</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("laser")}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                activeTab === "laser"
                  ? "border-cyan-500 bg-cyan-500/15 text-white shadow-lg shadow-cyan-500/10"
                  : "border-white/10 bg-[#0d141d] text-slate-400 hover:text-white"
              }`}
            >
              <span className="text-xl block mb-1">⚡</span>
              <span className="text-xs font-black block">Idea 4: Laser Engraver</span>
              <span className="text-[10px] text-slate-400 block">Real-time bib stamping</span>
            </button>
          </div>

          {/* ══════════════════════════════════════════════════════════
              CONCEPT 1: SCRATCH TO REVEAL (USER'S REQUESTED FEATURE)
             ══════════════════════════════════════════════════════════ */}
          {activeTab === "scratch" && (
            <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#111926] to-[#090d14] p-6 sm:p-10 shadow-2xl space-y-6 text-center">
              <div className="max-w-md mx-auto space-y-1">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Payment Received ✅ · Official Allocation
                </span>
                <h2 className="text-2xl font-black text-white uppercase">
                  Scratch Your Gold Finisher Card
                </h2>
                <p className="text-xs text-slate-400">
                  Swipe with your finger on touchscreens or hold and drag with your mouse to scratch away the metallic foil!
                </p>
              </div>

              {/* Real Interactive Scratch Card */}
              <div className="py-2" key={resetKey}>
                <ScratchRevealCard
                  bibNumber={bibNumber}
                  runnerName={runnerName}
                  category={`${distance} • Running`}
                  eventTitle={eventTitle}
                  luckyPerk="⚡ Wave 1 Priority Seed · VIP Leaderboard Flame Badge Unlocked!"
                  accentColor={eventChoice === "kinetic" ? "orange" : "purple"}
                  initialRevealed={initialRevealed}
                />
              </div>

              {/* Explainer Box */}
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-left text-xs space-y-2 max-w-lg mx-auto">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" /> Why this converts so well:
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Instead of staring at a cold text receipt, scratching triggers a release of anticipation.
                  When runners scratch and see their unique Bib Number + a surprise Lucky Wave Badge, they feel special
                  and immediately screenshot it to share on their Instagram Story or WhatsApp status.
                </p>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              CONCEPT 2: 3D FINISHER MYSTERY VAULT UNBOXING
             ══════════════════════════════════════════════════════════ */}
          {activeTab === "vault" && (
            <div className="rounded-3xl border border-[#ff4b26]/30 bg-gradient-to-b from-[#14121d] to-[#090d14] p-6 sm:p-10 shadow-2xl space-y-6 text-center">
              <div className="max-w-md mx-auto space-y-1">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                  Official Finisher Safe Locked
                </span>
                <h2 className="text-2xl font-black text-white uppercase">
                  Crack The Finisher Vault
                </h2>
                <p className="text-xs text-slate-400">
                  Tap the button to break the seal and unlock your race bib &amp; finisher medal kit!
                </p>
              </div>

              {/* 3D Vault Animation Box */}
              <div className="relative mx-auto max-w-sm h-72 rounded-3xl border-2 border-orange-500/40 bg-black/60 p-6 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
                {/* Glow Backdrop */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className={`h-48 w-48 rounded-full blur-3xl transition-all duration-700 ${
                      vaultState === "opened" ? "bg-amber-400/40 scale-125" : "bg-orange-600/20"
                    }`}
                  />
                </div>

                {vaultState === "locked" && (
                  <div className="space-y-4 animate-in zoom-in-95">
                    <div className="h-20 w-20 mx-auto rounded-3xl border-2 border-orange-500/50 bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-xl shadow-orange-500/30">
                      <Lock className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white uppercase">ATHLETE VAULT #2026</p>
                      <p className="text-[11px] text-slate-400">Contains Official Bib + Finisher Perks</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setVaultState("unlocking");
                        setTimeout(() => setVaultState("opened"), 1200);
                      }}
                      className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#ff4b26] to-[#ff7844] text-white text-xs font-black uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Unlock className="h-4 w-4" /> Crack The Vault
                    </button>
                  </div>
                )}

                {vaultState === "unlocking" && (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-20 w-20 mx-auto rounded-3xl border-2 border-amber-400 bg-amber-500/30 flex items-center justify-center animate-spin">
                      <Sparkles className="h-10 w-10 text-amber-300" />
                    </div>
                    <p className="text-sm font-black text-amber-300 tracking-wider">
                      DECRYPTING OFFICIAL BIB...
                    </p>
                  </div>
                )}

                {vaultState === "opened" && (
                  <div className="space-y-3 animate-in zoom-in-90 duration-500">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-black uppercase text-emerald-400">
                      🎉 Vault Cracked!
                    </span>
                    <div className="text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-400">
                      {bibNumber}
                    </div>
                    <p className="text-xs font-bold text-white">{runnerName} • {distance}</p>
                    <div className="text-[11px] text-amber-300 font-mono bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1">
                      🎁 3D Sculpted Finisher Medal Allocated
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              CONCEPT 3: LUCKY FINISHER GOLDEN SPIN WHEEL
             ══════════════════════════════════════════════════════════ */}
          {activeTab === "wheel" && (
            <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-b from-[#161224] to-[#090d14] p-6 sm:p-10 shadow-2xl space-y-6 text-center">
              <div className="max-w-md mx-auto space-y-1">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                  Post-Payment Finisher Bonus
                </span>
                <h2 className="text-2xl font-black text-white uppercase">
                  Lucky Finisher Spin Wheel
                </h2>
                <p className="text-xs text-slate-400">
                  Every paid runner gets 1 free spin! 100% win rate for instant extra motivation.
                </p>
              </div>

              {/* Wheel Container */}
              <div className="relative mx-auto max-w-xs flex flex-col items-center">
                {/* Pointer Indicator */}
                <div className="z-20 -mb-3 text-2xl text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.8)]">
                  ▼
                </div>

                {/* Spinning Wheel */}
                <div
                  style={{
                    transform: `rotate(${wheelRotation}deg)`,
                    transition: wheelSpinning
                      ? "transform 4s cubic-bezier(0.15, 0.95, 0.35, 1)"
                      : "none",
                  }}
                  className="h-64 w-64 rounded-full border-4 border-amber-400 bg-gradient-to-tr from-purple-900 to-slate-900 shadow-2xl relative overflow-hidden flex items-center justify-center select-none"
                >
                  {/* Wheel Slices */}
                  {wheelPrizes.map((p, idx) => {
                    const rot = (360 / wheelPrizes.length) * idx;
                    return (
                      <div
                        key={p.label}
                        style={{
                          transform: `rotate(${rot}deg)`,
                          transformOrigin: "center center",
                        }}
                        className="absolute inset-0 flex items-start justify-center pt-3 text-[11px] font-black uppercase text-white tracking-wider"
                      >
                        <span
                          style={{ backgroundColor: p.color }}
                          className="px-2 py-0.5 rounded-full shadow text-[10px] text-white"
                        >
                          {p.label}
                        </span>
                      </div>
                    );
                  })}

                  {/* Wheel Center Button */}
                  <div className="z-10 h-16 w-16 rounded-full bg-black/90 border-2 border-amber-400 flex items-center justify-center text-xs font-black text-amber-300 shadow-xl">
                    SPIN
                  </div>
                </div>

                {/* Spin Button */}
                <button
                  type="button"
                  onClick={handleSpinWheel}
                  disabled={wheelSpinning}
                  className="mt-6 px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white text-xs font-black uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Disc className="h-4 w-4" />
                  <span>{wheelSpinning ? "Spinning..." : "Spin Your Free Perk"}</span>
                </button>

                {wonPrize && (
                  <div className="mt-4 p-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs font-bold animate-in fade-in zoom-in-95">
                    🎉 YOU WON: {wonPrize}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              CONCEPT 4: HIGH-TECH LASER ENGRAVING & HOLOGRAM STAMP
             ══════════════════════════════════════════════════════════ */}
          {activeTab === "laser" && (
            <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-[#0c1824] to-[#090d14] p-6 sm:p-10 shadow-2xl space-y-6 text-center">
              <div className="max-w-md mx-auto space-y-1">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Real-Time Laser Engraving Simulation
                </span>
                <h2 className="text-2xl font-black text-white uppercase">
                  Personalized Laser Stamping
                </h2>
                <p className="text-xs text-slate-400">
                  Simulates a high-precision athletic machine laser-engraving the athlete&apos;s name onto their pass!
                </p>
              </div>

              {/* Laser Board */}
              <div className="relative mx-auto max-w-sm rounded-2xl border border-cyan-500/40 bg-black/80 p-6 shadow-2xl space-y-4">
                {/* Scanner bar animation */}
                {laserActive && (
                  <div
                    style={{ top: `${laserProgress}%` }}
                    className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] transition-all duration-100 z-20 pointer-events-none"
                  />
                )}

                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">
                    PRECISION ATHLETE PASS #2026
                  </span>
                  <div className="text-3xl font-black font-mono tracking-wider text-cyan-300">
                    {bibNumber}
                  </div>
                  <p className="text-sm font-bold text-white">
                    {laserProgress > 40 ? runnerName : "ENGRAVING NAME..."}
                  </p>
                  <p className="text-xs text-slate-400 font-mono">
                    {laserProgress >= 100 ? "GPS Verified Stamped ✅" : `Engraving: ${laserProgress}%`}
                  </p>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    style={{ width: `${laserProgress}%` }}
                    className="bg-cyan-400 h-full transition-all duration-100"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleStartLaser}
                  disabled={laserActive}
                  className="px-6 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Play className="h-3.5 w-3.5" /> Start Laser Engraving
                </button>
              </div>
            </div>
          )}

          {/* Quick Links Back to Event and Lab */}
          <div className="flex flex-wrap items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-400">
            <Link
              href="/events/kinetic-run-virtual-challenge-2026"
              className="text-amber-400 hover:text-white transition-colors"
            >
              ← Back to Kinetic Run Challenge
            </Link>
            <Link
              href="/preview/kinetic-run"
              className="text-amber-400 hover:text-white transition-colors"
            >
              Go to Kinetic Run Asset Lab (Bib, Cert, Story) →
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export default function PostPaymentRevealLabPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070b10] flex items-center justify-center text-slate-400">Loading Reveal Lab...</div>}>
      <PostPaymentRevealLabContent />
    </Suspense>
  );
}
