import { authHeaders, getApiUrl, readApiError } from "./api";

export class AdminApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
  }
}

export function getEmergencyAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("runnerup_admin_token");
}

export function setEmergencyAdminSession(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("runnerup_admin_token", token);
  document.cookie = `runnerup_admin_session=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
}

export function clearEmergencyAdminSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("runnerup_admin_token");
  document.cookie = "runnerup_admin_session=; path=/; max-age=0; SameSite=Lax";
}

export function getEffectiveAdminToken(token?: string | null): string | null {
  if (token) return token;
  return getEmergencyAdminToken();
}

export async function downloadAdminExport(
  path: string,
  filename: string,
  token?: string | null,
): Promise<void> {
  const effectiveToken = getEffectiveAdminToken(token);
  const separator = path.includes("?") ? "&" : "?";
  const urlPath = effectiveToken
    ? `${path}${separator}admin_token=${encodeURIComponent(effectiveToken)}`
    : path;
  const url = getApiUrl(urlPath);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        ...(effectiveToken ? { Authorization: `Bearer ${effectiveToken}` } : {}),
        ...(effectiveToken ? { "x-admin-emergency-token": effectiveToken } : {}),
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to connect to export server";
    throw new AdminApiError(msg, 0);
  }

  if (!response.ok) {
    const errorMsg = await readApiError(response, `Excel export failed (${response.status})`);
    throw new AdminApiError(errorMsg, response.status);
  }

  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export async function adminFetch<T = unknown>(
  path: string,
  token: string | null | undefined,
  init: RequestInit = {},
): Promise<T> {
  const effectiveToken = token || getEmergencyAdminToken();
  let response: Response;
  try {
    response = await fetch(getApiUrl(path), {
      ...init,
      headers: authHeaders(effectiveToken, init.headers),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to connect to backend server";
    throw new AdminApiError(msg, 0);
  }

  if (!response.ok) {
    const errorMsg = await readApiError(response, `Request failed (${response.status})`);
    throw new AdminApiError(errorMsg, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("text/csv")) {
    return (await response.text()) as T;
  }

  return (await response.json()) as T;
}

export function formatInrFromPaise(paise: number | null | undefined) {
  const value = Math.round((paise ?? 0) / 100);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) {
    return "—";
  }
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function toDatetimeLocalValue(value: string | Date | null | undefined) {
  if (!value) {
    return "";
  }
  const date = typeof value === "string" ? new Date(value) : value;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
