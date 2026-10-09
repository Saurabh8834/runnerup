// @ts-nocheck
import "dotenv/config";
import { Resend } from "resend";

async function run() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Runner Up <onboarding@resend.dev>";
  const toEmail = process.argv[2] || process.env.ADMIN_EMAILS?.split(",")[0] || "sourav06556@gmail.com";

  console.log("==================================================");
  console.log("         RUNNER UP - RESEND TEST SCRIPT");
  console.log("==================================================");
  console.log(`From:    ${fromEmail}`);
  console.log(`To:      ${toEmail}`);
  console.log(`API Key: ${apiKey ? apiKey.slice(0, 7) + "..." + apiKey.slice(-4) : "(NOT SET)"}`);
  console.log("--------------------------------------------------");

  if (!apiKey || apiKey.trim() === "") {
    console.error("❌ ERROR: RESEND_API_KEY is missing in backend/.env!");
    console.error("Please add your key from https://resend.com/api-keys to backend/.env:");
    console.error('RESEND_API_KEY="re_xxxxxxxxxxxx"');
    process.exit(1);
  }

  const resend = new Resend(apiKey.trim());

  try {
    console.log("Sending test email via Resend API...");
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: "🏃 Runner Up — Resend Integration Test Successful!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="font-size: 28px;">🏃</span>
            <h1 style="color: #1a3a2e; margin: 8px 0 4px; font-size: 22px;">Resend Connected Successfully!</h1>
            <p style="color: #c9a227; font-weight: bold; letter-spacing: 1px; font-size: 12px; text-transform: uppercase;">Runner Up Platform</p>
          </div>
          <p style="color: #4a5568; font-size: 15px; line-height: 1.6;">
            This email confirms that your <strong>Resend API Key</strong> is valid and active on <strong>runnerup.in</strong>.
          </p>
          <div style="background: #f7fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
            <p style="margin: 0; font-size: 13px; color: #2d3748;">
              <strong>Timestamp:</strong> ${new Date().toISOString()}<br/>
              <strong>Sender:</strong> ${fromEmail}<br/>
              <strong>Recipient:</strong> ${toEmail}
            </p>
          </div>
          <p style="color: #718096; font-size: 12px; text-align: center; margin-top: 24px;">
            © ${new Date().getFullYear()} Runner Up · runnerup.in
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("\n❌ RESEND ERROR:", error.name, "-", error.message);
      if (error.message?.includes("domain") || error.message?.includes("verify")) {
        console.error("\n💡 NOTE: With 'onboarding@resend.dev', Resend only allows sending to the email registered on your Resend account (e.g. sourav06556@gmail.com).");
        console.error("To send to all participants, verify your domain 'runnerup.in' at https://resend.com/domains");
      }
      process.exit(1);
    }

    console.log("\n✅ SUCCESS! Email sent successfully!");
    console.log(`Email ID: ${data?.id}`);
    console.log(`Check inbox at: ${toEmail}`);
  } catch (err: any) {
    console.error("\n❌ EXCEPTION:", err.message);
    process.exit(1);
  }
}

run();
