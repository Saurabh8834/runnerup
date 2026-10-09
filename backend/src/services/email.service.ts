import { Resend } from "resend";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import {
  buildCertificateEmailHtml,
  type CertificateRenderData,
} from "./certificate.service.js";

const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;

export type RegistrationEmailPayload = {
  to: string;
  runnerName: string;
  eventTitle: string;
  distance: string;
  bibNumber: string;
  amountInPaise: number;
};

function formatRupees(amountInPaise: number) {
  return `Rs. ${(amountInPaise / 100).toFixed(0)}`;
}

function buildConfirmationHtml(payload: RegistrationEmailPayload) {
  const DARK_GREEN = "#1a3a2e";
  const GOLD = "#c9a227";
  const CREAM = "#fefcf7";
  const MUTED = "#8a7a5a";
  const LINE = "#e8dfc8";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Registration Confirmed — Runner Up</title>
</head>
<body style="margin:0;padding:0;background:#f0ede5;font-family:Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Registration confirmed! Welcome to Runner Up, ${payload.runnerName}. Your Bib is ready. 🏃
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0ede5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:${DARK_GREEN};border-radius:16px 16px 0 0;overflow:hidden;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="33.3%" height="4" style="background:#FF9933;"></td>
                  <td width="33.4%" height="4" style="background:#ffffff;"></td>
                  <td width="33.3%" height="4" style="background:#138808;"></td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:28px 32px 20px;text-align:center;">
                    <div style="display:inline-block;background:rgba(255,255,255,0.08);border:1px solid rgba(201,162,39,0.4);border-radius:50px;padding:6px 20px;margin-bottom:10px;">
                      <span style="font-size:11px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:${GOLD};">🏃 RUNNER UP</span>
                    </div>
                    <p style="margin:0;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.5);">Run Anywhere, Anytime · runnerup.in</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body card -->
          <tr>
            <td style="background:${CREAM};border-left:1px solid ${LINE};border-right:1px solid ${LINE};padding:0;">
              <div style="height:2px;background:linear-gradient(90deg,transparent,${GOLD},transparent);"></div>

              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:36px 40px 20px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:28px;">🎉</p>
                    <h1 style="margin:0 0 6px;font-size:26px;font-weight:800;color:${DARK_GREEN};font-family:Georgia,serif;">
                      Registration Confirmed!
                    </h1>
                    <p style="margin:0 0 20px;font-size:13px;letter-spacing:0.15em;text-transform:uppercase;color:${GOLD};">── You're officially in! ──</p>
                    <p style="margin:0;font-size:15px;color:#4a4a4a;line-height:1.7;">
                      Hi <strong style="color:${DARK_GREEN};">${payload.runnerName}</strong>,<br/>
                      Your Runner Up registration is confirmed and payment has been received successfully.<br/>
                      We're thrilled to have you on board! 🏃
                    </p>
                  </td>
                </tr>
              </table>

              <div style="height:1px;background:linear-gradient(90deg,transparent,${GOLD},transparent);margin:0 40px;"></div>

              <!-- Details -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:24px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:12px;overflow:hidden;border:1px solid ${LINE};">
                      <tr>
                        <td style="padding:14px 18px;background:#f8f4ec;border-bottom:1px solid ${LINE};width:40%;">
                          <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${MUTED};">🏆 Event</p>
                        </td>
                        <td style="padding:14px 18px;background:#f8f4ec;border-bottom:1px solid ${LINE};">
                          <p style="margin:0;font-size:14px;font-weight:700;color:${DARK_GREEN};">${payload.eventTitle}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:14px 18px;background:#ffffff;border-bottom:1px solid ${LINE};">
                          <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${MUTED};">🏃 Distance</p>
                        </td>
                        <td style="padding:14px 18px;background:#ffffff;border-bottom:1px solid ${LINE};">
                          <p style="margin:0;font-size:14px;font-weight:700;color:${DARK_GREEN};">${payload.distance}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:14px 18px;background:#f8f4ec;border-bottom:1px solid ${LINE};">
                          <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${MUTED};">🏷️ Bib Number</p>
                        </td>
                        <td style="padding:14px 18px;background:#f8f4ec;border-bottom:1px solid ${LINE};">
                          <p style="margin:0;font-size:18px;font-weight:900;color:${DARK_GREEN};letter-spacing:0.05em;">${payload.bibNumber}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:14px 18px;background:#ffffff;">
                          <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${MUTED};">💳 Amount Paid</p>
                        </td>
                        <td style="padding:14px 18px;background:#ffffff;">
                          <p style="margin:0;font-size:14px;font-weight:700;color:${DARK_GREEN};">${formatRupees(payload.amountInPaise)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <div style="height:1px;background:linear-gradient(90deg,transparent,${GOLD},transparent);margin:0 40px;"></div>

              <!-- Next step message -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:24px 40px;text-align:center;">
                    <p style="margin:0;font-size:14px;color:#4a4a4a;line-height:1.7;">
                      📸 After completing your run, upload your <strong style="color:${DARK_GREEN};">GPS proof</strong> from your dashboard.<br/>
                      Once approved, your official e-certificate will be emailed to you.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:${DARK_GREEN};border-radius:0 0 16px 16px;padding:0;">
              <div style="height:2px;background:linear-gradient(90deg,transparent,${GOLD},transparent);"></div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:24px 32px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:18px;color:rgba(255,255,255,0.9);font-family:Georgia,serif;font-style:italic;">
                      Keep Running, Keep Inspiring!
                    </p>
                    <p style="margin:0 0 16px;font-size:11px;color:${GOLD};letter-spacing:0.2em;text-transform:uppercase;">── Every Finish Has a Story ──</p>
                    <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#ffffff;">Runner Up Team</p>
                    <p style="margin:0 0 16px;font-size:11px;color:rgba(255,255,255,0.4);">Organizer · runnerup.in</p>
                    <table width="200" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
                      <tr>
                        <td width="66" height="3" style="background:#FF9933;border-radius:2px 0 0 2px;"></td>
                        <td width="68" height="3" style="background:#ffffff;"></td>
                        <td width="66" height="3" style="background:#138808;border-radius:0 2px 2px 0;"></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="33.3%" height="4" style="background:#FF9933;border-radius:0 0 0 16px;"></td>
                  <td width="33.4%" height="4" style="background:#ffffff;"></td>
                  <td width="33.3%" height="4" style="background:#138808;border-radius:0 0 16px 0;"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Disclaimer -->
          <tr>
            <td style="padding:16px;text-align:center;">
              <p style="margin:0;font-size:10px;color:#94a3b8;line-height:1.5;">
                You're receiving this because you registered for a Runner Up virtual event.<br/>
                © ${new Date().getFullYear()} Runner Up. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}


export type EmailSendResult = { sent: boolean; id?: string; error?: string };

export async function sendRegistrationConfirmationEmail(
  payload: RegistrationEmailPayload,
): Promise<EmailSendResult> {
  if (!resend) {
    logger.warn("[email] RESEND_API_KEY is not set. Skipping confirmation email", { to: payload.to });
    logger.info("[email] Would send confirmation email", {
      to: payload.to,
      bibNumber: payload.bibNumber,
      eventTitle: payload.eventTitle,
    });
    return { sent: false, error: "RESEND_API_KEY is not configured" };
  }

  try {
    const from = env.resendFromEmail;
    const result = await resend.emails.send({
      from,
      to: payload.to,
      subject: `Runner Up confirmed — Bib ${payload.bibNumber}`,
      html: buildConfirmationHtml(payload),
    });

    if (result.error) {
      logger.error("[email] Resend error", result.error, { from, to: payload.to });
      return {
        sent: false,
        error: `${result.error.message} (from: ${from})`,
      };
    }

    logger.info("[email] Confirmation email sent successfully", {
      emailId: result.data?.id,
      to: payload.to,
      bibNumber: payload.bibNumber,
    });
    return { sent: true, id: result.data?.id };
  } catch (error) {
    logger.error("[email] Failed to send confirmation email", error, { to: payload.to });
    const message = error instanceof Error ? error.message : "Unknown email error";
    return { sent: false, error: message };
  }
}

export async function sendCertificateEmail(input: {
  to: string;
  data: CertificateRenderData;
}): Promise<EmailSendResult> {
  if (!resend) {
    logger.warn("[email] RESEND_API_KEY is not set. Skipping certificate email", { to: input.to });
    logger.info("[email] Would send certificate email", {
      to: input.to,
      certificateNumber: input.data.certificateNumber,
      verifyUrl: input.data.verifyUrl,
    });
    return { sent: false, error: "RESEND_API_KEY is not configured" };
  }

  try {
    const from = env.resendFromEmail;
    const result = await resend.emails.send({
      from,
      to: input.to,
      subject: `Your Runner Up Certificate — ${input.data.eventTitle}`,
      html: buildCertificateEmailHtml(input.data),
    });

    if (result.error) {
      logger.error("[email] Certificate Resend error", result.error, { from, to: input.to });
      return {
        sent: false,
        error: `${result.error.message} (from: ${from})`,
      };
    }

    logger.info("[email] Certificate email sent successfully", {
      emailId: result.data?.id,
      to: input.to,
      certificateNumber: input.data.certificateNumber,
    });
    return { sent: true, id: result.data?.id };
  } catch (error) {
    logger.error("[email] Failed to send certificate email", error, { to: input.to });
    const message = error instanceof Error ? error.message : "Unknown email error";
    return { sent: false, error: message };
  }
}
