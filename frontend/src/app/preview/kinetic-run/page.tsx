"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Trophy,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  Flame,
  CheckCircle2,
  Eye,
  Lock,
  ExternalLink,
  Zap,
  Download,
  Share2,
  Smartphone,
  Camera,
  Check,
  Copy,
  Users,
  HelpCircle,
  CreditCard,
  MessageSquare,
  Gift,
} from "lucide-react";
import { PageShell } from "../../components/app-shell";
import { Medal3DViewer } from "../../events/[slug]/medal";
import {
  renderBibCanvas,
  renderCertCanvas,
  renderStoryCanvas,
  triggerCanvasDownload,
} from "../../../lib/asset-canvas";

function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export default function KineticRunPreviewPage() {
  const [runnerName, setRunnerName] = useState("SAURABH KUMAR");
  const [distance, setDistance] = useState("10 KM");
  const [bibCanvasReady, setBibCanvasReady] = useState(false);
  const [certCanvasReady, setCertCanvasReady] = useState(false);

  // Idea 4: Instagram & WhatsApp Story states
  const [storyMode, setStoryMode] = useState<"finisher" | "pledge">("finisher");
  const [isPaidUser, setIsPaidUser] = useState(true);
  const [storyTier, setStoryTier] = useState<"SPEEDSTER" | "PACER" | "LEGEND" | "CHAMPION">("SPEEDSTER");
  const [storyTime, setStoryTime] = useState("00:52:14");
  const [storyPace, setStoryPace] = useState("5:13 /KM");
  const [storyMedalSide, setStoryMedalSide] = useState<"front" | "back">("front");
  const [storyCanvasReady, setStoryCanvasReady] = useState(false);
  const [isDownloadingStory, setIsDownloadingStory] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [showInstaGuide, setShowInstaGuide] = useState(false);

  const bibCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const certCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const storyCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render Live Preview Bib
  useEffect(() => {
    let active = true;
    async function drawBib() {
      try {
        const canvas = await renderBibCanvas({
          runnerName: runnerName || "RUNNER",
          distance: distance || "5 KM",
          positionStr: "KRUN-1001",
          isKineticEvent: true,
        });
        if (!active || !bibCanvasRef.current) return;
        const target = bibCanvasRef.current;
        target.width = 1024;
        target.height = 686;
        const ctx = target.getContext("2d");
        if (ctx) {
          ctx.drawImage(canvas, 0, 0);
          setBibCanvasReady(true);
        }
      } catch (err) {
        console.error("Bib canvas preview error:", err);
      }
    }
    void drawBib();
    return () => {
      active = false;
    };
  }, [runnerName, distance]);

  // Render Live Preview Certificate
  useEffect(() => {
    let active = true;
    async function drawCert() {
      try {
        const canvas = await renderCertCanvas({
          runnerName: runnerName || "RUNNER",
          distance: distance || "5 KM",
          dateStr: "15 Dec 2026",
          category: "Running",
          isKineticEvent: true,
        });
        if (!active || !certCanvasRef.current) return;
        const target = certCanvasRef.current;
        target.width = 1024;
        target.height = 682;
        const ctx = target.getContext("2d");
        if (ctx) {
          ctx.drawImage(canvas, 0, 0);
          setCertCanvasReady(true);
        }
      } catch (err) {
        console.error("Cert canvas preview error:", err);
      }
    }
    void drawCert();
    return () => {
      active = false;
    };
  }, [runnerName, distance]);

  // Render Idea 4: Live Instagram & WhatsApp Story Card (1080 x 1920)
  useEffect(() => {
    let active = true;
    async function drawStory() {
      try {
        const canvas = await renderStoryCanvas({
          runnerName: runnerName || "SAURABH KUMAR",
          distance: distance || "10 KM",
          tierName: storyTier,
          timeStr: storyTime,
          paceStr: storyPace,
          bibNumber: "KRUN-1001",
          medalSide: storyMedalSide,
          isKineticEvent: true,
          storyMode,
          isPaid: isPaidUser,
        });
        if (!active || !storyCanvasRef.current) return;
        const target = storyCanvasRef.current;
        target.width = 1080;
        target.height = 1920;
        const ctx = target.getContext("2d");
        if (ctx) {
          ctx.drawImage(canvas, 0, 0);
          setStoryCanvasReady(true);
        }
      } catch (err) {
        console.error("Story canvas preview error:", err);
      }
    }
    void drawStory();
    return () => {
      active = false;
    };
  }, [runnerName, distance, storyTier, storyTime, storyPace, storyMedalSide, storyMode, isPaidUser]);

  const handleDownloadStory = async () => {
    if (!storyCanvasRef.current) return;
    try {
      setIsDownloadingStory(true);
      await triggerCanvasDownload(
        storyCanvasRef.current,
        `RunnerUp-Kinetic-${storyMode === "pledge" ? "Pledge" : "Finisher"}-${runnerName.replace(/\s+/g, "_")}.jpg`
      );
    } finally {
      setIsDownloadingStory(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://runnerup.in/events/kinetic-run-virtual-challenge-2026");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getStoryCaption = () => {
    if (storyMode === "pledge") {
      return `⚡ Just accepted the Kinetic Run Virtual Challenge 2026! Conquering ${distance} from 10–15 Dec. Official Bib #${"KRUN-1001"}. Who's running with me? Register at https://runnerup.in/events/kinetic-run-virtual-challenge-2026 🏃🔥 @runnerup.in`;
    }
    return `🏆 Finished the Kinetic Run Virtual Challenge 2026! Conquered ${distance} in ${storyTime} (Pace ${storyPace}). Verified ${storyTier} athlete. Check out the 3D medal at https://runnerup.in/events/kinetic-run-virtual-challenge-2026 ⚡🏅 @runnerup.in`;
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(getStoryCaption());
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(getStoryCaption());
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleShareInstagram = async () => {
    if (!storyCanvasRef.current) return;
    try {
      setIsDownloadingStory(true);
      await triggerCanvasDownload(
        storyCanvasRef.current,
        `RunnerUp-Kinetic-${storyMode === "pledge" ? "Pledge" : "Finisher"}-${runnerName.replace(/\s+/g, "_")}.jpg`
      );
      navigator.clipboard.writeText(getStoryCaption());
      setShowInstaGuide(true);

      const isMobile = typeof navigator !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = "instagram://camera";
        setTimeout(() => {
          window.location.href = "https://www.instagram.com/";
        }, 1200);
      } else {
        window.open("https://www.instagram.com/", "_blank");
      }
    } finally {
      setIsDownloadingStory(false);
    }
  };

  return (
    <PageShell>
      <div className="min-h-screen bg-[#070b10] text-[#f8fafc] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-10">

          {/* 🔒 Top Confidential Banner */}
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 sm:p-6 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-300">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Confidential Local Preview · Not Public</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <span>Kinetic Run Virtual Challenge 2026</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#ff4500]/20 text-[#ff7844] border border-[#ff4500]/30">
                    STAGING ONLY
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-300">
                  This event is strictly kept local. It will <strong>NOT</strong> be visible to public users until you say <strong>&ldquo;JAI MATA DI&rdquo;</strong>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/preview/post-payment-reveal"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm px-4 py-3 shadow-lg shadow-amber-500/20 transition-all"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Try Scratch to Reveal Lab</span>
                </Link>

                <Link
                  href="/events/kinetic-run-virtual-challenge-2026"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff4500] to-[#ff7844] hover:from-[#e03d00] hover:to-[#ff5500] text-white font-bold text-sm px-5 py-3 shadow-lg shadow-[#ff4500]/25 transition-all"
                >
                  <span>View Full Event Page</span>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* ⚡ Name Recommendations & Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-white/10 bg-[#0d141d] p-6 space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ff7844]">
                <Zap className="h-4 w-4" />
                <span>Recommended Event Names</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li className="p-2.5 rounded-lg bg-white/5 border border-white/10 font-bold text-white flex items-center justify-between">
                  <span>1. Kinetic Run Virtual Challenge 2026</span>
                  <span className="text-[10px] uppercase bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-black">Top Pick</span>
                </li>
                <li className="p-2 rounded-lg text-slate-300 hover:bg-white/5 transition-colors">
                  2. The Kinetic Run: Limitless Virtual Challenge 2026
                </li>
                <li className="p-2 rounded-lg text-slate-300 hover:bg-white/5 transition-colors">
                  3. Kinetic Run: Speed &amp; Momentum Virtual Challenge
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0d141d] p-6 space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Event Configuration</span>
              </div>
              <dl className="space-y-1.5 text-xs sm:text-sm">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <dt className="text-slate-400">Target Dates:</dt>
                  <dd className="font-semibold text-white">10–15 December 2026</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <dt className="text-slate-400">Distances:</dt>
                  <dd className="font-semibold text-white">1.5 / 3 / 5 / 10 / 21 km</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <dt className="text-slate-400">Entry Fee:</dt>
                  <dd className="font-semibold text-white">₹499 (MRP ₹799)</dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-slate-400">Bib Prefix:</dt>
                  <dd className="font-semibold text-[#ff7844]">KRUN-XXXX</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0d141d] p-6 space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
                <ShieldCheck className="h-4 w-4" />
                <span>Complete Isolation Status</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                ✅ Zero leak from Cancer/IAF events.<br/>
                ✅ Separate dates, bib format (KRUN), certificate design, and leaderboard standings.<br/>
                ✅ Public visitors cannot see this until live command.
              </p>
              <Link
                href="/leaderboard?event=kinetic-run-virtual-challenge-2026"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 underline"
              >
                <span>Preview Kinetic Leaderboard 🏆</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* 🥇 1. 3D Interactive Medal Viewer */}
          <div className="rounded-2xl border border-white/10 bg-[#0d141d] p-6 sm:p-8 space-y-6">
            <div className="border-b border-white/10 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#ff7844]">AUTHENTIC METAL FINISHER MEDAL</span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">Interactive 3D Medal Showcase</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Test the interactive front &amp; back flip. This viewer is linked directly to the uploaded medal design.
              </p>
            </div>

            <div className="py-6 flex justify-center">
              <Medal3DViewer
                slug="kinetic-run-virtual-challenge-2026"
                eventName="Kinetic Run Virtual Challenge 2026"
                size="desktop"
              />
            </div>
          </div>

          {/* 🏃 2. Interactive Digital Bib & Certificate Simulator */}
          <div className="rounded-2xl border border-white/10 bg-[#0d141d] p-6 sm:p-8 space-y-6">
            <div className="border-b border-white/10 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#ff7844]">ISOLATED ASSET RENDERERS</span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">Live Bib &amp; Certificate Simulator</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Type any runner name or change distance to see how the Kinetic Run bib &amp; certificate render in real-time.
              </p>
            </div>

            {/* Test Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Runner Name
                </label>
                <input
                  type="text"
                  value={runnerName}
                  onChange={(e) => setRunnerName(e.target.value)}
                  placeholder="Enter name..."
                  className="w-full rounded-xl border border-white/20 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-[#ff4500] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Distance
                </label>
                <select
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-[#0f172a] px-4 py-2.5 text-sm font-semibold text-white focus:border-[#ff4500] focus:outline-hidden"
                >
                  <option value="1.5 KM">1.5 KM</option>
                  <option value="3 KM">3 KM</option>
                  <option value="5 KM">5 KM</option>
                  <option value="10 KM">10 KM</option>
                  <option value="21 KM">21 KM (Half Marathon)</option>
                </select>
              </div>
            </div>

            {/* Canvas Previews */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
              {/* Digital Bib Card */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Digital Race Bib</h3>
                  <span className="text-xs font-mono text-slate-400">KRUN-1001</span>
                </div>
                <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40 p-2 shadow-xl">
                  <canvas
                    ref={bibCanvasRef}
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                </div>
              </div>

              {/* Official Certificate Card */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Official E-Certificate</h3>
                  <span className="text-xs font-mono text-slate-400">CERT-KRUN-1001</span>
                </div>
                <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40 p-2 shadow-xl">
                  <canvas
                    ref={certCanvasRef}
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                </div>
              </div>
            </div>
          </div>

            {/* ═══════════════════════════════════════════════════════════════
                📱 SECTION 3: IDEA 4 PREVIEW - INSTANT 9:16 STORY CARD GENERATOR
               ═══════════════════════════════════════════════════════════════ */}
            <div className="rounded-2xl border border-orange-500/40 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-black/80 p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 px-3 py-1 text-xs font-black uppercase tracking-wider text-orange-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Viral Growth Engine · Idea 4 Interactive Lab</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    <Smartphone className="h-6 w-6 text-orange-400" />
                    <span>Instant 1-Click Instagram & WhatsApp Story Card (9:16)</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                    Solves "3rd Event Fatigue" by turning every participant into a viral promoter. High-definition 1080×1920 graphic formatted natively for Instagram Stories and WhatsApp Status with 0 cropping.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleShareInstagram}
                    disabled={isDownloadingStory || !storyCanvasReady}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90 px-3.5 py-2 text-xs font-black text-white shadow-md shadow-pink-500/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <InstagramIcon className="h-4 w-4" />
                    <span>Open in Instagram Story</span>
                  </button>

                  <button
                    onClick={handleShareWhatsApp}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Share to WhatsApp</span>
                  </button>

                  <button
                    onClick={handleDownloadStory}
                    disabled={isDownloadingStory || !storyCanvasReady}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-orange-500/25 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>{isDownloadingStory ? "Rendering..." : "Download 9:16 JPG"}</span>
                  </button>
                </div>
              </div>

              {/* 💡 Answer to User Query: Does user have to fill duration and time? */}
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    <span>Does The User Have To Fill Duration & Time Manually?</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed max-w-3xl">
                    <strong className="text-white">No, 100% automated from their run proof!</strong> When an athlete submits their Strava / GPS proof on the live website, our system verifies their duration and pace. When they click to generate their story, all metrics (Time, Pace, Distance, Tier) are <strong>auto-populated instantly</strong> without them typing anything.
                  </p>
                  <p className="text-[11px] text-cyan-200/80">
                    🎯 <em>Pre-Race Mode:</em> No duration or time exists yet; the card displays their confirmed Bib # and Challenge Dates.
                  </p>
                </div>

                <div className="shrink-0">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/40 px-3 py-1.5 text-xs font-mono font-bold text-cyan-300">
                    ⚡ Zero Manual Typing Required
                  </span>
                </div>
              </div>

              {/* 3 Strategy Explainer Pillars (Why, When, Paid vs Unpaid) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Why will user do this */}
                <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <HelpCircle className="h-4 w-4" />
                    <span>1. Why Will Runners Do This?</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-white">Replaces Ugly Strava Screenshots:</strong> Runners already post boring GPS map lines on social media. This gives them an Olympic/Nike-level victory graphic featuring their real name, verified pace, and 3D bronze medal.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    ⚡ <em>Instant Dopamine:</em> Courier takes 5–7 days; this gives instant celebration the second they submit proof.
                  </p>
                </div>

                {/* 2. When will user use it */}
                <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="h-4 w-4" />
                    <span>2. When Is It Unlocked?</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-white">Two Golden Touchpoints:</strong>
                    <br />• <strong>At Registration:</strong> "I'm In! Challenge Accepted" card with Bib # to invite friends.
                    <br />• <strong>Post-Race Proof:</strong> "Official Finisher" card with time, pace & 3D medal.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    📈 Pre-race cards drive peer signups; post-race cards build community FOMO.
                  </p>
                </div>

                {/* 3. Paid vs Unpaid */}
                <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <CreditCard className="h-4 w-4" />
                    <span>3. For Paid Or Unpaid?</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-white">Freemium Upsell Machine:</strong>
                    <br />• <strong>Paid (₹499):</strong> Full VIP Finisher card with 3D medal & verified pace tier.
                    <br />• <strong>Unpaid:</strong> Free "Challenger Pledge" card that has a built-in upsell prompt to upgrade to the ₹499 physical medal!
                  </p>
                  <p className="text-[11px] text-slate-400">
                    💰 Unpaid users promote your run for free AND get converted to paid buyers.
                  </p>
                </div>
              </div>

              {/* Split Grid: Controls on Left, Phone Mockup on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
                {/* Left Column: Interactive Story Settings */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Mode & Tier Switchers */}
                  <div className="rounded-xl border border-white/10 bg-black/40 p-5 space-y-5">
                    {/* Mode Selector Tabs */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                          <Zap className="h-4 w-4" />
                          <span>Test Journey Stage (When User Uses It)</span>
                        </label>
                        <span className="text-[10px] text-slate-400">Toggle To Preview</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setStoryMode("finisher")}
                          className={`rounded-xl p-3 text-left transition-all cursor-pointer ${
                            storyMode === "finisher"
                              ? "bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-2 border-orange-500 text-white shadow-lg"
                              : "border border-white/10 bg-slate-900/60 text-slate-400 hover:text-white"
                          }`}
                        >
                          <div className="text-xs font-black uppercase text-orange-400">🏆 Mode 1: Post-Race Finisher</div>
                          <div className="text-[11px] text-slate-300 mt-0.5">Flexes Finish Time, Pace & 3D Medal</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setStoryMode("pledge")}
                          className={`rounded-xl p-3 text-left transition-all cursor-pointer ${
                            storyMode === "pledge"
                              ? "bg-gradient-to-r from-sky-500/20 to-blue-500/20 border-2 border-sky-400 text-white shadow-lg"
                              : "border border-white/10 bg-slate-900/60 text-slate-400 hover:text-white"
                          }`}
                        >
                          <div className="text-xs font-black uppercase text-sky-400">🎯 Mode 2: Pre-Race Pledge</div>
                          <div className="text-[11px] text-slate-300 mt-0.5">"I'm In!" registration card to invite friends</div>
                        </button>
                      </div>
                    </div>

                    {/* Paid vs Unpaid Access Toggle */}
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <CreditCard className="h-4 w-4" />
                          <span>Simulate User Access Level (Paid vs Unpaid)</span>
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setIsPaidUser(true)}
                          className={`rounded-xl p-2.5 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                            isPaidUser
                              ? "bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 shadow-md"
                              : "border border-white/10 bg-slate-900/60 text-slate-400 hover:text-white"
                          }`}
                        >
                          <Award className="h-3.5 w-3.5" />
                          <span>Paid User (₹499 Medal Kit)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsPaidUser(false)}
                          className={`rounded-xl p-2.5 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                            !isPaidUser
                              ? "bg-amber-500/20 border-2 border-amber-400 text-amber-300 shadow-md"
                              : "border border-white/10 bg-slate-900/60 text-slate-400 hover:text-white"
                          }`}
                        >
                          <Gift className="h-3.5 w-3.5" />
                          <span>Unpaid User (With Upsell Prompt)</span>
                        </button>
                      </div>
                    </div>

                    {/* Field: Runner Name */}
                    <div className="space-y-1.5 pt-2 border-t border-white/10">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Athlete Name (Displays in Bold Serif)
                      </label>
                      <input
                        type="text"
                        value={runnerName}
                        onChange={(e) => setRunnerName(e.target.value)}
                        placeholder="Enter runner name"
                        className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm font-semibold text-white focus:border-orange-500 focus:outline-none"
                      />
                    </div>

                    {/* Field: Distance & Medal View Selector */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          Category / Distance
                        </label>
                        <select
                          value={distance}
                          onChange={(e) => setDistance(e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm font-semibold text-white focus:border-orange-500 focus:outline-none"
                        >
                          <option value="1.5 KM">1.5 KM</option>
                          <option value="3 KM">3 KM</option>
                          <option value="5 KM">5 KM</option>
                          <option value="10 KM">10 KM</option>
                          <option value="21 KM">21 KM (Half Marathon)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          Medal Face On Story
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setStoryMedalSide("front")}
                            className={`rounded-lg py-2 text-xs font-bold transition-all ${
                              storyMedalSide === "front"
                                ? "bg-orange-500 text-black shadow-md shadow-orange-500/20"
                                : "border border-white/10 bg-slate-900 text-slate-300 hover:text-white"
                            }`}
                          >
                            Front 3D Face
                          </button>
                          <button
                            type="button"
                            onClick={() => setStoryMedalSide("back")}
                            className={`rounded-lg py-2 text-xs font-bold transition-all ${
                              storyMedalSide === "back"
                                ? "bg-orange-500 text-black shadow-md shadow-orange-500/20"
                                : "border border-white/10 bg-slate-900 text-slate-300 hover:text-white"
                            }`}
                          >
                            Back Inscription
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Mode 1 Specific Controls: Pace Tier, Time, Pace */}
                    {storyMode === "finisher" && (
                      <>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                              Verified Finisher Pace Tier (Engraved on Medal)
                            </label>
                            <span className="text-[10px] text-amber-400 font-mono">Actual Inscription</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {(["SPEEDSTER", "PACER", "LEGEND", "CHAMPION"] as const).map((tier) => (
                              <button
                                key={tier}
                                type="button"
                                onClick={() => setStoryTier(tier)}
                                className={`rounded-lg py-2 px-1 text-xs font-extrabold tracking-wider transition-all ${
                                  storyTier === tier
                                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-md shadow-orange-500/30 scale-102"
                                    : "border border-white/10 bg-slate-900/90 text-slate-300 hover:border-orange-500/40 hover:text-white"
                                }`}
                              >
                                {tier === "SPEEDSTER" && "⚡ "}
                                {tier === "PACER" && "🏃 "}
                                {tier === "LEGEND" && "🔥 "}
                                {tier === "CHAMPION" && "👑 "}
                                {tier}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                              Finish Time (HH:MM:SS)
                            </label>
                            <input
                              type="text"
                              value={storyTime}
                              onChange={(e) => setStoryTime(e.target.value)}
                              placeholder="00:52:14"
                              className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm font-semibold text-white focus:border-orange-500 focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                              Average Pace
                            </label>
                            <input
                              type="text"
                              value={storyPace}
                              onChange={(e) => setStoryPace(e.target.value)}
                              placeholder="5:13 /KM"
                              className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm font-semibold text-white focus:border-orange-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Ready-to-Post Caption & Viral Sharing Toolbar */}
                  <div className="rounded-xl border border-white/10 bg-black/40 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <MessageSquare className="h-4 w-4 text-emerald-400" />
                        <span>Instant 1-Click Story Caption (Auto-Generated)</span>
                      </h4>
                      <button
                        onClick={handleCopyCaption}
                        className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {copiedCaption ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedCaption ? "Copied!" : "Copy Caption"}</span>
                      </button>
                    </div>

                    <div className="rounded-lg bg-slate-950 p-3 border border-white/5 text-xs text-slate-300 font-mono leading-relaxed select-all">
                      {getStoryCaption()}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        onClick={handleShareInstagram}
                        disabled={isDownloadingStory || !storyCanvasReady}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] px-3.5 py-2 text-xs font-bold text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
                      >
                        <InstagramIcon className="h-3.5 w-3.5" />
                        <span>Share to Instagram Story</span>
                      </button>

                      <button
                        onClick={handleShareWhatsApp}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-bold text-white transition-all shadow-md cursor-pointer"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Send via WhatsApp</span>
                      </button>

                      <button
                        onClick={handleDownloadStory}
                        disabled={isDownloadingStory || !storyCanvasReady}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-3.5 py-2 text-xs font-bold text-black hover:brightness-110 transition-all shadow-md cursor-pointer disabled:opacity-50"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>{isDownloadingStory ? "Saving..." : "Download Story JPG"}</span>
                      </button>

                      <button
                        onClick={handleCopyLink}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                      >
                        {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedLink ? "Link Copied" : "Copy Event URL"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Realistic Mobile Phone Frame Mockup */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-3">
                  <div className="text-center space-y-0.5">
                    <span className="text-xs font-black uppercase tracking-wider text-orange-400">
                      Live Phone Mockup (1080×1920 scaled)
                    </span>
                    <p className="text-[11px] text-slate-400">
                      {storyMode === "pledge" ? "Pre-Race Registration Pledge Mode" : "Post-Race Finisher Glory Mode"}
                    </p>
                  </div>

                  {/* Smartphone Device Chassis */}
                  <div className="relative rounded-[2.5rem] border-4 border-slate-700 bg-black p-2.5 shadow-2xl shadow-orange-500/10 max-w-[320px] sm:max-w-[340px] w-full">
                    {/* Top Notch / Dynamic Island */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-full z-20 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800 mr-2" />
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/70" />
                    </div>

                    {/* Device Screen Area */}
                    <div className="relative rounded-[2rem] overflow-hidden aspect-[9/16] w-full bg-slate-950 border border-white/5">
                      {/* Story Canvas */}
                      <canvas
                        ref={storyCanvasRef}
                        className="w-full h-full object-contain block select-none"
                        width={1080}
                        height={1920}
                      />

                      {/* Fake Instagram Story Top Bar for realism */}
                      <div className="absolute top-2.5 left-0 right-0 px-3 z-10 flex flex-col gap-1.5 pointer-events-none">
                        {/* Story Progress Bar */}
                        <div className="w-full h-0.5 bg-white/30 rounded-full overflow-hidden">
                          <div className="w-3/5 h-full bg-white rounded-full" />
                        </div>
                        {/* Profile Header */}
                        <div className="flex items-center justify-between text-white drop-shadow-md">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-[10px] font-black text-black">
                              RU
                            </div>
                            <span className="text-[11px] font-bold text-white/95">runnerup.in</span>
                            <span className="text-[10px] text-white/70">1m</span>
                          </div>
                          <span className="text-[10px] font-mono text-white/60">Story</span>
                        </div>
                      </div>

                      {/* Canvas Loading Overlay */}
                      {!storyCanvasReady && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-xs">
                          <div className="flex flex-col items-center gap-2">
                            <div className="h-7 w-7 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                            <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">
                              Rendering Story...
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subtext under device */}
                  <div className="text-center space-y-1">
                    <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-400" />
                      <span>{isPaidUser ? "Full VIP 3D Medal Finisher Mode" : "Unpaid Challenger Mode (With Upsell Prompt)"}</span>
                    </p>
                    <button
                      onClick={handleDownloadStory}
                      className="text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                    >
                      Download exact JPG file (1080×1920)
                    </button>
                  </div>
                </div>
              </div>
            </div>

        </div>
      </div>

      {/* 📱 Instagram Story Handoff Guidance Modal */}
      {showInstaGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full rounded-2xl border border-pink-500/30 bg-slate-950 p-6 space-y-5 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-pink-400 font-bold text-sm">
                <InstagramIcon className="h-5 w-5" />
                <span>Opening Instagram Story...</span>
              </div>
              <button
                onClick={() => setShowInstaGuide(false)}
                className="text-slate-400 hover:text-white text-xs font-mono cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 flex items-center gap-2 text-emerald-300 font-bold">
                <Check className="h-4 w-4 shrink-0" />
                <span>1080×1920 Story Image downloaded & caption copied!</span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold shrink-0 mt-0.5">1</div>
                  <p>In Instagram, swipe right or tap <strong>Your Story</strong> to open the story camera.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold shrink-0 mt-0.5">2</div>
                  <p>Tap your <strong>Photo Gallery</strong> icon at the bottom-left and select the downloaded 9:16 story image.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold shrink-0 mt-0.5">3</div>
                  <p>Tap the text tool (<strong>Aa</strong>) and paste the auto-copied caption with <strong className="text-pink-400">@runnerup.in</strong> tag!</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  window.open("https://www.instagram.com/", "_blank");
                  setShowInstaGuide(false);
                }}
                className="rounded-xl bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] px-5 py-2.5 text-xs font-black text-white hover:opacity-90 shadow-md transition-all cursor-pointer"
              >
                Launch Instagram Now →
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
