"use client";

import type { ReactNode } from "react";
import { Feedback } from "@/shared/ui";
import { useAuthGuard } from "../model/use-auth-guard";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { accessToken, isHydrated } = useAuthGuard();
  if (!isHydrated || !accessToken) return <Feedback type="loading" />;
  return children;
}
