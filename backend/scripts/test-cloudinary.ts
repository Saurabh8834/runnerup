// @ts-nocheck
import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log("==================================================");
console.log("       RUNNER UP - CLOUDINARY CONFIG CHECK");
console.log("==================================================");

if (!cloudName || !apiKey || !apiSecret) {
  console.log("\n[STATUS: NOT CONFIGURED]");
  console.log("Missing Cloudinary environment variables in backend/.env:");
  console.log("  CLOUDINARY_CLOUD_NAME:", cloudName ? "✓ Present" : "✗ Missing");
  console.log("  CLOUDINARY_API_KEY:   ", apiKey ? "✓ Present" : "✗ Missing");
  console.log("  CLOUDINARY_API_SECRET:", apiSecret ? "✓ Present" : "✗ Missing");
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
console.log("  Cloud Name:", cloudName);
console.log("  API Key:   ", apiKey ? `***${apiKey.slice(-4)}` : "None");
console.log("  API Secret:", apiSecret ? "****** (Set)" : "None");

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

console.log("\nPinging Cloudinary API...");
try {
  const result = await cloudinary.api.ping();
  console.log("\n[SUCCESS] Cloudinary is ACTIVE and working!");
  console.log("  Response:", result);

  const usage = await cloudinary.api.usage();
  console.log("\n[CURRENT USAGE REPORT]");
  console.log("  Credits Total:       ", usage.credits?.usage, "/", usage.credits?.credits, `(${usage.credits?.percent_of_limit?.toFixed(1)}%)`);
  console.log("  Bandwidth (Bytes):   ", usage.bandwidth?.usage, "credits used:", usage.bandwidth?.credits);
  console.log("  Storage (Bytes):     ", usage.storage?.usage, "credits used:", usage.storage?.credits);
  console.log("  Transformations:     ", usage.transformations?.usage, "credits used:", usage.transformations?.credits);
  console.log("  Objects:             ", usage.objects?.usage);
} catch (err: any) {
  console.error("\n[ERROR] Cloudinary call failed:", err.message || err);
  process.exit(1);
}
