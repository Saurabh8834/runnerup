"use client";

import Link from "next/link";
import { ShieldCheck, Sparkles, ArrowRight, MessageCircle } from "lucide-react";
import type { PublicEvent } from "../../data/events";
import { EventCountdown } from "./countdown";
import { Reveal } from "./reveal";

const WHATSAPP_URL = "https://wa.me/918287831071";

export function EventCta({ event }: { event: PublicEvent }) {
  const whatsappUrl = `${WHATSAPP_URL}?text=${encodeURIComponent(
    `Hi! I have a question about ${event.name}. Can you help me?`,
  )}`;

  const cleanPrice = event.price.replace(/^Rs\.\s*/i, "").replace(/^₹/, "").trim() || "499";

  return (
    <section className="relative overflow-hidden pt-8 pb-2 sm:pt-12 sm:pb-4 border-t border-white/10 bg-gradient-to-b from-[#0a0f14] via-[#0d141d] to-[#080c10]">
      <div className="container-page max-w-4xl mx-auto px-4 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-[#121a22] to-[#0d141d] p-6 sm:p-10 text-center shadow-2xl">
            {/* Ambient Lighting */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-72 rounded-full bg-gradient-to-r from-[#e64833]/25 via-amber-500/20 to-transparent blur-3xl"
            />

            <div className="relative z-10 flex flex-col items-center">
              {/* VIP Eyebrow Badge */}
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-300 mb-4 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Limited Edition Finisher Medal</span>
              </div>

              {/* Main Headline */}
              <h2 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight text-white leading-tight">
                Ready to Earn Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-[#ff5e3a]">Official Finisher Medal</span>?
              </h2>

              <p className="mt-2 text-xs sm:text-sm text-zinc-300 max-w-lg leading-relaxed">
                Complete your distance anywhere across India on your own schedule. Handcrafted 3D metal medal, digital bib, and certificate shipped directly to your door.
              </p>

              {/* Countdown (Clean, single header) */}
              {event.endsAt ? (
                <div className="mt-6 flex flex-col items-center gap-2">
                  <span className="text-[0.68rem] font-bold uppercase tracking-widest text-zinc-400">
                    ⏳ Registration Closes In:
                  </span>
                  <EventCountdown targetDate={event.endsAt} />
                </div>
              ) : null}

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
                <Link
                  href={`/register?event=${encodeURIComponent(event.slug)}`}
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#e64833] via-[#ff5e3a] to-[#d63b25] text-white font-black text-sm px-7 py-3.5 shadow-lg shadow-[#e64833]/40 hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  <span>CLAIM MEDAL · ₹{cleanPrice}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-xs px-5 py-3.5 transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-400" />
                  <span>Ask a Question</span>
                </a>
              </div>

              {/* Trust Footer */}
              <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-zinc-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>100% Safe UPI / Card Checkout · Guaranteed Pan-India Courier Delivery</span>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
