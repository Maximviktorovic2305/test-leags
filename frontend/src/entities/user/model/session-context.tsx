"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import {
  AUTH_CHANGED_EVENT,
  clearAuthSession,
  getAccessToken,
  setAccessToken,
} from "@/shared/lib/auth-session";

type SessionContextValue = {
  accessToken: string | null;
  endSession: () => void;
  isHydrated: boolean;
  startSession: (accessToken: string) => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function subscribeToSession(callback: () => void) {
  window.addEventListener(AUTH_CHANGED_EVENT, callback);
  return () => {
    window.removeEventListener(AUTH_CHANGED_EVENT, callback);
  };
}

function getSessionSnapshot() {
  return getAccessToken();
}

function getServerSessionSnapshot() {
  return null;
}

function subscribeToHydration() {
  return () => undefined;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const accessToken = useSyncExternalStore(
    subscribeToSession,
    getSessionSnapshot,
    getServerSessionSnapshot,
  );
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  const value = useMemo(
    () => ({
      accessToken,
      endSession: clearAuthSession,
      isHydrated,
      startSession: setAccessToken,
    }),
    [accessToken, isHydrated],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used within SessionProvider");
  return context;
}
