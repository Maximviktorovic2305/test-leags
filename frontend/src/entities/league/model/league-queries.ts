import { queryOptions, useQuery } from "@tanstack/react-query";
import { getCurrentLeaderboard } from "../api/league-api";

export const leagueKeys = {
  all: ["league"] as const,
  current: ["league", "current"] as const,
};

export function currentLeagueQuery() {
  return queryOptions({
    queryKey: leagueKeys.current,
    queryFn: getCurrentLeaderboard,
  });
}

export function useCurrentLeague(enabled = true) {
  return useQuery({
    ...currentLeagueQuery(),
    enabled,
  });
}
