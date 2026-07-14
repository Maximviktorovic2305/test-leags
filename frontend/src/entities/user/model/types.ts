export type Gender = "MALE" | "FEMALE";
export type League = "GREEN" | "BLUE";

export type User = {
  id: string;
  nickname: string;
  gender: Gender;
  league: League;
  points: number;
};
