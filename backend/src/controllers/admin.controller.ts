import type { Response } from "express";
import { Prisma, ProofStatus } from "@prisma/client";
import { z } from "zod";
import { createClerkClient } from "@clerk/backend";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import type { AuthenticatedRequest } from "../middleware/clerk-auth.js";
import { logger } from "../utils/logger.js";

const clerkClient = env.clerkEnabled && env.clerkSecretKey
  ? createClerkClient({ secretKey: env.clerkSecretKey })
  : null;
import { Resend } from "resend";
import { writeAdminAudit } from "../services/admin-audit.service.js";
import {
  bulkEmailGeneratedCertificates,
  bulkGenerateQueuedCertificates,
  bulkResendAllCertificates,
  emailCertificate,
  ensureCertificateForRegistration,
  generateCertificate,
  issueCertificateAfterApproval,
} from "../services/certificate-issue.service.js";
import {
  buildCertificateEmailHtml,
  toCertificateRenderData,
} from "../services/certificate.service.js";
import { sendRegistrationConfirmationEmail } from "../services/email.service.js";
import { reconcilePaymentsWithRazorpay } from "../services/payment-reconciliation.service.js";
import { syncUserAndPaymentData } from "../services/data-sync.service.js";
import { ensureDefaultEvents } from "../services/event.service.js";
import { ApiError } from "../utils/api-error.js";
import { routeParam } from "../utils/params.js";
import { validateBody } from "../utils/validate.js";
import {
  adminCertificateUpdateSchema,
  adminCouponSchema,
  adminCouponUpdateSchema,
  adminEventSchema,
  adminEventUpdateSchema,
  adminMarkPaidSchema,
  adminMedalUpdateSchema,
  adminPaymentUpdateSchema,
  adminProofReviewSchema,
  adminRegistrationUpdateSchema,
  adminUserRoleSchema,
} from "../validators/admin.validator.js";

function parsePage(request: AuthenticatedRequest, maxLimit = 1000) {
  const page = Math.max(1, Number(request.query.page ?? 1) || 1);
  const pageSize = Math.min(maxLimit, Math.max(1, Number(request.query.pageSize ?? 50) || 50));
  return { page, pageSize, skip: (page - 1) * pageSize };
}

function q(request: AuthenticatedRequest, key: string) {
  const value = request.query[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getSearchVariants(search: string): string[] {
  const trimmed = search.trim();
  const set = new Set<string>();
  set.add(trimmed);

  // Common visual confusion in payment IDs, order IDs, and bibs (I vs l, 0 vs O)
  if (trimmed.includes("I") || trimmed.includes("l")) {
    set.add(trimmed.replace(/I/g, "l"));
    set.add(trimmed.replace(/l/g, "I"));
  }
  if (trimmed.includes("0") || trimmed.includes("O") || trimmed.includes("o")) {
    set.add(trimmed.replace(/0/g, "o"));
    set.add(trimmed.replace(/o/g, "0"));
  }
  return Array.from(set);
}

// ── Me / overview ──────────────────────────────────────────────

export async function adminMe(request: AuthenticatedRequest, response: Response) {
  const clerkId = request.auth?.userId;
  if (!clerkId) {
    // dev bypass
    response.json({
      data: {
        role: "SUPER_ADMIN",
        name: "Dev Admin",
        email: "admin@localhost",
        mode: "dev-bypass",
      },
    });
    return;
  }

  if (clerkId === "admin_emergency_sourav") {
    response.json({
      data: {
        role: "SUPER_ADMIN",
        name: "Sourav (Admin)",
        email: env.adminEmails[0] ?? "sourav06556@gmail.com",
        clerkId: "admin_emergency_sourav",
        mode: "emergency-passcode",
      },
    });
    return;
  }

  let user = await prisma.user.findFirst({
    where: { clerkId },
  });

  if (!user && clerkClient) {
    try {
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const email =
        clerkUser.emailAddresses.find(
          (item: { id: string; emailAddress: string }) => item.id === clerkUser.primaryEmailAddressId,
        )?.emailAddress?.toLowerCase() ?? clerkUser.emailAddresses[0]?.emailAddress?.toLowerCase();
      if (email) {
        user = await prisma.user.findFirst({
          where: { email: { equals: email, mode: "insensitive" } },
        });
        if (user && user.clerkId !== clerkId) {
          await prisma.user.update({
            where: { id: user.id },
            data: { clerkId },
          }).catch(() => null);
        }
      }
    } catch {}
  }

  const emailLower = user?.email?.toLowerCase() || "";
  const isSuper = user?.role === "SUPER_ADMIN" || emailLower === "sourav06556@gmail.com" || emailLower === "realblack009@gmail.com";
  response.json({
    data: {
      id: user?.id,
      role: isSuper ? "SUPER_ADMIN" : "ADMIN",
      name: user?.name ?? "Admin",
      email: user?.email ?? env.adminEmails[0],
      clerkId,
      mode: "authenticated",
    },
  });
}

type CachedOverview = {
  data: unknown;
  expiresAt: number;
};
const overviewCache = new Map<string, CachedOverview>();

type CachedPaymentStats = {
  paidCount: number;
  paidRevenueInPaise: number;
  expiresAt: number;
};
let cachedPaymentStats: CachedPaymentStats | null = null;
export function invalidatePaymentStatsCache() {
  cachedPaymentStats = null;
}

type CachedRegistrationStats = {
  total: number;
  paidCount: number;
  unpaidCount: number;
  expiresAt: number;
};
let cachedRegistrationStats: CachedRegistrationStats | null = null;
export function invalidateRegistrationStatsCache() {
  cachedRegistrationStats = null;
}

type CachedUserStats = {
  totalPaidUsers: number;
  totalPaidRegistrations: number;
  expiresAt: number;
};
let cachedUserStats: CachedUserStats | null = null;
export function invalidateUserStatsCache() {
  cachedUserStats = null;
}

export function invalidateAdminOverviewCache() {
  overviewCache.clear();
  cachedPaymentStats = null;
  cachedRegistrationStats = null;
  cachedUserStats = null;
}

async function getPaymentStats(): Promise<CachedPaymentStats> {
  if (cachedPaymentStats && cachedPaymentStats.expiresAt > Date.now()) {
    return cachedPaymentStats;
  }
  try {
    const paidOnly = await prisma.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amountInPaise: true },
      _count: true,
    });
    cachedPaymentStats = {
      paidCount: paidOnly._count,
      paidRevenueInPaise: paidOnly._sum.amountInPaise ?? 0,
      expiresAt: Date.now() + 30_000, // 30s TTL
    };
    return cachedPaymentStats;
  } catch {
    return (
      cachedPaymentStats ?? {
        paidCount: 0,
        paidRevenueInPaise: 0,
        expiresAt: 0,
      }
    );
  }
}

async function getRegistrationStats(): Promise<CachedRegistrationStats> {
  if (cachedRegistrationStats && cachedRegistrationStats.expiresAt > Date.now()) {
    return cachedRegistrationStats;
  }
  try {
    const [total, paidCount] = await Promise.all([
      prisma.registration.count(),
      prisma.registration.count({
        where: {
          OR: [
            { payment: { status: "PAID" } },
            { status: "CONFIRMED" },
            { status: "COMPLETED" },
          ],
        },
      }),
    ]);
    cachedRegistrationStats = {
      total,
      paidCount,
      unpaidCount: Math.max(0, total - paidCount),
      expiresAt: Date.now() + 30_000, // 30s TTL
    };
    return cachedRegistrationStats;
  } catch {
    return (
      cachedRegistrationStats ?? {
        total: 0,
        paidCount: 0,
        unpaidCount: 0,
        expiresAt: 0,
      }
    );
  }
}

async function getUserStats(): Promise<CachedUserStats> {
  if (cachedUserStats && cachedUserStats.expiresAt > Date.now()) {
    return cachedUserStats;
  }
  try {
    const [totalPaidUsers, totalPaidRegistrations] = await Promise.all([
      prisma.user.count({
        where: {
          registrations: {
            some: {
              OR: [
                { payment: { status: "PAID" } },
                { status: "CONFIRMED" },
                { status: "COMPLETED" },
              ],
            },
          },
        },
      }),
      prisma.registration.count({
        where: {
          OR: [
            { payment: { status: "PAID" } },
            { status: "CONFIRMED" },
            { status: "COMPLETED" },
          ],
        },
      }),
    ]);
    cachedUserStats = {
      totalPaidUsers,
      totalPaidRegistrations,
      expiresAt: Date.now() + 30_000, // 30s TTL
    };
    return cachedUserStats;
  } catch {
    return (
      cachedUserStats ?? {
        totalPaidUsers: 0,
        totalPaidRegistrations: 0,
        expiresAt: 0,
      }
    );
  }
}

export async function adminOverview(request: AuthenticatedRequest, response: Response) {
  const timeRange = (typeof request.query.range === "string" ? request.query.range.toLowerCase().trim() : "all") as "today" | "3d" | "7d" | "30d" | "all";
  const eventFilter = q(request, "eventId");

  // Fast cache check (20s TTL) for instantaneous overview dashboard loads
  const cacheKey = `${timeRange}:${eventFilter ?? "all"}`;
  const cached = overviewCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return response.json(cached.data);
  }

  await ensureDefaultEvents();

  // India Standard Time (IST = UTC + 5:30)
  const IST_OFFSET_MS = 5.5 * 3600 * 1000;
  const now = new Date();
  const nowIST = new Date(now.getTime() + IST_OFFSET_MS);

  let sinceDate: Date | undefined = undefined;

  if (timeRange === "today") {
    // Exact start of today in IST (00:00:00 IST converted to UTC)
    sinceDate = new Date(
      Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth(), nowIST.getUTCDate(), 0, 0, 0, 0) -
        IST_OFFSET_MS,
    );
  } else if (timeRange === "3d") {
    // Start of 3 days ago in IST
    const threeDaysAgoIST = new Date(nowIST.getTime() - 2 * 24 * 3600 * 1000);
    sinceDate = new Date(
      Date.UTC(threeDaysAgoIST.getUTCFullYear(), threeDaysAgoIST.getUTCMonth(), threeDaysAgoIST.getUTCDate(), 0, 0, 0, 0) -
        IST_OFFSET_MS,
    );
  } else if (timeRange === "7d") {
    // Start of 7 days ago in IST
    const sevenDaysAgoIST = new Date(nowIST.getTime() - 6 * 24 * 3600 * 1000);
    sinceDate = new Date(
      Date.UTC(sevenDaysAgoIST.getUTCFullYear(), sevenDaysAgoIST.getUTCMonth(), sevenDaysAgoIST.getUTCDate(), 0, 0, 0, 0) -
        IST_OFFSET_MS,
    );
  } else if (timeRange === "30d") {
    // Start of 30 days ago in IST
    const thirtyDaysAgoIST = new Date(nowIST.getTime() - 29 * 24 * 3600 * 1000);
    sinceDate = new Date(
      Date.UTC(thirtyDaysAgoIST.getUTCFullYear(), thirtyDaysAgoIST.getUTCMonth(), thirtyDaysAgoIST.getUTCDate(), 0, 0, 0, 0) -
        IST_OFFSET_MS,
    );
  }

  // Base filters for registrations and payments
  const regWhere: Prisma.RegistrationWhereInput = {
    ...(eventFilter ? { eventId: eventFilter } : {}),
    ...(sinceDate ? { registeredAt: { gte: sinceDate } } : {}),
  };

  const paymentWhere: Prisma.PaymentWhereInput = {
    status: "PAID",
    ...(sinceDate
      ? {
          OR: [
            { paidAt: { gte: sinceDate } },
            { createdAt: { gte: sinceDate } },
          ],
        }
      : {}),
    ...(eventFilter ? { registration: { eventId: eventFilter } } : {}),
  };

  // For the 7-day revenue trend chart: independent 7-day window in IST
  const sevenDaysTrendStartIST = new Date(
    Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth(), nowIST.getUTCDate() - 6, 0, 0, 0, 0) -
      IST_OFFSET_MS,
  );

  const [
    allEventsList,
    totalEventsCount,
    openEventsCount,
    totalUsersCount,
    pendingProofsCount,
    certificatesCount,
    medalsPendingCount,
    filteredRegs,
    filteredPayments,
    recentRegs,
    recentPayments,
    trendPayments,
    trendRegs,
  ] = await Promise.all([
    // All events with registrations & payments to calculate per-event breakdown
    prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        registrations: {
          where: sinceDate ? { registeredAt: { gte: sinceDate } } : undefined,
          include: {
            payment: true,
          },
        },
      },
    }),
    prisma.event.count(),
    prisma.event.count({ where: { status: "OPEN" } }),
    prisma.user.count(),
    prisma.registration.count({ where: { proofStatus: "SUBMITTED", ...(eventFilter ? { eventId: eventFilter } : {}) } }),
    prisma.certificate.count({ where: eventFilter ? { registration: { eventId: eventFilter } } : undefined }),
    prisma.registration.count({
      where: {
        status: { in: ["CONFIRMED", "COMPLETED"] },
        proofStatus: "APPROVED",
        OR: [{ medalDelivery: null }, { medalDelivery: { status: "PENDING" } }],
        ...(eventFilter ? { eventId: eventFilter } : {}),
      },
    }),
    prisma.registration.findMany({
      where: regWhere,
      select: { id: true, status: true, eventId: true },
    }),
    prisma.payment.findMany({
      where: paymentWhere,
      select: { id: true, amountInPaise: true, createdAt: true, paidAt: true, registrationId: true },
    }),
    prisma.registration.findMany({
      where: regWhere,
      take: 10,
      orderBy: { registeredAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        event: { select: { title: true, slug: true } },
        payment: { select: { status: true, amountInPaise: true } },
      },
    }),
    prisma.payment.findMany({
      where: eventFilter ? { registration: { eventId: eventFilter } } : undefined,
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        registration: {
          include: {
            user: { select: { name: true, email: true } },
            event: { select: { title: true } },
          },
        },
      },
    }),
    // 7-day trend payments (always shows full 7 days)
    prisma.payment.findMany({
      where: {
        status: "PAID",
        OR: [{ paidAt: { gte: sevenDaysTrendStartIST } }, { createdAt: { gte: sevenDaysTrendStartIST } }],
        ...(eventFilter ? { registration: { eventId: eventFilter } } : {}),
      },
      select: { amountInPaise: true, paidAt: true, createdAt: true },
    }),
    // 7-day trend registrations
    prisma.registration.findMany({
      where: {
        registeredAt: { gte: sevenDaysTrendStartIST },
        ...(eventFilter ? { eventId: eventFilter } : {}),
      },
      select: { registeredAt: true },
    }),
  ]);

  // Overall calculations for the active scope
  const totalRevenueInPaise = filteredPayments.reduce((acc, p) => acc + p.amountInPaise, 0);
  const totalRegistrations = filteredRegs.length;
  const confirmedRegs = filteredRegs.filter((r) => r.status === "CONFIRMED" || r.status === "COMPLETED").length;
  const pendingPaymentRegs = filteredRegs.filter((r) => r.status === "PENDING_PAYMENT").length;
  const paidCount = filteredPayments.length;
  const avgOrderValuePaise = paidCount > 0 ? Math.round(totalRevenueInPaise / paidCount) : 0;
  const conversionRate = totalRegistrations > 0 ? Math.round((confirmedRegs / totalRegistrations) * 100) : 0;

  // Per-Event Breakdown
  const eventBreakdown = allEventsList.map((ev) => {
    const regs = ev.registrations;
    const paidRegs = regs.filter((r) => r.payment?.status === "PAID" || r.status === "CONFIRMED");
    const pendingRegs = regs.filter((r) => r.status === "PENDING_PAYMENT");
    const eventRevenuePaise = regs.reduce((sum, r) => {
      if (r.payment && r.payment.status === "PAID") return sum + r.payment.amountInPaise;
      return sum;
    }, 0);

    const eventConvRate = regs.length > 0 ? Math.round((paidRegs.length / regs.length) * 100) : 0;
    const sharePercent = totalRevenueInPaise > 0 ? Math.round((eventRevenuePaise / totalRevenueInPaise) * 100) : 0;

    return {
      eventId: ev.id,
      slug: ev.slug,
      title: ev.title,
      status: ev.status,
      priceInPaise: ev.priceInPaise,
      totalRegistrations: regs.length,
      paidCount: paidRegs.length,
      pendingCount: pendingRegs.length,
      revenueInPaise: eventRevenuePaise,
      revenueInr: Math.round(eventRevenuePaise / 100),
      conversionRate: eventConvRate,
      sharePercent,
    };
  });

  // Calculate 7-day daily revenue trend in IST
  const dailyTrendMap = new Map<string, { date: string; label: string; revenuePaise: number; regsCount: number; paidCount: number }>();
  for (let i = 6; i >= 0; i--) {
    const dayIST = new Date(
      Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth(), nowIST.getUTCDate() - i, 0, 0, 0, 0),
    );
    const key = dayIST.toISOString().slice(0, 10);
    const label = new Intl.DateTimeFormat("en-IN", {
      timeZone: "UTC",
      day: "numeric",
      month: "short",
    }).format(dayIST);
    dailyTrendMap.set(key, { date: key, label, revenuePaise: 0, regsCount: 0, paidCount: 0 });
  }

  // Populate daily trend from trendPayments and trendRegs
  for (const pay of trendPayments) {
    const payDate = pay.paidAt ?? pay.createdAt;
    const payIST = new Date(payDate.getTime() + IST_OFFSET_MS);
    const key = payIST.toISOString().slice(0, 10);
    const existing = dailyTrendMap.get(key);
    if (existing) {
      existing.revenuePaise += pay.amountInPaise;
      existing.paidCount += 1;
    }
  }

  for (const reg of trendRegs) {
    const regIST = new Date(reg.registeredAt.getTime() + IST_OFFSET_MS);
    const key = regIST.toISOString().slice(0, 10);
    const existing = dailyTrendMap.get(key);
    if (existing) {
      existing.regsCount += 1;
    }
  }

  const dailyTrend = Array.from(dailyTrendMap.values()).map((d) => ({
    ...d,
    revenueInr: Math.round(d.revenuePaise / 100),
  }));

  const payload = {
    data: {
      timeRange,
      eventId: eventFilter ?? null,
      stats: {
        revenueInPaise: totalRevenueInPaise,
        revenueInr: Math.round(totalRevenueInPaise / 100),
        registrations: totalRegistrations,
        confirmedRegs,
        pendingPayment: pendingPaymentRegs,
        paidCount,
        avgOrderValueInr: Math.round(avgOrderValuePaise / 100),
        conversionRate,
        events: totalEventsCount,
        openEvents: openEventsCount,
        pendingProofs: pendingProofsCount,
        certificates: certificatesCount,
        medalsPending: medalsPendingCount,
        users: totalUsersCount,
      },
      eventBreakdown,
      dailyTrend,
      allEvents: allEventsList.map((e) => ({ id: e.id, slug: e.slug, title: e.title, status: e.status })),
      recentRegistrations: recentRegs,
      recentPayments,
    },
  };

  overviewCache.set(cacheKey, { data: payload, expiresAt: Date.now() + 20_000 });
  response.json(payload);
}

// ── Events ─────────────────────────────────────────────────────

export async function adminListEvents(request: AuthenticatedRequest, response: Response) {
  await ensureDefaultEvents();
  const status = q(request, "status");
  const search = q(request, "q");
  const { page, pageSize, skip } = parsePage(request);

  const where: Prisma.EventWhereInput = {
    ...(status ? { status: status as Prisma.EnumEventStatusFilter["equals"] } : {}),
    ...(search
      ? {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
        ],
      }
      : {}),
  };

  const [total, items] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      orderBy: { startsAt: "desc" },
      skip,
      take: pageSize,
      include: {
        _count: { select: { registrations: true } },
      },
    }),
  ]);

  response.json({
    data: items,
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  });
}

export async function adminGetEvent(request: AuthenticatedRequest, response: Response) {
  const id = routeParam(request, "id");
  const event = await prisma.event.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      _count: { select: { registrations: true } },
      registrations: {
        take: 20,
        orderBy: { registeredAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          payment: true,
        },
      },
    },
  });

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  response.json({ data: event });
}

export async function adminCreateEvent(request: AuthenticatedRequest, response: Response) {
  const payload = validateBody(adminEventSchema, request);
  const paymentRequired =
    payload.paymentRequired ?? (payload.priceInPaise > 0 ? true : false);

  const event = await prisma.event.create({
    data: {
      title: payload.title,
      slug: payload.slug,
      description: payload.description,
      startsAt: payload.startsAt,
      endsAt: payload.endsAt,
      proofClosesAt: payload.proofClosesAt,
      distances: payload.distances,
      priceInPaise: payload.priceInPaise,
      paymentRequired,
      medalIncluded: payload.medalIncluded ?? true,
      featured: payload.featured ?? false,
      maxCapacity: payload.maxCapacity ?? null,
      city: payload.city ?? "Virtual",
      bannerImageUrl: payload.bannerImageUrl || null,
      couponCode: payload.couponCode ?? null,
      showCouponOnCard: payload.showCouponOnCard ?? false,
      activityTypes: payload.activityTypes ?? ["running"],
      benefits: payload.benefits ?? [],
      finishers: payload.finishers ?? null,
      verifiedResults: payload.verifiedResults ?? null,
      cities: payload.cities ?? null,
      resultNote: payload.resultNote ?? null,
      status: payload.status ?? "DRAFT",
    },
  });

  await writeAdminAudit(request, {
    action: "event.create",
    entityType: "Event",
    entityId: event.id,
    summary: `Created event ${event.title}`,
  });

  response.status(201).json({ data: event });
}

export async function adminUpdateEvent(request: AuthenticatedRequest, response: Response) {
  const id = routeParam(request, "id");
  const payload = validateBody(adminEventUpdateSchema, request);

  const data: Prisma.EventUpdateInput = {
    ...payload,
    bannerImageUrl:
      payload.bannerImageUrl === "" ? null : payload.bannerImageUrl === undefined
        ? undefined
        : payload.bannerImageUrl,
  };

  if (payload.priceInPaise !== undefined && payload.paymentRequired === undefined) {
    data.paymentRequired = payload.priceInPaise > 0;
  }

  const event = await prisma.event.update({ where: { id }, data });

  await writeAdminAudit(request, {
    action: "event.update",
    entityType: "Event",
    entityId: event.id,
    summary: `Updated event ${event.title}`,
  });

  response.json({ data: event });
}

export async function adminDeleteEvent(request: AuthenticatedRequest, response: Response) {
  const id = routeParam(request, "id");
  const event = await prisma.event.findUnique({
    where: { id },
    select: { id: true, title: true },
  });

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  const registrations = await prisma.registration.findMany({
    where: { eventId: id },
    select: { id: true },
  });
  const registrationIds = registrations.map((registration) => registration.id);

  await prisma.$transaction(async (tx) => {
    if (registrationIds.length > 0) {
      await tx.certificate.deleteMany({ where: { registrationId: { in: registrationIds } } });
      await tx.medalDelivery.deleteMany({ where: { registrationId: { in: registrationIds } } });
      await tx.proofUpload.deleteMany({ where: { registrationId: { in: registrationIds } } });
      await tx.payment.deleteMany({ where: { registrationId: { in: registrationIds } } });
      await tx.registration.deleteMany({ where: { id: { in: registrationIds } } });
    }
    await tx.event.delete({ where: { id } });
  });

  await writeAdminAudit(request, {
    action: "event.delete",
    entityType: "Event",
    entityId: id,
    summary: `Deleted event ${event.title} with ${registrationIds.length} registration(s)`,
  });

  response.status(204).send();
}

// ── Registrations ──────────────────────────────────────────────

export async function adminListRegistrations(request: AuthenticatedRequest, response: Response) {
  const { page, pageSize, skip } = parsePage(request);
  const status = q(request, "status");
  const proofStatus = q(request, "proofStatus");
  const eventId = q(request, "eventId");
  const search = q(request, "q");
  const searchVariants = search ? getSearchVariants(search) : [];

  const where: Prisma.RegistrationWhereInput = {
    ...(status ? { status: status as never } : {}),
    ...(proofStatus ? { proofStatus: proofStatus as never } : {}),
    ...(eventId ? { eventId } : {}),
    ...(search
      ? {
        OR: [
          ...searchVariants.map((v) => ({ id: v })),
          ...searchVariants.map((v) => ({ bibNumber: { contains: v, mode: "insensitive" as const } })),
          { shippingName: { contains: search, mode: "insensitive" } },
          { shippingPhone: { contains: search, mode: "insensitive" } },
          { user: { email: { contains: search, mode: "insensitive" } } },
          { user: { name: { contains: search, mode: "insensitive" } } },
          { user: { phone: { contains: search, mode: "insensitive" } } },
          ...searchVariants.map((v) => ({ payment: { razorpayOrderId: { contains: v, mode: "insensitive" as const } } })),
          ...searchVariants.map((v) => ({ payment: { razorpayPaymentId: { contains: v, mode: "insensitive" as const } } })),
        ],
      }
      : {}),
  };

  const isFiltered = Boolean(status || proofStatus || eventId || search);

  const [stats, items] = await Promise.all([
    isFiltered
      ? Promise.all([
          prisma.registration.count({ where }),
          prisma.registration.count({
            where: {
              ...where,
              OR: [
                { payment: { status: "PAID" } },
                { status: "CONFIRMED" },
                { status: "COMPLETED" },
              ],
            },
          }),
        ]).then(([total, paidCount]) => ({
          total,
          paidCount,
          unpaidCount: Math.max(0, total - paidCount),
        }))
      : getRegistrationStats(),
    prisma.registration.findMany({
      where,
      orderBy: { registeredAt: "desc" },
      skip,
      take: pageSize,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, clerkId: true } },
        event: { select: { id: true, title: true, slug: true, priceInPaise: true } },
        payment: true,
        proofUpload: true,
        certificate: true,
        medalDelivery: true,
      },
    }),
  ]);

  response.json({
    data: items,
    meta: {
      total: stats.total,
      paidCount: stats.paidCount,
      unpaidCount: stats.unpaidCount,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(stats.total / pageSize)),
    },
  });
}

export async function adminGetRegistration(request: AuthenticatedRequest, response: Response) {
  const id = routeParam(request, "id");
  const registration = await prisma.registration.findFirst({
    where: {
      OR: [
        { id },
        { bibNumber: id },
      ],
    },
    include: {
      user: true,
      event: true,
      payment: true,
      proofUpload: true,
      certificate: true,
      medalDelivery: true,
    },
  });

  if (!registration) {
    throw new ApiError(404, "Registration not found");
  }

  response.json({ data: registration });
}

export async function adminUpdateRegistration(request: AuthenticatedRequest, response: Response) {
  const id = routeParam(request, "id");
  const payload = validateBody(adminRegistrationUpdateSchema, request);

  const target = await prisma.registration.findFirst({
    where: {
      OR: [
        { id },
        { bibNumber: id },
      ],
    },
  });

  if (!target) {
    throw new ApiError(404, "Registration not found");
  }

  const registration = await prisma.registration.update({
    where: { id: target.id },
    data: payload,
    include: {
      user: true,
      event: true,
      payment: true,
      proofUpload: true,
      certificate: true,
      medalDelivery: true,
    },
  });

  await writeAdminAudit(request, {
    action: "registration.update",
    entityType: "Registration",
    entityId: target.id,
    summary: `Updated registration ${registration.bibNumber}`,
  });

  response.json({ data: registration });
}

export async function adminMarkRegistrationPaid(
  request: AuthenticatedRequest,
  response: Response,
) {
  const id = routeParam(request, "id");
  const payload = validateBody(adminMarkPaidSchema, request);

  const existing = await prisma.registration.findFirst({
    where: {
      OR: [
        { id },
        { bibNumber: id },
      ],
    },
    include: { event: true, payment: true },
  });
  if (!existing) {
    throw new ApiError(404, "Registration not found");
  }

  const amount = payload.amountInPaise ?? existing.event.priceInPaise;
  const orderId = existing.payment?.razorpayOrderId ?? `manual_${existing.id}_${Date.now()}`;

  const payment = await prisma.payment.upsert({
    where: { registrationId: existing.id },
    create: {
      registrationId: existing.id,
      razorpayOrderId: orderId,
      razorpayPaymentId: `manual_${Date.now()}`,
      amountInPaise: amount,
      status: "PAID",
      paidAt: new Date(),
    },
    update: {
      status: "PAID",
      paidAt: new Date(),
      amountInPaise: amount,
      razorpayPaymentId: existing.payment?.razorpayPaymentId ?? `manual_${Date.now()}`,
    },
  });

  const registration = await prisma.registration.update({
    where: { id },
    data: {
      status: "CONFIRMED",
      adminNote: payload.note
        ? [existing.adminNote, `Manual paid: ${payload.note}`].filter(Boolean).join("\n")
        : existing.adminNote,
    },
    include: {
      user: true,
      event: true,
      payment: true,
      proofUpload: true,
      certificate: true,
      medalDelivery: true,
    },
  });

  const emailResult = await sendRegistrationConfirmationEmail({
    to: registration.user.email,
    runnerName: registration.user.name,
    eventTitle: registration.event.title,
    distance: registration.distance,
    bibNumber: registration.bibNumber,
    amountInPaise: registration.payment!.amountInPaise,
  }).catch(() => null);

  await prisma.user
    .update({
      where: { id: registration.userId },
      data: { updatedAt: new Date() },
    })
    .catch(() => null);

  await writeAdminAudit(request, {
    action: "registration.mark_paid",
    entityType: "Registration",
    entityId: id,
    summary: `Marked paid ${amount} paise for ${registration.bibNumber}`,
  });

  response.json({ data: { registration, payment, emailSent: emailResult?.sent ?? false } });
}

export async function adminDeleteRegistration(
  request: AuthenticatedRequest,
  response: Response,
) {
  const id = routeParam(request, "id");
  const reg = await prisma.registration.findFirst({
    where: {
      OR: [
        { id },
        { bibNumber: id },
      ],
    },
    select: { id: true, bibNumber: true, shippingName: true, userId: true },
  });

  if (!reg) {
    throw new ApiError(404, "Registration not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.certificate.deleteMany({ where: { registrationId: reg.id } });
    await tx.medalDelivery.deleteMany({ where: { registrationId: reg.id } });
    await tx.proofUpload.deleteMany({ where: { registrationId: reg.id } });
    await tx.payment.deleteMany({ where: { registrationId: reg.id } });
    await tx.registration.delete({ where: { id: reg.id } });
  });

  await writeAdminAudit(request, {
    action: "registration.delete",
    entityType: "Registration",
    entityId: reg.id,
    summary: `Deleted registration ${reg.bibNumber} for ${reg.shippingName}`,
  });

  response.json({
    success: true,
    message: `Registration ${reg.bibNumber} deleted successfully.`,
  });
}

export async function adminExportRegistrationsCsv(
  request: AuthenticatedRequest,
  response: Response,
) {
  const eventId = q(request, "eventId");
  const status = q(request, "status");
  const search = q(request, "q") || q(request, "search");
  const searchVariants = search ? getSearchVariants(search) : [];

  const where: Prisma.RegistrationWhereInput = {
    ...(eventId ? { eventId } : {}),
    ...(status
      ? status === "PAID"
        ? {
            OR: [
              { status: { in: ["CONFIRMED", "COMPLETED"] } },
              { payment: { status: "PAID" } },
            ],
          }
        : status === "UNPAID"
          ? {
              status: { notIn: ["CONFIRMED", "COMPLETED"] },
              OR: [{ payment: null }, { payment: { status: { not: "PAID" } } }],
            }
          : { status: status as never }
      : {}),
    ...(search
      ? {
          OR: [
            ...searchVariants.map((v) => ({ bibNumber: { contains: v, mode: "insensitive" as const } })),
            { shippingName: { contains: search, mode: "insensitive" } },
            { shippingPhone: { contains: search, mode: "insensitive" } },
            { user: { email: { contains: search, mode: "insensitive" } } },
            { user: { name: { contains: search, mode: "insensitive" } } },
            { user: { phone: { contains: search, mode: "insensitive" } } },
            ...searchVariants.map((v) => ({ payment: { razorpayPaymentId: { contains: v, mode: "insensitive" as const } } })),
            ...searchVariants.map((v) => ({ payment: { razorpayOrderId: { contains: v, mode: "insensitive" as const } } })),
          ],
        }
      : {}),
  };

  const rows = await prisma.registration.findMany({
    where,
    include: {
      user: true,
      event: true,
      payment: true,
    },
    take: 10000,
  });

  rows.sort((a, b) => {
    const timeA = (a.payment?.paidAt ?? a.registeredAt).getTime();
    const timeB = (b.payment?.paidAt ?? b.registeredAt).getTime();
    return timeB - timeA;
  });

  const header = [
    "bibNumber",
    "runnerName",
    "email",
    "phone",
    "event",
    "distance",
    "registrationStatus",
    "proofStatus",
    "paymentStatus",
    "amountInr",
    "razorpayPaymentId",
    "razorpayOrderId",
    "shippingAddress",
    "shippingCity",
    "shippingState",
    "shippingPincode",
    "registeredAt",
  ];

  const escape = (v: string | number | null | undefined) => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const lines = [
    header.join(","),
    ...rows.map((r) => {
      const runnerName = r.shippingName?.trim() || r.user.name?.trim() || "";
      const phoneVal =
        (r.shippingPhone && r.shippingPhone.trim().length > 3 ? r.shippingPhone.trim() : "") ||
        (r.user.phone && r.user.phone.trim().length > 3 ? r.user.phone.trim() : "");
      const isPaid =
        r.payment?.status === "PAID" || r.status === "CONFIRMED" || r.status === "COMPLETED";
      const paymentStatus = isPaid ? "PAID" : (r.payment?.status ?? "UNPAID");
      const amountInr = r.payment
        ? Math.round(r.payment.amountInPaise / 100)
        : Math.round(r.event.priceInPaise / 100);

      return [
        r.bibNumber,
        runnerName,
        r.user.email,
        phoneVal,
        r.event.title,
        r.distance,
        r.status,
        r.proofStatus,
        paymentStatus,
        amountInr,
        r.payment?.razorpayPaymentId ?? "",
        r.payment?.razorpayOrderId ?? "",
        r.shippingLine1 ?? "",
        r.shippingCity ?? "",
        r.shippingState ?? "",
        r.shippingPincode ?? "",
        r.registeredAt.toISOString(),
      ]
        .map(escape)
        .join(",");
    }),
  ];

  response.setHeader("Content-Type", "text/csv; charset=utf-8");
  response.setHeader(
    "Content-Disposition",
    `attachment; filename="registrations-${Date.now()}.csv"`,
  );
  // Prepend \uFEFF UTF-8 BOM so Microsoft Excel opens it correctly with proper encoding
  response.send("\uFEFF" + lines.join("\n"));
}

export async function adminExportPaymentsCsv(
  request: AuthenticatedRequest,
  response: Response,
) {
  const status = q(request, "status");
  const eventId = q(request, "eventId");
  const search = q(request, "q") || q(request, "search");
  const searchVariants = search ? getSearchVariants(search) : [];

  const where: Prisma.PaymentWhereInput = {
    ...(status ? { status: status as never } : {}),
    ...(eventId ? { registration: { eventId } } : {}),
    ...(search
      ? {
          OR: [
            ...searchVariants.map((v) => ({ razorpayOrderId: { contains: v, mode: "insensitive" as const } })),
            ...searchVariants.map((v) => ({ razorpayPaymentId: { contains: v, mode: "insensitive" as const } })),
            ...searchVariants.map((v) => ({ registration: { bibNumber: { contains: v, mode: "insensitive" as const } } })),
            { registration: { shippingName: { contains: search, mode: "insensitive" } } },
            { registration: { shippingPhone: { contains: search, mode: "insensitive" } } },
            { registration: { user: { name: { contains: search, mode: "insensitive" } } } },
            { registration: { user: { email: { contains: search, mode: "insensitive" } } } },
            { registration: { user: { phone: { contains: search, mode: "insensitive" } } } },
          ],
        }
      : {}),
  };

  const rows = await prisma.payment.findMany({
    where,
    include: {
      registration: {
        include: {
          user: true,
          event: true,
        },
      },
    },
    take: 10000,
  });

  rows.sort((a, b) => {
    const timeA = (a.paidAt ?? a.createdAt).getTime();
    const timeB = (b.paidAt ?? b.createdAt).getTime();
    return timeB - timeA;
  });

  const header = [
    "paymentId",
    "orderId",
    "runnerName",
    "email",
    "phone",
    "event",
    "distance",
    "bibNumber",
    "amountInr",
    "paymentStatus",
    "paidAt",
    "createdAt",
  ];

  const escape = (v: string | number | null | undefined) => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const lines = [
    header.join(","),
    ...rows.map((p) => {
      const runnerName =
        p.registration?.shippingName?.trim() || p.registration?.user?.name?.trim() || "";
      const phoneVal =
        (p.registration?.shippingPhone && p.registration.shippingPhone.trim().length > 3
          ? p.registration.shippingPhone.trim()
          : "") ||
        (p.registration?.user?.phone && p.registration.user.phone.trim().length > 3
          ? p.registration.user.phone.trim()
          : "");

      return [
        p.razorpayPaymentId ?? p.id,
        p.razorpayOrderId,
        runnerName,
        p.registration?.user?.email ?? "",
        phoneVal,
        p.registration?.event?.title ?? "",
        p.registration?.distance ?? "",
        p.registration?.bibNumber ?? "",
        Math.round(p.amountInPaise / 100),
        p.status,
        p.paidAt ? p.paidAt.toISOString() : "",
        p.createdAt.toISOString(),
      ]
        .map(escape)
        .join(",");
    }),
  ];

  response.setHeader("Content-Type", "text/csv; charset=utf-8");
  response.setHeader(
    "Content-Disposition",
    `attachment; filename="payments-${Date.now()}.csv"`,
  );
  response.send("\uFEFF" + lines.join("\n"));
}

// ── Payments ───────────────────────────────────────────────────

export async function adminListPayments(request: AuthenticatedRequest, response: Response) {
  const { page, pageSize, skip } = parsePage(request);
  const status = q(request, "status");
  const search = q(request, "q");
  const searchVariants = search ? getSearchVariants(search) : [];

  const where: Prisma.PaymentWhereInput = {
    ...(status ? { status: status as never } : {}),
    ...(search
      ? {
        OR: [
          ...searchVariants.map((v) => ({ razorpayOrderId: { contains: v, mode: "insensitive" as const } })),
          ...searchVariants.map((v) => ({ razorpayPaymentId: { contains: v, mode: "insensitive" as const } })),
          {
            registration: {
              user: {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                  { phone: { contains: search, mode: "insensitive" } },
                ],
              },
            },
          },
          {
            registration: {
              shippingPhone: { contains: search, mode: "insensitive" },
            },
          },
          ...searchVariants.map((v) => ({
            registration: {
              bibNumber: { contains: v, mode: "insensitive" as const },
            },
          })),
        ],
      }
      : {}),
  };

  const [total, items, paymentStats] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        registration: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
            event: { select: { title: true, slug: true } },
          },
        },
      },
    }),
    getPaymentStats(),
  ]);

  response.json({
    data: items,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      paidCount: paymentStats.paidCount,
      unpaidCount: Math.max(0, total - paymentStats.paidCount),
      paidRevenueInPaise: paymentStats.paidRevenueInPaise,
    },
  });
}

export async function adminUpdatePayment(request: AuthenticatedRequest, response: Response) {
  const id = routeParam(request, "id");
  const payload = validateBody(adminPaymentUpdateSchema, request);

  const payment = await prisma.payment.update({
    where: { id },
    data: {
      status: payload.status,
      paidAt: payload.status === "PAID" ? new Date() : undefined,
    },
    include: {
      registration: true,
    },
  });

  if (payload.status === "PAID") {
    const registration = await prisma.registration.update({
      where: { id: payment.registrationId },
      data: { status: "CONFIRMED" },
      include: { user: true, event: true, payment: true },
    });

    await sendRegistrationConfirmationEmail({
      to: registration.user.email,
      runnerName: registration.user.name,
      eventTitle: registration.event.title,
      distance: registration.distance,
      bibNumber: registration.bibNumber,
      amountInPaise: registration.payment!.amountInPaise,
    }).catch(() => null);

    await prisma.user
      .update({
        where: { id: registration.userId },
        data: { updatedAt: new Date() },
      })
      .catch(() => null);
  }

  if (payload.status === "REFUNDED") {
    await prisma.registration.update({
      where: { id: payment.registrationId },
      data: { status: "CANCELLED" },
    });
  }

  await writeAdminAudit(request, {
    action: "payment.update",
    entityType: "Payment",
    entityId: id,
    summary: `Payment status → ${payload.status}`,
  });

  invalidateAdminOverviewCache();

  response.json({ data: payment });
}

// ── Sync ────────────────────────────────────────────────────────

export async function adminSyncPayments(request: AuthenticatedRequest, response: Response) {
  const result = await syncUserAndPaymentData();

  invalidateAdminOverviewCache();

  await writeAdminAudit(request, {
    action: "data.sync",
    entityType: "System",
    entityId: "bulk",
    summary: `Full sync: ${result.paymentsSynced} payments, ${result.fixedRegistrations} regs, ${result.clerkUsersSynced} users, ${result.phonesSynced} phones`,
  });

  response.json({
    data: {
      synced: result.paymentsSynced,
      totalPaid: result.totalPaidPayments,
      totalRevenue: result.totalRevenueInInr,
      fixedRegistrations: result.fixedRegistrations,
      clerkUsersSynced: result.clerkUsersSynced,
      phonesSynced: result.phonesSynced,
      totalUsers: result.totalUsers,
      totalPaidUsers: result.totalPaidUsers,
      message: result.message,
    },
  });
}

// ── Users ──────────────────────────────────────────────────────

export async function adminListUsers(request: AuthenticatedRequest, response: Response) {
  const { page, pageSize, skip } = parsePage(request);
  const search = q(request, "q");
  const role = q(request, "role");
  const status = q(request, "status");

  const where: Prisma.UserWhereInput = {
    ...(role ? { role: role as never } : {}),
    ...(status
      ? status === "PAID"
        ? {
            registrations: {
              some: {
                OR: [
                  { payment: { status: "PAID" } },
                  { status: "CONFIRMED" },
                  { status: "COMPLETED" },
                ],
              },
            },
          }
        : status === "UNPAID"
          ? {
              registrations: {
                none: {
                  OR: [
                    { payment: { status: "PAID" } },
                    { status: "CONFIRMED" },
                    { status: "COMPLETED" },
                  ],
                },
              },
            }
          : {}
      : {}),
    ...(search
      ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
          { clerkId: { contains: search, mode: "insensitive" } },
        ],
      }
      : {}),
  };

  const isFiltered = Boolean(role || status || search);

  const [total, items, stats] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: pageSize,
      include: {
        registrations: {
          select: {
            id: true,
            status: true,
            shippingPhone: true,
            distance: true,
            payment: { select: { status: true, amountInPaise: true } },
          },
        },
      },
    }),
    isFiltered
      ? Promise.all([
          prisma.user.count({
            where: {
              ...where,
              registrations: {
                some: {
                  OR: [
                    { payment: { status: "PAID" } },
                    { status: "CONFIRMED" },
                    { status: "COMPLETED" },
                  ],
                },
              },
            },
          }),
          search
            ? Promise.resolve(0)
            : prisma.registration.count({
                where: {
                  OR: [
                    { payment: { status: "PAID" } },
                    { status: "CONFIRMED" },
                    { status: "COMPLETED" },
                  ],
                },
              }),
        ]).then(([paidUsers, paidRegs]) => ({
          totalPaidUsers: paidUsers,
          totalPaidRegistrations: paidRegs,
        }))
      : getUserStats(),
  ]);

  const totalPaidUsers = stats.totalPaidUsers;
  const totalPaidRegistrations = stats.totalPaidRegistrations;

  const formatted = items.map((u) => {
    const paidRegs = u.registrations.filter(
      (r) => r.payment?.status === "PAID" || r.status === "CONFIRMED" || r.status === "COMPLETED",
    );
    const totalPaidInPaise = paidRegs.reduce((sum, r) => sum + (r.payment?.amountInPaise ?? 0), 0);
    const hasPaid = paidRegs.length > 0;
    const resolvedPhone =
      u.phone ||
      u.registrations.find((r) => r.shippingPhone && r.shippingPhone.trim().length > 3)?.shippingPhone ||
      null;

    const paidDistances = paidRegs
      .map((r) => r.distance)
      .filter((d): d is string => Boolean(d && d.trim()));
    const allDistances = u.registrations
      .map((r) => r.distance)
      .filter((d): d is string => Boolean(d && d.trim()));
    const distances = Array.from(new Set(paidDistances.length > 0 ? paidDistances : allDistances));
    const distanceDisplay = distances.length > 0 ? distances.join(", ") : "—";

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: resolvedPhone,
      role: u.role,
      clerkId: u.clerkId,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      _count: { registrations: paidRegs.length },
      hasPaid,
      paidCount: paidRegs.length,
      distances,
      distanceDisplay,
      totalPaidInPaise,
      totalPaidInr: Math.round(totalPaidInPaise / 100),
    };
  });

  response.json({
    data: formatted,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      totalPaidUsers,
      totalUnpaidUsers: Math.max(0, total - totalPaidUsers),
      totalPaidRegistrations,
    },
  });
}

export async function adminExportUsersCsv(
  request: AuthenticatedRequest,
  response: Response,
) {
  const search = q(request, "q") || q(request, "search");
  const role = q(request, "role");
  const status = q(request, "status");

  const where: Prisma.UserWhereInput = {
    ...(role ? { role: role as never } : {}),
    ...(status
      ? status === "PAID"
        ? {
            registrations: {
              some: {
                OR: [
                  { payment: { status: "PAID" } },
                  { status: "CONFIRMED" },
                  { status: "COMPLETED" },
                ],
              },
            },
          }
        : status === "UNPAID"
          ? {
              registrations: {
                none: {
                  OR: [
                    { payment: { status: "PAID" } },
                    { status: "CONFIRMED" },
                    { status: "COMPLETED" },
                  ],
                },
              },
            }
          : {}
      : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { clerkId: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const users = await prisma.user.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      registrations: {
        orderBy: { registeredAt: "desc" },
        include: {
          payment: true,
          event: true,
        },
      },
      _count: { select: { registrations: true } },
    },
    take: 10000,
  });

  const header = [
    "name",
    "email",
    "phone",
    "role",
    "paymentStatus",
    "km",
    "paidRegistrationsCount",
    "totalSpentInr",
    "latestEvent",
    "latestBibNumber",
    "joinedAt",
  ];

  const escape = (v: string | number | null | undefined) => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const lines = [
    header.join(","),
    ...users.map((u) => {
      const paidRegs = u.registrations.filter(
        (r) => r.payment?.status === "PAID" || r.status === "CONFIRMED" || r.status === "COMPLETED",
      );
      const totalPaidInPaise = paidRegs.reduce((sum, r) => sum + (r.payment?.amountInPaise ?? 0), 0);
      const hasPaid = paidRegs.length > 0;

      const regWithPhone = u.registrations.find(
        (r) => r.shippingPhone && r.shippingPhone.trim().length > 3,
      );
      const resolvedPhone =
        (u.phone && u.phone.trim().length > 3 ? u.phone.trim() : "") ||
        regWithPhone?.shippingPhone?.trim() ||
        "";

      const paidDistances = paidRegs
        .map((r) => r.distance)
        .filter((d): d is string => Boolean(d && d.trim()));
      const allDistances = u.registrations
        .map((r) => r.distance)
        .filter((d): d is string => Boolean(d && d.trim()));
      const uniqueDistances = Array.from(new Set(paidDistances.length > 0 ? paidDistances : allDistances));
      const distanceDisplay = uniqueDistances.length > 0 ? uniqueDistances.join("; ") : "";

      const latestReg = u.registrations[0];
      const latestEvent = latestReg?.event?.title ?? "";
      const latestBibNumber = latestReg?.bibNumber ?? "";

      return [
        u.name,
        u.email,
        resolvedPhone,
        u.role,
        hasPaid ? "PAID" : "UNPAID",
        distanceDisplay,
        paidRegs.length,
        Math.round(totalPaidInPaise / 100),
        latestEvent,
        latestBibNumber,
        u.createdAt.toISOString(),
      ]
        .map(escape)
        .join(",");
    }),
  ];

  response.setHeader("Content-Type", "text/csv; charset=utf-8");
  response.setHeader(
    "Content-Disposition",
    `attachment; filename="users-${Date.now()}.csv"`,
  );
  response.send("\uFEFF" + lines.join("\n"));
}

export async function adminGetUser(request: AuthenticatedRequest, response: Response) {
  const id = routeParam(request, "id");
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      registrations: {
        orderBy: { registeredAt: "desc" },
        include: {
          event: true,
          payment: true,
          proofUpload: true,
          certificate: true,
          medalDelivery: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  response.json({ data: user });
}

export async function adminUpdateUserRole(request: AuthenticatedRequest, response: Response) {
  const id = routeParam(request, "id");
  const payload = validateBody(adminUserRoleSchema, request);

  const user = await prisma.user.update({
    where: { id },
    data: { role: payload.role },
  });

  await writeAdminAudit(request, {
    action: "user.role",
    entityType: "User",
    entityId: id,
    summary: `Role → ${payload.role} for ${user.email}`,
  });

  response.json({ data: user });
}

export async function adminDeleteUser(
  request: AuthenticatedRequest,
  response: Response,
) {
  const id = routeParam(request, "id");
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, clerkId: true },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const emailLower = user.email.toLowerCase().trim();
  if (
    emailLower === "sourav06556@gmail.com" ||
    emailLower === "realblack009@gmail.com" ||
    env.adminEmails.includes(emailLower)
  ) {
    throw new ApiError(403, "Cannot delete protected admin account");
  }

  const registrations = await prisma.registration.findMany({
    where: { userId: id },
    select: { id: true },
  });
  const registrationIds = registrations.map((r) => r.id);

  await prisma.$transaction(async (tx) => {
    if (registrationIds.length > 0) {
      await tx.certificate.deleteMany({ where: { registrationId: { in: registrationIds } } });
      await tx.medalDelivery.deleteMany({ where: { registrationId: { in: registrationIds } } });
      await tx.proofUpload.deleteMany({ where: { registrationId: { in: registrationIds } } });
      await tx.payment.deleteMany({ where: { registrationId: { in: registrationIds } } });
      await tx.registration.deleteMany({ where: { id: { in: registrationIds } } });
    }
    await tx.referral.deleteMany({
      where: {
        OR: [{ referrerId: id }, { refereeId: id }],
      },
    });
    await tx.user.delete({ where: { id } });
  });

  // Also clean up from Clerk to save quota if user was registered in Clerk
  if (user.clerkId && env.clerkEnabled) {
    try {
      const { createClerkClient } = await import("@clerk/backend");
      const clerk = createClerkClient({ secretKey: env.clerkSecretKey });
      await clerk.users.deleteUser(user.clerkId);
      logger.info(`[Clerk] Deleted clerk user ${user.clerkId} for ${user.email}`);
    } catch (clerkErr) {
      logger.warn(`[Clerk] Non-fatal: Could not delete clerk user ${user.clerkId}: ${clerkErr instanceof Error ? clerkErr.message : String(clerkErr)}`);
    }
  }

  await writeAdminAudit(request, {
    action: "user.delete",
    entityType: "User",
    entityId: id,
    summary: `Deleted user ${user.name} (${user.email}) and ${registrationIds.length} registration(s)`,
  });

  response.json({
    success: true,
    message: `User ${user.name} and all associated test data were permanently deleted.`,
  });
}

// ── Proofs ─────────────────────────────────────────────────────

type CachedProofCounts = {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  notSubmittedCount: number;
  allCount: number;
  expiresAt: number;
};

let cachedProofCounts: CachedProofCounts | null = null;

export function invalidateProofCountsCache() {
  cachedProofCounts = null;
}

async function getProofCounts(): Promise<CachedProofCounts> {
  if (cachedProofCounts && cachedProofCounts.expiresAt > Date.now()) {
    return cachedProofCounts;
  }
  try {
    const countsRows = await prisma.$queryRaw<Array<{ proofStatus: string; count: number }>>`
      SELECT "proofStatus", COUNT(*)::int as count 
      FROM "Registration" 
      GROUP BY "proofStatus"
    `;
    const countsMap: Record<string, number> = {};
    for (const row of countsRows) {
      countsMap[row.proofStatus] = row.count;
    }
    const pendingCount = countsMap[ProofStatus.SUBMITTED] ?? 0;
    const approvedCount = countsMap[ProofStatus.APPROVED] ?? 0;
    const rejectedCount = countsMap[ProofStatus.REJECTED] ?? 0;
    const notSubmittedCount = countsMap[ProofStatus.NOT_SUBMITTED] ?? 0;
    const allCount = pendingCount + approvedCount + rejectedCount + notSubmittedCount;
    cachedProofCounts = {
      pendingCount,
      approvedCount,
      rejectedCount,
      notSubmittedCount,
      allCount,
      expiresAt: Date.now() + 30_000, // 30s TTL
    };
    return cachedProofCounts;
  } catch {
    return (
      cachedProofCounts ?? {
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
        notSubmittedCount: 0,
        allCount: 0,
        expiresAt: 0,
      }
    );
  }
}

export async function adminListProofs(request: AuthenticatedRequest, response: Response) {
  const { page, pageSize, skip } = parsePage(request);
  const rawStatus = q(request, "status")?.trim().toUpperCase();
  const search = q(request, "q")?.trim();

  let filterStatus: ProofStatus | null = null;
  // If an active search term is provided, search across all statuses unless an explicit filter was chosen
  if (search && (!rawStatus || rawStatus === "ALL" || rawStatus === "SUBMITTED" || rawStatus === "PENDING")) {
    filterStatus = null;
  } else if (!rawStatus || rawStatus === "PENDING" || rawStatus === "SUBMITTED") {
    filterStatus = ProofStatus.SUBMITTED;
  } else if (rawStatus === "APPROVED") {
    filterStatus = ProofStatus.APPROVED;
  } else if (rawStatus === "REJECTED") {
    filterStatus = ProofStatus.REJECTED;
  } else if (rawStatus === "NOT_SUBMITTED") {
    filterStatus = ProofStatus.NOT_SUBMITTED;
  } else if (rawStatus === "ALL") {
    filterStatus = null;
  } else {
    filterStatus = null;
  }

  // Targeted search query builder for indexed performance
  let searchOrConditions: Prisma.RegistrationWhereInput[] = [];
  if (search) {
    const isDigitsOnly = /^[0-9+ ]+$/.test(search) && search.replace(/\D/g, "").length >= 4;
    const isBib = /^IAFD-?[0-9]+/i.test(search);
    const isEmail = search.includes("@");

    if (isEmail) {
      searchOrConditions = [{ user: { email: { contains: search, mode: "insensitive" } } }];
    } else if (isBib) {
      searchOrConditions = [{ bibNumber: { contains: search, mode: "insensitive" } }];
    } else if (isDigitsOnly) {
      const cleanDigits = search.replace(/\D/g, "");
      searchOrConditions = [
        { shippingPhone: { contains: cleanDigits } },
        { user: { phone: { contains: cleanDigits } } },
        { bibNumber: { contains: search, mode: "insensitive" } },
      ];
    } else {
      searchOrConditions = [
        { bibNumber: { contains: search, mode: "insensitive" } },
        { shippingName: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { shippingPhone: { contains: search, mode: "insensitive" } },
        { shippingCity: { contains: search, mode: "insensitive" } },
      ];
    }
  }

  const where: Prisma.RegistrationWhereInput = {
    ...(filterStatus ? { proofStatus: filterStatus } : {}),
    ...(searchOrConditions.length > 0 ? { OR: searchOrConditions } : {}),
  };

  const limit = Math.min(Math.max(1, pageSize || 25), 50);

  // Parallel fetch: cached/fast counts and paginated items
  const [countsData, items] = await Promise.all([
    getProofCounts(),
    prisma.registration.findMany({
      where,
      orderBy: { registeredAt: "desc" },
      skip,
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        event: { select: { title: true, slug: true, distances: true } },
        proofUpload: true,
        payment: { select: { status: true } },
      },
    }),
  ]);

  let total = 0;
  if (search) {
    if (skip === 0 && items.length < limit) {
      total = items.length;
    } else {
      total = await prisma.registration.count({ where });
    }
  } else {
    total =
      filterStatus === ProofStatus.SUBMITTED
        ? countsData.pendingCount
        : filterStatus === ProofStatus.APPROVED
        ? countsData.approvedCount
        : filterStatus === ProofStatus.REJECTED
        ? countsData.rejectedCount
        : filterStatus === ProofStatus.NOT_SUBMITTED
        ? countsData.notSubmittedCount
        : countsData.allCount;
  }

  response.json({
    data: items,
    meta: {
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit) || 1,
      pendingCount: countsData.pendingCount,
      approvedCount: countsData.approvedCount,
      rejectedCount: countsData.rejectedCount,
      notSubmittedCount: countsData.notSubmittedCount,
    },
  });
}

export async function adminReviewProof(request: AuthenticatedRequest, response: Response) {
  const id = routeParam(request, "id");
  const payload = validateBody(adminProofReviewSchema, request);
  const status = payload.approved ? "APPROVED" : "REJECTED";

  const existing = await prisma.registration.findUnique({
    where: { id },
    include: { event: true, proofUpload: true },
  });
  if (!existing) {
    throw new ApiError(404, "Registration not found");
  }

  const registration = await prisma.registration.update({
    where: { id },
    data: {
      proofStatus: status,
      finishTimeSeconds: payload.finishTimeSeconds ?? existing.finishTimeSeconds,
      proofUpload: existing.proofUpload
        ? {
          update: {
            status,
            reviewerNote: payload.reviewerNote,
            reviewedAt: new Date(),
          },
        }
        : undefined,
    },
    include: {
      user: true,
      event: true,
      proofUpload: true,
      certificate: true,
      medalDelivery: true,
    },
  });

  let certificateIssue: Awaited<ReturnType<typeof issueCertificateAfterApproval>> | null =
    null;

  if (payload.approved) {
    if (existing.event.medalIncluded) {
      await prisma.medalDelivery.upsert({
        where: { registrationId: id },
        create: { registrationId: id, status: "PENDING" },
        update: {},
      });
    }

    // Auto-generate certificate & send email to runner immediately upon approval
    try {
      certificateIssue = await issueCertificateAfterApproval(id);
    } catch (err) {
      logger.error("[admin] Certificate issue after approval failed", err, { registrationId: id });
      await ensureCertificateForRegistration(id);
    }
  }

  await writeAdminAudit(request, {
    action: payload.approved ? "proof.approve" : "proof.reject",
    entityType: "Registration",
    entityId: id,
    summary: `${status} proof for ${registration.bibNumber}`,
  });

  const refreshed = await prisma.registration.findUnique({
    where: { id },
    include: {
      user: true,
      event: true,
      proofUpload: true,
      certificate: true,
      medalDelivery: true,
    },
  });

  invalidateProofCountsCache();
  invalidateAdminOverviewCache();

  response.json({
    data: refreshed ?? registration,
    meta: {
      certificate: certificateIssue
        ? {
          id: certificateIssue.certificate.id,
          status: certificateIssue.certificate.status,
          certificateNumber: certificateIssue.certificate.certificateNumber,
          pdfUrl: certificateIssue.certificate.pdfUrl,
          emailSent: certificateIssue.email.sent,
          emailError: certificateIssue.email.error ?? null,
        }
        : refreshed?.certificate
          ? {
            id: refreshed.certificate.id,
            status: refreshed.certificate.status,
            certificateNumber: refreshed.certificate.certificateNumber,
            pdfUrl: refreshed.certificate.pdfUrl,
            emailSent: false,
            emailError: null,
          }
          : null,
    },
  });
}

// ── Medals & Dispatch Hub ──────────────────────────────────────

export async function adminListMedals(request: AuthenticatedRequest, response: Response) {
  const { page, pageSize, skip } = parsePage(request, 50);
  const status = q(request, "status"); // PENDING | DISPATCHED | DELIVERED | RETURNED | ALL
  const eventId = q(request, "eventId");
  const proofStatus = q(request, "proofStatus"); // default: APPROVED or all
  const search = q(request, "search")?.trim();

  const where: Prisma.RegistrationWhereInput = {
    status: { in: ["CONFIRMED", "COMPLETED"] },
    ...(eventId ? { eventId } : {}),
    ...(proofStatus && proofStatus !== "ALL"
      ? { proofStatus: proofStatus as never }
      : !proofStatus
        ? { proofStatus: "APPROVED" }
        : {}),
    ...(status && status !== "ALL"
      ? status === "PENDING"
        ? {
          OR: [
            { medalDelivery: null },
            { medalDelivery: { status: "PENDING" } },
          ],
        }
        : {
          medalDelivery: { status: status as never },
        }
      : {}),
    ...(search
      ? {
        OR: [
          { bibNumber: { contains: search, mode: "insensitive" } },
          { shippingName: { contains: search, mode: "insensitive" } },
          { shippingPhone: { contains: search, mode: "insensitive" } },
          { shippingCity: { contains: search, mode: "insensitive" } },
          { shippingPincode: { contains: search, mode: "insensitive" } },
          { user: { name: { contains: search, mode: "insensitive" } } },
          { user: { email: { contains: search, mode: "insensitive" } } },
        ],
      }
      : {}),
  };

  const [total, items, readyCount, dispatchedCount, deliveredCount, approvedCount] =
    await Promise.all([
      prisma.registration.count({ where }),
      prisma.registration.findMany({
        where,
        orderBy: [{ proofUpload: { reviewedAt: "desc" } }, { registeredAt: "desc" }],
        skip,
        take: pageSize,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          event: { select: { id: true, title: true, slug: true } },
          proofUpload: true,
          certificate: { select: { id: true, certificateNumber: true, status: true, pdfUrl: true } },
          medalDelivery: true,
        },
      }),
      prisma.registration.count({
        where: {
          status: { in: ["CONFIRMED", "COMPLETED"] },
          proofStatus: "APPROVED",
          OR: [{ medalDelivery: null }, { medalDelivery: { status: "PENDING" } }],
          ...(eventId ? { eventId } : {}),
        },
      }),
      prisma.registration.count({
        where: {
          status: { in: ["CONFIRMED", "COMPLETED"] },
          medalDelivery: { status: "DISPATCHED" },
          ...(eventId ? { eventId } : {}),
        },
      }),
      prisma.registration.count({
        where: {
          status: { in: ["CONFIRMED", "COMPLETED"] },
          medalDelivery: { status: "DELIVERED" },
          ...(eventId ? { eventId } : {}),
        },
      }),
      prisma.registration.count({
        where: {
          status: { in: ["CONFIRMED", "COMPLETED"] },
          proofStatus: "APPROVED",
          ...(eventId ? { eventId } : {}),
        },
      }),
    ]);

  response.json({
    data: items,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      stats: {
        readyCount,
        dispatchedCount,
        deliveredCount,
        approvedCount,
      },
    },
  });
}

export async function adminExportMedalsCsv(
  request: AuthenticatedRequest,
  response: Response,
) {
  const eventId = q(request, "eventId");
  const status = q(request, "status");
  const proofStatus = q(request, "proofStatus");
  const search = q(request, "search")?.trim();

  const where: Prisma.RegistrationWhereInput = {
    status: { in: ["CONFIRMED", "COMPLETED"] },
    ...(eventId ? { eventId } : {}),
    ...(proofStatus && proofStatus !== "ALL"
      ? { proofStatus: proofStatus as never }
      : !proofStatus
        ? { proofStatus: "APPROVED" }
        : {}),
    ...(status && status !== "ALL"
      ? status === "PENDING"
        ? {
          OR: [
            { medalDelivery: null },
            { medalDelivery: { status: "PENDING" } },
          ],
        }
        : {
          medalDelivery: { status: status as never },
        }
      : {}),
    ...(search
      ? {
        OR: [
          { bibNumber: { contains: search, mode: "insensitive" } },
          { shippingName: { contains: search, mode: "insensitive" } },
          { shippingPhone: { contains: search, mode: "insensitive" } },
          { shippingCity: { contains: search, mode: "insensitive" } },
          { shippingPincode: { contains: search, mode: "insensitive" } },
          { user: { name: { contains: search, mode: "insensitive" } } },
          { user: { email: { contains: search, mode: "insensitive" } } },
        ],
      }
      : {}),
  };

  const rows = await prisma.registration.findMany({
    where,
    orderBy: { registeredAt: "desc" },
    include: {
      user: true,
      event: true,
      proofUpload: true,
      medalDelivery: true,
      certificate: true,
    },
    take: 5000,
  });

  const header = [
    "BIB Number",
    "Recipient Name",
    "Phone",
    "Email",
    "Address Line 1",
    "Address Line 2",
    "City",
    "State",
    "Pincode",
    "Event Name",
    "Distance",
    "Finish Time (HH:MM:SS)",
    "Proof Status",
    "Medal Status",
    "Courier",
    "Tracking Number",
    "Tracking URL",
    "Certificate Number",
    "Dispatched Date",
    "Registration Date",
  ];

  const escapeCsv = (val: string | number | null | undefined) => {
    if (val == null) return "";
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const formatSeconds = (sec: number | null | undefined) => {
    if (sec == null || sec <= 0) return "";
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        escapeCsv(r.bibNumber),
        escapeCsv(r.shippingName || r.user.name),
        escapeCsv(r.shippingPhone || r.user.phone),
        escapeCsv(r.user.email),
        escapeCsv(r.shippingLine1),
        escapeCsv(r.shippingLine2 || ""),
        escapeCsv(r.shippingCity),
        escapeCsv(r.shippingState),
        escapeCsv(r.shippingPincode),
        escapeCsv(r.event.title),
        escapeCsv(r.distance),
        escapeCsv(formatSeconds(r.finishTimeSeconds)),
        escapeCsv(r.proofStatus),
        escapeCsv(r.medalDelivery?.status || "PENDING"),
        escapeCsv(r.medalDelivery?.courier || ""),
        escapeCsv(r.medalDelivery?.trackingNumber || ""),
        escapeCsv(r.medalDelivery?.trackingUrl || ""),
        escapeCsv(r.certificate?.certificateNumber || ""),
        escapeCsv(r.medalDelivery?.dispatchedAt ? r.medalDelivery.dispatchedAt.toISOString().split("T")[0] : ""),
        escapeCsv(r.registeredAt ? r.registeredAt.toISOString().split("T")[0] : ""),
      ].join(","),
    ),
  ];

  const filename = `runnerup-dispatch-${new Date().toISOString().split("T")[0]}.csv`;
  response.setHeader("Content-Type", "text/csv; charset=utf-8");
  response.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  response.send(lines.join("\n"));
}

export async function adminUpdateMedal(request: AuthenticatedRequest, response: Response) {
  const id = routeParam(request, "id");
  const payload = validateBody(adminMedalUpdateSchema, request);

  // Check if id is a registrationId or medalDelivery id
  let targetRegistrationId = id;
  const existingDelivery = await prisma.medalDelivery.findUnique({
    where: { id },
  });

  if (existingDelivery) {
    targetRegistrationId = existingDelivery.registrationId;
  }

  const medal = await prisma.medalDelivery.upsert({
    where: { registrationId: targetRegistrationId },
    create: {
      registrationId: targetRegistrationId,
      status: payload.status,
      courier: payload.courier === undefined ? null : payload.courier,
      trackingNumber: payload.trackingNumber === undefined ? null : payload.trackingNumber,
      trackingUrl: payload.trackingUrl || null,
      dispatchedAt: payload.status === "DISPATCHED" ? new Date() : null,
      deliveredAt: payload.status === "DELIVERED" ? new Date() : null,
    },
    update: {
      status: payload.status,
      courier: payload.courier === undefined ? undefined : payload.courier,
      trackingNumber:
        payload.trackingNumber === undefined ? undefined : payload.trackingNumber,
      trackingUrl:
        payload.trackingUrl === "" || payload.trackingUrl === undefined
          ? payload.trackingUrl === ""
            ? null
            : undefined
          : payload.trackingUrl,
      dispatchedAt: payload.status === "DISPATCHED" ? new Date() : undefined,
      deliveredAt: payload.status === "DELIVERED" ? new Date() : undefined,
    },
    include: {
      registration: {
        include: { user: true, event: true },
      },
    },
  });

  await writeAdminAudit(request, {
    action: "medal.update",
    entityType: "MedalDelivery",
    entityId: medal.id,
    summary: `Medal for ${medal.registration.bibNumber} → ${payload.status}${payload.trackingNumber ? ` (${payload.trackingNumber})` : ""}`,
  });

  response.json({ data: medal });
}

// ── Certificates ───────────────────────────────────────────────

export async function adminListCertificates(request: AuthenticatedRequest, response: Response) {
  const { page, pageSize, skip } = parsePage(request, 1000);
  const status = q(request, "status");
  const search = q(request, "search")?.trim();

  const where: Prisma.CertificateWhereInput = {
    ...(status ? { status: status as never } : {}),
    ...(search
      ? {
        OR: [
          { certificateNumber: { contains: search, mode: "insensitive" } },
          { registration: { bibNumber: { contains: search, mode: "insensitive" } } },
          { registration: { user: { name: { contains: search, mode: "insensitive" } } } },
          { registration: { user: { email: { contains: search, mode: "insensitive" } } } },
          { registration: { event: { title: { contains: search, mode: "insensitive" } } } },
        ],
      }
      : {}),
  };

  const [total, items, countsByStatus] = await Promise.all([
    prisma.certificate.count({ where }),
    prisma.certificate.findMany({
      where,
      orderBy: { id: "desc" },
      skip,
      take: pageSize,
      include: {
        registration: {
          include: {
            user: { select: { name: true, email: true } },
            event: { select: { title: true } },
          },
        },
      },
    }),
    prisma.certificate.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  const statusCounts = {
    QUEUED: 0,
    GENERATED: 0,
    SENT: 0,
    total: 0,
  };
  for (const c of countsByStatus) {
    if (c.status in statusCounts) {
      statusCounts[c.status as keyof typeof statusCounts] = c._count.status;
    }
    statusCounts.total += c._count.status;
  }

  response.json({
    data: items,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      statusCounts,
    },
  });
}

export async function adminUpdateCertificate(request: AuthenticatedRequest, response: Response) {
  const id = routeParam(request, "id");
  const payload = validateBody(adminCertificateUpdateSchema, request);

  const certificate = await prisma.certificate.update({
    where: { id },
    data: {
      status: payload.status,
      pdfUrl:
        payload.pdfUrl === "" ? null : payload.pdfUrl === undefined ? undefined : payload.pdfUrl,
      issuedAt:
        payload.status === "GENERATED" || payload.status === "SENT" ? new Date() : undefined,
    },
    include: {
      registration: {
        include: { user: true, event: true },
      },
    },
  });

  await writeAdminAudit(request, {
    action: "certificate.update",
    entityType: "Certificate",
    entityId: id,
    summary: `Certificate → ${payload.status}`,
  });

  response.json({ data: certificate });
}

export async function adminGenerateCertificate(
  request: AuthenticatedRequest,
  response: Response,
) {
  const id = routeParam(request, "id");
  const certificate = await generateCertificate(id);

  await writeAdminAudit(request, {
    action: "certificate.generate",
    entityType: "Certificate",
    entityId: id,
    summary: `Generated ${certificate.certificateNumber}`,
  });

  response.json({ data: certificate });
}

export async function adminSendCertificate(request: AuthenticatedRequest, response: Response) {
  const id = routeParam(request, "id");
  const result = await emailCertificate(id);

  await writeAdminAudit(request, {
    action: "certificate.send",
    entityType: "Certificate",
    entityId: id,
    summary: result.email.sent
      ? `Emailed ${result.certificate.certificateNumber}`
      : `Email failed for ${result.certificate.certificateNumber}: ${result.email.error ?? "unknown"}`,
  });

  response.json({
    data: result.certificate,
    meta: { email: result.email },
  });
}

export async function adminGenerateAndSendCertificate(
  request: AuthenticatedRequest,
  response: Response,
) {
  const id = routeParam(request, "id");
  await generateCertificate(id);
  const result = await emailCertificate(id);

  await writeAdminAudit(request, {
    action: "certificate.generate_send",
    entityType: "Certificate",
    entityId: id,
    summary: `Generate+send ${result.certificate.certificateNumber} (email: ${result.email.sent ? "ok" : "fail"})`,
  });

  response.json({
    data: result.certificate,
    meta: { email: result.email },
  });
}

export async function adminBulkGenerateCertificates(
  request: AuthenticatedRequest,
  response: Response,
) {
  const limitRaw = typeof request.query.limit === "string" ? Number(request.query.limit) : 50;
  const items = await bulkGenerateQueuedCertificates(Number.isFinite(limitRaw) ? limitRaw : 50);

  await writeAdminAudit(request, {
    action: "certificate.bulk_generate",
    entityType: "Certificate",
    entityId: "bulk",
    summary: `Bulk generated ${items.length} certificates`,
  });

  response.json({ data: items, meta: { count: items.length } });
}

export async function adminBulkSendCertificates(
  request: AuthenticatedRequest,
  response: Response,
) {
  const limitRaw = typeof request.query.limit === "string" ? Number(request.query.limit) : 50;
  const items = await bulkEmailGeneratedCertificates(Number.isFinite(limitRaw) ? limitRaw : 50);
  const sent = items.filter((i) => i.email.sent).length;

  await writeAdminAudit(request, {
    action: "certificate.bulk_send",
    entityType: "Certificate",
    entityId: "bulk",
    summary: `Bulk emailed ${sent}/${items.length} certificates`,
  });

  response.json({
    data: items.map((i) => ({
      certificate: i.certificate,
      email: i.email,
    })),
    meta: { count: items.length, sent },
  });
}

/** Resend certificate emails to ALL confirmed participants (SENT + GENERATED + QUEUED). */
export async function adminBulkResendAllCertificates(
  request: AuthenticatedRequest,
  response: Response,
) {
  const limitRaw = typeof request.query.limit === "string" ? Number(request.query.limit) : 200;
  const items = await bulkResendAllCertificates(Number.isFinite(limitRaw) ? limitRaw : 200);
  const sent = items.filter((i) => i.email.sent).length;

  await writeAdminAudit(request, {
    action: "certificate.bulk_resend_all",
    entityType: "Certificate",
    entityId: "bulk",
    summary: `Bulk re-emailed ${sent}/${items.length} certificates to all participants`,
  });

  response.json({
    data: items.map((i) => ({
      certificate: i.certificate,
      email: i.email,
    })),
    meta: { count: items.length, sent },
  });
}

/** Return a rendered HTML preview of the certificate email for a given certificate. */
export async function adminCertificateEmailPreview(
  request: AuthenticatedRequest,
  response: Response,
) {
  const certId = routeParam(request, "id");
  const cert = await prisma.certificate.findUnique({
    where: { id: certId },
    include: {
      registration: {
        include: { user: true, event: true },
      },
    },
  });

  if (!cert) throw new ApiError(404, "Certificate not found");

  const render = toCertificateRenderData({
    certificateNumber: cert.certificateNumber,
    runnerName: cert.registration.user.name,
    eventTitle: cert.registration.event.title,
    distance: cert.registration.distance,
    bibNumber: cert.registration.bibNumber,
    finishTimeSeconds: cert.registration.finishTimeSeconds,
    issuedAt: cert.issuedAt,
  });

  const html = buildCertificateEmailHtml(render);
  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.send(html);
}

/** Create a certificate row for an approved registration that is missing one. */
export async function adminEnsureCertificateForRegistration(
  request: AuthenticatedRequest,
  response: Response,
) {
  const registrationId = routeParam(request, "id");
  const registration = await prisma.registration.findUnique({ where: { id: registrationId } });
  if (!registration) {
    throw new ApiError(404, "Registration not found");
  }
  if (registration.proofStatus !== "APPROVED") {
    throw new ApiError(422, "Certificate can only be created for approved proofs");
  }

  const cert = await ensureCertificateForRegistration(registrationId);
  const generated = await generateCertificate(cert.id);

  await writeAdminAudit(request, {
    action: "certificate.ensure",
    entityType: "Certificate",
    entityId: generated.id,
    summary: `Ensured certificate for registration ${registration.bibNumber}`,
  });

  response.json({ data: generated });
}

// ── Coupons ────────────────────────────────────────────────────

export async function adminListCoupons(_request: AuthenticatedRequest, response: Response) {
  const items = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  response.json({ data: items });
}

export async function adminCreateCoupon(request: AuthenticatedRequest, response: Response) {
  const payload = validateBody(adminCouponSchema, request);
  const coupon = await prisma.coupon.create({
    data: {
      code: payload.code,
      discountPaise: payload.discountPaise,
      maxRedemptions: payload.maxRedemptions ?? null,
      expiresAt: payload.expiresAt ?? null,
      active: payload.active ?? true,
    },
  });

  await writeAdminAudit(request, {
    action: "coupon.create",
    entityType: "Coupon",
    entityId: coupon.id,
    summary: `Created coupon ${coupon.code}`,
  });

  response.status(201).json({ data: coupon });
}

export async function adminUpdateCoupon(request: AuthenticatedRequest, response: Response) {
  const id = routeParam(request, "id");
  const payload = validateBody(adminCouponUpdateSchema, request);
  const coupon = await prisma.coupon.update({
    where: { id },
    data: payload,
  });

  await writeAdminAudit(request, {
    action: "coupon.update",
    entityType: "Coupon",
    entityId: id,
    summary: `Updated coupon ${coupon.code}`,
  });

  response.json({ data: coupon });
}

export async function adminDeleteCoupon(request: AuthenticatedRequest, response: Response) {
  const id = routeParam(request, "id");
  await prisma.coupon.delete({ where: { id } });
  await writeAdminAudit(request, {
    action: "coupon.delete",
    entityType: "Coupon",
    entityId: id,
    summary: "Deleted coupon",
  });
  response.status(204).send();
}

// ── Audit ──────────────────────────────────────────────────────

export async function adminListAudit(request: AuthenticatedRequest, response: Response) {
  const { page, pageSize, skip } = parsePage(request);
  const [total, items] = await Promise.all([
    prisma.adminAuditLog.count(),
    prisma.adminAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
  ]);

  response.json({
    data: items,
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  });
}

// ── Newsletter / Subscribers ──────────────────────────────────

export async function adminListSubscribers(request: AuthenticatedRequest, response: Response) {
  const total = await prisma.subscriber.count({ where: { subscribed: true } });
  const items = await prisma.subscriber.findMany({
    where: { subscribed: true },
    orderBy: { createdAt: "desc" },
  });
  response.json({ data: items, meta: { total } });
}

const newsletterSchema = z.object({
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(10000),
});

export async function adminSendNewsletter(request: AuthenticatedRequest, response: Response) {
  const { subject, body } = newsletterSchema.parse(request.body);

  const subscribers = await prisma.subscriber.findMany({
    where: { subscribed: true },
    select: { email: true },
  });

  if (subscribers.length === 0) {
    response.json({ data: { sent: 0, message: "No active subscribers." } });
    return;
  }

  const resendApiKey = env.resendApiKey;
  if (!resendApiKey) {
    response.json({ data: { sent: 0, message: "Resend not configured. Set RESEND_API_KEY." } });
    return;
  }

  const resend = new Resend(resendApiKey);
  const from = env.resendFromEmail;
  let sent = 0;
  const errors: string[] = [];

  for (const sub of subscribers) {
    try {
      const result = await resend.emails.send({
        from,
        to: sub.email,
        replyTo: env.resendReplyToEmail,
        subject: `RunnerUp — ${subject}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#151512;padding:24px;"><div style="background:linear-gradient(135deg,#e64833,#c93b27);border-radius:12px;padding:24px;margin-bottom:24px;"><h1 style="color:#fff;margin:0;font-size:20px;">RunnerUp</h1></div>${body}<hr style="border:none;border-top:1px solid #eee;margin:24px 0;"><p style="color:#999;font-size:12px;">You received this email because you subscribed to RunnerUp updates. If you no longer wish to hear from us, <a href="${env.frontendUrl}/unsubscribe?email=${encodeURIComponent(sub.email)}" style="color:#e64833;">unsubscribe here</a>.</p></div>`,
        text: body.replace(/<[^>]+>/g, ""),
      });
      if (result.error) {
        errors.push(`${sub.email}: ${result.error.message}`);
      } else {
        sent++;
      }
    } catch (err) {
      errors.push(`${sub.email}: ${err instanceof Error ? err.message : "Unknown"}`);
    }
  }

  await writeAdminAudit(request, {
    action: "newsletter.send",
    entityType: "Newsletter",
    entityId: subject.slice(0, 60),
    summary: `Sent newsletter "${subject}" to ${sent}/${subscribers.length} subscribers`,
  });

  response.json({
    data: {
      sent,
      total: subscribers.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Sent to ${sent} of ${subscribers.length} subscribers.`,
    },
  });
}
