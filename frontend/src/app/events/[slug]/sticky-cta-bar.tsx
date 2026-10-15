"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Truck } from "lucide-react";
import { getEventMedalImage } from "../../data/events";

function formatPrice(price: string) {
  return price.replace(/^Rs\.\s*/, "₹");
}

export function EventStickyCta({
  price,
  compareAtPrice,
  slug,
  eventName = "Indian Air Force Day 2026",
}: {
  price: string;
  compareAtPrice?: string;
  slug: string;
  eventName?: string;
}) {
  const amount = price.toLowerCase().includes("free") ? "Free" : formatPrice(price);
  const registerHref = `/register?event=${encodeURIComponent(slug)}`;
  const medalImg = getEventMedalImage(slug);

  return (
    <>
      {/* Spacer so page content isn't obscured */}
      <div className="h-20 sm:h-24" aria-hidden="true" />

      {/* Sleek, Premium Fixed Mobile Bottom Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-[#060a0e]/95 border-t border-amber-500/25 shadow-[0_-12px_40px_rgba(0,0,0,0.92)] backdrop-blur-2xl pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          
          {/* Left: Medal Thumbnail + Title & Pricing */}
          <div className="min-w-0 flex items-center gap-2.5 sm:gap-3">
            {/* Medal Visual Mini-Avatar */}
            <div className="relative h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-xl bg-gradient-to-br from-amber-500/25 via-amber-950/40 to-slate-950 border border-amber-500/40 p-1 flex items-center justify-center shadow-md overflow-hidden">
              <div className="absolute inset-0 bg-amber-400/10 blur-sm pointer-events-none" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={medalImg}
                alt={eventName}
                className="relative z-10 h-full w-full object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
              />
            </div>

            <div className="min-w-0 flex flex-col justify-center">
              <p className="truncate font-display text-xs sm:text-sm font-extrabold text-white tracking-tight leading-tight">
                {eventName}
              </p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="font-display font-black text-sm sm:text-base text-amber-400">
                  {amount}
                </span>
                {compareAtPrice && (
                  <span className="text-[0.65rem] sm:text-xs text-zinc-500 line-through font-semibold">
                    {formatPrice(compareAtPrice)}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 text-[0.6rem] font-bold text-emerald-400">
                  <Truck className="h-2.5 w-2.5" />
                  Free Delivery
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Submit Proof shortcut (Desktop/tablet) */}
            <Link
              href="/dashboard"
              className="hidden md:inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 transition-all cursor-pointer"
            >
              Submit Proof
            </Link>

            {/* Primary High-Converting Register Button */}
            <Link
              href={registerHref}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#e64833] via-[#ff5e3a] to-[#d63b25] hover:brightness-110 text-white font-black text-xs sm:text-sm px-4 sm:px-6 py-2.5 sm:py-3 shadow-[0_0_24px_rgba(230,72,51,0.6)] active:scale-95 transition-all duration-200 cursor-pointer border border-amber-300/40"
            >
              <span>Claim Your Kit</span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[3]" />
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
