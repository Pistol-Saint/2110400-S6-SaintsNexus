
import type { AuthResponse } from "../types/auth";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "https://2110400-saintsnexus-backend.vercel.app"
).replace(/\/$/, "");

const ACCESS_TOKEN_KEY = "saints_access_token";
const REFRESH_TOKEN_KEY = "saints_refresh_token";
const SESSION_ID_KEY = "saints_session_id";
const USER_KEY = "saints_user";

let refreshPromise: Promise<boolean> | null = null;

export function getStoredAccessToken(): string | null {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

export function hasStoredSession(): boolean {
  return Boolean(
    getStoredAccessToken() || getStoredRefreshToken()
  );
}

export function saveAuthSession(data: AuthResponse): void {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
  sessionStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
  sessionStorage.setItem(SESSION_ID_KEY, data.session_id);
  sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

export function clearAuthSession(): void {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(SESSION_ID_KEY);
  sessionStorage.removeItem(USER_KEY);
}

async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = getStoredRefreshToken();

    if (!refreshToken) {
      clearAuthSession();
      return false;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refresh_token: refreshToken,
          }),
        }
      );

      if (!response.ok) {
        clearAuthSession();
        return false;
      }

      const data: AuthResponse = await response.json();

      saveAuthSession(data);
      return true;
    } catch {
      return false;
    }
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  requiresAuth = false,
  hasRetried = false
): Promise<T> {
  const headers = new Headers(options.headers);

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (requiresAuth) {
    const token = getStoredAccessToken();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      "Unable to connect to the Saints Nexus server. Please check your connection."
    );
  }

  if (
    response.status === 401 &&
    requiresAuth &&
    !hasRetried
  ) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      return apiRequest<T>(path, options, true, true);
    }

    clearAuthSession();

    throw new Error(
      "Your session has expired. Please log in again."
    );
  }

  if (!response.ok) {
    let errorMessage = `Request failed (${response.status}).`;

    try {
      const errorData = await response.json();

      if (typeof errorData.detail === "string") {
        errorMessage = errorData.detail;
      } else if (Array.isArray(errorData.detail)) {
        errorMessage = errorData.detail
          .map((item: { msg?: string }) => item.msg || "Invalid input")
          .join(", ");
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // Keep the default error message.
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}


// Download an authenticated file and refresh the access token once if needed.
export async function apiDownload(
  path: string,
  filename: string,
  hasRetried = false
): Promise<void> {
  const headers = new Headers();
  const token = getStoredAccessToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "GET",
      headers,
    });
  } catch {
    throw new Error(
      "Unable to connect to the Saints Nexus server. Please check your connection."
    );
  }

  if (response.status === 401 && !hasRetried) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      return apiDownload(path, filename, true);
    }

    clearAuthSession();

    throw new Error(
      "Your session has expired. Please log in again."
    );
  }

  if (!response.ok) {
    let errorMessage = `Download failed (${response.status}).`;

    try {
      const errorData = await response.json();

      if (typeof errorData.detail === "string") {
        errorMessage = errorData.detail;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // Keep the default download error.
    }

    throw new Error(errorMessage);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(objectUrl);
}