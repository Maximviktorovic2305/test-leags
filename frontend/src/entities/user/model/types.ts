export type Gender = "MALE" | "FEMALE";
export type League = "GREEN" | "BLUE";

export type User = {
  avatarUpdatedAt: string | null;
  completedTracks: number;
  id: string;
  hasAvatar: boolean;
  nickname: string;
  gender: Gender;
  league: League;
  points: number;
};
