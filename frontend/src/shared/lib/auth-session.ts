const ACCESS_TOKEN_KEY = "accessToken";
const LEGACY_USER_ID_KEY = "climb-league-user-id";
export const AUTH_CHANGED_EVENT = "auth-changed";

let accessToken: string | null = null;

function getStorage() {
  return typeof window === "undefined" ? null : window.localStorage;
}

function notifyAuthChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(nextAccessToken: string): void {
  accessToken = nextAccessToken;
  const storage = getStorage();
  storage?.removeItem(ACCESS_TOKEN_KEY);
  storage?.removeItem(LEGACY_USER_ID_KEY);
  storage?.removeItem("refreshToken");
  notifyAuthChanged();
}

export function clearAuthSession(): void {
  accessToken = null;
  const storage = getStorage();
  storage?.removeItem(ACCESS_TOKEN_KEY);
  storage?.removeItem(LEGACY_USER_ID_KEY);
  storage?.removeItem("refreshToken");
  notifyAuthChanged();
}
