import type { CompletionResult } from "@/entities/track";

export const completionOptions: Array<{
  result: CompletionResult;
  description: string;
}> = [
  { result: "FIRST_TRY", description: "100% очков за трассу" },
  { result: "RETRY", description: "70% очков за трассу" },
];
