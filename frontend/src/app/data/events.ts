export const eventBenefits = [
  "Verified race entry",
  "Official Digital Race Bib",
  "GPS proof verification",
  "Public leaderboard ranking",
  "Real finisher certificate",
  "Finisher medal delivery",
  "Event merch and T-shirt options",
  "Email and WhatsApp updates",
];

export type PublicEvent = {
  name: string;
  slug: string;
  date: string;
  distance: string;
  price: string;
  description: string;
  highlight: string;
  banner: string;
  bannerImageUrl?: string;
  medalImageUrl?: string;
  reward: string;
  status: "upcoming" | "past" | "closed";
  couponCode?: string;
  showCouponOnCard?: boolean;
  activityTypes?: string[];
  benefits?: string[];
  /** Past-event recap stats */
  finishers?: number;
  verifiedResults?: number;
  cities?: number;
  resultNote?: string;
  /** ISO date range for countdown / urgency (API-driven events) */
  startsAt?: string;
  endsAt?: string;
  /** Strikethrough "MRP" shown next to the entry fee for open events */
  compareAtPrice?: string;
  /** Live registration count when available from the API */
  registrations?: number;
};

export const allPublicEvents: PublicEvent[] = [
  {
    name: "Indian Air Force Day Virtual Challenge 2026",
    slug: "indian-air-force-day-virtual-challenge",
    date: "25-30 October 2026",
    distance: "1.5 km / 3 km / 5 km / 10 km / 21 km",
    price: "Rs. 499",
    description:
      "🇮🇳 Indian Air Force Day Virtual Run 2026 ✈️\n\nRun with courage, rise with pride, and salute the heroes who guard our skies. Every kilometre is a tribute to their bravery and dedication.\n\nRun for Glory. Run for India. Jai Hind! 🇮🇳",
    highlight: "Salute the Air Warriors · Run, Walk or Ride on 25–30 Oct",
    banner: "Air Force Day Virtual Challenge",
    bannerImageUrl: "/images/iaf-medal-front.webp",
    medalImageUrl: "/images/iaf-medal-front.webp",
    reward: "100% Solid Metal Finisher Medal + Digital Race Bib + E-Certificate",
    couponCode: "LAST50",
    status: "closed",
    compareAtPrice: "Rs. 549",
    activityTypes: ["running", "cycling", "walking"],
    startsAt: "2026-10-25T00:00:00.000Z",
    endsAt: "2026-10-30T23:59:59.000Z",
    benefits: [
      "100% Solid Metal Finisher Medal Included",
      "Official Digital Race Bib with Unique Number",
      "Free doorstep delivery across India",
      "Works with Strava, Garmin, NRC",
      "Official Verifiable E-Certificate",
      "Live GPS-Verified Leaderboard Ranking",
    ],
  },

  {
    name: "Independence Day Virtual Run 2026 🇮🇳",
    slug: "independence-day-virtual-run-2026",
    date: "15-20 Aug 2026",
    distance: "1.5 km / 3 km / 5 km / 10 km / 15 km / 20 km / 25 km / 30 km",
    price: "Rs. 349",
    description:
      "Celebrate India's Independence Day by running from anywhere in the country. Complete your chosen distance at your own pace during the event window. Every finisher receives an official digital certificate, premium finisher medal, exclusive event T-shirt and exciting goodies.",
    highlight: "Flagship virtual run with official finisher medals and e-certificates.",
    banner: "Flagship run",
    bannerImageUrl: "/events/independence-day-virtual-run-2026.webp",
    medalImageUrl: "/images/medals/independence-day-virtual-run-2026.webp",
    reward: "Premium medal + T-shirt + certificate",
    status: "past",
    compareAtPrice: "Rs. 699",
    startsAt: "2026-08-15T00:00:00.000Z",
    endsAt: "2026-08-20T23:59:59.000Z",
  },
  {
    name: "Monsoon Mountain Miles",
    slug: "monsoon-mountain-miles",
    date: "11-17 Jul 2026",
    distance: "3 km / 5 km / 10 km / 21 km",
    price: "Rs. 499",
    description:
      "A clean virtual mountain challenge with verified finishes, certificates, leaderboard rank, and medal delivery.",
    highlight: "Ideal for first virtual races and running clubs.",
    banner: "Rain-ready challenge",
    bannerImageUrl: "/events/monsoon-mountain-miles.webp",
    medalImageUrl: "/images/medals/monsoon-mountain-miles.webp",
    reward: "Medal + certificate",
    status: "past",
    compareAtPrice: "Rs. 850",
    startsAt: "2026-07-11T00:00:00.000Z",
    endsAt: "2026-07-17T23:59:59.000Z",
  },
  {
    name: "Independence Endurance Run",
    slug: "independence-endurance-run",
    date: "10-16 Aug 2026",
    distance: "5 km / 10 km / 25 km",
    price: "Rs. 649",
    description:
      "A pan-India endurance event with longer distance options, fair ranking, and premium finisher rewards.",
    highlight: "Built for runners chasing a longer verified effort.",
    banner: "Flagship endurance week",
    bannerImageUrl: "/events/independence-endurance-run.webp",
    medalImageUrl: "/images/medals/independence-endurance-run.webp",
    reward: "Premium medal + T-shirt",
    status: "past",
    compareAtPrice: "Rs. 1100",
    startsAt: "2026-08-10T00:00:00.000Z",
    endsAt: "2026-08-16T23:59:59.000Z",
  },
  {
    name: "Himalayan Winter Sprint",
    slug: "himalayan-winter-sprint",
    date: "5-9 Dec 2025",
    distance: "2 km / 5 km / 10 km",
    price: "Rs. 399",
    description:
      "A short winter sprint for beginners and families who want a simple, polished finish-line experience.",
    highlight: "Quick, beginner-friendly participation.",
    banner: "Fast festive sprint",
    bannerImageUrl: "/events/himalayan-winter-sprint.webp",
    medalImageUrl: "/images/medals/himalayan-winter-sprint.webp",
    reward: "Digital kit + medal",
    status: "past",
    compareAtPrice: "Rs. 700",
    startsAt: "2025-12-05T00:00:00.000Z",
    endsAt: "2025-12-09T23:59:59.000Z",
  },
  {
    name: "Spring Valley Dash",
    slug: "spring-valley-dash",
    date: "14-20 Mar 2026",
    distance: "3 km / 5 km / 10 km",
    price: "Rs. 449",
    description:
      "A spring season virtual dash with city-wide participation, GPS proof checks, and finisher medals shipped nationwide.",
    highlight: "Completed · Strong beginner turnout across 40+ cities.",
    banner: "Season opener",
    bannerImageUrl: "/events/spring-valley-dash.webp",
    medalImageUrl: "/images/medals/spring-valley-dash.webp",
    reward: "Medal + certificate",
    status: "past",
    finishers: 1842,
    verifiedResults: 1620,
    cities: 48,
    resultNote:
      "This event is closed. Browse the recap below or open an upcoming race to register.",
    startsAt: "2026-03-14T00:00:00.000Z",
    endsAt: "2026-03-20T23:59:59.000Z",
  },
  {
    name: "Holi Color Virtual Run",
    slug: "holi-color-virtual-run",
    date: "5-9 Mar 2026",
    distance: "2 km / 5 km",
    price: "Rs. 349",
    description:
      "A festive family-friendly virtual run celebrating Holi with digital kits, fun finish photos, and verified 2 km and 5 km results.",
    highlight: "Completed · Festival favorite for clubs and first-timers.",
    banner: "Festival run",
    bannerImageUrl: "/events/holi-color-virtual-run.webp",
    medalImageUrl: "/images/medals/holi-color-virtual-run.webp",
    reward: "Digital kit + medal",
    status: "past",
    finishers: 2560,
    verifiedResults: 2314,
    cities: 62,
    resultNote:
      "Registration is closed. View what finishers received, then join the next open event.",
    startsAt: "2026-03-05T00:00:00.000Z",
    endsAt: "2026-03-09T23:59:59.000Z",
  },
  {
    name: "New Year Night Miles",
    slug: "new-year-night-miles",
    date: "28 Dec 2025 – 2 Jan 2026",
    distance: "5 km / 10 km / 21 km",
    price: "Rs. 549",
    description:
      "A year-end virtual challenge for runners chasing a strong close to the season with verified times and premium finisher medals.",
    highlight: "Completed · Highest 21 km completion rate of the season.",
    banner: "Year-end challenge",
    bannerImageUrl: "/events/new-year-night-miles.webp",
    medalImageUrl: "/images/medals/new-year-night-miles.webp",
    reward: "Premium medal + certificate",
    status: "past",
    finishers: 1295,
    verifiedResults: 1188,
    cities: 39,
    resultNote:
      "This race has finished. Check the recap stats or head to an open event to register.",
    startsAt: "2025-12-28T00:00:00.000Z",
    endsAt: "2026-01-02T23:59:59.000Z",
  },
];

/** Open / upcoming / closed active showcase races (home, events catalog). */
export const publicEvents = allPublicEvents.filter((event) => event.status === "upcoming" || event.status === "closed");

/** Completed races for the events archive section. */
export const pastEvents = allPublicEvents.filter((event) => event.status === "past");

export const upcomingEvents = publicEvents;

export function getEventMedalImages(slug: string): { front: string; back: string } {
  if (
    slug.includes("air-force") ||
    slug.includes("airforce") ||
    slug === "iaf-2026" ||
    slug === "indian-air-force-day-2026" ||
    slug === "indian-air-force-day-virtual-challenge"
  ) {
    return {
      front: "/images/iaf-medal-front.webp",
      back: "/images/iaf-medal-back.webp",
    };
  }
  const img = getEventMedalImage(slug);
  return { front: img, back: img };
}

export function getEventMedalImage(slug: string): string {
  if (
    slug.includes("air-force") ||
    slug.includes("airforce") ||
    slug === "iaf-2026" ||
    slug === "indian-air-force-day-2026" ||
    slug === "indian-air-force-day-virtual-challenge"
  ) {
    return "/images/iaf-medal-front.webp";
  }
  const medalMap: Record<string, string> = {
    "monsoon-mountain-miles": "/images/medals/monsoon-mountain-miles.webp",
    "independence-endurance-run": "/images/medals/independence-endurance-run.webp",
    "himalayan-winter-sprint": "/images/medals/himalayan-winter-sprint.webp",
    "independence-day-virtual-run-2026": "/images/medals/independence-day-virtual-run-2026.webp",
    "spring-valley-dash": "/images/medals/spring-valley-dash.webp",
    "holi-color-virtual-run": "/images/medals/holi-color-virtual-run.webp",
    "new-year-night-miles": "/images/medals/new-year-night-miles.webp",
  };
  return medalMap[slug] || "/images/iaf-medal-front.webp";
}

export function getEventBySlug(slug: string) {
  if (
    slug === "indian-air-force-day" ||
    slug === "iaf-2026" ||
    slug === "indian-airforce-day" ||
    slug === "indian-air-force-day-2026"
  ) {
    return allPublicEvents.find((event) => event.slug === "indian-air-force-day-virtual-challenge");
  }
  return allPublicEvents.find((event) => event.slug === slug);
}

export const galleryMoments = [
  {
    title: "Sunrise finish",
    meta: "5 km finisher",
    image: "/images/sunrise-finish.svg",
  },
  {
    title: "Club leaderboard push",
    meta: "10 km team effort",
    image: "/images/club-push.svg",
  },
  {
    title: "First medal day",
    meta: "New runner story",
    image: "/images/first-medal.svg",
  },
  {
    title: "Weekend long run",
    meta: "21 km verified",
    image: "/images/weekend-long-run.svg",
  },
];
