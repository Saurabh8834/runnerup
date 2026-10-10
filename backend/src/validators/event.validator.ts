import { z } from "zod";

const eventStatusEnum = z.enum(["DRAFT", "OPEN", "CLOSED", "COMPLETED", "CANCELLED"]);

export const createEventSchema = z.object({
  title: z.string().min(3),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "Slug can use lowercase letters, numbers, and hyphens only")
    .optional(),
  description: z.string().min(1).optional(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  proofClosesAt: z.coerce.date().optional(),
  distances: z.array(z.string().min(1)).min(1),
  priceInPaise: z.number().int().min(0),
  paymentRequired: z.boolean().optional(),
  medalIncluded: z.boolean().optional(),
  featured: z.boolean().optional(),
  maxCapacity: z.number().int().positive().nullable().optional(),
  city: z.string().optional(),
  bannerImageUrl: z.string().max(2000).optional().nullable().or(z.literal("")),
  couponCode: z.string().max(40).optional().nullable(),
  showCouponOnCard: z.boolean().optional(),
  activityTypes: z.array(z.enum(["running", "cycling", "walking"])).optional(),
  benefits: z.array(z.string().min(1)).optional(),
  finishers: z.number().int().nonnegative().nullable().optional(),
  verifiedResults: z.number().int().nonnegative().nullable().optional(),
  cities: z.number().int().nonnegative().nullable().optional(),
  resultNote: z.string().max(2000).nullable().optional(),
  status: eventStatusEnum.optional(),
});

export const updateEventSchema = createEventSchema.partial().extend({
  status: eventStatusEnum.optional(),
});
