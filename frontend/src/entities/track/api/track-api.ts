import { apiRequest } from "@/shared/api";
import type { Track } from "../model/types";

export function getTracks(): Promise<Track[]> {
  return apiRequest<Track[]>("/tracks");
}
