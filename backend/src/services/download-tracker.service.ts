import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { prisma } from "../lib/prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../../data");
const FILE_PATH = path.join(DATA_DIR, "download-tracker.json");

interface DownloadTrackerData {
  certificateDownloads: string[];
  bibDownloads: string[];
  lastUpdated: string;
}

const certSet = new Set<string>();
const bibSet = new Set<string>();
let saveTimer: NodeJS.Timeout | null = null;
let initialized = false;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {}
  }
}

function initTracker() {
  if (initialized) return;
  initialized = true;
  ensureDataDir();

  try {
    if (fs.existsSync(FILE_PATH)) {
      const raw = fs.readFileSync(FILE_PATH, "utf-8");
      const data: DownloadTrackerData = JSON.parse(raw);
      if (Array.isArray(data.certificateDownloads)) {
        for (const id of data.certificateDownloads) certSet.add(id);
      }
      if (Array.isArray(data.bibDownloads)) {
        for (const id of data.bibDownloads) bibSet.add(id);
      }
    }
  } catch (err) {
    console.error("[DownloadTracker] Failed to read download stats file:", err);
  }

  // Hydrate asynchronously from DB audit log for persistent cloud deployment
  prisma.adminAuditLog.findMany({
    where: {
      action: { in: ["download.certificate", "download.bib"] },
    },
    select: { action: true, entityId: true },
    take: 2000,
  }).then((logs) => {
    for (const log of logs) {
      if (!log.entityId) continue;
      if (log.action === "download.certificate") {
        certSet.add(log.entityId);
        const d = log.entityId.replace(/\D/g, "");
        if (d) certSet.add(d);
      } else if (log.action === "download.bib") {
        bibSet.add(log.entityId);
        const d = log.entityId.replace(/\D/g, "");
        if (d) bibSet.add(d);
      }
    }
  }).catch(() => {});
}

function scheduleSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      ensureDataDir();
      const payload: DownloadTrackerData = {
        certificateDownloads: Array.from(certSet),
        bibDownloads: Array.from(bibSet),
        lastUpdated: new Date().toISOString(),
      };
      fs.writeFileSync(FILE_PATH, JSON.stringify(payload, null, 2), "utf-8");
    } catch (err) {
      console.error("[DownloadTracker] Failed to persist download stats:", err);
    }
  }, 1000);
}

export function recordDownload(type: "CERTIFICATE" | "BIB", identifier: string): void {
  if (!identifier) return;
  initTracker();

  const clean = String(identifier).trim();
  const cleanDigits = clean.replace(/\D/g, "");

  if (type === "CERTIFICATE") {
    certSet.add(clean);
    if (cleanDigits) certSet.add(cleanDigits);
    if (clean.startsWith("CERT-IAF26-")) certSet.add(clean.replace("CERT-IAF26-", ""));
  } else {
    bibSet.add(clean);
    if (cleanDigits) bibSet.add(cleanDigits);
  }

  scheduleSave();

  // Async durable audit log in database
  prisma.adminAuditLog.create({
    data: {
      action: type === "CERTIFICATE" ? "download.certificate" : "download.bib",
      entityType: type,
      entityId: clean,
      summary: `Downloaded ${type} ${clean}`,
    },
  }).catch(() => {});
}

export function getDownloadStats(): {
  certificateCount: number;
  bibCount: number;
  certificateMap: Record<string, boolean>;
  bibMap: Record<string, boolean>;
} {
  initTracker();

  const certificateMap: Record<string, boolean> = {};
  for (const id of certSet) {
    certificateMap[id] = true;
  }

  const bibMap: Record<string, boolean> = {};
  for (const id of bibSet) {
    bibMap[id] = true;
  }

  // Count unique 4-digit bibs / cert numbers
  const uniqueCerts = new Set<string>();
  for (const id of certSet) {
    const d = id.replace(/\D/g, "");
    if (d && d.length >= 3) uniqueCerts.add(d);
  }

  const uniqueBibs = new Set<string>();
  for (const id of bibSet) {
    const d = id.replace(/\D/g, "");
    if (d && d.length >= 3) uniqueBibs.add(d);
  }

  return {
    certificateCount: uniqueCerts.size,
    bibCount: uniqueBibs.size,
    certificateMap,
    bibMap,
  };
}
