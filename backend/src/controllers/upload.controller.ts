import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/clerk-auth.js";
import { processAndStoreImage } from "../services/storage.service.js";
import { isCloudinaryConfigured } from "../services/cloudinary.service.js";
import { ApiError } from "../utils/api-error.js";
import { logger } from "../utils/logger.js";
import { validateBody } from "../utils/validate.js";
import { z } from "zod";

const uploadImageSchema = z.object({
  /** data:image/...;base64,... or https URL */
  file: z.string().min(20, "Image data is required"),
  folder: z.string().max(80).optional(),
});

const MAX_DATA_URL_CHARS = 20_000_000; // ~15MB payload

export async function uploadProofImage(request: AuthenticatedRequest, response: Response) {
  const payload = validateBody(uploadImageSchema, request);

  if (payload.file.startsWith("data:") && payload.file.length > MAX_DATA_URL_CHARS) {
    throw new ApiError(413, "Image is too large. Use a photo or screenshot under 15 MB.");
  }

  if (!payload.file.startsWith("data:") && !payload.file.startsWith("https://") && !payload.file.startsWith("http://")) {
    throw new ApiError(400, "Provide a data URL or valid image URL");
  }

  try {
    const subfolder = payload.folder ? payload.folder.replace(/^runnerup\/?/, "") || "proofs" : "proofs";
    const result = await processAndStoreImage(payload.file, subfolder);

    response.status(201).json({
      data: {
        url: result.url,
        provider: result.provider,
        bytes: result.bytes,
      },
    });
  } catch (err) {
    logger.error("[Upload] Failed to process and store image", err);
    throw new ApiError(500, "Could not process image upload. Please try again.");
  }
}

export async function uploadConfig(_request: AuthenticatedRequest, response: Response) {
  response.json({
    data: {
      storage: "local-cloudflare-cdn",
      cloudinary: isCloudinaryConfigured(),
      maxDataUrlChars: MAX_DATA_URL_CHARS,
      accepted: ["image/jpeg", "image/png", "image/webp", "image/heic"],
    },
  });
}
