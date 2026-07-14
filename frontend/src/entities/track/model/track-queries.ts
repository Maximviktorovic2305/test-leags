import { queryOptions, useQuery } from "@tanstack/react-query";
import { getTracks } from "../api/track-api";

export const trackKeys = {
  all: ["tracks"] as const,
  list: ["tracks", "list"] as const,
};

export function tracksQuery() {
  return queryOptions({
    queryKey: trackKeys.list,
    queryFn: getTracks,
  });
}

export function useTracks(enabled = true) {
  return useQuery({
    ...tracksQuery(),
    enabled,
  });
}
