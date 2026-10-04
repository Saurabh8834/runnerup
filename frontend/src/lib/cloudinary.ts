import { getApiUrl } from "./api";

export interface UploadResult {
  url: string;
  provider: string;
  bytes?: number;
  warning?: string;
}

export interface UploadConfig {
  cloudinary: boolean;
  maxDataUrlChars: number;
  accepted: string[];
}

/**
 * Upload an image to Cloudinary via backend API
 * @param file - Data URL (data:image/...;base64,...) or HTTPS URL
 * @param folder - Optional folder name for organization
 */
export async function uploadImage(
  file: string,
  folder?: string
): Promise<UploadResult> {
  const response = await fetch(getApiUrl("/api/uploads/image"), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ file, folder }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload failed');
  }

  return response.json();
}

/**
 * Get upload configuration from backend
 */
export async function getUploadConfig(): Promise<UploadConfig> {
  const response = await fetch(getApiUrl("/api/uploads/config"), {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to get upload config');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Convert file to data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

  if (!acceptedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPEG, PNG, WebP, and HEIC images are allowed',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image size must be less than 5MB',
    };
  }

  return { valid: true };
}
