import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { sendRegistrationConfirmationEmail } from "../services/email.service.js";
import {
  createRazorpayOrder,
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

  if (registration.payment?.status === "PAID") {
    throw new ApiError(409, "Registration is already paid");
  }

  logger.info("[Payment] Creating Razorpay order", {
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

  const existingPayment = await prisma.payment.findUnique({
    where: { razorpayOrderId: payload.razorpay_order_id },
    include: { registration: { include: { user: true, event: true } } },
  });

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
    where: { razorpayOrderId: payload.razorpay_order_id },
    data: {
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
          : "Registration confirmation email failed",
        body: emailResult.sent
          ? `Confirmation sent to ${registration.user.email}`
          : emailResult.error ?? "Email was not sent",
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
  if (!env.razorpayWebhookSecret) {
    logger.warn("[Webhook] RAZORPAY_WEBHOOK_SECRET is not configured. Webhook acknowledged.");
    return response.json({ received: true, note: "Webhook secret not configured on server" });
  }

  const rawBody = Buffer.isBuffer(request.body) ? request.body : Buffer.from(JSON.stringify(request.body));
  const isValid = verifyWebhookSignature(rawBody, request.header("x-razorpay-signature"));

  if (!isValid) {
    logger.warn("[Webhook] Invalid signature on Razorpay webhook");
    throw new ApiError(400, "Invalid Razorpay webhook signature");
  }

  const event = JSON.parse(rawBody.toString("utf8")) as {
    event?: string;
    payload?: {
      payment?: { entity?: { id?: string; order_id?: string; status?: string } };
      order?: { entity?: { id?: string; status?: string } };
    };
  };

  const orderId = event.payload?.payment?.entity?.order_id ?? event.payload?.order?.entity?.id;
  const paymentId = event.payload?.payment?.entity?.id;

  logger.info("[Webhook] Received Razorpay event", { eventType: event.event, orderId, paymentId });

  if (orderId && (event.event === "payment.captured" || event.event === "order.paid")) {
    const existingPayment = await prisma.payment.findUnique({
      where: { razorpayOrderId: orderId },
      select: { status: true },
    });
    if (existingPayment?.status === "PAID") {
      logger.info("[Webhook] Payment already marked as PAID, ignoring event", { orderId });
      return response.json({ received: true });
    }
    const payment = await prisma.payment.update({
      where: { razorpayOrderId: orderId },
      data: {
        status: "PAID",
        razorpayPaymentId: paymentId,
        paidAt: new Date(),
      },
    });

    try {
      const registration = await prisma.registration.update({
        where: { id: payment.registrationId },
        data: { status: "CONFIRMED" },
        include: { user: true, event: true },
      });

      await sendRegistrationConfirmationEmail({
        to: registration.user.email,
        runnerName: registration.user.name,
        eventTitle: registration.event.title,
        distance: registration.distance,
        bibNumber: registration.bibNumber,
        amountInPaise: payment.amountInPaise,
      });
    } catch (err) {
      logger.error("[Webhook] Failed to update registration or send email", err, { orderId });
    }
  }

  response.json({ received: true });
}
