import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const desc = `🇮🇳 Indian Air Force Day Virtual Run 2026 ✈️\n\nRun with courage, rise with pride, and salute the heroes who guard our skies. Every kilometre is a tribute to their bravery and dedication.\n\nRun for Glory. Run for India. Jai Hind! 🇮🇳`;

  const data = {
    title: "Indian Air Force Day Virtual Challenge 2026",
    description: desc,
    bannerImageUrl: "/images/event-medal.webp",
    reward: "100% Solid Metal Finisher Medal + Digital Race Bib + E-Certificate",
    banner: "Air Force Day Virtual Challenge",
    highlight: "Salute the Air Warriors · Run, Walk or Ride on 25–30 Oct",
    startsAt: new Date("2026-10-25T00:00:00.000Z"),
    endsAt: new Date("2026-10-30T23:59:59.000Z"),
    proofClosesAt: new Date("2026-11-05T23:59:59.000Z"),
    distances: ["1.5 km", "3 km", "5 km", "10 km", "21 km"],
    priceInPaise: 49900,
    paymentRequired: true,
    medalIncluded: true,
    featured: true,
    status: "OPEN" as const,
    city: "Virtual (All India)",
    benefits: [
      "100% Solid Metal Finisher Medal Included",
      "Official Digital Race Bib with Unique Number",
      "Free doorstep delivery across India",
      "Works with Strava, Garmin, NRC",
      "Official Verifiable E-Certificate",
      "Live GPS-Verified Leaderboard Ranking",
    ],
  };

  // 1. Update existing slug in DB if present
  const updated1 = await prisma.event.updateMany({
    where: { slug: "indian-air-force-day-virtual-challenge" },
    data,
  });
  console.log("Updated indian-air-force-day-virtual-challenge:", updated1.count);

  // 2. Delete any duplicate legacy slug in DB if present
  const deletedLegacy = await prisma.event.deleteMany({
    where: { slug: "indian-air-force-day-2026" },
  });
  if (deletedLegacy.count > 0) {
    console.log("Cleaned up duplicate legacy slug count:", deletedLegacy.count);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    throw e;
  });
