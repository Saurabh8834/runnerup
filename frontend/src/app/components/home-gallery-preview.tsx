"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { galleryMoments } from "../data/events";
import type { HomeMoment } from "../../lib/events-api";
import { HomeSectionHeader } from "./home-section-header";

const artworkMap: Record<string, string> = {
  "sunrise finish": "/images/sunrise-finish.svg",
  "club leaderboard push": "/images/club-push.svg",
  "first medal day": "/images/first-medal.svg",
  "weekend long run": "/images/weekend-long-run.svg",
};

function resolveArtworkImage(title: string, src?: string): string {
  const key = (title || "").toLowerCase().trim();
  if (artworkMap[key]) return artworkMap[key];
  if (src) {
    if (src.includes("sunrise-finish")) return "/images/sunrise-finish.svg";
    if (src.includes("club-push")) return "/images/club-push.svg";
    if (src.includes("first-medal")) return "/images/first-medal.svg";
    if (src.includes("weekend-long-run")) return "/images/weekend-long-run.svg";
  }
  return artworkMap[key] || src || "/images/sunrise-finish.svg";
}

const fallbackMoments: HomeMoment[] = galleryMoments.map((m, i) => ({
  id: `static-${i}`,
  title: m.title,
  meta: m.meta,
  image: m.image,
}));

export function HomeGalleryPreview({
  moments: initial,
}: {
  moments?: HomeMoment[];
}) {
  // Deduplicate items by title so duplicate rows from database never appear, strictly capped at 4 items
  const rawList = initial && initial.length > 0 ? initial : fallbackMoments;
  const seen = new Set<string>();
  const moments: HomeMoment[] = [];

  for (const item of rawList) {
    const key = (item.title || "").toLowerCase().trim();
    if (key && !seen.has(key)) {
      seen.add(key);
      moments.push({
        ...item,
        image: resolveArtworkImage(item.title, item.image),
      });
      if (moments.length === 4) break;
    }
  }

  // If fewer than 4 items after deduplication, fill remainder from fallback moments
  if (moments.length < 4) {
    for (const fb of fallbackMoments) {
      const key = (fb.title || "").toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        moments.push({
          ...fb,
          image: resolveArtworkImage(fb.title, fb.image),
        });
        if (moments.length === 4) break;
      }
    }
  }

  if (moments.length === 0) {
    return null;
  }

  return (
    <section className="relative py-20 bg-[#14242a] text-[#fbe9d0] border-t border-[#90aead]/15 overflow-hidden">
      <div className="container-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <HomeSectionHeader
          theme="dark"
          action={
            <Link
              className="inline-flex items-center gap-2 rounded-full border border-[#90aead]/30 bg-[#244855]/60 px-6 py-3 text-xs font-black uppercase tracking-wider text-[#fbe9d0] shadow-md transition-all hover:bg-[#244855] hover:border-[#e64833]/50"
              href="/gallery"
            >
              <span>Explore Community Gallery</span>
              <ArrowUpRight
                aria-hidden="true"
                className="h-4 w-4 text-[#e64833] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          }
          align="split"
          eyebrow="MOMENTS OF GLORY"
          title="FINISH-LINE STORIES"
          lead="Real photos and inspiring finisher moments from runners across India."
        />

        {/* Strictly 4 cards in a responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {moments.slice(0, 4).map((moment, index) => (
            <Link
              key={moment.id ?? `${moment.title}-${index}`}
              className="group block overflow-hidden rounded-3xl border border-[#90aead]/20 bg-[#172c34] shadow-xl transition-all duration-300 hover:border-[#e64833]/50 hover:bg-[#1b323b] hover:shadow-2xl hover:-translate-y-1.5"
              href="/gallery"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-[#14242a]">
                <Image
                  alt={moment.title}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  src={moment.image}
                  width={400}
                  height={300}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  loading="lazy"
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#14242a]/90 via-transparent to-transparent pointer-events-none" />
                <span className="absolute left-3.5 bottom-3.5 z-10 rounded-full border border-[#90aead]/30 bg-[#14242a]/90 px-3 py-1 text-[0.65rem] font-black uppercase tracking-wider text-[#fbe9d0] backdrop-blur-md shadow-md">
                  {moment.meta}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-display font-extrabold text-lg uppercase tracking-tight text-[#fbe9d0] transition-colors group-hover:text-[#e64833]">
                  {moment.title}
                </h3>
                <p className="mt-1 text-xs text-[#90aead] font-medium">{moment.meta}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

