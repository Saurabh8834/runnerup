import { Bike, Clock3, MapPinned, Route, Smartphone, ShieldCheck } from "lucide-react";
import { Reveal, SectionHeader } from "./reveal";

const cards = [
  {
    icon: MapPinned,
    title: "Run anywhere",
    desc: "Park, road, treadmill or your own street — no travel, no city limits.",
    tile: "from-[#e64833]/20 to-[#874f41]/10 text-[#e64833]",
  },
  {
    icon: Route,
    title: "Choose your distance",
    desc: "From a friendly 1.6 km to a full 21 km. Run, walk or cycle your way in.",
    tile: "from-[#244855]/40 to-[#244855]/15 text-[#90aead]",
  },
  {
    icon: Smartphone,
    title: "Track your run",
    desc: "Use Strava, Garmin or your phone — any GPS app you already love.",
    tile: "from-[#90aead]/25 to-[#244855]/15 text-[#fbe9d0]",
  },
  {
    icon: ShieldCheck,
    title: "Submit proof",
    desc: "Upload your GPS activity. A real team verifies every single finish.",
    tile: "from-[#874f41]/25 to-[#874f41]/10 text-[#fbe9d0]",
  },
  {
    icon: Clock3,
    title: "Your pace, your time",
    desc: "Finish at sunrise or midnight — any hour within the event window.",
    tile: "from-[#e64833]/20 to-[#244855]/20 text-[#e64833]",
  },
  {
    icon: Bike,
    title: "Rewards at your door",
    desc: "Medal, certificate and kit delivered free across India. Zero hassles.",
    tile: "from-[#90aead]/20 to-[#244855]/25 text-[#90aead]",
  },
];

export function EventWhy() {
  return (
    <section className="section border-b border-(--line)">
      <div className="container-page">
        <SectionHeader
          eyebrow="Why this event"
          title={
            <>
              Built for every kind of{" "}
              <span className="text-gradient-premium">runner</span>
            </>
          }
          lead="No crowds. No pressure. Just you, your distance, and a finish that is 100% yours."
        />

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ icon: Icon, title, desc, tile }, i) => (
            <Reveal key={title} delay={(i % 3) * 0.08}>
              <article className="group relative h-full overflow-hidden rounded-3xl border border-(--line) bg-(--panel) p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-(--sage)/25 hover:shadow-premium sm:p-7">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-(--sage) opacity-[0.04] blur-2xl transition-all duration-500 group-hover:opacity-[0.09]"
                />
                <span
                  className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${tile} shadow-sm`}
                >
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <h3 className="mt-5 text-lg font-bold tracking-tight text-(--foreground) transition-colors duration-300 group-hover:text-(--sage)">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-(--muted)">{desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
