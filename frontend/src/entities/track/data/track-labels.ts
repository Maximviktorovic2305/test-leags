import type { CompletionResult, TrackDifficulty } from "../model/types";

export const trackDifficultyLabels: Record<TrackDifficulty, string> = {
  EASY: "Лёгкая",
  MEDIUM: "Средняя",
  HARD: "Сложная",
};

export const completionResultLabels: Record<CompletionResult, string> = {
  FIRST_TRY: "С первой попытки",
  RETRY: "Не с первой попытки",
};
