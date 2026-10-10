import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  MapPin,
  Clock,
  Award,
  ShieldCheck,
  ArrowRight,
  Users,
  Smartphone,
  CheckCircle2,
  HelpCircle,
  Activity,
} from "lucide-react";
import { PageShell } from "../components/app-shell";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://runnerup.in";

export const metadata: Metadata = {
  title: "What is a Virtual Run? | How It Works & Guide | RunnerUp",
  description:
    "Learn how virtual running challenges work. Run anywhere, anytime at your own pace using any fitness tracking app, and earn authentic physical medals and verified certificates delivered to your doorstep.",
  keywords: [
    "what is a virtual run",
    "virtual run",
    "virtual run India",
    "virtual marathon",
    "virtual marathon India",
    "online marathon",
    "online marathon India",
    "virtual race India",
    "virtual running event",
    "virtual running events India",
    "virtual running events 2026",
    "online running event",
    "virtual fitness challenge India",
    "5K virtual run with medal",
    "10K virtual run with medal",
    "21K virtual run with medal",
    "half marathon virtual run",
    "virtual run medal India",
    "finisher medal India",
    "virtual run with t shirt",
    "virtual run certificate",
    "virtual run registration India",
    "strava virtual marathon",
    "garmin running events india",
    "nike run club virtual race",
    "virtual run for beginners",
    "virtual run for women",
    "virtual run with free delivery",
  ],
  openGraph: {
    title: "What is a Virtual Run? | How It Works & Guide | RunnerUp",
    description:
      "Join India's premier virtual running events and marathons. Run anywhere with Strava/Garmin, earn authentic heavy metal finisher medals, custom t-shirts, and verified digital certificates with free delivery across India.",
    url: `${SITE_URL}/what-is-virtual-run`,
    siteName: "RunnerUp",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "What is a Virtual Run - RunnerUp Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "What is a Virtual Run? | RunnerUp Guide",
    description:
      "Learn how virtual runs work in India. Run at your own pace, track with Strava/Garmin, and receive solid metal medals at home.",
    images: [`${SITE_URL}/og-image.png`],
  },
  alternates: {
    canonical: `${SITE_URL}/what-is-virtual-run`,
  },
};

const guideFaqs = [
  {
    q: "Do I have to run in a specific location or route?",
    a: "No! You can run anywhere across India or globally — your neighborhood streets, a nearby park, running track, or indoor treadmill at your gym.",
  },
  {
    q: "Can I walk or jog instead of running?",
    a: "Yes, absolutely. We welcome all paces and fitness levels. Whether you walk, power walk, jog, or run, completing the distance is what counts.",
  },
  {
    q: "Can I complete my distance over multiple sessions or days?",
    a: "Yes. For longer cumulative distances (like 10 KM, 21 KM, or monthly challenges), you can split your runs across the event window and submit your combined timing proof.",
  },
  {
    q: "How and when will my physical medal be delivered?",
    a: "Once your activity screenshot is reviewed and approved by our timing team, your custom engraved medal and finisher badge are dispatched via Delhivery Express or Shiprocket with live tracking within 3 to 7 business days.",
  },
  {
    q: "Is there a fixed date or specific start time?",
    a: "No fixed morning timing! You have the complete event window to run at whatever time fits your daily routine.",
  },
  {
    q: "Is my certificate authentic and verifiable?",
    a: "Yes. Every finisher receives an official RunnerUp Certificate of Achievement containing a unique Certificate ID and verifiable QR code that anyone can scan to verify your achievement on runnerup.in.",
  },
];

export default function WhatIsVirtualRunPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guideFaqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
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
        name: "What is a Virtual Run?",
        item: `${SITE_URL}/what-is-virtual-run`,
      },
    ],
  };

  const steps = [
    {
      num: "01",
      icon: Users,
      title: "Choose & Register",
      desc: "Select any open virtual challenge and pick your target distance — from 1.5 KM, 3 KM, 5 KM, 10 KM, to 21 KM Half Marathon.",
    },
    {
      num: "02",
      icon: MapPin,
      title: "Run Anywhere, Anytime",
      desc: "Complete your chosen distance wherever you prefer: around your neighborhood, at a local park, on a treadmill, or on an open road.",
    },
    {
      num: "03",
      icon: Smartphone,
      title: "Track with Any App",
      desc: "Record your activity using your favorite GPS app like Strava, Nike Run Club, Garmin, Apple Health, Google Fit, or your smartwatch.",
    },
    {
      num: "04",
      icon: Award,
      title: "Get Medal & Certificate",
      desc: "Upload a screenshot of your finished run. Instantly receive your verified e-certificate, followed by an authentic heavy metal finisher medal delivered to your home.",
    },
  ];

  const apps = [
    "Strava",
    "Nike Run Club",
    "Garmin Connect",
    "Apple Fitness",
    "Google Fit",
    "Adidas Running",
    "Samsung Health",
    "Coros & Smartwatches",
    "Treadmill Console",
  ];

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="relative min-w-0 bg-[#14242a] pt-24 pb-20 text-[#fcf8f2]">
        {/* Glow backdrop */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,_rgba(230,72,51,0.2),transparent_70%)]"
        />

        {/* Hero Section */}
        <section className="container-page max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10 pt-4 sm:pt-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#90aead]/30 bg-[#172c34]/90 px-4 py-1.5 shadow-sm mb-6">
            <Sparkles className="h-3.5 w-3.5 text-[#e64833]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#fbe9d0]">
              Beginner &amp; Runner Guide
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white uppercase">
            What is a <span className="text-[#e64833]">Virtual Run</span>?
          </h1>

          <p className="mt-5 text-base sm:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed font-normal">
            A real running challenge without geographical limits. You run at your own pace, in your own city, on your own schedule — and earn genuine physical medals and verified credentials.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs sm:text-sm font-semibold">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#172c34] px-3.5 py-2 text-zinc-200">
              <MapPin className="h-4 w-4 text-[#e64833]" /> Anywhere in India
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#172c34] px-3.5 py-2 text-zinc-200">
              <Clock className="h-4 w-4 text-amber-400" /> Any Time &amp; Pace
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#172c34] px-3.5 py-2 text-zinc-200">
              <Award className="h-4 w-4 text-emerald-400" /> Real Solid Medal
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#172c34] px-3.5 py-2 text-zinc-200">
              <ShieldCheck className="h-4 w-4 text-sky-400" /> Verified Certificate
            </span>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-xl bg-[#e64833] px-7 py-3 text-sm font-black uppercase tracking-wider text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#c93a26]"
            >
              <span>Browse Open Events</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/10"
            >
              <span>View Finisher Medals</span>
            </Link>
          </div>
        </section>

        {/* 4 Steps Section */}
        <section className="mt-20 sm:mt-24 border-y border-white/10 bg-[#172c34]/50 py-16 sm:py-20">
          <div className="container-page max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#e64833]">
                Simple Process
              </span>
              <h2 className="mt-2 font-display font-black text-2xl sm:text-4xl uppercase text-white tracking-tight">
                How a Virtual Run Works in 4 Steps
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-zinc-300">
                No crowd stress, no travel expenses. Just you, your running shoes, and your personal goal.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.num}
                    className="rounded-2xl border border-white/10 bg-[#14242a] p-6 shadow-lg flex flex-col justify-between hover:border-[#e64833]/50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e64833]/15 text-[#e64833]">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="font-mono text-sm font-black text-zinc-500">
                          {s.num}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white leading-snug">
                        {s.title}
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Supported Apps */}
        <section className="py-16 sm:py-20 container-page max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e64833]/15 text-[#e64833] mb-3">
            <Smartphone className="h-5 w-5" />
          </div>
          <h2 className="font-display font-black text-2xl sm:text-4xl uppercase text-white tracking-tight">
            Use Any Fitness Tracking App
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto mt-2.5">
            You don&apos;t need proprietary hardware or special tracking devices. Any app or smartwatch that shows your distance, time, and date is accepted.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 max-w-2xl mx-auto">
            {apps.map((app) => (
              <div
                key={app}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#172c34] px-4 py-2 text-xs font-semibold text-zinc-200 shadow-sm"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-[#e64833]" />
                <span>{app}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 sm:py-20 border-t border-white/10 bg-[#172c34]/30">
          <div className="container-page max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 mb-2">
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Common Questions</span>
              </div>
              <h2 className="font-display font-black text-2xl sm:text-4xl uppercase text-white tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2">
                Clear answers to the most common questions from first-time participants.
              </p>
            </div>

            <div className="space-y-4">
              {guideFaqs.map((faq, idx) => (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-white/10 bg-[#14242a] p-5 shadow-sm"
                >
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-start gap-2.5">
                    <span className="text-[#e64833] font-mono text-xs mt-0.5 font-black shrink-0">
                      Q{idx + 1}.
                    </span>
                    <span>{faq.q}</span>
                  </h3>
                  <p className="mt-2.5 text-xs sm:text-sm text-zinc-300 leading-relaxed pl-6">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 sm:py-20 container-page max-w-4xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-[#e64833]/40 bg-gradient-to-br from-[#172c34] via-[#1b323b] to-[#172c34] p-8 sm:p-12 shadow-2xl text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e64833]/20 text-[#e64833] mb-4 shadow-sm">
              <Activity className="h-6 w-6" />
            </div>
            <h2 className="font-display font-black text-2xl sm:text-4xl uppercase text-white tracking-tight">
              Ready to Start Your Virtual Run Challenge?
            </h2>
            <p className="mt-3 text-xs sm:text-base text-zinc-300 max-w-xl mx-auto leading-relaxed">
              Join thousands of runners across India. Choose your event, run at your pace, and earn your physical medal.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 rounded-xl bg-[#e64833] px-7 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#c93a26]"
              >
                <span>Explore Active Events</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/leaderboard"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/10"
              >
                <span>View Leaderboard</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
