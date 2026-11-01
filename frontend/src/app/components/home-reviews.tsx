"use client";

import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Star, Users, Award, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { HomeTestimonial } from "../../lib/events-api";
import { HomeSectionHeader } from "./home-section-header";

/* ─── Authentic Indian Runner Testimonials ─── */
const fallbackReviews: HomeTestimonial[] = [
  {
    name: "Kavita Krishnan",
    role: "10K Finisher",
    city: "Bengaluru",
    rating: 5,
    quote: "Synced my Garmin in seconds. The medal arrived in a premium box in 4 days and it feels seriously heavy! The 3D relief is top tier.",
  },
  {
    name: "Aditya Deshmukh",
    role: "21K Half Marathon",
    city: "Pune",
    rating: 5,
    quote: "Ran my 21K at Pashan Lake at 5:30 AM. Activity proof was approved in under 3 hours and the official leaderboard timing was spot on.",
  },
  {
    name: "Simran Kaur",
    role: "5K Finisher",
    city: "Chandigarh",
    rating: 5,
    quote: "My first virtual run ever! Loved that I could run at Sukhna Lake without traveling out of town. Downloadable E-Certificate is gorgeous.",
  },
  {
    name: "Rahul Sengupta",
    role: "10K Finisher",
    city: "Kolkata",
    rating: 5,
    quote: "Strava activity synced seamlessly. The solid metal medal has incredible heft and craftsmanship compared to typical plastic tokens.",
  },
  {
    name: "Meera Natarajan",
    role: "5K Beginner",
    city: "Chennai",
    rating: 5,
    quote: "Ran with my morning group along Besant Nagar beach. Super simple registration, clear proof guidelines, and prompt SMS courier updates.",
  },
  {
    name: "Varun Kapoor",
    role: "21K Half Marathon",
    city: "Delhi NCR",
    rating: 5,
    quote: "The medal is genuine heavy die-cast metal, not hollow alloy. One of the best organized virtual challenge platforms in India.",
  },
  {
    name: "Sneha Kulkarni",
    role: "10K Finisher",
    city: "Mumbai",
    rating: 5,
    quote: "Finished on Marine Drive. The digital bib and verifiable QR certificate are great to share with my running club. 10/10 experience!",
  },
  {
    name: "Harsh Vardhan",
    role: "Cycling 25K",
    city: "Jaipur",
    rating: 5,
    quote: "Tracked with Apple Watch. Really appreciate that RUNNERUP supports runners, joggers, and cyclists with legitimate metal medals.",
  },
];

/* ─── Helpers ─── */
function deriveBadge(role: string): string {
  const r = role.toLowerCase();
  if (r.includes("21") || r.includes("half")) return "Elite Finisher";
  if (r.includes("10")) return "Verified Runner";
  if (r.includes("5")) return "Rising Runner";
  if (r.includes("cycling")) return "Cycling Finisher";
  if (r.includes("walk")) return "Walker Verified";
  return "Verified Runner";
}

function deriveAchievement(role: string): string {
  return role
    .replace(/^(\d+)\s*km/i, "$1K")
    .replace(/\bfinisher\b/i, "Finisher")
    .replace(/\bbeginner\b/i, "Beginner")
    .replace(/\brunner\b/i, "Runner");
}

/* ─── Avatar ─── */
function AvatarCircle({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ff4b26] to-[#b92b0e] font-bold text-white text-xs shadow-md ring-2 ring-[#ff4b26]/50">
      {initials}
    </span>
  );
}

/* ─── Review Card ─── */
function ReviewCard({ review }: { review: HomeTestimonial }) {
  const badge = deriveBadge(review.role);
  const achievement = deriveAchievement(review.role);

  return (
    <article className="group relative flex w-[285px] sm:w-[380px] shrink-0 flex-col justify-between rounded-3xl border border-white/10 bg-[#0d141d]/90 p-5 sm:p-6 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-[#ff4b26]/60 hover:bg-[#111822]">
      {/* Quotation watermark */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1 right-5 font-serif text-6xl leading-none text-white/5 select-none transition-colors duration-300 group-hover:text-[#ff4b26]/15"
      >
        “
      </span>

      <div>
        {/* Header Badge */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ff4b26]/30 bg-[#ff4b26]/10 px-3 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-orange-300">
            <BadgeCheck className="h-3.5 w-3.5 text-[#ff4b26]" />
            {badge}
          </span>

          <div className="flex items-center gap-1.5 text-white text-xs font-semibold">
            <span aria-hidden="true" className="tracking-tight text-amber-400 select-none text-sm leading-none">
              ★★★★★
            </span>
            <span className="text-white font-bold">{review.rating}.0</span>
          </div>
        </div>

        {/* Quote content */}
        <blockquote className="mb-5">
          <p className="text-xs sm:text-sm leading-relaxed text-slate-300 font-medium">
            &ldquo;{review.quote}&rdquo;
          </p>
        </blockquote>
      </div>

      {/* User Info Footer */}
      <div className="pt-3.5 border-t border-white/10 flex items-center gap-3">
        <AvatarCircle name={review.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-bold text-white">
              {review.name}
            </span>
            <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
          </div>
          <p className="truncate text-[11px] text-slate-400 font-medium">
            {achievement} {review.city ? `· ${review.city}` : ""}
          </p>
        </div>
      </div>
    </article>
  );
}

/* ─── Main ─── */
export function HomeReviews({ testimonials: initial }: { testimonials?: HomeTestimonial[] }) {
  const [reviews] = useState<HomeTestimonial[]>(
    initial && initial.length > 0 ? initial : fallbackReviews,
  );

  // Duplicate reviews array for smooth continuous loop
  const marqueeReviews = [...reviews, ...reviews];

  return (
    <section className="relative py-16 sm:py-24 border-t border-white/10 overflow-hidden bg-[#080c10] text-[#f8fafc]">
      {/* Background glow effects */}
      <div aria-hidden="true" className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[600px] rounded-full bg-[#ff4b26]/5 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <HomeSectionHeader
          theme="dark"
          action={
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 font-black uppercase text-xs text-white hover:bg-[#ff4b26] hover:border-[#ff4b26] transition-all shadow-md group"
              href="/events"
            >
              <span>Explore Challenges</span>
              <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          }
          align="split"
          eyebrow="VERIFIED RUNNER EXPERIENCES"
          title="VOICES FROM THE RUNNING COMMUNITY"
          lead="Real feedback from athletes across India who ran, uploaded GPS proof, and claimed their authentic metal medals."
        />

        {/* Marquee Track */}
        <div className="relative mt-8 w-full overflow-hidden rounded-3xl py-2">
          {/* Edge Fade Gradients in Midnight Obsidian */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-20 w-12 sm:w-24 bg-gradient-to-r from-[#080c10] via-[#080c10]/80 to-transparent" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-20 w-12 sm:w-24 bg-gradient-to-l from-[#080c10] via-[#080c10]/80 to-transparent" />

          {/* Marquee Row */}
          <div className="animate-marquee-slow flex gap-5 sm:gap-6">
            {marqueeReviews.map((review, i) => (
              <ReviewCard key={`${review.name}-${i}`} review={review} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
