import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";
import { routeParam } from "../utils/params.js";
import { recordDownload } from "../services/download-tracker.service.js";

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

  const mode = "insensitive" as const;

  let certificate: CertificateWithRegistration | null = await prisma.certificate.findFirst({
    where: {
      OR: [
        { certificateNumber: { equals: rawParam, mode } },
        { certificateNumber: { equals: `CERT-IAF26-${rawParam}`, mode } },
        ...(cleanDigits ? [{ certificateNumber: { equals: `CERT-IAF26-${cleanDigits}`, mode } }] : []),
        ...(cleanDigits ? [{ registration: { bibNumber: cleanDigits } }] : []),
        { registration: { bibNumber: rawParam } },
        { id: rawParam },
        { registrationId: rawParam },
      ],
    },
    include: certInclude,
  });

  // If still not found by certificate, search registrations directly
  if (!certificate) {
    const reg = await prisma.registration.findFirst({
      where: {
        OR: [
          { bibNumber: rawParam },
          ...(cleanDigits ? [{ bibNumber: cleanDigits }] : []),
          { id: rawParam },
          ...(rawParam.includes("@") ? [{ user: { email: { equals: rawParam, mode } } }] : []),
        ],
      },
      include: {
        user: true,
        event: true,
        payment: true,
        certificate: true,
      },
    });

    if (reg) {
      if (reg.certificate) {
        certificate = await prisma.certificate.findUnique({
          where: { id: reg.certificate.id },
          include: certInclude,
        });
      } else {
        const certNum = `CERT-IAF26-${reg.bibNumber.replace(/[^A-Za-z0-9]/g, "")}`;
        const created = await prisma.certificate.create({
          data: {
            registrationId: reg.id,
            certificateNumber: certNum,
            pdfUrl: `/certificates/${certNum}`,
            qrPayload: JSON.stringify({ issuer: "Runner Up", certificateNumber: certNum, verifyUrl: `https://runnerup.in/certificates/${certNum}` }),
            status: "SENT",
            issuedAt: new Date("2026-10-31T06:30:00.000Z"),
          },
          include: certInclude,
        });
        certificate = created;
      }
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

  // Non-blocking download/view telemetry
  try {
    recordDownload("CERTIFICATE", certificate.certificateNumber);
    if (certificate.registration.bibNumber) {
      recordDownload("BIB", certificate.registration.bibNumber);
    }
  } catch {}

  response.json({
    data: {
      certificateNumber: certificate.certificateNumber,
      status: certificate.status,
      runnerName: (certificate.registration.shippingName || certificate.registration.user.name || "Finisher").toUpperCase(),
      event: certificate.registration.event.title,
      distance: certificate.registration.distance,
      bibNumber: certificate.registration.bibNumber,
      finishTimeSeconds: certificate.registration.finishTimeSeconds,
      issuedAt: certificate.issuedAt,
      pdfUrl: certificate.pdfUrl,
      verified: true,
    },
  });
}
