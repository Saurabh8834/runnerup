import { prisma } from "../lib/prisma.js";
import { logger } from "../utils/logger.js";
import {
  fetchPaymentsForOrder,
  fetchRecentCapturedPayments,
  type RazorpayCapturedItem,
} from "./razorpay.service.js";
import { sendRegistrationConfirmationEmail } from "./email.service.js";

let isReconciling = false;

export type ReconciliationResult = {
  syncedCount: number;
  totalPaidCount: number;
  totalRevenueInPaise: number;
  totalRevenueInInr: number;
  errors: Array<{ id: string; orderId?: string; error: string }>;
};

/**
 * Permanently and safely reconciles Razorpay captured payments with the database.
 * Matches by payment ID, order ID, or registrationId from notes.
 * Confirms registration, creates medal delivery if applicable, and sends confirmation email.
 * Safe to call concurrently (has lock flag) and will never throw unhandled errors.
 */
export async function reconcilePaymentsWithRazorpay(options: { count?: number } = {}): Promise<ReconciliationResult> {
  if (isReconciling) {
    logger.info("[PaymentReconciliation] Sync already in progress, skipping duplicate run.");
    const currentPaid = await prisma.payment.findMany({
      where: { status: "PAID" },
      select: { amountInPaise: true },
    });
    const revenuePaise = currentPaid.reduce((acc, p) => acc + p.amountInPaise, 0);
    return {
      syncedCount: 0,
      totalPaidCount: currentPaid.length,
      totalRevenueInPaise: revenuePaise,
      totalRevenueInInr: Math.round(revenuePaise / 100),
      errors: [],
    };
  }

  isReconciling = true;
  let syncedCount = 0;
  const errors: Array<{ id: string; orderId?: string; error: string }> = [];

  try {
    const count = options.count ?? 100;
    const [recentCaptured, existingPaid] = await Promise.all([
      fetchRecentCapturedPayments(count),
      prisma.payment.findMany({
        where: { status: "PAID" },
        select: { razorpayPaymentId: true, razorpayOrderId: true },
      }),
    ]);

    const paidPaymentIds = new Set(existingPaid.map((p) => p.razorpayPaymentId).filter(Boolean));
    const paidOrderIds = new Set(existingPaid.map((p) => p.razorpayOrderId).filter(Boolean));

    if (recentCaptured && recentCaptured.length > 0) {
      for (const rzp of recentCaptured) {
        try {
          // Skip admin test payments or 1rs test transactions
          if (rzp.id === "pay_TjmgmTIHb9UW7f" || rzp.email === "realblack009@gmail.com" || rzp.amount <= 100) {
            continue;
          }

          // 1. Instant in-memory check if already marked PAID in DB
          if (paidPaymentIds.has(rzp.id) || (rzp.order_id && paidOrderIds.has(rzp.order_id))) {
            continue;
          }

          // 2. Identify the target payment and registration in DB
          const regIdFromNotes = rzp.notes?.registrationId;
          let paymentToUpdate = await prisma.payment.findFirst({
            where: {
              OR: [
                ...(rzp.order_id ? [{ razorpayOrderId: rzp.order_id }] : []),
                ...(regIdFromNotes ? [{ registrationId: regIdFromNotes }] : []),
              ],
            },
            include: { registration: { include: { user: true, event: true } } },
          });

          // 3. Fallback: Search by user email or phone if notes were missing
          if (!paymentToUpdate && (rzp.email || rzp.contact)) {
            const cleanPhone = rzp.contact?.replace(/[^0-9]/g, "").slice(-10);
            const user = await prisma.user.findFirst({
              where: {
                OR: [
                  ...(rzp.email ? [{ email: { equals: rzp.email, mode: "insensitive" as const } }] : []),
                  ...(cleanPhone ? [{ phone: { contains: cleanPhone } }] : []),
                ],
              },
              include: {
                registrations: {
                  where: {
                    status: "PENDING_PAYMENT",
                  },
                  include: { payment: true, event: true, user: true },
                  orderBy: { registeredAt: "desc" },
                  take: 1,
                },
              },
            });

            const candidateReg = user?.registrations[0];
            if (candidateReg && candidateReg.payment) {
              paymentToUpdate = {
                ...candidateReg.payment,
                registration: {
                  ...candidateReg,
                  user: candidateReg.user,
                  event: candidateReg.event,
                },
              };
            }
          }

          if (paymentToUpdate) {
            const paidAtDate = rzp.created_at ? new Date(rzp.created_at * 1000) : new Date();

            await prisma.payment.update({
              where: { id: paymentToUpdate.id },
              data: {
                status: "PAID",
                razorpayPaymentId: rzp.id,
                razorpayOrderId: rzp.order_id || paymentToUpdate.razorpayOrderId,
                paidAt: paidAtDate,
              },
            });

            await prisma.registration.update({
              where: { id: paymentToUpdate.registrationId },
              data: { status: "CONFIRMED" },
            });

            if (paymentToUpdate.registration?.userId) {
              await prisma.user
                .update({
                  where: { id: paymentToUpdate.registration.userId },
                  data: { updatedAt: new Date() },
                })
                .catch(() => null);
            }

            if (paymentToUpdate.registration?.event?.medalIncluded) {
              await prisma.medalDelivery
                .upsert({
                  where: { registrationId: paymentToUpdate.registrationId },
                  create: { registrationId: paymentToUpdate.registrationId, status: "PENDING" },
                  update: {},
                })
                .catch(() => null);
            }

            if (paymentToUpdate.registration?.user?.email) {
              await sendRegistrationConfirmationEmail({
                to: paymentToUpdate.registration.user.email,
                runnerName: paymentToUpdate.registration.user.name,
                eventTitle: paymentToUpdate.registration.event.title,
                distance: paymentToUpdate.registration.distance,
                bibNumber: paymentToUpdate.registration.bibNumber,
                amountInPaise: paymentToUpdate.amountInPaise,
              }).catch(() => null);
            }

            syncedCount++;
            logger.info("[PaymentReconciliation] Successfully synced captured payment", {
              paymentId: rzp.id,
              orderId: rzp.order_id,
              registrationId: paymentToUpdate.registrationId,
              email: paymentToUpdate.registration?.user?.email,
            });
          }
        } catch (innerErr) {
          logger.error("[PaymentReconciliation] Error syncing item", innerErr, { rzpId: rzp.id });
          errors.push({
            id: rzp.id,
            orderId: rzp.order_id,
            error: innerErr instanceof Error ? innerErr.message : "Error syncing payment",
          });
        }
      }
    }

    // 4. Also check recent pending CREATED payments with order_ IDs (last 24 hours, max 10)
    const createdPayments = await prisma.payment.findMany({
      where: {
        status: "CREATED",
        razorpayOrderId: { startsWith: "order_" },
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      include: {
        registration: { include: { user: true, event: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    for (const payment of createdPayments) {
      try {
        const razorpayPayments = await fetchPaymentsForOrder(payment.razorpayOrderId);
        if (!razorpayPayments || razorpayPayments.length === 0) continue;

        const captured = razorpayPayments.find(
          (p: { id: string; status: string }) => p.status === "captured",
        );
        if (!captured) continue;

        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            razorpayPaymentId: captured.id,
            paidAt: new Date(),
          },
        });

        await prisma.registration.update({
          where: { id: payment.registrationId },
          data: { status: "CONFIRMED" },
        });

        if (payment.registration?.userId) {
          await prisma.user
            .update({
              where: { id: payment.registration.userId },
              data: { updatedAt: new Date() },
            })
            .catch(() => null);
        }

        if (payment.registration?.event?.medalIncluded) {
          await prisma.medalDelivery
            .upsert({
              where: { registrationId: payment.registrationId },
              create: { registrationId: payment.registrationId, status: "PENDING" },
              update: {},
            })
            .catch(() => null);
        }

        if (payment.registration?.user?.email) {
          await sendRegistrationConfirmationEmail({
            to: payment.registration.user.email,
            runnerName: payment.registration.user.name,
            eventTitle: payment.registration.event.title,
            distance: payment.registration.distance,
            bibNumber: payment.registration.bibNumber,
            amountInPaise: payment.amountInPaise,
          }).catch(() => null);
        }

        syncedCount++;
        logger.info("[PaymentReconciliation] Successfully synced order payment", {
          orderId: payment.razorpayOrderId,
          paymentId: captured.id,
          registrationId: payment.registrationId,
        });
      } catch (err) {
        logger.error("[PaymentReconciliation] Error checking created order", err, { orderId: payment.razorpayOrderId });
        errors.push({
          id: payment.id,
          orderId: payment.razorpayOrderId,
          error: err instanceof Error ? err.message : "Error checking created order",
        });
      }
    }
  } catch (err) {
    logger.error("[PaymentReconciliation] Global sync error", err);
  } finally {
    isReconciling = false;
  }

  const finalPaid = await prisma.payment.findMany({
    where: { status: "PAID" },
    select: { amountInPaise: true },
  });
  const totalRevenueInPaise = finalPaid.reduce((acc, p) => acc + p.amountInPaise, 0);

  return {
    syncedCount,
    totalPaidCount: finalPaid.length,
    totalRevenueInPaise,
    totalRevenueInInr: Math.round(totalRevenueInPaise / 100),
    errors,
  };
}
