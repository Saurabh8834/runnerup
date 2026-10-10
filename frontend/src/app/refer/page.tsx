import type { Metadata } from "next";
import { PageShell } from "../components/app-shell";
import { ReferClient } from "./refer-client";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://runnerup.in";

export const metadata: Metadata = {
  title: "Refer & Earn | Invite Friends to RunnerUp Virtual Runs",
  description:
    "Invite your friends, running partners, and family to RunnerUp virtual running events. Earn discounts and exclusive rewards for every friend who registers.",
  keywords: [
    "refer and earn running",
    "runnerup referral program",
    "virtual marathon discount",
    "running rewards india",
    "invite friends running",
  ],
  openGraph: {
    title: "Refer & Earn | RunnerUp Virtual Running Rewards",
    description:
      "Invite friends to run and earn discounts on upcoming virtual marathons and medals.",
    url: `${SITE_URL}/refer`,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "RunnerUp Refer & Earn Program",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Refer & Earn | RunnerUp",
    description: "Earn rewards by inviting friends to virtual runs across India.",
    images: [`${SITE_URL}/og-image.png`],
  },
  alternates: {
    canonical: `${SITE_URL}/refer`,
  },
};

export default function ReferPage() {
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
        name: "Refer & Earn",
        item: `${SITE_URL}/refer`,
      },
    ],
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="relative min-w-0 bg-[#14242a] pt-20 sm:pt-24">
        <ReferClient />
      </div>
    </PageShell>
  );
}
