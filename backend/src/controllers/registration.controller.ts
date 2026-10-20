import type { Response } from "express";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import type { AuthenticatedRequest } from "../middleware/clerk-auth.js";
import { createBibNumber } from "../services/bib.service.js";
import {
  createCertificateNumber,
  createCertificateQrPayload,
} from "../services/certificate.service.js";
import { ensureDefaultEvents, isRegistrationOpen } from "../services/event.service.js";
import { createRazorpayOrder } from "../services/razorpay.service.js";
import { upsertUserFromClerk } from "../services/user.service.js";
import { resolveCouponDiscount } from "./payment.controller.js";
import { ApiError } from "../utils/api-error.js";
import { logger } from "../utils/logger.js";
import { routeParam } from "../utils/params.js";
import { validateBody } from "../utils/validate.js";
import {
  createRegistrationSchema,
  reviewProofSchema,
  submitProofSchema,
} from "../validators/registration.validator.js";

async function generateFreshOrderForRegistration(regId: string, bibNumber: string, amountInPaise: number) {
  try {
    const order = await createRazorpayOrder({
      amountInPaise,
      receipt: bibNumber,
      registrationId: regId,
    });

    const payment = await prisma.payment.upsert({
      where: { registrationId: regId },
      create: {
        registrationId: regId,
        razorpayOrderId: order.id,
        amountInPaise: order.amount,
        status: "CREATED",
      },
      update: {
        razorpayOrderId: order.id,
        amountInPaise: order.amount,
        status: "CREATED",
        razorpayPaymentId: null,
        razorpaySignature: null,
        paidAt: null,
      },
    });

    return {
      keyId: env.razorpayKeyId,
      orderId: order.id,
      amountInPaise: order.amount,
      currency: order.currency,
      registrationId: regId,
      bibNumber,
      payment,
    };
  } catch (err) {
    logger.warn("[createRegistration] Could not pre-generate Razorpay order, client will fallback", {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

export async function createRegistration(request: AuthenticatedRequest, response: Response) {
  const payload = validateBody(createRegistrationSchema, request);
  await ensureDefaultEvents();

  let event = payload.eventId
    ? await prisma.event.findUnique({ where: { id: payload.eventId } })
    : await prisma.event.findUnique({ where: { slug: payload.eventSlug } });

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  if (!isRegistrationOpen(event)) {
    throw new ApiError(
      422,
      event.status === "COMPLETED" || event.endsAt.getTime() < Date.now()
        ? "This event has already ended. Registration is closed."
        : "Registration is not open for this event.",
    );
  }

  if (!event.distances.includes(payload.distance)) {
    throw new ApiError(422, "Selected distance is not available for this event");
  }

  const availableTypes = event.activityTypes.length > 0 ? event.activityTypes : ["running"];
  const selectedType = payload.activityType ?? "running";
  if (!availableTypes.includes(selectedType)) {
    throw new ApiError(422, "Selected activity type is not available for this event");
  }

  if (event.maxCapacity != null) {
    const filled = await prisma.registration.count({
      where: {
        eventId: event.id,
        status: { in: ["PENDING_PAYMENT", "CONFIRMED", "COMPLETED"] },
      },
    });
    if (filled >= event.maxCapacity) {
      throw new ApiError(422, "This event is full. Registration is closed.");
    }
  }

  const clerkId = payload.clerkId ?? request.auth?.userId;
  const email = payload.email?.toLowerCase();

  let user = null;

  if (clerkId) {
    user = await upsertUserFromClerk({
      clerkId,
      email,
      name: payload.name ?? payload.shippingName,
      phone: payload.phone ?? payload.shippingPhone,
      username: payload.username,
    });
  } else if (payload.userId) {
    user = await prisma.user.findUnique({ where: { id: payload.userId } });
  } else if (email) {
    const existing = await prisma.user.findFirst({
      where: { email },
    });

    if (existing) {
      user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: payload.name ?? payload.shippingName ?? existing.name,
          phone: payload.phone ?? payload.shippingPhone ?? existing.phone,
        },
      });
    } else {
      let desiredUsername = payload.username;
      if (!desiredUsername) {
        const base = email
          .split("@")[0]
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, "_")
          .replace(/_+/g, "_")
          .replace(/^_|_$/g, "")
          .slice(0, 18);
        desiredUsername = base.length >= 3 ? base : "runner";
      }

      let uniqueUsername = desiredUsername;
      const clash = await prisma.user.findFirst({
        where: { username: uniqueUsername },
        select: { id: true },
      });
      if (clash) {
        uniqueUsername = `${desiredUsername.slice(0, 12)}_${Math.random().toString(36).substring(2, 6)}`;
      }

      user = await prisma.user.create({
        data: {
          name: payload.name ?? payload.shippingName ?? "Runner",
          email,
          phone: payload.phone ?? payload.shippingPhone,
          username: uniqueUsername,
        },
      });
    }
  }

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const freeEntry = !event.paymentRequired || event.priceInPaise <= 0;

  // Unique key is (userId + eventId + distance) — other events/distances are always allowed.
  const existingRegistration = await prisma.registration.findUnique({
    where: {
      userId_eventId_distance: {
        userId: user.id,
        eventId: event.id,
        distance: payload.distance,
      },
    },
    include: { event: true, user: true, payment: true },
  });

  if (existingRegistration) {
    // Resume unpaid checkout for the exact same event + distance only.
    if (
      existingRegistration.status !== "CONFIRMED" &&
      existingRegistration.status !== "COMPLETED" &&
      existingRegistration.payment?.status !== "PAID"
    ) {
      const updated = await prisma.registration.update({
        where: { id: existingRegistration.id },
        data: {
          shippingName: payload.shippingName,
          shippingPhone: payload.shippingPhone,
          shippingLine1: payload.shippingLine1,
          shippingLine2: payload.shippingLine2,
          shippingCity: payload.shippingCity,
          shippingState: payload.shippingState,
          shippingPincode: payload.shippingPincode,
          activityType: selectedType,
        },
        include: { event: true, user: true, payment: true },
      });

      let order = null;
      if (!freeEntry) {
        order = await generateFreshOrderForRegistration(updated.id, updated.bibNumber, event.priceInPaise);
      }

      response.status(200).json({
        data: {
          ...updated,
          registration: updated,
          order,
        },
        meta: {
          freeEntry: false,
          resumed: true,
          message: `Resuming payment for ${event.title} (${payload.distance}).`,
        },
      });
      return;
    }

    throw new ApiError(
      409,
      `You are already registered for ${payload.distance} in “${event.title}”. Pick another distance or a different event.`,
    );
  }

  let registration;
  try {
    registration = await prisma.registration.create({
      data: {
        userId: user.id,
        eventId: event.id,
        distance: payload.distance,
        activityType: selectedType,
        status: freeEntry ? "CONFIRMED" : "PENDING_PAYMENT",
        shippingName: payload.shippingName,
        shippingPhone: payload.shippingPhone,
        shippingLine1: payload.shippingLine1,
        shippingLine2: payload.shippingLine2,
        shippingCity: payload.shippingCity,
        shippingState: payload.shippingState,
        shippingPincode: payload.shippingPincode,
        bibNumber: createBibNumber(event.slug),
      },
      include: {
        event: true,
        user: true,
        payment: true,
      },
    });
  } catch (error) {
    // Race / unique collision → re-read and resume if pending
    const raced = await prisma.registration.findUnique({
      where: {
        userId_eventId_distance: {
          userId: user.id,
          eventId: event.id,
          distance: payload.distance,
        },
      },
      include: { event: true, user: true, payment: true },
    });
    if (
      raced &&
      raced.status !== "CONFIRMED" &&
      raced.status !== "COMPLETED" &&
      raced.payment?.status !== "PAID"
    ) {
      let chargedAmount = event.priceInPaise;
      if (payload.couponCode) {
        const couponResult = await resolveCouponDiscount(payload.couponCode, event);
        if (couponResult.valid) {
          chargedAmount = Math.max(100, event.priceInPaise - couponResult.discountPaise);
        }
      }

      let order = null;
      if (!freeEntry) {
        order = await generateFreshOrderForRegistration(raced.id, raced.bibNumber, chargedAmount);
      }
      response.status(200).json({
        data: {
          ...raced,
          registration: raced,
          order,
        },
        meta: { freeEntry: false, resumed: true },
      });
      return;
    }
    if (raced) {
      throw new ApiError(
        409,
        `You are already registered for ${payload.distance} in “${event.title}”.`,
      );
    }
    throw error;
  }

  // Apply referral code if provided
  if (payload.referralCode && user.clerkId) {
    const referrer = await prisma.user.findUnique({ where: { referralCode: payload.referralCode.toUpperCase() } });
    if (referrer && referrer.id !== user.id) {
      const existingRef = await prisma.referral.findUnique({ where: { refereeId: user.id } });
      if (!existingRef) {
        await prisma.referral.create({
          data: {
            referrerId: referrer.id,
            refereeId: user.id,
            code: payload.referralCode.toUpperCase(),
            status: freeEntry ? "converted" : "pending",
          },
        });
      }
    }
  }

  let chargedAmount = event.priceInPaise;
  if (payload.couponCode) {
    const couponResult = await resolveCouponDiscount(payload.couponCode, event);
    if (couponResult.valid) {
      chargedAmount = Math.max(100, event.priceInPaise - couponResult.discountPaise);
    }
  }

  let order = null;
  if (!freeEntry) {
    order = await generateFreshOrderForRegistration(registration.id, registration.bibNumber, chargedAmount);
  }

  response.status(201).json({
    data: {
      ...registration,
      registration,
      order,
    },
    meta: { freeEntry },
  });
}

export async function submitProof(request: AuthenticatedRequest, response: Response) {
  const payload = validateBody(submitProofSchema, request);
  const registrationId = routeParam(request, "id");

  const existing = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: {
      user: true,
      payment: true,
      proofUpload: true,
      event: true,
    },
  });

  if (!existing) {
    throw new ApiError(404, "Registration not found");
  }

  // Ownership: signed-in Clerk user must own this registration (when Clerk is on).
  const clerkId = request.auth?.userId;
  if (clerkId && existing.user.clerkId && existing.user.clerkId !== clerkId) {
    throw new ApiError(403, "You can only submit proof for your own registration");
  }

  const isPaid =
    existing.status === "CONFIRMED" ||
    existing.status === "COMPLETED" ||
    existing.payment?.status === "PAID" ||
    !existing.event.paymentRequired ||
    existing.event.priceInPaise <= 0;

  if (!isPaid) {
    throw new ApiError(422, "Complete payment before uploading GPS proof");
  }

  if (existing.proofStatus === "APPROVED") {
    throw new ApiError(409, "Proof already approved. Contact support to re-submit.");
  }

  if (existing.proofStatus === "SUBMITTED") {
    throw new ApiError(
      409,
      "Proof already submitted and waiting for review. You can re-upload only after rejection.",
    );
  }

  const registration = await prisma.registration.update({
    where: { id: registrationId },
    data: {
      proofStatus: "SUBMITTED",
      finishTimeSeconds: payload.finishTimeSeconds ?? existing.finishTimeSeconds,
      proofUpload: {
        upsert: {
          create: {
            activityImageUrl: payload.activityImageUrl,
            sourceApp: payload.sourceApp,
            status: "SUBMITTED",
          },
          update: {
            activityImageUrl: payload.activityImageUrl,
            sourceApp: payload.sourceApp,
            submittedAt: new Date(),
            status: "SUBMITTED",
            reviewerNote: null,
            reviewedAt: null,
          },
        },
      },
    },
    include: { proofUpload: true, event: true },
  });

  response.json({
    data: registration,
    meta: {
      message: "Proof submitted. Our team will review it for leaderboard and certificate.",
    },
  });
}

export async function reviewProof(request: AuthenticatedRequest, response: Response) {
  const payload = validateBody(reviewProofSchema, request);
  const registrationId = routeParam(request, "id");
  const status = payload.approved ? "APPROVED" : "REJECTED";

  const registration = await prisma.registration.update({
    where: { id: registrationId },
    data: {
      proofStatus: status,
      finishTimeSeconds: payload.finishTimeSeconds,
      proofUpload: {
        update: {
          status,
          reviewerNote: payload.reviewerNote,
          reviewedAt: new Date(),
        },
      },
    },
  });

  if (payload.approved) {
    const certificateNumber = createCertificateNumber(registration.bibNumber);
    await prisma.certificate.upsert({
      where: { registrationId },
      create: {
        registrationId,
        certificateNumber,
        qrPayload: createCertificateQrPayload(certificateNumber),
        status: "QUEUED",
      },
      update: {
        status: "QUEUED",
      },
    });

    await prisma.medalDelivery.upsert({
      where: { registrationId },
      create: { registrationId, status: "PENDING" },
      update: { status: "PENDING" },
    });
  }

  response.json({ data: registration });
}

const INDIAN_RUNNERS_ROSTER = [
  { name: "Aarav Sharma", city: "Bengaluru", state: "Karnataka" },
  { name: "Nisha Rawat", city: "Dehradun", state: "Uttarakhand" },
  { name: "Kabir Sethi", city: "Delhi NCR", state: "Delhi" },
  { name: "Meera Joshi", city: "Pune", state: "Maharashtra" },
  { name: "Rohan Kapoor", city: "Chandigarh", state: "Punjab" },
  { name: "Ananya Iyer", city: "Chennai", state: "Tamil Nadu" },
  { name: "Dev Malhotra", city: "Mumbai", state: "Maharashtra" },
  { name: "Isha Verma", city: "Jaipur", state: "Rajasthan" },
  { name: "Vikramaditya Rao", city: "Hyderabad", state: "Telangana" },
  { name: "Simran Kaur", city: "Amritsar", state: "Punjab" },
  { name: "Tanmay Deshmukh", city: "Nagpur", state: "Maharashtra" },
  { name: "Sneha Kulkarni", city: "Pune", state: "Maharashtra" },
  { name: "Aditya Banerjee", city: "Kolkata", state: "West Bengal" },
  { name: "Pooja Choudhary", city: "Jaipur", state: "Rajasthan" },
  { name: "Raghav Varma", city: "Lucknow", state: "Uttar Pradesh" },
  { name: "Ritu Patel", city: "Ahmedabad", state: "Gujarat" },
  { name: "Siddharth Nair", city: "Kochi", state: "Kerala" },
  { name: "Neha Chawla", city: "Gurgaon", state: "Haryana" },
  { name: "Karan Oberoi", city: "Noida", state: "Uttar Pradesh" },
  { name: "Aayushi Gupta", city: "Indore", state: "Madhya Pradesh" },
  { name: "Harshvardhan Reddy", city: "Hyderabad", state: "Telangana" },
  { name: "Deepa Subramanian", city: "Bengaluru", state: "Karnataka" },
  { name: "Alok Srivastava", city: "Varanasi", state: "Uttar Pradesh" },
  { name: "Kriti Saxena", city: "Bhopal", state: "Madhya Pradesh" },
  { name: "Manish Joshi", city: "Shimla", state: "Himachal Pradesh" },
  { name: "Swati Hegde", city: "Mangaluru", state: "Karnataka" },
  { name: "Gaurav Tiwari", city: "Kanpur", state: "Uttar Pradesh" },
  { name: "Shreya Sen", city: "Kolkata", state: "West Bengal" },
  { name: "Tarun Bhatia", city: "Delhi NCR", state: "Delhi" },
  { name: "Divya Menon", city: "Thiruvananthapuram", state: "Kerala" },
  { name: "Rahul Pillai", city: "Coimbatore", state: "Tamil Nadu" },
  { name: "Namrata Shinde", city: "Mumbai", state: "Maharashtra" },
  { name: "Abhinav Jha", city: "Patna", state: "Bihar" },
  { name: "Priyanka Das", city: "Guwahati", state: "Assam" },
  { name: "Sameer Kulkarni", city: "Nashik", state: "Maharashtra" },
  { name: "Kavita Bisht", city: "Nainital", state: "Uttarakhand" },
  { name: "Prateek Mehra", city: "Faridabad", state: "Haryana" },
  { name: "Varun Kaushik", city: "Ghaziabad", state: "Uttar Pradesh" },
  { name: "Ankita Roy", city: "Ranchi", state: "Jharkhand" },
  { name: "Naveen Choudhury", city: "Bhubaneswar", state: "Odisha" },
];

function parseDistanceKm(distanceStr: string): number {
  if (!distanceStr) return 5;
  const lower = distanceStr.toLowerCase().trim();
  if (lower.includes("half") || lower.includes("21.1")) return 21.0975;
  if (lower.includes("full") || (lower.includes("marathon") && !lower.includes("half"))) return 42.195;
  const match = distanceStr.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (match && match[1]) {
    const parsed = parseFloat(match[1]);
    if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  }
  return 5;
}

// Generate a deterministic pseudo-random hash for consistency
function hashSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getBasePacesForDistance(km: number): number[] {
  // Base pace in seconds per km scaled realistically by race distance
  // Sprints (1.5k - 3k) are faster (~3:20 to 7:20/km), while 20k - 30k are endurance paces (~4:30 to 8:40/km)
  let startPace = 215; // ~3:35/km for 5k
  if (km <= 2) startPace = 200; // ~3:20/km
  else if (km <= 3) startPace = 210; // ~3:30/km
  else if (km <= 5) startPace = 225; // ~3:45/km
  else if (km <= 10) startPace = 245; // ~4:05/km
  else if (km <= 15) startPace = 265; // ~4:25/km
  else if (km <= 21.1) startPace = 275; // ~4:35/km
  else if (km <= 25) startPace = 285; // ~4:45/km
  else startPace = 295; // ~4:55/km for 30k+

  // Progressive distribution from Rank 1 to Rank 35+
  return Array.from({ length: 40 }, (_, i) => {
    const spread = Math.round(startPace + Math.pow(i, 1.35) * 2.8);
    return spread;
  });
}

function generatePaddedLeaderboard(eventSlug: string, distance: string, minCount = 35) {
  const km = parseDistanceKm(distance);
  const seed = hashSeed(`${eventSlug}-${distance}`);
  const cleanCode = distance.replace(/[^a-zA-Z0-9.]/g, "").toUpperCase() || "RUN";
  const basePaces = getBasePacesForDistance(km);

  return INDIAN_RUNNERS_ROSTER.slice(0, Math.max(minCount, basePaces.length)).map((profile, idx) => {
    const variance = ((seed + idx * 7) % 7) - 3;
    const paceSec = Math.max(190, basePaces[idx % basePaces.length] + variance);
    const finishSeconds = Math.round(km * paceSec);
    const bibNum = 101 + idx;
    const bibNumber = `MR-${cleanCode}-${String(bibNum).padStart(3, "0")}`;

    return {
      runnerName: profile.name,
      city: profile.city,
      state: profile.state,
      distance: distance,
      finishTimeSeconds: finishSeconds,
      bibNumber,
      status: "Verified" as const,
      isPadded: true,
      userId: `dummy-${idx}`,
      clerkId: null,
    };
  });
}

export async function getLeaderboard(request: AuthenticatedRequest, response: Response) {
  const rawKey = routeParam(request, "eventId");
  const eventKey = decodeURIComponent(rawKey).trim();
  const distanceQuery =
    typeof request.query.distance === "string" && request.query.distance.trim()
      ? request.query.distance.trim().slice(0, 50)
      : undefined;

  await ensureDefaultEvents();

  // Accept either event id, exact slug, case-insensitive slug, or title
  const event = await prisma.event.findFirst({
    where: {
      OR: [
        { id: eventKey },
        { slug: eventKey },
        { slug: { equals: eventKey, mode: "insensitive" } },
        { title: { equals: eventKey, mode: "insensitive" } },
      ],
    },
  });

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  // Available distances list (fallback to standard set if empty)
  const availableDistances =
    event.distances && event.distances.length > 0
      ? event.distances
      : ["1.5 km", "1.6 km", "3 km", "5 km", "10 km", "15 km", "20 km", "25 km", "30 km"];

  // Normalize selected distance (match case-insensitively or default to first available)
  let activeDistance = availableDistances[0] || "5 km";
  if (distanceQuery && distanceQuery !== "all") {
    const matched = availableDistances.find(
      (d) => d.toLowerCase().replace(/\s+/g, "") === distanceQuery.toLowerCase().replace(/\s+/g, ""),
    );
    activeDistance = matched || distanceQuery;
  }

  const activeKm = parseDistanceKm(activeDistance);
  const minRealisticSeconds = Math.round(activeKm * 150); // Min ~2:30/km world record pace

  // Fetch real approved finishers for this event and distance
  const approvedRegistrations = await prisma.registration.findMany({
    where: {
      eventId: event.id,
      proofStatus: "APPROVED",
      finishTimeSeconds: { not: null },
      ...(distanceQuery && distanceQuery !== "all"
        ? {
            distance: {
              equals: activeDistance,
              mode: "insensitive",
            },
          }
        : {}),
    },
    orderBy: { finishTimeSeconds: "asc" },
    include: { user: true, event: true },
    take: 100,
  });

  // Fetch all registered participants for the Event Roster tab
  const allParticipants = await prisma.registration.findMany({
    where: {
      eventId: event.id,
      status: { in: ["CONFIRMED", "COMPLETED", "PENDING_PAYMENT"] },
      ...(distanceQuery && distanceQuery !== "all"
        ? {
            distance: {
              equals: activeDistance,
              mode: "insensitive",
            },
          }
        : {}),
    },
    orderBy: { registeredAt: "desc" },
    include: { user: true, proofUpload: true },
    take: 150,
  });

  // Check if current authenticated user has registration(s) in this event
  const clerkUserId = request.auth?.userId;
  let userRegistrations: Array<{
    id: string;
    distance: string;
    bibNumber: string;
    proofStatus: string;
    status: string;
    finishTimeSeconds: number | null;
  }> = [];

  if (clerkUserId) {
    const foundUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      include: {
        registrations: {
          where: { eventId: event.id },
        },
      },
    });
    if (foundUser?.registrations) {
      userRegistrations = foundUser.registrations.map((r) => ({
        id: r.id,
        distance: r.distance,
        bibNumber: r.bibNumber,
        proofStatus: r.proofStatus,
        status: r.status,
        finishTimeSeconds: r.finishTimeSeconds,
      }));
    }
  }

  // Transform real approved runners with time sanity verification
  const realLeaderboardRows = approvedRegistrations.map((reg) => {
    let validSeconds = reg.finishTimeSeconds;
    if (validSeconds != null && validSeconds > 0) {
      if (validSeconds < minRealisticSeconds) {
        // If user entered minutes (e.g., 45 instead of 2700) or hours (e.g., 2 instead of 7200)
        if (validSeconds * 60 >= minRealisticSeconds && validSeconds * 60 <= activeKm * 600) {
          validSeconds = validSeconds * 60;
        } else if (validSeconds * 3600 >= minRealisticSeconds && validSeconds * 3600 <= activeKm * 600) {
          validSeconds = validSeconds * 3600;
        } else {
          validSeconds = Math.round(activeKm * 290);
        }
      }
    }

    return {
      runnerName: reg.user.name,
      city: reg.shippingCity || "India",
      state: reg.shippingState || "",
      distance: reg.distance,
      finishTimeSeconds: validSeconds,
      bibNumber: reg.bibNumber,
      status: "Verified" as const,
      isPadded: false,
      userId: reg.user.id,
      clerkId: reg.user.clerkId,
    };
  });

  // Generate deterministic realistic padding if real finishers are under 35
  const paddedRows = generatePaddedLeaderboard(event.slug, activeDistance, 35);

  // Merge real + padded (prioritizing real users)
  const mergedRows = [...realLeaderboardRows];
  for (const dummy of paddedRows) {
    if (mergedRows.length >= 35) break;
    if (!mergedRows.some((r) => r.runnerName.toLowerCase() === dummy.runnerName.toLowerCase())) {
      mergedRows.push(dummy);
    }
  }

  // Sort strictly by finish time ascending
  mergedRows.sort((a, b) => (a.finishTimeSeconds ?? 999999) - (b.finishTimeSeconds ?? 999999));

  // Compute ranks
  const rankedLeaderboard = mergedRows.map((row, index) => ({
    rank: index + 1,
    ...row,
  }));

  // Transform participants list
  const participantRoster = allParticipants.map((p, idx) => ({
    rosterNumber: idx + 1,
    runnerName: p.user.name,
    city: p.shippingCity || "India",
    state: p.shippingState || "",
    distance: p.distance,
    bibNumber: p.bibNumber,
    status:
      p.proofStatus === "APPROVED"
        ? "Verified Finisher"
        : p.proofStatus === "SUBMITTED"
          ? "Under Review"
          : p.status === "CONFIRMED"
            ? "Confirmed Runner"
            : "Registered",
    proofStatus: p.proofStatus,
    registrationStatus: p.status,
    registeredAt: p.registeredAt,
    finishTimeSeconds: p.finishTimeSeconds,
    userId: p.user.id,
    clerkId: p.user.clerkId,
  }));

  response.json({
    data: rankedLeaderboard,
    participants: participantRoster,
    userRegistrations,
    meta: {
      eventId: event.id,
      eventSlug: event.slug,
      eventTitle: event.title,
      availableDistances,
      selectedDistance: activeDistance,
      totalVerified: rankedLeaderboard.length,
      totalParticipants: participantRoster.length,
    },
  });
}
