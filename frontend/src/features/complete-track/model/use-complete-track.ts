"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { leagueKeys } from "@/entities/league";
import { trackKeys, type CompletionResult } from "@/entities/track";
import { userKeys } from "@/entities/user";
import { completeTrack } from "../api/complete-track-api";

export function useCompleteTrack(trackId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (result: CompletionResult) => completeTrack(trackId, result),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: trackKeys.all }),
        queryClient.invalidateQueries({ queryKey: leagueKeys.all }),
        queryClient.invalidateQueries({ queryKey: userKeys.all }),
      ]);
    },
  });
}
