import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { env } from "../config/env.js";
import { isCloudinaryConfigured, uploadImageToCloudinary } from "./cloudinary.service.js";
import { logger } from "../utils/logger.js";

const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

/**
 * Ensure subfolder under uploads directory exists.
 */
function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Returns the public base URL for static uploads (Cloudflare tunnel canonical).
 */
export function getPublicUploadsBaseUrl(): string {
  if (process.env.API_PUBLIC_URL) {
    return process.env.API_PUBLIC_URL.replace(/\/+$/, "");
  }
  // Cloudflare tunnel forwards https://api.runnerup.in directly to the API
  return "https://api.runnerup.in";
}

export interface StoredImageResult {
  url: string;
  provider: "local-cdn" | "cloudinary" | "direct-url";
  bytes: number;
}

/**
 * Save a data:image/...;base64 URL safely to local disk and return the public URL.
 */
export function saveBase64ImageLocally(dataUrl: string, subfolder = "proofs"): StoredImageResult {
  const match = dataUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid base64 image data URL format");
  }

  const mimeSubtype = match[1].toLowerCase();
  const base64Data = match[2];

  let ext = ".jpg";
  if (mimeSubtype.includes("png")) ext = ".png";
  else if (mimeSubtype.includes("webp")) ext = ".webp";
  else if (mimeSubtype.includes("gif")) ext = ".gif";
  else if (mimeSubtype.includes("svg")) ext = ".svg";

  const targetDir = path.join(UPLOADS_ROOT, subfolder);
  ensureDir(targetDir);

  const randomHash = crypto.randomBytes(6).toString("hex");
  const filename = `${subfolder}-${Date.now()}-${randomHash}${ext}`;
  const targetFile = path.join(targetDir, filename);

  const buffer = Buffer.from(base64Data, "base64");
  fs.writeFileSync(targetFile, buffer);

  const baseUrl = getPublicUploadsBaseUrl();
  const publicUrl = `${baseUrl}/uploads/${subfolder}/${filename}`;

  logger.info(`[Storage] Saved image locally: ${filename} (${buffer.length} bytes) -> ${publicUrl}`);

  return {
    url: publicUrl,
    provider: "local-cdn",
    bytes: buffer.length,
  };
}

/**
 * Process and store an uploaded image safely.
 * Prioritizes local disk + Cloudflare CDN to avoid Cloudinary quota exhaustion and upcoming Oct 31st cutoff.
 */
export async function processAndStoreImage(
  filePayload: string,
  subfolder = "proofs"
): Promise<StoredImageResult> {
  // If already a remote HTTPS URL (e.g., Strava, Garmin, external CDN), return directly
  if (filePayload.startsWith("https://") || filePayload.startsWith("http://")) {
    return {
      url: filePayload,
      provider: "direct-url",
      bytes: 0,
    };
  }

  // If Cloudinary is explicitly forced via env var, try it with safe fallback
  const forceCloudinary = process.env.FORCE_CLOUDINARY_UPLOAD === "true";
  if (forceCloudinary && isCloudinaryConfigured()) {
    try {
      const uploaded = await uploadImageToCloudinary(filePayload, `runnerup/${subfolder}`);
      return {
        url: uploaded.secure_url,
        provider: "cloudinary",
        bytes: uploaded.bytes,
      };
    } catch (err) {
      logger.warn("[Storage] Cloudinary upload failed, falling back to permanent local storage", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // Default & Fallback: High-speed local disk storage with 30-day edge cache
  return saveBase64ImageLocally(filePayload, subfolder);
}
