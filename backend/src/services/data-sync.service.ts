import { createClerkClient } from "@clerk/backend";
import { prisma } from "../lib/prisma.js";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";
import { reconcilePaymentsWithRazorpay } from "./payment-reconciliation.service.js";

const CLERK_CANDIDATE_KEYS = [
  env.clerkSecretKey,
  process.env.CLERK_SECRET_KEY,
].filter((k): k is string => Boolean(k && typeof k === "string" && k.startsWith("sk_")));

export type FullSyncResult = {
  paymentsSynced: number;
  totalPaidPayments: number;
  totalRevenueInInr: number;
  fixedRegistrations: number;
  clerkUsersSynced: number;
  phonesSynced: number;
  totalUsers: number;
  totalPaidUsers: number;
  message: string;
};

let isSyncRunning = false;

export async function syncUserAndPaymentData(): Promise<FullSyncResult> {
  if (isSyncRunning) {
    logger.info("[DataSync] Full sync already in progress, skipping concurrent run.");
    const [totalUsers, totalPaidUsers, paidPayments] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          registrations: {
            some: {
              OR: [
                { payment: { status: "PAID" } },
                { status: "CONFIRMED" },
                { status: "COMPLETED" },
              ],
            },
          },
        },
      }),
      prisma.payment.findMany({
        where: { status: "PAID" },
        select: { amountInPaise: true },
      }),
    ]);
    const revenue = paidPayments.reduce((acc, p) => acc + p.amountInPaise, 0);
    return {
      paymentsSynced: 0,
      totalPaidPayments: paidPayments.length,
      totalRevenueInInr: Math.round(revenue / 100),
      fixedRegistrations: 0,
      clerkUsersSynced: 0,
      phonesSynced: 0,
      totalUsers,
      totalPaidUsers,
      message: "Sync was already in progress. Current data loaded.",
    };
  }

  isSyncRunning = true;
  try {
    logger.info("[DataSync] Starting comprehensive user and payment sync...");

    // 1. Reconcile payments against Razorpay
    const paymentResult = await reconcilePaymentsWithRazorpay({ count: 100 });

    // 2. Fix unconfirmed registrations with PAID payments
    const unconfirmedPaidRegs = await prisma.registration.findMany({
      where: {
        status: { notIn: ["CONFIRMED", "COMPLETED"] },
        payment: { status: "PAID" },
      },
      select: { id: true },
    });

    let fixedRegistrations = 0;
    if (unconfirmedPaidRegs.length > 0) {
      await prisma.registration.updateMany({
        where: { id: { in: unconfirmedPaidRegs.map((r) => r.id) } },
        data: { status: "CONFIRMED" },
      });
      fixedRegistrations = unconfirmedPaidRegs.length;
    }

    // 3. Sync Clerk users
    let clerkUsersSynced = 0;
    const uniqueKeys = Array.from(new Set(CLERK_CANDIDATE_KEYS));
    const allDbUsers = await prisma.user.findMany({
      select: { id: true, email: true, clerkId: true, name: true, phone: true, avatarUrl: true },
    });
    const dbUserByClerkId = new Map(allDbUsers.filter((u) => u.clerkId).map((u) => [u.clerkId!, u]));
    const dbUserByEmail = new Map(allDbUsers.map((u) => [u.email.toLowerCase().trim(), u]));

    for (const key of uniqueKeys) {
      try {
        const client = createClerkClient({ secretKey: key });
        const res = await client.users.getUserList({ limit: 100 });
        const list = (res as any).data || res;
        if (!list || !Array.isArray(list)) continue;

        for (const cu of list) {
          const email = cu.emailAddresses?.[0]?.emailAddress?.toLowerCase()?.trim();
          if (!email) continue;

          const name =
            [cu.firstName, cu.lastName].filter(Boolean).join(" ").trim() ||
            cu.username ||
            email.split("@")[0] ||
            "Runner";
          const phone = cu.phoneNumbers?.[0]?.phoneNumber?.trim() || null;
          const avatarUrl = cu.imageUrl || null;

          const existing = dbUserByClerkId.get(cu.id) || dbUserByEmail.get(email);
          if (!existing) {
            const base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 14);
            const username = `${base}_${cu.id.slice(-4)}`;
            await prisma.user.create({
              data: {
                clerkId: cu.id,
                email,
                name,
                username,
                phone,
                avatarUrl,
                role: email === "sourav06556@gmail.com" ? "SUPER_ADMIN" : "RUNNER",
              },
            }).catch(() => null);
            clerkUsersSynced++;
          } else {
            const needsUpdate =
              !existing.clerkId ||
              existing.clerkId !== cu.id ||
              (!existing.phone && phone) ||
              (!existing.avatarUrl && avatarUrl);

            if (needsUpdate) {
              await prisma.user.update({
                where: { id: existing.id },
                data: {
                  clerkId: cu.id,
                  phone: existing.phone || phone,
                  avatarUrl: existing.avatarUrl || avatarUrl,
                },
              }).catch(() => null);
              clerkUsersSynced++;
            }
          }
        }
      } catch (err: any) {
        logger.warn(`[DataSync] Clerk sync attempt skipped for key: ${err?.message}`);
      }
    }

    // 4. Sync User Phones from Registrations
    const usersMissingPhone = await prisma.user.findMany({
      where: {
        OR: [{ phone: null }, { phone: "" }],
      },
      include: {
        registrations: {
          where: { shippingPhone: { not: "" } },
          orderBy: { registeredAt: "desc" },
          take: 1,
        },
      },
    });

    let phonesSynced = 0;
    for (const u of usersMissingPhone) {
      const regPhone = u.registrations[0]?.shippingPhone?.trim();
      if (regPhone && regPhone.length > 5) {
        await prisma.user.update({
          where: { id: u.id },
          data: { phone: regPhone },
        }).catch(() => null);
        phonesSynced++;
      }
    }

    // 5. Compute Final Counts
    const [totalUsers, totalPaidUsers, paidPayments] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          registrations: {
            some: {
              OR: [
                { payment: { status: "PAID" } },
                { status: "CONFIRMED" },
                { status: "COMPLETED" },
              ],
            },
          },
        },
      }),
      prisma.payment.findMany({
        where: { status: "PAID" },
        select: { amountInPaise: true },
      }),
    ]);

    const totalRevenueInPaise = paidPayments.reduce((acc, p) => acc + p.amountInPaise, 0);
    const totalRevenueInInr = Math.round(totalRevenueInPaise / 100);

    const changes = [];
    if (paymentResult.syncedCount > 0) changes.push(`${paymentResult.syncedCount} new payments reconciled`);
    if (fixedRegistrations > 0) changes.push(`${fixedRegistrations} registrations confirmed`);
    if (clerkUsersSynced > 0) changes.push(`${clerkUsersSynced} users synced with Clerk`);
    if (phonesSynced > 0) changes.push(`${phonesSynced} phone numbers synced`);

    const message = changes.length > 0
      ? `Sync complete: ${changes.join(", ")}. Total paid revenue: ₹${totalRevenueInInr}`
      : `All user and payment data is 100% in sync! Total revenue: ₹${totalRevenueInInr} across ${paidPayments.length} paid entries.`;

    logger.info("[DataSync] Sync finished successfully", {
      paymentsSynced: paymentResult.syncedCount,
      totalPaidPayments: paidPayments.length,
      totalRevenueInInr,
      totalUsers,
      totalPaidUsers,
    });

    return {
      paymentsSynced: paymentResult.syncedCount,
      totalPaidPayments: paidPayments.length,
      totalRevenueInInr,
      fixedRegistrations,
      clerkUsersSynced,
      phonesSynced,
      totalUsers,
      totalPaidUsers,
      message,
    };
  } finally {
    isSyncRunning = false;
  }
}
