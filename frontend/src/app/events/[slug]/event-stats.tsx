"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { Flag, Medal, Star, Users } from "lucide-react";
import { Reveal } from "./reveal";

type Stat = {
  icon: typeof Users;
  value: number;
  suffix: string;
  label: string;
};

function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      const id = requestAnimationFrame(() => setDisplay(value));
      return () => cancelAnimationFrame(id);
    }
    const duration = 1300;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setDisplay(Math.round((1 - Math.pow(1 - t, 3)) * value));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, value]);

  return <span ref={ref}>{display.toLocaleString("en-IN")}</span>;
}

const stats: Stat[] = [
  { icon: Users, value: 25000, suffix: "+", label: "Runners joined" },
  { icon: Flag, value: 120, suffix: "+", label: "Cities covered" },
  { icon: Star, value: 98, suffix: "%", label: "Completion rate" },
  { icon: Medal, value: 1800, suffix: "+", label: "Verified reviews" },
];

export function EventStats() {
  return (
    <section className="event-classic-stats border-b border-white/10">
      <div className="container-page -mt-6 sm:-mt-8">
        <Reveal>
          <div className="grid grid-cols-2 gap-2 sm:gap-px overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 shadow-2xl backdrop-blur-xl p-2 sm:p-0 sm:grid-cols-4">
            {stats.map(({ icon: Icon, value, suffix, label }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center gap-1.5 rounded-2xl sm:rounded-none bg-[#0c1219]/90 sm:bg-(--panel) px-3 py-4 sm:px-4 sm:py-7 text-center transition-all duration-300 hover:bg-[#131d27] border border-white/5 sm:border-0"
              >
                <span className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-transparent text-amber-400 shadow-sm">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <span className="mt-1 text-2xl sm:text-3xl font-black tabular-nums tracking-tight text-white">
                  <CountUp value={value} />
                  <span className="text-amber-400 font-extrabold">{suffix}</span>
                </span>
                <span className="text-[0.62rem] sm:text-[0.68rem] font-bold uppercase tracking-wider text-zinc-400">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
