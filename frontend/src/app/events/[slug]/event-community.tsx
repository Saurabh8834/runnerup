import Link from "next/link";
import { Heart } from "lucide-react";
import { Reveal, SectionHeader } from "./reveal";

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

const posts = [
  { src: "/images/sunrise-finish.svg", alt: "Runner finishing at sunrise", likes: "2.4k" },
  { src: "/images/first-medal.svg", alt: "First medal day celebration", likes: "3.1k" },
  { src: "/images/club-push.svg", alt: "Running club group effort", likes: "1.9k" },
  { src: "/images/weekend-long-run.svg", alt: "Weekend long run", likes: "2.8k" },
];

export function EventCommunity() {
  return (
    <section className="section border-b border-(--line)">
      <div className="container-page">
        <SectionHeader
          eyebrow="The community"
          title={
            <>
              Real runners. Real medals.{" "}
              <span className="text-gold">Real moments.</span>
            </>
          }
          lead="Join 25,000+ runners who made RunnerUp part of their journey."
        />

        <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-14 sm:grid-cols-4 sm:gap-4">
          {posts.map((post, i) => (
            <Reveal key={post.src} delay={i * 0.07}>
              <div className="group relative aspect-square overflow-hidden rounded-2xl border border-(--line) bg-(--panel)">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.src}
                  alt={post.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/70 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Heart className="h-3.5 w-3.5 fill-white" />
                    {post.likes}
                  </span>
                  <InstagramGlyph className="h-4 w-4 text-white" />
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8 text-center">
          <Link
            href="https://instagram.com/runnerup.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-(--line) bg-(--panel) px-5 py-2.5 text-sm font-bold text-(--foreground) shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-(--gold-line) hover:shadow-premium"
          >
            <InstagramGlyph className="h-4 w-4 text-(--gold-deep)" />
            Follow @runnerup.in
          </Link>
        </Reveal>
      </div>
    </section>
  );
}