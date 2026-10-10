export type DefaultEvent = {
  title: string;
  slug: string;
  description: string;
  startsAt: Date;
  endsAt: Date;
  proofClosesAt: Date;
  distances: string[];
  priceInPaise: number;
  status: "DRAFT" | "OPEN" | "CLOSED" | "COMPLETED" | "CANCELLED";
  city: string;
  medalIncluded?: boolean;
  benefits?: string[];
  featured?: boolean;
  bannerImageUrl?: string;
  banner?: string;
  reward?: string;
  highlight?: string;
  finishers?: number;
  verifiedResults?: number;
  cities?: number;
  resultNote?: string;
};

export const defaultEvents: DefaultEvent[] = [
  {
    title: "Indian Air Force Day Virtual Challenge ✈️ 🎖️",
    slug: "indian-air-force-day-virtual-challenge",
    description:
      "🇮🇳 Indian Air Force Day Virtual Run 2026 ✈️\n\nRun with courage, rise with pride, and salute the heroes who guard our skies. Every kilometre is a tribute to their bravery and dedication.\n\nRun for Glory. Run for India. Jai Hind! 🇮🇳",
    startsAt: new Date("2026-10-08T00:00:00.000Z"),
    endsAt: new Date("2026-10-12T23:59:59.000Z"),
    proofClosesAt: new Date("2026-10-17T23:59:59.000Z"),
    distances: ["1.5 km", "3 km", "5 km", "10 km", "21 km"],
    priceInPaise: 49900, // Rs. 499
    status: "OPEN",
    city: "Virtual (All India)",
    featured: true,
    medalIncluded: true,
    bannerImageUrl: "/images/event-medal.jpg",
    banner: "Air Force Day Virtual Challenge",
    reward: "100% Solid Metal Finisher Medal + E-Certificate",
    highlight: "Indian Air Force Day Virtual Challenge · Solid metal finisher medal included.",
    benefits: [
      "Free delivery across India",
      "Works with Strava, Garmin, NRC",
      "100% Solid Metal Finisher Medal Included",
      "Official Verifiable E-Certificate & Digital Bib",
      "Live GPS-Verified Leaderboard Ranking",
    ],
  },
  {
    title: "October Runner 🍁",
    slug: "october-runner",
    description:
      "Join the October Runner 1 Rupee virtual challenge! Celebrate the running season with verified GPS tracking, an instant verifiable E-Certificate, and an official digital bib. Complete your chosen distance anywhere, anytime.",
    startsAt: new Date("2026-10-01T00:00:00.000Z"),
    endsAt: new Date("2026-10-31T23:59:59.000Z"),
    proofClosesAt: new Date("2026-11-05T23:59:59.000Z"),
    distances: ["1.5 km", "3 km", "5 km", "10 km", "21 km"],
    priceInPaise: 100, // 1 Rs = 100 paise
    status: "OPEN",
    city: "Virtual (All India)",
    featured: true,
    medalIncluded: true,
    bannerImageUrl:
      "https://res.cloudinary.com/gpy6aiwy/image/upload/v1791564508/runnerup/events/october-runner.jpg",
    banner: "Special ₹1 Challenge",
    reward: "Instant QR E-Certificate + Digital Bib",
    highlight: "Special ₹1 October Challenge · Instant verified certificate for all finishers.",
    benefits: [
      "Instant Verifiable QR E-Certificate",
      "Official Digital Race Bib with Number",
      "Live GPS-Verified Leaderboard Ranking",
      "Strava, Garmin, Nike & Apple Watch Sync",
      "Finisher Badge on Profile",
    ],
  },
  {
    title: "Independence Day Virtual Run 2026 🇮🇳",
    slug: "independence-day-virtual-run-2026",
    description:
      "Celebrate India's Independence Day by running from anywhere in the country. Complete your chosen distance at your own pace during the event window. Every finisher receives an official digital certificate, premium finisher medal, exclusive event T-shirt and exciting goodies.",
    startsAt: new Date("2026-10-15T00:00:00.000Z"),
    endsAt: new Date("2026-11-20T23:59:59.000Z"),
    proofClosesAt: new Date("2026-11-25T23:59:59.000Z"),
    distances: ["1.5 km", "3 km", "5 km", "10 km", "15 km", "20 km", "25 km", "30 km"],
    priceInPaise: 34900,
    status: "CLOSED",
    city: "Virtual (All India)",
    featured: false,
    bannerImageUrl:
      "https://res.cloudinary.com/gpy6aiwy/image/upload/v1791564521/runnerup/events/independence-day-virtual-run-2026.jpg",
    banner: "Flagship run",
    reward: "Premium medal + T-shirt + certificate",
    highlight: "Flagship virtual run with official finisher medals and e-certificates.",
    benefits: [
      "Official Physical Heavy Metal Finisher Medal",
      "Instant Verifiable QR E-Certificate",
      "Official Bib with Name & Number",
      "Exclusive Runner Up Quick-Dry T-Shirt",
      "Free Express Courier Across India",
    ],
  },
  {
    title: "Monsoon Mountain Miles",
    slug: "monsoon-mountain-miles",
    description:
      "A premium virtual running challenge with GPS proof verification, e-certificate, leaderboard placement, and medal delivery.",
    startsAt: new Date("2026-11-01T00:00:00.000Z"),
    endsAt: new Date("2026-11-15T23:59:59.000Z"),
    proofClosesAt: new Date("2026-11-18T23:59:59.000Z"),
    distances: ["3 km", "5 km", "10 km", "21 km"],
    priceInPaise: 49900,
    status: "OPEN",
    city: "Virtual",
    featured: true,
    bannerImageUrl:
      "https://res.cloudinary.com/gpy6aiwy/image/upload/v1791564525/runnerup/events/monsoon-mountain-miles.jpg",
    banner: "Rain-ready challenge",
    reward: "Medal + certificate",
    highlight: "Ideal for first virtual races and running clubs.",
    benefits: [
      "GPS Verified Leaderboard",
      "Commemorative Trail Finisher Medal",
      "Digital Certificate of Achievement",
      "Free Home Delivery",
    ],
  },
  {
    title: "Himalayan Winter Sprint",
    slug: "himalayan-winter-sprint",
    description:
      "A fast winter sprint challenge with elegant certificates, QR verification, and community leaderboard.",
    startsAt: new Date("2026-12-05T00:00:00.000Z"),
    endsAt: new Date("2026-12-09T23:59:59.000Z"),
    proofClosesAt: new Date("2026-12-10T23:59:59.000Z"),
    distances: ["2 km", "5 km", "10 km"],
    priceInPaise: 39900,
    status: "OPEN",
    city: "Virtual",
    featured: true,
    bannerImageUrl:
      "https://res.cloudinary.com/gpy6aiwy/image/upload/v1791564535/runnerup/events/himalayan-winter-sprint.jpg",
    banner: "Fast festive sprint",
    reward: "Digital kit + medal",
    highlight: "Quick, beginner-friendly participation.",
    benefits: [
      "Finisher Medal with Ribbon",
      "Instant Digital Bib",
      "QR Verified Certificate",
    ],
  },
  {
    title: "Independence Endurance Run",
    slug: "independence-endurance-run",
    description:
      "A pan-India endurance event built for verified finish times, fair ranking, and medal delivery tracking.",
    startsAt: new Date("2026-12-20T00:00:00.000Z"),
    endsAt: new Date("2026-12-28T23:59:59.000Z"),
    proofClosesAt: new Date("2026-12-30T23:59:59.000Z"),
    distances: ["5 km", "10 km", "25 km"],
    priceInPaise: 64900,
    status: "OPEN",
    city: "Virtual",
    featured: false,
    bannerImageUrl:
      "https://res.cloudinary.com/gpy6aiwy/image/upload/v1791564531/runnerup/events/independence-endurance-run.jpg",
    banner: "Flagship endurance week",
    reward: "Premium medal + T-shirt",
    highlight: "Built for runners chasing a longer verified effort.",
    benefits: [
      "Heavy Cast 3D Finisher Medal",
      "Technical Running Tee",
      "Custom E-Certificate with Split Times",
      "Tracked Postal Delivery",
    ],
  },
  {
    title: "Spring Valley Dash",
    slug: "spring-valley-dash",
    description:
      "A spring season virtual dash with city-wide participation, GPS proof checks, and finisher medals shipped nationwide.",
    startsAt: new Date("2026-03-14T00:00:00.000Z"),
    endsAt: new Date("2026-03-20T23:59:59.000Z"),
    proofClosesAt: new Date("2026-03-21T23:59:59.000Z"),
    distances: ["3 km", "5 km", "10 km"],
    priceInPaise: 44900,
    status: "COMPLETED",
    city: "Virtual",
    bannerImageUrl:
      "https://res.cloudinary.com/gpy6aiwy/image/upload/v1791564545/runnerup/events/spring-valley-dash.jpg",
    banner: "Season opener",
    reward: "Medal + certificate",
    highlight: "Completed · Strong beginner turnout across 40+ cities.",
    finishers: 1842,
    verifiedResults: 1620,
    cities: 48,
    resultNote: "This event is closed. Browse the recap below or open an upcoming race to register.",
  },
  {
    title: "Holi Color Virtual Run",
    slug: "holi-color-virtual-run",
    description:
      "A festive family-friendly virtual run celebrating Holi with digital kits, fun finish photos, and verified 2 km and 5 km results.",
    startsAt: new Date("2026-03-05T00:00:00.000Z"),
    endsAt: new Date("2026-03-09T23:59:59.000Z"),
    proofClosesAt: new Date("2026-03-10T23:59:59.000Z"),
    distances: ["2 km", "5 km"],
    priceInPaise: 34900,
    status: "COMPLETED",
    city: "Virtual",
    bannerImageUrl:
      "https://res.cloudinary.com/gpy6aiwy/image/upload/v1791564549/runnerup/events/holi-color-virtual-run.jpg",
    banner: "Festival run",
    reward: "Digital kit + medal",
    highlight: "Completed · Festival favorite for clubs and first-timers.",
    finishers: 2560,
    verifiedResults: 2314,
    cities: 62,
    resultNote: "Registration is closed. View what finishers received, then join the next open event.",
  },
  {
    title: "New Year Night Miles",
    slug: "new-year-night-miles",
    description:
      "A year-end virtual challenge for runners chasing a strong close to the season with verified times and premium finisher medals.",
    startsAt: new Date("2025-12-28T00:00:00.000Z"),
    endsAt: new Date("2026-01-02T23:59:59.000Z"),
    proofClosesAt: new Date("2026-01-03T23:59:59.000Z"),
    distances: ["5 km", "10 km", "21 km"],
    priceInPaise: 54900,
    status: "COMPLETED",
    city: "Virtual",
    bannerImageUrl:
      "https://res.cloudinary.com/gpy6aiwy/image/upload/v1791564555/runnerup/events/new-year-night-miles.jpg",
  },
];
