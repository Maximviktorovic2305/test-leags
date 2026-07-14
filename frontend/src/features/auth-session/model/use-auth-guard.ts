"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/entities/user";
import { refreshAccessToken } from "@/shared/api";

export function useAuthGuard() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (!session.isHydrated) return;
    if (session.accessToken) return;

    let cancelled = false;
    refreshAccessToken()
      .then(({ accessToken }) => {
        if (!cancelled) session.startSession(accessToken);
      })
      .catch(() => {
        if (!cancelled) {
          session.endSession();
          router.replace("/");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [router, session]);

  return session;
}
