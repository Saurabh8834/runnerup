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

  // In production browser, communicate directly with the live HTTPS backend
  return `${baseUrl}${cleanPath}`;
}

export async function resilientFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  const primaryUrl = getApiUrl(cleanPath);

  try {
    const res = await fetch(primaryUrl, init);
    // If tunnel down (530) or gateway error (502/503/504), attempt alternative backend
    if (res.status === 530 || res.status === 502 || res.status === 503 || res.status === 504) {
      if (typeof window !== "undefined") {
        const altBackend = primaryUrl.includes(CLOUD_BACKEND_URL) ? RAILWAY_FALLBACK_URL : CLOUD_BACKEND_URL;
        try {
          const fallbackUrl = `${altBackend}${cleanPath}`;
          const fallbackRes = await fetch(fallbackUrl, init);
          if (fallbackRes.ok) {
            return fallbackRes;
          }
        } catch {
          // ignore fallback error and attempt relative proxy
        }

        // Also try same-origin proxy (Next.js server-side rewrites)
        try {
          const proxyRes = await fetch(cleanPath, init);
          if (proxyRes.ok) return proxyRes;
        } catch {
          // ignore proxy error
        }
      }
    }
    return res;
  } catch (err) {
    // Network failure (e.g. DNS failure, connection refused, CORS failure on dead tunnel)
    if (typeof window !== "undefined") {
      const altBackend = primaryUrl.includes(CLOUD_BACKEND_URL) ? RAILWAY_FALLBACK_URL : CLOUD_BACKEND_URL;
      try {
        const fallbackUrl = `${altBackend}${cleanPath}`;
        const fallbackRes = await fetch(fallbackUrl, init);
        if (fallbackRes.ok) return fallbackRes;
      } catch {
        // ignore fallback error
      }

      // Final fallback: try same-origin relative URL (proxied by Next.js server rewrites)
      try {
        const proxyRes = await fetch(cleanPath, init);
        return proxyRes;
      } catch {
        // ignore proxy error
      }
    }
    throw err;
  }
}

export function authHeaders(token: string | null | undefined, init: HeadersInit = {}): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
