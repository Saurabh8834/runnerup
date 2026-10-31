import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";
import { routeParam } from "../utils/params.js";
import { recordDownload } from "../services/download-tracker.service.js";

export async function verifyCertificate(request: Request, response: Response) {
  const certificate = await prisma.certificate.findUnique({
    where: { certificateNumber: routeParam(request, "certificateNumber") },
    include: {
      registration: {
        include: {
          user: true,
          event: true,
          payment: true,
        },
      },
    },
  });

  if (!certificate) {
    throw new ApiError(404, "Certificate not found");
  }

  // Only expose issued certificates publicly (GENERATED / SENT)
  if (certificate.status === "QUEUED") {
    throw new ApiError(404, "Certificate not found or not yet issued");
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
