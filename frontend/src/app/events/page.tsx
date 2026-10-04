import type { Metadata } from "next";
import { PageShell } from "../components/app-shell";
import { EventsCatalog } from "./events-catalog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://runnerup.in";

export const metadata: Metadata = {
  title: "Upcoming Virtual Running Events India 2026 | 5K, 10K, 21K Races — RunnerUp",
  description:
    "Explore and register for upcoming virtual running events across India. Complete 1.5K, 5K, 10K, or 21K half marathons from anywhere. GPS verification, custom metal medals, DRI-FIT t-shirts, and instant E-certificates.",
  keywords: [
    "virtual running events",
    "virtual running events india",
    "online marathon India",
    "5K run events",
    "10K run events",
    "half marathon virtual",
    "running races India",
    "GPS verified runs",
    "virtual race registration",
    "virtual marathon 2026",
  ],
  openGraph: {
    title: "Upcoming Virtual Running Events India 2026 | 5K, 10K, 21K Races — RunnerUp",
    description:
      "Explore and register for upcoming virtual running events across India. GPS verification, custom medals & instant certificates.",
    url: "/events",
    type: "website",
  },
  alternates: {
    canonical: `${SITE_URL}/events`,
  },
};

export default function EventsPage() {
  return (
    <PageShell>
      <div className="relative min-w-0 bg-[#14242a] pt-24 sm:pt-28">
        <EventsCatalog />
      </div>
    </PageShell>
  );
}
