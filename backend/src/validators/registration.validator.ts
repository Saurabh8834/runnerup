import { z } from "zod";
import { isIndianState } from "../data/indian-states.js";

const phoneSchema = z
  .string()
  .trim()
  .transform((value) => {
    const cleaned = value.replace(/[\s\-()]/g, "");
    if (/^[6-9]\d{9}$/.test(cleaned)) {
      return `+91${cleaned}`;
    }
    return cleaned;
  })
  .refine((value) => /^\+\d{8,15}$/.test(value), {
    message: "Enter a valid mobile number with country code",
  });

const indianStateSchema = z
  .string()
  .trim()
  .refine((value) => isIndianState(value), {
    message: "Choose a valid Indian state",
  });

const pincodeSchema = z
  .string()
  .trim()
  .regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit pincode");

export const createRegistrationSchema = z
  .object({
    userId: z.string().min(1).optional(),
    clerkId: z.string().min(1).optional(),
    name: z.string().trim().min(2, "Name must be at least 2 characters").optional(),
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores")
      .optional(),
    email: z.string().trim().email("Enter a valid email").optional(),
    phone: phoneSchema.optional(),
    eventId: z.string().min(1).optional(),
    eventSlug: z.string().min(1).optional(),
    distance: z.string().min(1, "Distance is required"),
    activityType: z.enum(["running", "cycling", "walking"]).optional(),
    tshirtSize: z.string().trim().optional(),
    shippingName: z.string().trim().min(2, "Shipping name is required").optional(),
    shippingPhone: phoneSchema.optional(),
    shippingLine1: z.string().trim().min(5, "Address must be at least 5 characters").optional(),
    shippingLine2: z.string().trim().max(120, "Landmark must be 120 characters or fewer").optional().nullable(),
    shippingCity: z.string().trim().min(2, "City is required").optional(),
    shippingState: indianStateSchema.optional(),
    shippingPincode: pincodeSchema.optional(),
    address: z.string().trim().min(5, "Address must be at least 5 characters").optional(),
    landmark: z.string().trim().max(120, "Landmark must be 120 characters or fewer").optional().nullable(),
    city: z.string().trim().min(2, "City is required").optional(),
    state: indianStateSchema.optional(),
    pincode: pincodeSchema.optional(),
    referralCode: z.string().min(4).max(12).optional(),
  })
  .transform((data) => {
    const shippingName = data.shippingName ?? data.name ?? "";
    const shippingPhone = data.shippingPhone ?? data.phone ?? "";
    const shippingLine1 = data.shippingLine1 ?? data.address ?? "";
    const shippingLine2 = data.shippingLine2 ?? data.landmark ?? null;
    const shippingCity = data.shippingCity ?? data.city ?? "";
    const shippingState = data.shippingState ?? data.state ?? "";
    const shippingPincode = data.shippingPincode ?? data.pincode ?? "";

    return {
      ...data,
      name: data.name ?? shippingName,
      phone: data.phone ?? shippingPhone,
      shippingName,
      shippingPhone,
      shippingLine1,
      shippingLine2,
      shippingCity,
      shippingState,
      shippingPincode,
    };
  })
  .superRefine((value, context) => {
    if (!value.userId && !value.clerkId && (!value.name || !value.email)) {
      context.addIssue({
        code: "custom",
        message: "Either clerkId/userId or runner name and email are required",
        path: ["email"],
      });
    }

    if (!value.eventId && !value.eventSlug) {
      context.addIssue({
        code: "custom",
        message: "Either eventId or eventSlug is required",
        path: ["eventSlug"],
      });
    }

    if (!value.shippingName || value.shippingName.length < 2) {
      context.addIssue({
        code: "custom",
        message: "Runner name is required (min 2 characters)",
        path: ["shippingName"],
      });
    }

    if (!value.shippingPhone) {
      context.addIssue({
        code: "custom",
        message: "Valid mobile phone number with country code is required",
        path: ["shippingPhone"],
      });
    }

    if (!value.shippingLine1 || value.shippingLine1.length < 5) {
      context.addIssue({
        code: "custom",
        message: "Street address is required (min 5 characters)",
        path: ["shippingLine1"],
      });
    }

    if (!value.shippingCity || value.shippingCity.length < 2) {
      context.addIssue({
        code: "custom",
        message: "City is required (min 2 characters)",
        path: ["shippingCity"],
      });
    }

    if (!value.shippingState) {
      context.addIssue({
        code: "custom",
        message: "Choose a valid Indian state",
        path: ["shippingState"],
      });
    }

    if (!value.shippingPincode) {
      context.addIssue({
        code: "custom",
        message: "Enter a valid 6-digit pincode",
        path: ["shippingPincode"],
      });
    }
  });

export const submitProofSchema = z.object({
  activityImageUrl: z
    .string()
    .min(10, "Activity image is required")
    .refine(
      (value) =>
        value.startsWith("https://") ||
        value.startsWith("http://") ||
        value.startsWith("data:image/"),
      "Provide a valid image URL or uploaded image data",
    ),
  sourceApp: z.string().min(2, "Source app is required"),
  finishTimeSeconds: z.number().int().positive().nullable().optional(),
});

export const reviewProofSchema = z.object({
  approved: z.boolean(),
  reviewerNote: z.string().optional(),
  finishTimeSeconds: z.number().int().positive().nullable().optional(),
});
