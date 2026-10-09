"use client";

import Link from "next/link";
import { ArrowRight, IndianRupee, Sparkles } from "lucide-react";

function formatPrice(price: string) {
  return price.replace(/^Rs\.\s*/, "₹");
}

export function EventStickyCta({
  price,
  compareAtPrice,
  slug,
}: {
  price: string;
  compareAtPrice?: string;
  slug: string;
}) {
  const amount = price.toLowerCase().includes("free") ? "Free" : formatPrice(price);
  const mrp = compareAtPrice ? formatPrice(compareAtPrice) : undefined;

  return (
    <>
      {/* Spacer so page bottom content isn't covered */}
      <div className="h-24 md:hidden" aria-hidden="true" />

      {/* 100% Solid, Opaque & High-End Sticky Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-[#14242a] border-t border-[#90aead]/25 shadow-[0_-16px_40px_rgba(20,36,42,0.9)] md:hidden">
        {/* Shimmer Accent Line */}
        <div className="h-0.5 w-full bg-linear-to-r from-transparent via-[#e64833] to-transparent" />

        <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {/* Price & Value Proposition */}
          <div className="min-w-0 flex flex-col justify-center">
            <div className="flex items-baseline gap-1.5">
              <span className="flex items-center text-xl sm:text-2xl font-black tracking-tight text-[#fcf8f2] font-mono">
                <IndianRupee className="h-4 w-4 mr-0.5 text-[#e64833]" />
                {amount}
              </span>
              {mrp ? (
                <span className="text-xs font-semibold text-[#90aead] line-through">
                  {mrp}
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 inline-flex items-center gap-1 truncate text-[0.6rem] font-bold uppercase tracking-wider text-[#fbe9d0]">
              <Sparkles className="h-2.5 w-2.5 shrink-0 text-[#e64833]" />
              Early Bird · Kit Included
            </p>
          </div>

          {/* Premium Glowing CTA Button */}
          <Link
            className="group relative flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#e64833] to-[#c73824] px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-black tracking-wide text-[#fbe9d0] shadow-lg shadow-[#e64833]/30 transition-all duration-200 hover:brightness-110 active:scale-95 shrink-0 select-none border border-[#fbe9d0]/20"
            href={`/register?event=${encodeURIComponent(slug)}`}
          >
            <span>⚡ Register Now</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </>
  );
}
