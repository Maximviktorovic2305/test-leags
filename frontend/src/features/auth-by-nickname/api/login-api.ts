import { apiRequest } from "@/shared/api";
import type { Gender, User } from "@/entities/user";

export type LoginResponse = { accessToken: string; user: User };

export function login(payload: {
  nickname: string;
  gender: Gender;
}): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: payload,
    auth: false,
  });
}
