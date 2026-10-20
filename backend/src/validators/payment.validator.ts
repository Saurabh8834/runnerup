import { z } from "zod";

export const createPaymentOrderSchema = z.object({
  registrationId: z.string().min(1),
  couponCode: z.string().trim().max(40).optional().nullable(),
});

export const validateCouponSchema = z.object({
  code: z.string().trim().min(1).max(40),
  eventSlug: z.string().trim().optional().nullable(),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});
