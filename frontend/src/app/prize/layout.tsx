import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://runnerup.in";

export const metadata: Metadata = {
  title: "Track Your Race Prizes & Finisher Rewards | RunnerUp India",
  description:
    "Track the live delivery and dispatch status of your official RunnerUp finisher medals, DRI-FIT t-shirts, verified certificates, and event rewards using your race bib number.",
  keywords: [
    "track race prize",
    "runnerup prize tracker",
    "finisher medal tracking",
    "virtual marathon rewards",
    "bib number tracking",
    "running medal dispatch status",
  ],
  openGraph: {
    title: "Track Your Race Prizes & Finisher Rewards | RunnerUp India",
    description:
      "Enter your bib number to check real-time courier tracking and status for your finisher medals and certificates.",
    url: `${SITE_URL}/prize`,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Track RunnerUp Finisher Prizes & Medals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Track Race Prizes | RunnerUp India",
    description: "Check the status of your finisher medal and certificates.",
    images: [`${SITE_URL}/og-image.png`],
  },
  alternates: {
    canonical: `${SITE_URL}/prize`,
  },
};

export default function PrizeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
