import { PrismaClient } from "@prisma/client";
import { defaultEvents } from "../src/data/default-events.js";

const prisma = new PrismaClient();

async function main() {
  for (const event of defaultEvents) {
    const data = {
      ...event,
      benefits: event.benefits ?? [],
    };
    await prisma.event.upsert({
      where: { slug: event.slug },
      create: data,
      update: data,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
