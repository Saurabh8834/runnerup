// @ts-nocheck
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SLUG_TO_IMAGE: Record<string, string> = {
  "independence-endurance-run": "/events/independence-endurance-run.webp",
  "independence-day-virtual-run-2026": "/events/independence-day-virtual-run-2026.webp",
  "monsoon-mountain-miles": "/events/monsoon-mountain-miles.webp",
  "himalayan-winter-sprint": "/events/himalayan-winter-sprint.webp",
  "holi-color-virtual-run": "/events/holi-color-virtual-run.webp",
  "new-year-night-miles": "/events/new-year-night-miles.webp",
  "spring-valley-dash": "/events/spring-valley-dash.webp",
  "indian-air-force-day-virtual-challenge": "/images/event-medal.webp",
  "october-runner": "/events/october-runner.webp",
};

async function main() {
  const events = await prisma.event.findMany({
    select: { id: true, slug: true, bannerImageUrl: true },
  });

  for (const event of events) {
    const localUrl = SLUG_TO_IMAGE[event.slug] || `/events/${event.slug}.webp`;
    console.log(`Updating ${event.slug}: ${event.bannerImageUrl} -> ${localUrl}`);
    await prisma.event.update({
      where: { id: event.id },
      data: { bannerImageUrl: localUrl },
    });
  }

  console.log("All events successfully updated to local WebP images.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
