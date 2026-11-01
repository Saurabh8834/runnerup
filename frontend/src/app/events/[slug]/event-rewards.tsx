"use client";

import Link from "next/link";
import { FileBadge, Medal, Shirt, Sparkles, Ticket, Trophy, Truck, ArrowRight } from "lucide-react";
import type { PublicEvent } from "../../data/events";
import { Reveal, SectionHeader } from "./reveal";

const items = [
  {
    icon: Medal,
    title: "Finisher Medal",
    desc: "Authentic heavyweight die-cast metal medal with custom ribbon.",
  },
  {
    icon: Ticket,
    title: "Digital Race Bib",
    desc: "Personalized official digital bib with your name and runner number.",
  },
  {
    icon: Shirt,
    title: "Top 3 Podium T-Shirt",
    desc: "Exclusive athletic DRI-FIT performance t-shirt for top 3 finishers.",
  },
  {
    icon: FileBadge,
    title: "Verifiable E-Certificate",
    desc: "Official QR-verified certificate with your distance and finish time.",
  },
  {
    icon: Trophy,
    title: "Hall of Fame Ranking",
    desc: "Nationwide leaderboard ranking with verified pace stats.",
  },
  {
    icon: Truck,
    title: "Free Doorstep Delivery",
    desc: "100% free tracked courier delivery across all pincodes in India.",
  },
];

export function EventRewards({ event }: { event?: PublicEvent }) {
  const isAirForce =
    event?.slug?.includes("air-force") ||
    event?.name?.toLowerCase().includes("air force");

  const dynamicItems = [
    {
      icon: Medal,
      title: "Finisher Medal",
      desc: isAirForce
        ? "100% Solid Metal Finisher Medal delivered right to your doorstep."
        : "Authentic heavyweight die-cast metal medal with custom ribbon.",
    },
    ...items.slice(1),
  ];

  return (
    <section id="rewards" className="scroll-mt-20 border-b border-white/10 py-8 sm:py-12 bg-black/40">
      <div className="container-page max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow="What you receive"
          title={
            <>
              A finish you&rsquo;ll be{" "}
              <span className="text-gold">proud to own</span>
            </>
          }
          lead="Every verified finisher receives a complete official kit — delivered free across India."
        />

        {/* 2 in a single row grid — compact, concise, zero extra scrolling */}
        <div className="mt-8 sm:mt-10 grid grid-cols-2 gap-2 sm:gap-3.5">
          {dynamicItems.map(({ icon: Icon, title, desc }, i) => (
            <Reveal key={title} delay={i * 0.05}>
              <article className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-[#12161a] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400/40 hover:shadow-lg">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-400 shadow-sm">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold tracking-tight text-white">
                    {title}
                  </h3>
                  <p className="mt-0.5 text-xs text-zinc-400 leading-snug line-clamp-2">
                    {desc}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Value Callout Footer Banner */}
        <Reveal delay={0.3}>
          <div className="mt-6 sm:mt-8 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-[#14242a] to-emerald-500/10 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-black text-white">Official Finisher Kit Worth ₹900+ Included</p>
                <p className="text-xs text-zinc-400">Zero extra courier charges · 100% guaranteed delivery to your door</p>
              </div>
            </div>
            <Link
              href={event?.slug ? `/register?event=${encodeURIComponent(event.slug)}` : "/register"}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-[#e64833] via-[#ff5e3a] to-[#d63b25] text-white text-xs font-black uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-md shrink-0 inline-flex items-center justify-center gap-1.5"
            >
              <span>Claim Your Kit</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
