import Link from "next/link";
import { ArrowUpRight, FileBadge, Medal, Shirt, Sparkles, Ticket, Trophy, Truck } from "lucide-react";
import { getEventMedalImage, type PublicEvent } from "../../data/events";
import { Medal3D, Medal3DViewer } from "./medal";
import { Reveal, SectionHeader } from "./reveal";

const items = [
  {
    icon: Medal,
    title: "Finisher medal",
    desc: "A heavyweight metal medal with a gold-trimmed ribbon, designed to be worn.",
  },
  {
    icon: Ticket,
    title: "Official Digital Race Bib",
    desc: "Personalized official digital race bib with your name and unique runner number, ready to download and share instantly on registration.",
  },
  {
    icon: Shirt,
    title: "Top 3 Podium T-Shirt",
    desc: "Exclusive athletic-fit Dri-Fit performance t-shirt awarded to the top 3 leaderboard finishers.",
  },
  {
    icon: FileBadge,
    title: "Official Verifiable E-Certificate",
    desc: "Your name, distance, and verified time on an official QR-verified E-Certificate, unlocked immediately upon proof verification.",
  },
  {
    icon: Trophy,
    title: "Hall of Fame ranking",
    desc: "Your verified finish joins the public leaderboard with pacing stats.",
  },
  {
    icon: Truck,
    title: "Free doorstep delivery",
    desc: "Everything ships free across India after your proof is verified.",
  },
];

export function EventRewards({ event }: { event?: PublicEvent }) {
  const isAirForce =
    event?.slug?.includes("air-force") ||
    event?.name?.toLowerCase().includes("air force");
  const medalImg = event?.medalImageUrl || (event?.slug ? getEventMedalImage(event.slug) : "/images/event-medal.webp");

  const dynamicItems = [
    {
      icon: Medal,
      title: "Finisher medal",
      desc: isAirForce
        ? "100% Solid Metal Finisher Medal delivered right to your doorstep."
        : "A heavyweight metal medal with a gold-trimmed ribbon, designed to be worn.",
    },
    ...items.slice(1),
  ];

  return (
    <section id="rewards" className="section scroll-mt-24 border-b border-(--line)">
      <div className="container-page">
        <SectionHeader
          eyebrow="What you receive"
          title={
            <>
              A finish you&rsquo;ll be{" "}
              <span className="text-gold">proud to own</span>
            </>
          }
          lead="Every verified finisher walks away with a complete reward kit — built to be worn, hung, and remembered."
        />

        <div className="mt-10 grid items-start gap-6 sm:mt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          {/* Reward list - appears second on mobile, left on desktop */}
          <div className="space-y-3.5 order-2 lg:order-1">
            {dynamicItems.map(({ icon: Icon, title, desc }, i) => (
              <Reveal key={title} delay={i * 0.06}>
                <article className="group flex items-start gap-3.5 sm:gap-4 rounded-2xl border border-(--line) bg-(--panel) p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#e64833]/40 hover:shadow-premium sm:p-5">
                  <span className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/15 via-[#e64833]/15 to-[#874f41]/10 text-amber-400 shadow-sm transition-transform duration-300 group-hover:scale-105">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold tracking-tight text-(--foreground) sm:text-base">
                      {title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-(--muted) sm:text-sm">{desc}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          {/* Product showcase - appears FIRST on mobile for maximum visual punch */}
          <Reveal delay={0.1} className="order-1 lg:order-2 lg:sticky lg:top-28">
            <div className="relative overflow-hidden rounded-[2rem] border border-(--gold-line) bg-gradient-to-b from-[#e64833]/10 via-(--panel) to-(--panel)">
              <div
                aria-hidden
                className="sun-pulse pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(230,72,51,0.35) 0%, rgba(135,79,65,0.15) 45%, transparent 70%)",
                }}
              />

              <div className="relative flex items-center justify-center px-4 pt-8 pb-1">
                <Medal3DViewer
                  slug={event?.slug || ""}
                  eventName={event?.name}
                  size="rewards"
                  showBadges={false}
                  isPast={event?.status === "past"}
                />
              </div>

              {/* Stable feature badges — neatly docked beneath the medal, zero overlapping */}
              <div className="relative px-4 sm:px-6 pb-6 pt-3 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-[0.72rem] sm:text-xs font-bold text-amber-300 shadow-sm backdrop-blur-md">
                  <Shirt className="h-3.5 w-3.5 text-amber-400" />
                  <span>Top 3 Podium T-shirt</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-[#14242a]/90 px-3.5 py-1.5 text-[0.72rem] sm:text-xs font-bold text-cyan-300 shadow-sm backdrop-blur-md">
                  <Ticket className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Digital Race Bib</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#90aead]/25 bg-[#14242a]/90 px-3.5 py-1.5 text-[0.72rem] sm:text-xs font-bold text-[#fbe9d0] shadow-sm backdrop-blur-md">
                  <FileBadge className="h-3.5 w-3.5 text-[#e64833]" />
                  <span>Official E-Certificate</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#90aead]/25 bg-[#14242a]/90 px-3.5 py-1.5 text-[0.72rem] sm:text-xs font-bold text-[#fbe9d0] shadow-sm backdrop-blur-md">
                  <Truck className="h-3.5 w-3.5 text-[#e64833]" />
                  <span>Free delivery</span>
                </div>
              </div>

              {/* Footer tag */}
              <div className="relative border-t border-(--gold-line) px-6 py-5 text-center">
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--gold-deep)">
                  <Sparkles className="h-3.5 w-3.5" />
                  Kit worth ₹900+ · included with every entry
                </p>
                <Link
                  className="group mt-2 inline-flex items-center gap-1 text-[0.7rem] font-bold uppercase tracking-widest text-(--muted) transition-colors hover:text-(--sage)"
                  href="/register"
                >
                  Claim yours
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
