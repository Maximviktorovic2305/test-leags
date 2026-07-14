import { apiRequest } from "@/shared/api";
import type { Gender, League } from "@/entities/user";

export type LoginResponse = {
  accessToken: string;
  user: {
    gender: Gender;
    id: string;
    league: League;
    nickname: string;
    points: number;
  };
};

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
