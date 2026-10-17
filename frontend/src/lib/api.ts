const isDev = process.env.NODE_ENV !== "production";

export const CANONICAL_BACKEND_URL = isDev ? "http://127.0.0.1:4000" : "https://api.runnerup.in";

export function getApiUrl(path = "") {
  const isServer = typeof window === "undefined";
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";

  if (isServer) {
    const rawInternal = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;
    if (rawInternal && !rawInternal.includes("railway") && !rawInternal.includes("localhost") && !isDev) {
      return `${rawInternal.replace(/\/+$/, "")}${cleanPath}`;
    }
    return `${CANONICAL_BACKEND_URL}${cleanPath}`;
  }

  // In local development, use relative path so Next.js proxies to local backend
  if (isDev) {
    return cleanPath;
  }

  // In production browser, communicate directly with the live HTTPS backend https://api.runnerup.in
  // This avoids any obsolete Railway proxy or Vercel rewrite issues
  return `https://api.runnerup.in${cleanPath}`;
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
