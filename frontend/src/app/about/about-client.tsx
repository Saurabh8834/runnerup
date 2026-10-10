"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ChevronDown, MapPin, Medal, Route, ShieldCheck, Trophy, Upload, UserCheck, Sparkles, Heart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { aboutFaqs, aboutPillars, aboutStats, aboutSteps } from "../data/about";
import { cn } from "../../lib/cn";

/* ── Count-up animation ─────────────────────────────────── */
function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1200);
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target]);
  return value;
}

/* ── Stat card ─────────────────────────────────────────── */
const statIcons = [Trophy, MapPin, Sparkles, Heart] as const;

function StatCard({ label, value, icon, suffix = "+" }: { label: string; value: number; icon: typeof Trophy; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const count = useCountUp(value, inView);
  const Icon = icon;

  return (
    <div ref={ref} className="group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-(--line) bg-(--panel) px-4 py-6 text-center transition-shadow hover:shadow-sm">
      <div aria-hidden className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-(--sage)/5 blur-xl transition-all group-hover:bg-(--sage)/10" />
      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-(--line) bg-(--panel-soft) text-(--sage) transition-all group-hover:bg-(--sage)/10 group-hover:border-(--sage)/30">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums text-(--foreground) sm:text-4xl">
        {count.toLocaleString("en-IN")}{suffix}
      </p>
      <p className="text-xs font-medium uppercase tracking-wider text-(--muted)">{label}</p>
    </div>
  );
}

/* ── FAQ accordion ─────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-(--line) last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-sm font-semibold text-(--foreground) sm:text-base">{q}</span>
        <ChevronDown className={cn("h-5 w-5 shrink-0 text-(--muted) transition-transform duration-300", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="pb-5 text-sm leading-7 text-(--muted) sm:pr-10">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const pillarIcons = [ShieldCheck, MapPin, Route] as const;
const stepIcons = [UserCheck, Trophy, Upload, Medal] as const;

/* ── Fade-in on scroll wrapper ──────────────────────────── */
function FadeIn({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const reduce = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ── Main component ─────────────────────────────────────── */
export function AboutClient() {
  const reduce = useReducedMotion();
  const { isSignedIn } = useAuth();

  return (
    <div className="min-w-0">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-(--line)">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: [
              "radial-gradient(ellipse 80% 50% at 0% 0%, color-mix(in srgb, var(--sage) 12%, transparent) 0%, transparent 60%)",
              "radial-gradient(ellipse 50% 40% at 100% 100%, color-mix(in srgb, var(--sage) 6%, transparent) 0%, transparent 50%)",
              "var(--background)",
            ].join(", "),
          }}
        />
        {/* Decorative dots top-right */}
        <div aria-hidden className="pointer-events-none absolute top-8 right-8 flex gap-1.5 opacity-20">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-1.5 w-1.5 rounded-full bg-(--sage) animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
        </div>

        <div className="container-page py-14 sm:py-20 md:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">

            {/* Left */}
            <motion.div
              className="min-w-0"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="eyebrow">About RunnerUp</p>
              <h1 className="mt-3 text-4xl font-bold leading-[1.1] tracking-tight text-(--foreground) sm:text-5xl">
                Real races.
                <span className="block mt-1 bg-gradient-to-r from-emerald-500 via-(--sage) to-indigo-400 bg-clip-text text-transparent">
                  Run anywhere.
                </span>
              </h1>
              <div className="mt-5 space-y-4 text-sm leading-7 text-(--muted) sm:text-base sm:leading-8 max-w-lg">
                <p>
                  RunnerUp was built for people who love running but don't always have a race nearby.
                </p>
                <p>
                  Choose an event, run wherever you are, upload your GPS activity, and earn a finish that actually means something. No complicated rules, no crowded start lines — just real effort, verified honestly.
                </p>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link className="btn btn-primary w-full sm:w-auto" href="/events">Browse open events</Link>
                {isSignedIn ? (
                  <Link className="btn btn-secondary w-full sm:w-auto" href="/dashboard">My dashboard</Link>
                ) : (
                  <Link className="btn btn-secondary w-full sm:w-auto" href="/sign-up">Create free account</Link>
                )}
              </div>
            </motion.div>

            {/* Right — image */}
            <motion.div
              className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-(--line) lg:max-w-none"
              initial={reduce ? false : { opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative aspect-[4/3] w-full sm:aspect-[16/10] lg:aspect-[4/3]">
                <Image
                  alt="Runner finishing a RunnerUp virtual event"
                  src="/images/about-hero-art.svg"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-white/60">How it feels</p>
                  <p className="mt-1 text-base font-semibold text-white sm:text-lg">Your route. Our verification. A finish that counts.</p>
                </div>
              </div>
              {/* Floating badge */}
              <div aria-hidden className="absolute -top-2 -right-2 flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md shadow-lg">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                Trusted by runners
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────── */}
      <section className="border-b border-(--line)">
        <div className="container-page py-10 sm:py-12">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {aboutStats.map((stat, i) => (
              <StatCard key={stat.label} label={stat.label} value={stat.value} icon={statIcons[i]} />
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT THIS IS ──────────────────────────────────────── */}
      <section className="section border-b border-(--line) relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(var(--sage) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />
        <div className="container-page">
          <FadeIn>
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow">What this is</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-(--foreground) sm:text-4xl">
                A full virtual race experience
              </h2>
              <p className="lede mt-4 mx-auto max-w-lg">
                From payment to proof review to certificate email — built for one loop: finish honestly, get recognised.
              </p>
            </div>
          </FadeIn>

          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {aboutPillars.map((item, i) => {
              const Icon = pillarIcons[i];
              return (
                <FadeIn key={item.title} delay={i * 0.12}>
                  <article className="group flex flex-col rounded-2xl border border-(--line) bg-(--panel) p-6 transition-all hover:border-(--sage)/30 hover:shadow-sm">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-(--line) bg-(--panel-soft) text-(--sage) transition-all group-hover:bg-(--sage)/10 group-hover:border-(--sage)/30">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <h3 className="mt-5 text-base font-bold tracking-tight text-(--foreground)">{item.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-(--muted)">{item.text}</p>
                  </article>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="section border-b border-(--line) bg-(--panel-soft)/50 relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-px w-24 bg-gradient-to-r from-transparent via-(--sage)/30 to-transparent" />
        <div className="container-page">
          <FadeIn>
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow">How it works</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-(--foreground) sm:text-4xl">
                Four steps. No guesswork.
              </h2>
            </div>
          </FadeIn>

          <ol className="relative mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {/* Mobile/tablet connector line */}
            <div aria-hidden className="pointer-events-none absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-(--sage)/30 via-(--sage)/20 to-transparent hidden sm:block lg:hidden" />

            {aboutSteps.map((item, i) => {
              const Icon = stepIcons[i];
              return (
                <FadeIn key={item.step} delay={i * 0.1}>
                  <li className="relative flex flex-col rounded-2xl border border-(--line) bg-(--panel) p-5 transition-all hover:border-(--sage)/30 hover:shadow-sm sm:p-6">
                    <div className="flex items-center justify-between">
                      <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-(--sage)/10 text-(--sage) ring-1 ring-(--sage)/20">
                        <Icon className="h-5 w-5" strokeWidth={1.75} />
                      </span>
                      <span className="font-mono text-2xl font-bold text-(--sage)/30">{item.step}</span>
                    </div>
                    <h3 className="mt-5 text-base font-bold tracking-tight text-(--foreground)">{item.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-(--muted)">{item.text}</p>
                  </li>
                </FadeIn>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ── REWARDS ───────────────────────────────────────────── */}
      <section className="section border-b border-(--line) relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-(--sage)/5 blur-3xl" />
        <div className="container-page">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">

            <FadeIn>
              <div className="relative overflow-hidden rounded-3xl border border-(--line) group">
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    alt="RunnerUp finisher medal and verified e-certificate"
                    src="/images/rewards-showcase.svg"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="min-w-0">
                <p className="eyebrow">After you finish</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-(--foreground) sm:text-4xl">
                  Proof approved → rewards unlocked
                </h2>
                <p className="lede mt-4">One GPS screenshot triggers the whole rewards chain.</p>

                <ul className="mt-8 space-y-5">
                  {[
                    { icon: ShieldCheck, title: "Leaderboard rank", text: "Approved finish times rank publicly for that event and distance. Honest, verified." },
                    { icon: Medal, title: "E-certificate", text: "Generated after approval, emailed to you, verifiable by QR code online." },
                    { icon: MapPin, title: "Medal delivery", text: "When the event includes a medal, we ship to the address you saved at registration." },
                  ].map((row, i) => (
                    <motion.li
                      key={row.title}
                      className="flex gap-4"
                      initial={reduce ? false : { opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      viewport={{ once: true }}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-(--line) bg-(--panel-soft) text-(--sage)">
                        <row.icon className="h-4 w-4" strokeWidth={1.75} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold tracking-tight text-(--foreground)">{row.title}</p>
                        <p className="mt-1 text-sm leading-6 text-(--muted)">{row.text}</p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </FadeIn>

          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className="section border-b border-(--line) bg-(--panel-soft)/50">
        <div className="container-page">
          <FadeIn>
            <div className="mx-auto max-w-3xl">
              <div className="text-center">
                <p className="eyebrow">FAQ</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-(--foreground) sm:text-4xl">
                  Common questions
                </h2>
              </div>
              <div className="mt-10 rounded-2xl border border-(--line) bg-(--panel) px-5 sm:px-7">
                {aboutFaqs.map((item) => (
                  <FaqItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section className="section">
        <div className="container-page">
          <FadeIn>
            <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-(--line) bg-(--panel) px-6 py-12 text-center sm:px-12 sm:py-14">
              {/* Subtle glow */}
              <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-emerald-500/5 via-transparent to-indigo-500/5" />
              {/* Decorative dots */}
              <div aria-hidden className="pointer-events-none absolute top-4 left-4 flex gap-1 opacity-20">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-1 w-1 rounded-full bg-(--sage)" />
                ))}
              </div>

              <p className="eyebrow">Ready when you are</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-(--foreground) sm:text-4xl">
                Pick a distance. Run this week.
              </h2>
              <p className="lede mx-auto mt-4 max-w-md">
                Open events are live on the events page. Your dashboard tracks everything after you join.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link className="btn btn-primary" href="/events">See open events</Link>
                {isSignedIn ? (
                  <Link className="btn btn-secondary" href="/dashboard">My dashboard</Link>
                ) : (
                  <Link className="btn btn-secondary" href="/sign-in">Sign in</Link>
                )}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  );
}
