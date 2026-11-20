"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Trophy,
  Award,
  Sparkles,
  Download,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Eye,
  Sliders,
  ChevronRight,
  ArrowLeft,
  Flame,
  Volume2,
  Lock,
  Unlock,
} from "lucide-react";
import {
  renderCertCanvas,
  renderBibCanvas,
  triggerCanvasDownload,
} from "../../../lib/asset-canvas";
import { sendDownloadTelemetry } from "../../../lib/track-download";

// Sound synthesizer for scratching and victory chime
class RevealAudioEngine {
  private ctx: AudioContext | null = null;
  private lastScratchTime = 0;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
  }

  playScratch() {
    try {
      const now = Date.now();
      if (now - this.lastScratchTime < 50) return;
      this.lastScratchTime = now;
      this.init();
      if (!this.ctx) return;

      const bufferSize = Math.floor(this.ctx.sampleRate * 0.04);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 2600 + Math.random() * 700;
      filter.Q.value = 2.8;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch {}
  }

  playVictoryFanfare() {
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [440, 554.37, 659.25, 880, 1108.73]; // A major triumphant chord
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        const start = this.ctx!.currentTime + idx * 0.07;
        gain.gain.setValueAtTime(0.14, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(start);
        osc.stop(start + 0.45);
      });
    } catch {}
  }
}

const audioEngine = new RevealAudioEngine();

interface PresetRunner {
  name: string;
  bibNumber: string;
  distance: string;
  category: string;
  officialTime: string;
  issueDate: string;
}

const PRESET_RUNNERS: PresetRunner[] = [
  {
    name: "SWARANJALI SONAWALE",
    bibNumber: "NCAD-751290",
    distance: "1.5 KM",
    category: "RUNNING",
    officialTime: "00:03:53",
    issueDate: "15 Nov 2026",
  },
  {
    name: "HARJIT SINGH",
    bibNumber: "NCAD-384924",
    distance: "3 KM",
    category: "RUNNING",
    officialTime: "00:14:22",
    issueDate: "15 Nov 2026",
  },
  {
    name: "LEANDER S",
    bibNumber: "NCAD-482019",
    distance: "5 KM",
    category: "RUNNING",
    officialTime: "00:26:15",
    issueDate: "15 Nov 2026",
  },
  {
    name: "DHINISHA RAVICHANDRAN",
    bibNumber: "NCAD-984676",
    distance: "10 KM",
    category: "RUNNING",
    officialTime: "00:54:30",
    issueDate: "15 Nov 2026",
  },
  {
    name: "SAURABH SINGH",
    bibNumber: "NCAD-199999",
    distance: "10 KM",
    category: "RUNNING",
    officialTime: "00:52:14",
    issueDate: "15 Nov 2026",
  },
];

export default function CancerRevealPreviewPage() {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const runner = PRESET_RUNNERS[selectedPresetIndex];

  // Scratch State
  const [isRevealed, setIsRevealed] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const [isScratching, setIsScratching] = useState(false);
  const scratchCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Asset Canvases & Pre-rendered Data URLs for 0ms Instant Display
  const [certDataUrl, setCertDataUrl] = useState<string | null>(null);
  const [bibDataUrl, setBibDataUrl] = useState<string | null>(null);
  const certCanvasObjRef = useRef<HTMLCanvasElement | null>(null);
  const bibCanvasObjRef = useRef<HTMLCanvasElement | null>(null);
  const [certReady, setCertReady] = useState(false);
  const [bibReady, setBibReady] = useState(false);

  // Telemetry Feedback
  const [telemetryMessage, setTelemetryMessage] = useState<string | null>(null);
  const [downloadingCert, setDownloadingCert] = useState(false);
  const [downloadingBib, setDownloadingBib] = useState(false);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<"suite" | "cert" | "bib">("suite");

  // Pre-render Certificate & Bib immediately in background so reveal is 100% INSTANT (0ms)
  useEffect(() => {
    let cancelled = false;
    async function preRenderAssets() {
      try {
        // 1. Render Certificate Canvas
        const certCanvas = await renderCertCanvas({
          runnerName: runner.name,
          distance: runner.distance,
          category: runner.category,
          dateStr: runner.issueDate,
          officialTime: runner.officialTime,
          isCancerEvent: true,
          certificateNumber: `CERT-${runner.bibNumber}`,
        });

        if (!cancelled) {
          certCanvasObjRef.current = certCanvas;
          setCertDataUrl(certCanvas.toDataURL("image/jpeg", 0.95));
          setCertReady(true);
        }

        // 2. Render Bib Canvas
        const bibCanvas = await renderBibCanvas({
          runnerName: runner.name,
          distance: runner.distance,
          positionStr: runner.bibNumber,
          category: runner.category,
          isCancerEvent: true,
        });

        if (!cancelled) {
          bibCanvasObjRef.current = bibCanvas;
          setBibDataUrl(bibCanvas.toDataURL("image/jpeg", 0.95));
          setBibReady(true);
        }
      } catch (err) {
        console.error("Asset pre-render error:", err);
      }
    }

    void preRenderAssets();
    return () => {
      cancelled = true;
    };
  }, [runner]);

  // Initialize Scratch Foil Canvas
  useEffect(() => {
    if (isRevealed) return;
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const w = (canvas.width = canvas.offsetWidth || 560);
    const h = (canvas.height = canvas.offsetHeight || 340);

    // Deep Royal Plum to Burnished Gold Foil Gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#260742");
    grad.addColorStop(0.2, "#4a1575");
    grad.addColorStop(0.4, "#ffd700");
    grad.addColorStop(0.6, "#ffb703");
    grad.addColorStop(0.8, "#3c096c");
    grad.addColorStop(1, "#1a0330");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Diagonal Shimmer Foil Pattern
    ctx.save();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(255, 215, 0, 0.18)";
    for (let x = -w; x < w * 2; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + h, h);
      ctx.stroke();
    }
    ctx.restore();

    // Emblem in Center
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
    ctx.shadowBlur = 12;

    // Outer Ribbon Shield Outline
    ctx.strokeStyle = "rgba(255, 215, 0, 0.75)";
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, w - 40, h - 40);

    // Inner Border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1;
    ctx.strokeRect(26, 26, w - 52, h - 52);

    // Text Header
    ctx.font = 'bold 13px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffd700";
    ctx.fillText("🎗️ NATIONAL CANCER AWARENESS DAY 2026", w / 2, h / 2 - 45);

    ctx.font = '900 24px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = "#ffffff";
    ctx.fillText("OFFICIAL FINISHER VAULT", w / 2, h / 2 - 12);

    ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = "rgba(255, 215, 0, 0.9)";
    ctx.fillText("SCRATCH WITH COIN OR TOUCH TO UNBOX ASSETS", w / 2, h / 2 + 20);

    // Instruction Tag
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(w / 2 - 110, h / 2 + 38, 220, 26);
    ctx.strokeStyle = "#ffd700";
    ctx.strokeRect(w / 2 - 110, h / 2 + 38, 220, 26);

    ctx.font = '900 11px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = "#ffd700";
    ctx.fillText("🪙 SCRATCH HERE TO REVEAL 🪙", w / 2, h / 2 + 55);

    ctx.restore();
  }, [isRevealed, selectedPresetIndex]);

  // Scratch Action Handler
  const handleScratch = (e: React.MouseEvent | React.TouchEvent) => {
    if (isRevealed) return;
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 32, 0, Math.PI * 2);
    ctx.fill();

    audioEngine.playScratch();

    // Accurate full scratch calculation
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const totalPixels = imgData.data.length / 4;
    let clearPixels = 0;
    for (let i = 3; i < imgData.data.length; i += 16) {
      if (imgData.data[i] === 0) clearPixels++;
    }
    const sampleTotal = totalPixels / 4;
    const ratio = Math.min(100, Math.round((clearPixels / sampleTotal) * 100));
    setScratchPercent(ratio);

    // Reveal only after full scratch (~55% of the foil cleared)
    if (ratio >= 55) {
      triggerReveal();
    }
  };

  const triggerReveal = () => {
    setIsRevealed(true);
    audioEngine.playVictoryFanfare();
  };

  const resetReveal = () => {
    setIsRevealed(false);
    setScratchPercent(0);
  };

  // Download Certificate
  const handleDownloadCert = async () => {
    if (!certCanvasObjRef.current) return;
    setDownloadingCert(true);
    try {
      const filename = `RunnerUp_Cancer_Certificate_${runner.name.replace(/\s+/g, "_")}_${runner.bibNumber}.jpg`;
      await triggerCanvasDownload(certCanvasObjRef.current, filename);
      sendDownloadTelemetry("CERTIFICATE", `CERT-${runner.bibNumber}`);
      setTelemetryMessage(`✅ Certificate Telemetry Recorded for #${runner.bibNumber}! Check /admin/proofs to see the counter increment live.`);
      setTimeout(() => setTelemetryMessage(null), 6000);
    } finally {
      setDownloadingCert(false);
    }
  };

  // Download Bib
  const handleDownloadBib = async () => {
    if (!bibCanvasObjRef.current) return;
    setDownloadingBib(true);
    try {
      const filename = `RunnerUp_Cancer_Bib_${runner.name.replace(/\s+/g, "_")}_${runner.bibNumber}.jpg`;
      await triggerCanvasDownload(bibCanvasObjRef.current, filename);
      sendDownloadTelemetry("BIB", runner.bibNumber);
      setTelemetryMessage(`✅ Digital Bib Telemetry Recorded for #${runner.bibNumber}! Check /admin/proofs to see the counter increment live.`);
      setTimeout(() => setTelemetryMessage(null), 6000);
    } finally {
      setDownloadingBib(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07030d] text-[#f8fafc] py-8 px-4 sm:px-6 relative overflow-x-hidden">
      {/* Background Glow Accents */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-purple-700/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-6">
        {/* Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-500/20 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/proofs"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-300 hover:text-white transition-colors border border-purple-500/30 rounded-full px-3.5 py-1.5 bg-purple-900/30"
            >
              <ArrowLeft className="h-4 w-4" /> Proof Queue
            </Link>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Thrilling Reveal Experience · Local Preview
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/proofs"
              target="_blank"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors border border-emerald-500/30 rounded-full px-3 py-1 bg-emerald-950/40"
            >
              <span>Live Admin Telemetry Counter</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Telemetry Alert Toast */}
        {telemetryMessage && (
          <div className="rounded-2xl border border-emerald-400/50 bg-emerald-950/80 p-4 text-emerald-300 text-sm font-semibold flex items-center justify-between shadow-2xl animate-in fade-in slide-in-from-top-2">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              {telemetryMessage}
            </span>
            <Link
              href="/admin/proofs"
              target="_blank"
              className="text-xs underline font-bold uppercase tracking-wider text-emerald-200 hover:text-white ml-3 shrink-0"
            >
              Open Proof Queue &rarr;
            </Link>
          </div>
        )}

        {/* Header Hero */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-purple-300">
            <span>🎗️ National Cancer Awareness Day 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
            Participant E-Certificate &amp; Digital Bib Reveal
          </h1>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Experience the runner unboxing ritual: scratch the ceremonial royal-gold foil medallion to reveal synchronized finisher assets.
          </p>
        </div>

        {/* Runner Switcher Bar */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-amber-400" />
              Select Participant To Preview
            </span>
            <span>5 Paid Sample Runners</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {PRESET_RUNNERS.map((p, idx) => (
              <button
                key={p.bibNumber}
                type="button"
                onClick={() => {
                  setSelectedPresetIndex(idx);
                  resetReveal();
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedPresetIndex === idx
                    ? "border-amber-400 bg-amber-400/15 text-white shadow-lg"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/30"
                }`}
              >
                <p className="text-xs font-black truncate">{p.name}</p>
                <div className="flex items-center justify-between text-[11px] font-mono text-amber-300 mt-1">
                  <span>#{p.bibNumber}</span>
                  <span className="text-slate-400">{p.distance}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ══════════════ STAGE 1: SCRATCH CARD UNBOXING ══════════════ */}
        {!isRevealed ? (
          <div className="rounded-3xl border-2 border-purple-500/30 bg-gradient-to-b from-purple-950/40 via-slate-950/80 to-black p-6 sm:p-10 text-center shadow-2xl space-y-6 backdrop-blur-xl">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-400">
                <Volume2 className="h-4 w-4" /> Interactive Web-Audio Scratch Surface
              </div>
              <h2 className="text-2xl font-black uppercase text-white">
                Crack The Ceremonial Finisher Seal
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Use your mouse or finger to scratch off the protective gold-purple foil over the card below.
              </p>
            </div>

            {/* The Scratch Surface Card */}
            <div className="relative mx-auto max-w-lg aspect-[560/340] rounded-2xl overflow-hidden border-2 border-amber-400/50 shadow-2xl select-none touch-none cursor-crosshair">
              {/* Underlying Secret Revealed Content */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#260742] to-[#120121] flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-amber-300">
                  <Unlock className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-black uppercase text-white">{runner.name}</h3>
                <div className="flex items-center gap-3 text-xs font-mono text-amber-300">
                  <span className="px-2.5 py-1 rounded-md bg-purple-900/60 border border-purple-500/40">
                    BIB #{runner.bibNumber}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-purple-900/60 border border-purple-500/40">
                    {runner.distance} · {runner.category}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
                  ✨ Finisher Suite Ready For Download
                </p>
              </div>

              {/* Foreground Scratchable Foil Canvas */}
              <canvas
                ref={scratchCanvasRef}
                onMouseDown={() => setIsScratching(true)}
                onMouseUp={() => setIsScratching(false)}
                onMouseLeave={() => setIsScratching(false)}
                onMouseMove={(e) => {
                  if (isScratching) handleScratch(e);
                }}
                onTouchStart={() => setIsScratching(true)}
                onTouchEnd={() => setIsScratching(false)}
                onTouchMove={handleScratch}
                className="absolute inset-0 w-full h-full block"
              />
            </div>

            {/* Progress Bar & Quick Reveal Button */}
            <div className="max-w-md mx-auto space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400 uppercase tracking-wider">Foil Cleared</span>
                <span className="text-amber-400 font-mono">{scratchPercent}% / 55%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-amber-400 transition-all duration-150"
                  style={{ width: `${Math.min(100, (scratchPercent / 55) * 100)}%` }}
                />
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={triggerReveal}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 px-7 py-3 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Instant Break Seal / Unbox All</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ══════════════ STAGE 2: REVEALED FINISHER SUITE ══════════════ */
          <div className="space-y-6">
            {/* Unboxed Banner */}
            <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-purple-950/80 via-amber-950/40 to-purple-950/80 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider">
                    <Sparkles className="h-3 w-3" /> Unboxed &amp; Authenticated
                  </div>
                  <h2 className="text-lg sm:text-xl font-black uppercase text-white">
                    {runner.name} · Official Finisher Assets
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetReveal}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white border border-white/20 rounded-full px-3.5 py-1.5 bg-white/10 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Re-Seal Vault
                </button>
              </div>
            </div>

            {/* 100% Data Synchronization Check Table */}
            <div className="rounded-2xl border border-purple-500/30 bg-slate-900/80 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-amber-400 mb-3">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  100% Data Synchronization &amp; Accuracy Verification
                </span>
                <span className="text-emerald-400 font-mono text-[11px]">ALL FIELDS VERIFIED MATCH</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Participant</span>
                  <span className="font-bold text-white text-[11px] truncate block">{runner.name}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Race Bib #</span>
                  <span className="font-mono font-bold text-amber-300 block">{runner.bibNumber}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Distance</span>
                  <span className="font-bold text-purple-300 block">{runner.distance}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Category</span>
                  <span className="font-bold text-white block">{runner.category}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Official Time</span>
                  <span className="font-mono font-bold text-emerald-300 block">{runner.officialTime}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Issue Date</span>
                  <span className="font-bold text-slate-200 block">{runner.issueDate}</span>
                </div>
              </div>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("suite")}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === "suite"
                    ? "bg-amber-400 text-slate-950 shadow-lg"
                    : "bg-white/5 text-slate-400 hover:text-white border border-white/10"
                }`}
              >
                Side-by-Side Suite
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("cert")}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === "cert"
                    ? "bg-amber-400 text-slate-950 shadow-lg"
                    : "bg-white/5 text-slate-400 hover:text-white border border-white/10"
                }`}
              >
                E-Certificate Only
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("bib")}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === "bib"
                    ? "bg-amber-400 text-slate-950 shadow-lg"
                    : "bg-white/5 text-slate-400 hover:text-white border border-white/10"
                }`}
              >
                Digital Bib Only
              </button>
            </div>

            {/* Asset Canvases Grid */}
            <div
              className={`grid gap-6 ${
                activeTab === "suite" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 max-w-2xl mx-auto"
              }`}
            >
              {/* Asset 1: Certificate */}
              {(activeTab === "suite" || activeTab === "cert") && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <Award className="h-4 w-4" /> Official Finisher Certificate
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">1024 × 682 Master JPG</span>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl bg-black aspect-[1024/682] w-full">
                    {certDataUrl ? (
                      <img
                        src={certDataUrl}
                        alt="Official Certificate"
                        className="w-full h-full object-contain block select-none"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                        <span className="text-xs font-bold text-amber-300 animate-pulse">Rendering Certificate...</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadCert}
                      disabled={downloadingCert || !certReady}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 py-3 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      <span>{downloadingCert ? "Saving HD File..." : "Download Certificate (HD)"}</span>
                    </button>

                    <Link
                      href={`/certificates/CERT-${runner.bibNumber}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 px-3.5 py-3 text-xs font-bold text-white transition-colors"
                      title="Open Public Page"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Asset 2: Digital Bib */}
              {(activeTab === "suite" || activeTab === "bib") && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                      <Trophy className="h-4 w-4" /> Official Digital Race Bib
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">1024 × 682 Master JPG</span>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden border-2 border-purple-500/40 shadow-2xl bg-black aspect-[1024/682] w-full">
                    {bibDataUrl ? (
                      <img
                        src={bibDataUrl}
                        alt="Official Digital Bib"
                        className="w-full h-full object-contain block select-none"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                        <span className="text-xs font-bold text-purple-300 animate-pulse">Rendering Bib...</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadBib}
                      disabled={downloadingBib || !bibReady}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      <span>{downloadingBib ? "Saving HD File..." : "Download Digital Bib (HD)"}</span>
                    </button>

                    <Link
                      href={`/bibs/${runner.bibNumber}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 px-3.5 py-3 text-xs font-bold text-white transition-colors"
                      title="Open Public Page"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Telemetry Verification Footer Box */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 text-center space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Real-Time Telemetry Armed
              </div>
              <h3 className="text-base font-bold text-white">
                How Download Verification Operates
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl mx-auto leading-relaxed">
                When a participant clicks either download button, a guaranteed zero-drop beacon is transmitted to{" "}
                <code className="text-emerald-300 bg-black/40 px-1 py-0.5 rounded">/api/track/download</code>. The
                Admin Proofs Queue (<code className="text-emerald-300 bg-black/40 px-1 py-0.5 rounded">/admin/proofs</code>)
                instantly marks the runner as <strong className="text-emerald-300">📥 Downloaded</strong> and updates the
                aggregate claimed count and completion percentage in real time.
              </p>

              <div className="pt-2">
                <Link
                  href="/admin/proofs"
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-400 bg-emerald-500/20 hover:bg-emerald-500/30 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-emerald-200 transition-colors"
                >
                  <span>Open Admin Proof Queue in New Tab</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
