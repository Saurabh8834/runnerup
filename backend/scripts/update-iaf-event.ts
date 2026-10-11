import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const desc = `🇮🇳 Indian Air Force Day Virtual Run 2026 ✈️\n\nRun with courage, rise with pride, and salute the heroes who guard our skies. Every kilometre is a tribute to their bravery and dedication.\n\nRun for Glory. Run for India. Jai Hind! 🇮🇳`;

  const data = {
    title: "Indian Air Force Day Virtual Challenge 2026",
    description: desc,
    bannerImageUrl: "/images/event-medal.webp",
    reward: "100% Solid Metal Finisher Medal + E-Certificate",
    banner: "Air Force Day Virtual Challenge",
    highlight: "Salute the Air Warriors · Run, Walk or Ride on 8–12 Oct",
    distances: ["1.5 km", "3 km", "5 km", "10 km", "21 km"],
    priceInPaise: 49900,
    paymentRequired: true,
    medalIncluded: true,
    featured: true,
    status: "OPEN" as const,
    city: "Virtual (All India)",
    benefits: [
      "100% Solid Metal Finisher Medal Included",
      "Free doorstep delivery across India",
      "Works with Strava, Garmin, NRC",
      "Official Verifiable E-Certificate & Digital Bib",
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
