import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AppFooter } from "./components/app-footer";
import { AppHeader } from "./components/app-header";
import { HomeEvents } from "./components/home-events";
import { HomeFaq } from "./components/home-faq";
import { HomeGalleryPreview } from "./components/home-gallery-preview";
import { HomeHero } from "./components/home-hero";
import { HomeStatsTicker } from "./components/home-stats-ticker";
import { HomeReviews } from "./components/home-reviews";
import { HomeRewards } from "./components/home-rewards";
import { HomeSectionHeader } from "./components/home-section-header";
import { HomeSteps } from "./components/home-steps";
import { fetchOpenEvents, fetchHomeContent } from "../lib/events-api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://runnerup.in";

export const metadata: Metadata = {
  title: "Virtual Running Events India 2026 | Real Medals & GPS Verified Races — RUNNERUP",
  description:
    "Join India's premier virtual running events. Run 1.5K, 5K, 10K, 21K marathons from anywhere. Track with Strava, Garmin, Nike, earn authentic metal finisher medals, t-shirts, and instant E-certificates.",
  keywords: [
    "virtual running",
    "virtual running events india",
    "virtual marathon india",
    "online running challenge",
    "runnerup",
    "runnerup virtual marathon",
    "virtual 5k run",
    "virtual 10k race",
    "half marathon virtual",
    "running events india",
    "strava virtual marathon india",
    "garmin running challenges",
    "virtual run with medal",
    "running medals india",
    "running certificates",
    "fitness challenge india",
    "virtual race registration",
  ],
  openGraph: {
    title: "Virtual Running Events India 2026 | Real Medals & GPS Verified Races — RUNNERUP",
    description:
      "Join India's premier virtual running events. Run anywhere with Strava/Garmin, earn authentic metal finisher medals and digital certificates.",
    url: "/",
    type: "website",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export const revalidate = 60;

export default async function Home() {
  const [serverEvents, serverHome] = await Promise.all([
    fetchOpenEvents({ homeFeaturedFirst: true, limit: 3 }).catch(() => undefined),
    fetchHomeContent().catch(() => undefined),
  ]);

  return (
    <div className="page-shell flex min-h-screen flex-col bg-[#14242a] text-[#fcf8f2]">
      <AppHeader />

      <main className="flex-1 pt-0">
        {/* 1. Hero Section with Ken Burns, Kinetic Typography & Trust Pills */}
        <HomeHero />

        {/* 2. Athletic Performance Stats Ticker Bar */}
        <HomeStatsTicker />

        {/* 3. 3 Simple Steps */}
        <HomeSteps />

        {/* 4. Featured Live Races / Challenges */}
        <section className="relative py-20 sm:py-24 bg-[#172c34] text-[#fcf8f2] border-t border-[#90aead]/15">
          <div className="container-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <HomeSectionHeader
              theme="dark"
              action={
                <Link
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-xs font-black uppercase tracking-wider text-[#fcf8f2] shadow-md transition-all hover:bg-[#e64833] hover:text-white hover:border-[#e64833]"
                  href="/events"
                >
                  <span>View All Races</span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              }
              align="split"
              eyebrow="LIVE CHALLENGES"
              lead="Featured virtual marathons. Choose your target distance and claim your official bib & finisher medal kit."
              title="OPEN CHALLENGES"
            />

            <HomeEvents initial={serverEvents} />
          </div>
        </section>

        {/* 5. Finisher Rewards Showcase */}
        <HomeRewards />

        {/* 6. Finish-Line Moments & Community Gallery */}
        <HomeGalleryPreview moments={serverHome?.moments} />

        {/* 7. Verified Runner Reviews */}
        <HomeReviews testimonials={serverHome?.testimonials} />

        {/* 8. Frequently Asked Questions */}
        <HomeFaq />
      </main>

      <AppFooter />
    </div>
  );
}
