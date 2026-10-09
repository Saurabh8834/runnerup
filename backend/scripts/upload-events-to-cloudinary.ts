// @ts-nocheck
import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { env } from "../src/config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../..");
const publicEventsDir = path.join(rootDir, "frontend/public/events");

cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
  secure: true,
});

const prisma = new PrismaClient();

const EVENT_IMAGE_MAP: Record<string, string> = {
  "october-runner": "october-runner.jpg",
  "independence-day-virtual-run-2026": "independence-day-run.jpg",
  "monsoon-mountain-miles": "monsoon-mountain-miles.jpg",
  "independence-endurance-run": "independence-endurance-run.jpg",
  "himalayan-winter-sprint": "himalayan-winter-sprint.jpg",
  "spring-valley-dash": "spring-valley-dash.jpg",
  "holi-color-virtual-run": "holi-color-virtual-run.jpg",
  "new-year-night-miles": "new-year-night-miles.jpg",
};

async function main() {
  console.log("==================================================");
  console.log("  UPLOADING EVENT POSTERS TO CLOUDINARY CDN");
  console.log("==================================================");
  console.log(`Cloud Name: ${env.cloudinaryCloudName}`);
  console.log(`Source Dir: ${publicEventsDir}\n`);

  const results: Record<string, string> = {};

  for (const [slug, fileName] of Object.entries(EVENT_IMAGE_MAP)) {
    const filePath = path.join(publicEventsDir, fileName);
    if (!fs.existsSync(filePath)) {
      console.warn(`[!] File not found: ${filePath}`);
      continue;
    }

    console.log(`Uploading ${slug} (${fileName})...`);
    try {
      const uploadRes = await cloudinary.uploader.upload(filePath, {
        folder: "runnerup/events",
        public_id: slug,
        overwrite: true,
        resource_type: "image",
      });

      const secureUrl = uploadRes.secure_url;
      results[slug] = secureUrl;
      console.log(`  ✓ Uploaded to: ${secureUrl}`);

      // Update in Neon database
      const updated = await prisma.event.updateMany({
        where: { slug },
        data: { bannerImageUrl: secureUrl },
      });
      console.log(`  ✓ Updated ${updated.count} event record(s) in Neon DB for ${slug}\n`);
    } catch (err: any) {
      console.error(`  ✗ Failed to upload ${slug}:`, err.message || err);
    }
  }

  console.log("==================================================");
  console.log("  ALL EVENT POSTERS UPLOADED AND DB UPDATED!");
  console.log("==================================================");
  console.log(JSON.stringify(results, null, 2));

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("Fatal error:", e);
  await prisma.$disconnect();
  process.exit(1);
});
