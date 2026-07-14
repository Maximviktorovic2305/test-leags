"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { leagueKeys } from "@/entities/league";
import { userKeys } from "@/entities/user";
import { recalculateLeagues } from "../api/recalculate-api";

export function useRecalculateLeagues() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recalculateLeagues,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: leagueKeys.all }),
        queryClient.invalidateQueries({ queryKey: userKeys.all }),
      ]);
    },
  });
}
