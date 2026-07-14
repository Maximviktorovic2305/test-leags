"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { trackKeys } from "@/entities/track";
import { rateTrack } from "../api/rate-track-api";

export function useRateTrack(
  trackId: string,
  initialRating: number | null,
) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(initialRating ?? 0);
  const mutation = useMutation({
    mutationFn: (value: number) => rateTrack(trackId, value),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: trackKeys.all });
    },
  });

  return { mutation, rating, setRating };
}
