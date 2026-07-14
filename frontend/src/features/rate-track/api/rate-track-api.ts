import { apiRequest } from "@/shared/api";

export function rateTrack(trackId: string, value: number) {
  return apiRequest<{ trackId: string; value: number }>(`/tracks/${trackId}/rating`, {
    method: "PUT",
    body: { value },
  });
}
