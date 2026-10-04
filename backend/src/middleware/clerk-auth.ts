import { createClerkClient, verifyToken } from "@clerk/backend";
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";
import { logger, updateLogContext } from "../utils/logger.js";

export type AuthenticatedRequest = Request & {
  auth?: {
    userId: string;
    sessionId?: string;
  };
};

const clerkClient = env.clerkEnabled
  ? createClerkClient({ secretKey: env.clerkSecretKey })
  : null;

function allowDevBypass() {
  return env.nodeEnv !== "production" && !env.clerkEnabled;
}

function primaryEmailFromClerkUser(user: {
  emailAddresses?: Array<{ id: string; emailAddress: string }>;
  primaryEmailAddressId?: string | null;
}) {
  const list = user.emailAddresses ?? [];
  const primary =
    list.find((item) => item.id === user.primaryEmailAddressId) ?? list[0];
  return primary?.emailAddress?.toLowerCase() ?? null;
}

export async function requireClerkAuth(
  request: AuthenticatedRequest,
  _response: Response,
  next: NextFunction,
) {
  try {
    if (!env.clerkEnabled) {
      if (env.nodeEnv === "production") {
        throw new ApiError(500, "Clerk is not configured on the server");
      }

      // Local development without real Clerk keys.
      next();
      return;
    }

    const header = request.header("authorization");
    if (!header?.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication required. Sign in and try again.");
    }

    const token = header.slice("Bearer ".length).trim();
    if (!token) {
      throw new ApiError(401, "Authentication required. Sign in and try again.");
    }

    let payload;
    try {
      payload = await verifyToken(token, {
        secretKey: env.clerkSecretKey,
        authorizedParties: env.allowedOrigins,
      });
    } catch (azpErr: any) {
      logger.warn(`[ClerkAuth] Strict azp check failed (${azpErr?.message}), retrying signature check`);
      try {
        payload = await verifyToken(token, {
          secretKey: env.clerkSecretKey,
        });
      } catch (finalErr: any) {
        logger.error(`[ClerkAuth] Token verification failed: ${finalErr?.message || finalErr}`);
        throw new ApiError(401, "Invalid or expired authentication token. Please sign in again.");
      }
    }

    if (!payload.sub) {
      throw new ApiError(401, "Invalid authentication token");
    }

    request.auth = {
      userId: payload.sub,
      sessionId: typeof payload.sid === "string" ? payload.sid : undefined,
    };

    updateLogContext({ userId: payload.sub });

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }

    logger.error("[ClerkAuth] Unexpected auth error", error);
    next(new ApiError(401, "Invalid or expired authentication token"));
  }
}

async function elevateToAdmin(clerkId: string, email: string | null, superAdmin: boolean) {
  const role = superAdmin ? "SUPER_ADMIN" : "ADMIN";

  const byClerk = await prisma.user.findFirst({ where: { clerkId } });
  if (byClerk) {
    return prisma.user.update({
      where: { id: byClerk.id },
      data: { role },
    });
  }

  if (email) {
    const byEmail = await prisma.user.findFirst({ where: { email } });
    if (byEmail) {
      return prisma.user.update({
        where: { id: byEmail.id },
        data: { role, clerkId },
      });
    }
  }

  return null;
}

export async function requireAdmin(
  request: AuthenticatedRequest,
  _response: Response,
  next: NextFunction,
) {
  try {
    if (allowDevBypass()) {
      next();
      return;
    }

    if (!env.clerkEnabled || !clerkClient) {
      throw new ApiError(500, "Clerk is not configured on the server");
    }

    if (!request.auth?.userId) {
      throw new ApiError(401, "Authentication required");
    }

    const clerkId = request.auth.userId;

    // 1) DB role already admin
    let dbUser = await prisma.user.findFirst({
      where: { clerkId },
      select: { id: true, role: true, email: true },
    });

    if (dbUser?.role === "ADMIN" || dbUser?.role === "SUPER_ADMIN") {
      next();
      return;
    }

    // 2) Clerk metadata role
    const clerkUser = await clerkClient.users.getUser(clerkId);
    const email = primaryEmailFromClerkUser(clerkUser);
    const metaRole = (clerkUser.publicMetadata?.role ?? clerkUser.privateMetadata?.role) as
      | string
      | undefined;
    const normalized = (metaRole ?? "").toLowerCase().replace(/-/g, "_");
    const metaIsAdmin = normalized === "admin" || normalized === "super_admin";

    // 3) ADMIN_EMAILS allow-list
    const emailIsAdmin = Boolean(email && env.adminEmails.includes(email));

    // 4) Bootstrap first admin (dev default / explicit env)
    let bootstrapOk = false;
    if (env.adminBootstrap) {
      const adminCount = await prisma.user.count({
        where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      });
      bootstrapOk = adminCount === 0;
    }

    if (!metaIsAdmin && !emailIsAdmin && !bootstrapOk) {
      throw new ApiError(
        403,
        "Admin access required. Ask an owner to set your role to ADMIN, or add your email to ADMIN_EMAILS.",
      );
    }

    await elevateToAdmin(
      clerkId,
      email ?? dbUser?.email ?? null,
      normalized === "super_admin" || bootstrapOk,
    );

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }

    next(new ApiError(403, "Admin access required"));
  }
}
