"use client";

import { useCurrentLeague } from "@/entities/league";
import { useSession } from "@/entities/user";

export function useLeaderboard() {
  const { accessToken } = useSession();
  const leaderboardQuery = useCurrentLeague(Boolean(accessToken));
  return { leaderboardQuery };
}
