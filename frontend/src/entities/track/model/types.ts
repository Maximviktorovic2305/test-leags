export type TrackDifficulty = "EASY" | "MEDIUM" | "HARD";
export type CompletionResult = "FIRST_TRY" | "RETRY";

export type TrackCompletion = {
  result: CompletionResult;
  awardedPoints: number;
  completedAt: string;
};

export type Track = {
  id: string;
  slug: string;
  order: number;
  name: string;
  description: string;
  difficulty: TrackDifficulty;
  points: number;
  completion: TrackCompletion | null;
  userRating: number | null;
};
