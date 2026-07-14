import { queryOptions, useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../api/user-api";

export const userKeys = {
  all: ["user"] as const,
  current: ["user", "current"] as const,
};

export function currentUserQuery() {
  return queryOptions({
    queryKey: userKeys.current,
    queryFn: getCurrentUser,
  });
}

export function useCurrentUser(enabled = true) {
  return useQuery({
    ...currentUserQuery(),
    enabled,
  });
}
