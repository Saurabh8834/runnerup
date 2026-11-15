import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CANDIDATE_PATHS = [
  path.resolve(__dirname, "../data/legacy-iaf-bib-map.json"),
  path.resolve(__dirname, "../../src/data/legacy-iaf-bib-map.json"),
  path.resolve(__dirname, "../../data/legacy-iaf-bib-map.json"),
  path.resolve(process.cwd(), "src/data/legacy-iaf-bib-map.json"),
  path.resolve(process.cwd(), "dist/data/legacy-iaf-bib-map.json"),
];

export interface LegacyBibEntry {
  currentBib: string;
  registrationId: string;
  name: string;
  distance: string;
  certNumber: string;
}

let legacyMap: Record<string, LegacyBibEntry> | null = null;

function loadLegacyMap(): Record<string, LegacyBibEntry> {
  if (legacyMap) return legacyMap;
  try {
    for (const p of CANDIDATE_PATHS) {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, "utf-8");
        legacyMap = JSON.parse(raw);
        break;
      }
    }
    if (!legacyMap) {
      legacyMap = {};
    }
  } catch (err) {
    console.error("Failed to load legacy IAF bib map:", err);
    legacyMap = {};
  }
  return legacyMap!;
}

/**
 * Resolves any legacy IAF bib, certificate string, or related identifier
 * (e.g. "CERT-IAF26-IAFD495096", "IAFD-495096", "495096", "IAFD495096", "7839427810")
 * to the verified current registration in the database.
 */
export function resolveLegacyBib(rawQuery: string): LegacyBibEntry | null {
  if (!rawQuery) return null;

  const trimmed = rawQuery.trim();
  const upper = trimmed.toUpperCase();

  // Strict isolation: Never resolve legacy IAF records for Kinetic Run or Cancer Awareness queries
  if (
    upper.includes("KRUN") ||
    upper.includes("KINETIC") ||
    upper.includes("KRVC") ||
    upper.includes("NCAD") ||
    upper.includes("CANCER")
  ) {
    return null;
  }

  const map = loadLegacyMap();

  // Direct lookup
  if (map[trimmed]) return map[trimmed];
  if (map[upper]) return map[upper];

  // Specific alias for Abhay Sachan (registered phone / WhatsApp 7839427810)
  if (trimmed.includes("7839427810") || upper.includes("495096")) {
    const abhay = map["IAFD-495096"] || map["495096"];
    if (abhay) return abhay;
  }

  // Strip known prefixes
  const stripped = upper
    .replace(/^CERT-IAF26-/i, "")
    .replace(/^CERT-IAF-/i, "")
    .replace(/^CERT-NCAD-/i, "")
    .replace(/^CERT-KRUN-/i, "")
    .replace(/^RU-\d+-/i, "")
    .trim();

  if (map[stripped]) return map[stripped];

  // Pure digits lookup (e.g. "495096" from "IAFD495096" or "CERT-IAF26-IAFD495096")
  const digits = stripped.replace(/\D/g, "");
  if (digits && map[digits]) return map[digits];

  if (digits && map[`IAFD-${digits}`]) return map[`IAFD-${digits}`];
  if (digits && map[`IAFD${digits}`]) return map[`IAFD${digits}`];

  // Also check if stripped begins with IAFD
  if (stripped.startsWith("IAFD") && !stripped.includes("-")) {
    const formatted = `IAFD-${stripped.slice(4)}`;
    if (map[formatted]) return map[formatted];
  }

  return null;
}
