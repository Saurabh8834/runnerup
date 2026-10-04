import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";

type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  bytes: number;
  format: string;
};

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
  secure: true,
});

export function isCloudinaryConfigured() {
  return Boolean(env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret);
}

/**
 * Upload a data URL or remote image URL to Cloudinary (signed upload).
 * Used for GPS proof screenshots so we don't store huge base64 blobs in Postgres.
 */
export async function uploadImageToCloudinary(
  file: string,
  folder = "runnerup/proofs",
): Promise<CloudinaryUploadResult> {
  if (!isCloudinaryConfigured()) {
    throw new ApiError(503, "Image upload is not configured (Cloudinary)");
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      file,
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          reject(new ApiError(502, `Image upload failed: ${error.message}`));
          return;
        }
        if (!result) {
          reject(new ApiError(502, "Image upload failed - no result returned"));
          return;
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          bytes: result.bytes || 0,
          format: result.format || "",
        });
      }
    );
  });
}

/**
 * Delete an image from Cloudinary by public ID.
 */
export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  if (!isCloudinaryConfigured()) {
    throw new ApiError(503, "Image deletion is not configured (Cloudinary)");
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(new ApiError(502, `Image deletion failed: ${error.message}`));
        return;
      }
      resolve();
    });
  });
}
