"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCw,
  Sparkles,
  Maximize2,
  X,
  ShieldCheck,
  Award,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { getEventMedalImages } from "../../data/events";

interface Medal3DViewerProps {
  slug: string;
  eventName?: string;
  size?: "mobile" | "desktop" | "rewards" | "compact";
  className?: string;
  autoRotateInterval?: number; // optional auto-flip interval in ms (0 = disabled)
  showBadges?: boolean;
}

export function Medal3DViewer({
  slug,
  eventName = "Indian Air Force Day Virtual Challenge",
  size = "desktop",
  className = "",
  showBadges = true,
}: Medal3DViewerProps) {
  const images = getEventMedalImages(slug);
  const [activeFace, setActiveFace] = useState<"front" | "back">("front");
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, glareX: 50, glareY: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Preload both images so flip has zero latency or flicker
  useEffect(() => {
    if (typeof window !== "undefined") {
      const img1 = new Image();
      img1.src = images.front;
      const img2 = new Image();
      img2.src = images.back;
    }
  }, [images.front, images.back]);

  const toggleFace = useCallback(() => {
    setHasInteracted(true);
    setActiveFace((prev) => (prev === "front" ? "back" : "front"));
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || size === "mobile") return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Subtle tilt limits (-9 to +9 deg)
      const ry = ((x - centerX) / centerX) * 8;
      const rx = -((y - centerY) / centerY) * 8;

      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;

      setTilt({ rx, ry, glareX, glareY });
    },
    [size]
  );

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTilt({ rx: 0, ry: 0, glareX: 50, glareY: 50 });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleFace();
    }
  };

  const isBack = activeFace === "back";

  // Size specific dimensions & styling
  const sizeConfig = {
    mobile: {
      maxH: "max-h-[300px] xs:max-h-[340px] sm:max-h-[380px]",
      containerMaxW: "max-w-[280px] xs:max-w-[320px] sm:max-w-[360px]",
      haloSize: "h-[260px] w-[260px] sm:h-[320px] sm:w-[320px]",
    },
    desktop: {
      maxH: "max-h-[440px] lg:max-h-[480px] xl:max-h-[520px]",
      containerMaxW: "max-w-[380px] lg:max-w-[420px] xl:max-w-[460px]",
      haloSize: "h-[420px] w-[420px] lg:h-[480px] lg:w-[480px]",
    },
    rewards: {
      maxH: "max-h-[320px] sm:max-h-[380px]",
      containerMaxW: "max-w-[260px] sm:max-w-[310px]",
      haloSize: "h-[280px] w-[280px] sm:h-[320px] sm:w-[320px]",
    },
    compact: {
      maxH: "max-h-[220px]",
      containerMaxW: "max-w-[200px]",
      haloSize: "h-[180px] w-[180px]",
    },
  }[size];

  // Specific detail highlights for IAF medal
  const frontFeatures = [
    { label: "High-Relief Su-30MKI Jet", icon: Sparkles },
    { label: "Himalayan Runway Base", icon: Award },
    { label: "Solid Die-Cast Bronze", icon: ShieldCheck },
  ];

  const backFeatures = [
    { label: "Ashoka Lion Capital", icon: ShieldCheck },
    { label: 'IAF Motto: "नभः स्पृशं दीप्तम्"', icon: Flame },
    { label: '"Always Above Always Beyond"', icon: Award },
  ];

  const activeFeatures = isBack ? backFeatures : frontFeatures;

  return (
    <>
      <div
        className={`relative flex flex-col items-center justify-center select-none ${className}`}
        style={{ perspective: 1400 }}
      >
        {/* ── Ambient Radial Atmosphere Halo Behind Medal ── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
          <div
            className={`${sizeConfig.haloSize} rounded-full bg-gradient-to-tr from-[#f59e0b]/25 via-[#e64833]/15 to-[#874f41]/10 blur-[75px] transition-all duration-700 ${
              isHovered ? "scale-110 opacity-100" : "scale-100 opacity-80"
            }`}
          />
        </div>

        {/* ── Interactive View Switcher Controls (Front / Back Segmented Buttons) ── */}
        <div className="mb-3.5 z-20 flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-slate-950/85 p-1 backdrop-blur-xl shadow-lg shadow-black/40">
          <button
            type="button"
            onClick={() => {
              setHasInteracted(true);
              setActiveFace("front");
            }}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-300 cursor-pointer ${
              !isBack
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md shadow-amber-500/30 scale-[1.02]"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>🥇</span>
            <span className="tracking-wide">Front View</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setHasInteracted(true);
              setActiveFace("back");
            }}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-300 cursor-pointer ${
              isBack
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md shadow-amber-500/30 scale-[1.02]"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>🛡️</span>
            <span className="tracking-wide">Back Crest</span>
          </button>

          {/* Quick Zoom Inspector Trigger */}
          <button
            type="button"
            onClick={() => setIsZoomOpen(true)}
            title="Inspect 100% fine metalwork detail"
            className="flex items-center justify-center h-7 w-7 rounded-full text-zinc-400 hover:text-amber-300 hover:bg-white/10 transition-colors ml-0.5 cursor-pointer"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* ── 3D Rotatable Medal Card Container ── */}
        <div
          ref={cardRef}
          role="button"
          tabIndex={0}
          aria-label={`Interactive 3D Medal. Currently showing ${activeFace} view. Tap to flip.`}
          onClick={toggleFace}
          onKeyDown={handleKeyDown}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`relative w-full ${sizeConfig.containerMaxW} cursor-pointer group focus:outline-none`}
          style={{
            transformStyle: "preserve-3d",
            perspective: 1200,
          }}
        >
          {/* Framer Motion 3D Rotator */}
          <motion.div
            animate={{
              rotateY: isBack ? 180 + tilt.ry : tilt.ry,
              rotateX: tilt.rx,
              scale: isHovered ? 1.02 : 1,
            }}
            transition={{
              rotateY: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
              rotateX: { duration: 0.15, ease: "easeOut" },
              scale: { duration: 0.25 },
            }}
            style={{
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
            className="relative w-full flex items-center justify-center"
          >
            {/* ════════ FRONT FACE ════════ */}
            <div
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(0deg)",
              }}
              className="relative w-full flex items-center justify-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images.front}
                alt={`${eventName} - Front Official Medal`}
                fetchPriority="high"
                decoding="async"
                className={`w-full h-auto ${sizeConfig.maxH} object-contain select-none drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)] filter brightness-105 contrast-[1.03] transition-all`}
              />

              {/* Dynamic Metallic Specular Glare Overlay */}
              <div
                className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-300 mix-blend-overlay"
                style={{
                  background: `radial-gradient(circle 220px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.7) 0%, rgba(245,158,11,0.2) 40%, transparent 70%)`,
                }}
              />
            </div>

            {/* ════════ BACK FACE ════════ */}
            <div
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
              className="w-full h-full flex items-center justify-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images.back}
                alt={`${eventName} - Back Crest Official Medal`}
                fetchPriority="high"
                decoding="async"
                className={`w-full h-auto ${sizeConfig.maxH} object-contain select-none drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)] filter brightness-105 contrast-[1.03] transition-all`}
              />

              {/* Dynamic Metallic Specular Glare Overlay on Back */}
              <div
                className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-300 mix-blend-overlay"
                style={{
                  background: `radial-gradient(circle 220px at ${100 - tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.7) 0%, rgba(245,158,11,0.2) 40%, transparent 70%)`,
                }}
              />
            </div>
          </motion.div>

        </div>

        {/* ── Interactive Tap to Flip Badge (Docked cleanly below the medal - ZERO overlap with medal graphic) ── */}
        <div className="mt-3 z-20 flex items-center justify-center">
          <motion.button
            type="button"
            onClick={toggleFace}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/45 bg-slate-950/90 px-3.5 py-1 text-[0.68rem] sm:text-xs font-bold uppercase tracking-wider text-amber-300 shadow-[0_4px_16px_rgba(0,0,0,0.8)] backdrop-blur-md hover:bg-amber-950/40 hover:border-amber-300 transition-colors cursor-pointer"
          >
            <RotateCw className="h-3 w-3 text-amber-400" />
            <span>Tap medal to flip 360°</span>
          </motion.button>
        </div>

        {/* ── Active Face Descriptor Caption ── */}
        <div className="mt-3.5 text-center max-w-sm px-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFace}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-[0.75rem] sm:text-xs font-semibold text-zinc-300 leading-snug">
                {isBack ? (
                  <>
                    <span className="text-amber-400 font-bold">Reverse Face: </span>
                    Ashoka Lion Crest, IAF Motto{" "}
                    <span className="text-amber-200 italic font-normal">&ldquo;नभः स्पृशं दीप्तम्&rdquo;</span>{" "}
                    & Inscription
                  </>
                ) : (
                  <>
                    <span className="text-amber-400 font-bold">Front Face: </span>
                    High-Relief Su-30MKI Fighter Jet, Himalayan Runway & IAF Roundel
                  </>
                )}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Micro Feature Badges Under Medal ── */}
        {showBadges && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 max-w-md px-1">
            {activeFeatures.map(({ label, icon: Icon }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[0.65rem] sm:text-[0.7rem] font-medium text-zinc-300 backdrop-blur-md transition-colors hover:border-amber-400/30 hover:text-amber-300"
              >
                <Icon className="h-3 w-3 text-amber-400 shrink-0" />
                <span>{label}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── High-Resolution Inspection Zoom Modal ── */}
      <AnimatePresence>
        {isZoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
            onClick={() => setIsZoomOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full rounded-3xl border border-amber-500/30 bg-[#0e1318] p-6 shadow-2xl flex flex-col items-center"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close zoomed preview"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header */}
              <div className="text-center mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  100% Authentic Finisher Medal
                </span>
                <h3 className="font-display font-black text-lg text-white mt-0.5">
                  {eventName}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Full die-cast heavy antique bronze alloy · Ribbon with custom print
                </p>
              </div>

              {/* Large Zoomed Image */}
              <div
                className="relative w-full aspect-[2/3] max-h-[460px] flex items-center justify-center cursor-pointer group"
                onClick={toggleFace}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={isBack ? images.back : images.front}
                  alt={isBack ? "Back Crest View" : "Front View"}
                  className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)]"
                />
              </div>

              {/* Switch Buttons Inside Modal */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveFace("front")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    !isBack
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/30"
                      : "bg-white/10 text-zinc-300 hover:text-white"
                  }`}
                >
                  🥇 Front Face (Jet Relief)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFace("back")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isBack
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/30"
                      : "bg-white/10 text-zinc-300 hover:text-white"
                  }`}
                >
                  🛡️ Back Crest (Ashoka Lion)
                </button>
              </div>

              {/* Guarantees */}
              <div className="mt-5 w-full pt-4 border-t border-white/10 flex items-center justify-around text-[0.72rem] text-zinc-400">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Heavyweight Metal
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Free Doorstep Delivery
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Backwards-compatible legacy SVG fallback for any existing references
export function Medal3D({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 170" className={className} aria-hidden="true" role="img">
      <defs>
        <linearGradient id="gold-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbe9d0" />
          <stop offset="0.55" stopColor="#874f41" />
          <stop offset="1" stopColor="#244855" />
        </linearGradient>
        <radialGradient id="gold-face" cx="0.35" cy="0.28" r="1.1">
          <stop offset="0" stopColor="#fbe9d0" />
          <stop offset="0.7" stopColor="#e64833" />
          <stop offset="1" stopColor="#874f41" />
        </radialGradient>
        <linearGradient id="ribbon-g" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e64833" />
          <stop offset="1" stopColor="#874f41" />
        </linearGradient>
        <linearGradient id="peak-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#90aead" />
          <stop offset="1" stopColor="#244855" />
        </linearGradient>
      </defs>

      <path d="M60 34 L78 52 L72 72 L60 64 L48 72 L42 52 Z" fill="url(#ribbon-g)" />
      <path d="M60 34 L78 52 L72 72 L60 64 Z" fill="#ffffff" opacity="0.2" />
      <path d="M60 34 L42 52 L48 72 L60 64 Z" fill="#000000" opacity="0.14" />

      <rect x="52" y="58" width="16" height="14" rx="4" fill="#ffffff" opacity="0.95" />
      <rect x="56" y="61" width="8" height="9" rx="2" fill="#874f41" />

      <circle cx="64" cy="114" r="46" fill="#14242a" opacity="0.35" />
      <circle cx="60" cy="108" r="46" fill="url(#gold-bg)" />
      <circle cx="60" cy="108" r="38" fill="url(#gold-face)" />
      <circle cx="60" cy="108" r="38" fill="none" stroke="#fbe9d0" strokeWidth="2.5" opacity="0.9" />
      <circle cx="60" cy="108" r="44" fill="none" stroke="#90aead" strokeWidth="3" opacity="0.7" />

      <path d="M60 88 L74 116 H64 L60 106 L56 116 H46 Z" fill="url(#peak-g)" />
      <path d="M60 92 L70 114 L60 114 Z" fill="#90aead" opacity="0.55" />
      <path d="M60 88 L60 106 L56 116 L46 116 Z" fill="#244855" />

      <circle cx="60" cy="82" r="3" fill="#fbe9d0" />
      <path d="M60 76 V70 M60 88 V94 M54 82 H48 M66 82 H72" stroke="#fbe9d0" strokeWidth="1.5" strokeLinecap="round" />

      <path
        d="M60 124 l2.4 5.4 5.9 0.6 -4.3 4.1 1.1 5.9 -5.1 -3 -5.1 3 1.1 -5.9 -4.3 -4.1 5.9 -0.6 Z"
        fill="#fbe9d0"
      />
    </svg>
  );
}
