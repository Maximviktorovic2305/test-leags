import { apiRequest } from "@/shared/api";
import type { LeagueRecalculation } from "@/entities/league";

export function recalculateLeagues(): Promise<LeagueRecalculation> {
  return apiRequest<LeagueRecalculation>("/leagues/recalculate", {
    method: "POST",
  });
}
