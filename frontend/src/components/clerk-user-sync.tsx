"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { authHeaders, resilientFetch } from "../lib/api";

/**
 * After Clerk login, push the user into our Postgres DB.
 * Safe to mount globally — runs once per signed-in user id.
 */
export function ClerkUserSync() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const lastSyncedId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user?.id) {
      return;
    }

    if (lastSyncedId.current === user.id) {
      return;
    }

    let cancelled = false;

    async function sync() {
      try {
        const token = await getToken();
        if (!token || cancelled) {
          return;
        }

        const response = await resilientFetch("/api/users/sync", {
          method: "POST",
          headers: authHeaders(token),
          body: JSON.stringify({
            clerkId: user!.id,
            email: user!.primaryEmailAddress?.emailAddress,
            name: user!.fullName ?? user!.firstName ?? undefined,
            username: user!.username ?? undefined,
            phone: user!.primaryPhoneNumber?.phoneNumber ?? undefined,
            avatarUrl: user!.imageUrl,
          }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => null);
          console.warn(
            "[ClerkUserSync] DB sync failed:",
            error?.error?.message ?? response.statusText,
          );
          return;
        }

        lastSyncedId.current = user!.id;
      } catch (error) {
        console.warn("[ClerkUserSync] DB sync error:", error);
      }
    }

    void sync();

    return () => {
      cancelled = true;
    };
  }, [getToken, isLoaded, isSignedIn, user]);

  return null;
}
