"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  Trophy,
  Award,
  CheckCircle2,
  Share2,
  ArrowRight,
  Eye,
  RefreshCw,
  Download,
  Check,
  Smartphone,
} from "lucide-react";
import { renderBibCanvas, triggerCanvasDownload } from "../../lib/asset-canvas";

interface ScratchRevealCardProps {
  bibNumber: string;
  runnerName: string;
  category: string;
  eventTitle: string;
  luckyPerk?: string;
  onReveal?: () => void;
  autoRevealThreshold?: number; // percentage (e.g. 40)
  accentColor?: "orange" | "purple" | "gold";
  initialRevealed?: boolean;
}

// Physical latex/foil flake particle
interface FlakeParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  opacity: number;
}

// Synthesize coin scratch sound via Web Audio API (zero external mp3 needed)
class ScratchAudioEngine {
  private ctx: AudioContext | null = null;
  private lastPlayTime = 0;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
  }

  playScratch() {
    try {
      const now = Date.now();
      if (now - this.lastPlayTime < 60) return; // throttle audio rate
      this.lastPlayTime = now;

      this.init();
      if (!this.ctx) return;

      const bufferSize = this.ctx.sampleRate * 0.04; // 40ms noise burst
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 2400 + Math.random() * 800; // metallic scrape frequency
      filter.Q.value = 2.5;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
    } catch {
      // Audio autoplay policy fallback
    }
  }

  playWinChime() {
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        const startTime = this.ctx!.currentTime + i * 0.08;
        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.35);
      });
    } catch {
      // Audio fallback
    }
  }
}

const audioEngine = new ScratchAudioEngine();

export function ScratchRevealCard({
  bibNumber,
  runnerName,
  category,
  eventTitle,
  luckyPerk = "⚡ Lucky Finisher Wave · VIP Leaderboard Flame Badge Unlocked!",
  onReveal,
  autoRevealThreshold = 40,
  accentColor = "orange",
  initialRevealed = false,
}: ScratchRevealCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(initialRevealed);
  const [scratchPercent, setScratchPercent] = useState(0);
  const [isScratching, setIsScratching] = useState(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [flakes, setFlakes] = useState<FlakeParticle[]>([]);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Direct Bib Download States
  const [downloadingBib, setDownloadingBib] = useState(false);
  const [downloadedBib, setDownloadedBib] = useState(false);

  const isKinetic =
    eventTitle.toLowerCase().includes("kinetic") ||
    bibNumber.toUpperCase().startsWith("KRUN") ||
    accentColor === "orange";

  const isCancer =
    !isKinetic &&
    (eventTitle.toLowerCase().includes("cancer") ||
      bibNumber.toUpperCase().startsWith("NCAD") ||
      accentColor === "purple");

  // Realistic Procedural Metallic Foil Texture
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const width = canvas.offsetWidth || 340;
    const height = canvas.offsetHeight || 220;
    canvas.width = width;
    canvas.height = height;

    // 1. Multi-stop Metallic Foil Base
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    if (isKinetic) {
      gradient.addColorStop(0, "#92400e"); // Deep bronze
      gradient.addColorStop(0.15, "#d97706");
      gradient.addColorStop(0.3, "#f59e0b"); // Bright gold
      gradient.addColorStop(0.45, "#fef08a"); // Metallic highlight
      gradient.addColorStop(0.6, "#ea580c"); // Fiery kinetic orange
      gradient.addColorStop(0.75, "#f59e0b");
      gradient.addColorStop(0.9, "#b45309");
      gradient.addColorStop(1, "#78350f");
    } else if (isCancer) {
      gradient.addColorStop(0, "#3b0764");
      gradient.addColorStop(0.2, "#6b21a8");
      gradient.addColorStop(0.4, "#9333ea");
      gradient.addColorStop(0.55, "#f3e8ff");
      gradient.addColorStop(0.7, "#a855f7");
      gradient.addColorStop(0.9, "#581c87");
      gradient.addColorStop(1, "#2e1065");
    } else {
      gradient.addColorStop(0, "#713f12");
      gradient.addColorStop(0.25, "#ca8a04");
      gradient.addColorStop(0.5, "#fef08a");
      gradient.addColorStop(0.75, "#eab308");
      gradient.addColorStop(1, "#854d0e");
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Realistic Procedural Foil Micro-Specks / Latex Noise Stipple
    ctx.save();
    for (let i = 0; i < 2800; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      const isBright = Math.random() > 0.45;
      ctx.fillStyle = isBright
        ? `rgba(255, 255, 255, ${0.12 + Math.random() * 0.18})`
        : `rgba(0, 0, 0, ${0.08 + Math.random() * 0.14})`;
      ctx.fillRect(rx, ry, Math.random() > 0.7 ? 2 : 1, Math.random() > 0.7 ? 2 : 1);
    }
    ctx.restore();

    // 3. Security Guilloche Waves & Diagonal Metallic Brushed Sheen
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1.2;
    for (let x = -height; x < width + height; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + height, height);
      ctx.stroke();
    }

    // Security Micro-Watermark Text
    ctx.font = "800 8.5px monospace";
    ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
    ctx.textAlign = "center";
    for (let y = 20; y < height; y += 38) {
      ctx.fillText("★ OFFICIAL RUNNERUP ATHLETE ALLOCATION ★", width / 2, y);
    }
    ctx.restore();

    // 4. Heavy Metallic Embossed Outer Frame
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    ctx.lineWidth = 3;
    ctx.strokeRect(5, 5, width - 10, height - 10);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(7, 7, width - 14, height - 14);
    ctx.restore();

    // 5. Central Embossed Scratch Emblem with Coin Instructions
    ctx.save();
    const cx = width / 2;
    const cy = height / 2;

    // Glowing medallion backing
    const sealGrad = ctx.createRadialGradient(cx, cy - 8, 5, cx, cy - 8, 48);
    sealGrad.addColorStop(0, "rgba(255, 255, 255, 0.35)");
    sealGrad.addColorStop(0.7, "rgba(255, 255, 255, 0.08)");
    sealGrad.addColorStop(1, "rgba(0, 0, 0, 0.25)");
    ctx.fillStyle = sealGrad;
    ctx.beginPath();
    ctx.arc(cx, cy - 8, 48, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Golden Coin Icon
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🪙", cx, cy - 24);

    // Headline with embossed drop-shadow
    ctx.font = "900 14px 'Outfit', -apple-system, sans-serif";
    ctx.fillStyle = "#1e1305";
    ctx.fillText("SCRATCH WITH COIN OR FINGER", cx + 1, cy + 11);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("SCRATCH WITH COIN OR FINGER", cx, cy + 10);

    // Subtitle
    ctx.font = "bold 10px monospace";
    ctx.fillStyle = "#fef08a";
    ctx.fillText("★ REVEAL YOUR OFFICIAL RACE BIB ★", cx, cy + 28);

    // Bottom Pill Tag
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.roundRect(cx - 90, cy + 44, 180, 20, 10);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = "800 9px sans-serif";
    ctx.fillStyle = "#fbbf24";
    ctx.fillText("🎁 SECRET LUCKY FINISHER PERK INSIDE", cx, cy + 54);
    ctx.restore();
  }, [isKinetic, isCancer]);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  // Animate Flying Latex Flakes
  useEffect(() => {
    if (flakes.length === 0) return;
    const anim = requestAnimationFrame(() => {
      setFlakes((prev) =>
        prev
          .map((f) => ({
            ...f,
            x: f.x + f.vx,
            y: f.y + f.vy,
            vy: f.vy + 0.35, // gravity
            rotation: f.rotation + f.vRot,
            opacity: f.opacity - 0.025,
          }))
          .filter((f) => f.opacity > 0 && f.y < 350)
      );
    });
    return () => cancelAnimationFrame(anim);
  }, [flakes]);

  // Scratch Action Handler with Stroke Interpolation (no dotted gaps on fast swipes)
  const scratchAtPoint = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.globalCompositeOperation = "destination-out";

    // Draw textured rough coin edge (3 overlapping jittered circles)
    for (let i = 0; i < 3; i++) {
      const jx = (Math.random() - 0.5) * 4;
      const jy = (Math.random() - 0.5) * 4;
      const rad = 22 + (Math.random() - 0.5) * 4;
      ctx.beginPath();
      ctx.arc(x + jx, y + jy, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const scratch = (clientX: number, clientY: number) => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setCursorPos({ x, y });

    // Interpolate between lastPoint and currentPoint for smooth continuous cuts
    if (lastPointRef.current) {
      const dist = Math.hypot(x - lastPointRef.current.x, y - lastPointRef.current.y);
      const steps = Math.max(1, Math.floor(dist / 6));
      for (let s = 1; s <= steps; s++) {
        const ix = lastPointRef.current.x + ((x - lastPointRef.current.x) * s) / steps;
        const iy = lastPointRef.current.y + ((y - lastPointRef.current.y) * s) / steps;
        scratchAtPoint(ctx, ix, iy);
      }
    } else {
      scratchAtPoint(ctx, x, y);
    }
    lastPointRef.current = { x, y };

    // Play synthesized scratch sound
    audioEngine.playScratch();

    // Mobile micro-haptics
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(8);
      } catch {
        // non-blocking
      }
    }

    // Spawn physical metallic foil flakes scattering from the coin
    const newFlakes: FlakeParticle[] = [];
    const numFlakes = 3 + Math.floor(Math.random() * 3);
    for (let f = 0; f < numFlakes; f++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      newFlakes.push({
        id: Math.random() + Date.now(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 3 + Math.random() * 5,
        color: Math.random() > 0.4 ? "#f59e0b" : "#fef08a",
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 18,
        opacity: 0.95,
      });
    }
    setFlakes((prev) => [...prev.slice(-25), ...newFlakes]);

    // Periodically check scratched area
    checkScratchedPercentage(ctx, canvas.width, canvas.height);
  };

  const checkScratchedPercentage = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    try {
      const imageData = ctx.getImageData(0, 0, width, height);
      const pixels = imageData.data;
      let transparentCount = 0;
      // Sample 1 in every 16 pixels for blazing 60fps performance
      for (let i = 3; i < pixels.length; i += 16) {
        if (pixels[i] === 0) transparentCount++;
      }
      const totalSampled = pixels.length / 16;
      const pct = Math.round((transparentCount / totalSampled) * 100);
      setScratchPercent(pct);

      if (pct >= autoRevealThreshold && !isRevealed) {
        triggerFullReveal();
      }
    } catch {
      // Non-blocking
    }
  };

  const triggerFullReveal = () => {
    setIsRevealed(true);
    setScratchPercent(100);
    audioEngine.playWinChime();
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    if (onReveal) onReveal();
  };

  // Direct 1-Click Bib Download Handler
  const handleDirectBibDownload = async () => {
    setDownloadingBib(true);
    try {
      const canvas = await renderBibCanvas({
        runnerName: runnerName || "RUNNER",
        distance: category || "5 KM",
        positionStr: bibNumber || "1001",
        isKineticEvent: isKinetic,
        isCancerEvent: isCancer,
      });
      await triggerCanvasDownload(canvas, `RunnerUp-Bib-${bibNumber}.jpg`);
      setDownloadedBib(true);
      setTimeout(() => setDownloadedBib(false), 3000);
    } catch (err) {
      console.error("Direct Bib Download error:", err);
    } finally {
      setDownloadingBib(false);
    }
  };

  // Mouse & Touch Listeners
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsScratching(true);
    lastPointRef.current = null;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isScratching) return;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    setIsScratching(false);
    lastPointRef.current = null;
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    setIsScratching(true);
    lastPointRef.current = null;
    const touch = e.touches[0];
    if (touch) scratch(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0];
    if (touch) scratch(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    setIsScratching(false);
    lastPointRef.current = null;
  };

  return (
    <div className="w-full max-w-sm mx-auto select-none" ref={containerRef}>
      {/* Top Scarcity / Excitement Header */}
      <div className="flex items-center justify-between text-xs font-bold mb-2 px-1">
        <span className="flex items-center gap-1.5 text-amber-400">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Official Bib Allocation</span>
        </span>
        <span className="text-[11px] font-mono text-slate-400">
          {isRevealed ? "100% Revealed 🎉" : `${scratchPercent}% Scratched`}
        </span>
      </div>

      {/* Card Wrapper with 3D Depth */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400/50 bg-gradient-to-br from-[#0f1722] via-[#090d14] to-[#141d2b] p-5 shadow-2xl min-h-[220px] flex flex-col justify-between">
        {/* Glow ambient background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className={`absolute -top-10 -right-10 h-36 w-36 rounded-full blur-2xl opacity-30 ${
              isKinetic ? "bg-orange-500" : isCancer ? "bg-purple-500" : "bg-amber-500"
            }`}
          />
        </div>

        {/* ═══ UNDERLYING REVEALED CONTENT (THE PRIZE) ═══ */}
        <div className="relative z-10 space-y-3">
          {/* Official Stamp */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div>
              <span className="text-[9px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                RUNNERUP ATHLETE PASS
              </span>
              <span className="text-xs font-black text-white truncate max-w-[180px] block">
                {eventTitle}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Confirmed
            </span>
          </div>

          {/* Big High-Impact Bib Display */}
          <div className="text-center py-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase">
              YOUR OFFICIAL BIB NUMBER
            </span>
            <div className="text-4xl sm:text-5xl font-black font-mono tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-400 drop-shadow-[0_2px_12px_rgba(251,191,36,0.3)] my-0.5">
              {bibNumber}
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-300">
              <span className="text-white font-bold">{runnerName}</span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400 font-bold">{category}</span>
            </div>
          </div>

          {/* Secret Finisher Perk / Lucky Tier */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
              🎁 LUCKY FINISHER ALLOCATION
            </span>
            <p className="text-xs font-bold text-amber-200 mt-0.5 leading-snug">
              {luckyPerk}
            </p>
          </div>
        </div>

        {/* ═══ SCRATCH CANVAS OVERLAY ═══ */}
        {!isRevealed && (
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="absolute inset-0 z-20 h-full w-full cursor-none touch-none transition-opacity duration-300"
          />
        )}

        {/* Realistic Coin Cursor (Tracks Finger / Mouse) */}
        {!isRevealed && cursorPos && (
          <div
            style={{
              left: cursorPos.x,
              top: cursorPos.y,
              transform: `translate(-50%, -50%) rotate(${isScratching ? "-28deg" : "-15deg"}) scale(${isScratching ? 1.15 : 1})`,
            }}
            className="pointer-events-none absolute z-30 transition-transform duration-75 flex items-center justify-center"
          >
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 border-2 border-white shadow-xl flex items-center justify-center text-xs font-black text-amber-950 ring-2 ring-amber-500/50">
              ₹
            </div>
          </div>
        )}

        {/* Physical Flying Latex Foil Flakes */}
        {flakes.map((f) => (
          <div
            key={f.id}
            style={{
              left: f.x,
              top: f.y,
              width: f.size,
              height: f.size * 0.7,
              backgroundColor: f.color,
              opacity: f.opacity,
              transform: `rotate(${f.rotation}deg)`,
            }}
            className="pointer-events-none absolute z-30 rounded-xs shadow-xs"
          />
        ))}
      </div>

      {/* ═══ REVEALED STATUS: LOCKED TILL EVENT ENDS RULE ═══ */}
      {isRevealed && (
        <div className="mt-3.5 space-y-2">
          {/* Info pill showing official locked policy */}
          <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-center space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
              🔒 Event In Progress · Official Policy
            </span>
            <p className="text-[11px] text-slate-300 leading-snug">
              Your official high-resolution digital race bib and verified e-certificate unlock automatically on your dashboard after the challenge concludes on <strong className="text-white">{isKinetic ? "15 Dec 2026" : "17 Nov 2026"}</strong>.
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] px-1 text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" /> Slot &amp; Bib Confirmed
            </span>
            <Link
              href="/dashboard"
              className="font-bold text-amber-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Unrevealed: Quick Reveal helper */}
      {!isRevealed && (
        <div className="mt-2.5 flex items-center justify-between px-1">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <span>👆 Scratch the gold card above</span>
          </span>
          <button
            type="button"
            onClick={triggerFullReveal}
            className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors cursor-pointer flex items-center gap-1"
          >
            <Eye className="h-3 w-3" /> Reveal Instantly
          </button>
        </div>
      )}
    </div>
  );
}
