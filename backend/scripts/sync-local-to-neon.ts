// @ts-nocheck
import { PrismaClient } from "@prisma/client";

const localUrl = "postgresql://postgres:12345@127.0.0.1:5432/runnerup?schema=public";
const localPrisma = new PrismaClient({ datasources: { db: { url: localUrl } } });

const neonUrl = process.env.DATABASE_URL!;
const neonPrisma = new PrismaClient({ datasources: { db: { url: neonUrl } } });

async function sync() {
  console.log("==================================================");
  console.log("  SYNCING DATA: LOCAL POSTGRES -> NEON DB");
  console.log("==================================================");

  // 1. Sync Users
  const localUsers = await localPrisma.user.findMany();
  console.log(`\nFound ${localUsers.length} users in local DB.`);
  for (const user of localUsers) {
    const existing = await neonPrisma.user.findFirst({
      where: {
        OR: [
          { email: user.email },
          ...(user.clerkId ? [{ clerkId: user.clerkId }] : []),
          { id: user.id },
        ],
      },
    });

    if (!existing) {
      await neonPrisma.user.create({
        data: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatarUrl: user.avatarUrl,
          referralCode: user.referralCode,
          clerkId: user.clerkId,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
      console.log(`  [+] Created user: ${user.name} (${user.email})`);
    } else {
      await neonPrisma.user.update({
        where: { id: existing.id },
        data: {
          name: user.name,
          username: user.username || existing.username,
          phone: user.phone || existing.phone,
          role: user.role,
          clerkId: user.clerkId || existing.clerkId,
        },
      });
      console.log(`  [=] Updated user: ${user.name} (${user.email})`);
    }
  }

  // 2. Fetch all events in Neon to map by slug
  const neonEvents = await neonPrisma.event.findMany();
  const eventMapBySlug = new Map(neonEvents.map((e) => [e.slug, e]));
  const localEvents = await localPrisma.event.findMany();
  const localEventMapById = new Map(localEvents.map((e) => [e.id, e]));

  // 3. Sync Registrations
  const localRegs = await localPrisma.registration.findMany({
    include: { user: true, event: true },
  });
  console.log(`\nFound ${localRegs.length} registrations in local DB.`);

  for (const reg of localRegs) {
    // Find target user in Neon
    const targetUser = await neonPrisma.user.findFirst({
      where: { email: reg.user.email },
    });
    if (!targetUser) {
      console.warn(`  [!] Skipping reg ${reg.bibNumber}: user ${reg.user.email} not found in Neon.`);
      continue;
    }

    // Find target event in Neon by slug
    const targetEvent = eventMapBySlug.get(reg.event.slug);
    if (!targetEvent) {
      console.warn(`  [!] Skipping reg ${reg.bibNumber}: event ${reg.event.slug} not found in Neon.`);
      continue;
    }

    const regData = {
      bibNumber: reg.bibNumber,
      userId: targetUser.id,
      eventId: targetEvent.id,
      distance: reg.distance,
      activityType: reg.activityType,
      status: reg.status,
      proofStatus: reg.proofStatus,
      registeredAt: reg.registeredAt,
      finishTimeSeconds: reg.finishTimeSeconds,
      shippingName: reg.shippingName,
      shippingPhone: reg.shippingPhone,
      shippingLine1: reg.shippingLine1,
      shippingLine2: reg.shippingLine2,
      shippingCity: reg.shippingCity,
      shippingState: reg.shippingState,
      shippingPincode: reg.shippingPincode,
      adminNote: reg.adminNote,
    };

    const neonReg = await neonPrisma.registration.upsert({
      where: { bibNumber: reg.bibNumber },
      create: {
        id: reg.id,
        ...regData,
      },
      update: regData,
    });
    console.log(`  [+] Synced registration: ${neonReg.bibNumber} (${reg.shippingName} - ${targetEvent.title})`);
  }

  // 4. Sync Payments
  const localPayments = await localPrisma.payment.findMany({
    include: { registration: true },
  });
  console.log(`\nFound ${localPayments.length} payments in local DB.`);

  for (const pay of localPayments) {
    // Find corresponding registration in Neon by bibNumber
    const neonReg = await neonPrisma.registration.findUnique({
      where: { bibNumber: pay.registration.bibNumber },
    });

    if (!neonReg) {
      console.warn(`  [!] Skipping payment ${pay.razorpayOrderId}: registration not found.`);
      continue;
    }

    const payData = {
      registrationId: neonReg.id,
      razorpayOrderId: pay.razorpayOrderId,
      razorpayPaymentId: pay.razorpayPaymentId,
      razorpaySignature: pay.razorpaySignature,
      amountInPaise: pay.amountInPaise,
      status: pay.status,
      paidAt: pay.paidAt,
      createdAt: pay.createdAt,
    };

    const neonPay = await neonPrisma.payment.upsert({
      where: { razorpayOrderId: pay.razorpayOrderId },
      create: {
        id: pay.id,
        ...payData,
      },
      update: payData,
    });
    console.log(`  [+] Synced payment: ${neonPay.razorpayPaymentId || neonPay.razorpayOrderId} - Amount: ₹${neonPay.amountInPaise / 100} (${neonPay.status})`);
  }

  // 5. Sync SiteMedia
  const localMedia = await localPrisma.siteMedia.findMany();
  console.log(`\nFound ${localMedia.length} SiteMedia items in local DB.`);
  for (const m of localMedia) {
    await neonPrisma.siteMedia.upsert({
      where: { id: m.id },
      create: m,
      update: m,
    });
    console.log(`  [+] Synced media: ${m.title}`);
  }

  console.log("\n==================================================");
  console.log("  SYNC COMPLETED SUCCESSFULLY!");
  console.log("==================================================");

  await localPrisma.$disconnect();
  await neonPrisma.$disconnect();
}

sync().catch((err) => {
  console.error("Sync error:", err);
  process.exit(1);
});
