import type { Response } from "express";
import { prisma } from "../lib/prisma.js";
import type { AuthenticatedRequest } from "../middleware/clerk-auth.js";
import { ApiError } from "../utils/api-error.js";
import { routeParam } from "../utils/params.js";

type PrizeStatus = "pending" | "processing" | "ready" | "sent" | "dispatched" | "delivered" | "not_eligible";

type PrizeItem = {
  type: string;
  name: string;
  icon: string;
  status: PrizeStatus;
  statusLabel: string;
  tracking?: { courier: string; number: string; url: string } | null;
  action?: { label: string; href: string } | null;
};

type TimelineStage = {
  stage: "registered" | "paid" | "proof_submitted" | "proof_approved" | "prizes";
  label: string;
  date: string | null;
  done: boolean;
};

function getPrizeStatus(medalStatus: string | null, certificateStatus: string | null, type: string): { status: PrizeStatus; statusLabel: string } {
  if (type === "certificate") {
    if (certificateStatus === "SENT") return { status: "sent", statusLabel: "Emailed" };
    if (certificateStatus === "GENERATED") return { status: "ready", statusLabel: "Ready" };
    if (certificateStatus === "QUEUED") return { status: "processing", statusLabel: "Processing" };
    return { status: "pending", statusLabel: "After verification" };
  }
  if (type === "medal") {
    if (medalStatus === "DELIVERED") return { status: "delivered", statusLabel: "Delivered" };
    if (medalStatus === "DISPATCHED") return { status: "dispatched", statusLabel: "On the way" };
    if (medalStatus === "PENDING") return { status: "processing", statusLabel: "Preparing" };
    if (medalStatus === "NOT_ELIGIBLE") return { status: "not_eligible", statusLabel: "Not eligible" };
    return { status: "pending", statusLabel: "After verification" };
  }
  return { status: "pending", statusLabel: "Pending" };
}

function buildTimeline(
  registeredAt: Date,
  paymentStatus: string | null,
  proofStatus: string,
  hasPrizes: boolean,
): TimelineStage[] {
  return [
    { stage: "registered", label: "Registration confirmed", date: registeredAt.toISOString(), done: true },
    { stage: "paid", label: "Payment completed", date: paymentStatus === "PAID" ? registeredAt.toISOString() : null, done: paymentStatus === "PAID" },
    { stage: "proof_submitted", label: "GPS proof submitted", date: null, done: proofStatus !== "NOT_SUBMITTED" },
    { stage: "proof_approved", label: "Proof verified", date: null, done: proofStatus === "APPROVED" },
    { stage: "prizes", label: "Prizes dispatched", date: null, done: hasPrizes },
  ];
}

function buildPrizeItems(
  benefits: string[],
  medalStatus: string | null,
  certificateStatus: string | null,
  medalTracking: { courier: string | null; trackingNumber: string | null; trackingUrl: string | null } | null,
  certificateNumber: string | null,
): PrizeItem[] {
  const items: PrizeItem[] = [];

  // Certificate always comes first
  const certStatus = getPrizeStatus(null, certificateStatus, "certificate");
  items.push({
    type: "certificate",
    name: "E-Certificate",
    icon: "certificate",
    ...certStatus,
    action: certificateStatus && certificateStatus !== "QUEUED" && certificateNumber
      ? { label: "View certificate", href: `/certificates/${certificateNumber}` }
      : null,
  });

  // Medal if in benefits or medalIncluded
  const hasMedal = benefits.some((b) => b.toLowerCase().includes("medal")) || medalStatus !== null;
  if (hasMedal) {
    const medalInfo = getPrizeStatus(medalStatus, null, "medal");
    items.push({
      type: "medal",
      name: "Finisher Medal",
      icon: "medal",
      ...medalInfo,
      tracking: medalTracking?.trackingNumber
        ? { courier: medalTracking.courier ?? "Courier", number: medalTracking.trackingNumber, url: medalTracking.trackingUrl ?? "" }
        : null,
      action: medalTracking?.trackingUrl
        ? { label: "Track package", href: medalTracking.trackingUrl }
        : medalStatus === "DELIVERED" && medalTracking?.trackingNumber
          ? { label: "Track package", href: medalTracking.trackingUrl ?? "#" }
          : null,
    });
  }

  // T-shirt if in benefits
  const hasTshirt = benefits.some((b) => b.toLowerCase().includes("shirt") || b.toLowerCase().includes("tshirt") || b.toLowerCase().includes("t-shirt") || b.toLowerCase().includes("merch"));
  if (hasTshirt) {
    items.push({
      type: "tshirt",
      name: "Event T-Shirt",
      icon: "tshirt",
      status: medalStatus === "DISPATCHED" || medalStatus === "DELIVERED" ? "processing" as PrizeStatus : "pending" as PrizeStatus,
      statusLabel: medalStatus === "DISPATCHED" || medalStatus === "DELIVERED" ? "Preparing" : "After verification",
    });
  }

  return items;
}

export async function lookupPrizeByBib(request: AuthenticatedRequest, response: Response) {
  const query = routeParam(request, "bibNumber").trim();
  const cleanDigits = query.replace(/\D/g, "");
  const alphanumeric = query.replace(/[^a-zA-Z0-9]/g, "");

  const registration = await prisma.registration.findFirst({
    where: {
      OR: [
        { id: query },
        { bibNumber: { equals: query, mode: "insensitive" } },
        { bibNumber: { contains: query, mode: "insensitive" } },
        ...(alphanumeric.length >= 4 ? [{ bibNumber: { contains: alphanumeric, mode: "insensitive" as const } }] : []),
        ...(cleanDigits.length >= 4 ? [{ bibNumber: { contains: cleanDigits, mode: "insensitive" as const } }] : []),
        { user: { email: { equals: query, mode: "insensitive" } } },
        { user: { name: { contains: query, mode: "insensitive" } } },
        { shippingName: { contains: query, mode: "insensitive" } },
        ...(cleanDigits.length >= 8
          ? [
              { shippingPhone: { contains: cleanDigits.slice(-10) } },
              { user: { phone: { contains: cleanDigits.slice(-10) } } },
            ]
          : []),
      ],
    },
    orderBy: { registeredAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      event: { select: { title: true, slug: true, distances: true, benefits: true } },
      payment: { select: { status: true } },
      certificate: true,
      medalDelivery: true,
    },
  });

  if (!registration) {
    throw new ApiError(404, "No registration found for this bib number, email, or phone");
  }

  const prizes = buildPrizeItems(
    registration.event.benefits,
    registration.medalDelivery?.status ?? null,
    registration.certificate?.status ?? null,
    registration.medalDelivery
      ? { courier: registration.medalDelivery.courier, trackingNumber: registration.medalDelivery.trackingNumber, trackingUrl: registration.medalDelivery.trackingUrl }
      : null,
    registration.certificate?.certificateNumber ?? null,
  );

  const hasPrizes = prizes.some((p) => p.status !== "pending" && p.status !== "not_eligible");

  const timeline = buildTimeline(
    registration.registeredAt,
    registration.payment?.status ?? null,
    registration.proofStatus,
    hasPrizes,
  );

  response.json({
    data: {
      runner: {
        name: registration.user.name,
        bibNumber: registration.bibNumber,
      },
      event: {
        title: registration.event.title,
        slug: registration.event.slug,
        distance: registration.distance,
      },
      timeline,
      prizes,
    },
  });
}

export async function myPrizes(request: AuthenticatedRequest, response: Response) {
  const clerkId = request.auth?.userId;
  if (!clerkId) throw new ApiError(401, "Not authenticated");

  const user = await prisma.user.findFirst({ where: { clerkId } });
  if (!user) throw new ApiError(404, "User not found");

  const registrations = await prisma.registration.findMany({
    where: { userId: user.id },
    orderBy: { registeredAt: "desc" },
    include: {
      event: { select: { title: true, slug: true, distances: true, benefits: true } },
      payment: { select: { status: true } },
      certificate: true,
      medalDelivery: true,
    },
  });

  const data = registrations.map((reg) => {
    const prizes = buildPrizeItems(
      reg.event.benefits,
      reg.medalDelivery?.status ?? null,
      reg.certificate?.status ?? null,
      reg.medalDelivery
        ? { courier: reg.medalDelivery.courier, trackingNumber: reg.medalDelivery.trackingNumber, trackingUrl: reg.medalDelivery.trackingUrl }
        : null,
      reg.certificate?.certificateNumber ?? null,
    );

    const hasPrizes = prizes.some((p) => p.status !== "pending" && p.status !== "not_eligible");
    const timeline = buildTimeline(reg.registeredAt, reg.payment?.status ?? null, reg.proofStatus, hasPrizes);

    return {
      registrationId: reg.id,
      event: {
        title: reg.event.title,
        slug: reg.event.slug,
        distance: reg.distance,
      },
      timeline,
      prizes,
    };
  });

  response.json({ data });
}
