import { queryOptions, useQuery } from "@tanstack/react-query";
import { getCurrentUser, getUserAvatar } from "../api/user-api";

export const userKeys = {
  all: ["user"] as const,
  current: ["user", "current"] as const,
  avatar: (version: string) => ["user", "avatar", version] as const,
};

export function currentUserQuery() {
  return queryOptions({
    queryKey: userKeys.current,
    queryFn: getCurrentUser,
  });
}

export function useUserAvatar(version: string | null, enabled = true) {
  return useQuery({
    queryKey: userKeys.avatar(version ?? "missing"),
    queryFn: getUserAvatar,
    enabled: enabled && Boolean(version),
    staleTime: Infinity,
  });
}

export function useCurrentUser(enabled = true) {
  return useQuery({
    ...currentUserQuery(),
    enabled,
  });
}
