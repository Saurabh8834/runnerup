import { Suspense } from "react";
import type { Metadata } from "next";
import { PageShell } from "../components/app-shell";
import { LeaderboardClient } from "./leaderboard-client";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://runnerup.in";

export const metadata: Metadata = {
  title: "Official Virtual Run Leaderboard & Finish Times | RunnerUp India",
  description:
    "View live GPS-verified virtual running leaderboards, finisher rankings, pace, and race stats for 5K, 10K, and 21K marathon challenges across India.",
  keywords: [
    "running leaderboard",
    "verified results",
    "GPS rankings",
    "virtual race results",
    "marathon leaderboard",
    "running rankings India",
    "virtual marathon winners",
  ],
  openGraph: {
    title: "Official Virtual Run Leaderboard & Finish Times | RunnerUp India",
    description:
      "View live GPS-verified running results and rankings from RunnerUp events.",
    url: "/leaderboard",
    type: "website",
  },
  alternates: {
    canonical: `${SITE_URL}/leaderboard`,
  },
};

export default function LeaderboardPage() {
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
        name: "Official Leaderboard",
        item: `${SITE_URL}/leaderboard`,
      },
    ],
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="relative min-w-0 bg-[#fbf6ee]">
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#90aead]/30 border-t-[#e64833]" />
              <p className="mt-4 text-sm font-bold uppercase tracking-wider text-[#244855]">Loading live leaderboard...</p>
            </div>
          }
        >
          <LeaderboardClient />
        </Suspense>
      </div>
    </PageShell>
  );
}

