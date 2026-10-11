import type { Event, EventStatus } from "@prisma/client";
import { defaultEvents } from "../data/default-events.js";
import { prisma } from "../lib/prisma.js";

export type EventPhase = "upcoming" | "live" | "past";

export function getEventPhase(
  event: Pick<Event, "status" | "startsAt" | "endsAt">,
  now = new Date(),
): EventPhase {
  if (
    event.status === "COMPLETED" ||
    event.status === "CLOSED" ||
    event.status === "CANCELLED" ||
    event.endsAt.getTime() < now.getTime()
  ) {
    return "past";
  }

  if (event.startsAt.getTime() <= now.getTime() && event.endsAt.getTime() >= now.getTime()) {
    return "live";
  }

  return "upcoming";
}

export function isRegistrationOpen(
  event: Pick<Event, "status" | "startsAt" | "endsAt">,
  now = new Date(),
) {
  if (event.status !== "OPEN") {
    return false;
  }

  // Allow register until the event window ends
  return event.endsAt.getTime() >= now.getTime();
}

export function withEventMeta<T extends Pick<Event, "status" | "startsAt" | "endsAt">>(event: T) {
  const phase = getEventPhase(event);
  return {
    ...event,
    phase,
    registrationOpen: isRegistrationOpen(event),
  };
}

/** Ensure starter catalog events exist in the database. */
export async function ensureDefaultEvents() {
  for (const event of defaultEvents) {
    const existing = await prisma.event.findUnique({
      where: { slug: event.slug },
      select: { id: true },
    });
    if (!existing) {
      await prisma.event.create({
        data: {
          ...event,
          medalIncluded: event.medalIncluded ?? true,
          benefits: event.benefits ?? [],
        },
      });
    }
  }
}

export function scopeWhere(scope?: string) {
  const now = new Date();
  const normalized = (scope ?? "all").toLowerCase();

  if (normalized === "upcoming" || normalized === "open") {
    return {
      status: "OPEN" as EventStatus,
      endsAt: { gte: now },
    };
  }

  if (normalized === "past" || normalized === "completed") {
    return {
      OR: [
        { status: { in: ["COMPLETED", "CLOSED", "CANCELLED"] as EventStatus[] } },
        { endsAt: { lt: now } },
      ],
    };
  }

  if (normalized === "live") {
    return {
      status: "OPEN" as EventStatus,
      startsAt: { lte: now },
      endsAt: { gte: now },
    };
  }

  // all public-ish events (hide pure drafts by default)
  return {
    status: { not: "DRAFT" as EventStatus },
  };
}
