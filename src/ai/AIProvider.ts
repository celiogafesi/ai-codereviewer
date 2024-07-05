export interface AIResponse {
  lineNumber: string;
  reviewComment: string;
}

export interface AIProvider {
  getAIResponse(prompt: string): Promise<AIResponse[] | null>;
}
