const isDev = process.env.NODE_ENV !== "production";
const BACKEND_INTERNAL_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (isDev ? "http://127.0.0.1:4000" : "https://api.runnerup.in");

const CONFIGURED_API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").trim();

export function getApiUrl(path = "") {
  const isServer = typeof window === "undefined";
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";

  if (isServer) {
    return `${BACKEND_INTERNAL_URL.replace(/\/+$/, "")}${cleanPath}`;
  }

  // In the browser: if an external HTTPS API URL is configured (e.g. Railway or api subdomain), use it.
  // Otherwise, use relative path so Next.js proxies to backend and eliminates Mixed Content & CORS.
  const isLocalApi =
    !CONFIGURED_API_URL ||
    CONFIGURED_API_URL.includes("127.0.0.1") ||
    CONFIGURED_API_URL.includes("localhost");

  if (isLocalApi) {
    return cleanPath;
  }

  return `${CONFIGURED_API_URL.replace(/\/+$/, "")}${cleanPath}`;
}

export function authHeaders(token: string | null | undefined, init: HeadersInit = {}): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...init,
  };
}

export async function readApiError(response: Response, fallback: string) {
  const error = await response.json().catch(() => null);
  return (error?.error?.message as string | undefined) ?? fallback;
}
