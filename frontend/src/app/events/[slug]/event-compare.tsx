import { Check, Minus } from "lucide-react";
import { Reveal, SectionHeader } from "./reveal";

const traditional = [
  { text: "Wake up at 4 AM", mark: "x" },
  { text: "Travel across the city", mark: "x" },
  { text: "Stand in long queues", mark: "x" },
  { text: "Stuck to one location", mark: "x" },
  { text: "Overcrowded start line", mark: "x" },
  { text: "Pay for transport + kit", mark: "x" },
];

const runnerup = [
  { text: "Run in your own city", mark: "ok" },
  { text: "Choose your time & pace", mark: "ok" },
  { text: "Verified, fair results", mark: "ok" },
  { text: "GPS-proofed finish", mark: "ok" },
  { text: "Free doorstep delivery", mark: "ok" },
  { text: "One flat price, kit included", mark: "ok" },
];

export function EventCompare() {
  return (
    <section className="section border-b border-(--line)">
      <div className="container-page">
        <SectionHeader
          eyebrow="The RunnerUp difference"
          title={
            <>
              A real race,{" "}
              <span className="text-gradient-premium">without the chaos</span>
            </>
          }
          lead="You get everything you love about race day — the pride, the medal, the bragging rights — minus the 4 AM alarm."
        />

        <div className="mt-10 grid gap-4 sm:mt-14 md:grid-cols-2">
          {/* Traditional */}
          <Reveal>
            <div className="relative h-full overflow-hidden rounded-3xl border border-(--line) bg-(--panel) p-6 sm:p-8">
              <p className="text-[0.65rem] font-black uppercase tracking-widest text-(--muted-soft)">
                Traditional marathon
              </p>
              <ul className="mt-5 space-y-3.5">
                {traditional.map(({ text }) => (
                  <li key={text} className="flex items-center gap-3 text-sm text-(--muted)">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#874f41]/20 text-[#e64833]">
                      <Minus className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* RunnerUp */}
          <Reveal delay={0.1}>
            <div className="relative h-full overflow-hidden rounded-3xl border border-(--gold-line) bg-gradient-to-b from-[#e64833]/10 to-(--panel) p-6 shadow-premium sm:p-8">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-[#e64833] opacity-10 blur-3xl"
              />
              <div className="flex items-center justify-between">
                <p className="text-[0.65rem] font-black uppercase tracking-widest text-[#e64833]">
                  RunnerUp
                </p>
                <span className="rounded-full bg-gradient-to-r from-[#e64833] to-[#874f41] px-2.5 py-0.5 text-[0.6rem] font-black uppercase tracking-wider text-[#fbe9d0] shadow-xs">
                  Recommended
                </span>
              </div>
              <ul className="mt-5 space-y-3.5">
                {runnerup.map(({ text }) => (
                  <li key={text} className="flex items-center gap-3 text-sm font-semibold text-(--foreground)">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#90aead]/20 text-[#90aead]">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}