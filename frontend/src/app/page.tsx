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
    "India’s premier GPS-verified virtual races. Run anywhere, track with Strava, Garmin, or Apple Watch, and earn authentic metal finisher medals delivered across India.",
  keywords: [
    "virtual running",
    "virtual running events india",
    "virtual marathon india",
    "indian air force day virtual run 2026",
    "iaf day virtual challenge",
    "online running challenge india",
    "runnerup",
    "runnerup virtual marathon",
    "virtual 5k run",
    "virtual 10k race",
    "half marathon virtual 2026",
    "running events india",
    "strava virtual marathon india",
    "garmin running challenges",
    "virtual run with medal",
    "running medals india",
    "solid metal finisher medal",
    "running certificates",
    "fitness challenge india",
    "virtual race registration",
  ],
  openGraph: {
    title: "Virtual Running Events India 2026 | Real Medals & GPS Verified Races — RUNNERUP",
    description:
      "Join India's premier virtual running events. Run anywhere with Strava/Garmin, earn authentic metal finisher medals and digital certificates.",
    url: SITE_URL,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "RUNNERUP - Virtual Running Events India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Virtual Running Events India 2026 | Real Medals — RUNNERUP",
    description:
      "Join India's premier virtual running events. Run anywhere with Strava/Garmin, earn authentic metal finisher medals and digital certificates.",
    images: [`${SITE_URL}/og-image.png`],
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
    <div className="page-shell flex min-h-screen flex-col bg-[#030d12] text-[#fcf8f2]">
      <AppHeader />

      <main className="flex-1 pt-0">
        {/* 1. Hero Section with Ken Burns, Kinetic Typography & Trust Pills */}
        <HomeHero />

        {/* 2. Athletic Performance Stats Ticker Bar */}
        <HomeStatsTicker />

        {/* 3. 3 Simple Steps */}
        <HomeSteps />

        {/* 4. Featured Live Races / Challenges */}
        <section className="relative py-20 sm:py-24 bg-[#06151c] text-[#fcf8f2] border-t border-white/10">
          <div className="container-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <HomeSectionHeader
              theme="dark"
              action={
                <Link
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-xs font-black uppercase tracking-wider text-[#fcf8f2] shadow-md transition-all hover:bg-[#00dfc4] hover:text-black hover:border-[#00dfc4]"
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
