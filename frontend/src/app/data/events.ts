export const eventBenefits = [
  "Verified race entry",
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
  reward: string;
  status: "upcoming" | "past";
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
    name: "Indian Air Force Day Virtual Challenge ✈️ 🎖️",
    slug: "indian-air-force-day-virtual-challenge",
    date: "8-12 October 2026",
    distance: "1.5 km / 3 km / 5 km / 10 km / 21 km",
    price: "Rs. 499",
    description:
      "🇮🇳 Indian Air Force Day Virtual Run 2026 ✈️\n\nRun with courage, rise with pride, and salute the heroes who guard our skies. Every kilometre is a tribute to their bravery and dedication.\n\nRun for Glory. Run for India. Jai Hind! 🇮🇳",
    highlight: "Indian Air Force Day Virtual Challenge · Solid metal finisher medal included.",
    banner: "Air Force Day Virtual Challenge",
    bannerImageUrl: "/images/event-medal.jpg",
    reward: "100% Solid Metal Finisher Medal + E-Certificate",
    status: "upcoming",
    compareAtPrice: "Rs. 549",
    startsAt: "2026-10-08T00:00:00.000Z",
    endsAt: "2026-10-12T23:59:59.000Z",
    benefits: [
      "100% Solid Metal Finisher Medal Included",
      "Free doorstep delivery across India",
      "Works with Strava, Garmin, NRC",
      "Official Verifiable E-Certificate & Digital Bib",
      "Live GPS-Verified Leaderboard Ranking",
    ],
  },
  {
    name: "Indian Air Force Day 2026 🇮🇳",
    slug: "indian-air-force-day-2026",
    date: "8-12 October 2026",
    distance: "1.5 km / 3 km / 5 km / 10 km / 21 km",
    price: "Rs. 499",
    description:
      "🇮🇳 Indian Air Force Day Virtual Run 2026 ✈️\n\nRun with courage, rise with pride, and salute the heroes who guard our skies. Every kilometre is a tribute to their bravery and dedication.\n\nRun for Glory. Run for India. Jai Hind! 🇮🇳",
    highlight: "Indian Air Force Day Virtual Challenge · Solid metal finisher medal included.",
    banner: "Air Force Day Virtual Challenge",
    bannerImageUrl: "/images/event-medal.jpg",
    reward: "100% Solid Metal Finisher Medal + E-Certificate",
    status: "upcoming",
    compareAtPrice: "Rs. 549",
    startsAt: "2026-10-08T00:00:00.000Z",
    endsAt: "2026-10-12T23:59:59.000Z",
    benefits: [
      "100% Solid Metal Finisher Medal Included",
      "Free doorstep delivery across India",
      "Works with Strava, Garmin, NRC",
      "Official Verifiable E-Certificate & Digital Bib",
      "Live GPS-Verified Leaderboard Ranking",
    ],
  },
  {
    name: "October Runner 🍁",
    slug: "october-runner",
    date: "1-31 Oct 2026",
    distance: "1.5 km / 3 km / 5 km / 10 km / 21 km",
    price: "Rs. 1",
    description:
      "Join the October Runner 1 Rupee virtual challenge! Celebrate the running season with verified GPS tracking, an instant verifiable E-Certificate, and an official digital bib. Complete your chosen distance anywhere, anytime.",
    highlight: "Special ₹1 October Challenge · Instant verified certificate for all finishers.",
    banner: "Special ₹1 Challenge",
    bannerImageUrl:
      "https://res.cloudinary.com/gpy6aiwy/image/upload/v1791564508/runnerup/events/october-runner.jpg",
    reward: "Instant QR E-Certificate + Digital Bib",
    status: "upcoming",
    compareAtPrice: "Rs. 99",
    startsAt: "2026-10-01T00:00:00.000Z",
    endsAt: "2026-10-31T23:59:59.000Z",
    benefits: [
      "Instant Verifiable QR E-Certificate",
      "Official Digital Race Bib with Number",
      "Live GPS-Verified Leaderboard Ranking",
      "Strava, Garmin, Nike & Apple Watch Sync",
      "Finisher Badge on Profile",
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
    bannerImageUrl:
      "https://res.cloudinary.com/gpy6aiwy/image/upload/v1791564521/runnerup/events/independence-day-virtual-run-2026.jpg",
    reward: "Premium medal + T-shirt + certificate",
    status: "past",
    compareAtPrice: "Rs. 699",
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
    bannerImageUrl:
      "https://res.cloudinary.com/gpy6aiwy/image/upload/v1791564525/runnerup/events/monsoon-mountain-miles.jpg",
    reward: "Medal + certificate",
    status: "upcoming",
    compareAtPrice: "Rs. 850",
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
    bannerImageUrl:
      "https://res.cloudinary.com/gpy6aiwy/image/upload/v1791564531/runnerup/events/independence-endurance-run.jpg",
    reward: "Premium medal + T-shirt",
    status: "upcoming",
    compareAtPrice: "Rs. 1100",
  },
  {
    name: "Himalayan Winter Sprint",
    slug: "himalayan-winter-sprint",
    date: "5-9 Dec 2026",
    distance: "2 km / 5 km / 10 km",
    price: "Rs. 399",
    description:
      "A short winter sprint for beginners and families who want a simple, polished finish-line experience.",
    highlight: "Quick, beginner-friendly participation.",
    banner: "Fast festive sprint",
    bannerImageUrl:
      "https://res.cloudinary.com/gpy6aiwy/image/upload/v1791564535/runnerup/events/himalayan-winter-sprint.jpg",
    reward: "Digital kit + medal",
    status: "upcoming",
    compareAtPrice: "Rs. 700",
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
    bannerImageUrl:
      "https://res.cloudinary.com/gpy6aiwy/image/upload/v1791564545/runnerup/events/spring-valley-dash.jpg",
    reward: "Medal + certificate",
    status: "past",
    finishers: 1842,
    verifiedResults: 1620,
    cities: 48,
    resultNote:
      "This event is closed. Browse the recap below or open an upcoming race to register.",
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
    bannerImageUrl:
      "https://res.cloudinary.com/gpy6aiwy/image/upload/v1791564549/runnerup/events/holi-color-virtual-run.jpg",
    reward: "Digital kit + medal",
    status: "past",
    finishers: 2560,
    verifiedResults: 2314,
    cities: 62,
    resultNote:
      "Registration is closed. View what finishers received, then join the next open event.",
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
    bannerImageUrl:
      "https://res.cloudinary.com/gpy6aiwy/image/upload/v1791564555/runnerup/events/new-year-night-miles.jpg",
    reward: "Premium medal + certificate",
    status: "past",
    finishers: 1295,
    verifiedResults: 1188,
    cities: 39,
    resultNote:
      "This race has finished. Check the recap stats or head to an open event to register.",
  },
];

/** Open / upcoming races (home, register flows). */
export const publicEvents = allPublicEvents.filter((event) => event.status === "upcoming");

/** Completed races for the events archive section. */
export const pastEvents = allPublicEvents.filter((event) => event.status === "past");

export const upcomingEvents = publicEvents;

export function getEventBySlug(slug: string) {
  if (slug === "indian-air-force-day" || slug === "iaf-2026" || slug === "indian-airforce-day") {
    return allPublicEvents.find((event) => event.slug === "indian-air-force-day-2026");
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
