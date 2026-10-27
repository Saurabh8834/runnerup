import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/clerk-auth.js";
import { upsertUserFromClerk } from "../services/user.service.js";
import { ApiError } from "../utils/api-error.js";
import { validateBody } from "../utils/validate.js";
import { syncUserSchema } from "../validators/common.validator.js";
import { prisma } from "../lib/prisma.js";

/**
 * Sync the signed-in Clerk user into Postgres.
 * Called automatically by the frontend after login / page load.
 */
export async function syncCurrentUser(request: AuthenticatedRequest, response: Response) {
  const body = validateBody(syncUserSchema, request);

  const clerkId = request.auth?.userId ?? body.clerkId;
  if (!clerkId) {
    throw new ApiError(401, "Authentication required");
  }

  const user = await upsertUserFromClerk({
    clerkId,
    email: body.email,
    name: body.name,
    username: body.username,
    phone: body.phone,
    avatarUrl: body.avatarUrl,
  });

  response.json({
    data: user,
    meta: { synced: true },
  });
}

/** Return the local DB user for the current Clerk session (auto-sync if missing). */
export async function getCurrentUser(request: AuthenticatedRequest, response: Response) {
  const clerkId = request.auth?.userId;
  if (!clerkId) {
    throw new ApiError(401, "Authentication required");
  }

  const registrationInclude = {
    orderBy: { registeredAt: "desc" as const },
    take: 20,
    include: {
      event: true,
      payment: true,
      proofUpload: true,
      certificate: true,
      medalDelivery: true,
    },
  };

  let user = await prisma.user.findFirst({
    where: { clerkId },
    include: {
      registrations: registrationInclude,
    },
  });

  if (!user) {
    await upsertUserFromClerk({ clerkId });
    user = await prisma.user.findFirst({
      where: { clerkId },
      include: {
        registrations: registrationInclude,
      },
    });
  }

  if (!user) {
    throw new ApiError(404, "User not found in database");
  }

  // Auto-relink orphaned registrations if user logged in via different account/phone
  if (user.email || user.phone) {
    const cleanPhone = user.phone?.replace(/\D/g, "");
    const unlinked = await prisma.registration.findMany({
      where: {
        userId: { not: user.id },
        OR: [
          ...(user.email ? [{ user: { email: { equals: user.email, mode: "insensitive" as const } } }] : []),
          ...(cleanPhone && cleanPhone.length >= 8
            ? [
                { user: { phone: { contains: cleanPhone.slice(-10) } } },
                { shippingPhone: { contains: cleanPhone.slice(-10) } },
              ]
            : []),
        ],
      },
      select: { id: true },
    });

    if (unlinked.length > 0) {
      await prisma.registration.updateMany({
        where: { id: { in: unlinked.map((r) => r.id) } },
        data: { userId: user.id },
      });
      user = await prisma.user.findFirst({
        where: { id: user.id },
        include: { registrations: registrationInclude },
      });
    }
  }

  response.json({ data: user });
}

/**
 * Public check/provision endpoint for sign-in assistance.
 * If a registered runner types an email that doesn't yet exist in Clerk,
 * this endpoint provisions their Clerk identity in real-time so they can
 * sign in without hitting "Couldn't find your account".
 */
export async function ensureAccountByEmail(request: any, response: Response) {
  const email = (request.body?.email || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new ApiError(400, "Valid email is required");
  }

  const user = await prisma.user.findFirst({
    where: { email },
    include: {
      registrations: {
        where: { payment: { status: "PAID" } },
        select: { id: true, bibNumber: true },
      },
    },
  });

  if (!user) {
    return response.json({ found: false, provisioned: false });
  }

  const { ensureClerkAccountForDbUser } = await import("../services/user.service.js");
  const clerkId = await ensureClerkAccountForDbUser(user.id);

  return response.json({
    found: true,
    provisioned: Boolean(clerkId),
    bibNumber: user.registrations[0]?.bibNumber || null,
  });
}
