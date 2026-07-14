import { apiFetch, apiRequest } from "@/shared/api";
import type { User } from "../model/types";

export function getCurrentUser(): Promise<User> {
  return apiRequest<User>("/profile");
}

export async function getUserAvatar(): Promise<Blob> {
  const response = await apiFetch("/profile/avatar");
  return response.blob();
}
