import type { Metadata } from "next";
import Link from "next/link";
import {
  Medal,
  Award,
  ShieldCheck,
  Truck,
  Sparkles,
  Users,
  Compass,
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
} from "lucide-react";
import { PageShell } from "../components/app-shell";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://runnerup.in";

export const metadata: Metadata = {
  title: "About RunnerUp | India's Premier GPS-Verified Virtual Marathon Platform",
  description:
    "Learn about RunnerUp — India's premier virtual running community. Run anywhere with Strava, Garmin or smartwatches, earn 100% authentic heavy metal finisher medals, and get verified race certificates across all 28 Indian states.",
  keywords: [
    "about runnerup",
    "virtual running platform india",
    "virtual marathon organizer",
    "running medals india",
    "gps running verification",
    "runnerup story",
    "fitness events india",
  ],
  openGraph: {
    title: "About RunnerUp | India's Premier GPS-Verified Virtual Marathon Platform",
    description:
      "Empowering runners across India with accessible, GPS-verified challenges, heavy metal finisher medals, and instant digital certificates.",
    url: `${SITE_URL}/about`,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "About RunnerUp India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About RunnerUp | India's Premier Virtual Marathon Platform",
    description:
      "Run anywhere, earn authentic metal finisher medals, and celebrate every milestone with RunnerUp.",
    images: [`${SITE_URL}/og-image.png`],
  },
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
};

export default function AboutPage() {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About RunnerUp",
    url: `${SITE_URL}/about`,
    description:
      "RunnerUp is India's leading virtual running platform connecting runners across all 28 states with authentic finisher medals, GPS-verified races, and digital bibs.",
    publisher: {
      "@type": "Organization",
      name: "RunnerUp",
      url: SITE_URL,
      logo: `${SITE_URL}/logo-mark.svg`,
      sameAs: [
        "https://instagram.com/runnerup.in",
      ],
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "About Us",
        item: `${SITE_URL}/about`,
      },
    ],
  };

  const stats = [
    { label: "Active Runners", val: "12,400+" },
    { label: "Pincodes Delivered", val: "19,000+" },
    { label: "Solid Metal Medals Sent", val: "18,500+" },
    { label: "Verified Kilometres", val: "94,000+" },
  ];

  const pillars = [
    {
      icon: Medal,
      title: "100% Authentic Metal Medals",
      desc: "No plastic toys. Every RunnerUp medal is die-cast solid metal with 3D embossing, high-grade enamel, and custom satin neck ribbons that runners cherish.",
    },
    {
      icon: ShieldCheck,
      title: "Verified GPS Timing",
      desc: "Every run submission is verified through Strava, Garmin, Nike Run Club, or smartwatch logs by our race arbiters to ensure fair leaderboards.",
    },
    {
      icon: Truck,
      title: "Fast Pan-India Delivery",
      desc: "From tier-1 metros to remote hill towns, our shipping partners (Delhivery, Shiprocket, India Post) deliver medal kits directly to your doorstep with live SMS tracking.",
    },
    {
      icon: Award,
      title: "Instant Verifiable E-Certificates",
      desc: "Upon GPS proof approval, download high-resolution certificates complete with unique serial numbers, QR code verification, finish time, and official pace.",
    },
    {
      icon: Users,
      title: "Inclusive for Every Pace",
      desc: "Whether you run a 5:00/km sprint or walk 1.5 km with your family, our challenges are designed to celebrate consistency, health, and personal victory.",
    },
    {
      icon: HeartHandshake,
      title: "Dedicated Runner Support",
      desc: "Our support team is one WhatsApp tap away to assist you with registration, activity uploads, kit delivery status, and certificate generation.",
    },
  ];

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="relative min-w-0 bg-[#14242a] pt-24 pb-20 text-[#fcf8f2]">
        {/* Subtle background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,_rgba(230,72,51,0.18),transparent_70%)]"
        />

        <div className="container-page max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header Eyebrow */}
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#90aead]/30 bg-[#172c34]/90 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#fbe9d0] shadow-sm mb-4">
              <Sparkles className="h-3.5 w-3.5 text-[#e64833]" />
              The RunnerUp Movement
            </span>
            <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white leading-tight">
              Empowering India to <span className="text-[#e64833]">Run, Rise & Triumph</span>
            </h1>
            <p className="mt-5 text-sm sm:text-base lg:text-lg text-zinc-300 leading-relaxed font-normal">
              RunnerUp was created with a single vision: to bring the thrill, celebration, and tangible prestige of marathon running to every runner in India, regardless of location, schedule, or experience.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-[#90aead]/20 bg-[#172c34]/80 p-5 sm:p-6 text-center backdrop-blur-sm shadow-lg hover:border-[#e64833]/50 transition-colors"
              >
                <div className="font-display font-black text-2xl sm:text-4xl text-[#fbe9d0]">
                  {s.val}
                </div>
                <div className="mt-1 text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-400">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Our Story & Mission */}
          <div className="mt-16 sm:mt-24 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5 text-zinc-300 leading-relaxed text-sm sm:text-base">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#e64833]">
                Our Philosophy
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl uppercase text-white tracking-tight">
                Why Virtual Running Matters
              </h2>
              <p>
                Traditional in-person races are incredible, but they require expensive travel, strict weekend mornings, and are primarily limited to top tier-1 metropolitan cities like Mumbai, Delhi, or Bengaluru.
              </p>
              <p>
                RunnerUp breaks geographical barriers. Whether you are pounding the pavement in Pune, training on hill roads in Dehradun, running through coastal tracks in Kerala, or logging treadmill sessions after work, your effort deserves authentic recognition.
              </p>
              <div className="pt-2 space-y-2.5">
                {[
                  "No 4:00 AM commute or crowded start lines",
                  "Pick any route: parks, roads, tracks, or treadmill",
                  "Full flexibility to run anytime during the race window",
                  "Direct courier delivery of your heavyweight medal kit",
                ].map((point) => (
                  <div key={point} className="flex items-center gap-2.5 text-zinc-200 text-xs sm:text-sm font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-[#e64833] shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden border border-[#90aead]/25 bg-[#172c34] p-6 sm:p-8 shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Compass className="h-48 w-48 text-[#e64833]" />
              </div>
              <div className="relative z-10 space-y-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e64833]/15 border border-[#e64833]/30 px-3 py-1 text-xs font-bold text-[#e64833]">
                  The Finisher Experience
                </span>
                <h3 className="font-display font-black text-xl sm:text-2xl text-white uppercase">
                  A Medal Worth Sweating For
                </h3>
                <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                  We believe that when you push past fatigue and cross the finish line, your reward should be something you can proudly hold in your hands, hang on your medal rack, and show to your family.
                </p>
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold text-sm">Solid Cast Metal</div>
                    <div className="text-zinc-400 text-xs">Standard across all events</div>
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">QR Verifiable</div>
                    <div className="text-zinc-400 text-xs">Permanent Hall of Fame</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Core Pillars Grid */}
          <div className="mt-20 sm:mt-28">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#e64833]">
                Built For Athletes
              </span>
              <h2 className="mt-2 font-display font-black text-2xl sm:text-4xl uppercase text-white tracking-tight">
                What Sets RunnerUp Apart
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {pillars.map((p) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.title}
                    className="rounded-2xl border border-[#90aead]/20 bg-[#172c34]/70 p-6 backdrop-blur-sm shadow-md hover:border-[#e64833]/60 hover:shadow-xl transition-all duration-300 flex flex-col"
                  >
                    <div className="h-12 w-12 rounded-xl bg-[#e64833]/15 border border-[#e64833]/30 flex items-center justify-center text-[#e64833] mb-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-display font-bold text-lg text-white mb-2">
                      {p.title}
                    </h3>
                    <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed flex-1">
                      {p.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Call to Action */}
          <div className="mt-20 sm:mt-28 rounded-3xl border border-[#e64833]/40 bg-gradient-to-r from-[#172c34] via-[#1b323b] to-[#172c34] p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 bg-[radial-gradient(circle,_rgba(230,72,51,0.3),transparent_70%)]"
            />
            <h2 className="font-display font-black text-2xl sm:text-4xl uppercase text-white tracking-tight">
              Ready to Claim Your Next Finisher Medal?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-zinc-300 max-w-xl mx-auto">
              Join upcoming virtual challenges, choose your distance (1.5K, 5K, 10K, 21K), and begin your journey today.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 rounded-xl bg-[#e64833] px-7 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#c93a26]"
              >
                <span>Browse Active Events</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/leaderboard"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/10"
              >
                <span>View Leaderboard</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
