import { prisma } from "../src/lib/prisma.js";

async function main() {
  console.log("Applying performance indexes to database...");
  
  const indexSqls = [
    // User indexes
    `CREATE INDEX IF NOT EXISTS "idx_user_updated_at" ON "User"("updatedAt" DESC);`,
    `CREATE INDEX IF NOT EXISTS "idx_user_role" ON "User"("role");`,
    `CREATE INDEX IF NOT EXISTS "idx_user_phone" ON "User"("phone");`,
    `CREATE INDEX IF NOT EXISTS "idx_user_created_at" ON "User"("createdAt" DESC);`,

    // Registration indexes
    `CREATE INDEX IF NOT EXISTS "idx_registration_user_id" ON "Registration"("userId");`,
    `CREATE INDEX IF NOT EXISTS "idx_registration_event_id" ON "Registration"("eventId");`,
    `CREATE INDEX IF NOT EXISTS "idx_registration_registered_at" ON "Registration"("registeredAt" DESC);`,
    `CREATE INDEX IF NOT EXISTS "idx_registration_status" ON "Registration"("status");`,
    `CREATE INDEX IF NOT EXISTS "idx_registration_shipping_phone" ON "Registration"("shippingPhone");`,

    // Payment indexes
    `CREATE INDEX IF NOT EXISTS "idx_payment_status" ON "Payment"("status");`,
    `CREATE INDEX IF NOT EXISTS "idx_payment_paid_at" ON "Payment"("paidAt" DESC);`,
    `CREATE INDEX IF NOT EXISTS "idx_payment_created_at" ON "Payment"("createdAt" DESC);`,
    `CREATE INDEX IF NOT EXISTS "idx_payment_razorpay_payment_id" ON "Payment"("razorpayPaymentId");`,
  ];

  for (const sql of indexSqls) {
    console.log(`Executing: ${sql}`);
    await prisma.$executeRawUnsafe(sql);
  }

  console.log("All performance indexes applied successfully!");
}

main()
  .catch((e) => {
    console.error("Failed to apply indexes:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
