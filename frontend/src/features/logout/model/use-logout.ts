"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSession } from "@/entities/user";
import { logout } from "../api/logout-api";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { endSession } = useSession();

  return async () => {
    queryClient.clear();
    try {
      await logout();
    } finally {
      endSession();
      queryClient.clear();
      router.replace("/");
    }
  };
}
