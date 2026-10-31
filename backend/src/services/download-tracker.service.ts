import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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
    fs.mkdirSync(DATA_DIR, { recursive: true });
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
  // Downloads are currently locked by admin instruction
  return;
}

export function getDownloadStats(): {
  certificateCount: number;
  bibCount: number;
  certificateMap: Record<string, boolean>;
  bibMap: Record<string, boolean>;
} {
  return {
    certificateCount: 0,
    bibCount: 0,
    certificateMap: {},
    bibMap: {},
  };
}
