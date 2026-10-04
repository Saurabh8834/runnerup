import { cloudinary } from '../config/cloudinary.js';

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export async function uploadImage(
  file: string,
  options?: {
    folder?: string;
    transformation?: string;
    resourceType?: 'image' | 'video' | 'raw' | 'auto';
  }
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      file,
      {
        folder: options?.folder || 'runnerup',
        resource_type: options?.resourceType || 'auto',
        transformation: options?.transformation,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (!result) {
          reject(new Error('Upload failed - no result returned'));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width || 0,
          height: result.height || 0,
          format: result.format || '',
          bytes: result.bytes || 0,
        });
      }
    );
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

export function getImageUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
    crop?: string;
  }
): string {
  const transformation = cloudinary.url(publicId, {
    transformation: [
      {
        width: options?.width,
        height: options?.height,
        quality: options?.quality || 'auto',
        format: options?.format || 'auto',
        crop: options?.crop || 'limit',
      },
    ],
  });

  return transformation;
}
