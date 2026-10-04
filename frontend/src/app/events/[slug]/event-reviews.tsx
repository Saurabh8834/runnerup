"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Reveal, SectionHeader } from "./reveal";

const reviews = [
  {
    name: "Aarav Sharma",
    meta: "10 km finisher · Pune",
    quote:
      "Registration was simple and the proof upload was crystal clear. Getting my certificate the same week felt amazing.",
  },
  {
    name: "Nisha Verma",
    meta: "5 km beginner · Mumbai",
    quote:
      "I ran in my own city but still felt part of a real event. The medal made it genuinely memorable.",
  },
  {
    name: "Rohan Mehta",
    meta: "21 km finisher · Delhi",
    quote:
      "The leaderboard gave my long run a real target. Clean experience from payment all the way to verification.",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function EventReviews() {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollByCard = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const width = card ? card.offsetWidth + 16 : 300;
    el.scrollBy({ left: dir * width, behavior: "smooth" });
  };

  return (
    <section className="section border-b border-(--line)">
      <div className="container-page">
        <div className="flex items-end justify-between gap-4">
          <SectionHeader
            align="left"
            eyebrow="Runner reviews"
            title={
              <>
                Loved by runners{" "}
                <span className="text-gradient-premium">across India</span>
              </>
            }
          />
          <div className="hidden shrink-0 gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label="Previous reviews"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-(--line) bg-(--panel) text-(--muted) shadow-sm transition-all duration-200 hover:border-(--gold-line) hover:text-(--foreground)"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label="Next reviews"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-(--line) bg-(--panel) text-(--muted) shadow-sm transition-all duration-200 hover:border-(--gold-line) hover:text-(--foreground)"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <Reveal className="mt-8 sm:mt-10">
          <div
            ref={scroller}
            className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
          >
            {reviews.map((review) => (
              <article
                key={review.name}
                data-card
                className="group relative flex h-full w-[86vw] shrink-0 snap-center flex-col rounded-3xl border border-(--line) bg-(--panel) p-6 shadow-[0_2px_20px_-4px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-(--gold-line) hover:shadow-premium sm:w-[calc(50vw-2rem)] sm:p-7 lg:w-[calc(33.333vw-2.5rem)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-(--gold) text-(--gold)" />
                    ))}
                  </div>
                  <span className="rounded-full bg-(--sage-soft) px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-(--sage)">
                    Verified
                  </span>
                </div>
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-(--muted) sm:text-[0.95rem]">
                  &ldquo;{review.quote}&rdquo;
                </blockquote>
                <div className="mt-6 flex items-center gap-3 border-t border-(--line) pt-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e64833] to-[#874f41] text-xs font-black text-[#fbe9d0] shadow-sm shadow-[#e64833]/20">
                    {initials(review.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-(--foreground)">{review.name}</p>
                    <p className="truncate text-xs text-(--muted-soft)">{review.meta}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}