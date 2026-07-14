const ACCESS_TOKEN_KEY = "accessToken";
const LEGACY_USER_ID_KEY = "climb-league-user-id";
export const AUTH_CHANGED_EVENT = "auth-changed";

function getStorage() {
  return typeof window === "undefined" ? null : window.localStorage;
}

function notifyAuthChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
}

export function getAccessToken(): string | null {
  return getStorage()?.getItem(ACCESS_TOKEN_KEY) ?? null;
}

export function setAccessToken(accessToken: string): void {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(ACCESS_TOKEN_KEY, accessToken);
  storage.removeItem(LEGACY_USER_ID_KEY);
  storage.removeItem("refreshToken");
  notifyAuthChanged();
}

export function clearAuthSession(): void {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(ACCESS_TOKEN_KEY);
  storage.removeItem(LEGACY_USER_ID_KEY);
  storage.removeItem("refreshToken");
  notifyAuthChanged();
}
