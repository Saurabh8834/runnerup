import { authHeaders, getApiUrl, readApiError } from "./api";

export class AdminApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
  }
}

export async function adminFetch<T = unknown>(
  path: string,
  token: string | null | undefined,
  init: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(getApiUrl(path), {
      ...init,
      headers: authHeaders(token, init.headers),
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
