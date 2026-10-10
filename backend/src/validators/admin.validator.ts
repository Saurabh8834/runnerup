import { z } from "zod";

const eventStatusEnum = z.enum(["DRAFT", "OPEN", "CLOSED", "COMPLETED", "CANCELLED"]);
const registrationStatusEnum = z.enum([
  "PENDING_PAYMENT",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
]);
const paymentStatusEnum = z.enum(["CREATED", "PAID", "FAILED", "REFUNDED"]);
const medalStatusEnum = z.enum([
  "NOT_ELIGIBLE",
  "PENDING",
  "DISPATCHED",
  "DELIVERED",
  "RETURNED",
]);
const certificateStatusEnum = z.enum(["QUEUED", "GENERATED", "SENT"]);
const userRoleEnum = z.enum(["RUNNER", "ADMIN", "SUPER_ADMIN"]);

export const adminEventSchema = z.object({
  title: z.string().min(3),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "Slug can use lowercase letters, numbers, and hyphens only"),
  description: z.string().min(10),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  proofClosesAt: z.coerce.date(),
  distances: z.array(z.string().min(1)).min(1),
  priceInPaise: z.number().int().min(0),
  paymentRequired: z.boolean().optional(),
  medalIncluded: z.boolean().optional(),
  featured: z.boolean().optional(),
  maxCapacity: z.number().int().positive().nullable().optional(),
  city: z.string().optional().nullable(),
  bannerImageUrl: z.string().max(2000).optional().nullable().or(z.literal("")),
  couponCode: z.string().max(40).optional().nullable(),
  showCouponOnCard: z.boolean().optional(),
  activityTypes: z.array(z.enum(["running", "cycling", "walking"])).min(1).optional(),
  benefits: z.array(z.string().min(1)).optional(),
  finishers: z.number().int().nonnegative().nullable().optional(),
  verifiedResults: z.number().int().nonnegative().nullable().optional(),
  cities: z.number().int().nonnegative().nullable().optional(),
  resultNote: z.string().max(2000).nullable().optional(),
  status: eventStatusEnum.optional(),
});

export const adminEventUpdateSchema = adminEventSchema.partial();

export const adminRegistrationUpdateSchema = z.object({
  status: registrationStatusEnum.optional(),
  distance: z.string().min(1).optional(),
  finishTimeSeconds: z.number().int().positive().nullable().optional(),
  adminNote: z.string().max(2000).optional().nullable(),
  shippingName: z.string().min(2).optional(),
  shippingPhone: z.string().min(8).optional(),
  shippingLine1: z.string().min(3).optional(),
  shippingLine2: z.string().optional().nullable(),
  shippingCity: z.string().min(2).optional(),
  shippingState: z.string().min(2).optional(),
  shippingPincode: z.string().min(4).optional(),
});

export const adminMarkPaidSchema = z.object({
  amountInPaise: z.number().int().min(0).optional(),
  note: z.string().max(500).optional(),
});

export const adminPaymentUpdateSchema = z.object({
  status: paymentStatusEnum,
  note: z.string().max(500).optional(),
});

export const adminMedalUpdateSchema = z.object({
  status: medalStatusEnum,
  courier: z.string().optional().nullable(),
  trackingNumber: z.string().optional().nullable(),
  trackingUrl: z.string().max(2000).optional().nullable().or(z.literal("")),
});

export const adminCertificateUpdateSchema = z.object({
  status: certificateStatusEnum,
  pdfUrl: z.string().max(2000).optional().nullable().or(z.literal("")),
});

export const adminUserRoleSchema = z.object({
  role: userRoleEnum,
});

export const adminCouponSchema = z.object({
  code: z
    .string()
    .min(3)
    .max(40)
    .transform((v) => v.trim().toUpperCase()),
  discountPaise: z.number().int().positive(),
  maxRedemptions: z.number().int().positive().nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  active: z.boolean().optional(),
});

export const adminCouponUpdateSchema = adminCouponSchema.partial();

export const adminProofReviewSchema = z.object({
  approved: z.boolean(),
  reviewerNote: z.string().max(1000).optional(),
  finishTimeSeconds: z.number().int().positive().nullable().optional(),
});
