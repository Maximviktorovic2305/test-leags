import { API_URL } from "@/shared/config";
import {
  clearAuthSession,
  getAccessToken,
  setAccessToken,
} from "@/shared/lib/auth-session";

type RequestOptions = Omit<RequestInit, "body"> & {
  auth?: boolean;
  body?: unknown;
};

type ApiErrorPayload = {
  message?: string | string[];
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

type AccessTokenResponse = { accessToken: string };
let refreshPromise: Promise<AccessTokenResponse> | null = null;

function isTokenExpiring(token: string): boolean {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return false;
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="))) as {
      exp?: unknown;
    };
    return typeof payload.exp === "number" && payload.exp * 1000 <= Date.now() + 30_000;
  } catch {
    return false;
  }
}

async function readError(response: Response, fallback: string): Promise<ApiError> {
  const payload = (await response.json().catch(() => ({}))) as ApiErrorPayload;
  const details = Array.isArray(payload.message)
    ? payload.message.join(", ")
    : payload.message;
  return new ApiError(details ?? fallback, response.status);
}

export async function refreshAccessToken(): Promise<AccessTokenResponse> {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  });
  if (!response.ok) throw await readError(response, "Не удалось обновить сессию");
  return response.json() as Promise<AccessTokenResponse>;
}

function resolveRefresh(): Promise<AccessTokenResponse> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { auth = true, body, ...requestInit } = options;
  const headers = new Headers(options.headers);
  if (body !== undefined) headers.set("Content-Type", "application/json");
  let accessToken = auth ? getAccessToken() : null;

  if (accessToken && isTokenExpiring(accessToken)) {
    try {
      const tokens = await resolveRefresh();
      setAccessToken(tokens.accessToken);
      accessToken = tokens.accessToken;
    } catch (error) {
      if (error instanceof ApiError && [401, 403].includes(error.status)) {
        clearAuthSession();
      }
      throw error;
    }
  }

  const execute = (token: string | null) => {
    const requestHeaders = new Headers(headers);
    if (token) requestHeaders.set("Authorization", `Bearer ${token}`);
    return fetch(`${API_URL}${path}`, {
      ...requestInit,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: requestInit.credentials ?? "include",
      cache: "no-store",
    });
  };

  let response = await execute(accessToken);

  if (auth && response.status === 401) {
    try {
      const tokens = await resolveRefresh();
      setAccessToken(tokens.accessToken);
      response = await execute(tokens.accessToken);
    } catch (error) {
      if (error instanceof ApiError && [401, 403].includes(error.status)) {
        clearAuthSession();
      }
      throw error;
    }
  }

  if (auth && response.status === 401) clearAuthSession();

  if (!response.ok) {
    throw await readError(response, "Не удалось выполнить запрос");
  }

  return response.json() as Promise<T>;
}
