import { createClerkClient } from "@clerk/backend";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";

const clerkClient = env.clerkEnabled
  ? createClerkClient({ secretKey: env.clerkSecretKey })
  : null;

export type SyncUserInput = {
  clerkId: string;
  email?: string;
  name?: string;
  username?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
};

/**
 * Upsert a local DB user from a Clerk identity.
 * Prefer clerkId; fall back to email match for legacy rows.
 */
export async function upsertUserFromClerk(input: SyncUserInput) {
  const clerkId = input.clerkId.trim();
  if (!clerkId) {
    throw new ApiError(400, "clerkId is required");
  }

  let email = input.email?.trim().toLowerCase();
  let name = input.name?.trim();
  let username = input.username?.trim() || null;
  let phone = input.phone?.trim() || null;
  let avatarUrl = input.avatarUrl?.trim() || null;

  // Prefer live Clerk profile when server has the secret.
  if (clerkClient) {
    try {
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const primaryEmail =
        clerkUser.emailAddresses.find((item) => item.id === clerkUser.primaryEmailAddressId)
          ?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;
      const primaryPhone =
        clerkUser.phoneNumbers.find((item) => item.id === clerkUser.primaryPhoneNumberId)
          ?.phoneNumber ?? clerkUser.phoneNumbers[0]?.phoneNumber;

      email = primaryEmail?.toLowerCase() ?? email;
      name =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
        clerkUser.username ||
        name;
      username = clerkUser.username ?? username;
      phone = primaryPhone ?? phone;
      avatarUrl = clerkUser.imageUrl ?? avatarUrl;
    } catch {
      // Fall back to client-provided fields if Clerk fetch fails.
    }
  }

  if (!email) {
    throw new ApiError(400, "Email is required to create a user in the database");
  }

  if (!name) {
    name = email.split("@")[0] || "Runner";
  }

  // Prefer stable auto username from email when Clerk has none (Google OAuth often has no username).
  if (!username) {
    const base = email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
      .slice(0, 18);
    username = base.length >= 3 ? base : `runner_${clerkId.slice(-6)}`;
  }

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ clerkId }, { email }],
    },
  });

  if (existing) {
    // Never steal another user's username; keep existing if conflict or empty update.
    let nextUsername = existing.username ?? username;
    if (username && username !== existing.username) {
      const taken = await prisma.user.findFirst({
        where: { username, NOT: { id: existing.id } },
        select: { id: true },
      });
      if (!taken) {
        nextUsername = username;
      }
    }

    const shouldBeSuperAdmin = Boolean(email && env.adminEmails.includes(email));

    return prisma.user.update({
      where: { id: existing.id },
      data: {
        clerkId,
        email,
        name: name || existing.name,
        username: nextUsername,
        phone: phone ?? existing.phone,
        avatarUrl: avatarUrl ?? existing.avatarUrl,
        ...(shouldBeSuperAdmin ? { role: "SUPER_ADMIN" } : {}),
      },
    });
  }

  // Ensure unique username on create
  let uniqueUsername = username;
  const clash = await prisma.user.findFirst({
    where: { username: uniqueUsername },
    select: { id: true },
  });
  if (clash) {
    uniqueUsername = `${username.slice(0, 12)}_${clerkId.slice(-4)}`;
  }

  return prisma.user.create({
    data: {
      clerkId,
      email,
      name,
      username: uniqueUsername,
      phone,
      avatarUrl,
      role: env.adminEmails.includes(email) ? "SUPER_ADMIN" : "RUNNER",
    },
  });
}
