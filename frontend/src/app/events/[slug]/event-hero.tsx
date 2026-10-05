"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarDays,
  FileBadge,
  Medal,
  Route,
  Shirt,
  Sparkles,
  Star,
  Trophy,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { PublicEvent } from "../../data/events";
import { Breadcrumb } from "../../components/breadcrumb";
import { RegisterCta } from "../../components/register-cta";
import { EventCountdown } from "./countdown";
import { Medal3D } from "./medal";

const rewardBadges = [
  { icon: Medal, label: "Finisher Medal" },
  { icon: Shirt, label: "Premium T-shirt" },
  { icon: FileBadge, label: "Official Certificate" },
  { icon: Truck, label: "Free Delivery" },
  { icon: Trophy, label: "Hall of Fame" },
];

export function EventHero({ event, isPast }: { event: PublicEvent; isPast: boolean }) {
  const [heroImg, setHeroImg] = useState(event.bannerImageUrl ?? "/images/mountain-run-hero.svg");

  useEffect(() => {
    setHeroImg(event.bannerImageUrl ?? "/images/mountain-run-hero.svg");
  }, [event.bannerImageUrl]);
  const distances = event.distance.split(" / ");
  const priceLabel =
    event.price.toLowerCase().includes("free")
      ? "Register now"
      : `Register now — ${event.price.replace(/^Rs\.\s*/, "₹")}`;

  return (
    <section className="event-classic-hero relative overflow-hidden border-b border-(--line)">
      <div className="hero-mesh-bg" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 90% 60% at 50% -10%, color-mix(in srgb, var(--gold) 9%, transparent) 0%, transparent 55%)",
            "radial-gradient(ellipse 60% 50% at 100% 20%, color-mix(in srgb, var(--sage) 8%, transparent) 0%, transparent 60%)",
          ].join(", "),
        }}
      />

      <div className="container-page pb-16 pt-24 sm:pt-28">

        {/* ─── Headline block ─── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 text-center sm:mt-12"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-(--gold-line) bg-(--gold-soft) px-3.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-(--gold-deep) shadow-sm sm:text-xs">
            <Sparkles className="h-3 w-3" />
            India&rsquo;s premium virtual run
          </p>

          <h1 className="event-classic-title mt-5 text-[2rem] font-black leading-[1.05] tracking-tight text-(--foreground) sm:text-5xl lg:text-6xl">
            <span className="block">{isPast ? "The" : "India's Premium"}</span>
            <span className="text-gradient-premium block">{event.name}</span>
          </h1>

          <p className="lede mx-auto mt-4 max-w-xl px-2 text-sm sm:mt-6 sm:text-lg">
            Run anywhere. Your pace. Your proof.
            <br className="hidden sm:block" /> Finish with pride — and a medal you&rsquo;ll never take off.
          </p>

          {/* Rating */}
          <div className="mt-5 flex items-center justify-center gap-1.5">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-(--gold) text-(--gold)" />
              ))}
            </div>
            <p className="text-xs font-semibold text-(--muted) sm:text-sm">
              Trusted by runners across India
            </p>
          </div>

          {/* CTAs */}
          <div className="mx-auto mt-6 flex max-w-md flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-center">
            <RegisterCta
              className="sm:min-w-56"
              signedInLabel="Register now"
              signedOutLabel={priceLabel}
              slug={event.slug}
            />
            <Link
              className="btn btn-secondary gap-2 text-sm"
              href="#rewards"
              scroll
            >
              See rewards
            </Link>
          </div>

          {!isPast && event.endsAt ? (
            <div className="mt-5 flex justify-center">
              <span className="glass-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-(--foreground)">
                <EventCountdown targetDate={event.endsAt} compact />
              </span>
            </div>
          ) : null}

          {/* Floating reward badges */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {rewardBadges.map(({ icon: Icon, label }, i) => (
              <motion.span
                key={label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.08, duration: 0.5 }}
                className="badge-float glass-pill inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.7rem] font-semibold text-(--foreground) shadow-sm"
                style={{ animationDelay: `${i * 0.55}s`, ["--tilt" as string]: `${i % 2 === 0 ? -3 : 3}deg` }}
              >
                <Icon className="h-3.5 w-3.5 text-(--gold-deep)" />
                {label}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* ─── Cinematic poster frame ─── */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-8 max-w-5xl sm:mt-14"
        >
          <div className="event-classic-poster relative overflow-hidden border border-(--line) bg-slate-950 shadow-premium">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImg}
              alt={`${event.name} — run toward the mountains`}
              className="w-full h-auto max-h-[520px] object-contain sm:object-cover aspect-[16/9] sm:aspect-[16/8] lg:aspect-[21/9]"
              onError={() => {
                if (heroImg && heroImg.endsWith(".webp")) {
                  setHeroImg(heroImg.replace(".webp", ".jpg"));
                } else if (heroImg !== "/images/mountain-run-hero.svg") {
                  setHeroImg("/images/mountain-run-hero.svg");
                }
              }}
            />

            {/* warm sunrise glow */}
            <div
              aria-hidden
              className="sun-pulse pointer-events-none absolute -top-16 right-8 h-40 w-40 rounded-full blur-3xl sm:h-64 sm:w-64"
              style={{
                background:
                  "radial-gradient(circle, rgba(230,72,51,0.5) 0%, rgba(135,79,65,0.2) 45%, transparent 70%)",
              }}
            />
            {/* soft vignette */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10"
            />

            {/* status badge */}
            <span className="glass-pill absolute left-2.5 top-2.5 sm:left-5 sm:top-5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6rem] sm:text-xs font-bold uppercase tracking-wider text-white shadow-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e64833] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#e64833]" />
              </span>
              {isPast ? "Event completed" : "Open for registration"}
            </span>

            {/* floating medal - hidden on small mobile to not block poster text */}
            <div className="hidden sm:block absolute -bottom-4 right-2 w-28 drop-shadow-2xl sm:-bottom-6 sm:right-8 sm:w-40 lg:w-48 pointer-events-none">
              <div className="medal-float">
                <Medal3D className="h-auto w-full" />
              </div>
            </div>

            {/* bottom meta */}
            <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-2 p-2.5 sm:gap-3 sm:p-5">
              <span className="glass-pill inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-bold text-white sm:text-xs">
                <CalendarDays className="h-3.5 w-3.5" />
                {event.date}
              </span>
              <span className="glass-pill inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-bold text-white sm:text-xs">
                <Route className="h-3.5 w-3.5" />
                {distances.slice(0, 3).join(" · ")}
                {distances.length > 3 ? " +" : ""}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
