import { apiRequest } from "@/shared/api";
import type { CompletionResult } from "@/entities/track";

type CompletionResponse = {
  trackId: string;
  result: CompletionResult;
  awardedPoints: number;
  totalPoints: number;
};

export function completeTrack(
  trackId: string,
  result: CompletionResult,
): Promise<CompletionResponse> {
  return apiRequest<CompletionResponse>(`/tracks/${trackId}/completions`, {
    method: "POST",
    body: { result },
  });
}
