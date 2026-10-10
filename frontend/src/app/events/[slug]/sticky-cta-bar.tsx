"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

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

  return (
    <>
      {/* Spacer so page content isn't obscured */}
      <div className="h-20" aria-hidden="true" />

      {/* Sleek, Premium Fixed Bottom Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-[#070a0c]/95 border-t border-white/10 shadow-[0_-12px_36px_rgba(0,0,0,0.85)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-3">
          
          {/* Left: Event Title & Pricing Breakdown */}
          <div className="min-w-0 flex flex-col justify-center">
            <p className="truncate font-display text-xs sm:text-sm font-extrabold text-white tracking-tight">
              {eventName}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-display font-black text-sm sm:text-base text-[#f59e0b]">
                {amount}
              </span>
              <span className="text-[0.65rem] sm:text-xs text-zinc-400 font-medium hidden sm:inline">
                · Medal, certificate and delivery included
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Submit Proof shortcut */}
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 transition-all cursor-pointer"
            >
              Submit Proof
            </Link>

            {/* Primary Register Button */}
            <Link
              href={registerHref}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#f59e0b] hover:bg-[#d97706] text-black font-extrabold text-xs sm:text-sm px-5 sm:px-6 py-2 sm:py-2.5 shadow-md shadow-amber-500/20 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <span>Register for {amount}</span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[3]" />
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
