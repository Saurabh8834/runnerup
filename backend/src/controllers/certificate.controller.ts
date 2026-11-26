import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";
import { routeParam } from "../utils/params.js";
import { recordDownload } from "../services/download-tracker.service.js";
import { resolveLegacyBib } from "../services/legacy-bib.service.js";

const certInclude = {
  registration: {
    include: {
      user: true,
      event: true,
      payment: true,
    },
  },
} as const;

type CertificateWithRegistration = Prisma.CertificateGetPayload<{
  include: typeof certInclude;
}>;

export async function verifyCertificate(request: Request, response: Response) {
  const rawParam = routeParam(request, "certificateNumber").trim();
  const cleanDigits = rawParam.replace(/\D/g, "");
  const strippedParam = rawParam
    .replace(/^CERT-IAF26-/i, "")
    .replace(/^CERT-NCAD-/i, "")
    .replace(/^CERT-KRUN-/i, "")
    .replace(/^CERT-/i, "")
    .trim();
  const cleanBibDigits = strippedParam.replace(/\D/g, "") || cleanDigits;
  const prefix6 = cleanBibDigits.length === 7 ? cleanBibDigits.slice(0, 6) : null;

  const mode = "insensitive" as const;

  // Resolve legacy IAF bib / certificate mapping (e.g. CERT-IAF26-IAFD495096, IAFD-495096, 495096, 7839427810)
  const legacyEntry = resolveLegacyBib(rawParam);

  const isKineticQuery = /^CERT-KRUN/i.test(rawParam) || /^KRUN/i.test(rawParam) || /kinetic/i.test(rawParam);
  const isCancerQuery = /^CERT-NCAD/i.test(rawParam) || /^NCAD/i.test(rawParam) || /cancer/i.test(rawParam);
  const isIafQuery = !isKineticQuery && !isCancerQuery && (Boolean(legacyEntry) || /^CERT-IAF/i.test(rawParam) || /^IAF/i.test(rawParam));

  // Strict event slug filtering to prevent cross-event bib/certificate collisions
  const eventSlugFilter = isKineticQuery
    ? { slug: { contains: "kinetic", mode } }
    : isCancerQuery
      ? { slug: { contains: "cancer", mode } }
      : isIafQuery
        ? { slug: { contains: "air-force", mode } }
        : undefined;

  const phoneFilter = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : null;
  const isEmail = rawParam.includes("@");

  type TargetReg = Prisma.RegistrationGetPayload<{
    include: {
      user: true;
      event: true;
      payment: true;
      certificate: true;
    };
  }>;

  async function resolveRegCertificate(targetReg: TargetReg): Promise<CertificateWithRegistration> {
    const evSlug = targetReg.event?.slug?.toLowerCase() || "";
    const isTargetKinetic = evSlug.includes("kinetic");
    if (isTargetKinetic) {
      throw new ApiError(
        403,
        "Certificate locked. The Kinetic Run Virtual Challenge takes place on 10–15 December 2026. Official verified finisher certificates unlock automatically after the challenge concludes on 15 December.",
      );
    }

    if (targetReg.certificate) {
      const found = await prisma.certificate.findUnique({
        where: { id: targetReg.certificate.id },
        include: certInclude,
      });
      if (found) return found;
    }

    const cleanBibNum = targetReg.bibNumber
      .replace(/^NCAD-?/i, "")
      .replace(/^KRUN-?/i, "")
      .replace(/^IAF26-?/i, "")
      .replace(/[^A-Za-z0-9]/g, "") || targetReg.bibNumber.replace(/[^A-Za-z0-9]/g, "");
    const prefix = evSlug.includes("cancer")
      ? "CERT-NCAD"
      : "CERT-IAF26";
    const certNum = `${prefix}-${cleanBibNum}`;
    const issuedDate = evSlug.includes("cancer")
      ? new Date("2026-11-17T18:00:00.000Z")
      : new Date("2026-10-31T06:30:00.000Z");
    return prisma.certificate.create({
      data: {
        registrationId: targetReg.id,
        certificateNumber: certNum,
        pdfUrl: `/certificates/${certNum}`,
        qrPayload: JSON.stringify({ issuer: "Runner Up", certificateNumber: certNum, verifyUrl: `https://runnerup.in/certificates/${certNum}` }),
        status: "SENT",
        issuedAt: issuedDate,
      },
      include: certInclude,
    });
  }

  let certificate: CertificateWithRegistration | null = null;

  // Stage 1: Exact certificateNumber or ID match (fastest and highest priority)
  certificate = await prisma.certificate.findFirst({
    where: {
      OR: [
        { certificateNumber: { equals: rawParam, mode } },
        { id: rawParam },
        { registrationId: rawParam },
      ],
    },
    include: certInclude,
  });

  // Stage 2: Legacy IAF mapping
  if (!certificate && legacyEntry && isIafQuery) {
    certificate = await prisma.certificate.findFirst({
      where: {
        OR: [
          { registrationId: legacyEntry.registrationId },
          { id: legacyEntry.registrationId },
          { registration: { bibNumber: legacyEntry.currentBib } },
          { certificateNumber: { equals: legacyEntry.certNumber, mode } },
          { certificateNumber: { equals: `CERT-IAF26-${legacyEntry.currentBib}`, mode } },
        ],
      },
      include: certInclude,
    });
  }

  // Stage 3: Email lookup (e.g. sheetalgudmewar@gmail.com)
  if (!certificate && isEmail) {
    const emailParam = rawParam.trim().toLowerCase();
    certificate = await prisma.certificate.findFirst({
      where: {
        AND: [
          ...(eventSlugFilter ? [{ registration: { event: eventSlugFilter } }] : []),
          { registration: { user: { email: { equals: emailParam, mode } } } },
        ],
      },
      orderBy: { issuedAt: "desc" },
      include: certInclude,
    });

    if (!certificate) {
      const reg = await prisma.registration.findFirst({
        where: {
          AND: [
            ...(eventSlugFilter ? [{ event: eventSlugFilter }] : []),
            { user: { email: { equals: emailParam, mode } } },
          ],
        },
        orderBy: { registeredAt: "desc" },
        include: {
          user: true,
          event: true,
          payment: true,
          certificate: true,
        },
      });

      if (reg) {
        certificate = await resolveRegCertificate(reg);
      }
    }
  }

  // Stage 4: Exact Bib Number or Event-Prefixed Certificate Candidates
  const bibCandidates: string[] = [];
  if (cleanBibDigits) {
    bibCandidates.push(cleanBibDigits);
    bibCandidates.push(`NCAD-${cleanBibDigits}`);
    bibCandidates.push(`IAF26-${cleanBibDigits}`);
    bibCandidates.push(`KRUN-${cleanBibDigits}`);
  }
  if (strippedParam && !bibCandidates.includes(strippedParam)) {
    bibCandidates.push(strippedParam);
  }
  if (rawParam && !bibCandidates.includes(rawParam)) {
    bibCandidates.push(rawParam);
  }
  if (prefix6) {
    bibCandidates.push(`NCAD-${prefix6}`);
  }

  if (!certificate && !isEmail && bibCandidates.length > 0) {
    const certNumCandidates: string[] = [];
    if (isCancerQuery || (!isKineticQuery && !isIafQuery)) {
      if (cleanBibDigits) certNumCandidates.push(`CERT-NCAD-${cleanBibDigits}`);
      if (cleanDigits && cleanDigits !== cleanBibDigits) certNumCandidates.push(`CERT-NCAD-${cleanDigits}`);
      if (prefix6) certNumCandidates.push(`CERT-NCAD-${prefix6}`);
    }
    if (isIafQuery || (!isKineticQuery && !isCancerQuery)) {
      if (cleanBibDigits) certNumCandidates.push(`CERT-IAF26-${cleanBibDigits}`);
      if (cleanDigits && cleanDigits !== cleanBibDigits) certNumCandidates.push(`CERT-IAF26-${cleanDigits}`);
    }
    if (isKineticQuery) {
      if (cleanBibDigits) certNumCandidates.push(`CERT-KRUN-${cleanBibDigits}`);
      if (cleanDigits && cleanDigits !== cleanBibDigits) certNumCandidates.push(`CERT-KRUN-${cleanDigits}`);
    }

    certificate = await prisma.certificate.findFirst({
      where: {
        AND: [
          ...(eventSlugFilter ? [{ registration: { event: eventSlugFilter } }] : []),
          {
            OR: [
              ...certNumCandidates.map((c) => ({ certificateNumber: { equals: c, mode } })),
              ...bibCandidates.map((b) => ({ registration: { bibNumber: { equals: b, mode } } })),
            ],
          },
        ],
      },
      orderBy: { issuedAt: "desc" },
      include: certInclude,
    });
  }

  // Stage 5: Phone number lookup (10 digits)
  if (!certificate && phoneFilter) {
    certificate = await prisma.certificate.findFirst({
      where: {
        AND: [
          ...(eventSlugFilter ? [{ registration: { event: eventSlugFilter } }] : []),
          {
            OR: [
              { registration: { shippingPhone: { contains: phoneFilter } } },
              { registration: { user: { phone: { contains: phoneFilter } } } },
              { registration: { adminNote: { contains: phoneFilter } } },
            ],
          },
        ],
      },
      orderBy: { issuedAt: "desc" },
      include: certInclude,
    });
  }

  // Stage 6: Registration fallback by exact bib/phone if certificate wasn't found yet
  if (!certificate && !isEmail) {
    const reg = await prisma.registration.findFirst({
      where: {
        AND: [
          ...(eventSlugFilter ? [{ event: eventSlugFilter }] : []),
          {
            OR: [
              ...(phoneFilter
                ? [
                    { shippingPhone: { contains: phoneFilter } },
                    { user: { phone: { contains: phoneFilter } } },
                    { adminNote: { contains: phoneFilter } },
                  ]
                : []),
              ...bibCandidates.map((b) => ({ bibNumber: { equals: b, mode } })),
              { id: rawParam },
            ],
          },
        ],
      },
      orderBy: { registeredAt: "desc" },
      include: {
        user: true,
        event: true,
        payment: true,
        certificate: true,
      },
    });

    if (reg) {
      certificate = await resolveRegCertificate(reg);
    }
  }

  if (!certificate) {
    throw new ApiError(404, "Certificate not found");
  }

  // Enforce payment verification: only paid runners can access certificates
  const reg = certificate.registration;
  const isPaid = reg.payment?.status === "PAID" || reg.status === "CONFIRMED" || reg.status === "COMPLETED";
  if (!isPaid) {
    throw new ApiError(402, "Certificate locked. Official finisher certificates are available exclusively for paid participants.");
  }

  // Enforce "Certificates unlock after official release"
  const event = certificate.registration.event;
  const eventSlug = (event.slug || "").toLowerCase();
  const isKinetic = eventSlug.includes("kinetic");
  const isCancer = eventSlug.includes("cancer");
  const now = new Date();
  const eventEndsAt = event.endsAt ? new Date(event.endsAt) : null;
  const isEventConcluded = !isKinetic && (eventEndsAt ? now > eventEndsAt : true);
  const isAdminDemo =
    rawParam.includes("1999") ||
    rawParam.toLowerCase().includes("sourav") ||
    certificate.certificateNumber.includes("1999");

  if (isKinetic && !isAdminDemo) {
    throw new ApiError(
      403,
      "Certificate locked. Official finisher certificates are currently undergoing final audit and validation. They will unlock upon official release announcement.",
    );
  }

  // Non-blocking download/view telemetry
  try {
    recordDownload("CERTIFICATE", certificate.certificateNumber);
    if (certificate.registration.bibNumber) {
      recordDownload("BIB", certificate.registration.bibNumber);
    }
  } catch {}

  const rawActivity = certificate.registration.activityType || "Running";
  const categoryFormatted = rawActivity.charAt(0).toUpperCase() + rawActivity.slice(1).toLowerCase();

  const resolvedName = (
    (certificate.registration.user?.name && !/^runner|user|athlete|participant$/i.test(certificate.registration.user.name.trim())
      ? certificate.registration.user.name
      : "") ||
    certificate.registration.shippingName ||
    certificate.registration.user?.name ||
    "Finisher"
  ).trim();

  response.json({
    data: {
      certificateNumber: certificate.certificateNumber,
      status: certificate.status,
      runnerName: resolvedName.toUpperCase(),
      event: certificate.registration.event.title,
      distance: certificate.registration.distance,
      activityType: rawActivity,
      category: categoryFormatted,
      bibNumber: certificate.registration.bibNumber,
      finishTimeSeconds: certificate.registration.finishTimeSeconds,
      issuedAt: certificate.issuedAt,
      pdfUrl: certificate.pdfUrl,
      verified: true,
      isEventConcluded: isEventConcluded,
      eventEndsAt: eventEndsAt?.toISOString() || null,
    },
  });
}
