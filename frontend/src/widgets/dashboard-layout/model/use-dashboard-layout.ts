"use client";

import { usePathname } from "next/navigation";
import { useCurrentUser, useSession } from "@/entities/user";

export function useDashboardLayout() {
  const pathname = usePathname();
  const { accessToken } = useSession();
  const userQuery = useCurrentUser(Boolean(accessToken));
  return { pathname, userQuery };
}
