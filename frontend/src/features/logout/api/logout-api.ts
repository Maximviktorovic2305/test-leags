import { apiRequest } from "@/shared/api";

export function logout(): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/auth/logout", { method: "POST" });
}
