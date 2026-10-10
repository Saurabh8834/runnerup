import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { PageShell } from "../../components/app-shell";
import { allPublicEvents } from "../../data/events";
import { fetchEventBySlug } from "../../../lib/events-api";
import { EventHero } from "./event-hero";
import { EventStats } from "./event-stats";
import { EventWhy } from "./event-why";
import { EventRewards } from "./event-rewards";
import { EventHow } from "./event-how";
import { EventSelect } from "./event-select";
import { EventCompare } from "./event-compare";
import { EventCommunity } from "./event-community";
import { EventReviews } from "./event-reviews";
import { EventCta } from "./event-cta";
import { EventFaq } from "./faq-accordion";
import { EventStickyCta } from "./sticky-cta-bar";
import { Reveal, SectionHeader } from "./reveal";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://runnerup.in";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await fetchEventBySlug(slug);
  if (!event) return { title: "Event Not Found" };

  const isPast = event.status === "past";
  const metaTitle = `${event.name} - ${event.distance} Virtual Run | RunnerUp`;
  const metaDescription = isPast
    ? `View results and recap for ${event.name}. ${event.finishers ?? 0} finishers, ${event.verifiedResults ?? 0} verified GPS results from across India.`
    : `Register for ${event.name} - a ${event.distance} virtual running event. GPS verification, medals, certificates, and leaderboard. Entry: ${event.price}.`;

  const ogImageUrl = event.bannerImageUrl
    ? event.bannerImageUrl.startsWith("http")
      ? event.bannerImageUrl
      : `${SITE_URL}${event.bannerImageUrl.startsWith("/") ? "" : "/"}${event.bannerImageUrl}`
    : `${SITE_URL}/og-image.png`;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: [
      event.name,
      event.distance,
      "virtual run",
      "GPS verified",
      "running event",
      "marathon",
      "5K run",
      "10K run",
      "half marathon",
      "virtual race India",
      "finisher medal india",
      "strava running challenge",
      "running medal delivery india",
    ],
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: `${SITE_URL}/events/${slug}`,
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${event.name} Finisher Medal & Virtual Run`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [ogImageUrl],
    },
    alternates: { canonical: `${SITE_URL}/events/${slug}` },
  };
}

export function generateStaticParams() {
  return allPublicEvents.map((event) => ({ slug: event.slug }));
}

export const dynamicParams = true;
export const revalidate = 60;

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await fetchEventBySlug(slug);
  if (!event) notFound();

  const isPast = event.status === "past";

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
        name: "Virtual Running Events",
        item: `${SITE_URL}/events`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: event.name,
        item: `${SITE_URL}/events/${slug}`,
      },
    ],
  };

  const sportsEventSchema = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: event.name,
    description: event.description || event.highlight,
    url: `${SITE_URL}/events/${slug}`,
    image: event.bannerImageUrl
      ? event.bannerImageUrl.startsWith("http")
        ? event.bannerImageUrl
        : `${SITE_URL}${event.bannerImageUrl.startsWith("/") ? "" : "/"}${event.bannerImageUrl}`
      : `${SITE_URL}/og-image.png`,
    startDate: event.date,
    location: {
      "@type": "VirtualLocation",
      url: `${SITE_URL}/events/${slug}`,
      name: "Online / Virtual (Pan-India)",
    },
    organizer: {
      "@type": "Organization",
      name: "RunnerUp",
      url: SITE_URL,
      logo: `${SITE_URL}/logo-mark.svg`,
    },
    offers: {
      "@type": "Offer",
      price: event.price.replace(/[^\d]/g, ""),
      priceCurrency: "INR",
      url: `${SITE_URL}/events/${slug}`,
      availability: isPast ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      validFrom: "2026-01-01",
    },
    eventStatus: isPast ? "https://schema.org/EventMovedOnline" : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
  };

  const eventFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How do I participate in ${event.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Register on RunnerUp, choose your distance (${event.distance}), run using any GPS tracking app (Strava, Nike, Garmin), and upload your activity screenshot to claim your medal and certificate.`,
        },
      },
      {
        "@type": "Question",
        name: `When will I receive my finisher medal for ${event.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Finisher medals and performance t-shirts are dispatched to your registered postal address via tracked courier within 7-10 business days after your GPS run proof is verified.",
        },
      },
      {
        "@type": "Question",
        name: "Can I run on a treadmill or outdoors?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, you can run outdoors with any GPS app or on a treadmill (by uploading a clear photo of the treadmill console showing total distance and elapsed time).",
        },
      },
    ],
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsEventSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventFaqSchema) }}
      />

      <div className="event-classic">
        {isPast ? (
          <>
            <EventHero event={event} isPast />
            <EventStats />
            <EventCommunity />
            <EventReviews />

            <section
              className="section relative overflow-hidden"
              style={{
                background:
                  "radial-gradient(ellipse 70% 60% at 50% 0%, color-mix(in srgb, var(--sage) 10%, transparent) 0%, transparent 60%), var(--background)",
              }}
            >
              <div className="container-page text-center">
                <Reveal>
                  <div className="mx-auto flex max-w-2xl flex-col items-center gap-5">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-(--line) bg-(--panel) px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-(--muted)">
                      <Sparkles className="h-3.5 w-3.5 text-(--sage)" />
                      {event.name} - finished
                    </span>
                    <h2 className="heading text-(--foreground)">{event.name} recap</h2>
                    <p className="lede max-w-lg">{event.highlight}</p>
                    <Link className="btn btn-gold gap-2 text-sm" href="/events">
                      Join the next event
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </Reveal>
              </div>
            </section>
          </>
        ) : (
          <>
            <EventHero event={event} isPast={false} />
            <EventSelect event={event} />
            <EventStats />
            <EventWhy />
            <EventRewards event={event} />
            <EventHow event={event} />
            <EventCompare />
            <EventCommunity />
            <EventReviews />

            <section className="section border-b border-(--line)">
              <div className="container-page">
                <SectionHeader
                  eyebrow="Questions"
                  title={
                    <>
                      Everything you need to <span className="text-gradient-premium">know</span>
                    </>
                  }
                  lead="If it's not covered here, our team is one WhatsApp message away."
                />
                <div className="mt-10 sm:mt-14">
                  <EventFaq />
                </div>
              </div>
            </section>

            <EventCta event={event} />
            <EventStickyCta price={event.price} compareAtPrice={event.compareAtPrice} slug={event.slug} eventName={event.name} />
          </>
        )}
      </div>
    </PageShell>
  );
}
