"use client";

import { useState } from "react";
import Link from "next/link";
import { Bike, FileBadge, Footprints, IndianRupee, Medal, Route, Shirt, Sparkles, Ticket, Timer, Trophy, Truck } from "lucide-react";
import type { PublicEvent } from "../../data/events";
import { RegisterCta } from "../../components/register-cta";
import { openLiveChat } from "../../components/tawk-chat";
import { EventCountdown } from "./countdown";
import { SectionHeader } from "./reveal";

const WHATSAPP_URL = "https://wa.me/918287831071";

type Activity = { key: string; label: string; icon: typeof Footprints; active: string };

const activities: Activity[] = [
  { key: "run", label: "Run", icon: Footprints, active: "border-[#e64833] bg-[#e64833] text-[#fbe9d0] shadow-[0_10px_24px_-10px_rgba(230,72,51,0.6)]" },
  { key: "walk", label: "Walk", icon: Route, active: "border-[#244855] bg-[#244855] text-[#fbe9d0] shadow-[0_10px_24px_-10px_rgba(36,72,85,0.6)]" },
  { key: "cycle", label: "Cycle", icon: Bike, active: "border-[#874f41] bg-[#874f41] text-[#fbe9d0] shadow-[0_10px_24px_-10px_rgba(135,79,65,0.6)]" },
];

function distanceNum(d: string) {
  const m = d.match(/(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : null;
}

function tier(km: number, activity: string) {
  if (activity === "walk" && km >= 5) return { label: "Power walk", chip: "border-[#90aead]/30 bg-[#244855]/20 text-[#fbe9d0]", bar: "bg-[#90aead]" };
  if (activity === "cycle") return { label: "Ride", chip: "border-[#874f41]/40 bg-[#874f41]/20 text-[#fbe9d0]", bar: "bg-[#874f41]" };
  if (km <= 3.2) return { label: "Easy starter", chip: "border-[#90aead]/30 bg-[#244855]/20 text-[#90aead]", bar: "bg-[#90aead]" };
  if (km === 5) return { label: "Classic 5K", chip: "border-[#e64833]/50 bg-[#e64833]/15 text-[#e64833]", bar: "bg-[#e64833]" };
  if (km === 10) return { label: "10K challenge", chip: "border-[#874f41]/40 bg-[#874f41]/20 text-[#fbe9d0]", bar: "bg-[#874f41]" };
  if (km >= 21) return { label: "Half marathon", chip: "border-[#e64833]/60 bg-[#e64833]/25 text-[#fbe9d0]", bar: "bg-[#e64833]" };
  return { label: "Challenge", chip: "border-[#90aead]/30 bg-[#172c34] text-[#90aead]", bar: "bg-[#244855]" };
}

function formatPrice(price: string) {
  return price.replace(/^Rs\.\s*/, "₹");
}

const activityKeyMap: Record<string, string> = {
  run: "running",
  walk: "walking",
  cycle: "cycling",
};

export function EventSelect({ event }: { event: PublicEvent }) {
  const [activity, setActivity] = useState(activities[0].key);
  const distances = event.distance.split(" / ");
  const whatsappUrl = `${WHATSAPP_URL}?text=${encodeURIComponent(`Hi! I'm interested in ${event.name}. Can you help me with registration?`)}`;
  const amount = event.price.toLowerCase().includes("free") ? "Free" : formatPrice(event.price);
  const mrp = event.compareAtPrice ? formatPrice(event.compareAtPrice) : null;

  return (
    <section
      className="relative overflow-hidden border-b border-(--line)"
      style={{
        background:
          "radial-gradient(ellipse 70% 50% at 50% 0%, color-mix(in srgb, var(--gold) 8%, transparent) 0%, transparent 60%), var(--background)",
      }}
    >
      <div className="container-page py-14 sm:py-20">
        <SectionHeader
          eyebrow="Choose & run"
          title={
            <>
              Pick your challenge,{" "}
              <span className="text-gold">find your pace</span>
            </>
          }
          lead="Choose a distance that suits your rhythm — tap it to register. Every entry includes the full reward kit."
        />

        <div className="mt-10 grid items-start gap-6 sm:mt-14 lg:grid-cols-[1.1fr_360px] lg:gap-8">
          {/* Purchase / Payment card - appears after distance selection on mobile, sticky on desktop */}
          <div className="order-2 lg:order-2 lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-3xl border border-(--gold-line) bg-(--panel) shadow-premium">
              <div className="h-1.5 w-full bg-gradient-to-r from-(--gold) via-(--sage) to-(--gold)" />

              <div className="p-5 sm:p-6">
                {/* Price */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[0.65rem] font-black uppercase tracking-widest text-(--muted-soft)">
                      Entry fee
                    </p>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-3xl font-black tracking-tight text-(--foreground) sm:text-4xl">
                        {amount}
                      </span>
                      {mrp ? (
                        <span className="text-sm font-medium text-(--muted-soft) line-through">
                          {mrp}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-(--gold-soft) px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-(--gold-deep)">
                      <Sparkles className="h-3 w-3" />
                      Early bird price · kit included
                    </p>
                  </div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e64833] to-[#874f41] text-[#fbe9d0] shadow-md shadow-[#e64833]/25">
                    <IndianRupee className="h-5 w-5" />
                  </span>
                </div>

                {/* Countdown */}
                {event.endsAt ? (
                  <div className="mt-5 rounded-2xl border border-(--line) bg-(--panel-soft) p-4">
                    <p className="inline-flex items-center gap-1.5 text-[0.6rem] font-black uppercase tracking-widest text-(--muted)">
                      <Timer className="h-3.5 w-3.5 text-(--gold-deep)" />
                      Registration open for
                    </p>
                    <div className="mt-3 flex justify-center">
                      <EventCountdown targetDate={event.endsAt} />
                    </div>
                  </div>
                ) : null}

                {/* What's included */}
                <div className="mt-5 rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-[#14242a]/95 to-[#122329]/95 p-4 sm:p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-3.5">
                    <p className="text-xs font-black uppercase tracking-widest text-[#f59e0b]">
                      Every Entry Includes
                    </p>
                    <span className="text-[0.62rem] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/35 text-amber-300 tracking-wider">
                      Official Kit
                    </span>
                  </div>

                  <ul className="space-y-2.5 text-xs font-semibold text-[#fcf8f2]">
                    <li className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        <Medal className="h-3.5 w-3.5" />
                      </span>
                      <span>100% Solid Heavy Metal Finisher Medal</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                        <Ticket className="h-3.5 w-3.5" />
                      </span>
                      <span>Official Digital Race Bib with Unique Number</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <FileBadge className="h-3.5 w-3.5" />
                      </span>
                      <span>Official Verifiable E-Certificate with QR Code</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                        <Trophy className="h-3.5 w-3.5" />
                      </span>
                      <span>GPS-Verified Public Leaderboard Ranking</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30">
                        <Truck className="h-3.5 w-3.5" />
                      </span>
                      <span>Free Doorstep Delivery Across India (All Pincodes)</span>
                    </li>
                  </ul>

                  {/* Special Podium Trophy Award (Top 3 T-Shirt) */}
                  <div className="mt-4 pt-3.5 border-t border-white/10 flex items-start gap-2.5 rounded-xl bg-black/35 border border-amber-500/25 p-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300">
                      <Shirt className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex flex-col">
                      <span className="text-[0.68rem] font-bold text-amber-300 uppercase tracking-wide">
                        🏆 Top 3 Podium Award
                      </span>
                      <p className="text-[0.72rem] text-[#fbe9d0] leading-tight mt-0.5">
                        Exclusive athletic DRI-FIT performance T-shirt awarded to the top 3 leaderboard finishers.
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-5 space-y-2.5">
                  <RegisterCta
                    className="btn-full btn-lg"
                    signedInLabel="Register now"
                    signedOutLabel={`Register now - ${amount}`}
                    slug={event.slug}
                    activity={activityKeyMap[activity] || "running"}
                  />
                  <button
                    type="button"
                    onClick={() => openLiveChat()}
                    className="btn btn-secondary btn-full gap-2 text-sm"
                  >
                    Have questions? Chat Live with Us
                  </button>
                </div>

                <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[0.7rem] font-medium text-(--muted-soft)">
                  <Sparkles className="h-3 w-3 text-(--gold-deep)" />
                  Secure UPI payment · Instant confirmation · Refund-safe
                </p>
              </div>
            </div>
          </div>

          {/* Distance picker - appears FIRST on mobile */}
          <div className="order-1 lg:order-1">
            <div className="rounded-3xl border border-(--line) bg-(--panel) p-5 shadow-premium sm:p-7">
              <div className="flex items-center justify-between">
                <p className="text-[0.65rem] font-black uppercase tracking-widest text-(--muted-soft)">
                  Select Distance / Category
                </p>
                <span className="text-[0.62rem] text-amber-400 font-bold uppercase">
                  Tap to Choose
                </span>
              </div>

              {/* Activity segmented */}
              <div className="mt-3 grid grid-cols-3 gap-2 rounded-2xl bg-(--panel-soft) p-1.5">
                {activities.map(({ key, label, icon: Icon, active }) => {
                  const isOn = activity === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActivity(key)}
                      aria-pressed={isOn}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs sm:text-sm font-black capitalize transition-all duration-200 cursor-pointer ${
                        isOn
                          ? active
                          : "border-transparent bg-transparent text-(--muted) hover:text-(--foreground)"
                      }`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2} />
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Distance chips */}
              <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {distances.map((distance) => {
                  const km = distanceNum(distance);
                  const t = tier(km ?? 5, activity);
                  const isPopular = distance.includes("5");
                  return (
                    <Link
                      key={distance}
                      href={`/register?event=${encodeURIComponent(event.slug)}&distance=${encodeURIComponent(distance)}&activity=${encodeURIComponent(activityKeyMap[activity] || "running")}`}
                      className={`group relative flex flex-col justify-between rounded-2xl border bg-(--panel) p-3.5 sm:p-4 transition-all duration-200 hover:-translate-y-1 hover:border-amber-400/50 hover:shadow-lg active:scale-95 ${t.chip}`}
                    >
                      {isPopular && (
                        <span className="absolute -top-2 right-2 rounded-full bg-amber-500 text-black text-[0.55rem] font-black uppercase px-2 py-0.2 shadow-sm">
                          🔥 Popular
                        </span>
                      )}
                      <div>
                        <span className="text-xl sm:text-2xl font-black tracking-tight text-(--foreground) block">
                          {distance}
                        </span>
                        <span className="mt-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-amber-400/90 block">
                          {t.label}
                        </span>
                      </div>
                      <span className="mt-3 inline-flex items-center gap-1 text-[0.68rem] font-bold text-amber-300 group-hover:translate-x-0.5 transition-transform">
                        Select →
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}