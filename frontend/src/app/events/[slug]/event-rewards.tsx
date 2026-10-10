import Link from "next/link";
import { ArrowUpRight, FileBadge, Medal, Shirt, Sparkles, Trophy, Truck } from "lucide-react";
import { Medal3D } from "./medal";
import { Reveal, SectionHeader } from "./reveal";

const items = [
  {
    icon: Medal,
    title: "Finisher medal",
    desc: "A heavyweight metal medal with a gold-trimmed ribbon, designed to be worn.",
  },
  {
    icon: Shirt,
    title: "Premium event T-shirt",
    desc: "Exclusive athletic-fit tee included with every kit, in a special-edition print.",
  },
  {
    icon: FileBadge,
    title: "Official printed certificate",
    desc: "Your name, distance and verified time on a real certificate, delivered to your door.",
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

export function EventRewards() {
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
          {/* Reward list */}
          <div className="space-y-3.5">
            {items.map(({ icon: Icon, title, desc }, i) => (
              <Reveal key={title} delay={i * 0.06}>
                <article className="group flex items-start gap-4 rounded-2xl border border-(--line) bg-(--panel) p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#e64833]/40 hover:shadow-premium sm:p-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#90aead]/20 bg-gradient-to-br from-[#e64833]/15 to-[#874f41]/10 text-[#e64833] shadow-sm transition-transform duration-300 group-hover:scale-105">
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

          {/* Product showcase */}
          <Reveal delay={0.1} className="lg:sticky lg:top-28">
            <div className="relative overflow-hidden rounded-[2rem] border border-(--gold-line) bg-gradient-to-b from-[#e64833]/10 via-(--panel) to-(--panel)">
              <div
                aria-hidden
                className="sun-pulse pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(230,72,51,0.35) 0%, rgba(135,79,65,0.15) 45%, transparent 70%)",
                }}
              />

              <div className="relative flex items-center justify-center px-6 pt-10">
                <div className="medal-float w-44 drop-shadow-[0_35px_40px_rgba(230,72,51,0.25)] sm:w-56">
                  <Medal3D className="h-auto w-full" />
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
