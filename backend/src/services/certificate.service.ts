import { env } from "../config/env.js";

export type CertificateRenderData = {
  certificateNumber: string;
  runnerName: string;
  eventTitle: string;
  distance: string;
  bibNumber: string;
  finishTimeLabel: string;
  issuedAtLabel: string;
  verifyUrl: string;
};

export function createCertificateNumber(bibNumber: string) {
  const year = new Date().getFullYear();
  return `RU-${year}-${bibNumber.replace(/[^A-Z0-9]/gi, "").toUpperCase()}`;
}

export function createCertificateQrPayload(certificateNumber: string) {
  const verifyUrl = buildCertificatePublicUrl(certificateNumber);
  return JSON.stringify({
    issuer: "Runner Up",
    certificateNumber,
    verifyUrl,
  });
}

export function buildCertificatePublicUrl(certificateNumber: string) {
  const base = env.frontendUrl.replace(/\/$/, "");
  return `${base}/certificates/${encodeURIComponent(certificateNumber)}`;
}

export function formatFinishTime(seconds: number | null | undefined) {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) {
    return "—";
  }
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function toCertificateRenderData(input: {
  certificateNumber: string;
  runnerName: string;
  eventTitle: string;
  distance: string;
  bibNumber: string;
  finishTimeSeconds?: number | null;
  issuedAt?: Date | null;
}): CertificateRenderData {
  const issued = input.issuedAt ?? new Date();
  return {
    certificateNumber: input.certificateNumber,
    runnerName: input.runnerName,
    eventTitle: input.eventTitle,
    distance: input.distance,
    bibNumber: input.bibNumber,
    finishTimeLabel: formatFinishTime(input.finishTimeSeconds),
    issuedAtLabel: issued.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    verifyUrl: buildCertificatePublicUrl(input.certificateNumber),
  };
}

/** HTML email body for certificate delivery — matching reference certificate design with full responsiveness. */
export function buildCertificateEmailHtml(data: CertificateRenderData) {
  const DARK_GREEN = "#1a3a2e";
  const MED_GREEN = "#0d5c45";
  const GOLD = "#c9a227";
  const CREAM = "#fcfaf5";
  const MUTED = "#7a6e5a";
  const BORDER_COLOR = "#d9cdb0";
  const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=0&color=1a3a2e&bgcolor=fcfaf5&data=${encodeURIComponent(data.verifyUrl)}`;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Mountain Run Certificate of Achievement</title>
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Outfit:wght@400;600;700;800;900&display=swap');
    
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; background-color: #ede9df; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .cert-padding { padding: 20px 16px !important; }
      .runner-name { font-size: 32px !important; line-height: 1.2 !important; }
      .stat-col { display: block !important; width: 100% !important; border-right: none !important; border-bottom: 1px solid ${BORDER_COLOR} !important; }
      .stat-col-last { border-bottom: none !important; }
      .sign-col { display: block !important; width: 100% !important; text-align: center !important; margin-bottom: 16px !important; }
      .sign-col-right { text-align: center !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#ede9df;">

  <!-- Preheader -->
  <div style="display:none;font-size:1px;color:#ede9df;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    Official Certificate of Achievement for ${escapeHtml(data.runnerName)} — ${escapeHtml(data.distance)} in ${escapeHtml(data.eventTitle)}. 🏅
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ede9df;padding:24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table class="email-container" width="620" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;width:100%;background-color:${CREAM};border-radius:18px;overflow:hidden;box-shadow:0 12px 36px rgba(26,58,46,0.18);border:2px solid #c9a227;">

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

          <!-- ══════ TOP BADGES & HEADER ══════ -->
          <tr>
            <td class="cert-padding" style="padding:28px 32px 14px;background:${CREAM};">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <!-- Left: Virtual Run Event Badge -->
                  <td width="30%" align="left" valign="top">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background:#1a3a2e;border:2px solid #c9a227;border-radius:50px;padding:6px 14px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.12);">
                          <p style="margin:0;font-size:9px;font-weight:900;letter-spacing:0.15em;text-transform:uppercase;color:#FF9933;line-height:1.2;">★ VIRTUAL</p>
                          <p style="margin:0;font-size:8px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#ffffff;line-height:1.2;">RUN EVENT</p>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Center: Mountain Run Logo -->
                  <td width="40%" align="center" valign="top">
                    <div style="display:inline-block;text-align:center;">
                      <div style="font-size:24px;line-height:1;margin-bottom:4px;">🏔️</div>
                      <p style="margin:0;font-size:16px;font-weight:900;letter-spacing:0.18em;text-transform:uppercase;color:${DARK_GREEN};line-height:1.1;">MOUNTAIN <span style="color:#d97706;">RUN</span></p>
                      <p style="margin:3px 0 0;font-size:8px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:${MUTED};">— RUN ANYWHERE, ANYTIME —</p>
                    </div>
                  </td>

                  <!-- Right: Event Pill + Flag Accent -->
                  <td width="30%" align="right" valign="top">
                    <div style="text-align:right;">
                      <p style="margin:0 0 2px;font-size:8px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:#d97706;">— EVENT —</p>
                      <p style="margin:0;font-size:10px;font-weight:900;letter-spacing:0.05em;text-transform:uppercase;color:${DARK_GREEN};line-height:1.2;">${escapeHtml(data.eventTitle)}</p>
                      <!-- Mini tricolor underline -->
                      <table cellpadding="0" cellspacing="0" border="0" align="right" style="margin-top:4px;">
                        <tr>
                          <td width="16" height="2" style="background:#FF9933;"></td>
                          <td width="16" height="2" style="background:#8a7a5a;"></td>
                          <td width="16" height="2" style="background:#138808;"></td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══════ CERTIFICATE OF ACHIEVEMENT TITLE ══════ -->
          <tr>
            <td style="padding:10px 32px 6px;text-align:center;">
              <h1 style="margin:0;font-size:30px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;color:${DARK_GREEN};font-family:Georgia,serif;">
                CERTIFICATE
              </h1>
              <div style="margin:6px auto 0;display:inline-block;text-align:center;">
                <p style="margin:0;font-size:12px;font-weight:800;letter-spacing:0.3em;text-transform:uppercase;color:#c9a227;">
                  — OF ACHIEVEMENT ★ —
                </p>
              </div>
            </td>
          </tr>

          <!-- ══════ RECIPIENT PRESENTATION ══════ -->
          <tr>
            <td class="cert-padding" style="padding:16px 32px 12px;text-align:center;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:800;letter-spacing:0.25em;text-transform:uppercase;color:${MUTED};">
                THIS CERTIFICATE IS PROUDLY PRESENTED TO
              </p>

              <!-- Participant Name in Cursive Script -->
              <div style="margin:8px auto 12px;display:inline-block;padding:8px 24px;border-top:2px solid #c9a227;border-bottom:2px solid #c9a227;">
                <p class="runner-name" style="margin:0;font-size:42px;font-family:'Dancing Script', 'Brush Script MT', 'Segoe Script', cursive;color:${DARK_GREEN};font-weight:700;line-height:1.2;">
                  ${escapeHtml(data.runnerName)}
                </p>
              </div>

              <!-- Completion Statement -->
              <p style="margin:0;font-size:14px;color:#403a30;line-height:1.6;">
                for successfully completing the <strong style="color:${DARK_GREEN};font-size:16px;font-weight:800;">[ ${escapeHtml(data.distance)} ]</strong> Virtual Run
              </p>
            </td>
          </tr>

          <!-- ══════ 4-COLUMN STATS BOX (MATCHING IMAGE) ══════ -->
          <tr>
            <td class="cert-padding" style="padding:14px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border:1.5px solid ${BORDER_COLOR};border-radius:14px;overflow:hidden;box-shadow:0 3px 12px rgba(0,0,0,0.04);">
                <tr>
                  <!-- 1. Distance -->
                  <td class="stat-col" width="25%" align="center" valign="middle" style="padding:14px 8px;border-right:1px solid ${BORDER_COLOR};">
                    <div style="font-size:18px;margin-bottom:3px;">🛣️</div>
                    <p style="margin:0;font-size:9px;font-weight:900;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};">DISTANCE</p>
                    <p style="margin:4px 0 0;font-size:14px;font-weight:900;color:${DARK_GREEN};">${escapeHtml(data.distance)}</p>
                  </td>

                  <!-- 2. Completion Time -->
                  <td class="stat-col" width="25%" align="center" valign="middle" style="padding:14px 8px;border-right:1px solid ${BORDER_COLOR};">
                    <div style="font-size:18px;margin-bottom:3px;">⏱️</div>
                    <p style="margin:0;font-size:9px;font-weight:900;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};">COMPLETION TIME</p>
                    <p style="margin:4px 0 0;font-size:14px;font-weight:900;color:${DARK_GREEN};">${escapeHtml(data.finishTimeLabel)}</p>
                  </td>

                  <!-- 3. Activity Date -->
                  <td class="stat-col" width="25%" align="center" valign="middle" style="padding:14px 8px;border-right:1px solid ${BORDER_COLOR};">
                    <div style="font-size:18px;margin-bottom:3px;">📅</div>
                    <p style="margin:0;font-size:9px;font-weight:900;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};">ACTIVITY DATE</p>
                    <p style="margin:4px 0 0;font-size:13px;font-weight:800;color:${DARK_GREEN};">${escapeHtml(data.issuedAtLabel)}</p>
                  </td>

                  <!-- 4. Event -->
                  <td class="stat-col stat-col-last" width="25%" align="center" valign="middle" style="padding:14px 8px;">
                    <div style="font-size:18px;margin-bottom:3px;">🏅</div>
                    <p style="margin:0;font-size:9px;font-weight:900;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};">EVENT</p>
                    <p style="margin:4px 0 0;font-size:11px;font-weight:900;color:#c9a227;line-height:1.2;text-transform:uppercase;">${escapeHtml(data.eventTitle)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══════ SIGNATURES & STAMPS ROW (MATCHING IMAGE) ══════ -->
          <tr>
            <td class="cert-padding" style="padding:18px 28px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <!-- Left: Organizer Signature -->
                  <td class="sign-col" width="28%" align="center" valign="bottom">
                    <p style="margin:0;font-family:'Dancing Script', cursive;font-size:20px;color:${DARK_GREEN};font-weight:700;">Runner Up Team</p>
                    <div style="height:1px;background:#c9a227;margin:4px auto;width:120px;"></div>
                    <p style="margin:0;font-size:9px;font-weight:900;letter-spacing:0.15em;text-transform:uppercase;color:${DARK_GREEN};">RUNNER UP TEAM</p>
                    <p style="margin:2px 0 0;font-size:8px;color:${MUTED};text-transform:uppercase;">Organizer · runnerup.in</p>
                  </td>

                  <!-- Center-Left: Official Round Stamp -->
                  <td class="sign-col" width="22%" align="center" valign="middle">
                    <div style="width:68px;height:68px;border-radius:50%;background:#1a3a2e;border:2px dashed #c9a227;display:inline-block;text-align:center;padding-top:10px;">
                      <p style="margin:0;font-size:7px;font-weight:900;letter-spacing:0.15em;text-transform:uppercase;color:#f5f5f0;">RUNNER UP</p>
                      <p style="margin:2px 0;font-size:6px;letter-spacing:0.1em;text-transform:uppercase;color:#c9a227;">RUN ANYWHERE</p>
                      <p style="margin:0;font-size:11px;color:#c9a227;">★★★</p>
                    </div>
                  </td>

                  <!-- Center-Right: QR Code -->
                  <td class="sign-col" width="22%" align="center" valign="middle">
                    <div style="display:inline-block;text-align:center;">
                      <img src="${qrImgUrl}" alt="Certificate QR" width="64" height="64" style="border:1px solid ${BORDER_COLOR};border-radius:6px;display:block;margin:0 auto 4px;" />
                      <p style="margin:0;font-size:8px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:${DARK_GREEN};">VERIFY CERTIFICATE</p>
                      <p style="margin:1px 0 0;font-size:7px;color:${MUTED};">Scan to Verify</p>
                    </div>
                  </td>

                  <!-- Right: Keep Running Signature -->
                  <td class="sign-col sign-col-right" width="28%" align="center" valign="bottom">
                    <p style="margin:0;font-family:'Dancing Script', cursive;font-size:20px;color:${DARK_GREEN};font-weight:700;">Keep Running</p>
                    <div style="height:1px;background:#c9a227;margin:4px auto;width:120px;"></div>
                    <p style="margin:0;font-size:8px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:${DARK_GREEN};">KEEP RUNNING, KEEP INSPIRING!</p>
                    <p style="margin:2px 0 0;font-size:8px;color:${MUTED};">Every Finish Has a Story</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══════ CTA & VERIFY BUTTON ══════ -->
          <tr>
            <td style="padding:16px 32px 20px;text-align:center;background:#f5f1e8;border-top:1px solid ${BORDER_COLOR};">
              <a href="${escapeHtml(data.verifyUrl)}"
                 style="display:inline-block;background:linear-gradient(135deg,${DARK_GREEN},${MED_GREEN});color:#ffffff;text-decoration:none;padding:14px 34px;border-radius:50px;font-size:14px;font-weight:800;letter-spacing:0.08em;border:2px solid ${GOLD};box-shadow:0 4px 14px rgba(26,58,46,0.25);">
                🏆 &nbsp;View &amp; Download E-Certificate
              </a>
              <p style="margin:10px 0 0;font-size:11px;font-family:monospace;color:${MUTED};">
                Certificate No: <strong style="color:${DARK_GREEN};">${escapeHtml(data.certificateNumber)}</strong> · Bib: <strong style="color:${DARK_GREEN};">${escapeHtml(data.bibNumber)}</strong>
              </p>
            </td>
          </tr>

          <!-- ══════ FOOTER LEGAL DISCLAIMER ══════ -->
          <tr>
            <td style="background:${DARK_GREEN};padding:18px 24px;text-align:center;">
              <p style="margin:0 0 6px;font-size:9px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.7);">
                THIS IS AN E-CERTIFICATE AND DOES NOT REQUIRE A PHYSICAL SIGNATURE.
              </p>
              <p style="margin:0;font-size:9px;color:rgba(255,255,255,0.4);line-height:1.5;">
                © ${new Date().getFullYear()} Mountain Run India. All rights reserved.<br/>
                Verify authenticity anytime at <a href="${escapeHtml(data.verifyUrl)}" style="color:#c9a227;text-decoration:none;">${escapeHtml(data.verifyUrl)}</a>
              </p>
            </td>
          </tr>

          <!-- Bottom Tricolor Band -->
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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

