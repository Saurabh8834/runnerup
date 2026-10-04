"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { Camera, Heart, Loader2, MapPin, Sparkles, Trophy, Upload, X, ArrowRight, Award } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getApiUrl } from "../../lib/api";
import { fileToDataUrl, validateImageFile } from "../../lib/cloudinary";
import {
  galleryCategories,
  galleryItems as staticGalleryItems,
  galleryStats,
  type GalleryCategory,
  type GalleryItem,
} from "../data/gallery";
import { fetchGalleryContent } from "../../lib/events-api";

function useCountUp(target: number, active: boolean, duration = 1100) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, duration, target]);

  return value;
}

const statIcons = [Camera, MapPin, Sparkles, Heart] as const;

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Camera }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const count = useCountUp(value, inView);

  return (
    <div
      ref={ref}
      className="group relative overflow-hidden rounded-3xl border border-[#90aead]/30 bg-white px-4 py-5 text-center shadow-xl transition-all duration-300 hover:border-[#e64833]/50 hover:shadow-2xl hover:shadow-[#e64833]/10 hover:-translate-y-1 sm:px-5 sm:py-6"
    >
      <div aria-hidden className="pointer-events-none absolute -top-6 -right-6 h-16 w-16 rounded-full bg-[#90aead]/20 blur-xl transition-all group-hover:bg-[#e64833]/20" />
      <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl border border-[#90aead]/30 bg-[#fbf6ee] text-[#e64833] transition-all group-hover:bg-[#e64833] group-hover:text-[#fbe9d0]">
        <Icon className="h-5 w-5" strokeWidth={2} />
      </span>
      <p className="mt-2.5 font-display text-2xl font-black tracking-tight tabular-nums text-[#14242a] sm:text-3xl">
        {count.toLocaleString("en-IN")}
        {value >= 100 ? "+" : ""}
      </p>
      <p className="mt-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-[#244855]/70 sm:text-xs">{label}</p>
    </div>
  );
}

function GalleryCard({
  item,
  index,
  onOpen,
}: {
  item: GalleryItem;
  index: number;
  onOpen: (item: GalleryItem) => void;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(item)}
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-6%" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduce ? undefined : { y: -6 }}
      className="group relative w-full overflow-hidden rounded-3xl border border-[#90aead]/20 bg-[#172c34] text-left shadow-2xl transition-all duration-300 hover:border-[#e64833] hover:shadow-[0_12px_40px_rgba(230,72,51,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e64833]"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#14242a] sm:aspect-[3/4]">
        <Image
          alt={item.title}
          src={item.image}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"
        />

        {/* Category Pill */}
        <span className="absolute top-3.5 left-3.5 rounded-full border border-white/20 bg-black/60 backdrop-blur-md px-3 py-1 text-[0.62rem] font-black uppercase tracking-wider text-[#fbe9d0] shadow-md">
          {item.category}
        </span>

        {/* Card Details Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <h3 className="font-display font-black text-sm sm:text-base uppercase tracking-tight text-white line-clamp-2 drop-shadow-sm group-hover:text-[#fbe9d0] transition-colors">
            {item.title}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <span className="truncate">{item.event}</span>
            <span className="text-white/40">·</span>
            <span className="shrink-0 text-[#90aead]">{item.location}</span>
          </p>
        </div>
      </div>
    </motion.button>
  );
}

function Lightbox({ item, onClose }: { item: GalleryItem; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal
      aria-label={item.title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[#90aead]/25 bg-[#172c34] shadow-2xl"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 360, damping: 30 }}
      >
        <div className="relative aspect-[16/11] w-full shrink-0 bg-[#14242a] sm:aspect-[16/10]">
          <Image
            alt={item.title}
            src={item.image}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition hover:bg-black/80 shadow-lg cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto p-5 sm:p-7 text-white">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#e64833]/40 bg-[#e64833]/15 px-3 py-1 text-xs font-black uppercase tracking-wider text-[#fbe9d0]">
              {item.category}
            </span>
            {item.date && (
              <span className="text-xs text-[#90aead] font-medium">{item.date}</span>
            )}
          </div>
          <h2 className="mt-3 font-display font-black text-2xl uppercase tracking-tight text-white sm:text-3xl">
            {item.title}
          </h2>
          <p className="mt-2 text-sm text-[#90aead] font-medium">
            {item.event}
            <span className="mx-2 text-white/30">·</span>
            <span className="text-[#fbe9d0]">{item.location}</span>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SubmitPhotoModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [eventLabel, setEventLabel] = useState("");
  const [location, setLocation] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const f = e.target.files?.[0];
    if (!f) return;
    const check = validateImageFile(f);
    if (!check.valid) {
      setError(check.error ?? "Invalid file");
      return;
    }
    setFile(f);
    const dataUrl = await fileToDataUrl(f);
    setPreview(dataUrl);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmedName = name.trim();
    const trimmedTitle = title.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setError("Please enter your name (at least 2 characters).");
      return;
    }
    if (!trimmedTitle || trimmedTitle.length < 2) {
      setError("Please enter a title or caption for your photo.");
      return;
    }
    if (!file || !preview) {
      setError("Please select an image to upload.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(getApiUrl("/api/content/gallery/submit"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: preview,
          name: trimmedName,
          title: trimmedTitle,
          eventLabel: eventLabel.trim() || null,
          location: location.trim() || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error?.message ?? "Submission failed");
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }, [file, preview, name, title, eventLabel, location]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, submitting]);

  return (
    <motion.div
      role="dialog"
      aria-modal
      aria-label="Submit your photo"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={submitting ? undefined : onClose}
      />
      <motion.div
        className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-[#90aead]/25 bg-[#172c34] shadow-2xl"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 360, damping: 32 }}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h2 className="font-display font-black text-lg uppercase tracking-tight text-white">
            {done ? "Photo Submitted!" : "Submit Your Finisher Photo"}
          </h2>
          <button
            type="button"
            aria-label="Close"
            disabled={submitting}
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full text-[#90aead] hover:bg-white/10 hover:text-white transition disabled:opacity-40 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-4 px-6 py-12 text-center text-white">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#e64833]/40 bg-[#e64833]/15 text-[#e64833]">
              <Trophy className="h-8 w-8" strokeWidth={2} />
            </div>
            <p className="font-display font-black text-2xl uppercase tracking-tight text-[#fbe9d0]">Thank You Runner!</p>
            <p className="max-w-xs text-sm text-[#90aead] font-medium">
              Your photo has been submitted and is pending verification. It will appear on the public wall shortly.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="neon-btn-blue mt-4 rounded-full px-8 py-3 text-xs font-black uppercase tracking-wider text-[#fbe9d0] shadow-lg cursor-pointer"
            >
              Back to Gallery
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 overflow-y-auto px-6 py-6 text-white">
            {error ? (
              <p className="rounded-xl bg-rose-500/20 border border-rose-500/40 px-4 py-2.5 text-xs font-semibold text-rose-300">
                {error}
              </p>
            ) : null}

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#90aead]">
                Your name <span className="text-[#e64833]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Arjun Singh"
                className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder-slate-400 outline-none transition focus:border-[#e64833] focus:ring-2 focus:ring-[#e64833]/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#90aead]">
                Title / caption <span className="text-[#e64833]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Conquered the 10K in Bangalore"
                className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder-slate-400 outline-none transition focus:border-[#e64833] focus:ring-2 focus:ring-[#e64833]/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#90aead]">
                  Event name
                </label>
                <input
                  type="text"
                  value={eventLabel}
                  onChange={(e) => setEventLabel(e.target.value)}
                  placeholder="e.g. Pune Half Marathon"
                  className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder-slate-400 outline-none transition focus:border-[#e64833] focus:ring-2 focus:ring-[#e64833]/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#90aead]">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder-slate-400 outline-none transition focus:border-[#e64833] focus:ring-2 focus:ring-[#e64833]/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#90aead]">
                Photo <span className="text-[#e64833]">*</span>
              </label>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className={`flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition cursor-pointer ${
                  preview
                    ? "border-[#e64833]/50 bg-[#e64833]/10"
                    : "border-white/15 bg-white/[0.03] hover:border-[#90aead]/40"
                }`}
              >
                {preview ? (
                  <div className="relative aspect-[4/3] w-full max-w-xs overflow-hidden rounded-xl">
                    <Image
                      alt="Preview"
                      src={preview}
                      fill
                      className="object-cover"
                      sizes="320px"
                    />
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-[#e64833]" strokeWidth={1.5} />
                    <p className="text-sm font-bold text-white">Tap to select a photo</p>
                    <p className="text-xs text-[#90aead]">JPEG · PNG · WebP · max 5 MB</p>
                  </>
                )}
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                className="hidden"
                onChange={handleFile}
              />
              {preview ? (
                <button
                  type="button"
                  onClick={() => { setFile(null); setPreview(null); setError(""); }}
                  className="mt-2 text-xs text-[#e64833] hover:underline cursor-pointer"
                >
                  Remove and choose another
                </button>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="neon-btn-blue mt-3 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-xs font-black uppercase tracking-wider text-[#fbe9d0] shadow-xl cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Submit for verification"
              )}
            </button>

            <p className="text-center text-[0.7rem] text-[#90aead]">
              Photos are reviewed for community guidelines before being published.
            </p>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

function ensureSvgPath(src: string): string {
  if (!src) return "/images/trail-summit.svg";
  if (src.includes("sunrise-finish")) return "/images/sunrise-finish.svg";
  if (src.includes("club-push")) return "/images/club-push.svg";
  if (src.includes("first-medal")) return "/images/first-medal.svg";
  if (src.includes("weekend-long-run")) return "/images/weekend-long-run.svg";
  if (src.includes("mountain-run-hero")) return "/images/mountain-run-hero.svg";
  if (src.endsWith(".png")) return src.replace(/\.png$/, ".svg");
  return src;
}

export function GalleryClient() {
  const reduce = useReducedMotion();
  const [category, setCategory] = useState<GalleryCategory>("All");
  const [active, setActive] = useState<GalleryItem | null>(null);
  const [items, setItems] = useState<GalleryItem[]>(staticGalleryItems);
  const [showSubmit, setShowSubmit] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchGalleryContent().then((rows) => {
      if (cancelled || !rows || rows.length === 0) return;
      setItems(
        rows.map((row) => ({
          id: row.id,
          title: row.title,
          event: row.event,
          location: row.location,
          date: row.date,
          category: (row.category as GalleryItem["category"]) || "Community",
          image: ensureSvgPath(row.image),
        })),
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (category === "All") return items;
    return items.filter((item) => item.category === category);
  }, [category, items]);

  return (
    <div className="min-w-0">

      {/* ── SECTION 1: HERO & METRICS (WARM IVORY #fbf6ee) ─────────────── */}
      <section className="relative overflow-hidden border-b border-[#90aead]/20 pt-24 pb-14 sm:pt-28 sm:pb-16 isolate text-[#14242a] bg-[#fbf6ee]">
        <div aria-hidden className="pointer-events-none absolute top-1/3 left-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-[#90aead]/20 blur-[140px]" />
        <div aria-hidden className="pointer-events-none absolute bottom-0 right-10 -z-10 h-[250px] w-[250px] rounded-full bg-[#e64833]/10 blur-[100px]" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e64833]/30 bg-[#e64833]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#e64833] mb-4 shadow-sm">
              COMMUNITY FINISHER SHOWCASE
            </span>
            <h1 className="font-display font-black text-4xl sm:text-6xl uppercase tracking-tight text-[#14242a]">
              MILES WORTH{" "}
              <span className="text-[#e64833]">
                REMEMBERING
              </span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-[#244855] max-w-xl mx-auto font-medium leading-relaxed">
              Race finishes, metal medal unboxings, community morning runs & milestones. Every photo tells a true finisher story.
            </p>
          </motion.div>

          {/* 4 Stats Cards */}
          <motion.div
            className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-3 sm:mt-10 sm:gap-4 md:grid-cols-4"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            {galleryStats.map((stat, i) => (
              <StatCard key={stat.label} label={stat.label} value={stat.value} icon={statIcons[i]} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 2: PHOTO SHOWCASE & FILTERS (DARK #14242a) ──────── */}
      <section className="relative py-16 sm:py-20 bg-[#14242a] text-[#fcf8f2] border-b border-white/10 overflow-hidden isolate">
        <div aria-hidden className="pointer-events-none absolute top-1/2 left-10 -z-10 h-[350px] w-[350px] -translate-y-1/2 rounded-full bg-[#244855]/40 blur-[130px]" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header & Filter Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#90aead]/30 bg-[#90aead]/15 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#90aead]">
                PHOTO ARCHIVE
              </span>
              <h2 className="mt-3 font-display font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-white">
                COMMUNITY <span className="text-[#e64833]">MOMENTS</span>
              </h2>
            </div>

            {/* Filter Pills */}
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 sm:flex-wrap">
              {galleryCategories.map((cat) => {
                const on = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      on
                        ? "bg-[#e64833] text-[#fbe9d0] shadow-lg shadow-[#e64833]/30 border border-[#e64833]"
                        : "border border-[#90aead]/30 bg-[#172c34] text-[#90aead] hover:border-[#90aead]/60 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photo Grid */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:mt-10 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((item, index) => (
              <GalleryCard
                key={item.id}
                item={item}
                index={index}
                onOpen={setActive}
              />
            ))}
          </div>

          {filtered.length === 0 ? (
            <motion.div
              className="mt-16 flex flex-col items-center gap-3 text-center py-12 rounded-3xl border border-[#90aead]/20 bg-[#172c34] shadow-2xl"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Camera className="h-10 w-10 text-[#90aead]" strokeWidth={1.5} />
              <p className="text-sm font-bold text-slate-300">No moments found in this category yet.</p>
            </motion.div>
          ) : null}
        </div>
      </section>

      {/* ── SECTION 3: SUBMIT MOMENT BANNER (WARM IVORY #fbf6ee) ──────── */}
      <section className="relative py-16 sm:py-20 bg-[#fbf6ee] text-[#14242a] overflow-hidden isolate border-b border-[#90aead]/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-[#90aead]/30 bg-white p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center md:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e64833]/30 bg-[#e64833]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#e64833]">
                <Award className="h-3.5 w-3.5" />
                GET FEATURED
              </span>
              <h2 className="mt-4 font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-[#14242a]">
                EARNED YOUR MEDAL? <span className="text-[#e64833]">SHARE YOUR VICTORY!</span>
              </h2>
              <p className="mt-3 text-sm text-[#244855] font-medium leading-relaxed">
                Upload your medal selfie, GPS race stats or finish line smile to inspire thousands of runners across India.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowSubmit(true)}
              className="neon-btn-blue shrink-0 inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-xs font-black uppercase tracking-wider text-[#fbe9d0] shadow-xl hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              <span>Submit Finisher Photo</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Floating Submit Button for Quick Mobile Access */}
      <motion.button
        type="button"
        onClick={() => setShowSubmit(true)}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-[#90aead]/30 bg-[#14242a]/90 px-4 py-3 text-xs font-black uppercase tracking-wider text-[#fbe9d0] shadow-2xl backdrop-blur-md hover:border-[#e64833] cursor-pointer sm:hidden"
      >
        <Upload className="h-4 w-4 text-[#e64833]" />
        <span>Submit Photo</span>
      </motion.button>

      <AnimatePresence>
        {active ? <Lightbox item={active} onClose={() => setActive(null)} /> : null}
        {showSubmit ? <SubmitPhotoModal onClose={() => setShowSubmit(false)} /> : null}
      </AnimatePresence>
    </div>
  );
}
