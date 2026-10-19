import { Router } from "express";
import {
  adminBulkResendAllCertificates,
  adminCertificateEmailPreview,
  adminCreateCoupon,
  adminCreateEvent,
  adminDeleteCoupon,
  adminDeleteEvent,
  adminExportRegistrationsCsv,
  adminGetEvent,
  adminGetRegistration,
  adminGetUser,
  adminListAudit,
  adminBulkGenerateCertificates,
  adminBulkSendCertificates,
  adminEnsureCertificateForRegistration,
  adminGenerateAndSendCertificate,
  adminGenerateCertificate,
  adminListCertificates,
  adminListCoupons,
  adminListEvents,
  adminListMedals,
  adminExportMedalsCsv,
  adminExportPaymentsCsv,
  adminExportUsersCsv,
  adminListPayments,
  adminListProofs,
  adminListRegistrations,
  adminListSubscribers,
  adminListUsers,
  adminMarkRegistrationPaid,
  adminMe,
  adminOverview,
  adminReviewProof,
  adminSendCertificate,
  adminSendNewsletter,
  adminUpdateCertificate,
  adminUpdateCoupon,
  adminUpdateEvent,
  adminUpdateMedal,
  adminSyncPayments,
  adminUpdatePayment,
  adminDeleteRegistration,
  adminDeleteUser,
  adminUpdateRegistration,
  adminUpdateUserRole,
} from "../controllers/admin.controller.js";
import { env } from "../config/env.js";
import { requireAdmin, requireClerkAuth } from "../middleware/clerk-auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const adminRouter = Router();

// Public emergency passcode login (allows admin access even if Clerk is down or quota capped)
adminRouter.post("/emergency-login", (req, res) => {
  const { passcode } = req.body || {};
  if (!passcode || typeof passcode !== "string" || passcode.trim() !== env.adminEmergencyKey) {
    return res.status(401).json({
      success: false,
      message: "Invalid admin passcode. Please enter the correct master key.",
    });
  }
  const token = `ru_admin_${Buffer.from(`${passcode.trim()}_${Date.now()}`).toString("base64")}`;
  return res.json({
    success: true,
    data: {
      token,
      user: {
        name: "Sourav (Admin)",
        email: env.adminEmails[0] ?? "sourav06556@gmail.com",
        role: "SUPER_ADMIN",
      },
    },
  });
});

adminRouter.use(requireClerkAuth, requireAdmin);

adminRouter.get("/me", asyncHandler(adminMe));
adminRouter.get("/overview", asyncHandler(adminOverview));
adminRouter.get("/audit", asyncHandler(adminListAudit));

adminRouter.get("/events", asyncHandler(adminListEvents));
adminRouter.get("/events/:id", asyncHandler(adminGetEvent));
adminRouter.post("/events", asyncHandler(adminCreateEvent));
adminRouter.put("/events/:id", asyncHandler(adminUpdateEvent));
adminRouter.delete("/events/:id", asyncHandler(adminDeleteEvent));

adminRouter.get("/registrations", asyncHandler(adminListRegistrations));
adminRouter.get("/registrations/export", asyncHandler(adminExportRegistrationsCsv));
adminRouter.get("/registrations/export.csv", asyncHandler(adminExportRegistrationsCsv));
adminRouter.get("/registrations/:id", asyncHandler(adminGetRegistration));
adminRouter.patch("/registrations/:id", asyncHandler(adminUpdateRegistration));
adminRouter.post("/registrations/:id/mark-paid", asyncHandler(adminMarkRegistrationPaid));
adminRouter.delete("/registrations/:id", asyncHandler(adminDeleteRegistration));

adminRouter.get("/payments", asyncHandler(adminListPayments));
adminRouter.get("/payments/export", asyncHandler(adminExportPaymentsCsv));
adminRouter.get("/payments/export.csv", asyncHandler(adminExportPaymentsCsv));
adminRouter.post("/payments/sync", asyncHandler(adminSyncPayments));
adminRouter.post("/users/sync", asyncHandler(adminSyncPayments));
adminRouter.post("/sync", asyncHandler(adminSyncPayments));
adminRouter.patch("/payments/:id", asyncHandler(adminUpdatePayment));

adminRouter.get("/users", asyncHandler(adminListUsers));
adminRouter.get("/users/export", asyncHandler(adminExportUsersCsv));
adminRouter.get("/users/export.csv", asyncHandler(adminExportUsersCsv));
adminRouter.get("/users/:id", asyncHandler(adminGetUser));
adminRouter.patch("/users/:id/role", asyncHandler(adminUpdateUserRole));
adminRouter.delete("/users/:id", asyncHandler(adminDeleteUser));

adminRouter.get("/proofs", asyncHandler(adminListProofs));
adminRouter.post("/proofs/:id/review", asyncHandler(adminReviewProof));

adminRouter.get("/medals/export", asyncHandler(adminExportMedalsCsv));
adminRouter.get("/medals/export.csv", asyncHandler(adminExportMedalsCsv));
adminRouter.get("/medals", asyncHandler(adminListMedals));
adminRouter.patch("/medals/:id", asyncHandler(adminUpdateMedal));

adminRouter.get("/certificates", asyncHandler(adminListCertificates));
adminRouter.patch("/certificates/:id", asyncHandler(adminUpdateCertificate));
adminRouter.post("/certificates/:id/generate", asyncHandler(adminGenerateCertificate));
adminRouter.post("/certificates/:id/send", asyncHandler(adminSendCertificate));
adminRouter.post(
  "/certificates/:id/generate-and-send",
  asyncHandler(adminGenerateAndSendCertificate),
);
adminRouter.post("/certificates/bulk-generate", asyncHandler(adminBulkGenerateCertificates));
adminRouter.post("/certificates/bulk-send", asyncHandler(adminBulkSendCertificates));
adminRouter.post("/certificates/bulk-resend-all", asyncHandler(adminBulkResendAllCertificates));
adminRouter.get("/certificates/:id/email-preview", asyncHandler(adminCertificateEmailPreview));
adminRouter.post(
  "/registrations/:id/certificate",
  asyncHandler(adminEnsureCertificateForRegistration),
);

adminRouter.get("/coupons", asyncHandler(adminListCoupons));
adminRouter.post("/coupons", asyncHandler(adminCreateCoupon));
adminRouter.patch("/coupons/:id", asyncHandler(adminUpdateCoupon));
adminRouter.delete("/coupons/:id", asyncHandler(adminDeleteCoupon));

adminRouter.get("/subscribers", asyncHandler(adminListSubscribers));
adminRouter.post("/newsletter/send", asyncHandler(adminSendNewsletter));
