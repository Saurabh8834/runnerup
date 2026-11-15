import type { Response } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import type { AuthenticatedRequest } from "../middleware/clerk-auth.js";
import { ApiError } from "../utils/api-error.js";
import { validateBody } from "../utils/validate.js";

function generateCode(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function getMyReferralCode(request: AuthenticatedRequest, response: Response) {
  const clerkId = request.auth!.userId;

  const user = await prisma.user.findFirst({ where: { clerkId } });
  if (!user) throw new ApiError(404, "User not found");

  if (!user.referralCode) {
    let code: string;
    let exists = true;
    do {
      code = generateCode();
      exists = !!(await prisma.user.findUnique({ where: { referralCode: code } }));
    } while (exists);

    await prisma.user.update({ where: { id: user.id }, data: { referralCode: code } });
    user.referralCode = code;
  }

  const referrals = await prisma.referral.findMany({
    where: { referrerId: user.id },
    select: { refereeId: true, status: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const converted = referrals.filter((r) => r.status === "converted").length;

  response.json({
    data: {
      code: user.referralCode,
      link: `${env.frontendUrl}/register?ref=${user.referralCode}`,
      totalReferrals: referrals.length,
      converted,
      referrals,
    },
  });
}

const referralCodeParamSchema = z.object({
  code: z.string().min(4).max(12).regex(/^[A-Z0-9]+$/),
});

const applyReferralBodySchema = z.object({
  code: z.string().min(4).max(12),
});

export async function checkReferralCode(request: AuthenticatedRequest, response: Response) {
  const { code } = referralCodeParamSchema.parse(request.params);

  const referrer = await prisma.user.findUnique({ where: { referralCode: code.toUpperCase() } });
  if (!referrer) {
    throw new ApiError(404, "Referral code not found");
  }

  response.json({ data: { valid: true } });
}

export async function applyReferralCode(request: AuthenticatedRequest, response: Response) {
  const clerkId = request.auth!.userId;
  const { code } = applyReferralBodySchema.parse(request.body);

  const referee = await prisma.user.findFirst({ where: { clerkId } });
  if (!referee) throw new ApiError(404, "User not found");

  const referrer = await prisma.user.findUnique({ where: { referralCode: code.toUpperCase() } });
  if (!referrer) throw new ApiError(404, "Referral code not found");
  if (referrer.id === referee.id) throw new ApiError(400, "You cannot refer yourself");

  const existing = await prisma.referral.findUnique({ where: { refereeId: referee.id } });
  if (existing) throw new ApiError(400, "You have already been referred by someone");

  await prisma.referral.create({
    data: {
      referrerId: referrer.id,
      refereeId: referee.id,
      code: code.toUpperCase(),
      status: "pending",
    },
  });

  response.json({ data: { message: "Referral code applied successfully" } });
}
