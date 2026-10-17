const isDev = process.env.NODE_ENV !== "production";
const configuredApiUrl = (process.env.NEXT_PUBLIC_API_URL || process.env.INTERNAL_API_URL || "").trim().replace(/\/+$/, "");

export const CLOUD_BACKEND_URL = "https://runnerup-production.up.railway.app";

// Production canonical API is https://api.runnerup.in by default, or configured environment variable
export const CANONICAL_BACKEND_URL =
  configuredApiUrl &&
  !configuredApiUrl.includes("127.0.0.1") &&
  !configuredApiUrl.includes("localhost")
    ? configuredApiUrl
    : isDev
      ? "http://127.0.0.1:4000"
      : "https://api.runnerup.in";

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
    // If the server responded with Cloudflare tunnel down (530) or gateway error (502/503/504)
    if (res.status === 530 || res.status === 502 || res.status === 503 || res.status === 504) {
      if (typeof window !== "undefined" && !primaryUrl.includes(CLOUD_BACKEND_URL)) {
        setActiveBackendUrl(CLOUD_BACKEND_URL);
        const fallbackUrl = `${CLOUD_BACKEND_URL}${cleanPath}`;
        const fallbackRes = await fetch(fallbackUrl, init);
        return fallbackRes;
      }
    }
    return res;
  } catch (err) {
    // Network failure (e.g. laptop closed, connection refused, CORS failure on dead tunnel)
    if (typeof window !== "undefined" && !primaryUrl.includes(CLOUD_BACKEND_URL)) {
      setActiveBackendUrl(CLOUD_BACKEND_URL);
      const fallbackUrl = `${CLOUD_BACKEND_URL}${cleanPath}`;
      const fallbackRes = await fetch(fallbackUrl, init);
      return fallbackRes;
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
    return "Server is momentarily reconnecting. Please wait 5 seconds and click Pay again.";
  }
  const error = await response.json().catch(() => null);
  return (error?.error?.message as string | undefined) ?? fallback;
}
