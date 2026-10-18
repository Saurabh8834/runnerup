import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
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
import { createPaymentOrderSchema, verifyPaymentSchema } from "../validators/payment.validator.js";

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

  // 2. Prevent orphaned duplicate orders: check existing order if present
  if (registration.payment?.razorpayOrderId) {
    try {
      // Check if existing order in Razorpay was already captured
      const orderPayments = await fetchPaymentsForOrder(registration.payment.razorpayOrderId);
      const captured = orderPayments?.find((p) => p.status === "captured");
      if (captured) {
        logger.info("[Payment] Existing order already captured in Razorpay, confirming registration", {
          orderId: registration.payment.razorpayOrderId,
          paymentId: captured.id,
        });

        const paidPayment = await prisma.payment.update({
          where: { id: registration.payment.id },
          data: {
            status: "PAID",
            razorpayPaymentId: captured.id,
            paidAt: new Date(),
          },
        });

        await prisma.registration.update({
          where: { id: registration.id },
          data: { status: "CONFIRMED" },
        });

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

        return response.status(200).json({
          data: {
            alreadyPaid: true,
            keyId: env.razorpayKeyId,
            orderId: registration.payment.razorpayOrderId,
            amountInPaise: registration.payment.amountInPaise,
            registrationId: registration.id,
            bibNumber: registration.bibNumber,
            payment: paidPayment,
          },
        });
      }

      // Check if existing order in Razorpay is still open & valid with same amount
      const existingRzpOrder = await fetchRazorpayOrder(registration.payment.razorpayOrderId);
      if (
        existingRzpOrder &&
        existingRzpOrder.status === "created" &&
        existingRzpOrder.amount === registration.event.priceInPaise
      ) {
        logger.info("[Payment] Reusing active valid Razorpay order", {
          orderId: registration.payment.razorpayOrderId,
          registrationId: registration.id,
        });

        return response.status(200).json({
          data: {
            keyId: env.razorpayKeyId,
            orderId: registration.payment.razorpayOrderId,
            amountInPaise: registration.payment.amountInPaise,
            currency: "INR",
            registrationId: registration.id,
            bibNumber: registration.bibNumber,
            runner: {
              name: registration.user.name,
              email: registration.user.email,
              phone: registration.user.phone,
            },
            payment: registration.payment,
          },
        });
      }
    } catch (checkErr) {
      logger.warn("[Payment] Could not check existing Razorpay order status, proceeding to create new", {
        error: checkErr instanceof Error ? checkErr.message : String(checkErr),
      });
    }
  }

  logger.info("[Payment] Creating new Razorpay order", {
    registrationId: registration.id,
    bibNumber: registration.bibNumber,
    amountInPaise: registration.event.priceInPaise,
  });

  const order = await createRazorpayOrder({
    amountInPaise: registration.event.priceInPaise,
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

  response.status(201).json({
    data: {
      keyId: env.razorpayKeyId,
      orderId: order.id,
      amountInPaise: order.amount,
      currency: order.currency,
      registrationId: registration.id,
      bibNumber: registration.bibNumber,
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
      },
    });
  }

  const payment = await prisma.payment.update({
    where: { id: existingPayment.id },
    data: {
      razorpayOrderId: payload.razorpay_order_id,
      razorpayPaymentId: payload.razorpay_payment_id,
      razorpaySignature: payload.razorpay_signature,
      status: "PAID",
      paidAt: new Date(),
    },
  });

  logger.info("[Payment] Verified payment successfully", {
    orderId: payload.razorpay_order_id,
    paymentId: payload.razorpay_payment_id,
    registrationId: payment.registrationId,
  });

  let emailSent = false;
  let emailId: string | undefined;
  let emailError: string | undefined;

  try {
    const currentStatus = existingPayment.registration?.status;
    const nextStatus = currentStatus === "COMPLETED" ? "COMPLETED" : "CONFIRMED";
    const registration = await prisma.registration.update({
      where: { id: payment.registrationId },
      data: { status: nextStatus },
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

    emailSent = emailResult.sent;
    emailId = emailResult.id;
    emailError = emailResult.error;

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
    });
  } catch (err) {
    logger.error("[verifyPayment] Registration update or email failed", err, {
      registrationId: payment.registrationId,
    });
  }

  response.json({
    data: {
      ...payment,
      emailSent,
      emailId,
      emailError,
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
    }
  }

  response.json({ received: true });
}
