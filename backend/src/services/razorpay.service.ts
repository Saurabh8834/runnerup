import crypto from "node:crypto";
import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";

type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
};

function requireRazorpayCredentials() {
  if (!env.razorpayKeyId || !env.razorpayKeySecret) {
    throw new ApiError(500, "Razorpay credentials are not configured");
  }
}

export async function createRazorpayOrder(input: {
  amountInPaise: number;
  receipt: string;
  registrationId: string;
}) {
  requireRazorpayCredentials();

  const auth = Buffer.from(`${env.razorpayKeyId}:${env.razorpayKeySecret}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amountInPaise,
      currency: "INR",
      receipt: input.receipt,
      notes: {
        registrationId: input.registrationId,
        product: "RunnerUp registration",
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new ApiError(response.status, `Razorpay order creation failed: ${body}`);
  }

  return (await response.json()) as RazorpayOrder;
}

export function verifyCheckoutSignature(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  requireRazorpayCredentials();

  const expected = crypto
    .createHmac("sha256", env.razorpayKeySecret)
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(input.razorpaySignature),
  );
}

export async function fetchPaymentsForOrder(orderId: string) {
  requireRazorpayCredentials();

  const auth = Buffer.from(`${env.razorpayKeyId}:${env.razorpayKeySecret}`).toString("base64");
  const response = await fetch(`https://api.razorpay.com/v1/orders/${orderId}/payments`, {
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!response.ok) {
    return null;
  }

  const json = (await response.json()) as {
    items: Array<{ id: string; status: string }>;
  };

  return json.items ?? [];
}

export function verifyWebhookSignature(rawBody: Buffer, signature: string | undefined) {
  if (!env.razorpayWebhookSecret) {
    throw new ApiError(500, "Razorpay webhook secret is not configured");
  }

  if (!signature) {
    throw new ApiError(400, "Missing Razorpay webhook signature");
  }

  const expected = crypto
    .createHmac("sha256", env.razorpayWebhookSecret)
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
