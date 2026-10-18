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
  orderId?: string;
  activityType?: string;
  eventDates?: string;
  eventUrl?: string;
};

function formatRupees(amountInPaise: number) {
  return `Rs. ${(amountInPaise / 100).toFixed(0)}`;
}

function buildConfirmationHtml(payload: RegistrationEmailPayload) {
  const DARK_GREEN = "#1a3a2e";
  const GOLD = "#c9a227";
  const CREAM = "#fcfaf5";
  const MUTED = "#7a6e5a";
  const BORDER_COLOR = "#e2d9c2";

  const firstName = payload.runnerName.trim().split(" ")[0] || payload.runnerName;
  const eventTitle = payload.eventTitle || "Indian Air Force Day Virtual Challenge 2026";
  const eventDates = payload.eventDates || "25–30 October 2026";
  const activity = payload.activityType || "Running / Walking / Cycling";
  const orderId = payload.orderId || payload.bibNumber;
  const eventUrl = payload.eventUrl || "https://www.runnerup.in/events/indian-air-force-day-virtual-challenge";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${eventTitle} — Registration Confirmed</title>
</head>
<body style="margin:0;padding:0;background-color:#ede9df;font-family:'Segoe UI',Roboto,-apple-system,BlinkMacSystemFont,Arial,sans-serif;-webkit-text-size-adjust:100%;">
  
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ede9df;padding:24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:${CREAM};border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.08);border:1px solid ${BORDER_COLOR};">
          
          <!-- Top Indian Tricolor Band -->
          <tr>
            <td style="padding:0;height:6px;line-height:6px;font-size:0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="33.33%" height="6" style="background:#FF9933;"></td>
                  <td width="33.34%" height="6" style="background:#FFFFFF;"></td>
                  <td width="33.33%" height="6" style="background:#138808;"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Header / Brand -->
          <tr>
            <td style="background:${DARK_GREEN};padding:24px 32px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,0.08);border:1px solid rgba(201,162,39,0.5);border-radius:50px;padding:6px 20px;margin-bottom:8px;">
                <span style="font-size:11px;font-weight:800;letter-spacing:0.25em;text-transform:uppercase;color:${GOLD};">🏃 RUNNER UP · VIRTUAL CHALLENGE</span>
              </div>
              <h2 style="margin:4px 0 0;font-size:18px;color:#ffffff;font-weight:700;letter-spacing:0.05em;">
                🇮🇳 ${eventTitle} ✈️
              </h2>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:32px 36px 20px;">
              <p style="margin:0 0 16px;font-size:16px;color:#1e293b;line-height:1.6;">
                Hi <strong>${firstName}</strong>,
              </p>

              <div style="background:#f1f8f5;border-left:4px solid #138808;padding:16px 20px;border-radius:0 10px 10px 0;margin-bottom:24px;">
                <p style="margin:0 0 8px;font-size:15px;color:#0f5132;font-weight:700;line-height:1.5;">
                  Congratulations! 🎉 Your payment has been received successfully, and your registration for the <strong>${eventTitle}</strong> is confirmed! 🏅🇮🇳
                </p>
                <p style="margin:0;font-size:13.5px;color:#1e4620;line-height:1.6;">
                  We're excited to have you join us in celebrating the courage, commitment, and spirit of our Indian Air Force heroes.
                </p>
              </div>

              <!-- 📋 Your Event Details -->
              <div style="margin-bottom:28px;">
                <h3 style="margin:0 0 12px;font-size:15px;color:${DARK_GREEN};text-transform:uppercase;letter-spacing:0.08em;font-weight:800;">
                  📋 Your Event Details
                </h3>
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${BORDER_COLOR};border-radius:12px;overflow:hidden;background:#ffffff;">
                  <tr>
                    <td style="padding:12px 18px;background:#f9f7f1;border-bottom:1px solid ${BORDER_COLOR};width:40%;font-size:13px;color:${MUTED};font-weight:700;">Event</td>
                    <td style="padding:12px 18px;background:#f9f7f1;border-bottom:1px solid ${BORDER_COLOR};font-size:13.5px;font-weight:700;color:${DARK_GREEN};">${eventTitle}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 18px;border-bottom:1px solid ${BORDER_COLOR};font-size:13px;color:${MUTED};font-weight:700;">Event Dates</td>
                    <td style="padding:12px 18px;border-bottom:1px solid ${BORDER_COLOR};font-size:13.5px;font-weight:700;color:${DARK_GREEN};">${eventDates}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 18px;background:#f9f7f1;border-bottom:1px solid ${BORDER_COLOR};font-size:13px;color:${MUTED};font-weight:700;">Registered Distance</td>
                    <td style="padding:12px 18px;background:#f9f7f1;border-bottom:1px solid ${BORDER_COLOR};font-size:14px;font-weight:800;color:#0d5c45;">${payload.distance}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 18px;border-bottom:1px solid ${BORDER_COLOR};font-size:13px;color:${MUTED};font-weight:700;">Activity</td>
                    <td style="padding:12px 18px;border-bottom:1px solid ${BORDER_COLOR};font-size:13.5px;font-weight:700;color:${DARK_GREEN};">${activity}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 18px;background:#f9f7f1;border-bottom:1px solid ${BORDER_COLOR};font-size:13px;color:${MUTED};font-weight:700;">Bib Number</td>
                    <td style="padding:12px 18px;background:#f9f7f1;border-bottom:1px solid ${BORDER_COLOR};font-size:15px;font-weight:900;color:${DARK_GREEN};letter-spacing:0.05em;">${payload.bibNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 18px;border-bottom:1px solid ${BORDER_COLOR};font-size:13px;color:${MUTED};font-weight:700;">Payment Status</td>
                    <td style="padding:12px 18px;border-bottom:1px solid ${BORDER_COLOR};font-size:13.5px;font-weight:700;color:#138808;">Successful ✅</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 18px;background:#f9f7f1;border-bottom:1px solid ${BORDER_COLOR};font-size:13px;color:${MUTED};font-weight:700;">Order ID</td>
                    <td style="padding:12px 18px;background:#f9f7f1;border-bottom:1px solid ${BORDER_COLOR};font-size:13px;font-family:monospace;color:#334155;font-weight:700;">${orderId}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 18px;font-size:13px;color:${MUTED};font-weight:700;">Amount Paid</td>
                    <td style="padding:12px 18px;font-size:13.5px;font-weight:700;color:${DARK_GREEN};">${formatRupees(payload.amountInPaise)}</td>
                  </tr>
                </table>
              </div>

              <!-- 🏃 What's Next? -->
              <div style="background:#ffffff;border:1px solid ${BORDER_COLOR};border-radius:12px;padding:20px 24px;margin-bottom:24px;">
                <h3 style="margin:0 0 14px;font-size:15px;color:${DARK_GREEN};text-transform:uppercase;letter-spacing:0.08em;font-weight:800;">
                  🏃 What's Next?
                </h3>
                <ol style="margin:0;padding-left:20px;font-size:13.5px;color:#334155;line-height:1.75;">
                  <li style="margin-bottom:8px;"><strong>Complete your chosen distance</strong> (1.5 km, 3 km, 5 km, 10 km, or 21 km) by running, walking, or cycling.</li>
                  <li style="margin-bottom:8px;"><strong>Complete your activity anywhere</strong>, at your convenience, within the official event period.</li>
                  <li style="margin-bottom:8px;"><strong>Track your activity</strong> using Strava or another compatible fitness-tracking app.</li>
                  <li style="margin-bottom:0;"><strong>Upload a screenshot</strong> of your completed activity on RunnerUp.in during the event window (${eventDates}).</li>
                </ol>
              </div>

              <!-- 🎁 Your Reward Awaits! -->
              <div style="background:#fffcf0;border:1px solid #e8dbb0;border-left:4px solid ${GOLD};padding:18px 22px;border-radius:0 12px 12px 0;margin-bottom:28px;">
                <p style="margin:0 0 6px;font-size:14px;font-weight:800;color:#78540b;">
                  🎁 Your Reward Awaits!
                </p>
                <p style="margin:0;font-size:13px;color:#634a17;line-height:1.6;">
                  Once the event concludes and your activity proof is verified, your applicable finisher kit will be delivered to your doorstep, as per the event terms and conditions.
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align:center;margin-bottom:28px;">
                <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:${DARK_GREEN};">
                  Ready to take on the challenge?
                </p>
                <a href="${eventUrl}" style="display:inline-block;background:linear-gradient(135deg,#1a3a2e,#0d5c45);color:#ffffff;text-decoration:none;font-weight:800;font-size:14px;padding:14px 32px;border-radius:50px;border:2px solid ${GOLD};box-shadow:0 4px 14px rgba(26,58,46,0.25);">
                  👉 View Event Details &amp; Upload Proof
                </a>
              </div>

              <!-- Patriotic Sign-off -->
              <div style="border-top:1px dashed ${BORDER_COLOR};padding-top:20px;text-align:center;">
                <p style="margin:0 0 10px;font-size:13.5px;color:#475569;line-height:1.6;">
                  Thank you for choosing <strong>RunnerUp.in</strong>. Every step you take is a tribute to the brave hearts who protect our nation. 🇮🇳✈️
                </p>
                <p style="margin:0 0 14px;font-size:14px;font-weight:800;color:${DARK_GREEN};letter-spacing:0.05em;">
                  Run with purpose. Honour our heroes. Make every step count!
                </p>
                <p style="margin:0;font-size:13px;font-weight:700;color:#1e293b;">
                  Warm regards,<br/>
                  <strong style="color:${DARK_GREEN};font-size:14px;">Team RunnerUp 🏅</strong><br/>
                  <a href="https://www.runnerup.in" style="color:#c9a227;text-decoration:none;">runnerup.in</a>
                </p>
                <p style="margin:16px 0 0;font-size:11px;color:#94a3b8;font-style:italic;">
                  *Terms and conditions apply.
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer Band -->
          <tr>
            <td style="padding:0;height:4px;line-height:4px;font-size:0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="33.33%" height="4" style="background:#FF9933;"></td>
                  <td width="33.34%" height="4" style="background:#FFFFFF;"></td>
                  <td width="33.33%" height="4" style="background:#138808;"></td>
                </tr>
              </table>
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
      replyTo: env.resendReplyToEmail,
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
      replyTo: env.resendReplyToEmail,
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
