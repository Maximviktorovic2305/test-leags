"use client";

import type { ReactNode } from "react";
import { useAuthGuard } from "../model/use-auth-guard";
import { AuthGuardSkeleton } from "./AuthGuardSkeleton";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { accessToken, isHydrated } = useAuthGuard();
  if (!isHydrated || !accessToken) return <AuthGuardSkeleton />;
  return children;
}
