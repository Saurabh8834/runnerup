import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const events = await prisma.event.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      startsAt: true,
      endsAt: true,
      status: true,
      bannerImageUrl: true,
    },
  });
  console.log(JSON.stringify(events, null, 2));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
