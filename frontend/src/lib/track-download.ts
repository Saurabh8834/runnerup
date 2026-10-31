import { getApiUrl } from "./api";

/**
 * Send real-time download telemetry to the backend.
 * Uses navigator.sendBeacon where available for guaranteed zero-drop delivery.
 */
export function sendDownloadTelemetry(type: "CERTIFICATE" | "BIB", identifier: string) {
  if (!identifier) return;
  try {
    const url = getApiUrl("/api/track/download");
    const payload = JSON.stringify({ type, identifier: String(identifier).trim() });

    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon(url, blob);
    } else {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {}
}
