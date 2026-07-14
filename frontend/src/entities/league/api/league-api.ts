import { apiRequest } from "@/shared/api";
import type { Leaderboard } from "../model/types";

export function getCurrentLeaderboard(): Promise<Leaderboard> {
  return apiRequest<Leaderboard>("/leagues/current");
}
