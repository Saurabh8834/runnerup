import type { Metadata } from "next";
import { FileText, Medal, Shirt, Trophy } from "lucide-react";
import { PageShell } from "../components/app-shell";
import { EventsCatalog } from "./events-catalog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://runnerup.in";

export const metadata: Metadata = {
  title: "Upcoming Virtual Running Events India 2026 | 5K, 10K, 21K Races — RunnerUp",
  description:
    "Explore and register for upcoming virtual running events across India. Complete 1.5K, 5K, 10K, or 21K half marathons from anywhere. GPS verification, custom metal medals, DRI-FIT t-shirts, and instant E-certificates.",
  keywords: [
    "virtual running events",
    "virtual running events india",
    "online marathon India",
    "5K run events",
    "10K run events",
    "half marathon virtual",
    "running races India",
    "GPS verified runs",
    "virtual race registration",
    "virtual marathon 2026",
  ],
  openGraph: {
    title: "Upcoming Virtual Running Events India 2026 | 5K, 10K, 21K Races — RunnerUp",
    description:
      "Explore and register for upcoming virtual running events across India. GPS verification, custom medals & instant certificates.",
    url: "/events",
    type: "website",
  },
  alternates: {
    canonical: `${SITE_URL}/events`,
  },
};

export default function EventsPage() {
  return (
    <PageShell>
      <div className="relative min-w-0 bg-[#fbf6ee]">
        {/* ── SECTION 1: HERO BANNER (WARM CREAM #fbf6ee) ─────────────── */}
        <section className="relative overflow-hidden border-b border-[#90aead]/20 pt-24 pb-12 sm:pt-28 sm:pb-16 isolate text-[#14242a] bg-[#fbf6ee]">
          <div aria-hidden className="pointer-events-none absolute top-1/3 left-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-[#90aead]/25 blur-[140px]" />
          <div aria-hidden className="pointer-events-none absolute bottom-0 right-10 -z-10 h-[250px] w-[250px] rounded-full bg-[#e64833]/15 blur-[100px]" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e64833]/40 bg-[#e64833]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#e64833] mb-4 shadow-sm">
                OFFICIAL RACES & CHALLENGES
              </span>
              
              <h1 className="font-display font-black text-4xl sm:text-6xl uppercase tracking-tight text-[#14242a]">
                FIND YOUR NEXT{" "}
                <span className="text-[#e64833]">
                  FINISH LINE
                </span>
              </h1>
              
              <p className="mt-4 text-sm sm:text-base text-[#244855]/90 max-w-xl mx-auto font-medium leading-relaxed">
                Choose a challenge, record GPS with Strava or Garmin, and earn official heavy-metal finisher medals delivered straight to your door across India.
              </p>

              <div className="mt-7 flex flex-wrap justify-center gap-2 sm:gap-3">
                {[
                  { label: "Heavy Medals", icon: Medal },
                  { label: "DRI-FIT T-shirts", icon: Shirt },
                  { label: "E-Certificates", icon: FileText },
                  { label: "Live Leaderboard", icon: Trophy },
                ].map(({ label, icon: Icon }) => (
                  <span key={label} className="inline-flex items-center gap-1.5 rounded-full border border-[#90aead]/30 bg-white/90 px-3.5 py-1.5 text-xs font-bold text-[#14242a] shadow-sm">
                    <Icon className="h-3.5 w-3.5 text-[#e64833]" strokeWidth={2.2} />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 2 (DARK #14242a) & SECTION 3 (WARM CREAM #fbf6ee) ── */}
        <EventsCatalog />
      </div>
    </PageShell>
  );
}
