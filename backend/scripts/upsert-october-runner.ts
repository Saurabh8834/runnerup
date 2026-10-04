import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const event = await prisma.event.upsert({
    where: { slug: "october-runner" },
    update: {
      title: "October Runner 🍁",
      description: "Join the October Runner 1 Rupee virtual challenge! Celebrate the running season with verified GPS tracking, an instant verifiable E-Certificate, and an official digital bib. Complete your chosen distance anywhere, anytime.",
      startsAt: new Date("2026-10-01T00:00:00.000Z"),
      endsAt: new Date("2026-10-31T23:59:59.000Z"),
      proofClosesAt: new Date("2026-11-05T23:59:59.000Z"),
      distances: ["1.5 km", "3 km", "5 km", "10 km", "21 km"],
      priceInPaise: 100, // Rs. 1
      paymentRequired: true,
      medalIncluded: true,
      featured: true,
      status: "OPEN",
      city: "Virtual (All India)",
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
    create: {
      title: "October Runner 🍁",
      slug: "october-runner",
      description: "Join the October Runner 1 Rupee virtual challenge! Celebrate the running season with verified GPS tracking, an instant verifiable E-Certificate, and an official digital bib. Complete your chosen distance anywhere, anytime.",
      startsAt: new Date("2026-10-01T00:00:00.000Z"),
      endsAt: new Date("2026-10-31T23:59:59.000Z"),
      proofClosesAt: new Date("2026-11-05T23:59:59.000Z"),
      distances: ["1.5 km", "3 km", "5 km", "10 km", "21 km"],
      priceInPaise: 100, // Rs. 1
      paymentRequired: true,
      medalIncluded: true,
      featured: true,
      status: "OPEN",
      city: "Virtual (All India)",
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
  });

  console.log("Successfully upserted October Runner into DB:", event.id, event.title, event.priceInPaise);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
