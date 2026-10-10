import type { Metadata } from "next";
import { PageShell } from "../components/app-shell";
import { EventsCatalog } from "./events-catalog";
import { publicEvents } from "../data/events";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://runnerup.in";

export const metadata: Metadata = {
  title: "Upcoming Virtual Running Events India 2026 | 5K, 10K, 21K Races — RunnerUp",
  description:
    "Explore and register for upcoming virtual running events across India. Complete 1.5K, 5K, 10K, or 21K half marathons from anywhere. GPS verification, custom metal medals, DRI-FIT t-shirts, and instant E-certificates.",
  keywords: [
    "virtual running events",
    "virtual running events india",
    "online marathon India",
    "indian air force day virtual run 2026",
    "iaf day virtual challenge",
    "5K run events india",
    "10K run events india",
    "half marathon virtual 2026",
    "running races India",
    "GPS verified runs",
    "virtual race registration",
    "virtual marathon with medal",
    "metal finisher medal",
    "strava virtual marathon india",
  ],
  openGraph: {
    title: "Upcoming Virtual Running Events India 2026 | 5K, 10K, 21K Races — RunnerUp",
    description:
      "Explore and register for upcoming virtual running events across India. GPS verification, custom medals & instant certificates.",
    url: `${SITE_URL}/events`,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "RunnerUp Upcoming Virtual Running Events",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Upcoming Virtual Running Events India 2026 | RunnerUp",
    description:
      "Join India's premier virtual running events. Run anywhere with Strava/Garmin, earn authentic metal finisher medals and digital certificates.",
    images: [`${SITE_URL}/og-image.png`],
  },
  alternates: {
    canonical: `${SITE_URL}/events`,
  },
};

export const revalidate = 60;

export default function EventsPage() {
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Upcoming Virtual Running Events India 2026",
    description:
      "Comprehensive catalogue of open virtual running and cycling challenges across India with authentic finisher medals.",
    url: `${SITE_URL}/events`,
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
        name: "Virtual Running Events",
        item: `${SITE_URL}/events`,
      },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Upcoming Virtual Running Challenges",
    itemListElement: publicEvents.map((evt, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: evt.name,
      url: `${SITE_URL}/events/${evt.slug}`,
      image: evt.bannerImageUrl?.startsWith("http")
        ? evt.bannerImageUrl
        : `${SITE_URL}${evt.bannerImageUrl || "/og-image.png"}`,
    })),
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <div className="relative min-w-0 bg-[#14242a] pt-24 sm:pt-28">
        <EventsCatalog />
      </div>
    </PageShell>
  );
}
