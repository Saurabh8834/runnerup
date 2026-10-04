import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/clerk-auth.js";
import { isCloudinaryConfigured, uploadImageToCloudinary } from "../services/cloudinary.service.js";
import { ApiError } from "../utils/api-error.js";
import { validateBody } from "../utils/validate.js";
import { z } from "zod";

const uploadImageSchema = z.object({
  /** data:image/...;base64,... or https URL */
  file: z.string().min(20, "Image data is required"),
  folder: z.string().max(80).optional(),
});

const MAX_DATA_URL_CHARS = 10_000_000; // ~7.5MB payload

export async function uploadProofImage(request: AuthenticatedRequest, response: Response) {
  const payload = validateBody(uploadImageSchema, request);

  if (payload.file.startsWith("data:") && payload.file.length > MAX_DATA_URL_CHARS) {
    throw new ApiError(413, "Image is too large. Use a screenshot under ~1.2 MB or compress it.");
  }

  if (!payload.file.startsWith("data:") && !payload.file.startsWith("https://")) {
    throw new ApiError(400, "Provide a data URL or https image URL");
  }

  // Prefer Cloudinary when configured (scalable CDN storage).
  if (isCloudinaryConfigured()) {
    const uploaded = await uploadImageToCloudinary(
      payload.file,
      payload.folder ?? "runnerup/proofs",
    );
    response.status(201).json({
      data: {
        url: uploaded.secure_url,
        provider: "cloudinary",
        bytes: uploaded.bytes,
      },
    });
    return;
  }

  // Dev fallback: accept remote https URLs as-is; accept data URLs for small demos.
  if (payload.file.startsWith("https://")) {
    response.status(201).json({
      data: {
        url: payload.file,
        provider: "direct-url",
      },
    });
    return;
  }

  if (payload.file.length > 900_000) {
    throw new ApiError(
      503,
      "Cloudinary is not configured. Set CLOUDINARY_* env vars for large proof image uploads, or paste a public image URL.",
    );
  }

  response.status(201).json({
    data: {
      url: payload.file,
      provider: "inline-data-url",
      warning: "Stored as data URL (configure Cloudinary for production).",
    },
  });
}

export async function uploadConfig(_request: AuthenticatedRequest, response: Response) {
  response.json({
    data: {
      cloudinary: isCloudinaryConfigured(),
      maxDataUrlChars: MAX_DATA_URL_CHARS,
      accepted: ["image/jpeg", "image/png", "image/webp", "image/heic"],
    },
  });
}
