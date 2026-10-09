import "dotenv/config";
import { logger } from "../utils/logger.js";

function readEnv(name: string, fallback = "") {
  return (process.env[name] ?? fallback).trim();
}

/** True when a real Clerk secret is set (not empty / placeholder). */
export function isClerkConfigured(secretKey = readEnv("CLERK_SECRET_KEY")) {
  if (!secretKey) {
    return false;
  }

  const lower = secretKey.toLowerCase();
  if (
    lower.includes("your_") ||
    lower.includes("placeholder") ||
    lower.endsWith("...") ||
    lower === "sk_test_..." ||
    lower === "sk_live_..."
  ) {
    return false;
  }

  return secretKey.startsWith("sk_");
}

function parseEmailList(raw: string) {
  return raw
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
}

function parseOriginList(raw: string) {
  return raw
    .split(",")
    .map((part) => part.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

const configuredFrontendOrigins = parseOriginList(
  readEnv("FRONTEND_URL", "https://runnerup.in"),
);

/** Browser origins allowed for CORS + Clerk token verification. */
const allowedOrigins = Array.from(
  new Set([
    ...configuredFrontendOrigins,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:49154",
    "https://runnerup.in",
    "https://www.runnerup.in",
  ]),
);

/**
 * Resend requires: `email@example.com` or `Name <email@example.com>`.
 * Broken env values (unquoted spaces, stripped <email>, extra quotes) are normalized.
 */
function normalizeResendFrom(raw: string | undefined): string {
  const fallback = "Runner Up <onboarding@resend.dev>";
  if (!raw) return fallback;

  let value = raw.trim();
  // Strip wrapping single/double quotes from env files
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }

  // Already valid: Name <email@domain>
  if (/^[^<>\n]+<[^\s<>]+@[^\s<>]+\.[^\s<>]+>$/.test(value)) {
    return value;
  }

  // Bare email
  if (/^[^\s<>]+@[^\s<>]+\.[^\s<>]+$/.test(value)) {
    return `Mountain Run <${value}>`;
  }

  // Recover email if present anywhere in the string
  const emailMatch = value.match(/[^\s<>]+@[^\s<>]+\.[^\s<>]+/);
  if (emailMatch) {
    const email = emailMatch[0];
    const name = value
      .replace(/<[^>]*>/g, " ")
      .replace(email, " ")
      .replace(/\s+/g, " ")
      .trim();
    return name ? `${name} <${email}>` : `Mountain Run <${email}>`;
  }

  logger.warn(
    `[env] RESEND_FROM_EMAIL is invalid ("${raw}"). Expected "Name <email@domain.com>" or "email@domain.com". Using fallback.`,
  );
  return fallback;
}

function parseCloudinaryConfig() {
  const directName = readEnv("CLOUDINARY_CLOUD_NAME");
  const directKey = readEnv("CLOUDINARY_API_KEY");
  const directSecret = readEnv("CLOUDINARY_API_SECRET");
  if (directName && directKey && directSecret) {
    return { cloudName: directName, apiKey: directKey, apiSecret: directSecret };
  }
  const cloudinaryUrl = readEnv("CLOUDINARY_URL");
  if (cloudinaryUrl && cloudinaryUrl.startsWith("cloudinary://")) {
    try {
      const parsed = new URL(cloudinaryUrl);
      return {
        cloudName: parsed.hostname,
        apiKey: parsed.username,
        apiSecret: parsed.password,
      };
    } catch {}
  }
  return {
    cloudName: directName,
    apiKey: directKey,
    apiSecret: directSecret,
  };
}

const cloudinaryConfig = parseCloudinaryConfig();

export const env = {
  port: Number(process.env.PORT ?? 4000),
  frontendUrl: configuredFrontendOrigins[0] ?? "https://runnerup.in",
  allowedOrigins,
  nodeEnv: process.env.NODE_ENV ?? "development",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID ?? "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET ?? "",
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? "",
  resendApiKey: readEnv("RESEND_API_KEY"),
  resendFromEmail: normalizeResendFrom(process.env.RESEND_FROM_EMAIL),
  cloudinaryCloudName: cloudinaryConfig.cloudName,
  cloudinaryApiKey: cloudinaryConfig.apiKey,
  cloudinaryApiSecret: cloudinaryConfig.apiSecret,
  /** When true, proof approve auto-generates + emails certificate. */
  certificateAutoSend:
    readEnv("CERTIFICATE_AUTO_SEND", "true").toLowerCase() !== "false",
  clerkSecretKey: readEnv("CLERK_SECRET_KEY"),
  clerkPublishableKey: readEnv("CLERK_PUBLISHABLE_KEY"),
  /** Comma-separated emails that always get admin (e.g. you@gmail.com) */
  adminEmails: parseEmailList(readEnv("ADMIN_EMAILS")),
  /**
   * When true (default in development), the first signed-in user who hits
   * an admin route becomes SUPER_ADMIN if no admin exists yet.
   */
  adminBootstrap:
    readEnv("ADMIN_BOOTSTRAP", process.env.NODE_ENV === "production" ? "false" : "true")
      .toLowerCase() === "true",
  get clerkEnabled() {
    return isClerkConfigured(this.clerkSecretKey);
  },
};
