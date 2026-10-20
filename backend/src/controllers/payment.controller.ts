import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { syncUserAndPaymentData } from "../services/data-sync.service.js";
import { sendRegistrationConfirmationEmail } from "../services/email.service.js";
import {
  createRazorpayOrder,
  fetchPaymentsForOrder,
  fetchRazorpayOrder,
  fetchRazorpayPayment,
  verifyCheckoutSignature,
  verifyWebhookSignature,
} from "../services/razorpay.service.js";
import { ApiError } from "../utils/api-error.js";
import { logger } from "../utils/logger.js";
import { validateBody } from "../utils/validate.js";
import {
  createPaymentOrderSchema,
  validateCouponSchema,
  verifyPaymentSchema,
} from "../validators/payment.validator.js";

export async function resolveCouponDiscount(
  rawCode: string,
  event: { priceInPaise: number; couponCode?: string | null },
): Promise<{
  valid: boolean;
  code: string;
  discountPaise: number;
  message?: string;
  couponId?: string;
}> {
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return { valid: false, code, discountPaise: 0, message: "Please enter a coupon code" };
  }

  // 1. Check Coupon model in database
  const dbCoupon = await prisma.coupon.findUnique({
    where: { code },
  });

  if (dbCoupon) {
    if (!dbCoupon.active) {
      return { valid: false, code, discountPaise: 0, message: "This coupon is no longer active" };
    }
    if (dbCoupon.expiresAt && dbCoupon.expiresAt < new Date()) {
      return { valid: false, code, discountPaise: 0, message: "This coupon has expired" };
    }
    if (dbCoupon.maxRedemptions !== null && dbCoupon.redeemedCount >= dbCoupon.maxRedemptions) {
      return { valid: false, code, discountPaise: 0, message: "This coupon has reached maximum redemptions" };
    }
    return {
      valid: true,
      code,
      discountPaise: dbCoupon.discountPaise,
      couponId: dbCoupon.id,
      message: `Coupon applied: ₹${Math.round(dbCoupon.discountPaise / 100)} OFF!`,
    };
  }

  // 2. Check Event-level couponCode (e.g. DUSSEHRA50)
  if (event.couponCode && event.couponCode.trim().toUpperCase() === code) {
    const match = code.match(/\d+/);
    let discountPaise = 5000; // default ₹50 off (10% of ₹499)
    if (match) {
      const num = parseInt(match[0], 10);
      if (num > 0 && num < 1000) {
        discountPaise = num * 100;
      }
    }
    return {
      valid: true,
      code,
      discountPaise,
      message: `Coupon applied: ₹${Math.round(discountPaise / 100)} OFF!`,
    };
  }

  return { valid: false, code, discountPaise: 0, message: "Invalid coupon code" };
}

export async function validateCoupon(request: Request, response: Response) {
  const payload = validateBody(validateCouponSchema, request);
  const code = payload.code.trim().toUpperCase();

  let event = payload.eventSlug
    ? await prisma.event.findFirst({ where: { slug: payload.eventSlug } })
    : null;

  if (!event) {
    event = await prisma.event.findFirst({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
    });
  }

  if (!event) {
    throw new ApiError(404, "No active event found to apply coupon");
  }

  const result = await resolveCouponDiscount(code, event);
  if (!result.valid) {
    throw new ApiError(400, result.message || "Invalid coupon code");
  }

  const originalAmountInPaise = event.priceInPaise;
  const finalAmountInPaise = Math.max(100, originalAmountInPaise - result.discountPaise);

  response.json({
    data: {
      valid: true,
      code,
      discountInPaise: result.discountPaise,
      discountInRupees: Math.round(result.discountPaise / 100),
      originalAmountInPaise,
      originalAmountInRupees: Math.round(originalAmountInPaise / 100),
      finalAmountInPaise,
      finalAmountInRupees: Math.round(finalAmountInPaise / 100),
      message: result.message,
    },
  });
}

export async function createPaymentOrder(request: Request, response: Response) {
  const payload = validateBody(createPaymentOrderSchema, request);
  const registration = await prisma.registration.findUnique({
    where: { id: payload.registrationId },
    include: { event: true, payment: true, user: true },
  });

  if (!registration) {
    throw new ApiError(404, "Registration not found");
  }

  // 1. If already marked PAID in DB, return 409
  if (registration.payment?.status === "PAID") {
    throw new ApiError(409, "Registration is already paid");
  }

  // 2. Prevent orphaned duplicate orders: check if existing order was already captured
  if (registration.payment?.razorpayOrderId) {
    try {
      const existingOrderId = registration.payment.razorpayOrderId;
      const orderPayments = await fetchPaymentsForOrder(existingOrderId).catch(() => null);
      const captured = orderPayments?.find((p) => p.status === "captured");
      if (captured) {
        logger.info("[Payment] Existing order already captured in Razorpay, confirming registration", {
          orderId: existingOrderId,
          paymentId: captured.id,
        });

        const currentStatus = registration.status;
        const nextStatus = currentStatus === "COMPLETED" ? "COMPLETED" : "CONFIRMED";

        const [paidPayment] = await prisma.$transaction([
          prisma.payment.update({
            where: { id: registration.payment.id },
            data: {
              status: "PAID",
              razorpayPaymentId: captured.id,
              paidAt: new Date(),
            },
          }),
          prisma.registration.update({
            where: { id: registration.id },
            data: { status: nextStatus },
          }),
        ]);

        // Background jobs (non-blocking)
        setImmediate(async () => {
          await prisma.user
            .update({
              where: { id: registration.userId },
              data: { updatedAt: new Date() },
            })
            .catch(() => null);

          if (registration.event.medalIncluded) {
            await prisma.medalDelivery
              .upsert({
                where: { registrationId: registration.id },
                create: { registrationId: registration.id, status: "PENDING" },
                update: {},
              })
              .catch(() => null);
          }

          await sendRegistrationConfirmationEmail({
            to: registration.user.email,
            runnerName: registration.user.name,
            eventTitle: registration.event.title,
            distance: registration.distance,
            bibNumber: registration.bibNumber,
            amountInPaise: registration.payment?.amountInPaise ?? registration.event.priceInPaise,
          }).catch(() => null);
        });

        return response.status(200).json({
          data: {
            alreadyPaid: true,
            keyId: env.razorpayKeyId,
            orderId: existingOrderId,
            amountInPaise: registration.payment.amountInPaise,
            registrationId: registration.id,
            bibNumber: registration.bibNumber,
            payment: paidPayment,
          },
        });
      }
    } catch (checkErr) {
      logger.warn("[Payment] Could not check existing Razorpay order status, proceeding to create fresh order", {
        error: checkErr instanceof Error ? checkErr.message : String(checkErr),
      });
    }
  }

  // 3. Compute final charged amount considering optional coupon
  let chargedAmount = registration.event.priceInPaise;
  let appliedCouponId: string | null = null;
  let discountPaise = 0;
  let appliedCouponCode: string | null = null;

  if (payload.couponCode) {
    const couponResult = await resolveCouponDiscount(payload.couponCode, registration.event);
    if (couponResult.valid) {
      discountPaise = couponResult.discountPaise;
      chargedAmount = Math.max(100, registration.event.priceInPaise - discountPaise);
      appliedCouponId = couponResult.couponId || null;
      appliedCouponCode = couponResult.code;
    }
  }

  // Always generate a fresh Razorpay order for retries.
  // Reusing an old order that had a failed UPI attempt triggers "Payment could not be completed / cancelled" error screen.
  logger.info("[Payment] Creating fresh Razorpay order", {
    registrationId: registration.id,
    bibNumber: registration.bibNumber,
    amountInPaise: chargedAmount,
    discountPaise,
    couponCode: appliedCouponCode,
  });

  const order = await createRazorpayOrder({
    amountInPaise: chargedAmount,
    receipt: registration.bibNumber,
    registrationId: registration.id,
  });

  const payment = await prisma.payment.upsert({
    where: { registrationId: registration.id },
    create: {
      registrationId: registration.id,
      razorpayOrderId: order.id,
      amountInPaise: order.amount,
      status: "CREATED",
    },
    update: {
      razorpayOrderId: order.id,
      amountInPaise: order.amount,
      status: "CREATED",
      razorpayPaymentId: null,
      razorpaySignature: null,
      paidAt: null,
    },
  });

  if (appliedCouponId) {
    await prisma.coupon
      .update({
        where: { id: appliedCouponId },
        data: { redeemedCount: { increment: 1 } },
      })
      .catch(() => null);
  }

  response.status(201).json({
    data: {
      keyId: env.razorpayKeyId,
      orderId: order.id,
      amountInPaise: order.amount,
      currency: order.currency,
      registrationId: registration.id,
      bibNumber: registration.bibNumber,
      discountInPaise: discountPaise,
      couponCode: appliedCouponCode,
      runner: {
        name: registration.user.name,
        email: registration.user.email,
        phone: registration.user.phone,
      },
      payment,
    },
  });
}

export async function verifyPayment(request: Request, response: Response) {
  const payload = validateBody(verifyPaymentSchema, request);
  const isValid = verifyCheckoutSignature({
    razorpayOrderId: payload.razorpay_order_id,
    razorpayPaymentId: payload.razorpay_payment_id,
    razorpaySignature: payload.razorpay_signature,
  });

  if (!isValid) {
    logger.warn("[Payment] Invalid signature attempt", {
      orderId: payload.razorpay_order_id,
      paymentId: payload.razorpay_payment_id,
    });
    throw new ApiError(400, "Invalid Razorpay payment signature");
  }

  // 1. Direct search by razorpayOrderId
  let existingPayment = await prisma.payment.findUnique({
    where: { razorpayOrderId: payload.razorpay_order_id },
    include: { registration: { include: { user: true, event: true } } },
  });

  // 2. Fallback search by razorpayPaymentId
  if (!existingPayment) {
    existingPayment = await prisma.payment.findFirst({
      where: { razorpayPaymentId: payload.razorpay_payment_id },
      include: { registration: { include: { user: true, event: true } } },
    });
  }

  // 3. Fallback: Lookup order in Razorpay to read notes.registrationId
  if (!existingPayment) {
    const rzpOrder = await fetchRazorpayOrder(payload.razorpay_order_id);
    const regId = rzpOrder?.notes?.registrationId;
    if (regId) {
      existingPayment = await prisma.payment.findUnique({
        where: { registrationId: regId },
        include: { registration: { include: { user: true, event: true } } },
      });
    }
  }

  // 4. Fallback: Lookup payment in Razorpay to read notes.registrationId
  if (!existingPayment) {
    const rzpPayment = await fetchRazorpayPayment(payload.razorpay_payment_id);
    const regId = rzpPayment?.notes?.registrationId;
    if (regId) {
      existingPayment = await prisma.payment.findUnique({
        where: { registrationId: regId },
        include: { registration: { include: { user: true, event: true } } },
      });
    }
  }

  if (!existingPayment) {
    throw new ApiError(404, "Payment record not found for this order");
  }

  if (existingPayment.status === "PAID") {
    logger.info("[Payment] Payment already confirmed previously", {
      orderId: payload.razorpay_order_id,
      paymentId: payload.razorpay_payment_id,
      registrationId: existingPayment.registrationId,
    });
    return response.json({
      data: {
        ...existingPayment,
        emailSent: true,
        bibNumber: existingPayment.registration?.bibNumber,
      },
    });
  }

  const currentStatus = existingPayment.registration?.status;
  const nextStatus = currentStatus === "COMPLETED" ? "COMPLETED" : "CONFIRMED";

  // Fast single atomic transaction for database state updates
  const [payment, registration] = await prisma.$transaction([
    prisma.payment.update({
      where: { id: existingPayment.id },
      data: {
        razorpayOrderId: payload.razorpay_order_id,
        razorpayPaymentId: payload.razorpay_payment_id,
        razorpaySignature: payload.razorpay_signature,
        status: "PAID",
        paidAt: new Date(),
      },
    }),
    prisma.registration.update({
      where: { id: existingPayment.registrationId },
      data: { status: nextStatus },
      include: { user: true, event: true },
    }),
  ]);

  logger.info("[Payment] Verified payment successfully", {
    orderId: payload.razorpay_order_id,
    paymentId: payload.razorpay_payment_id,
    registrationId: payment.registrationId,
  });

  // Return response IMMEDIATELY (<100ms) so user gets instant confirmation without waiting on external email service!
  response.json({
    data: {
      ...payment,
      emailSent: true,
      bibNumber: registration.bibNumber,
    },
  });

  // Non-blocking background tasks: Email, Medal Delivery, Notification
  setImmediate(async () => {
    try {
      await prisma.user
        .update({
          where: { id: registration.userId },
          data: { updatedAt: new Date() },
        })
        .catch(() => null);

      if (registration.event?.medalIncluded) {
        await prisma.medalDelivery
          .upsert({
            where: { registrationId: payment.registrationId },
            create: { registrationId: payment.registrationId, status: "PENDING" },
            update: {},
          })
          .catch(() => null);
      }

      const emailResult = await sendRegistrationConfirmationEmail({
        to: registration.user.email,
        runnerName: registration.user.name,
        eventTitle: registration.event.title,
        distance: registration.distance,
        bibNumber: registration.bibNumber,
        amountInPaise: payment.amountInPaise,
      });

      await prisma.notification.create({
        data: {
          userId: registration.userId,
          channel: "email",
          title: emailResult.sent
            ? "Registration confirmation email sent"
            : "Registration confirmation email queued",
          body: emailResult.sent
            ? `Confirmation sent to ${registration.user.email}`
            : emailResult.error ?? "Email queued",
        },
      }).catch(() => null);
    } catch (bgErr) {
      logger.error("[verifyPayment] Background post-payment error", bgErr, {
        registrationId: payment.registrationId,
      });
    }
  });
}

/**
 * High-speed live payment status check endpoint.
 * Allows frontend to immediately verify whether an order/registration was paid,
 * unblocking users on mobile UPI intent without waiting on slow iframe polling.
 */
export async function getPaymentStatus(request: Request, response: Response) {
  const orderId = typeof request.query.orderId === "string" ? request.query.orderId.trim() : undefined;
  const registrationId = typeof request.query.registrationId === "string" ? request.query.registrationId.trim() : undefined;

  if (!orderId && !registrationId) {
    throw new ApiError(400, "Missing orderId or registrationId parameter");
  }

  const payment = await prisma.payment.findFirst({
    where: {
      OR: [
        ...(orderId ? [{ razorpayOrderId: orderId }] : []),
        ...(registrationId ? [{ registrationId }] : []),
      ],
    },
    include: { registration: { include: { user: true, event: true } } },
  });

  if (!payment) {
    return response.json({
      data: {
        paid: false,
        status: "NOT_FOUND",
      },
    });
  }

  // Already marked PAID in DB
  if (payment.status === "PAID") {
    return response.json({
      data: {
        paid: true,
        status: "PAID",
        orderId: payment.razorpayOrderId,
        paymentId: payment.razorpayPaymentId,
        bibNumber: payment.registration?.bibNumber,
        registrationId: payment.registrationId,
      },
    });
  }

  // If still CREATED in DB, verify live with Razorpay API (handles UPI intent app-switch delay)
  if (payment.razorpayOrderId) {
    try {
      const orderPayments = await fetchPaymentsForOrder(payment.razorpayOrderId);
      const captured = orderPayments?.find((p) => p.status === "captured");
      if (captured) {
        logger.info("[getPaymentStatus] Detected captured payment on Razorpay for pending order", {
          orderId: payment.razorpayOrderId,
          paymentId: captured.id,
        });

        const currentStatus = payment.registration?.status;
        const nextStatus = currentStatus === "COMPLETED" ? "COMPLETED" : "CONFIRMED";

        const [updatedPayment, updatedReg] = await prisma.$transaction([
          prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: "PAID",
              razorpayPaymentId: captured.id,
              paidAt: new Date(),
            },
          }),
          prisma.registration.update({
            where: { id: payment.registrationId },
            data: { status: nextStatus },
            include: { user: true, event: true },
          }),
        ]);

        setImmediate(async () => {
          try {
            if (updatedReg.event?.medalIncluded) {
              await prisma.medalDelivery
                .upsert({
                  where: { registrationId: updatedReg.id },
                  create: { registrationId: updatedReg.id, status: "PENDING" },
                  update: {},
                })
                .catch(() => null);
            }

            await sendRegistrationConfirmationEmail({
              to: updatedReg.user.email,
              runnerName: updatedReg.user.name,
              eventTitle: updatedReg.event.title,
              distance: updatedReg.distance,
              bibNumber: updatedReg.bibNumber,
              amountInPaise: updatedPayment.amountInPaise,
            }).catch(() => null);
          } catch {
            // non-blocking
          }
        });

        return response.json({
          data: {
            paid: true,
            status: "PAID",
            orderId: updatedPayment.razorpayOrderId,
            paymentId: captured.id,
            bibNumber: updatedReg.bibNumber,
            registrationId: updatedReg.id,
          },
        });
      }
    } catch (checkErr) {
      logger.warn("[getPaymentStatus] Live check failed", { error: String(checkErr) });
    }
  }

  return response.json({
    data: {
      paid: false,
      status: payment.status,
      orderId: payment.razorpayOrderId,
      registrationId: payment.registrationId,
    },
  });
}

export async function handleRazorpayWebhook(request: Request, response: Response) {
  const rawBody = Buffer.isBuffer(request.body) ? request.body : Buffer.from(JSON.stringify(request.body));
  const webhookSignature = request.header("x-razorpay-signature");

  let isVerified = false;
  if (env.razorpayWebhookSecret && webhookSignature) {
    isVerified = verifyWebhookSignature(rawBody, webhookSignature);
  }

  let event: any;
  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch {
    throw new ApiError(400, "Invalid JSON in webhook payload");
  }

  const orderId = event.payload?.payment?.entity?.order_id ?? event.payload?.order?.entity?.id;
  const paymentId = event.payload?.payment?.entity?.id;
  const regIdFromNotes =
    event.payload?.payment?.entity?.notes?.registrationId ??
    event.payload?.order?.entity?.notes?.registrationId;

  logger.info("[Webhook] Received Razorpay event", {
    eventType: event.event,
    orderId,
    paymentId,
    regId: regIdFromNotes,
  });

  // If secret not configured or signature failed, verify authenticity directly via Razorpay REST API
  if (!isVerified && paymentId) {
    const verifiedPayment = await fetchRazorpayPayment(paymentId);
    if (verifiedPayment && verifiedPayment.status === "captured") {
      isVerified = true;
      logger.info("[Webhook] Verified payment authenticity directly via Razorpay API credentials", { paymentId });
    }
  }

  if (!isVerified) {
    logger.warn("[Webhook] Webhook signature unverified and payment could not be validated via API");
    return response.json({ received: true, note: "Unverified webhook acknowledged" });
  }

  if ((event.event === "payment.captured" || event.event === "order.paid") && (orderId || paymentId)) {
    const existingPayment = await prisma.payment.findFirst({
      where: {
        OR: [
          ...(orderId ? [{ razorpayOrderId: orderId }] : []),
          ...(paymentId ? [{ razorpayPaymentId: paymentId }] : []),
          ...(regIdFromNotes ? [{ registrationId: regIdFromNotes }] : []),
        ],
      },
      include: { registration: { include: { user: true, event: true } } },
    });

    if (existingPayment?.status === "PAID") {
      logger.info("[Webhook] Payment already marked as PAID, ignoring event", { orderId, paymentId });
      return response.json({ received: true });
    }

    if (existingPayment) {
      const payment = await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: "PAID",
          razorpayPaymentId: paymentId || existingPayment.razorpayPaymentId,
          razorpayOrderId: orderId || existingPayment.razorpayOrderId,
          paidAt: new Date(),
        },
      });

      try {
        const registration = await prisma.registration.update({
          where: { id: payment.registrationId },
          data: { status: "CONFIRMED" },
          include: { user: true, event: true },
        });

        await prisma.user
          .update({
            where: { id: registration.userId },
            data: { updatedAt: new Date() },
          })
          .catch(() => null);

        if (registration.event?.medalIncluded) {
          await prisma.medalDelivery
            .upsert({
              where: { registrationId: registration.id },
              create: { registrationId: registration.id, status: "PENDING" },
              update: {},
            })
            .catch(() => null);
        }

        await sendRegistrationConfirmationEmail({
          to: registration.user.email,
          runnerName: registration.user.name,
          eventTitle: registration.event.title,
          distance: registration.distance,
          bibNumber: registration.bibNumber,
          amountInPaise: payment.amountInPaise,
        }).catch(() => null);

        logger.info("[Webhook] Confirmed registration via webhook", {
          registrationId: registration.id,
          bibNumber: registration.bibNumber,
        });
      } catch (err) {
        logger.error("[Webhook] Failed to update registration or send email", err, { orderId, paymentId });
      }
    } else {
      logger.info("[Webhook] Payment record not immediately found in DB, queuing background sync", { orderId, paymentId });
      setImmediate(() => {
        void syncUserAndPaymentData().catch(() => null);
      });
    }
  }

  response.json({ received: true });
}
