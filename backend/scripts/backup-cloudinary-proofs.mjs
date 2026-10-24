import fs from "fs";
import path from "path";
import { prisma } from "../dist/lib/prisma.js";

async function backup() {
  const uploadsDir = path.join(process.cwd(), "uploads", "proofs");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const proofs = await prisma.proofUpload.findMany({ select: { id: true, activityImageUrl: true } });
  console.log(`Found ${proofs.length} total proofs to inspect/backup`);

  let backedUp = 0;
  let updated = 0;

  for (const proof of proofs) {
    if (proof.activityImageUrl && proof.activityImageUrl.includes("res.cloudinary.com")) {
      try {
        const res = await fetch(proof.activityImageUrl);
        if (res.ok) {
          const buffer = Buffer.from(await res.arrayBuffer());
          const ext = proof.activityImageUrl.endsWith(".png") ? "png" : "jpg";
          const filename = `${proof.id}.${ext}`;
          const filepath = path.join(uploadsDir, filename);
          fs.writeFileSync(filepath, buffer);
          backedUp++;

          // Update DB to use safe local/tunnel URL so Cloudinary deactivation never breaks images!
          const newUrl = `https://api.runnerup.in/uploads/proofs/${filename}`;
          await prisma.proofUpload.update({
            where: { id: proof.id },
            data: { activityImageUrl: newUrl },
          });
          updated++;
        } else {
          console.warn(`Could not download ${proof.id}: HTTP ${res.status}`);
        }
      } catch (err) {
        console.error(`Failed to download proof ${proof.id}:`, err);
      }
    }
  }

  console.log(`Backup complete: ${backedUp} downloaded locally, ${updated} DB records updated to https://api.runnerup.in/uploads/proofs/...`);
  await prisma.$disconnect();
}

backup().catch((err) => {
  console.error("Backup script failed:", err);
  process.exit(1);
});
