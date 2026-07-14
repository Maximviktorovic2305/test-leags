import { apiRequest } from "@/shared/api";
import type { User } from "../model/types";

export function getCurrentUser(): Promise<User> {
  return apiRequest<User>("/auth/me");
}
