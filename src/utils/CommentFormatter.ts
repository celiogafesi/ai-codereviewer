import { File, Chunk } from "parse-diff";
import { AIResponse } from "../ai/AIProvider";

export function createComment(
  file: File,
  chunk: Chunk,
  aiResponses: AIResponse[]
): Array<{ body: string; path: string; line: number }> {
  return aiResponses.flatMap((aiResponse) => {
    if (!file.to) {
      return [];
    }
    return {
      body: aiResponse.reviewComment,
      path: file.to,
      line: Number(aiResponse.lineNumber),
    };
  });
}
