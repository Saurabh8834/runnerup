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
      proofClosesAt: true,
      status: true,
      highlight: true,
    },
  });
  console.log("EVENTS:", JSON.stringify(events, null, 2));

  const kineticRegs = await prisma.registration.findMany({
    where: {
      OR: [
        { event: { slug: { contains: "kinetic" } } },
        { event: { title: { contains: "Kinetic" } } },
        { bibNumber: { startsWith: "KRUN" } }
      ]
    },
    include: {
      user: { select: { id: true, email: true, name: true } },
      event: { select: { id: true, title: true, slug: true } },
      payment: true,
      certificate: true
    }
  });
  console.log("KINETIC REGS:", JSON.stringify(kineticRegs, null, 2));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
