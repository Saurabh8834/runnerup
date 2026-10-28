import { z } from "zod";

export const syncUserSchema = z.object({
  clerkId: z.string().min(1).optional(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  name: z.string().max(200).optional().nullable(),
  username: z.string().max(100).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  avatarUrl: z.string().max(1000).optional().nullable(),
});

export const checkReferralCodeSchema = z.object({
  code: z.string().min(4).max(12).regex(/^[A-Z0-9]+$/),
});

export const applyReferralCodeSchema = z.object({
  code: z.string().min(4).max(12).regex(/^[A-Z0-9]+$/),
});

export const leaderboardQuerySchema = z.object({
  distance: z.string().min(1).max(50).optional(),
  page: z.coerce.number().int().positive().max(100).optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(100),
});
