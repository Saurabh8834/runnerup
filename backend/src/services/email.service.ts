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
  const isIafEvent =
    /air.?force|iaf/i.test(payload.eventTitle || "") ||
    /air.?force|iaf/i.test(payload.eventUrl || "") ||
    (Boolean(payload.bibNumber) && /^IAF/i.test(payload.bibNumber));
  const isCancerEvent = !isIafEvent;

  const DARK_GREEN = isCancerEvent ? "#1e293b" : "#1a3a2e";
  const GOLD = isCancerEvent ? "#f59e0b" : "#c9a227";
  const CREAM = "#fcfaf5";
  const MUTED = "#7a6e5a";
  const BORDER_COLOR = "#e2d9c2";

  const firstName = payload.runnerName.trim().split(" ")[0] || payload.runnerName;
  const eventTitle = isCancerEvent
    ? (payload.eventTitle || "National Cancer Awareness Day Virtual Challenge 2026")
    : (payload.eventTitle || "Indian Air Force Day Virtual Challenge 2026");
  const eventDates = isCancerEvent
    ? "7–15 November 2026"
    : (payload.eventDates || "25–30 October 2026");
  const activity = payload.activityType || "Running / Walking / Cycling";
  const orderId = payload.orderId || payload.bibNumber;
  const eventUrl = isCancerEvent
    ? (payload.eventUrl || "https://www.runnerup.in/events/national-cancer-awareness-day-virtual-run-2026")
    : (payload.eventUrl || "https://www.runnerup.in/events/indian-air-force-day-virtual-challenge");

  const headerBadge = isCancerEvent
    ? "🎗️ RUNNER UP · CANCER AWARENESS CHALLENGE"
    : "🏃 RUNNER UP · VIRTUAL CHALLENGE";
  const headerTitle = isCancerEvent
    ? `🎗️ ${eventTitle}`
    : `🇮🇳 ${eventTitle} ✈️`;

  const congratulationsPara = isCancerEvent
    ? `<p style="margin:0 0 8px;font-size:15px;color:#0f5132;font-weight:700;line-height:1.5;">
         Congratulations! 🎉 Your payment has been received successfully, and your registration for the <strong>${eventTitle}</strong> is confirmed! 🏅🎗️
       </p>
       <p style="margin:0;font-size:13.5px;color:#1e4620;line-height:1.6;">
         We're honoured to have you join us in running, walking, or cycling to raise vital awareness and support cancer survivors across India.
       </p>`
    : `<p style="margin:0 0 8px;font-size:15px;color:#0f5132;font-weight:700;line-height:1.5;">
         Congratulations! 🎉 Your payment has been received successfully, and your registration for the <strong>${eventTitle}</strong> is confirmed! 🏅🇮🇳
       </p>
       <p style="margin:0;font-size:13.5px;color:#1e4620;line-height:1.6;">
         We're excited to have you join us in celebrating the courage, commitment, and spirit of our Indian Air Force heroes.
       </p>`;

  const rewardPara = isCancerEvent
    ? "Once the event concludes (15 Nov) and your activity proof is verified, your authentic 3D Die-Cast Metal Medal with commemorative lanyard will be delivered directly to your doorstep with free pan-India courier."
    : "Once the event concludes and your activity proof is verified, your applicable finisher kit will be delivered to your doorstep, as per the event terms and conditions.";

  const signoffText = isCancerEvent
    ? `<p style="margin:0 0 10px;font-size:13.5px;color:#475569;line-height:1.6;">
         Thank you for choosing <strong>RunnerUp.in</strong>. Every kilometer you complete spreads hope and honors the fighters, survivors, and families affected by cancer across our nation. 🎗️
       </p>
       <p style="margin:0 0 14px;font-size:14px;font-weight:800;color:${DARK_GREEN};letter-spacing:0.05em;">
         Run with purpose. Run with hope. Make every step count!
       </p>`
    : `<p style="margin:0 0 10px;font-size:13.5px;color:#475569;line-height:1.6;">
         Thank you for choosing <strong>RunnerUp.in</strong>. Every step you take is a tribute to the brave hearts who protect our nation. 🇮🇳✈️
       </p>
       <p style="margin:0 0 14px;font-size:14px;font-weight:800;color:${DARK_GREEN};letter-spacing:0.05em;">
         Run with purpose. Honour our heroes. Make every step count!
       </p>`;

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
                <span style="font-size:11px;font-weight:800;letter-spacing:0.25em;text-transform:uppercase;color:${GOLD};">${headerBadge}</span>
              </div>
              <h2 style="margin:4px 0 0;font-size:18px;color:#ffffff;font-weight:700;letter-spacing:0.05em;">
                ${headerTitle}
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
                ${congratulationsPara}
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
                  <li style="margin-bottom:8px;"><strong>Complete your chosen distance</strong> (${payload.distance}) anytime during the event window (<strong>${eventDates}</strong>) by running, walking, or cycling.</li>
                  <li style="margin-bottom:8px;"><strong>Complete your activity anywhere</strong>, at your convenience, on roads, trails, parks, or treadmill.</li>
                  <li style="margin-bottom:8px;"><strong>Track your activity</strong> using Strava, Nike Run Club, Garmin, Apple Fitness, or any fitness app.</li>
                  <li style="margin-bottom:0;"><strong>Upload a screenshot</strong> of your activity on RunnerUp.in from your Athlete Dashboard during the official submission window.</li>
                </ol>
              </div>

              <!-- 🎁 Your Reward Awaits! -->
              <div style="background:#fffcf0;border:1px solid #e8dbb0;border-left:4px solid ${GOLD};padding:18px 22px;border-radius:0 12px 12px 0;margin-bottom:28px;">
                <p style="margin:0 0 6px;font-size:14px;font-weight:800;color:#78540b;">
                  🎁 Your Reward Awaits!
                </p>
                <p style="margin:0;font-size:13px;color:#634a17;line-height:1.6;">
                  ${rewardPara}
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align:center;margin-bottom:28px;">
                <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:${DARK_GREEN};">
                  Ready to take on the challenge?
                </p>
                <a href="${eventUrl}" style="display:inline-block;background:linear-gradient(135deg,#ff5722,#e64a19);color:#ffffff;text-decoration:none;font-weight:800;font-size:14px;padding:14px 32px;border-radius:50px;box-shadow:0 4px 14px rgba(255,87,34,0.3);">
                  👉 View Event Details &amp; Dashboard
                </a>
              </div>

              <!-- Sign-off -->
              <div style="border-top:1px dashed ${BORDER_COLOR};padding-top:20px;text-align:center;">
                ${signoffText}
                <p style="margin:12px 0 0;font-size:13px;font-weight:700;color:#1e293b;">
                  Warm regards,<br/>
                  <strong style="color:${DARK_GREEN};font-size:14px;">Team RunnerUp 🏅</strong><br/>
                  <a href="https://www.runnerup.in" style="color:${GOLD};text-decoration:none;">www.runnerup.in</a>
                </p>
                <p style="margin:10px 0 0;font-size:12px;color:#64748b;">
                  Need assistance? Write to us directly at <a href="mailto:runnerupofficials@gmail.com" style="color:#ea580c;font-weight:700;text-decoration:none;">runnerupofficials@gmail.com</a> or WhatsApp: <strong>+91 94796 64858</strong>
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
    const isIaf =
      /air.?force|iaf/i.test(payload.eventTitle || "") ||
      /air.?force|iaf/i.test(payload.eventUrl || "") ||
      (Boolean(payload.bibNumber) && /^IAF/i.test(payload.bibNumber));
    const isCancer = !isIaf;

    const subject = isCancer
      ? `Registration Confirmed: National Cancer Awareness Day Challenge — Bib ${payload.bibNumber}`
      : `Registration Confirmed: Indian Air Force Day Challenge — Bib ${payload.bibNumber}`;

    const result = await resend.emails.send({
      from,
      to: payload.to,
      replyTo: "runnerupofficials@gmail.com",
      subject,
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

export type CancerCorrectionEmailPayload = {
  to: string;
  runnerName: string;
  bibNumber: string;
  distance: string;
  amountInPaise: number;
  orderId?: string;
  activityType?: string;
  shippingAddress?: string;
  shippingPhone?: string;
};

export function buildCancerCorrectionEmailHtml(payload: CancerCorrectionEmailPayload): string {
  const DARK_NAVY = "#0f172a";
  const AMBER_GOLD = "#d97706";
  const MUTED = "#64748b";
  const EMERALD = "#059669";

  const firstName = payload.runnerName.trim().split(" ")[0] || payload.runnerName;
  const eventTitle = "National Cancer Awareness Day Virtual Challenge 2026";
  const eventDates = "7–15 November 2026";
  const proofWindow = "7–15 November 2026";
  const activity = payload.activityType || "Running / Walking / Cycling";
  const orderId = payload.orderId || payload.bibNumber;
  const eventUrl = "https://www.runnerup.in/events/national-cancer-awareness-day-virtual-run-2026";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Important Event Update: National Cancer Awareness Day Challenge 2026</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Roboto,-apple-system,BlinkMacSystemFont,Arial,sans-serif;-webkit-text-size-adjust:100%;">
  
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:28px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,0.08);border:1px solid #e2e8f0;">
          
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
            <td style="background:${DARK_NAVY};padding:28px 32px 24px;text-align:center;">
              <div style="display:inline-block;background:rgba(217,119,6,0.15);border:1px solid rgba(245,158,11,0.4);border-radius:50px;padding:6px 20px;margin-bottom:10px;">
                <span style="font-size:11px;font-weight:900;letter-spacing:0.2em;text-transform:uppercase;color:#fbbf24;">🎗️ OFFICIAL EVENT ADMINISTRATION UPDATE</span>
              </div>
              <h2 style="margin:4px 0 0;font-size:20px;color:#ffffff;font-weight:800;letter-spacing:0.02em;line-height:1.3;">
                National Cancer Awareness Day Virtual Challenge 2026
              </h2>
              <p style="margin:8px 0 0;font-size:12px;color:#94a3b8;letter-spacing:0.05em;text-transform:uppercase;font-weight:600;">
                Revised Official Confirmation &amp; Verified Schedule
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:32px 34px 20px;">
              <p style="margin:0 0 16px;font-size:16px;color:#0f172a;line-height:1.6;">
                Dear <strong>${firstName}</strong>,
              </p>

              <!-- Explanation / Maintenance Glitch Notice -->
              <div style="background:#fffbeb;border:1px solid #fde68a;border-left:5px solid ${AMBER_GOLD};padding:18px 20px;border-radius:10px;margin-bottom:26px;">
                <div style="font-size:12px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:#b45309;margin-bottom:6px;">
                  ⚠️ Correction Regarding Your Previous Email
                </div>
                <p style="margin:0 0 10px;font-size:13.5px;color:#78350f;line-height:1.65;">
                  During our recent website system maintenance and automated platform migration, a brief email template glitch caused an earlier confirmation email sent to you to display outdated event dates (25–30 October) from our concluded Indian Air Force Day Challenge.
                </p>
                <p style="margin:0;font-size:13.5px;color:#92400e;line-height:1.65;font-weight:700;">
                  Please rest assured: <strong>Your registration and payment are 100% safe, verified, and active!</strong> Your participation is officially registered for the <strong>National Cancer Awareness Day Virtual Challenge 2026</strong>.
                </p>
              </div>

              <!-- Official Event Details Card -->
              <div style="margin-bottom:28px;">
                <h3 style="margin:0 0 12px;font-size:14px;color:${DARK_NAVY};text-transform:uppercase;letter-spacing:0.08em;font-weight:800;">
                  📋 Your Verified Event Details
                </h3>
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;background:#ffffff;">
                  <tr>
                    <td style="padding:12px 18px;background:#f8fafc;border-bottom:1px solid #e2e8f0;width:40%;font-size:13px;color:${MUTED};font-weight:700;">Event Name</td>
                    <td style="padding:12px 18px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:13.5px;font-weight:800;color:${DARK_NAVY};">${eventTitle}</td>
                  </tr>
                  <tr>
                    <td style="padding:14px 18px;border-bottom:1px solid #e2e8f0;font-size:13px;color:${MUTED};font-weight:700;">Official Event Dates</td>
                    <td style="padding:14px 18px;border-bottom:1px solid #e2e8f0;font-size:14.5px;font-weight:900;color:${EMERALD};">
                      ${eventDates} <span style="display:inline-block;background:#ecfdf5;color:#047857;font-size:11px;font-weight:800;padding:2px 8px;border-radius:20px;margin-left:6px;border:1px solid #a7f3d0;">Verified Dates ✅</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 18px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:13px;color:${MUTED};font-weight:700;">Proof Submission Window</td>
                    <td style="padding:12px 18px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:13.5px;font-weight:700;color:#0f172a;">${proofWindow} (via Athlete Dashboard)</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 18px;border-bottom:1px solid #e2e8f0;font-size:13px;color:${MUTED};font-weight:700;">Registered Distance</td>
                    <td style="padding:12px 18px;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:800;color:#0284c7;">${payload.distance}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 18px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:13px;color:${MUTED};font-weight:700;">Activity Allowed</td>
                    <td style="padding:12px 18px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:13.5px;font-weight:700;color:#334155;">${activity}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 18px;border-bottom:1px solid #e2e8f0;font-size:13px;color:${MUTED};font-weight:700;">Bib Number</td>
                    <td style="padding:12px 18px;border-bottom:1px solid #e2e8f0;font-size:15px;font-weight:900;color:#0f172a;letter-spacing:0.04em;font-family:monospace;">${payload.bibNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 18px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:13px;color:${MUTED};font-weight:700;">Payment Status</td>
                    <td style="padding:12px 18px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:13.5px;font-weight:800;color:${EMERALD};">Confirmed &amp; Received ✅</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 18px;border-bottom:1px solid #e2e8f0;font-size:13px;color:${MUTED};font-weight:700;">Order ID</td>
                    <td style="padding:12px 18px;border-bottom:1px solid #e2e8f0;font-size:13px;font-family:monospace;color:#475569;font-weight:700;">${orderId}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 18px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:13px;color:${MUTED};font-weight:700;">Amount Paid</td>
                    <td style="padding:12px 18px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:13.5px;font-weight:800;color:#0f172a;">${formatRupees(payload.amountInPaise)}</td>
                  </tr>
                  ${payload.shippingAddress ? `
                  <tr>
                    <td style="padding:12px 18px;border-bottom:1px solid #e2e8f0;font-size:13px;color:${MUTED};font-weight:700;">Delivery Address</td>
                    <td style="padding:12px 18px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#334155;line-height:1.5;">${payload.shippingAddress}</td>
                  </tr>` : ""}
                  ${payload.shippingPhone ? `
                  <tr>
                    <td style="padding:12px 18px;background:#f8fafc;font-size:13px;color:${MUTED};font-weight:700;">Contact Phone</td>
                    <td style="padding:12px 18px;background:#f8fafc;font-size:13px;color:#334155;font-weight:700;">${payload.shippingPhone}</td>
                  </tr>` : ""}
                </table>
              </div>

              <!-- 🏃 Step-by-Step Instructions -->
              <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
                <h3 style="margin:0 0 14px;font-size:14px;color:${DARK_NAVY};text-transform:uppercase;letter-spacing:0.08em;font-weight:800;">
                  🏃 How to Complete Your Challenge:
                </h3>
                <ol style="margin:0;padding-left:20px;font-size:13.5px;color:#334155;line-height:1.75;">
                  <li style="margin-bottom:8px;"><strong>Activity Dates:</strong> Complete your registered distance (${payload.distance}) anytime between <strong>7 November and 15 November 2026</strong>.</li>
                  <li style="margin-bottom:8px;"><strong>Location:</strong> Run, walk, or cycle anywhere in India — outdoors, roads, parks, or treadmill.</li>
                  <li style="margin-bottom:8px;"><strong>Tracking Apps:</strong> Track your activity using Strava, Garmin, Nike Run Club, Apple Fitness, Samsung Health, or any fitness app.</li>
                  <li style="margin-bottom:0;"><strong>Submit Proof:</strong> Upload a screenshot of your completed activity on your RunnerUp.in Athlete Dashboard anytime between <strong>7 Nov and 15 Nov 2026</strong>.</li>
                </ol>
              </div>

              <!-- 🎁 Finisher Reward Package -->
              <div style="background:#fffcf0;border:1px solid #e8dbb0;border-left:4px solid #f59e0b;padding:18px 22px;border-radius:0 12px 12px 0;margin-bottom:28px;">
                <p style="margin:0 0 6px;font-size:14px;font-weight:800;color:#78540b;">
                  🎁 Your Official Finisher Reward Package
                </p>
                <p style="margin:0;font-size:13px;color:#634a17;line-height:1.6;">
                  Once the challenge concludes (15 Nov) and your activity proof is approved, your authentic <strong>Heavyweight Die-Cast 3D Metal Medal</strong> with premium commemorative ribbon lanyard will be dispatched directly to your doorstep with <strong>100% free pan-India courier delivery</strong>.
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align:center;margin-bottom:28px;">
                <a href="${eventUrl}" style="display:inline-block;background:linear-gradient(135deg,#ff5722,#e64a19);color:#ffffff;text-decoration:none;font-weight:800;font-size:14px;padding:14px 34px;border-radius:50px;box-shadow:0 6px 18px rgba(255,87,34,0.35);">
                  👉 View Event Details &amp; Athlete Dashboard
                </a>
              </div>

              <!-- Support / Signoff -->
              <div style="border-top:1px dashed #cbd5e1;padding-top:20px;text-align:center;">
                <p style="margin:0 0 10px;font-size:13.5px;color:#475569;line-height:1.6;">
                  Thank you for standing with us to spread courage, hope, and cancer awareness across India. 🎗️
                </p>
                <p style="margin:12px 0 0;font-size:13px;font-weight:700;color:#1e293b;">
                  Warm regards,<br/>
                  <strong style="color:${DARK_NAVY};font-size:14px;">Team RunnerUp 🎗️</strong><br/>
                  <a href="https://www.runnerup.in" style="color:#d97706;text-decoration:none;">www.runnerup.in</a>
                </p>
                <p style="margin:10px 0 0;font-size:12px;color:#64748b;">
                  Need assistance? Write to us directly at <a href="mailto:runnerupofficials@gmail.com" style="color:#ea580c;font-weight:700;text-decoration:none;">runnerupofficials@gmail.com</a> or WhatsApp: <strong>+91 94796 64858</strong>
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

export async function sendCancerCorrectionEmail(
  payload: CancerCorrectionEmailPayload,
): Promise<EmailSendResult> {
  if (!resend) {
    logger.warn("[email] RESEND_API_KEY is not set. Skipping cancer correction email", { to: payload.to });
    return { sent: false, error: "RESEND_API_KEY is not configured" };
  }

  try {
    const from = env.resendFromEmail;
    const subject = `Important Event Update: National Cancer Awareness Day Challenge (Dates: 7–15 Nov) — Bib ${payload.bibNumber} 🎗️`;

    const result = await resend.emails.send({
      from,
      to: payload.to,
      replyTo: "runnerupofficials@gmail.com",
      subject,
      html: buildCancerCorrectionEmailHtml(payload),
    });

    if (result.error) {
      logger.error("[email] Resend error sending cancer correction email", result.error, { from, to: payload.to });
      return { sent: false, error: `${result.error.message} (from: ${from})` };
    }

    logger.info("[email] Cancer correction email sent successfully", {
      emailId: result.data?.id,
      to: payload.to,
      bibNumber: payload.bibNumber,
    });
    return { sent: true, id: result.data?.id };
  } catch (error) {
    logger.error("[email] Failed to send cancer correction email", error, { to: payload.to });
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
