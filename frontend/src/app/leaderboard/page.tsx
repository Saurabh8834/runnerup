import { Suspense } from "react";
import type { Metadata } from "next";
import { PageShell } from "../components/app-shell";
import { LeaderboardClient, type InitialLeaderboardData } from "./leaderboard-client";

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://runnerup.in";

async function getInitialLeaderboard(): Promise<InitialLeaderboardData | undefined> {
  const defaultSlug = "national-cancer-awareness-day-virtual-run-2026";
  const defaultDist = "3 km";
  const distQuery = `?distance=${encodeURIComponent(defaultDist)}`;

  const isDev = process.env.NODE_ENV !== "production";
  const endpoints = isDev
    ? [`http://127.0.0.1:4000/api/registrations/leaderboard/${defaultSlug}${distQuery}`]
    : [
        `https://www.runnerup.in/api/registrations/leaderboard/${defaultSlug}${distQuery}`,
        `https://runnerup-production.up.railway.app/api/registrations/leaderboard/${defaultSlug}${distQuery}`,
        `https://api.runnerup.in/api/registrations/leaderboard/${defaultSlug}${distQuery}`,
      ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        next: { revalidate: 60 },
        headers: { Accept: "application/json" },
        cache: "force-cache",
      });
      if (!res.ok) continue;
      const json = await res.json();
      if (json && (json.success || Array.isArray(json.data)) && Array.isArray(json.data) && json.data.length > 0) {
        return {
          entries: json.data,
          participants: json.participants || [],
          userRegistrations: json.userRegistrations || [],
          availableDistances: json.meta?.availableDistances || ["1.5 km", "1.6 km", "3 km", "5 km", "10 km", "21 km"],
          selectedSlug: defaultSlug,
          selectedDistance: defaultDist,
        };
      }
    } catch {
      // try next resilient fallback
    }
  }
  return undefined;
}

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
    url: `${SITE_URL}/leaderboard`,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "RunnerUp Official Virtual Marathon Leaderboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Official Virtual Run Leaderboard | RunnerUp",
    description: "View live GPS-verified virtual running rankings and times across India.",
    images: [`${SITE_URL}/og-image.png`],
  },
  alternates: {
    canonical: `${SITE_URL}/leaderboard`,
  },
};

export default async function LeaderboardPage() {
  const initialData = await getInitialLeaderboard();

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
      <div className="relative min-w-0 bg-[#080c10] text-[#f8fafc]">
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-3 border-white/20 border-t-[#ff4b26]" />
              <p className="mt-4 text-sm font-bold uppercase tracking-wider text-slate-300">Loading live leaderboard...</p>
            </div>
          }
        >
          <LeaderboardClient initialData={initialData} />
        </Suspense>
      </div>
    </PageShell>
  );
}

