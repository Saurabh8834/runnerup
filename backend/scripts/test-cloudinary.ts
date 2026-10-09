// @ts-nocheck
import { v2 as cloudinary } from "cloudinary";
import { env } from "../src/config/env.js";

console.log("==================================================");
console.log("       RUNNER UP - CLOUDINARY CONFIG CHECK");
console.log("==================================================");

if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
  console.log("\n[STATUS: NOT CONFIGURED]");
  console.log("Missing Cloudinary environment variables in backend/.env:");
  console.log("  CLOUDINARY_CLOUD_NAME:", env.cloudinaryCloudName ? "✓ Present" : "✗ Missing");
  console.log("  CLOUDINARY_API_KEY:   ", env.cloudinaryApiKey ? "✓ Present" : "✗ Missing");
  console.log("  CLOUDINARY_API_SECRET:", env.cloudinaryApiSecret ? "✓ Present" : "✗ Missing");
  console.log("\nYou can configure either:");
  console.log("Option A (Individual keys in backend/.env):");
  console.log('  CLOUDINARY_CLOUD_NAME="your_cloud_name"');
  console.log('  CLOUDINARY_API_KEY="your_api_key"');
  console.log('  CLOUDINARY_API_SECRET="your_api_secret"');
  console.log("\nOption B (Single URL in backend/.env):");
  console.log('  CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"');
  process.exit(1);
}

console.log("\n[CONFIG DETECTED]");
console.log("  Cloud Name:", env.cloudinaryCloudName);
console.log("  API Key:   ", env.cloudinaryApiKey ? `***${env.cloudinaryApiKey.slice(-4)}` : "None");
console.log("  API Secret:", env.cloudinaryApiSecret ? "****** (Set)" : "None");

cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
  secure: true,
});

console.log("\nPinging Cloudinary API...");
try {
  const result = await cloudinary.api.ping();
  console.log("\n[SUCCESS] Cloudinary is ACTIVE and working!");
  console.log("  Response:", result);
  console.log("  GPS Proof uploads, Gallery submissions, and Event Banners will now use Cloudinary CDN!");
} catch (err: any) {
  console.error("\n[ERROR] Cloudinary ping failed:", err.message || err);
  process.exit(1);
}
