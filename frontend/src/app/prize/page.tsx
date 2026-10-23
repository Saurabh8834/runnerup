import type { Metadata } from "next";
import { PageShell } from "../components/app-shell";
import { PrizeSearchClient } from "./prize-client";

export const dynamic = "force-static";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://runnerup.in";

export const metadata: Metadata = {
  title: "Track Medals & Prizes | RunnerUp Delivery Status India",
  description:
    "Track your finisher medal courier delivery, bib status, and download verified digital running certificates using your bib number, email, or mobile number.",
  keywords: [
    "track medal delivery",
    "runnerup prize tracking",
    "virtual marathon medal tracking",
    "track runnerup bib",
    "runnerup certificate download",
    "running medal delivery status",
    "courier tracking runnerup",
  ],
  openGraph: {
    title: "Track Medals & Prizes | RunnerUp Delivery Status India",
    description:
      "Check real-time dispatch and delivery status of your RunnerUp solid metal finisher medal and verified e-certificate.",
    url: `${SITE_URL}/prize`,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Track RunnerUp Finisher Medals & Prizes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Track Medals & Prizes | RunnerUp",
    description:
      "Check real-time delivery status for your metal finisher medals and certificates.",
    images: [`${SITE_URL}/og-image.png`],
  },
  alternates: {
    canonical: `${SITE_URL}/prize`,
  },
};

export default function PrizeSearchPage() {
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
        name: "Track Prizes & Medals",
        item: `${SITE_URL}/prize`,
      },
    ],
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PrizeSearchClient />
    </PageShell>
  );
}
