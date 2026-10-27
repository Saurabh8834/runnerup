const isDev = process.env.NODE_ENV !== "production";
const configuredApiUrl = (process.env.NEXT_PUBLIC_API_URL || process.env.INTERNAL_API_URL || "").trim().replace(/\/+$/, "");

export const CLOUD_BACKEND_URL = "https://api.runnerup.in";
export const RAILWAY_FALLBACK_URL = "https://runnerup-production.up.railway.app";

// Production canonical API connects directly to the live production API (api.runnerup.in)
export const CANONICAL_BACKEND_URL = isDev
  ? "http://127.0.0.1:4000"
  : configuredApiUrl &&
      !configuredApiUrl.includes("127.0.0.1") &&
      !configuredApiUrl.includes("localhost") &&
      !configuredApiUrl.includes("railway.app")
    ? configuredApiUrl
    : CLOUD_BACKEND_URL;

let dynamicBackendUrl: string | null = null;

export function getActiveBackendUrl(): string {
  if (dynamicBackendUrl) return dynamicBackendUrl;
  return CANONICAL_BACKEND_URL;
}

export function setActiveBackendUrl(url: string) {
  dynamicBackendUrl = url.replace(/\/+$/, "");
}

export function getApiUrl(path = "") {
  const isServer = typeof window === "undefined";
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  const baseUrl = getActiveBackendUrl();

  if (isServer) {
    return `${baseUrl}${cleanPath}`;
  }

  // In local development, use relative path so Next.js proxies to local backend
  if (isDev) {
    return cleanPath;
  }

  // In production browser:
  if (typeof window !== "undefined") {
    // If the browser is on apex runnerup.in, explicitly target www.runnerup.in
    // to eliminate Vercel's 308 Permanent Redirect (which strips auth headers and drops CORS on mobile)
    if (window.location.hostname === "runnerup.in") {
      return `https://www.runnerup.in${cleanPath}`;
    }
    // If on www.runnerup.in, relative path is same-origin
    if (window.location.hostname === "www.runnerup.in") {
      return cleanPath;
    }
  }

  // In external or preview environments, communicate directly with the live HTTPS backend
  return `${baseUrl}${cleanPath}`;
}

export async function resilientFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  const primaryUrl = getApiUrl(cleanPath);

  const isBrowser = typeof window !== "undefined";
  const isProduction = !isDev && isBrowser && window.location.hostname.includes("runnerup.in");

  // Multi-tier redundancy:
  // 1) Primary (same-origin / configured)
  // 2) Canonical Vercel Proxy (https://www.runnerup.in/api/...)
  // 3) Cloudflare Tunnel (https://api.runnerup.in/api/...)
  // 4) Railway 24/7 Backup (https://runnerup-production.up.railway.app/api/...)
  const candidates: string[] = [primaryUrl];
  if (isProduction) {
    const list = [
      `https://www.runnerup.in${cleanPath}`,
      `${CLOUD_BACKEND_URL}${cleanPath}`,
      `${RAILWAY_FALLBACK_URL}${cleanPath}`,
    ];
    for (const url of list) {
      if (!candidates.includes(url)) {
        candidates.push(url);
      }
    }
  }

  let lastError: unknown = null;
  let lastResponse: Response | null = null;

  for (let i = 0; i < candidates.length; i++) {
    const candidateUrl = candidates[i];
    try {
      // 10s timeout per candidate to prevent mobile hanging
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(candidateUrl, {
        ...init,
        signal: controller.signal,
      });
      clearTimeout(timer);

      // Success or valid client response (200 - 499)
      if (res.ok || (res.status >= 200 && res.status < 500)) {
        return res;
      }

      // 5xx error (500, 502, 503, 504, 521, 530) -> record and try next candidate
      lastResponse = res;
    } catch (err) {
      lastError = err;
      // Continue to next candidate
    }
  }

  if (lastResponse) {
    return lastResponse;
  }

  throw lastError instanceof Error ? lastError : new Error("Failed to fetch");
}

export function authHeaders(token: string | null | undefined, init: HeadersInit = {}): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(token ? { "x-admin-emergency-token": token } : {}),
    ...init,
  };
}

export async function readApiError(response: Response, fallback: string) {
  if (response.status === 521 || response.status === 522 || response.status === 530 || response.status === 502 || response.status === 504) {
    return "Server is momentarily reconnecting. Please wait a moment and try again.";
  }
  const error = await response.json().catch(() => null);
  const msg = (error?.error?.message as string | undefined) ?? fallback;
  if (msg === "Failed to fetch") {
    return "Could not connect to server. Please check your internet connection or try again.";
  }
  return msg;
}
